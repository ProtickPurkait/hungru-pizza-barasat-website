// Headings and text of each page (copy.* in content.json).
import { FileQuestion, Home, Images, Info, MapPin, Phone, Pizza, Search, ShoppingBag, UtensilsCrossed } from "lucide-react";
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
        text("titleAccent", "Heading, words in yellow", { hint: "Shown in the accent colour on the line under the first part." }),
        text("titleLine2", "Heading, extra line (grey)", { hint: "Optional. Leave empty for a two-line heading." }),
        para("lead", "Introduction", { rows: 3 }),
        strings("promises", "Promises under the buttons", { itemLabel: "promise", max: 4 }),
        group(
          "Background video",
          [
            ...(["wide", "tall"] as const).map((shape) =>
              group(
                shape === "wide" ? "For computers (wide)" : "For phones and tablets (tall)",
                [
                  text("mp4", "Video file (MP4)", { required: true }),
                  photo(
                    "poster",
                    "Still picture",
                    "The video's first frame. Shown while the video loads, and instead of it for visitors who switch motion off or save data.",
                  ),
                ],
                { key: shape, columns: 2 },
              ),
            ),
            text("credit", "Credit line", {
              hint: 'Optional. Shown small in the corner of the video. Grok asks for "Created with Grok" wherever its videos are published. Leave empty to hide it.',
            }),
            text("pause", "Pause button (for keyboard and screen reader users)"),
            text("play", "Play button (for keyboard and screen reader users)"),
          ],
          {
            key: "video",
            hint: "The video files live in the website's public/video folder. Wide: about 1264 × 648, food on the right. Tall: about 720 × 1224, food in the lower half. Keep each under 3 MB.",
          },
        ),
      ],
      { key: "home.hero" },
    ),
    group("Menu section", [text("title", "Heading"), para("lead", "Introduction", { rows: 2 }), text("link", "Link to the full menu")], {
      key: "home.services",
      hint: "A small tile for each menu section follows, opening the full menu on that section.",
    }),
    group("Dough to door", [text("title", "Heading"), para("lead", "Introduction", { rows: 2 })], {
      key: "howWeWork",
      hint: "The four steps are under Trust & process.",
    }),
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
    group(
      "Reviews section",
      [
        text("title", "Heading"),
        para("lead", "Introduction", { rows: 2, tokens: ["praise"], hint: "{praise} becomes the list of things customers praise." }),
        text("readAll", "Link to Google reviews"),
      ],
      {
        key: "reviews",
      },
    ),
    group("Delivery areas section", [text("title", "Heading"), para("lead", "Introduction", { rows: 2 })], { key: "home.areas" }),
    text("home.faqTitle", "FAQ heading", { hint: "The questions are under FAQs." }),
  ],
};

export const servicesPages: Section = {
  id: "pages-services",
  group: "Pages",
  title: "Menu pages",
  icon: UtensilsCrossed,
  description:
    "The full menu page and its search, sorting and Veg / Non-veg switches, the labels used on every menu, and the headings each menu section page shares. The dishes themselves are under Menu.",
  path: "copy",
  // The shared headings are easiest to check on a menu section page.
  preview: firstService,
  fields: [
    hero("servicesPage.hero"),
    group("Full menu page", [text("listTitle", "Heading"), para("listLead", "Introduction", { rows: 2 })], { key: "servicesPage" }),
    group(
      "Menu labels",
      [
        para("sizeNote", "Note above the dishes", { rows: 2 }),
        text("vegLabel", "Veg mark name"),
        text("nonVegLabel", "Non-veg mark name"),
        text("eitherLabel", "Veg or non-veg mark name"),
        text("vegSwitch", "Veg switch"),
        text("nonVegSwitch", "Non-veg switch"),
        text("dietLabel", "The two switches (for screen readers)"),
        text("searchLabel", "Search box (for screen readers)"),
        text("searchPlaceholder", "Search box example"),
        text("clearSearch", "Clear the search (for screen readers)"),
        text("sortLabel", "Sort label"),
        text("sortMenu", "Sort: menu order"),
        text("sortPriceLow", "Sort: cheapest first"),
        text("sortPriceHigh", "Sort: dearest first"),
        text("sortName", "Sort: by name"),
        text("allLabel", '"All sections" tab'),
        text("results", "Number of dishes shown", { tokens: ["shown", "total"] }),
        text("dishCount", "Dishes on the home page tiles", { tokens: ["count"] }),
        para("noResults", "When nothing matches", { rows: 2 }),
        text("clearFilters", "Clear filters button"),
        text("jumpLabel", "Section tabs (for screen readers)"),
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
  fields: [
    text("eyebrow", "Small line above the heading"),
    text("title", "Heading"),
    para("lead", "Introduction", { rows: 2 }),
    text("popularTitle", "Links heading"),
  ],
};

export const cartPage: Section = {
  id: "pages-cart",
  group: "Pages",
  title: "Cart",
  icon: ShoppingBag,
  description:
    "The cart: the add buttons on the menu, the cart button in the header, the note after adding, and the /cart/ page. Customers tap a price on the menu to add a dish, then send the whole cart on WhatsApp with their details (the form labels are under Navigation, footer & buttons → Order form).",
  path: "copy.cart",
  preview: "/cart/",
  fields: [
    hero("hero", false),
    group(
      "On the menu and in the header",
      [
        text("addLabel", "Add button (for screen readers)", {
          tokens: ["item"],
          hint: "Each price on the menu is an add button. {item} = the dish, its size and price.",
        }),
        text("added", "Note after adding", { hint: "Followed by the dish and its size." }),
        text("viewCart", "Link in that note"),
        text("buttonLabel", "Cart button (for screen readers)", { tokens: ["items"] }),
        text("item", "One thing"),
        text("items", "More than one", { tokens: ["count"] }),
        text("builderAdd", "Button on the pizza builder"),
        text("builtName", "A pizza from the builder, in the cart"),
      ],
      { columns: 2 },
    ),
    group(
      "The cart page",
      [
        text("listTitle", "Heading above the list"),
        text("totalLabel", "Total label", { hint: "Also used in the WhatsApp message." }),
        para("totalNote", "Line under the total", { rows: 2 }),
        text("detailsTitle", "Heading above the form"),
        text("less", "Minus button (for screen readers)", { tokens: ["item"] }),
        text("more", "Plus button (for screen readers)", { tokens: ["item"] }),
        text("remove", "Remove button (for screen readers)", { tokens: ["item"] }),
        text("clear", "Empty the cart"),
        text("clearConfirm", "Empty the cart: are you sure"),
        text("clearKeep", "Empty the cart: keep it"),
        text("newOrder", "After sending: start again"),
      ],
      { columns: 2 },
    ),
    group(
      "When the cart is empty",
      [text("emptyTitle", "Heading"), para("emptyText", "Text", { rows: 2 }), text("menuButton", "Menu button"), text("builderButton", "Builder button")],
      {
        columns: 2,
      },
    ),
    group("Reminder above the order form on other pages", [text("formBanner", "Text", { tokens: ["items"] }), text("formBannerLink", "Link")], { columns: 2 }),
    group(
      "Extras",
      [
        text("extrasButton", "Button on a cart line"),
        text("extrasEdit", "Button once extras are chosen"),
        text("extrasTitle", "Panel heading", { tokens: ["item"] }),
        para("extrasLead", "Panel introduction", { rows: 2 }),
        text("extrasForAll", "When the line has more than one", { tokens: ["qty"] }),
        text("crustLegend", "Crust heading"),
        text("cheeseLegend", "Cheese heading"),
        text("toppingsLegend", "Toppings heading"),
        text("toppingsHint", "Toppings limit", { tokens: ["max"] }),
        text("addOnsLegend", "Add-ons heading"),
        text("noCharge", "Free choice"),
        text("extrasEach", "Before the price of one"),
        text("save", "Save button"),
        text("cancel", "Cancel button"),
      ],
      {
        columns: 2,
        collapsed: true,
        hint: "Prices come from the pizza builder (crust, cheese, toppings) and each menu section's Add-ons list (dips …).",
      },
    ),
  ],
};

export const searchPanel: Section = {
  id: "pages-search",
  group: "Pages",
  title: "Site search",
  icon: Search,
  description:
    "The search button in the header (on a computer, / or Ctrl+K opens it too). It finds dishes, menu sections, pages, blog posts, delivery areas, jobs, questions and policies from the rest of the content, and copes with spelling slips and prices (“paneer under 200”), so there is nothing to add for new dishes or posts. This is only its wording, and the popular searches shown before anything is typed.",
  path: "copy.search",
  preview: "/",
  fields: [
    group(
      "The search box",
      [
        text("button", "Header button (for screen readers)"),
        text("title", "Panel heading (for screen readers)"),
        text("placeholder", "Text in the empty box"),
        text("clear", "Clear button (for screen readers)"),
        text("close", "Close button"),
      ],
      { columns: 2 },
    ),
    group("Before anything is typed", [
      text("suggestionsTitle", "Heading"),
      strings("suggestions", "Popular searches", { itemLabel: "search", max: 12, hint: "A tap searches for it. Prices work too, e.g. Chicken under ₹250." }),
    ]),
    group(
      "Quick answers",
      [
        text("hoursTitle", "Opening hours heading"),
        text("phoneTitle", "Phone heading"),
        text("addressTitle", "Address heading"),
        text("deliveryTitle", "Delivery heading"),
        text("deliveryText", "Delivery text", { tokens: ["km", "areas"], hint: "{km} = the delivery radius, {areas} = the delivery areas." }),
      ],
      {
        columns: 2,
        hint: "Shown first when someone searches for timings, the phone number, the address or delivery. The hours, phone and address come from Business details.",
      },
    ),
    group(
      "Results",
      [
        text("results", "Number of results (for screen readers)", { tokens: ["count"] }),
        text("partial", "When not every word was found"),
        text("priceNote", "When a price was typed", { tokens: ["price"] }),
        text("cheapNote", "When “cheap” was typed"),
        text("more", "Link under the dishes", { tokens: ["count"] }),
        text("keysHint", "Keyboard help (computers)"),
      ],
      { columns: 2 },
    ),
    group(
      "Headings of each kind of result",
      [
        text("answer", "Quick answers"),
        text("section", "Menu sections"),
        text("dish", "Dishes"),
        text("page", "Pages"),
        text("area", "Delivery areas"),
        text("post", "Blog posts"),
        text("job", "Jobs"),
        text("faq", "Questions"),
        text("policy", "Policies"),
      ],
      { key: "groups", columns: 2, collapsed: true },
    ),
    group(
      "When nothing is found",
      [
        text("noResults", "Heading", { tokens: ["query"], hint: "{query} = what was typed." }),
        para("noResultsHint", "Tip", { rows: 2 }),
        text("askButton", "WhatsApp button"),
        para("askText", "WhatsApp message", { rows: 2, tokens: ["query"] }),
      ],
      { columns: 2 },
    ),
  ],
};
