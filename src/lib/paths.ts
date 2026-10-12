// All internal URLs end with "/" so they match the prerendered folders (dist/<route>/index.html).
export const paths = {
  home: "/",
  /** The full menu. Each menu section ("service") has its own page under it. */
  services: "/menu/",
  service: (slug: string) => `/menu/${slug}/`,
  /** A dish on its menu section's page, which scrolls to it: /menu/veg-pizzas/#tandoori-paneer-pizza. */
  dish: (section: string, name: string) => `/menu/${section}/#${anchorFor(name)}`,
  /** The combo offers: every menu section marked as an offer, on one page. */
  offers: "/offers/",
  /** The photo gallery ("projects"). */
  projects: "/gallery/",
  builder: "/build-your-pizza/",
  area: (slug: string) => `/delivery/${slug}/`,
  blog: "/blog/",
  post: (slug: string) => `/blog/${slug}/`,
  careers: "/careers/",
  about: "/about/",
  contact: "/contact/",
  /** The visitor's cart and checkout. Prerendered, but kept out of the sitemap and Google. */
  cart: "/cart/",
  /** Policy pages sit at the top level: /privacy-policy/, /terms-and-conditions/ … */
  legal: (slug: string) => `/${slug}/`,
};

export const telHref = (tel: string) => `tel:${tel}`;

/** "Fiery Red Jalapeño Pizza" → "fiery-red-jalapeno-pizza": the id of a dish on its menu page. */
export function anchorFor(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
