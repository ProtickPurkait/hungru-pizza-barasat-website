// Build-time only: scripts/prerender.mjs imports this to render every route to static HTML.
import { StrictMode } from "react";
import { prerender } from "react-dom/static";
import { StaticRouter } from "react-router";
import { App } from "./App";
import { eagerPages } from "./pages/eager";
import { business, getContent, photos } from "./data/site";
import { checkContent } from "./lib/content-check";
import { paths } from "./lib/paths";
import { legalRoutesFor, routesFor } from "./lib/routes";
import { HeadContext, renderHeadHtml, type HeadData } from "./lib/seo";

export async function render(url: string): Promise<{ html: string; head: string }> {
  let head: HeadData | null = null;
  const collector = { set: (h: HeadData) => (head = h) };

  const { prelude } = await prerender(
    <StrictMode>
      <HeadContext.Provider value={collector}>
        <StaticRouter location={url}>
          <App pages={eagerPages} />
        </StaticRouter>
      </HeadContext.Provider>
    </StrictMode>,
    // React outlines large Suspense boundaries for progressive streaming, revealing them later
    // with an inline script. For a static file we want the whole page inline, so lift the limit.
    { progressiveChunkSize: Number.MAX_SAFE_INTEGER },
  );

  const html = await new Response(prelude).text();

  if (!head) throw new Error(`No <Seo> rendered for ${url}`);
  return { html, head: renderHeadHtml(head) };
}

export const routes = routesFor(getContent());
/** Prerendered too, but kept out of the sitemap (and out of Google, with noindex): the cart. */
export const unlistedRoutes = [paths.cart];
/** Policy pages get a low priority in the sitemap. */
export const legalRoutes = legalRoutesFor(getContent());
export const siteUrl = business.siteUrl.replace(/\/$/, "");
/** The build stops on errors, so broken content never replaces the live site. */
export const contentProblems = checkContent(getContent());
/**
 * The uploaded picture the browser-tab icon is made from: the square icon if one was
 * uploaded, else the logo. Null keeps the built-in favicon.svg (also for sample photos,
 * which are not files on this site).
 */
export const faviconSource: string | null = (() => {
  const key = business.logo?.icon || business.logo?.image;
  const src = key ? photos[key]?.src : undefined;
  return src?.startsWith("/") ? src : null;
})();
