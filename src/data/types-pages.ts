// Shapes of the blog, the job openings, the menu finder and the home video in src/data/content.json.
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
  /** Small line beside the pause button, e.g. "Food video created with Grok". Empty hides it. */
  credit: string;
  /** Labels of the pause button, for screen readers. */
  pause: string;
  play: string;
}
