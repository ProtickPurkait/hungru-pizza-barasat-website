import type { BuilderConfig, BuilderOption, BuilderSize } from "@/data/types";

export interface PizzaChoice {
  size: string;
  base: string;
  cheese: string;
  toppings: string[];
  quantity: number;
}

export interface PizzaLine {
  label: string;
  price: number;
}

export interface PizzaPrice {
  /** One line per part of the pizza, for the order ticket. Free parts have price 0. */
  lines: PizzaLine[];
  /** Price of one pizza. */
  each: number;
  quantity: number;
  total: number;
}

/** What a crust, cheese or topping adds on this size: its large price on a large pizza, else its regular price. */
export function extraCost(option: Pick<BuilderOption, "price" | "priceLarge">, size: Pick<BuilderSize, "large">): number {
  return size.large ? option.priceLarge : option.price;
}

export function clampQuantity(value: number, cfg: BuilderConfig): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(cfg.maxQuantity, Math.max(1, Math.round(value)));
}

/** Keeps only known toppings, each once, up to the limit, in menu order. */
export function cleanToppings(ids: string[], cfg: BuilderConfig): string[] {
  const wanted = new Set(ids);
  return cfg.toppings
    .filter((t) => wanted.has(t.id))
    .slice(0, cfg.maxToppings)
    .map((t) => t.id);
}

/** Price of a built pizza: size + crust + cheese + each topping, at the size's prices. */
export function pricePizza(choice: PizzaChoice, cfg: BuilderConfig): PizzaPrice {
  const size = cfg.sizes.find((s) => s.id === choice.size) ?? cfg.sizes[0]!;
  const base = cfg.bases.find((b) => b.id === choice.base) ?? cfg.bases[0]!;
  const cheese = cfg.cheeses.find((c) => c.id === choice.cheese) ?? cfg.cheeses[0]!;
  const toppings = cleanToppings(choice.toppings, cfg).map((id) => cfg.toppings.find((t) => t.id === id)!);

  const lines: PizzaLine[] = [
    { label: `${size.label} pizza`, price: size.price },
    { label: base.label, price: extraCost(base, size) },
    { label: cheese.label, price: extraCost(cheese, size) },
    ...toppings.map((t) => ({ label: t.label, price: extraCost(t, size) })),
  ];
  const each = lines.reduce((sum, l) => sum + l.price, 0);
  const quantity = clampQuantity(choice.quantity, cfg);
  return { lines, each, quantity, total: each * quantity };
}

/** "veg" if every chosen topping is vegetarian, else "non-veg". */
export function pizzaDiet(toppingIds: string[], cfg: BuilderConfig): "veg" | "non-veg" {
  return toppingIds.some((id) => cfg.toppings.find((t) => t.id === id)?.diet === "non-veg") ? "non-veg" : "veg";
}
