import { describe, expect, it } from "vitest";
import { builder } from "@/data/site";
import { clampQuantity, cleanToppings, extraCost, pizzaDiet, pricePizza } from "@/lib/builder";
import type { BuilderConfig } from "@/data/types";

const cfg: BuilderConfig = {
  sizes: [
    { id: "regular", label: "8 inch", note: "", price: 139, large: false },
    { id: "large", label: "10 inch", note: "", price: 220, large: true },
  ],
  bases: [
    { id: "classic", label: "Classic crust", note: "", price: 0, priceLarge: 0 },
    { id: "cheese-burst", label: "Cheese burst", note: "", price: 120, priceLarge: 200 },
  ],
  cheeses: [
    { id: "regular", label: "Mozzarella", note: "", price: 0, priceLarge: 0 },
    { id: "extra", label: "Extra cheese", note: "", price: 50, priceLarge: 65 },
  ],
  toppings: [
    { id: "paneer", label: "Paneer", note: "", price: 50, priceLarge: 65, diet: "veg" },
    { id: "jalapeno", label: "Jalapeño", note: "", price: 40, priceLarge: 60, diet: "veg" },
    { id: "chicken", label: "Chicken", note: "", price: 50, priceLarge: 65, diet: "non-veg" },
  ],
  maxToppings: 2,
  maxQuantity: 5,
};

describe("pricePizza", () => {
  it("adds size, crust, cheese and toppings at the regular prices", () => {
    const p = pricePizza({ size: "regular", base: "cheese-burst", cheese: "extra", toppings: ["paneer"], quantity: 1 }, cfg);
    expect(p.each).toBe(139 + 120 + 50 + 50);
    expect(p.lines.map((l) => l.label)).toEqual(["8 inch pizza", "Cheese burst", "Extra cheese", "Paneer"]);
  });

  it("uses the large price of every extra on a large pizza", () => {
    const p = pricePizza({ size: "large", base: "cheese-burst", cheese: "regular", toppings: ["paneer", "jalapeno"], quantity: 1 }, cfg);
    expect(p.lines.map((l) => l.price)).toEqual([220, 200, 0, 65, 60]);
    expect(p.each).toBe(220 + 200 + 65 + 60);
    expect(extraCost(cfg.toppings[1]!, cfg.sizes[0]!)).toBe(40);
  });

  it("multiplies by the quantity, within the allowed range", () => {
    const p = pricePizza({ size: "regular", base: "classic", cheese: "regular", toppings: [], quantity: 3 }, cfg);
    expect(p.total).toBe(417);
    expect(clampQuantity(0, cfg)).toBe(1);
    expect(clampQuantity(99, cfg)).toBe(5);
    expect(clampQuantity(Number.NaN, cfg)).toBe(1);
  });

  it("ignores unknown or repeated toppings and keeps to the limit", () => {
    expect(cleanToppings(["chicken", "nope", "paneer", "paneer", "jalapeno"], cfg)).toEqual(["paneer", "jalapeno"]);
  });

  it("falls back to the first option for unknown ids", () => {
    const p = pricePizza({ size: "x", base: "x", cheese: "x", toppings: [], quantity: 1 }, cfg);
    expect(p.each).toBe(139);
  });

  it("marks a pizza non-veg as soon as one topping is", () => {
    expect(pizzaDiet(["paneer", "jalapeno"], cfg)).toBe("veg");
    expect(pizzaDiet(["paneer", "chicken"], cfg)).toBe("non-veg");
  });

  it("gives sensible prices with the real menu", () => {
    const first = pricePizza({ size: builder.sizes[0]!.id, base: builder.bases[0]!.id, cheese: builder.cheeses[0]!.id, toppings: [], quantity: 1 }, builder);
    expect(first.each).toBe(builder.sizes[0]!.price);
    const loaded = pricePizza(
      { size: builder.sizes.at(-1)!.id, base: builder.bases.at(-1)!.id, cheese: builder.cheeses[0]!.id, toppings: builder.toppings.map((t) => t.id), quantity: 2 },
      builder,
    );
    expect(loaded.lines.length).toBe(3 + builder.maxToppings);
    expect(loaded.total).toBe(loaded.each * 2);
    // every add-on costs at least as much on the large size
    for (const o of [...builder.bases, ...builder.cheeses, ...builder.toppings]) expect(o.priceLarge).toBeGreaterThanOrEqual(o.price);
    for (const l of loaded.lines) expect(Number.isInteger(l.price)).toBe(true);
  });
});
