// How the editor describes the content: each section is a list of fields, and each
// field says how to edit one value in content.json. The forms are built from this.
import type { LucideIcon } from "lucide-react";
import type { SiteContent } from "@/data/types";

export interface Option {
  value: string;
  label: string;
}

/** Fixed choices, or choices read from the draft (e.g. the current list of services). */
export type Options = Option[] | ((content: SiteContent) => Option[]);

interface Base {
  /** Where the value lives, relative to the parent ("title", "hero.photo"). "" means the parent itself. */
  key: string;
  label: string;
  hint?: string;
  /** Placeholders this text can use, e.g. ["area"] for "{area}". */
  tokens?: string[];
}

export type Field =
  | (Base & { kind: "text"; placeholder?: string; max?: number; required?: boolean; mono?: boolean })
  | (Base & { kind: "textarea"; rows?: number; max?: number; required?: boolean })
  | (Base & { kind: "number"; min?: number; max?: number; step?: number; suffix?: string })
  | (Base & { kind: "toggle" })
  | (Base & { kind: "select"; options: Options })
  /** A list of values picked from options, e.g. which services an area page shows. */
  | (Base & { kind: "checks"; options: Options })
  /** optional: the photo may be left empty (""). */
  | (Base & { kind: "photo"; optional?: boolean })
  | (Base & { kind: "photos"; max?: number })
  /** A logo from the photo library: the main one, the version for dark backgrounds, or the browser-tab icon. */
  | (Base & { kind: "logo"; variant?: "dark" | "icon" })
  /** [low, high] pair, e.g. a price range. */
  | (Base & { kind: "range"; suffix?: string })
  | (Base & {
      kind: "strings";
      multiline?: boolean;
      itemLabel?: string;
      /** Fixed length: items can be edited and reordered, not added or removed. */
      fixed?: boolean;
      min?: number;
      max?: number;
    })
  | (Base & {
      kind: "list";
      fields: Field[];
      itemTitle: (item: any, index: number) => string;
      itemSubtitle?: (item: any, content: SiteContent) => string;
      /** Photo key shown as a thumbnail on the item row. */
      itemPhoto?: (item: any) => string;
      newItem: (content: SiteContent) => unknown;
      itemLabel: string;
      fixed?: boolean;
      min?: number;
      max?: number;
      /** Page to show in the preview while an item is open. */
      preview?: (item: any) => string;
    })
  | (Base & { kind: "group"; fields: Field[]; columns?: 1 | 2; collapsed?: boolean })
  /** A record of fixed keys, e.g. a label for each project type. */
  | (Base & { kind: "record"; keys: Option[] });

export interface Section {
  /** Also used by src/lib/content-check.ts to file problems under a section. */
  id: string;
  group: string;
  title: string;
  icon: LucideIcon;
  description?: string;
  /** Where the section's fields start in content.json ("" = the top). */
  path: string;
  /** Page shown in the preview. */
  preview: string | ((content: SiteContent) => string);
  fields?: Field[];
  /** Sections with their own screen instead of a form. */
  custom?: "photos" | "history";
}
