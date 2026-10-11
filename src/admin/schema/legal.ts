// Privacy policy, terms and the other legal pages (legal.* in content.json).
import { Scale } from "lucide-react";
import type { SiteContent } from "@/data/types";
import { group, para, seoFields, slugify, text, toggle } from "./helpers";
import type { Section } from "./types";

/** Placeholders every policy text can use. LegalPage.tsx fills them in. */
const TOKENS = ["business", "entity", "officer", "email", "address", "phone", "whatsapp", "hours", "website"];

const formatHint =
  'Leave an empty line between paragraphs. Start a line with "- " for a bullet point. **Two stars** make words bold. [Words](/contact/) makes a link: a page address ending in /, or https://…, mailto:… or tel:….';

const today = () => new Date().toISOString().slice(0, 10);

export const legalPages: Section = {
  id: "legal",
  group: "Pages",
  title: "Policies & terms",
  icon: Scale,
  description:
    "Privacy policy, terms and conditions, cookie, cache and refund policies, and the disclaimer, linked from the footer of every page. The text is written for Indian law (DPDP Act 2023, IT Act 2000, Consumer Protection Act 2019), but it is a starting point: have a lawyer check it before the site goes live, and change the date whenever you change a policy.",
  path: "legal",
  preview: (c: SiteContent) => (c.legal.pages[0] ? `/${c.legal.pages[0].slug}/` : "/"),
  fields: [
    group(
      "Who runs the site",
      [
        text("entity", "Legal name", { hint: "As on your trade licence or GST registration, e.g. Hungru Pizza (proprietor: A. Das). Shown where the text says {entity}." }),
        text("officer", "Grievance Officer", { required: true, hint: "The person who answers privacy questions and complaints. Indian law asks for a name. Shown where the text says {officer}." }),
        text("email", "Email for privacy questions and complaints", { required: true, mono: true, hint: "Shown where the text says {email}. Phone, address and hours come from Business details." }),
        toggle("placeholder", "Sample", 'Shows a "Sample" tag next to the Grievance Officer while sample tags are on. Turn off once the real name is in.'),
      ],
      { key: "contact" },
    ),
    {
      kind: "list",
      key: "pages",
      label: "Policy pages",
      hint: "Each one is a page of its own, in this order in the footer.",
      itemLabel: "policy page",
      itemTitle: (p) => p.title || "New policy page",
      itemSubtitle: (p) => `/${p.slug}/ · updated ${p.updated}`,
      preview: (p) => `/${p.slug}/`,
      newItem: (c) => ({
        slug: slugify("new-policy", c.legal.pages.map((p) => p.slug)),
        title: "New policy",
        navLabel: "",
        lead: "",
        updated: today(),
        sections: [{ heading: "", body: "" }],
        seo: { title: "", description: "" },
      }),
      fields: [
        text("title", "Page heading", { required: true }),
        group(
          "",
          [
            text("navLabel", "Short name in the footer", { placeholder: "Privacy" }),
            text("slug", "Page address", { mono: true, hint: "Lower-case letters, numbers and dashes. Changing it changes the link, so old links stop working." }),
          ],
          { columns: 2 },
        ),
        para("lead", "Introduction", { rows: 3, tokens: TOKENS }),
        text("updated", "Last updated", { mono: true, placeholder: "2026-10-10", hint: "YYYY-MM-DD. Change it whenever you change this policy." }),
        {
          kind: "list",
          key: "sections",
          label: "Parts",
          itemLabel: "part",
          min: 1,
          itemTitle: (s) => s.heading || "New part",
          newItem: () => ({ heading: "", body: "" }),
          fields: [text("heading", "Heading", { required: true }), para("body", "Text", { rows: 12, required: true, tokens: TOKENS, hint: formatHint })],
        },
        seoFields(),
      ],
    },
    group(
      "Labels on every policy page",
      [
        text("eyebrow", "Small line above the heading"),
        text("updatedLabel", "Before the date"),
        text("contentsTitle", "List of parts"),
        text("otherTitle", "Links to the other policies"),
        text("contactTitle", "Contact box heading"),
        para("contactLead", "Contact box text", { rows: 3, tokens: TOKENS }),
        text("officerLabel", "Grievance Officer label"),
        text("emailLabel", "Email label"),
        text("phoneLabel", "Phone label"),
        text("addressLabel", "Address label"),
        para("demoNote", "Note at the top while sample tags are on", { rows: 2, hint: "Hidden once sample tags are turned off in Business details." }),
      ],
      { columns: 2, collapsed: true },
    ),
  ],
};
