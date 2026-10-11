/* ==========================================================================
   SITE DATA
   All content lives in content.json, edited through the admin panel at /admin/
   (or by hand). This file only gives it types.

   The exports are `let` bindings on purpose: the admin's live preview swaps in
   a draft with applyContent(), and every component reads the new values on its
   next render. Read them inside components and functions, never copy them into
   module-level constants.
   ========================================================================== */

import raw from "./content.json";
import type {
  AreaPage,
  Brand,
  BuilderConfig,
  Business,
  Copy,
  Faq,
  Legal,
  Locality,
  PageSeoMap,
  Photo,
  Project,
  ProjectCategory,
  ProjectFilter,
  Review,
  Service,
  SiteContent,
  Stat,
  Step,
  TeamMember,
} from "./types";

/** A key of `photos`, e.g. "heroOvenFlame". */
export type PhotoKey = string;

let current = raw as unknown as SiteContent;

export let business: Business = current.business;
export let pageSeo: PageSeoMap = current.pageSeo;
export let photos: Record<string, Photo> = current.photos;
export let copy: Copy = current.copy;
export let stats: Stat[] = current.stats;
export let praise: string[] = current.praise;
export let steps: Step[] = current.steps;
export let services: Service[] = current.services;
export let localities: Locality[] = current.localities;
export let widerArea: string = current.widerArea;
export let areaPages: AreaPage[] = current.areaPages;
export let projectFilters: ProjectFilter[] = current.projectFilters;
export let categoryLabels: Record<ProjectCategory, string> = current.categoryLabels;
export let projects: Project[] = current.projects;
export let reviews: Review[] = current.reviews;
export let homeFaqs: Faq[] = current.homeFaqs;
export let builder: BuilderConfig = current.builder;
export let whenOptions: string[] = current.whenOptions;
export let story: string[] = current.story;
export let team: TeamMember[] = current.team;
export let brands: Brand[] = current.brands;
export let warranty: SiteContent["warranty"] = current.warranty;
export let legal: Legal = current.legal;

export function getContent(): SiteContent {
  return current;
}

/** Replaces all content. Used only by the admin's live preview (src/preview.tsx). */
export function applyContent(next: SiteContent): void {
  current = next;
  business = next.business;
  pageSeo = next.pageSeo;
  photos = next.photos;
  copy = next.copy;
  stats = next.stats;
  praise = next.praise;
  steps = next.steps;
  services = next.services;
  localities = next.localities;
  widerArea = next.widerArea;
  areaPages = next.areaPages;
  projectFilters = next.projectFilters;
  categoryLabels = next.categoryLabels;
  projects = next.projects;
  reviews = next.reviews;
  homeFaqs = next.homeFaqs;
  builder = next.builder;
  whenOptions = next.whenOptions;
  story = next.story;
  team = next.team;
  brands = next.brands;
  warranty = next.warranty;
  legal = next.legal;
}

// Dev only: when the admin panel saves content.json, reload the site pages. Accepting the update
// here keeps Vite from also reloading the admin panel, which does not use this module.
if (import.meta.hot) {
  import.meta.hot.accept("./content.json", () => window.location.reload());
}
