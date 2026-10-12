// Renders every route to static HTML after `vite build`, so each page has real
// content and its own <title>/meta for Google and WhatsApp link previews.
// Also writes sitemap.xml and robots.txt. Run via `npm run build`.

import { createHash } from "node:crypto";
import { readdir, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const ssrDir = path.join(root, "dist-ssr");

const { render, routes, unlistedRoutes, legalRoutes, siteUrl, contentProblems, faviconSource } = await import(pathToFileURL(path.join(ssrDir, "entry-server.js")).href);

// Content edited in the admin panel is checked again here. On Vercel a failed build keeps the previous version live.
for (const p of contentProblems.filter((x) => x.level === "warning")) console.warn(`! content: ${p.message}`);
const contentErrors = contentProblems.filter((x) => x.level === "error");
if (contentErrors.length) {
  throw new Error(`src/data/content.json has ${contentErrors.length} problem(s):\n${contentErrors.map((x) => "  - " + x.message).join("\n")}`);
}

let template = await readFile(path.join(dist, "index.html"), "utf8");
for (const marker of ["<!--seo:start-->", "<!--seo:end-->", "<!--preload-->", '<div id="root" data-path="/"><!--app--></div>']) {
  if (!template.includes(marker)) throw new Error(`index.html is missing the marker ${marker}`);
}

// Browser-tab and home-screen icons made from the logo uploaded in the admin (Business details →
// Logo). Without one, index.html keeps the built-in favicon.svg.
const iconLink = template.match(/<link rel="icon"[^>]*>/);
if (!iconLink) throw new Error("index.html is missing the <link rel=\"icon\">");
if (faviconSource) {
  const file = path.join(dist, ...faviconSource.split("/").filter(Boolean));
  const input = await readFile(file).catch(() => null);
  if (!input) console.warn(`! the logo ${faviconSource} was not found, so the built-in favicon is used`);
  else {
    const { default: sharp } = await import("sharp");
    const clear = { r: 0, g: 0, b: 0, alpha: 0 };
    // The whole logo, as large as fits in a square, on a see-through background.
    const square = (size, margin = 0) =>
      sharp(input)
        .resize(size - margin * 2, size - margin * 2, { fit: "contain", background: clear })
        .extend({ top: margin, bottom: margin, left: margin, right: margin, background: clear })
        .png()
        .toBuffer();
    // iPhones show a home-screen icon on a solid square with rounded corners: white, with a margin.
    const touch = await sharp(await square(180, 16)).flatten({ background: "#ffffff" }).png().toBuffer();
    const files = { "favicon-32.png": await square(32), "favicon-192.png": await square(192), "apple-touch-icon.png": touch };
    for (const [name, data] of Object.entries(files)) await writeFile(path.join(dist, name), data);
    // A new logo gets new icon addresses, so browsers do not keep showing the old one.
    const v = createHash("sha256").update(input).digest("hex").slice(0, 10);
    template = template.replace(
      iconLink[0],
      () =>
        `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png?v=${v}" />
    <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png?v=${v}" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=${v}" />`,
    );
  }
}

// Inline the stylesheet (about 12 KB gzipped) so the first paint doesn't wait for a CSS request.
const cssLink = template.match(/<link rel="stylesheet"[^>]*href="\/(assets\/[^"]+\.css)"[^>]*>/);
if (cssLink) {
  const css = await readFile(path.join(dist, cssLink[1]), "utf8");
  template = template.replace(cssLink[0], () => `<style>${css}</style>`);
}

// Start the app's JavaScript right after the first paint instead of competing with the
// HTML, CSS and fonts for bandwidth. The page is already readable and its Call /
// WhatsApp links work without JS. Any tap or key press before then starts it at once.
const entryTag = template.match(/<script type="module" crossorigin src="(\/assets\/[^"]+\.js)"><\/script>\s*/);
if (!entryTag) throw new Error("Could not find the Vite entry <script> in index.html");
const chunkTags = [...template.matchAll(/<link rel="modulepreload" crossorigin href="(\/assets\/[^"]+\.js)">\s*/g)];
template = template.replace(entryTag[0], "");
for (const tag of chunkTags) template = template.replace(tag[0], "");
const boot = `<script>
      (function () {
        var started = false;
        function start() {
          if (started) return;
          started = true;
          ${JSON.stringify(chunkTags.map((t) => t[1]))}.forEach(function (href) {
            var l = document.createElement("link");
            l.rel = "modulepreload";
            l.crossOrigin = "";
            l.href = href;
            document.head.appendChild(l);
          });
          var s = document.createElement("script");
          s.type = "module";
          s.crossOrigin = "";
          s.src = ${JSON.stringify(entryTag[1])};
          document.head.appendChild(s);
        }
        requestAnimationFrame(function () { setTimeout(start, 0); });
        setTimeout(start, 2000);
        ["pointerdown", "keydown", "touchstart", "focusin"].forEach(function (t) {
          addEventListener(t, start, { once: true, passive: true, capture: true });
        });
      })();
    </script>
  </body>`;
template = template.replace("</body>", () => boot);

// Preload the one variable font file (headings and body) so the hero text doesn't shift when it loads.
const assets = await readdir(path.join(dist, "assets"));
const fonts = [/^bricolage-grotesque-var-latin-.*\.woff2$/]
  .map((re) => assets.find((f) => re.test(f)))
  .filter(Boolean);
const preloads = fonts.map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`).join("\n    ");

function page(url, html, head) {
  return template
    .replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, () => head)
    .replace("<!--preload-->", () => preloads)
    .replace('<div id="root" data-path="/"><!--app--></div>', () => `<div id="root" data-path="${url}">${html}</div>`);
}

let count = 0;
for (const url of [...routes, ...unlistedRoutes]) {
  const { html, head } = await render(url);
  const outDir = path.join(dist, ...url.split("/").filter(Boolean));
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "index.html"), page(url, html, head));
  count++;
}

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map((url) => {
    const priority = url === "/" ? "1.0" : legalRoutes.includes(url) ? "0.3" : url.split("/").filter(Boolean).length === 1 ? "0.8" : "0.7";
    return `  <url><loc>${siteUrl}${url}</loc><lastmod>${today}</lastmod><priority>${priority}</priority></url>`;
  })
  .join("\n")}
</urlset>
`;
await writeFile(path.join(dist, "sitemap.xml"), sitemap);

await writeFile(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${siteUrl}/sitemap.xml\n`);

// The admin panel polls this after publishing to see when the new version is live.
await writeFile(path.join(dist, "build.json"), JSON.stringify({ commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null, builtAt: new Date().toISOString() }) + "\n");

// Hosts like Vercel serve 404.html for unknown URLs (with a real 404 status). The inline
// guard sees the path mismatch and the app renders its "page not found" screen.
await writeFile(path.join(dist, "404.html"), await readFile(path.join(dist, "index.html"), "utf8"));

await rm(ssrDir, { recursive: true, force: true });

console.log(`✓ prerendered ${count} pages, wrote sitemap.xml (${routes.length} URLs) and robots.txt`);
if (fonts.length < 1) console.warn("! could not find the Bricolage Grotesque font to preload");
