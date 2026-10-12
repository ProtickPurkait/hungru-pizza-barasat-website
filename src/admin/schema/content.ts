// Menu sections, gallery photos, delivery areas, reviews, FAQs and the other lists the pages are built from.
import { BadgeCheck, HelpCircle, Images, MapPinned, MessageSquareQuote, Pizza, Users, UtensilsCrossed } from "lucide-react";
import type { SiteContent } from "@/data/types";
import { formatINR } from "@/lib/format";
import {
  categoryKeys,
  categoryOptions,
  dietOptions,
  faqList,
  group,
  iconOptions,
  num,
  para,
  photo,
  seoFields,
  serviceOptions,
  slugify,
  strings,
  text,
  toggle,
} from "./helpers";
import type { Field, Section } from "./types";

const firstPhoto = (c: SiteContent) => Object.keys(c.photos)[0] ?? "";

const slugHint = "Part of the page address. Lower-case letters, numbers and dashes. Changing it changes the link, so old links stop working.";

/** "₹139" or "8 inch ₹139 / 10 inch ₹220" */
const pricesText = (prices: { size: string; price: number }[] = []) => prices.map((p) => `${p.size ? `${p.size} ` : ""}${formatINR(p.price)}`).join(" / ");

const dishFields: Field[] = [
  group("", [text("name", "Dish", { required: true }), text("tag", "Tag (optional)", { hint: "e.g. Bestseller, Spicy, New. Leave empty for none." })], {
    columns: 2,
  }),
  para("description", "What is in it", { rows: 2 }),
  { kind: "select", key: "diet", label: "Food mark", options: dietOptions },
  {
    kind: "list",
    key: "prices",
    label: "Sizes and prices",
    hint: "One price, or one per size, smallest first. Leave the size empty when there is only one price.",
    itemLabel: "size",
    min: 1,
    max: 4,
    itemTitle: (p) => `${p.size || "One size"} · ${formatINR(p.price)}`,
    newItem: () => ({ size: "", price: 99 }),
    fields: [
      group("", [text("size", "Size", { hint: "e.g. 8 inch, 10 inch, 4 pcs, Small, Grill" }), num("price", "Price", { min: 1, step: 1, suffix: "₹" })], {
        columns: 2,
      }),
    ],
  },
];

export const services: Section = {
  id: "services",
  group: "Content",
  title: "Menu",
  icon: UtensilsCrossed,
  description:
    "The menu sections and their dishes and prices. Each section has its own page. Add, remove or reorder them here; the home page, full menu and footer follow.",
  path: "services",
  preview: "/menu/",
  fields: [
    {
      kind: "list",
      key: "",
      label: "Menu sections",
      itemLabel: "menu section",
      itemTitle: (s) => s.name || "New menu section",
      itemSubtitle: (s) => `/menu/${s.slug}/ · ${s.items?.length ?? 0} dishes`,
      itemPhoto: (s) => s.heroPhoto,
      preview: (s) => `/menu/${s.slug}/`,
      newItem: (c) => ({
        slug: slugify(
          "new-section",
          c.services.map((s) => s.slug),
        ),
        name: "New menu section",
        shortName: "New section",
        icon: "pizza",
        category: "veg",
        tagline: "",
        summary: "",
        intro: [""],
        heroPhoto: firstPhoto(c),
        idealFor: [""],
        note: "",
        items: [{ name: "New dish", description: "", prices: [{ size: "", price: 99 }], diet: "veg", tag: "" }],
        materials: [{ name: "", note: "" }],
        gallery: Object.keys(c.photos).slice(0, 3),
        faqs: [],
        seo: { title: "", description: "" },
      }),
      fields: [
        group(
          "Names",
          [
            text("name", "Name", { required: true }),
            text("shortName", "Short name", { required: true, hint: 'Used in the footer, the menu bar and headings like "Veg pizzas: your questions".' }),
            text("slug", "Page address", { mono: true, hint: slugHint }),
          ],
          { columns: 2 },
        ),
        text("tagline", "Small line above the heading"),
        para("summary", "Summary", { rows: 3, hint: "Shown on the menu cards and under the page heading." }),
        photo("heroPhoto", "Main photo"),
        text("note", "Note above the dishes (optional)", { hint: "e.g. 8 inch = 4 slices, 10 inch = 8 slices. Add a dip for ₹20." }),
        {
          kind: "list",
          key: "items",
          label: "Dishes and prices",
          hint: "Prices are in rupees, as on your printed menu.",
          itemLabel: "dish",
          min: 1,
          itemTitle: (d) => d.name || "New dish",
          itemSubtitle: (d) => `${d.diet === "veg" ? "Veg" : d.diet === "non-veg" ? "Non-veg" : "Veg or non-veg"} · ${pricesText(d.prices)}`,
          newItem: () => ({ name: "", description: "", prices: [{ size: "", price: 99 }], diet: "veg", tag: "" }),
          fields: dishFields,
        },
        {
          kind: "list",
          key: "addOns",
          label: "Add-ons in the cart (optional)",
          hint: "Extras any dish in this section can have, picked in the cart with Add extras (e.g. a dip for ₹20). Pizzas in 8 and 10 inch already get the pizza builder's crust, cheese and toppings there.",
          itemLabel: "add-on",
          itemTitle: (a) => a.label || "New add-on",
          itemSubtitle: (a) => formatINR(a.price),
          newItem: (c) => ({
            id: slugify(
              "new-add-on",
              c.services.flatMap((s) => (s.addOns ?? []).map((a) => a.id)),
            ),
            label: "",
            price: 20,
          }),
          fields: [
            group("", [text("label", "Name", { required: true }), num("price", "Price", { min: 1, suffix: "₹" })], { columns: 2 }),
            text("id", "Code", { mono: true, hint: "Lower-case, with dashes. Keeps the add-on in carts when you rename it." }),
          ],
        },
        strings("intro", "About this section", { multiline: true, itemLabel: "paragraph" }),
        strings("idealFor", "Order these for", { itemLabel: "point" }),
        {
          kind: "list",
          key: "materials",
          label: "What goes in",
          itemLabel: "ingredient",
          itemTitle: (m) => m.name || "New ingredient",
          newItem: () => ({ name: "", note: "" }),
          fields: [text("name", "Ingredient"), text("note", "Note")],
        },
        { kind: "photos", key: "gallery", label: "Photos on the page", hint: "Laid out for 3: one large, two small.", max: 6 },
        faqList("faqs", "Questions and answers"),
        group(
          "Links to other parts of the site",
          [
            {
              kind: "select",
              key: "category",
              label: "Gallery photo type",
              options: categoryOptions,
              hint: 'Which gallery photos show as "more from the gallery".',
            },
            { kind: "select", key: "icon", label: "Icon", options: iconOptions },
          ],
          { columns: 2 },
        ),
        seoFields(),
      ],
    },
  ],
};

export const projects: Section = {
  id: "projects",
  group: "Content",
  title: "Gallery",
  icon: Images,
  description: "Photos shown in the galleries on the home, gallery and menu section pages.",
  path: "",
  preview: "/gallery/",
  fields: [
    {
      kind: "list",
      key: "projects",
      label: "Gallery photos",
      itemLabel: "photo",
      itemTitle: (p) => p.title || "New photo",
      itemPhoto: (p) => p.photo,
      itemSubtitle: (p, c) => c.categoryLabels[p.category as keyof SiteContent["categoryLabels"]] ?? p.category,
      newItem: (c) => ({
        id: slugify(
          "new-photo",
          c.projects.map((p) => p.id),
        ),
        title: "",
        category: "veg",
        photo: firstPhoto(c),
        summary: "",
      }),
      fields: [
        text("title", "Title", { required: true, hint: "Also used in the WhatsApp message when someone orders from the photo." }),
        photo("photo", "Photo"),
        para("summary", "Short description", { rows: 2 }),
        group(
          "Details",
          [
            { kind: "select", key: "category", label: "Type", options: categoryOptions },
            text("id", "Code", { mono: true, hint: "Any unique code. Not shown on the site." }),
          ],
          { columns: 2 },
        ),
      ],
    },
    {
      kind: "list",
      key: "projectFilters",
      label: "Filter buttons",
      hint: "The buttons above the gallery. Each one shows one or more photo types.",
      itemLabel: "filter",
      itemTitle: (f) => f.label || "New filter",
      newItem: (c) => ({
        id: slugify(
          "filter",
          c.projectFilters.map((f) => f.id),
        ),
        label: "",
        categories: [],
      }),
      fields: [
        text("label", "Button text"),
        { kind: "checks", key: "categories", label: "Shows these types", options: categoryOptions },
        text("id", "Code", { mono: true }),
      ],
    },
    { kind: "record", key: "categoryLabels", label: "Names of the photo types", keys: categoryKeys },
  ],
};

export const reviews: Section = {
  id: "reviews",
  group: "Content",
  title: "Reviews",
  icon: MessageSquareQuote,
  description: "Customer reviews on the home page. Copy real ones from Google (with the customer's permission).",
  path: "",
  preview: "/",
  fields: [
    {
      kind: "list",
      key: "reviews",
      label: "Reviews",
      itemLabel: "review",
      itemTitle: (r) => r.name || "New review",
      itemSubtitle: (r) => `${"★".repeat(r.rating)} · ${r.locality}${r.placeholder ? " · sample" : ""}`,
      newItem: () => ({ name: "", locality: "", service: "", rating: 5, text: "", placeholder: false }),
      fields: [
        para("text", "Review", { rows: 4, required: true }),
        group(
          "Customer",
          [
            text("name", "Name", { hint: 'First name and initial is enough, e.g. "Sneha B."' }),
            text("locality", "Area"),
            text("service", "What they ordered"),
            num("rating", "Stars", { min: 1, max: 5, step: 1 }),
          ],
          { columns: 2 },
        ),
        toggle("placeholder", "Sample review", 'Shows a "Sample review" tag while sample tags are on.'),
      ],
    },
    strings("praise", "What customers praise", { itemLabel: "phrase", hint: "The scrolling words above the reviews, and the praise list on the About page." }),
  ],
};

export const areas: Section = {
  id: "areas",
  group: "Content",
  title: "Delivery areas",
  icon: MapPinned,
  description: "Where you deliver. Every locality is listed on the home page and in the order form; some also have their own page.",
  path: "",
  preview: "/",
  fields: [
    {
      kind: "list",
      key: "localities",
      label: "Localities you deliver to",
      itemLabel: "locality",
      itemTitle: (l) => l.name || "New locality",
      itemSubtitle: (l) => l.slug,
      // A new area starts on the café's spot: move it to the area's real position.
      newItem: (c) => ({
        slug: slugify(
          "new-area",
          c.localities.map((l) => l.slug),
        ),
        name: "",
        lat: c.business.geo.lat,
        lng: c.business.geo.lng,
      }),
      fields: [
        text("name", "Name", { required: true }),
        text("slug", "Code", { mono: true, hint: "Lower-case, with dashes. An area page with the same code is linked from the home page." }),
        num("lat", "Latitude", { step: 0.00001, hint: "The middle of the area. In Google Maps, press and hold there: the first number." }),
        num("lng", "Longitude", { step: 0.00001, hint: "The second number. Areas outside the delivery radius are left out of the order form." }),
      ],
    },
    text("widerArea", "Everywhere else", {
      hint: 'Shown as "+ anywhere within 5 km" after the areas on the home page and in the footer. Keep the distance the same as the delivery radius (Business details).',
    }),
    {
      kind: "list",
      key: "areaPages",
      label: "Delivery area pages",
      hint: "Each needs its own text: Google ranks pages that only swap the area name much lower.",
      itemLabel: "area page",
      itemTitle: (a) => a.name || "New area page",
      itemSubtitle: (a) => `/delivery/${a.slug}/`,
      itemPhoto: (a) => a.photo,
      preview: (a) => `/delivery/${a.slug}/`,
      newItem: (c) => ({
        slug: slugify(
          "new-area",
          c.areaPages.map((a) => a.slug),
        ),
        name: "",
        photo: c.copy.areaPage.fallbackPhoto,
        heading: "",
        lead: "",
        intro: [""],
        localNotes: { title: "", items: [""] },
        landmarks: [],
        services: c.services.slice(0, 3).map((s) => s.slug),
        faqs: [],
        seo: { title: "", description: "" },
      }),
      fields: [
        group("Names", [text("name", "Area name", { required: true }), text("slug", "Page address", { mono: true, hint: slugHint })], { columns: 2 }),
        photo("photo", "Photo"),
        text("heading", "Main heading", { required: true }),
        para("lead", "Introduction", { rows: 2 }),
        strings("intro", "About delivering here", { multiline: true, itemLabel: "paragraph" }),
        group(
          "Delivery details box",
          [text("title", "Box heading"), strings("items", "Points", { itemLabel: "point", hint: "Times, delivery charge, how to pay." })],
          { key: "localNotes" },
        ),
        strings("landmarks", "Landmarks and roads", { itemLabel: "landmark" }),
        { kind: "checks", key: "services", label: "Menu sections to show", options: serviceOptions },
        faqList("faqs", "Questions and answers"),
        seoFields(),
      ],
    },
  ],
};

export const faqs: Section = {
  id: "faqs",
  group: "Content",
  title: "FAQs",
  icon: HelpCircle,
  description: "Questions on the home page. They are also sent to Google, which can show them in search results.",
  path: "",
  preview: "/",
  fields: [faqList("homeFaqs", "Home page questions")],
};

const stepFields: Field[] = [text("title", "Step"), para("text", "Description", { rows: 2 })];

export const trust: Section = {
  id: "trust",
  group: "Content",
  title: "Trust & process",
  icon: BadgeCheck,
  description: "The four figures under the home page heading, and the four steps of how ordering works.",
  path: "",
  preview: "/",
  fields: [
    {
      kind: "list",
      key: "stats",
      label: "Trust figures",
      itemLabel: "figure",
      fixed: true,
      itemTitle: (s) => `${s.value} ${s.label}`,
      newItem: () => ({ value: "", label: "" }),
      fields: [
        group("", [text("value", "Figure", { hint: "Short: 4.7★, 100+, ₹120" }), text("label", "Label")], { columns: 2 }),
        toggle("placeholder", "Sample figure", 'Shows a "Sample" tag while sample tags are on.'),
      ],
    },
    {
      kind: "list",
      key: "steps",
      label: "How it works",
      hint: "Drawn as four drips from a strand of melted cheese, so there are always four.",
      itemLabel: "step",
      fixed: true,
      itemTitle: (s, i) => `${i + 1}. ${s.title}`,
      newItem: () => ({ title: "", text: "" }),
      fields: stepFields,
    },
  ],
};

export const aboutContent: Section = {
  id: "team",
  group: "Content",
  title: "Team & story",
  icon: Users,
  description: "The About page: your story, team, the ingredients you use, and your promise.",
  path: "",
  preview: "/about/",
  fields: [
    strings("story", "Your story", { multiline: true, itemLabel: "paragraph" }),
    {
      kind: "list",
      key: "team",
      label: "Team",
      itemLabel: "person",
      itemTitle: (m) => m.name || "New person",
      itemSubtitle: (m) => m.role,
      newItem: () => ({ name: "", role: "", bio: "" }),
      fields: [group("", [text("name", "Name"), text("role", "Role")], { columns: 2 }), para("bio", "About them", { rows: 2 })],
    },
    {
      kind: "list",
      key: "brands",
      label: "Ingredients",
      itemLabel: "ingredient",
      itemTitle: (b) => b.name || "New ingredient",
      itemSubtitle: (b) => b.type,
      newItem: () => ({ name: "", type: "" }),
      fields: [group("", [text("name", "Ingredient"), text("type", "Where it comes from, or what it is for")], { columns: 2 })],
    },
    group("Our promise", [text("headline", "Heading"), strings("points", "Points", { multiline: true, itemLabel: "point" })], { key: "warranty" }),
  ],
};

const codeField = text("id", "Code", { mono: true, hint: "Not shown. Used in links like /build-your-pizza/?size=large." });

/** Name, note, regular and large price, and any extra fields (crusts, cheeses, toppings). */
const choiceFields = (extra: Field[] = []): Field[] => [
  group("", [text("label", "Name"), text("note", "Note")], { columns: 2 }),
  group(
    "",
    [
      num("price", "Price on the regular size", { min: 0, step: 5, suffix: "₹", hint: "0 = included." }),
      num("priceLarge", "Price on the large size", { min: 0, step: 5, suffix: "₹" }),
      ...extra,
    ],
    { columns: 2 },
  ),
  codeField,
];

/** "+₹40 / +₹55", or "Included" */
const extraText = (o: { price: number; priceLarge: number }) => (o.price || o.priceLarge ? `+${formatINR(o.price)} / +${formatINR(o.priceLarge)}` : "Included");

export const builder: Section = {
  id: "builder",
  group: "Content",
  title: "Pizza builder",
  icon: Pizza,
  description: "Choices and prices for build-your-own. Price = size + crust + cheese + each topping, at the regular or large price to match the size.",
  path: "builder",
  preview: "/build-your-pizza/",
  fields: [
    {
      kind: "list",
      key: "sizes",
      label: "Sizes",
      hint: "The price of the plain pizza in this size, with sauce and cheese.",
      itemLabel: "size",
      itemTitle: (o) => o.label || "New size",
      itemSubtitle: (o) => `${formatINR(o.price)}${o.large ? " · large prices for extras" : ""}`,
      newItem: (c) => ({
        id: slugify(
          "size",
          c.builder.sizes.map((o) => o.id),
        ),
        label: "",
        note: "",
        price: 199,
        large: false,
      }),
      fields: [
        group("", [text("label", "Name"), text("note", "Note")], { columns: 2 }),
        num("price", "Price", { min: 1, step: 1, suffix: "₹" }),
        toggle("large", "Large size", "Crusts, cheese and toppings use their large-size price on this size."),
        codeField,
      ],
    },
    {
      kind: "list",
      key: "bases",
      label: "Crusts",
      itemLabel: "crust",
      itemTitle: (o) => o.label || "New crust",
      itemSubtitle: extraText,
      newItem: (c) => ({
        id: slugify(
          "crust",
          c.builder.bases.map((o) => o.id),
        ),
        label: "",
        note: "",
        price: 0,
        priceLarge: 0,
      }),
      fields: choiceFields(),
    },
    {
      kind: "list",
      key: "cheeses",
      label: "Cheese",
      itemLabel: "cheese",
      itemTitle: (o) => o.label || "New cheese",
      itemSubtitle: extraText,
      newItem: (c) => ({
        id: slugify(
          "cheese",
          c.builder.cheeses.map((o) => o.id),
        ),
        label: "",
        note: "",
        price: 0,
        priceLarge: 0,
      }),
      fields: choiceFields(),
    },
    {
      kind: "list",
      key: "toppings",
      label: "Toppings",
      hint: "The add-on prices from your menu.",
      itemLabel: "topping",
      itemTitle: (o) => o.label || "New topping",
      itemSubtitle: (o) => `${o.diet === "veg" ? "Veg" : "Non-veg"} · ${extraText(o)}`,
      newItem: (c) => ({
        id: slugify(
          "topping",
          c.builder.toppings.map((o) => o.id),
        ),
        label: "",
        note: "",
        price: 40,
        priceLarge: 55,
        diet: "veg",
      }),
      fields: choiceFields([
        {
          kind: "select",
          key: "diet",
          label: "Food mark",
          options: [
            { value: "veg", label: "Veg" },
            { value: "non-veg", label: "Non-veg" },
          ],
        },
      ]),
    },
    group(
      "Limits",
      [
        num("maxToppings", "Most toppings on one pizza", { min: 1, max: 15, step: 1 }),
        num("maxQuantity", "Most pizzas in one order", { min: 1, max: 50, step: 1 }),
      ],
      { columns: 2 },
    ),
  ],
};
