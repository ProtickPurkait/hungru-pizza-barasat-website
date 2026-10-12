// What the site search can find, built from the content. Pure (the content is passed in), so the
// admin's live preview and the tests can use it too.
import type { Faq, SiteContent } from "@/data/types";
import { anchorFor, paths } from "./paths";
import { WEIGHT, type SearchEntry, type SearchIcon } from "./search";
import { fill } from "./text";

const { key: KEY, about: ABOUT, body: BODY } = WEIGHT;

/** How visitors ask for each page, besides its name. */
const PAGE_WORDS = {
  home: "home main start front page",
  services: "menu card full menu price list prices rates dishes food",
  builder: "build your own make create custom choose toppings crust size",
  projects: "gallery photos pictures pics images",
  blog: "blog articles guides tips news read",
  about: "about us story owner team who ingredients",
  careers: "careers jobs hiring vacancy vacancies work apply join",
  contact: "contact phone call whatsapp address location directions map hours timing open order online",
  cart: "cart basket bag checkout my order",
};

const DIET_WORDS = { veg: "veg vegetarian", "non-veg": "nonveg", either: "veg nonveg" };

const join = (...parts: (string | string[] | undefined)[]): string => parts.flat().filter(Boolean).join(" ");

/** Every dish, menu section, page, post, delivery area, job, question and policy, plus quick answers (hours, phone, address, delivery). */
export function searchEntries(c: SiteContent): SearchEntry[] {
  const s = c.copy.search;
  const b = c.business;
  const out: SearchEntry[] = [];
  const areas = c.localities.map((l) => l.name);

  // Quick answers: the result itself says what the visitor wanted to know.
  out.push(
    {
      id: "answer-hours",
      kind: "answer",
      icon: "clock",
      title: s.hoursTitle,
      snippet: b.hours.display,
      path: `${paths.contact}#reach-title`,
      fields: [{ text: "hours timing open opening close closing closed today time", weight: KEY }],
    },
    {
      id: "answer-phone",
      kind: "answer",
      icon: "phone",
      title: s.phoneTitle,
      snippet: b.phone.display,
      path: `${paths.contact}#reach-title`,
      fields: [
        { text: "phone call number mobile contact whatsapp", weight: KEY },
        { text: b.phone.display, weight: ABOUT },
      ],
    },
    {
      id: "answer-address",
      kind: "answer",
      icon: "pin",
      title: s.addressTitle,
      snippet: b.address.full,
      path: `${paths.contact}#map-title`,
      fields: [
        { text: "address location where map directions reach", weight: KEY },
        { text: b.address.full, weight: ABOUT },
      ],
    },
    {
      id: "answer-delivery",
      kind: "answer",
      icon: "bike",
      title: s.deliveryTitle,
      snippet: fill(s.deliveryText, { km: b.deliveryKm, areas: areas.join(", ") }),
      path: `${paths.contact}#order-form`,
      fields: [
        { text: "delivery deliver home radius km areas", weight: KEY },
        { text: areas.join(" "), weight: ABOUT },
      ],
    },
  );

  // The main pages.
  const page = (key: keyof typeof PAGE_WORDS, title: string, path: string, icon: SearchIcon, about: string, body = ""): SearchEntry => ({
    id: `page-${key}`,
    kind: "page",
    icon,
    title,
    snippet: c.pageSeo[key].description,
    path,
    fields: [
      { text: PAGE_WORDS[key], weight: KEY },
      { text: join(c.pageSeo[key].title, about), weight: ABOUT },
      { text: body, weight: BODY },
    ],
  });
  const p = c.copy;
  const builderOptions = [...c.builder.sizes, ...c.builder.bases, ...c.builder.cheeses, ...c.builder.toppings].map((o) => o.label);
  out.push(
    page("home", p.nav.home, paths.home, "home", join(p.home.hero.title, p.home.hero.titleAccent, p.home.hero.lead)),
    page("services", p.nav.services, paths.services, "pizza", join(p.servicesPage.hero.title, p.servicesPage.hero.lead), join(c.services.map((x) => x.name))),
    page("builder", p.nav.builder, paths.builder, "pizza", join(p.builderPage.hero.title, p.builderPage.hero.lead, builderOptions)),
    page(
      "projects",
      p.nav.projects,
      paths.projects,
      "page",
      join(p.projectsPage.hero.title, p.projectsPage.hero.lead),
      join(c.projects.map((x) => `${x.title} ${x.summary}`)),
    ),
    page("blog", p.nav.blog, paths.blog, "post", join(p.blogPage.hero.title, p.blogPage.hero.lead), join(c.blog.map((x) => x.title))),
    page(
      "about",
      p.nav.about,
      paths.about,
      "page",
      join(p.aboutPage.hero.title, p.aboutPage.hero.lead),
      join(
        c.story,
        c.team.map((t) => `${t.name} ${t.role}`),
        c.brands.map((x) => `${x.name} ${x.type}`),
        c.warranty.headline,
      ),
    ),
    page(
      "careers",
      p.nav.careers,
      paths.careers,
      "job",
      join(p.careersPage.hero.title, p.careersPage.hero.lead),
      join(
        p.careersPage.perks.map((x) => x.title),
        c.jobs.map((j) => j.title),
      ),
    ),
    page(
      "contact",
      p.nav.contact,
      paths.contact,
      "phone",
      join(
        p.contactPage.hero.title,
        p.contactPage.hero.lead,
        b.address.full,
        b.orderOnline.map((o) => o.label),
      ),
      b.hours.display,
    ),
    page("cart", p.cart.hero.title, paths.cart, "cart", p.cart.hero.lead),
  );

  // The menu: each section, then each dish (it opens on its section's page, scrolled to it).
  for (const sec of c.services) {
    out.push({
      id: `section-${sec.slug}`,
      kind: "section",
      icon: sec.icon,
      title: sec.name,
      snippet: sec.tagline || sec.summary,
      path: paths.service(sec.slug),
      meta: fill(p.menu.dishCount, { count: sec.items.length }),
      fields: [
        { text: sec.shortName, weight: KEY },
        {
          text: join(
            sec.tagline,
            sec.summary,
            sec.idealFor,
            sec.materials.map((m) => m.name),
          ),
          weight: ABOUT,
        },
        {
          text: join(
            sec.intro,
            sec.note,
            sec.items.map((i) => i.name),
          ),
          weight: BODY,
        },
      ],
    });
    for (const it of sec.items) {
      out.push({
        id: `dish-${sec.slug}-${anchorFor(it.name)}`,
        kind: "dish",
        title: it.name,
        snippet: it.description,
        path: paths.dish(sec.slug, it.name),
        meta: sec.shortName,
        diet: it.diet,
        prices: it.prices.map((x) => x.price),
        fields: [
          {
            text: join(
              it.tag,
              DIET_WORDS[it.diet],
              it.prices.map((x) => x.size),
            ),
            weight: KEY,
          },
          { text: join(sec.name, sec.shortName), weight: 4 },
          { text: it.description, weight: 2 },
        ],
      });
    }
  }

  for (const a of c.areaPages) {
    out.push({
      id: `area-${a.slug}`,
      kind: "area",
      icon: "pin",
      title: a.name,
      snippet: a.lead,
      path: paths.area(a.slug),
      fields: [
        { text: "delivery deliver area", weight: KEY },
        { text: join(a.heading, a.landmarks), weight: ABOUT },
        { text: join(a.intro, a.localNotes.title, a.localNotes.items), weight: BODY },
      ],
    });
  }

  for (const post of c.blog) {
    out.push({
      id: `post-${post.slug}`,
      kind: "post",
      icon: "post",
      title: post.title,
      snippet: post.excerpt,
      path: paths.post(post.slug),
      meta: post.category,
      fields: [
        { text: post.category, weight: 4 },
        { text: post.excerpt, weight: ABOUT },
        { text: join(post.sections.map((x) => `${x.heading} ${x.body}`)), weight: BODY },
      ],
    });
  }

  for (const j of c.jobs) {
    out.push({
      id: `job-${j.id}`,
      kind: "job",
      icon: "job",
      title: j.title,
      snippet: j.summary,
      path: `${paths.careers}#job-${j.id}`,
      meta: j.type,
      fields: [
        { text: "job career hiring vacancy work apply", weight: ABOUT },
        { text: join(j.type, j.hours, j.summary), weight: 2 },
        { text: join(j.duties, j.needs), weight: BODY },
      ],
    });
  }

  // Questions open on their page, with the answer unfolded.
  const faqs = (list: Faq[], path: string, where: string) =>
    list.forEach((f, i) =>
      out.push({
        id: `faq-${path}-${i}`,
        kind: "faq",
        icon: "faq",
        title: f.q,
        snippet: f.a,
        path: `${path}#faq-${i}`,
        meta: where,
        fields: [{ text: f.a, weight: BODY }],
      }),
    );
  faqs(c.homeFaqs, paths.home, p.nav.home);
  for (const sec of c.services) faqs(sec.faqs, paths.service(sec.slug), sec.shortName);
  for (const a of c.areaPages) faqs(a.faqs, paths.area(a.slug), a.name);

  for (const page of c.legal.pages) {
    out.push({
      id: `policy-${page.slug}`,
      kind: "policy",
      icon: "policy",
      title: page.title,
      snippet: page.lead,
      path: paths.legal(page.slug),
      fields: [
        { text: page.navLabel, weight: KEY },
        { text: page.lead, weight: ABOUT },
        { text: join(page.sections.map((x) => x.heading)), weight: 2 },
        { text: join(page.sections.map((x) => x.body)), weight: BODY },
      ],
    });
  }

  return out;
}
