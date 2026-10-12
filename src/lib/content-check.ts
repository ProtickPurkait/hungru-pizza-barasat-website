// Checks site content for mistakes that would break a page: missing photos, links to
// menu sections or areas that do not exist, empty titles, impossible prices.
// Used by the admin panel (before publishing), the build (scripts/prerender.mjs) and the tests.
// Pure: it never imports the content itself.
import type { SiteContent } from "@/data/types";
import { distanceKm, formatKm, isLatLng, withinRadius } from "./distance";
import { routesFor } from "./routes";
import { isSafeHref, linkTargets } from "./text";

export interface Problem {
  /** "error" blocks publishing and the build; "warning" is advice. */
  level: "error" | "warning";
  /** Admin section the problem belongs to (matches section ids in src/admin/schema). */
  section: string;
  message: string;
}

export const ICONS = ["pizza", "leaf", "drumstick", "smile", "popcorn", "burger", "drink", "dessert", "deal"] as const;
export const CATEGORIES = ["veg", "chicken", "kids", "snacks", "drinks", "cafe"] as const;
export const DIETS = ["veg", "non-veg", "either"] as const;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Top-level addresses a policy page cannot take. */
const RESERVED_SLUGS = [
  "menu",
  "offers",
  "gallery",
  "build-your-pizza",
  "delivery",
  "blog",
  "careers",
  "about",
  "contact",
  "admin",
  "api",
  "assets",
  "images",
  "video",
  "cart",
];
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

export function checkContent(c: SiteContent): Problem[] {
  const problems: Problem[] = [];
  const error = (section: string, message: string) => problems.push({ level: "error", section, message });
  const warn = (section: string, message: string) => problems.push({ level: "warning", section, message });
  const blank = (v: unknown) => typeof v !== "string" || v.trim() === "";

  const photoKeys = new Set(Object.keys(c.photos ?? {}));
  const photoRef = (section: string, key: string, where: string) => {
    if (blank(key)) error(section, `${where}: choose a photo.`);
    else if (!photoKeys.has(key)) error(section, `${where}: the photo "${key}" is not in the photo library.`);
  };
  const dupes = (list: string[]) => [...new Set(list.filter((x, i) => list.indexOf(x) !== i))];

  // Business
  const b = c.business;
  if (blank(b.name)) error("business", "The business name is empty.");
  if (!/^\+\d{8,15}$/.test(b.phone.tel)) error("business", `Phone number for calls should look like +919163148329 (got "${b.phone.tel}").`);
  if (!/^\d{8,15}$/.test(b.whatsapp))
    error("business", `WhatsApp number should be digits only with the country code, like 919163148329 (got "${b.whatsapp}").`);
  if (!/^https:\/\/[^/\s]+\/?$/.test(b.siteUrl)) error("business", `Website address should look like https://www.example.com (got "${b.siteUrl}").`);
  if (!(b.rating.value >= 0 && b.rating.value <= 5)) error("business", "Google rating must be between 0 and 5.");
  if (!(b.rating.count >= 0)) error("business", "Number of Google reviews cannot be negative.");
  if (!/^\d{2}:\d{2}$/.test(b.hours.opens) || !/^\d{2}:\d{2}$/.test(b.hours.closes))
    error("business", "Opening and closing times should look like 10:00 and 20:00.");
  if (!/^https?:\/\//.test(b.googleReviewsUrl)) error("business", "The Google reviews link should start with https://");
  const logo = b.logo;
  if (!logo) error("business", "The logo settings are missing.");
  else {
    if (!blank(logo.image)) photoRef("business", logo.image, "Logo");
    if (!blank(logo.imageDark)) photoRef("business", logo.imageDark, "Logo for dark backgrounds");
    if (!blank(logo.imageDark) && blank(logo.image))
      warn("business", "The logo for dark backgrounds is only used together with a main logo. Add the main logo too.");
    if (!["auto", "show", "hide"].includes(logo.name)) error("business", "Logo: choose whether to show the business name next to it.");
    if (!blank(logo.icon)) photoRef("business", logo.icon, "Browser tab icon");
    // The browser-tab icon is made at build time from the icon, or else the logo (scripts/prerender.mjs).
    const iconKey = blank(logo.icon) ? logo.image : logo.icon;
    const icon = blank(iconKey) ? undefined : c.photos?.[iconKey];
    if (icon && !icon.src.startsWith("/"))
      warn("business", "The browser tab icon can only be made from a picture you uploaded, not a sample photo. The built-in icon is used until then.");
    else if (icon?.width && icon.height && icon.width / icon.height >= 2)
      warn(
        "business",
        `${blank(logo.icon) ? "The logo" : "The browser tab icon"} is wide, so it is tiny in a browser tab. For a clear icon, upload a square one (just the symbol or the initials) under Logo → Browser tab icon.`,
      );
  }
  for (const [list, what] of [
    [b.orderOnline ?? [], "Order online"],
    [b.social ?? [], "Social pages"],
  ] as const) {
    list.forEach((l, i) => {
      if (blank(l.label)) error("business", `${what}, link ${i + 1}: add a name, e.g. Zomato.`);
      if (!/^https:\/\/\S+$/.test(l.url)) error("business", `${what}, ${l.label || `link ${i + 1}`}: the address should start with https://`);
    });
  }

  // Photos
  for (const [key, p] of Object.entries(c.photos ?? {})) {
    if (blank(p.src)) error("photos", `Photo "${key}" has no image.`);
    if (blank(p.alt)) error("photos", `Photo "${key}" needs a description (alt text) for blind visitors and Google.`);
  }
  photoRef("seo", c.pageSeo.shareImage, "Link preview image");
  const cp = c.copy;
  for (const [shape, v] of [
    ["wide", cp.home.hero.video.wide],
    ["tall", cp.home.hero.video.tall],
  ] as const) {
    const label = shape === "wide" ? "Home video for computers" : "Home video for phones";
    photoRef("home", v.poster, `${label}, still picture`);
    if (!/^\/\S+\.mp4$/.test(v.mp4)) error("home", `${label}: the MP4 file should be a path like /video/hero.mp4`);
  }
  photoRef("pages-services", cp.servicesPage.hero.photo, "Menu page photo");
  photoRef("pages-projects", cp.projectsPage.hero.photo, "Gallery page photo");
  photoRef("pages-blog", cp.blogPage.hero.photo, "Blog page photo");
  photoRef("pages-careers", cp.careersPage.hero.photo, "Careers page photo");
  photoRef("pages-about", cp.aboutPage.hero.photo, "About page photo");
  cp.aboutPage.storyPhotos.forEach((k, i) => photoRef("pages-about", k, `Story photo ${i + 1}`));
  photoRef("pages-contact", cp.contactPage.hero.photo, "Contact page photo");
  photoRef("pages-area", cp.areaPage.fallbackPhoto, "Area page fallback photo");

  // SEO
  for (const key of ["home", "services", "offers", "projects", "builder", "blog", "careers", "cart", "about", "contact", "notFound"] as const) {
    const s = c.pageSeo[key];
    if (blank(s.title)) error("seo", `The ${key} page needs a title.`);
    if (blank(s.description)) error("seo", `The ${key} page needs a description.`);
    else if (s.description.length > 170) warn("seo", `The ${key} page description is ${s.description.length} characters. Google shows about 155.`);
  }

  // Menu sections ("services") and their dishes
  const serviceSlugs = c.services.map((s) => s.slug);
  if (c.services.length === 0) error("services", "Add at least one menu section.");
  for (const d of dupes(serviceSlugs)) error("services", `Two menu sections use the address "${d}".`);
  c.services.forEach((s, i) => {
    const name = s.name || `Menu section ${i + 1}`;
    if (!SLUG.test(s.slug)) error("services", `${name}: the page address "${s.slug}" may only use lower-case letters, numbers and dashes.`);
    if (blank(s.name)) error("services", `Menu section ${i + 1} has no name.`);
    if (blank(s.shortName)) error("services", `${name}: the short name is empty.`);
    if (!(ICONS as readonly string[]).includes(s.icon)) error("services", `${name}: unknown icon "${s.icon}".`);
    if (!(CATEGORIES as readonly string[]).includes(s.category)) error("services", `${name}: unknown photo type "${s.category}".`);
    photoRef("services", s.heroPhoto, `${name} main photo`);
    if (!blank(s.tilePhoto ?? "")) photoRef("services", s.tilePhoto, `${name} home page tile photo`);
    s.gallery.forEach((k, j) => photoRef("services", k, `${name} gallery photo ${j + 1}`));
    if (s.gallery.length !== 3) warn("services", `${name}: the gallery is laid out for 3 photos (it has ${s.gallery.length}).`);
    if (s.items.length === 0) error("services", `${name}: add at least one dish.`);
    s.items.forEach((it, j) => {
      const dish = it.name || `dish ${j + 1}`;
      if (blank(it.name)) error("services", `${name}: dish ${j + 1} has no name.`);
      const prices = it.prices ?? [];
      if (prices.length === 0) error("services", `${name}, ${dish}: add a price.`);
      prices.forEach((p) => {
        if (!(Number.isInteger(p.price) && p.price > 0))
          error("services", `${name}, ${dish}${p.size ? ` (${p.size})` : ""}: the price must be a whole number of rupees above 0.`);
      });
      if (prices.length > 1 && prices.some((p) => blank(p.size)))
        error("services", `${name}, ${dish}: with more than one price, name each size (e.g. 8 inch, 10 inch).`);
      for (const d of dupes(prices.map((p) => p.size.trim()))) warn("services", `${name}, ${dish}: the size "${d}" is listed twice.`);
      if (!(DIETS as readonly string[]).includes(it.diet)) error("services", `${name}, ${dish}: choose veg, non-veg or either.`);
      if (it.photo && !photoKeys.has(it.photo)) error("services", `${name}, ${dish}: the photo "${it.photo}" is not in the photo library.`);
    });
    for (const d of dupes(s.items.map((it) => it.name.trim()))) warn("services", `${name}: "${d}" is on the menu twice.`);
    // Add-ons picked in the cart (dips …).
    (s.addOns ?? []).forEach((a, j) => {
      const addOn = a.label || `Add-on ${j + 1}`;
      if (blank(a.label)) error("services", `${name}: add-on ${j + 1} has no name.`);
      if (!SLUG.test(a.id)) error("services", `${name}, ${addOn}: the code "${a.id}" may only use lower-case letters, numbers and dashes.`);
      if (!Number.isInteger(a.price) || a.price <= 0) error("services", `${name}, ${addOn}: the price must be a whole number of rupees above 0.`);
    });
    for (const d of dupes((s.addOns ?? []).map((a) => a.id))) error("services", `${name}: two add-ons use the code "${d}".`);
    if (blank(s.seo.title) || blank(s.seo.description)) error("services", `${name}: add a page title and description for Google.`);
  });
  const band = c.copy.offersPage.band.section;
  if (c.services.some((s) => s.offer) && !c.services.some((s) => s.offer && s.slug === band))
    warn("pages-offers", "Home page offers band: choose one of the combo offer sections to show (Content → Menu → Combo offers).");

  // Areas
  const localitySlugs = c.localities.map((l) => l.slug);
  for (const d of dupes(localitySlugs)) error("areas", `Two localities use the code "${d}".`);
  c.localities.forEach((l) => {
    if (!SLUG.test(l.slug)) error("areas", `Locality "${l.name}": the code "${l.slug}" may only use lower-case letters, numbers and dashes.`);
    if (blank(l.name)) error("areas", `Locality "${l.slug}" has no name.`);
  });
  // The delivery radius: measured from the café's map position; areas outside it are left out of the order form.
  const shop = c.business.geo;
  const km = c.business.deliveryKm;
  if (!isLatLng(shop)) error("business", "Add the café's map position (Map position and delivery): the delivery radius is measured from it.");
  if (!(km >= 1 && km <= 30)) error("business", "The delivery radius must be between 1 and 30 km.");
  c.localities.forEach((l) => {
    if (!isLatLng(l)) error("areas", `${l.name || l.slug}: add its map position, so the order form knows whether it is inside the delivery radius.`);
    else if (isLatLng(shop) && !withinRadius(shop, l, km))
      warn(
        "areas",
        `${l.name} is about ${formatKm(distanceKm(shop, l))} km from the café, outside the ${km} km delivery radius, so the order form does not offer it for delivery.`,
      );
  });
  const said = c.widerArea.match(/(\d+(?:\.\d+)?)\s*km/i);
  if (said && Number(said[1]) !== km) warn("areas", `"Everywhere else" says ${said[1]} km, but the delivery radius is ${km} km.`);
  const areaSlugs = c.areaPages.map((a) => a.slug);
  for (const d of dupes(areaSlugs)) error("areas", `Two area pages use the address "${d}".`);
  c.areaPages.forEach((a, i) => {
    const name = a.name || `Area page ${i + 1}`;
    photoRef("areas", a.photo, `${name} photo`);
    if (!SLUG.test(a.slug)) error("areas", `${name}: the page address "${a.slug}" may only use lower-case letters, numbers and dashes.`);
    if (!localitySlugs.includes(a.slug)) warn("areas", `${name}: add "${a.slug}" to the localities list too, so it shows in the area list on the home page.`);
    for (const s of a.services) if (!serviceSlugs.includes(s)) error("areas", `${name}: links to a menu section that does not exist ("${s}").`);
    if (blank(a.heading) || blank(a.seo.title) || blank(a.seo.description)) error("areas", `${name}: add a heading, page title and description.`);
  });

  // Gallery photos ("projects")
  const projectIds = c.projects.map((p) => p.id);
  for (const d of dupes(projectIds)) error("projects", `Two gallery photos use the code "${d}".`);
  c.projects.forEach((p, i) => {
    const name = p.title || `Gallery photo ${i + 1}`;
    if (blank(p.title)) error("projects", `Gallery photo ${i + 1} has no title.`);
    if (!(CATEGORIES as readonly string[]).includes(p.category)) error("projects", `${name}: unknown type "${p.category}".`);
    photoRef("projects", p.photo, `${name} photo`);
  });
  const filterIds = c.projectFilters.map((f) => f.id);
  for (const id of c.copy.home.projects.filters) if (!filterIds.includes(id)) error("home", `Home gallery: unknown filter "${id}".`);

  // Every page should have its own title and description in Google.
  const allSeo = [
    ...(["home", "services", "projects", "builder", "about", "contact"] as const).map((k) => c.pageSeo[k]),
    ...c.services.map((s) => s.seo),
    ...c.areaPages.map((a) => a.seo),
    ...c.legal.pages.map((p) => p.seo),
  ];
  for (const d of dupes(allSeo.map((s) => s.title.trim()))) warn("seo", `Two pages share the title "${d}". Give each page its own.`);
  for (const d of dupes(allSeo.map((s) => s.description.trim()))) warn("seo", `Two pages share the description "${d.slice(0, 60)}…".`);
  const intros = c.areaPages.map((a) => a.intro.join(" ").replaceAll(a.name, "AREA"));
  for (const d of dupes(intros))
    warn("areas", `Two area pages have the same text with only the name changed ("${d.slice(0, 50)}…"). Google ranks copied pages lower.`);

  // Policy pages (privacy, terms, cookies …)
  const lg = c.legal;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lg.contact.email))
    error("legal", `The email for privacy questions and complaints looks wrong ("${lg.contact.email}").`);
  if (blank(lg.contact.officer)) error("legal", "Name the Grievance Officer. Indian law asks for a named person who answers privacy questions and complaints.");
  for (const d of dupes(lg.pages.map((p) => p.slug))) error("legal", `Two policy pages use the address "${d}".`);
  lg.pages.forEach((p, i) => {
    const name = p.title || `Policy page ${i + 1}`;
    if (blank(p.title)) error("legal", `Policy page ${i + 1} has no title.`);
    if (!SLUG.test(p.slug)) error("legal", `${name}: the page address "${p.slug}" may only use lower-case letters, numbers and dashes.`);
    else if (RESERVED_SLUGS.includes(p.slug)) error("legal", `${name}: the address "/${p.slug}/" is already used by another part of the site.`);
    if (!isDate(p.updated)) error("legal", `${name}: "Last updated" should be a date like 2026-10-10.`);
    if (p.sections.length === 0) error("legal", `${name} has no text.`);
    p.sections.forEach((s, j) => (blank(s.heading) || blank(s.body)) && error("legal", `${name}, part ${j + 1}: needs a heading and some text.`));
    if (blank(p.seo.title) || blank(p.seo.description)) error("legal", `${name}: fill in the title and description for Google.`);
  });

  // [Links](/page/) in policy text and the form's privacy line must go somewhere real.
  const routes = new Set(routesFor(c));
  const checkLinks = (section: string, where: string, value: string) => {
    for (const href of linkTargets(value)) {
      if (!isSafeHref(href)) error(section, `${where}: the link "${href}" should start with /, https://, mailto: or tel:`);
      else if (href.startsWith("/") && !routes.has(href.split(/[#?]/)[0]!))
        error(section, `${where}: the link "${href}" goes to a page that does not exist. Page addresses end with a slash, like /contact/.`);
    }
  };
  checkLinks("sitewide", "Order form privacy line", c.copy.form.privacyNote);
  checkLinks("legal", "Contact box", lg.contactLead);
  lg.pages.forEach((p, i) => {
    const name = p.title || `Policy page ${i + 1}`;
    checkLinks("legal", name, p.lead);
    p.sections.forEach((s, j) => checkLinks("legal", `${name}, part ${j + 1}`, s.body));
  });

  // Blog posts
  for (const d of dupes(c.blog.map((p) => p.slug))) error("blog", `Two posts use the address "${d}".`);
  c.blog.forEach((p, i) => {
    const name = p.title || `Post ${i + 1}`;
    if (blank(p.title)) error("blog", `Post ${i + 1} has no title.`);
    if (!SLUG.test(p.slug)) error("blog", `${name}: the page address "${p.slug}" may only use lower-case letters, numbers and dashes.`);
    if (!isDate(p.date)) error("blog", `${name}: the date should look like 2026-10-11.`);
    if (blank(p.excerpt)) error("blog", `${name}: add a short summary.`);
    photoRef("blog", p.photo, name);
    if (p.sections.length === 0) error("blog", `${name} has no text.`);
    p.sections.forEach((s, j) => {
      if (blank(s.body)) error("blog", `${name}, part ${j + 1}: add some text, or remove the part.`);
      checkLinks("blog", `${name}, part ${j + 1}`, s.body);
    });
    if (blank(p.seo.title) || blank(p.seo.description))
      warn("blog", `${name}: fill in the title and description for Google. Until then the post's title and summary are used.`);
  });

  // Jobs and the application form
  for (const d of dupes(c.jobs.map((j) => j.id))) error("jobs", `Two jobs use the code "${d}".`);
  c.jobs.forEach((j, i) => {
    if (blank(j.title)) error("jobs", `Job ${i + 1} has no title.`);
    else if (blank(j.summary)) warn("jobs", `${j.title}: add a sentence about the job.`);
  });
  if (c.copy.careersPage.form.experienceOptions.length === 0) error("pages-careers", "Add at least one experience choice to the application form.");
  checkLinks("pages-careers", "Application form privacy line", c.copy.careersPage.form.privacyNote);

  // Reviews, steps, stats
  c.reviews.forEach((r, i) => {
    if (!(r.rating >= 1 && r.rating <= 5)) error("reviews", `Review ${i + 1}: stars must be 1 to 5.`);
    if (blank(r.text) || blank(r.name)) error("reviews", `Review ${i + 1} needs a name and text.`);
  });
  if (c.steps.length !== 4) error("trust", 'The "how it works" section is drawn for exactly 4 steps.');
  if (c.stats.length !== 4) error("trust", "The trust strip has room for exactly 4 figures.");

  // Pizza builder
  const pb = c.builder;
  if (!pb.sizes.length || !pb.bases.length || !pb.cheeses.length) error("builder", "The pizza builder needs at least one size, crust and cheese.");
  for (const o of [...pb.sizes, ...pb.bases, ...pb.cheeses, ...pb.toppings]) {
    if (blank(o.label)) error("builder", `Every builder choice needs a name (code "${o.id}").`);
    if (!(Number.isInteger(o.price) && o.price >= 0)) error("builder", `${o.label || o.id}: the price must be a whole number of rupees, 0 or more.`);
  }
  for (const o of [...pb.bases, ...pb.cheeses, ...pb.toppings]) {
    if (!(Number.isInteger(o.priceLarge) && o.priceLarge >= 0))
      error("builder", `${o.label || o.id}: the large-size price must be a whole number of rupees, 0 or more.`);
  }
  for (const z of pb.sizes) if (!(z.price > 0)) error("builder", `${z.label}: a size needs a price above 0.`);
  for (const t of pb.toppings) if (t.diet !== "veg" && t.diet !== "non-veg") error("builder", `${t.label}: choose veg or non-veg.`);
  for (const list of [pb.sizes, pb.bases, pb.cheeses, pb.toppings])
    for (const d of dupes(list.map((o) => o.id))) error("builder", `Two builder choices use the code "${d}".`);
  if (!(Number.isInteger(pb.maxToppings) && pb.maxToppings >= 1)) error("builder", "Allow at least 1 topping.");
  if (!(Number.isInteger(pb.maxQuantity) && pb.maxQuantity >= 1)) error("builder", "Allow at least 1 pizza per order.");
  const ex = c.copy.builderTeaser.example;
  const known = (list: { id: string }[], id: string) => list.some((o) => o.id === id);
  if (!known(pb.sizes, ex.size) || !known(pb.bases, ex.base) || !known(pb.cheeses, ex.cheese) || !ex.toppings.every((t) => known(pb.toppings, t)))
    warn("home", "The example pizza on the home page uses a builder choice that no longer exists. The first choice is shown instead.");
  if (c.whenOptions.length === 0) error("sitewide", 'Add at least one choice for "When do you want it?" on the order form.');

  return problems;
}

export function hasErrors(problems: Problem[]): boolean {
  return problems.some((p) => p.level === "error");
}
