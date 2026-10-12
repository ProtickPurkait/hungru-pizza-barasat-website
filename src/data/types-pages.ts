// Shapes of the blog, the job openings, the menu finder, the cart, the search and the home video in src/data/content.json.
// Kept apart from types.ts so each file stays short; types.ts re-exports everything here.
import type { HeroCopy, LegalSection, PageSeo } from "./types";

/** A blog post at /blog/<slug>/. */
export interface BlogPost {
  slug: string;
  title: string;
  /** One or two sentences for the list of posts (and Google, when the SEO description is empty). */
  excerpt: string;
  /** Short label above the title, e.g. "Guide". */
  category: string;
  /** Date published, YYYY-MM-DD. */
  date: string;
  author: string;
  photo: string;
  /** The post in parts, each with an optional heading. Same formatting as the policies. */
  sections: LegalSection[];
  seo: PageSeo;
  /** A sample post written for the demo: shows a "Sample" tag while sample tags are on. */
  placeholder: boolean;
}

/** A job on /careers/. */
export interface JobOpening {
  /** Short id, lower-case with dashes. */
  id: string;
  title: string;
  /** e.g. "Full time" */
  type: string;
  /** e.g. "Evening shift, 6 days a week" */
  hours: string;
  /** e.g. "Discussed at the interview" */
  pay: string;
  summary: string;
  duties: string[];
  needs: string[];
  placeholder: boolean;
}

/** Labels of the menu finder on /menu/ and of the menu everywhere else. */
export interface MenuCopy {
  /** Shown above the dishes, e.g. "Prices in rupees". */
  sizeNote: string;
  vegLabel: string;
  nonVegLabel: string;
  eitherLabel: string;
  /** The two switches: "Veg" and "Non-veg". */
  vegSwitch: string;
  nonVegSwitch: string;
  /** For screen readers: the group of two switches. */
  dietLabel: string;
  searchLabel: string;
  searchPlaceholder: string;
  clearSearch: string;
  sortLabel: string;
  sortMenu: string;
  sortPriceLow: string;
  sortPriceHigh: string;
  sortName: string;
  /** The "all sections" tab. */
  allLabel: string;
  /** "{shown} of {total} dishes" */
  results: string;
  /** "{count} dishes", on the home page tiles. */
  dishCount: string;
  noResults: string;
  clearFilters: string;
  jumpLabel: string;
  fromLabel: string;
  sectionLink: string;
}

export interface BlogPageCopy {
  hero: HeroCopy & { photo: string };
  listTitle: string;
  readMore: string;
  /** "{minutes} min read" */
  readTime: string;
  byLabel: string;
  moreTitle: string;
  /** Box at the end of each post. */
  orderTitle: string;
  orderText: string;
  menuLink: string;
  ctaTitle: string;
}

export interface CareersPageCopy {
  hero: HeroCopy & { photo: string };
  /** The two buttons at the top: to the list of jobs, and straight to WhatsApp. */
  jobsButton: string;
  applyWhatsApp: string;
  perksTitle: string;
  perks: { title: string; text: string }[];
  /** The perks are written for the demo: shows a "Sample" tag while sample tags are on. */
  perksPlaceholder: boolean;
  openingsTitle: string;
  openingsLead: string;
  typeLabel: string;
  hoursLabel: string;
  payLabel: string;
  dutiesTitle: string;
  needsTitle: string;
  applyButton: string;
  noOpenings: string;
  formEyebrow: string;
  formTitle: string;
  formLead: string;
  form: {
    name: string;
    phone: string;
    role: string;
    rolePlaceholder: string;
    anyRole: string;
    experience: string;
    experiencePlaceholder: string;
    experienceOptions: string[];
    area: string;
    areaPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    submit: string;
    submitNote: string;
    /** Under the button. [Words](/privacy-policy/) makes a link. */
    privacyNote: string;
    successTitle: string;
    successText: string;
    reopen: string;
    edit: string;
  };
  ctaTitle: string;
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
  /** Small line in the corner of the video, e.g. "Food video created with Grok". Empty hides it. */
  credit: string;
  /** Labels of the pause button, which only shows when reached with the keyboard. */
  pause: string;
  play: string;
}

/** The cart: its button in the header, the add buttons on the menu, the "added" note and the /cart/ page. */
export interface CartCopy {
  /** Header button, for screen readers. {items} = "1 item" / "3 items". */
  buttonLabel: string;
  /** "1 item". */
  item: string;
  /** "{count} items". */
  items: string;
  /** Each price on the menu is an add button. For screen readers; {item} = "Tandoori Paneer, 8 inch, ₹210". */
  addLabel: string;
  /** The note after adding, before what was added. */
  added: string;
  viewCart: string;
  /** Button on the pizza builder. */
  builderAdd: string;
  /** A pizza from the builder, as it is named in the cart and the order message. */
  builtName: string;
  hero: Omit<HeroCopy, "photo">;
  emptyTitle: string;
  emptyText: string;
  menuButton: string;
  builderButton: string;
  /** The list of what is in the cart. */
  listTitle: string;
  /** Quantity buttons and the remove button, for screen readers. {item} = the dish. */
  less: string;
  more: string;
  remove: string;
  clear: string;
  /** Asked after "Empty the cart", so one stray tap never loses an order. */
  clearConfirm: string;
  clearKeep: string;
  /** "Items total", on the page and in the order message. */
  totalLabel: string;
  totalNote: string;
  detailsTitle: string;
  /** Above the order form on other pages while the cart has something in it. {items} = "3 items". */
  formBanner: string;
  formBannerLink: string;
  /** After sending: empties the cart. */
  newOrder: string;
  /** Extras on a cart line: the button (before and after choosing some) and the panel. {item} = the dish. */
  extrasButton: string;
  extrasEdit: string;
  extrasTitle: string;
  extrasLead: string;
  /** {qty}: the change applies to every one on the line. */
  extrasForAll: string;
  crustLegend: string;
  cheeseLegend: string;
  toppingsLegend: string;
  /** {max} = most toppings. */
  toppingsHint: string;
  addOnsLegend: string;
  noCharge: string;
  /** Before the price of one with the extras. */
  extrasEach: string;
  save: string;
  cancel: string;
}

/** An extra any dish in a menu section can have, at one price (a dip with a starter). */
export interface MenuAddOn {
  id: string;
  label: string;
  price: number;
}

/** The delivery radius in the order form: the note, the distance check and its messages. */
export interface DeliveryCopy {
  /** Under "Deliver to". {km} = the delivery radius. */
  note: string;
  /** The last choice in "Deliver to", for places not in the list. {km}. */
  otherArea: string;
  /** Shown when that choice is picked, above the button. {km}. */
  checkPrompt: string;
  checkButton: string;
  checking: string;
  /** {distance} = how far, e.g. "3.4". */
  inRange: string;
  /** {distance}, {km}. */
  outOfRange: string;
  /** The phone could not find where it is (location off, no signal). */
  failed: string;
  /** Location refused for this site: how to allow it. */
  blocked: string;
  pickupButton: string;
  /** Errors when sending without a check, or from too far. {km}. */
  needCheck: string;
  tooFar: string;
  /** How that choice reads in the WhatsApp message. {distance}. */
  otherInMessage: string;
  /** Label of the map link in the WhatsApp message. */
  locationLabel: string;
}

/** The search in the header: its button, the search panel and its results. */
export interface SearchCopy {
  /** The header button, for screen readers. */
  button: string;
  /** Heading of the panel, for screen readers. */
  title: string;
  placeholder: string;
  clear: string;
  close: string;
  suggestionsTitle: string;
  /** Shown before anything is typed; a tap searches for it. */
  suggestions: string[];
  /** For screen readers. {count}. */
  results: string;
  /** {query} = what was typed. */
  noResults: string;
  noResultsHint: string;
  askButton: string;
  /** The WhatsApp message from that button. {query}. */
  askText: string;
  /** Shown when only some of the words were found. */
  partial: string;
  /** When a price was typed. {price} = "₹200". */
  priceNote: string;
  /** When "cheap" was typed. */
  cheapNote: string;
  /** Link under the dishes when there are more. {count}. */
  more: string;
  /** Headings of the kinds of results. */
  groups: { answer: string; section: string; page: string; dish: string; area: string; post: string; job: string; faq: string; policy: string };
  /** Quick answers: their headings, and the delivery one's text ({km}, {areas}). */
  hoursTitle: string;
  phoneTitle: string;
  addressTitle: string;
  deliveryTitle: string;
  deliveryText: string;
  /** Keyboard help at the foot of the panel, on computers. */
  keysHint: string;
}
