import type { SiteContent } from "@/data/types";
import { aboutContent, areas, builder, faqs, projects, reviews, services, trust } from "./content";
import { aboutPage, areaPage, builderPage, cartPage, contactPage, home, notFound, projectsPage, searchPanel, servicesPages } from "./pages";
import { legalPages } from "./legal";
import { blogPage, blogPosts, careersPage, jobOpenings, offersPage } from "./posts";
import { business, history, orderChoices, photos, seo, sitewide } from "./site";
import type { Field, Section } from "./types";

export type { Field, Section } from "./types";

/** Sidebar order. */
export const sections: Section[] = [
  business,
  services,
  projects,
  reviews,
  areas,
  faqs,
  trust,
  aboutContent,
  builder,
  blogPosts,
  jobOpenings,
  home,
  servicesPages,
  offersPage,
  projectsPage,
  builderPage,
  cartPage,
  searchPanel,
  areaPage,
  blogPage,
  careersPage,
  aboutPage,
  contactPage,
  notFound,
  legalPages,
  sitewide,
  orderChoices,
  photos,
  seo,
  history,
];

export const groups = ["Business", "Content", "Pages", "Media & Google"];

export function sectionById(id: string): Section {
  return sections.find((s) => s.id === id) ?? sections[0];
}

export function previewPath(section: Section, content: SiteContent): string {
  return typeof section.preview === "function" ? section.preview(content) : section.preview;
}

/** The content paths a section edits, for "unsaved changes" dots. */
export function sectionPaths(section: Section): string[] {
  if (section.custom === "history") return [];
  if (!section.fields) return [section.path];
  // Several sections edit parts of one object (e.g. "copy"), so compare each field's own path.
  return section.fields.map((f: Field) => [section.path, f.key].filter(Boolean).join(".")).filter(Boolean);
}
