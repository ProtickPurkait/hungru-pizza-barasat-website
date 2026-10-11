// Shapes of the site content in src/data/content.json (edited through the admin panel at /admin/).
//
// Two names are kept from the template the site was built on:
//   "services" are the menu sections (veg pizzas, chicken pizzas …), each with its own page at /menu/<slug>/.
//   "projects" are the gallery photos at /gallery/.

export interface Photo {
  /** An Unsplash photo id ("1665033628673-7de125eb6b12") or a local path ("/images/uploads/hungru-logo.webp"). */
  src: string;
  alt: string;
  /** Pixel size, recorded on upload. Lets the logo hold its space before the file loads. */
  width?: number;
  height?: number;
}

export interface Faq {
  q: string;
  a: string;
}

export interface PageSeo {
  /** Page title without the brand. " | Hungru Pizza" is added automatically. */
  title: string;
  description: string;
}

export type IconKey = "pizza" | "leaf" | "drumstick" | "smile" | "popcorn" | "burger" | "drink" | "dessert";

/** What a gallery photo shows. Menu sections point at one, so their pages can show matching photos. */
export type ProjectCategory = "veg" | "chicken" | "kids" | "snacks" | "drinks" | "cafe";

/** The Indian food mark shown next to each dish. "either" = can be made veg or non-veg. */
export type Diet = "veg" | "non-veg" | "either";

/** One size of a dish and its price, e.g. "8 inch" ₹139, "4 pcs" ₹149. */
export interface MenuPrice {
  /** Size, portion or style shown above the price. "" when the dish has only one price. */
  size: string;
  /** Rupees, including GST. */
  price: number;
}

export interface MenuItem {
  name: string;
  description: string;
  /** One price, or one per size (smallest first). */
  prices: MenuPrice[];
  diet: Diet;
  /** Optional short tag, e.g. "Bestseller", "Spicy", "New". "" for none. */
  tag: string;
}

export interface Material {
  name: string;
  note: string;
}

/** A menu section, with its own page at /menu/<slug>/. */
export interface Service {
  slug: string;
  name: string;
  shortName: string;
  icon: IconKey;
  category: ProjectCategory;
  tagline: string;
  summary: string;
  intro: string[];
  heroPhoto: string;
  idealFor: string[];
  /** Short line above the dishes, e.g. slices per size or the price of a dip. "" for none. */
  note: string;
  items: MenuItem[];
  /** "What goes in": the ingredients this section is built on. */
  materials: Material[];
  gallery: string[];
  faqs: Faq[];
  seo: PageSeo;
}

export interface Locality {
  slug: string;
  name: string;
}

/** A delivery area page at /delivery/<slug>/. */
export interface AreaPage {
  slug: string;
  name: string;
  /** Photo at the top of the page. */
  photo: string;
  heading: string;
  lead: string;
  intro: string[];
  localNotes: { title: string; items: string[] };
  landmarks: string[];
  services: string[];
  faqs: Faq[];
  seo: PageSeo;
}

/** A gallery photo. */
export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  photo: string;
  summary: string;
}

export interface Review {
  name: string;
  locality: string;
  /** What they ordered. */
  service: string;
  rating: number;
  text: string;
  placeholder: boolean;
}

export interface Step {
  title: string;
  text: string;
}

export interface Stat {
  value: string;
  label: string;
  placeholder?: boolean;
}

export interface BuilderOption {
  id: string;
  label: string;
  note: string;
  /** Rupees added to a regular-size pizza (for a size: the price of the plain pizza). 0 = included. */
  price: number;
  /** Rupees added to a large pizza. Not used for sizes. */
  priceLarge: number;
}

export interface BuilderSize extends Omit<BuilderOption, "priceLarge"> {
  /** Use the large-size price of every crust, cheese and topping. */
  large: boolean;
}

/**
 * The pizza builder at /build-your-pizza/. Price = size + crust + cheese + toppings,
 * each extra at its regular or large price depending on the size.
 */
export interface BuilderConfig {
  sizes: BuilderSize[];
  /** Crusts (cheese burst …). */
  bases: BuilderOption[];
  cheeses: BuilderOption[];
  toppings: (BuilderOption & { diet: "veg" | "non-veg" })[];
  maxToppings: number;
  maxQuantity: number;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
}

/** An ingredient and where it comes from (About page). */
export interface Brand {
  name: string;
  type: string;
}

export interface BusinessLogo {
  /** Photo key of the uploaded logo. "" = the built-in slice mark with the business name. */
  image: string;
  /** Optional light version for the dark footer. "" = the main logo on a white panel there. */
  imageDark: string;
  /** Optional square icon for the browser tab and phone home screens. "" = made from the logo (or the built-in icon). */
  icon: string;
  /** Business name as text beside the logo. "auto" hides it for a wide logo (one that has the name in it). */
  name: "auto" | "show" | "hide";
}

export interface Business {
  name: string;
  category: string;
  tagline: string;
  address: { street: string; locality: string; region: string; postalCode: string; country: string; full: string };
  phone: { display: string; tel: string };
  /** Country code + number, digits only, e.g. "919830012345". */
  whatsapp: string;
  hours: { display: string; short: string; opens: string; closes: string };
  rating: { value: number; count: number };
  googleReviewsUrl: string;
  mapsQuery: string;
  siteUrl: string;
  /** Shows small "Sample" tags on placeholder content. */
  demoMode: boolean;
  logo: BusinessLogo;
  /** Food delivery apps the business is on (Zomato, Swiggy …). Shown on the Contact page and in the footer. */
  orderOnline: ExternalLink[];
  /** Social pages (Facebook, Instagram …). Shown in the footer and sent to Google. */
  social: ExternalLink[];
}

export interface ExternalLink {
  label: string;
  url: string;
}

export interface PageSeoMap {
  home: PageSeo;
  services: PageSeo;
  projects: PageSeo;
  builder: PageSeo;
  about: PageSeo;
  contact: PageSeo;
  notFound: PageSeo;
  /** Photo key for link previews on WhatsApp, Facebook etc. */
  shareImage: string;
  /** Business description for Google (structured data). {category} = business category. */
  businessDescription: string;
}

export interface ProjectFilter {
  id: string;
  label: string;
  categories: ProjectCategory[];
}

export interface HeroCopy {
  eyebrow: string;
  title: string;
  lead: string;
  photo?: string;
}

/** One shape of the home page's background video. */
export interface VideoFiles {
  /** The video file, an MP4 that every browser plays ("/video/hungru-hero-wide.mp4"). */
  mp4: string;
  /** Photo key: the video's first frame. Shown while the video loads, and instead of it when motion is switched off. */
  poster: string;
}

/** The looping video behind the home page heading. */
export interface HeroVideo {
  /** For screens 1024px and wider: about 2:1, the food on the right and dark space on the left for the text. */
  wide: VideoFiles;
  /** For phones and tablets: tall, dark space at the top for the text and the food below. */
  tall: VideoFiles;
  /** Small line beside the pause button, e.g. "Food video created with Grok". Empty hides it. */
  credit: string;
  /** Labels of the pause button, for screen readers. */
  pause: string;
  play: string;
}

/**
 * Every heading, paragraph and button label that is not part of a menu section, area or photo.
 * Text in {curly braces} is filled in automatically, e.g. {area} becomes "Ballygunge".
 */
export interface Copy {
  nav: { home: string; services: string; projects: string; builder: string; about: string; contact: string };
  buttons: { call: string; callShort: string; whatsapp: string; whatsappShort: string; whatsappChat: string; seeDetails: string };
  header: { location: string };
  footer: {
    tagline: string;
    blurb: string;
    servicesTitle: string;
    areasTitle: string;
    contactTitle: string;
    /** e.g. "Also on", before the Zomato and Swiggy links. */
    orderOnlineTitle: string;
    /** e.g. "Follow us", before the Facebook link. */
    socialTitle: string;
    credit: string;
  };
  whatsapp: {
    general: string;
    service: string;
    area: string;
    project: string;
    orderStart: string;
    orderEnd: string;
    builderStart: string;
    builderEnd: string;
  };
  ctaBand: { eyebrow: string; title: string; lead: string; points: string[]; talkPrompt: string };
  form: {
    name: string;
    phone: string;
    phonePlaceholder: string;
    area: string;
    areaPlaceholder: string;
    pickup: string;
    when: string;
    whenPlaceholder: string;
    order: string;
    orderPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    menuNote: string;
    submit: string;
    submitNote: string;
    /** Under the button. [Words](/privacy-policy/) makes a link. */
    privacyNote: string;
    successTitle: string;
    successText: string;
    reopen: string;
    orCall: string;
    edit: string;
  };
  home: {
    hero: HeroCopy & { titleAccent: string; titleLine2: string; promises: string[]; video: HeroVideo };
    services: { title: string; lead: string; link: string };
    projects: { title: string; lead: string; link: string; filters: string[]; count: number };
    areas: { title: string; lead: string };
    faqTitle: string;
  };
  howWeWork: { title: string; lead: string };
  builderTeaser: {
    eyebrow: string;
    title: string;
    lead: string;
    button: string;
    /** Link that opens the builder with the example already chosen. */
    exampleLink: string;
    exampleLabel: string;
    example: { size: string; base: string; cheese: string; toppings: string[] };
  };
  reviews: { title: string; lead: string; readAll: string };
  menu: {
    /** Shown above a section's dishes when they come in sizes, e.g. "8 inch = 4 slices". */
    sizeNote: string;
    vegLabel: string;
    nonVegLabel: string;
    eitherLabel: string;
    vegOnly: string;
    showAll: string;
    jumpLabel: string;
    fromLabel: string;
    sectionLink: string;
  };
  servicesPage: { hero: HeroCopy & { photo: string }; listTitle: string; listLead: string };
  servicePage: {
    aboutTitle: string;
    goodFor: string;
    menuTitle: string;
    materialsTitle: string;
    materialsNote: string;
    galleryTitle: string;
    relatedTitle: string;
    faqTitle: string;
    otherTitle: string;
    ctaTitle: string;
  };
  projectsPage: { hero: HeroCopy & { photo: string }; countLabel: string; allFilter: string; lightboxCta: string; ctaTitle: string };
  builderPage: {
    hero: HeroCopy;
    sizeLegend: string;
    baseLegend: string;
    cheeseLegend: string;
    toppingsLegend: string;
    toppingsHint: string;
    quantityLegend: string;
    resultTitle: string;
    noToppings: string;
    disclaimer: string;
    orderButton: string;
    includedNote: string;
    ctaTitle: string;
  };
  areaPage: {
    eyebrow: string;
    workingTitle: string;
    nearLabel: string;
    offeredTitle: string;
    offeredLead: string;
    faqTitle: string;
    alsoTitle: string;
    ctaTitle: string;
    fallbackPhoto: string;
  };
  aboutPage: {
    hero: HeroCopy & { photo: string };
    storyTitle: string;
    storyPhotos: string[];
    teamTitle: string;
    teamLead: string;
    brandsTitle: string;
    praiseTitle: string;
  };
  contactPage: {
    hero: HeroCopy & { photo: string };
    reachTitle: string;
    phoneTitle: string;
    phoneHint: string;
    whatsappTitle: string;
    whatsappHint: string;
    addressTitle: string;
    directions: string;
    hoursTitle: string;
    hoursNote: string;
    /** Card with the delivery app links (Zomato, Swiggy). */
    orderOnlineTitle: string;
    orderOnlineHint: string;
    formEyebrow: string;
    formTitle: string;
    formLead: string;
    mapTitle: string;
    callFirst: string;
  };
  notFound: { eyebrow: string; title: string; lead: string; popularTitle: string };
}

/** One numbered part of a policy, e.g. "Your rights". */
export interface LegalSection {
  heading: string;
  /**
   * Paragraphs separated by an empty line. Lines starting with "- " are bullet points.
   * **Two stars** make words bold and [words](/privacy-policy/) makes a link.
   */
  body: string;
}

/** A policy page at /<slug>/, e.g. /privacy-policy/. */
export interface LegalPage {
  slug: string;
  title: string;
  /** Short name for the footer, e.g. "Privacy". */
  navLabel: string;
  lead: string;
  /** Date of the last change, YYYY-MM-DD. */
  updated: string;
  sections: LegalSection[];
  seo: PageSeo;
}

/**
 * Privacy policy, terms, cookie policy and the other legal pages.
 * Their text can use {business}, {entity}, {address}, {phone}, {whatsapp}, {email}, {officer}, {hours} and {website}.
 */
export interface Legal {
  /** Who runs the site, as named in the policies, and who handles complaints. */
  contact: {
    /** Legal name, e.g. "Hungru Pizza (proprietor: A. Das)". */
    entity: string;
    /** Grievance Officer's name (IT Rules, 2011 and DPDP Act, 2023). */
    officer: string;
    email: string;
    placeholder?: boolean;
  };
  eyebrow: string;
  updatedLabel: string;
  /** Shown at the top of every policy while sample tags are on. */
  demoNote: string;
  contentsTitle: string;
  otherTitle: string;
  contactTitle: string;
  contactLead: string;
  officerLabel: string;
  emailLabel: string;
  phoneLabel: string;
  addressLabel: string;
  pages: LegalPage[];
}

/** Everything in src/data/content.json. The admin panel edits this file. */
export interface SiteContent {
  business: Business;
  pageSeo: PageSeoMap;
  photos: Record<string, Photo>;
  copy: Copy;
  stats: Stat[];
  praise: string[];
  steps: Step[];
  services: Service[];
  localities: Locality[];
  widerArea: string;
  areaPages: AreaPage[];
  projectFilters: ProjectFilter[];
  categoryLabels: Record<ProjectCategory, string>;
  projects: Project[];
  reviews: Review[];
  homeFaqs: Faq[];
  builder: BuilderConfig;
  /** Choices for "When do you want it?" on the order form. */
  whenOptions: string[];
  story: string[];
  team: TeamMember[];
  brands: Brand[];
  warranty: { headline: string; points: string[] };
  legal: Legal;
}
