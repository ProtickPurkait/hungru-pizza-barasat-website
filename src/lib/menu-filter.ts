// The menu finder on /menu/: search, one section at a time, sorting and the Veg / Non-veg
// switches. Pure functions (the menu is passed in), so they are easy to test.
import type { Diet, MenuItem, Service } from "@/data/types";

export type MenuSort = "menu" | "price-low" | "price-high" | "name";
export const MENU_SORTS: MenuSort[] = ["menu", "price-low", "price-high", "name"];

export interface MenuFilters {
  /** A section's slug, or "" for every section. */
  section: string;
  query: string;
  sort: MenuSort;
  veg: boolean;
  nonVeg: boolean;
}

export const NO_FILTERS: MenuFilters = { section: "", query: "", sort: "menu", veg: true, nonVeg: true };

export interface MenuGroup {
  section: Service;
  items: MenuItem[];
}

/** The price of a dish's smallest size. */
export function fromPrice(item: MenuItem): number {
  return Math.min(...item.prices.map((p) => p.price));
}

/** Dishes marked "either" can be made veg or non-veg, so either switch shows them. */
export function dietShown(diet: Diet, f: Pick<MenuFilters, "veg" | "nonVeg">): boolean {
  if (diet === "veg") return f.veg;
  if (diet === "non-veg") return f.nonVeg;
  return f.veg || f.nonVeg;
}

const words = (query: string) => query.toLowerCase().split(/\s+/).filter(Boolean);

/** A dish matches when it has every word of the search in its name, description, tag or section name. */
function matches(item: MenuItem, section: Service, f: MenuFilters, terms: string[]): boolean {
  if (!dietShown(item.diet, f)) return false;
  if (terms.length === 0) return true;
  const text = `${item.name} ${item.description} ${item.tag} ${section.name}`.toLowerCase();
  return terms.every((t) => text.includes(t));
}

const ORDER: Record<MenuSort, ((a: MenuItem, b: MenuItem) => number) | null> = {
  menu: null,
  "price-low": (a, b) => fromPrice(a) - fromPrice(b),
  "price-high": (a, b) => fromPrice(b) - fromPrice(a),
  name: (a, b) => a.name.localeCompare(b.name, "en"),
};

/** The dishes to show, still grouped by menu section in menu order, sorted within each section. Empty sections are left out. */
export function filterMenu(sections: Service[], f: MenuFilters): MenuGroup[] {
  const terms = words(f.query);
  const order = ORDER[f.sort];
  return sections
    .filter((s) => !f.section || s.slug === f.section)
    .map((s) => {
      const items = s.items.filter((it) => matches(it, s, f, terms));
      return { section: s, items: order ? [...items].sort(order) : items };
    })
    .filter((g) => g.items.length > 0);
}

/** How many dishes each section tab would show with the current search and switches. */
export function sectionCounts(sections: Service[], f: MenuFilters): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const g of filterMenu(sections, { ...f, section: "", sort: "menu" })) counts[g.section.slug] = g.items.length;
  return counts;
}

/** Anything other than the full menu in menu order. */
export function isFiltered(f: MenuFilters): boolean {
  return f.section !== "" || f.query.trim() !== "" || f.sort !== "menu" || !f.veg || !f.nonVeg;
}

/** Filters from the page address, e.g. ?section=veg-pizzas&q=paneer&sort=price-low&diet=veg. Unknown values are ignored. */
export function filtersFromSearch(search: string, slugs: string[]): MenuFilters {
  const p = new URLSearchParams(search);
  const section = p.get("section") ?? "";
  const sort = p.get("sort") as MenuSort | null;
  const diet = p.get("diet");
  return {
    section: slugs.includes(section) ? section : "",
    query: (p.get("q") ?? "").slice(0, 60),
    sort: sort && MENU_SORTS.includes(sort) ? sort : "menu",
    veg: diet !== "non-veg" && diet !== "none",
    nonVeg: diet !== "veg" && diet !== "none",
  };
}

/** The page address for these filters ("" for the full menu), so a filtered menu can be shared. */
export function filtersToSearch(f: MenuFilters): string {
  const p = new URLSearchParams();
  if (f.section) p.set("section", f.section);
  if (f.query.trim()) p.set("q", f.query.trim());
  if (f.sort !== "menu") p.set("sort", f.sort);
  if (!f.veg || !f.nonVeg) p.set("diet", f.veg ? "veg" : f.nonVeg ? "non-veg" : "none");
  const s = p.toString();
  return s ? `?${s}` : "";
}
