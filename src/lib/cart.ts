// Pure (the menu and builder are passed in), so it can be tested and the admin never pulls in the cart store.
import type { BuilderConfig, BuilderOption, BuilderSize, Diet, MenuAddOn, Service } from "@/data/types";
import { cleanToppings, extraCost, pricePizza } from "./builder";
import { formatINR } from "./format";

/** Most of one dish, or of one built pizza, in a single order. */
export const MAX_LINE_QTY = 20;
/** Most different things in the cart. */
export const MAX_LINES = 30;

/**
 * Extras on a dish from the menu, by id: for a pizza, a crust, cheese and toppings at the
 * pizza builder's add-on prices; for any dish, its menu section's add-ons (dips …).
 * The plain crust and cheese are left out.
 */
export interface DishExtras {
  base?: string;
  cheese?: string;
  toppings?: string[];
  addOns?: string[];
}

/**
 * What the cart keeps: which dish in which size (and its extras), or which built pizza, and how
 * many. Never the price, which is always read from the current menu, so a price change in the
 * admin reaches carts that were filled before it.
 */
export type CartLine =
  | { kind: "dish"; section: string; name: string; size: string; qty: number; extras?: DishExtras }
  | { kind: "pizza"; size: string; base: string; cheese: string; toppings: string[]; qty: number };

/** A cart line with its name, details and price from the current menu. */
export interface PricedLine {
  key: string;
  line: CartLine;
  name: string;
  /** The size and any extras, or a built pizza's choices. "" for a one-price dish. */
  detail: string;
  diet: Diet;
  /** The dish's photo key; "" for a pizza from the builder. */
  photo: string;
  each: number;
  qty: number;
  total: number;
  /** Whether the line has extras chosen (a built pizza always counts as chosen). */
  hasExtras: boolean;
}

export interface PricedCart {
  lines: PricedLine[];
  /** Number of things (2 pizzas + 1 coffee = 3). */
  count: number;
  total: number;
}

/** Words the priced cart needs for built pizzas. */
export interface CartWords {
  /** "Your own pizza". */
  builtName: string;
  /** "No toppings". */
  noToppings: string;
}

/** What a cart line's extras panel offers. */
export interface ExtraChoices {
  /** The builder size whose add-on prices apply: pizzas only. */
  size: BuilderSize | null;
  /** Crusts, the plain one first. Empty when there is nothing to choose (not a pizza, or already a cheese burst pizza). */
  bases: BuilderOption[];
  cheeses: BuilderOption[];
  toppings: BuilderConfig["toppings"];
  maxToppings: number;
  addOns: MenuAddOn[];
}

/** The chosen extras, as the panel edits them: every field filled in. */
export interface ExtrasChoice {
  base: string;
  cheese: string;
  toppings: string[];
  addOns: string[];
}

export function lineKey(line: CartLine): string {
  if (line.kind === "pizza") return `pizza|${line.size}|${line.base}|${line.cheese}|${line.toppings.join("+")}`;
  const x = line.extras;
  const extras = x ? `|${x.base ?? ""}|${x.cheese ?? ""}|${(x.toppings ?? []).join("+")}|${(x.addOns ?? []).join("+")}` : "";
  return `dish|${line.section}|${line.name}|${line.size}${extras}`;
}

const clampQty = (qty: number) => Math.min(MAX_LINE_QTY, Math.max(1, Math.round(qty)));
const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Adds a line, or more of the same thing when it is already in the cart. */
export function addLine(lines: CartLine[], line: CartLine): CartLine[] {
  const key = lineKey(line);
  if (lines.some((l) => lineKey(l) === key)) return lines.map((l) => (lineKey(l) === key ? { ...l, qty: clampQty(l.qty + line.qty) } : l));
  if (lines.length >= MAX_LINES) return lines;
  return [...lines, { ...line, qty: clampQty(line.qty) }];
}

/** Sets how many of a line; 0 or less takes it out. */
export function setLineQty(lines: CartLine[], key: string, qty: number): CartLine[] {
  if (qty <= 0) return lines.filter((l) => lineKey(l) !== key);
  return lines.map((l) => (lineKey(l) === key ? { ...l, qty: clampQty(qty) } : l));
}

/** Puts a changed line in place of the old one; if it now matches another line, the two are joined. */
export function replaceLine(lines: CartLine[], key: string, next: CartLine): CartLine[] {
  const nextKey = lineKey(next);
  if (nextKey !== key && lines.some((l) => lineKey(l) === nextKey)) {
    return lines.filter((l) => lineKey(l) !== key).map((l) => (lineKey(l) === nextKey ? { ...l, qty: clampQty(l.qty + next.qty) } : l));
  }
  return lines.map((l) => (lineKey(l) === key ? next : l));
}

/**
 * What can be added to a line. A menu pizza in a builder size (8 or 10 inch) gets the crusts,
 * cheeses and toppings at that size's add-on prices: veg toppings only on a veg pizza, and no
 * cheese burst on a pizza that already is one. A combo offer in 8 or 10 inch does not (it is a
 * set deal). Any dish gets its section's add-ons. A built pizza can change all its choices.
 * Null when there is nothing to add.
 */
export function extraChoices(line: CartLine, services: Service[], builder: BuilderConfig): ExtraChoices | null {
  if (line.kind === "pizza") {
    const size = builder.sizes.find((s) => s.id === line.size);
    return size ? { size, bases: builder.bases, cheeses: builder.cheeses, toppings: builder.toppings, maxToppings: builder.maxToppings, addOns: [] } : null;
  }
  const section = services.find((s) => s.slug === line.section);
  const item = section?.items.find((i) => i.name === line.name);
  const price = item?.prices.find((p) => p.size === line.size);
  if (!section || !item || !price) return null;
  const size = price.size && !section.offer ? (builder.sizes.find((s) => same(s.label, price.size)) ?? null) : null;
  const bases = size ? builder.bases.filter((b, i) => i === 0 || !item.name.toLowerCase().includes(b.label.toLowerCase())) : [];
  const choices: ExtraChoices = {
    size,
    bases: bases.length > 1 ? bases : [],
    cheeses: size && builder.cheeses.length > 1 ? builder.cheeses : [],
    toppings: size ? builder.toppings.filter((t) => item.diet !== "veg" || t.diet === "veg") : [],
    maxToppings: builder.maxToppings,
    addOns: section.addOns ?? [],
  };
  const any = choices.bases.length || choices.cheeses.length || choices.toppings.length || choices.addOns.length;
  return any ? choices : null;
}

/** The line's extras as the panel starts with them. */
export function currentExtras(line: CartLine, choices: ExtraChoices): ExtrasChoice {
  if (line.kind === "pizza") return { base: line.base, cheese: line.cheese, toppings: line.toppings, addOns: [] };
  const x = line.extras ?? {};
  return {
    base: choices.bases.some((b) => b.id === x.base) ? x.base! : (choices.bases[0]?.id ?? ""),
    cheese: choices.cheeses.some((c) => c.id === x.cheese) ? x.cheese! : (choices.cheeses[0]?.id ?? ""),
    toppings: (x.toppings ?? []).filter((id) => choices.toppings.some((t) => t.id === id)),
    addOns: (x.addOns ?? []).filter((id) => choices.addOns.some((a) => a.id === id)),
  };
}

/** The line with new extras, kept tidy: known ids only, toppings and add-ons in menu order, plain choices left out. */
export function withExtras(line: CartLine, choice: ExtrasChoice, choices: ExtraChoices, builder: BuilderConfig): CartLine {
  const toppings = cleanToppings(choice.toppings, builder).filter((id) => choices.toppings.some((t) => t.id === id));
  if (line.kind === "pizza") return { ...line, base: choice.base, cheese: choice.cheese, toppings };
  const extras: DishExtras = {};
  if (choices.bases.some((b, i) => i > 0 && b.id === choice.base)) extras.base = choice.base;
  if (choices.cheeses.some((c, i) => i > 0 && c.id === choice.cheese)) extras.cheese = choice.cheese;
  if (toppings.length) extras.toppings = toppings;
  const addOns = choices.addOns.filter((a) => choice.addOns.includes(a.id)).map((a) => a.id);
  if (addOns.length) extras.addOns = addOns;
  const { extras: _old, ...plain } = line;
  return Object.keys(extras).length ? { ...plain, extras } : plain;
}

/** Price of one with these extras. */
export function priceWithExtras(line: CartLine, choice: ExtrasChoice, services: Service[], builder: BuilderConfig): number {
  const choices = extraChoices(line, services, builder);
  if (!choices) return 0;
  return priceLine(withExtras(line, choice, choices, builder), services, builder, { builtName: "", noToppings: "" })?.each ?? 0;
}

/** Prices every line from the current menu and builder. Lines for dishes or choices that no longer exist are left out. */
export function priceCart(lines: CartLine[], services: Service[], builder: BuilderConfig, words: CartWords): PricedCart {
  const priced: PricedLine[] = [];
  for (const line of lines) {
    const p = priceLine(line, services, builder, words);
    if (p) priced.push(p);
  }
  return {
    lines: priced,
    count: priced.reduce((n, l) => n + l.qty, 0),
    total: priced.reduce((n, l) => n + l.total, 0),
  };
}

function priceLine(line: CartLine, services: Service[], builder: BuilderConfig, words: CartWords): PricedLine | null {
  const key = lineKey(line);
  if (line.kind === "dish") {
    const item = services.find((s) => s.slug === line.section)?.items.find((i) => i.name === line.name);
    const price = item?.prices.find((p) => p.size === line.size);
    if (!item || !price) return null;
    let each = price.price;
    const parts = [price.size];
    const choices = line.extras ? extraChoices(line, services, builder) : null;
    if (line.extras && choices) {
      const x = currentExtras(line, choices);
      const size = choices.size;
      const base = choices.bases.find((b, i) => i > 0 && b.id === x.base);
      const cheese = choices.cheeses.find((c, i) => i > 0 && c.id === x.cheese);
      const toppings = cleanToppings(x.toppings, builder).map((id) => choices.toppings.find((t) => t.id === id)!);
      const addOns = choices.addOns.filter((a) => x.addOns.includes(a.id));
      if (size) {
        for (const o of [base, cheese, ...toppings]) if (o) each += extraCost(o, size);
        parts.push(base?.label ?? "", cheese?.label ?? "", toppings.length ? `+ ${toppings.map((t) => t.label).join(", ")}` : "");
      }
      each += addOns.reduce((n, a) => n + a.price, 0);
      parts.push(addOns.length ? `+ ${addOns.map((a) => a.label).join(", ")}` : "");
    }
    const detail = parts.filter(Boolean).join(" · ");
    return {
      key,
      line,
      name: item.name,
      detail,
      diet: item.diet,
      photo: item.photo ?? "",
      each,
      qty: line.qty,
      total: each * line.qty,
      hasExtras: detail !== price.size,
    };
  }
  const size = builder.sizes.find((s) => s.id === line.size);
  const base = builder.bases.find((b) => b.id === line.base);
  const cheese = builder.cheeses.find((c) => c.id === line.cheese);
  if (!size || !base || !cheese) return null;
  const toppings = cleanToppings(line.toppings, builder);
  const { each } = pricePizza({ size: size.id, base: base.id, cheese: cheese.id, toppings, quantity: 1 }, builder);
  const toppingNames = toppings.map((id) => builder.toppings.find((t) => t.id === id)!.label);
  const diet = toppings.some((id) => builder.toppings.find((t) => t.id === id)?.diet === "non-veg") ? "non-veg" : "veg";
  return {
    key,
    line,
    name: words.builtName,
    detail: [size.label, base.label, cheese.label, toppingNames.length ? toppingNames.join(", ") : words.noToppings].join(" · "),
    diet,
    photo: "",
    each,
    qty: line.qty,
    total: each * line.qty,
    hasExtras: true,
  };
}

/** The cart as order lines for the WhatsApp message: "2 × Tandoori Paneer (8 inch · Cheese burst) = ₹660", then the total. */
export function cartOrderText(cart: PricedCart, totalLabel: string): string {
  const rows = cart.lines.map((l) => `${l.qty} × ${l.name}${l.detail ? ` (${l.detail})` : ""} = ${formatINR(l.total)}`);
  return [...rows, `${totalLabel}: ${formatINR(cart.total)}`].join("\n");
}

const str = (v: unknown, max = 120): string | null => (typeof v === "string" && v.length <= max ? v : null);
const strList = (v: unknown): string[] | null => {
  if (!Array.isArray(v) || v.length > 20) return null;
  const list = v.map((x) => str(x));
  return list.every((x) => x) ? (list as string[]) : null;
};

function parseExtras(v: unknown): DishExtras | undefined {
  if (!v || typeof v !== "object") return undefined;
  const r = v as Record<string, unknown>;
  const extras: DishExtras = {};
  if (str(r.base)) extras.base = r.base as string;
  if (str(r.cheese)) extras.cheese = r.cheese as string;
  const toppings = strList(r.toppings);
  if (toppings?.length) extras.toppings = toppings;
  const addOns = strList(r.addOns);
  if (addOns?.length) extras.addOns = addOns;
  return Object.keys(extras).length ? extras : undefined;
}

/** Reads a saved cart, keeping only well-formed lines. Anything else (old formats, edits by hand) is dropped. */
export function parseCart(data: unknown): CartLine[] {
  if (!Array.isArray(data)) return [];
  let lines: CartLine[] = [];
  for (const raw of data.slice(0, MAX_LINES)) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const qty = typeof r.qty === "number" && Number.isFinite(r.qty) && r.qty >= 1 ? r.qty : null;
    if (qty === null) continue;
    if (r.kind === "dish") {
      const section = str(r.section);
      const name = str(r.name);
      const size = str(r.size);
      const extras = parseExtras(r.extras);
      if (section && name && size !== null) lines = addLine(lines, { kind: "dish", section, name, size, qty, ...(extras ? { extras } : {}) });
    } else if (r.kind === "pizza") {
      const size = str(r.size);
      const base = str(r.base);
      const cheese = str(r.cheese);
      const toppings = strList(r.toppings);
      if (size && base && cheese && toppings) lines = addLine(lines, { kind: "pizza", size, base, cheese, toppings, qty });
    }
  }
  return lines;
}
