// All internal URLs end with "/" so they match the prerendered folders (dist/<route>/index.html).
export const paths = {
  home: "/",
  /** The full menu. Each menu section ("service") has its own page under it. */
  services: "/menu/",
  service: (slug: string) => `/menu/${slug}/`,
  /** The photo gallery ("projects"). */
  projects: "/gallery/",
  builder: "/build-your-pizza/",
  area: (slug: string) => `/delivery/${slug}/`,
  about: "/about/",
  contact: "/contact/",
  /** Policy pages sit at the top level: /privacy-policy/, /terms-and-conditions/ … */
  legal: (slug: string) => `/${slug}/`,
};

export const telHref = (tel: string) => `tel:${tel}`;
