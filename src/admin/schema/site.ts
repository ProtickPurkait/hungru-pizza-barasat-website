// Business details, site-wide text (menu, buttons, footer, form, WhatsApp messages) and Google settings.
import { Building2, Clock, Globe, History, Images, MessageSquareText } from "lucide-react";
import { group, num, para, photo, strings, text, toggle } from "./helpers";
import type { Field, Section } from "./types";

/** A list of outside links: a name and an https:// address. */
const linkList = (key: string, label: string, hint: string): Field => ({
  kind: "list",
  key,
  label,
  hint,
  itemLabel: "link",
  itemTitle: (l) => l.label || "New link",
  itemSubtitle: (l) => l.url,
  newItem: () => ({ label: "", url: "https://" }),
  fields: [text("label", "Name", { placeholder: "Zomato" }), text("url", "Address", { mono: true, placeholder: "https://" })],
});

export const business: Section = {
  id: "business",
  group: "Business",
  title: "Business details",
  icon: Building2,
  description: "Name, phone, WhatsApp, address, hours and Google rating. Used on every page and in Google's business listing.",
  path: "business",
  preview: "/contact/",
  fields: [
    group("Name", [
      text("name", "Business name", {
        required: true,
        hint: "Exactly as customers should see it. With no logo, the first two words are shown large and the rest small.",
      }),
      text("category", "What you do", { hint: "One line, e.g. Pizza café. Also used for Google." }),
      text("tagline", "Short tagline"),
    ]),
    group(
      "Logo",
      [
        {
          kind: "logo",
          key: "image",
          label: "Logo",
          hint: "A PNG with a see-through background looks best. Any shape works: empty space around it is cut off, and it is sized to fit the header, the footer and phone screens. With no logo, the site shows the built-in mark with the business name.",
        },
        {
          kind: "logo",
          key: "imageDark",
          label: "Light version for dark backgrounds (optional)",
          hint: "Only if your logo has a white or light version. It is used in the dark footer and, in dark mode, in the header. Without one, the footer shows your logo on a white panel, so a dark logo never disappears.",
          variant: "dark",
        },
        {
          kind: "logo",
          key: "icon",
          label: "Browser tab icon (optional)",
          hint: "The small icon in the browser tab, in Google results and on phone home screens. It is made from your logo automatically. A wide logo is tiny there, so for a clear icon upload a square one: just the symbol or the initials.",
          variant: "icon",
        },
        {
          kind: "select",
          key: "name",
          label: "Business name next to the logo",
          options: [
            { value: "auto", label: "Automatic: hidden when the logo is wide (it usually has the name in it)" },
            { value: "show", label: "Always show the name next to the logo" },
            { value: "hide", label: "Logo only" },
          ],
        },
      ],
      { key: "logo" },
    ),
    group(
      "Phone and WhatsApp",
      [
        text("phone.display", "Phone number as shown", { placeholder: "098300 12345" }),
        text("phone.tel", "Phone number for calls", {
          mono: true,
          placeholder: "+919830012345",
          hint: "With + and country code, no spaces. Used by the Call buttons.",
        }),
        text("whatsapp", "WhatsApp number", {
          mono: true,
          placeholder: "919830012345",
          hint: "Country code and number, digits only (no + or spaces). Every WhatsApp button opens a chat with this number.",
        }),
      ],
      { columns: 1 },
    ),
    group(
      "Address",
      [
        text("street", "Street"),
        text("locality", "City"),
        text("region", "State"),
        text("postalCode", "PIN code", { mono: true }),
        text("full", "Full address as shown", { hint: "Shown on the contact page and in the footer." }),
      ],
      { key: "address", columns: 2 },
    ),
    text("mapsQuery", "Address for Google Maps", { hint: "What the map and the Get directions button search for." }),
    group(
      "Map position and delivery",
      [
        num("lat", "Latitude", {
          step: 0.00001,
          hint: "In Google Maps, press and hold on the café (right-click on a computer): the first of the two numbers that appear, e.g. 22.72316.",
        }),
        num("lng", "Longitude", { step: 0.00001, hint: "The second number, e.g. 88.47847." }),
      ],
      { key: "geo", columns: 2, hint: "The middle of the delivery circle. Also sent to Google, so the café shows in the right spot." },
    ),
    num("deliveryKm", "Delivery radius", {
      min: 1,
      max: 30,
      step: 0.5,
      suffix: "km",
      hint: "Delivery only within this distance of the café, in a straight line. Areas outside it drop out of the order form's list; for other places, customers check their distance with their phone's location.",
    }),
    group(
      "Opening hours",
      [
        text("display", "Hours as shown", { placeholder: "Open every day, 12 noon to 11 pm" }),
        text("short", "Short version", { placeholder: "12 noon to 11 pm, all 7 days" }),
        text("opens", "Opens at (24-hour)", { mono: true, placeholder: "12:00", hint: "For Google. Every day of the week." }),
        text("closes", "Closes at (24-hour)", { mono: true, placeholder: "23:00" }),
      ],
      { key: "hours", columns: 2 },
    ),
    group(
      "Google rating",
      [
        num("rating.value", "Rating", { min: 0, max: 5, step: 0.1, suffix: "★" }),
        num("rating.count", "Number of reviews", { min: 0, step: 1 }),
        text("googleReviewsUrl", "Link to your Google reviews", { mono: true, hint: "Paste the link from your Google Business Profile." }),
      ],
      { columns: 2 },
    ),
    linkList("orderOnline", "Order online", "Food delivery apps you are on, e.g. Zomato and Swiggy. Shown on the Contact page and in the footer."),
    linkList("social", "Social pages", "e.g. Facebook, Instagram. Shown in the footer and sent to Google."),
    group("Website", [
      text("siteUrl", "Website address", {
        mono: true,
        placeholder: "https://www.example.com",
        hint: "The real domain. Used for Google, the sitemap and link previews.",
      }),
      toggle("demoMode", 'Show "Sample" tags', "Small tags on sample photos, delivery details, team and story. Turn off once real details are in."),
    ]),
  ],
};

export const sitewide: Section = {
  id: "sitewide",
  group: "Pages",
  title: "Navigation, footer & buttons",
  icon: MessageSquareText,
  description: "Text that appears on every page: the navigation, button labels, the order band and form, the footer, and the WhatsApp messages customers send.",
  path: "copy",
  preview: "/",
  fields: [
    group(
      "Navigation",
      [
        text("home", "Home"),
        text("services", "Menu"),
        text("offers", "Offers"),
        text("projects", "Gallery"),
        text("builder", "Build a pizza"),
        text("blog", "Blog"),
        text("careers", "Careers"),
        text("about", "About"),
        text("contact", "Contact"),
      ],
      { key: "nav", columns: 2 },
    ),
    text("theme.label", "Light / dark switch (for screen readers)", { hint: "The name of the sun and moon switch in the header, read out by screen readers." }),
    text("header.location", "Location in the top bar"),
    group(
      "Buttons",
      [
        text("call", "Call button"),
        text("callShort", "Call button (short, next to the number)"),
        text("whatsapp", "WhatsApp button"),
        text("whatsappShort", "WhatsApp (phone bar)"),
        text("whatsappChat", "Floating WhatsApp button"),
        text("seeDetails", "Menu card link"),
      ],
      { key: "buttons", columns: 2 },
    ),
    group(
      "Order band (end of every page)",
      [
        text("eyebrow", "Small line above"),
        text("title", "Heading", { hint: "Some pages use their own heading here (set on those pages)." }),
        para("lead", "Introduction", { rows: 2 }),
        strings("points", "Ticked points", { itemLabel: "point" }),
        text("talkPrompt", "Line above the phone number"),
      ],
      { key: "ctaBand" },
    ),
    group(
      "Order form",
      [
        text("name", "Name label"),
        text("phone", "Phone label"),
        text("phonePlaceholder", "Phone example"),
        text("area", "Area label"),
        text("areaPlaceholder", "Area: empty choice"),
        text("pickup", "Area: pickup choice"),
        text("when", "When label"),
        text("whenPlaceholder", "When: empty choice"),
        text("order", "Order label"),
        text("orderPlaceholder", "Order example"),
        text("message", "Note label"),
        text("messagePlaceholder", "Note example"),
        text("menuNote", "Tip above the button"),
        text("submit", "Send button"),
        text("submitNote", "Line under the button"),
        para("privacyNote", "Privacy line under the button", {
          rows: 2,
          hint: "[Words](/privacy-policy/) makes a link. Keep a link to the privacy policy here: Indian privacy law asks you to say how details are used where you ask for them.",
        }),
        text("successTitle", "After sending: heading"),
        para("successText", "After sending: text", { rows: 3, tokens: ["hours"], hint: "Put **two stars** around words to make them bold." }),
        text("reopen", "After sending: open WhatsApp again"),
        text("orCall", "After sending: call button", { tokens: ["phone"] }),
        text("edit", "After sending: edit link"),
      ],
      { key: "form", columns: 2, collapsed: true },
    ),
    group(
      "Delivery radius in the order form",
      [
        text("note", "Line under Deliver to", { tokens: ["km"] }),
        text("otherArea", "Choice for places not in the list", { tokens: ["km"] }),
        para("checkPrompt", "When that is chosen", { rows: 2, tokens: ["km"] }),
        text("checkButton", "Check button"),
        text("checking", "While checking"),
        para("inRange", "Close enough", { rows: 2, tokens: ["distance"] }),
        para("outOfRange", "Too far", { rows: 2, tokens: ["distance", "km"] }),
        text("pickupButton", "Too far: pickup button"),
        para("failed", "Location not found", { rows: 2 }),
        para("blocked", "Location not allowed", { rows: 2 }),
        text("needCheck", "Error: not checked yet"),
        text("tooFar", "Error: too far", { tokens: ["km"] }),
        text("otherInMessage", "In the WhatsApp message", { tokens: ["distance"] }),
        text("locationLabel", "Map link label in the WhatsApp message"),
      ],
      { key: "delivery", columns: 2, collapsed: true, hint: "The radius itself is under Business details → Delivery radius." },
    ),

    group(
      "Footer",
      [
        text("tagline", "Small line under the logo"),
        para("blurb", "Short description", { rows: 2 }),
        text("servicesTitle", "Menu column heading"),
        text("areasTitle", "Delivery areas column heading"),
        text("contactTitle", "Contact column heading"),
        text("orderOnlineTitle", "Label before the delivery apps"),
        text("socialTitle", "Label before the social pages"),
        text("credit", "Credit line", { hint: "Leave empty to remove it." }),
      ],
      { key: "footer", columns: 2 },
    ),
    group(
      "WhatsApp messages",
      [
        para("general", "From any WhatsApp button", { rows: 2, tokens: ["business"] }),
        para("service", "From a menu section page", { rows: 2, tokens: ["business", "service"], hint: "{service} becomes the section's short name." }),
        para("area", "From a delivery area page", { rows: 2, tokens: ["business", "area"] }),
        para("project", "From a dish or a gallery photo", { rows: 2, tokens: ["business", "project"], hint: "{project} becomes the dish or photo name." }),
        para("orderStart", "Order form: first line", {
          rows: 2,
          tokens: ["business"],
          hint: "The customer's order is added below it. *One star* on each side makes text bold in WhatsApp.",
        }),
        para("orderEnd", "Order form: last line", { rows: 2 }),
        para("builderStart", "Pizza builder: first line", { rows: 2, tokens: ["business"] }),
        para("builderEnd", "Pizza builder: last line", { rows: 2 }),
        para("applyStart", "Job application: first line", { rows: 2, tokens: ["business"], hint: "The applicant's details are added below it." }),
        para("applyEnd", "Job application: last line", { rows: 2 }),
      ],
      { key: "whatsapp", collapsed: true, hint: "The text that is already typed in when a customer opens WhatsApp from the site." },
    ),
  ],
};

export const orderChoices: Section = {
  id: "order-choices",
  group: "Pages",
  title: "Order form choices",
  icon: Clock,
  description: 'The choices under "When do you want it?" on the order form. The delivery areas are under Delivery areas.',
  path: "",
  preview: "/contact/",
  fields: [strings("whenOptions", 'Choices for "When do you want it?"', { itemLabel: "choice", min: 1 })],
};

export const seo: Section = {
  id: "seo",
  group: "Media & Google",
  title: "Google & link previews",
  icon: Globe,
  description:
    "How the main pages appear in Google, and the picture shown when someone shares a link on WhatsApp or Facebook. Menu section and delivery area pages have their own settings.",
  path: "pageSeo",
  preview: "/",
  fields: [
    group("Home page", [text("title", "Page title", { max: 60 }), para("description", "Description", { max: 160, rows: 3 })], { key: "home" }),
    group("Full menu page", [text("title", "Page title", { max: 60 }), para("description", "Description", { max: 160, rows: 3 })], { key: "services" }),
    group("Offers page", [text("title", "Page title", { max: 60 }), para("description", "Description", { max: 160, rows: 3 })], { key: "offers" }),
    group("Gallery page", [text("title", "Page title", { max: 60 }), para("description", "Description", { max: 160, rows: 3 })], { key: "projects" }),
    group("Pizza builder page", [text("title", "Page title", { max: 60 }), para("description", "Description", { max: 160, rows: 3 })], { key: "builder" }),
    group("Blog page", [text("title", "Page title", { max: 60 }), para("description", "Description", { max: 160, rows: 3 })], {
      key: "blog",
      hint: "Each post has its own title and description (Blog).",
    }),
    group("Careers page", [text("title", "Page title", { max: 60 }), para("description", "Description", { max: 160, rows: 3 })], { key: "careers" }),
    group("Cart page", [text("title", "Page title", { max: 60 }), para("description", "Description", { max: 160, rows: 3 })], {
      key: "cart",
      collapsed: true,
      hint: "Kept out of Google. Shown in the browser tab and when the link is shared.",
    }),
    group("About page", [text("title", "Page title", { max: 60 }), para("description", "Description", { max: 160, rows: 3 })], { key: "about" }),
    group("Contact page", [text("title", "Page title", { max: 60 }), para("description", "Description", { max: 160, rows: 3 })], { key: "contact" }),
    group("Page not found", [text("title", "Page title", { max: 60 }), para("description", "Description", { max: 160, rows: 3 })], {
      key: "notFound",
      collapsed: true,
    }),
    photo("shareImage", "Link preview picture", "Shown when a link to the site is shared, unless the page has its own photo."),
    para("businessDescription", "Business description for Google", { rows: 3, tokens: ["category"] }),
  ],
};

export const photos: Section = {
  id: "photos",
  group: "Media & Google",
  title: "Photo library",
  icon: Images,
  description: "Every photo on the site. Upload your own, replace a sample, or fix a description. Photos are made smaller automatically before uploading.",
  path: "photos",
  preview: "/gallery/",
  custom: "photos",
};

export const history: Section = {
  id: "history",
  group: "Media & Google",
  title: "Publish history",
  icon: History,
  description: "Every published version of the site. Open an older one in the editor to undo a mistake, then publish it again.",
  path: "",
  preview: "/",
  custom: "history",
};
