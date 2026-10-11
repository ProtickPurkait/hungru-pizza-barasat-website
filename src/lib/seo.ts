import { createContext } from "react";
import { business, pageSeo } from "@/data/site";
import { ogImageUrl } from "./photo";

export interface HeadData {
  title: string;
  description: string;
  path: string;
  image: string;
  noindex?: boolean;
}

/** During prerender, the page's <Seo> reports its head data here. On the client this is null. */
export interface HeadCollector {
  set(head: HeadData): void;
}
export const HeadContext = createContext<HeadCollector | null>(null);

/** "https://www.example.com", without a trailing slash. */
export function siteOrigin(): string {
  return business.siteUrl.replace(/\/$/, "");
}

export function fullTitle(title: string): string {
  return title.includes(business.name) ? title : `${title} | ${business.name}`;
}

export function canonicalUrl(path: string): string {
  return siteOrigin() + path;
}

export function buildHead(input: { title: string; description: string; path: string; image?: string; noindex?: boolean }): HeadData {
  return {
    title: fullTitle(input.title),
    description: input.description,
    path: input.path,
    image: ogImageUrl(input.image ?? pageSeo.shareImage, siteOrigin()),
    noindex: input.noindex,
  };
}

type Tag =
  | { kind: "meta-name"; key: string; value: string }
  | { kind: "meta-prop"; key: string; value: string }
  | { kind: "link"; key: string; value: string };

function tagsFor(h: HeadData): Tag[] {
  const url = canonicalUrl(h.path);
  return [
    { kind: "meta-name", key: "description", value: h.description },
    { kind: "meta-name", key: "robots", value: h.noindex ? "noindex, follow" : "index, follow, max-image-preview:large" },
    { kind: "link", key: "canonical", value: url },
    { kind: "meta-prop", key: "og:type", value: "website" },
    { kind: "meta-prop", key: "og:site_name", value: business.name },
    { kind: "meta-prop", key: "og:locale", value: "en_IN" },
    { kind: "meta-prop", key: "og:title", value: h.title },
    { kind: "meta-prop", key: "og:description", value: h.description },
    { kind: "meta-prop", key: "og:url", value: url },
    { kind: "meta-prop", key: "og:image", value: h.image },
    { kind: "meta-name", key: "twitter:card", value: "summary_large_image" },
    { kind: "meta-name", key: "twitter:title", value: h.title },
    { kind: "meta-name", key: "twitter:description", value: h.description },
    { kind: "meta-name", key: "twitter:image", value: h.image },
  ];
}

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Static head markup, injected into each prerendered HTML file. */
export function renderHeadHtml(h: HeadData): string {
  const lines = [`<title>${esc(h.title)}</title>`];
  for (const t of tagsFor(h)) {
    if (t.kind === "link") lines.push(`<link rel="${t.key}" href="${esc(t.value)}" />`);
    else if (t.kind === "meta-name") lines.push(`<meta name="${t.key}" content="${esc(t.value)}" />`);
    else lines.push(`<meta property="${t.key}" content="${esc(t.value)}" />`);
  }
  return lines.join("\n    ");
}

/** Updates document head on client-side navigation. */
export function applyHead(h: HeadData): void {
  document.title = h.title;
  for (const t of tagsFor(h)) {
    const selector =
      t.kind === "link" ? `link[rel="${t.key}"]` : t.kind === "meta-name" ? `meta[name="${t.key}"]` : `meta[property="${t.key}"]`;
    let el = document.head.querySelector<HTMLElement>(selector);
    if (!el) {
      el = document.createElement(t.kind === "link" ? "link" : "meta");
      if (t.kind === "link") el.setAttribute("rel", t.key);
      else el.setAttribute(t.kind === "meta-name" ? "name" : "property", t.key);
      document.head.appendChild(el);
    }
    el.setAttribute(t.kind === "link" ? "href" : "content", t.value);
  }
}
