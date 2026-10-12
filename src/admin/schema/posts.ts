// The blog and the job openings (blog, jobs in content.json), the text of their pages (copy.blogPage, copy.careersPage),
// and the Offers page (copy.offersPage; its combos are menu sections marked as offers).
import { BadgePercent, Briefcase, BriefcaseBusiness, Newspaper, NotebookPen } from "lucide-react";
import type { SiteContent } from "@/data/types";
import { group, hero, para, photo, seoFields, slugify, strings, text, toggle } from "./helpers";
import { formatHint } from "./legal";
import type { Section } from "./types";

const today = () => new Date().toISOString().slice(0, 10);
const firstPhoto = (c: SiteContent) => Object.keys(c.photos)[0] ?? "";

export const blogPosts: Section = {
  id: "blog",
  group: "Content",
  title: "Blog",
  icon: Newspaper,
  description: "Posts at /blog/, newest first. Each one has its own page. Short, useful posts about the menu do best on Google: sizes, prices, what a dish is, what is new.",
  path: "blog",
  preview: "/blog/",
  fields: [
    {
      kind: "list",
      key: "",
      label: "Posts",
      itemLabel: "post",
      itemTitle: (p) => p.title || "New post",
      itemSubtitle: (p) => `/blog/${p.slug}/ · ${p.date}`,
      itemPhoto: (p) => p.photo,
      preview: (p) => `/blog/${p.slug}/`,
      newItem: (c) => ({
        slug: slugify("new-post", c.blog.map((p) => p.slug)),
        title: "New post",
        excerpt: "",
        category: "News",
        date: today(),
        author: c.business.name,
        photo: firstPhoto(c),
        sections: [{ heading: "", body: "" }],
        seo: { title: "", description: "" },
        placeholder: false,
      }),
      fields: [
        text("title", "Title", { required: true }),
        group(
          "",
          [
            text("slug", "Page address", { mono: true, hint: "Lower-case letters, numbers and dashes. Changing it changes the link, so old links stop working." }),
            text("category", "Label", { hint: "One word above the title, e.g. Guide, Menu, News." }),
            text("date", "Date", { mono: true, placeholder: "2026-10-11", hint: "YYYY-MM-DD. Posts are listed newest first." }),
            text("author", "Written by"),
          ],
          { columns: 2 },
        ),
        para("excerpt", "Summary", { rows: 3, required: true, hint: "One or two sentences, shown in the list of posts and under the title." }),
        photo("photo", "Photo"),
        {
          kind: "list",
          key: "sections",
          label: "The post",
          hint: "One part per heading. The first part can go without a heading.",
          itemLabel: "part",
          min: 1,
          itemTitle: (s, i) => s.heading || (i === 0 ? "Opening" : "Part without a heading"),
          newItem: () => ({ heading: "", body: "" }),
          fields: [text("heading", "Heading"), para("body", "Text", { rows: 10, required: true, hint: formatHint })],
        },
        seoFields(),
        toggle("placeholder", "Sample", 'Shows a "Sample" tag on this post while sample tags are on. Turn off once the owner has checked it.'),
      ],
    },
  ],
};

export const jobOpenings: Section = {
  id: "jobs",
  group: "Content",
  title: "Jobs",
  icon: Briefcase,
  description: "The open jobs on /careers/. Remove a job once it is filled; with none left, the page says so and still takes applications.",
  path: "jobs",
  preview: "/careers/",
  fields: [
    {
      kind: "list",
      key: "",
      label: "Open jobs",
      itemLabel: "job",
      itemTitle: (j) => j.title || "New job",
      itemSubtitle: (j) => [j.type, j.hours].filter(Boolean).join(" · "),
      newItem: (c) => ({
        id: slugify("new-job", c.jobs.map((j) => j.id)),
        title: "New job",
        type: "Full time",
        hours: "",
        pay: "Discussed at the interview",
        summary: "",
        duties: [""],
        needs: [""],
        placeholder: false,
      }),
      fields: [
        group("", [text("title", "Job title", { required: true }), text("type", "Type", { placeholder: "Full time" }), text("hours", "Hours"), text("pay", "Pay")], { columns: 2 }),
        para("summary", "In one or two sentences", { rows: 2, required: true }),
        strings("duties", "What they will do", { itemLabel: "task" }),
        strings("needs", "What you are looking for", { itemLabel: "point" }),
        toggle("placeholder", "Sample", 'Shows a "Sample" tag on this job while sample tags are on.'),
      ],
    },
  ],
};

export const blogPage: Section = {
  id: "pages-blog",
  group: "Pages",
  title: "Blog page",
  icon: NotebookPen,
  description: "The headings and labels on /blog/ and on every post. The posts themselves are under Blog.",
  path: "copy.blogPage",
  preview: "/blog/",
  fields: [
    hero("hero"),
    text("listTitle", "Heading above the posts"),
    group(
      "Labels",
      [
        text("readMore", "Link on each post card"),
        text("readTime", "Reading time", { tokens: ["minutes"] }),
        text("byLabel", 'Before the writer\'s name ("By")'),
        text("moreTitle", "More posts heading"),
      ],
      { columns: 2 },
    ),
    group("Box at the end of each post", [text("orderTitle", "Heading"), para("orderText", "Text", { rows: 2 }), text("menuLink", "Menu button")]),
    text("ctaTitle", "Order band heading"),
  ],
};

export const careersPage: Section = {
  id: "pages-careers",
  group: "Pages",
  title: "Careers page",
  icon: BriefcaseBusiness,
  description: "Everything on /careers/ except the jobs themselves (under Jobs). Applications open WhatsApp with the details written out.",
  path: "copy.careersPage",
  preview: "/careers/",
  fields: [
    hero("hero"),
    group("Buttons at the top", [text("jobsButton", "To the jobs"), text("applyWhatsApp", "Apply on WhatsApp")], { columns: 2 }),
    text("perksTitle", "Why work here: heading"),
    {
      kind: "list",
      key: "perks",
      label: "Why work here",
      itemLabel: "reason",
      max: 4,
      itemTitle: (p) => p.title || "New reason",
      newItem: () => ({ title: "", text: "" }),
      fields: [text("title", "Heading", { required: true }), para("text", "Text", { rows: 2 })],
    },
    toggle("perksPlaceholder", "Sample", 'Shows a "Sample" tag next to the reasons while sample tags are on. Turn off once the owner has confirmed them.'),
    group(
      "Jobs",
      [
        text("openingsTitle", "Heading"),
        para("openingsLead", "Introduction", { rows: 2 }),
        text("typeLabel", "Type label"),
        text("hoursLabel", "Hours label"),
        text("payLabel", "Pay label"),
        text("dutiesTitle", "Duties heading"),
        text("needsTitle", "Requirements heading"),
        text("applyButton", "Apply button"),
        para("noOpenings", "When no jobs are open", { rows: 2 }),
      ],
      { columns: 2 },
    ),
    group("Application", [text("formEyebrow", "Small line above"), text("formTitle", "Heading"), para("formLead", "Introduction", { rows: 2 })]),
    group(
      "Application form",
      [
        text("name", "Name label"),
        text("phone", "Phone label"),
        text("role", "Job label"),
        text("rolePlaceholder", "Job: empty choice"),
        text("anyRole", 'Job: "any job" choice'),
        text("experience", "Experience label"),
        text("experiencePlaceholder", "Experience: empty choice"),
        strings("experienceOptions", "Experience choices", { itemLabel: "choice", min: 1 }),
        text("area", "Where they live: label"),
        text("areaPlaceholder", "Where they live: example"),
        text("message", "Note label"),
        text("messagePlaceholder", "Note example"),
        text("submit", "Send button"),
        text("submitNote", "Line under the button"),
        para("privacyNote", "Privacy line under the button", { rows: 2, hint: "[Words](/privacy-policy/) makes a link. Keep a link to the privacy policy here." }),
        text("successTitle", "After sending: heading"),
        para("successText", "After sending: text", { rows: 2, hint: "Put **two stars** around words to make them bold." }),
        text("reopen", "After sending: open WhatsApp again"),
        text("edit", "After sending: edit link"),
      ],
      { key: "form", columns: 2, collapsed: true },
    ),
    text("ctaTitle", "Order band heading"),
  ],
};

const offerOptions = (c: SiteContent) => c.services.filter((s) => s.offer).map((s) => ({ value: s.slug, label: s.name || s.slug }));

export const offersPage: Section = {
  id: "pages-offers",
  group: "Pages",
  title: "Offers page",
  icon: BadgePercent,
  description:
    "The combo offers at /offers/, the offers band on the home page and the link in the thin bar above the header. The combos themselves, with their prices, are menu sections marked “Combo offers” (Content → Menu).",
  path: "copy.offersPage",
  preview: "/offers/",
  fields: [
    hero("hero"),
    text("note", "Note above the combos", { hint: "e.g. about GST. Leave empty for none." }),
    group(
      "Around the combos",
      [
        text("sectionLink", "Link to each kind of combo's own page", { tokens: ["section"] }),
        text("jumpLabel", "Row of links at the top (for screen readers)"),
        text("ctaTitle", "Heading of the order band at the foot"),
        text("barLink", "Link in the top bar", { hint: "On tablets and computers, above the header, on every page." }),
      ],
      { columns: 2 },
    ),
    group(
      "Band on the home page",
      [
        text("eyebrow", "Small line above the heading"),
        text("title", "Heading"),
        text("titleAccent", "Heading, words in yellow"),
        para("lead", "Text", { rows: 2 }),
        text("button", "Button to the Offers page"),
        { kind: "select", key: "section", label: "Combos shown in the band", options: offerOptions },
      ],
      { key: "band", columns: 2 },
    ),
  ],
};
