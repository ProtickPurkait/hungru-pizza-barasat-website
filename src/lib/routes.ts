// Pure (takes the content as an argument), so the content checker and the admin can use it too.
import type { SiteContent } from "@/data/types";
import { paths } from "./paths";

/** Every URL that gets its own prerendered HTML file and a sitemap entry. */
export function routesFor(c: SiteContent): string[] {
  return [
    paths.home,
    paths.services,
    ...c.services.map((s) => paths.service(s.slug)),
    paths.projects,
    paths.builder,
    ...c.areaPages.map((a) => paths.area(a.slug)),
    paths.blog,
    ...c.blog.map((b) => paths.post(b.slug)),
    paths.careers,
    paths.about,
    paths.contact,
    ...legalRoutesFor(c),
  ];
}

/** The policy pages (privacy, terms, cookies …). */
export function legalRoutesFor(c: SiteContent): string[] {
  return c.legal.pages.map((p) => paths.legal(p.slug));
}
