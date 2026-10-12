// Small builders that keep the section definitions readable.
import type { SiteContent } from "@/data/types";
import { CATEGORIES, ICONS } from "@/lib/content-check";
import type { Field, Option } from "./types";

type Extra<K extends Field["kind"]> = Omit<Extract<Field, { kind: K }>, "kind" | "key" | "label">;

export const text = (key: string, label: string, extra: Partial<Extra<"text">> = {}): Field => ({ kind: "text", key, label, ...extra });
export const para = (key: string, label: string, extra: Partial<Extra<"textarea">> = {}): Field => ({ kind: "textarea", key, label, ...extra });
export const num = (key: string, label: string, extra: Partial<Extra<"number">> = {}): Field => ({ kind: "number", key, label, ...extra });
export const toggle = (key: string, label: string, hint?: string): Field => ({ kind: "toggle", key, label, hint });
export const photo = (key: string, label: string, hint?: string): Field => ({ kind: "photo", key, label, hint });
export const strings = (key: string, label: string, extra: Partial<Extra<"strings">> = {}): Field => ({ kind: "strings", key, label, ...extra });

/** A titled box of fields. With a key, the fields edit that nested object. */
export const group = (label: string, fields: Field[], extra: { key?: string; hint?: string; columns?: 1 | 2; collapsed?: boolean } = {}): Field => ({
  kind: "group",
  key: extra.key ?? "",
  label,
  fields,
  hint: extra.hint,
  columns: extra.columns,
  collapsed: extra.collapsed,
});

/** Eyebrow, H1, lead and (optionally) photo at the top of a page. */
export const hero = (key: string, withPhoto = true): Field =>
  group(
    "Top of the page",
    [
      text("eyebrow", "Small line above the heading"),
      text("title", "Main heading", { required: true, hint: "The page's H1. Google reads this first, so say what is on the page and where." }),
      para("lead", "Introduction", { rows: 3 }),
      ...(withPhoto ? [photo("photo", "Photo")] : []),
    ],
    { key },
  );

export const seoFields = (key = "seo"): Field =>
  group(
    "Google search result",
    [
      text("title", "Page title", { max: 60, required: true, hint: '"| Hungru Pizza" is added automatically. Aim for under 60 characters.' }),
      para("description", "Description", { max: 160, rows: 3, required: true, hint: "Shown under the title in Google. Aim for 120 to 155 characters." }),
    ],
    { key },
  );

export const faqList = (key: string, label: string): Field => ({
  kind: "list",
  key,
  label,
  itemLabel: "question",
  itemTitle: (f) => f.q || "New question",
  newItem: () => ({ q: "", a: "" }),
  fields: [text("q", "Question", { required: true }), para("a", "Answer", { rows: 4, required: true })],
});

/* ---------------------------------------------------------------- choices from the draft */

export const serviceOptions = (c: SiteContent): Option[] => c.services.map((s) => ({ value: s.slug, label: s.name || s.slug }));
export const filterOptions = (c: SiteContent): Option[] => c.projectFilters.map((f) => ({ value: f.id, label: f.label }));
export const categoryOptions = (c: SiteContent): Option[] => CATEGORIES.map((k) => ({ value: k, label: c.categoryLabels[k] ?? k }));
export const sizeOptions = (c: SiteContent): Option[] => c.builder.sizes.map((t) => ({ value: t.id, label: t.label }));
export const baseOptions = (c: SiteContent): Option[] => c.builder.bases.map((t) => ({ value: t.id, label: t.label }));
export const cheeseOptions = (c: SiteContent): Option[] => c.builder.cheeses.map((t) => ({ value: t.id, label: t.label }));
export const toppingOptions = (c: SiteContent): Option[] => c.builder.toppings.map((t) => ({ value: t.id, label: t.label }));

export const dietOptions: Option[] = [
  { value: "veg", label: "Veg (green mark)" },
  { value: "non-veg", label: "Non-veg (brown mark)" },
  { value: "either", label: "Either (both marks)" },
];

const iconNames: Record<(typeof ICONS)[number], string> = {
  pizza: "Pizza slice",
  leaf: "Leaf (veg)",
  drumstick: "Chicken drumstick",
  smile: "Smiley (kids)",
  popcorn: "Popcorn (starters)",
  burger: "Burger",
  drink: "Cold drink",
  dessert: "Cake slice",
  deal: "Offer badge (combos)",
};
export const iconOptions: Option[] = ICONS.map((k) => ({ value: k, label: iconNames[k] }));

export const categoryKeys: Option[] = CATEGORIES.map((k) => ({ value: k, label: k.replace(/-/g, " ") }));

/** "Veg pizzas" → "veg-pizzas", unique among `taken`. */
export function slugify(name: string, taken: string[], fallback = "new"): string {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || fallback;
  let slug = base;
  for (let i = 2; taken.includes(slug); i++) slug = `${base}-${i}`;
  return slug;
}
