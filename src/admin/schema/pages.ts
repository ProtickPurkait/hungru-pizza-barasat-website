// Headings and text of each page (copy.* in content.json).
import { FileQuestion, Home, Images, Info, MapPin, Phone, Pizza, UtensilsCrossed } from "lucide-react";
import type { SiteContent } from "@/data/types";
import { baseOptions, cheeseOptions, filterOptions, group, hero, num, para, photo, sizeOptions, strings, text, toppingOptions } from "./helpers";
import type { Section } from "./types";

const firstService = (c: SiteContent) => (c.services[0] ? `/menu/${c.services[0].slug}/` : "/menu/");
const firstArea = (c: SiteContent) => (c.areaPages[0] ? `/delivery/${c.areaPages[0].slug}/` : "/");

export const home: Section = {
  id: "home",
  group: "Pages",
  title: "Home page",
  icon: Home,
  description: "The first thing customers see. The menu, photos, reviews and FAQs come from their own sections; this is the text around them.",
  path: "copy",
  preview: "/",
  fields: [
    group(
      "Top of the page",
      [
        text("eyebrow", "Small line above the heading"),
        text("title", "Heading, first part", { required: true }),
        text("titleAccent", "Heading, words in maroon", { hint: "Shown in the accent colour on the line under the first part." }),
        text("titleLine2", "Heading, extra line (grey)", { hint: "Optional. Leave empty for a two-line heading." }),
        para("lead", "Introduction", { rows: 3 }),
        strings("promises", "Promises beside the pizza", { itemLabel: "promise", max: 4 }),
        photo(
          "photo",
          "Spinning pizza",
          "Shown as a slowly turning circle. Use a pizza photographed from directly above, filling a square photo, or cut out as a circle (PNG or WebP with a see-through background).",
        ),
      ],
      { key: "home.hero" },
    ),
    group("Menu section", [text("title", "Heading"), para("lead", "Introduction", { rows: 2 }), text("link", "Link to the full menu")], { key: "home.services" }),
    group("Dough to door", [text("title", "Heading"), para("lead", "Introduction", { rows: 2 })], { key: "howWeWork", hint: "The four steps are under Trust & process." }),
    group(
      "Gallery section",
      [
        text("title", "Heading"),
        para("lead", "Introduction", { rows: 2 }),
        text("link", "Link to the gallery"),
        { kind: "checks", key: "filters", label: "Filter buttons", options: filterOptions },
        num("count", "Photos shown", { min: 2, max: 12, step: 1 }),
      ],
      { key: "home.projects" },
    ),
    group(
      "Pizza builder teaser",
      [
        text("eyebrow", "Small line above"),
        text("title", "Heading"),
        para("lead", "Introduction", { rows: 2 }),
        text("button", "Button"),
        text("exampleLink", "Link that opens the example in the builder"),
        text("exampleLabel", "Order ticket label"),
        group(
          "Example pizza on the ticket",
          [
            { kind: "select", key: "size", label: "Size", options: sizeOptions },
            { kind: "select", key: "base", label: "Sauce", options: baseOptions },
            { kind: "select", key: "cheese", label: "Cheese", options: cheeseOptions },
            { kind: "checks", key: "toppings", label: "Toppings", options: toppingOptions },
          ],
          { key: "example", columns: 2 },
        ),
      ],
      { key: "builderTeaser" },
    ),
    group("Reviews section", [text("title", "Heading"), para("lead", "Introduction", { rows: 2, tokens: ["praise"], hint: "{praise} becomes the list of things customers praise." }), text("readAll", "Link to Google reviews")], {
      key: "reviews",
    }),
    group("Delivery areas section", [text("title", "Heading"), para("lead", "Introduction", { rows: 2 })], { key: "home.areas" }),
    text("home.faqTitle", "FAQ heading", { hint: "The questions are under FAQs." }),
  ],
};

export const servicesPages: Section = {
  id: "pages-services",
  group: "Pages",
  title: "Menu pages",
  icon: UtensilsCrossed,
  description: "The full menu page, the labels used on every menu, and the headings each menu section page shares. The dishes themselves are under Menu.",
  path: "copy",
  // The shared headings are easiest to check on a menu section page.
  preview: firstService,
  fields: [
    hero("servicesPage.hero"),
    group("Full menu page", [text("listTitle", "Heading"), para("listLead", "Introduction", { rows: 2 })], { key: "servicesPage" }),
    group(
      "Menu labels",
      [
        para("sizeNote", "Note at the top of the full menu", { rows: 2 }),
        text("vegLabel", "Veg mark name"),
        text("nonVegLabel", "Non-veg mark name"),
        text("eitherLabel", "Veg or non-veg mark name"),
        text("vegOnly", "Veg-only button"),
        text("jumpLabel", "Section links (for screen readers)"),
        text("fromLabel", 'Word before the lowest price ("From")'),
        text("sectionLink", "Link to a section's page", { tokens: ["section"] }),
      ],
      { key: "menu", columns: 2 },
    ),
    group(
      "Headings on every menu section page",
      [
        text("menuTitle", "Dishes heading"),
        text("aboutTitle", "About the section"),
        text("goodFor", "Order these for box"),
        text("materialsTitle", "Ingredients heading"),
        para("materialsNote", "Note under the ingredients heading", { rows: 2 }),
        text("galleryTitle", "Photos heading", { tokens: ["service"] }),
        text("relatedTitle", "More photos heading"),
        text("faqTitle", "FAQ heading", { tokens: ["service"] }),
        text("otherTitle", "Other sections heading"),
        text("ctaTitle", "Order band heading", { tokens: ["service"] }),
      ],
      { key: "servicePage", hint: "{service} is replaced with the section's short name, e.g. Kolkata specials." },
    ),
  ],
};

export const projectsPage: Section = {
  id: "pages-projects",
  group: "Pages",
  title: "Gallery page",
  icon: Images,
  path: "copy.projectsPage",
  preview: "/gallery/",
  fields: [
    hero("hero"),
    text("countLabel", "After the number of photos", { hint: 'Shown as "16 photos".' }),
    text("allFilter", '"All" filter button'),
    text("lightboxCta", "WhatsApp button on an enlarged photo"),
    text("ctaTitle", "Order band heading"),
  ],
};

export const builderPage: Section = {
  id: "pages-builder",
  group: "Pages",
  title: "Pizza builder page",
  icon: Pizza,
  description: "Text on the build-your-own page. The sizes, sauces, cheeses, toppings and prices are under Pizza builder.",
  path: "copy.builderPage",
  preview: "/build-your-pizza/",
  fields: [
    hero("hero", false),
    group(
      "Steps",
      [
        text("sizeLegend", "Step 1"),
        text("baseLegend", "Step 2"),
        text("cheeseLegend", "Step 3"),
        text("toppingsLegend", "Step 4"),
        para("toppingsHint", "Toppings help", { rows: 2, tokens: ["max"], hint: "{max} becomes the most toppings allowed." }),
        text("quantityLegend", "Step 5"),
      ],
      { columns: 2 },
    ),
    group("Order ticket", [
      text("resultTitle", "Ticket heading"),
      text("noToppings", "Text when no toppings are chosen", { hint: "Used in the WhatsApp message." }),
      para("disclaimer", "Note about the price", { rows: 2, hint: "Also shown on the home page example." }),
      text("orderButton", "WhatsApp button"),
      para("includedNote", "What the price includes", { rows: 2 }),
    ]),
    text("ctaTitle", "Order band heading"),
  ],
};

export const areaPage: Section = {
  id: "pages-area",
  group: "Pages",
  title: "Delivery area pages",
  icon: MapPin,
  description: "Headings every delivery area page shares. {area} becomes the area name. Each area's own text is under Delivery areas.",
  path: "copy.areaPage",
  preview: firstArea,
  fields: [
    text("eyebrow", "Small line above the heading", { tokens: ["area"], hint: "Also used in the footer and the breadcrumbs." }),
    text("workingTitle", "About the area heading", { tokens: ["area"] }),
    text("nearLabel", "Landmarks label"),
    text("offeredTitle", "Menu sections heading", { tokens: ["area"] }),
    para("offeredLead", "Menu sections introduction", { rows: 2 }),
    text("faqTitle", "FAQ heading", { tokens: ["area"] }),
    text("alsoTitle", "Other areas heading"),
    text("ctaTitle", "Order band heading", { tokens: ["area"] }),
    photo("fallbackPhoto", "Photo when an area's own photo is missing"),
  ],
};

export const aboutPage: Section = {
  id: "pages-about",
  group: "Pages",
  title: "About page",
  icon: Info,
  description: "Headings and photos. The story, team, ingredients and promise are under Team & story.",
  path: "copy.aboutPage",
  preview: "/about/",
  fields: [
    hero("hero"),
    text("storyTitle", "Story heading"),
    { kind: "photos", key: "storyPhotos", label: "Story photos", max: 2 },
    text("teamTitle", "Team heading"),
    para("teamLead", "Team introduction", { rows: 2 }),
    text("brandsTitle", "Ingredients heading"),
    text("praiseTitle", "Praise heading"),
  ],
};

export const contactPage: Section = {
  id: "pages-contact",
  group: "Pages",
  title: "Contact page",
  icon: Phone,
  description: "The address, phone and hours themselves are under Business details.",
  path: "copy.contactPage",
  preview: "/contact/",
  fields: [
    hero("hero"),
    text("reachTitle", "Contact cards heading"),
    group(
      "Contact cards",
      [
        text("phoneTitle", "Phone card"),
        text("phoneHint", "Phone card note"),
        text("whatsappTitle", "WhatsApp card"),
        text("whatsappHint", "WhatsApp card note"),
        text("addressTitle", "Address card"),
        text("directions", "Directions button"),
        text("hoursTitle", "Hours card"),
        text("hoursNote", "Hours card note"),
        text("orderOnlineTitle", "Delivery apps card"),
        text("orderOnlineHint", "Delivery apps card note"),
      ],
      { columns: 2 },
    ),
    group("Form", [text("formEyebrow", "Small line above"), text("formTitle", "Heading"), para("formLead", "Introduction", { rows: 2 })]),
    group("Map", [text("mapTitle", "Heading"), text("callFirst", "Call button")]),
  ],
};

export const notFound: Section = {
  id: "pages-404",
  group: "Pages",
  title: "Page not found",
  icon: FileQuestion,
  description: "Shown when someone opens a link that does not exist.",
  path: "copy.notFound",
  preview: "/this-page-does-not-exist/",
  fields: [text("eyebrow", "Small line above the heading"), text("title", "Heading"), para("lead", "Introduction", { rows: 2 }), text("popularTitle", "Links heading")],
};
