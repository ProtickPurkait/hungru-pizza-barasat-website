import { describe, expect, it } from "vitest";
import type { BuilderConfig, MenuItem, Service } from "@/data/types";
import { currentExtras, extraChoices, lineKey, parseCart, priceCart, priceWithExtras, replaceLine, withExtras, type CartLine } from "@/lib/cart";

const dish = (name: string, diet: MenuItem["diet"], prices: [string, number][]): MenuItem => ({
  name,
  description: "",
  prices: prices.map(([size, price]) => ({ size, price })),
  diet,
  tag: "",
});
const services = [
  {
    slug: "veg-pizzas",
    items: [
      dish("Tandoori Paneer", "veg", [
        ["8 inch", 210],
        ["10 inch", 310],
      ]),
      dish("Cheese Burst Paneer Delux Pizza", "veg", [["8 inch", 350]]),
    ],
    addOns: [],
  },
  { slug: "chicken-pizzas", items: [dish("Chicken Tikka", "non-veg", [["8 inch", 230]])], addOns: [] },
  {
    slug: "starters",
    items: [dish("Peri Peri Fries", "veg", [["", 99]])],
    addOns: [
      { id: "cheese-dip", label: "Liquid cheese dip", price: 20 },
      { id: "chutney", label: "Hariyali chutney", price: 20 },
    ],
  },
  { slug: "drinks", items: [dish("Cold Coffee", "veg", [["", 140]])], addOns: [] },
] as unknown as Service[];
const builder: BuilderConfig = {
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
    { id: "onion", label: "Onion", note: "", price: 40, priceLarge: 55, diet: "veg" },
    { id: "chicken", label: "Chicken", note: "", price: 50, priceLarge: 65, diet: "non-veg" },
  ],
  maxToppings: 6,
  maxQuantity: 10,
};
const words = { builtName: "Your own pizza", noToppings: "No toppings" };

const paneer = (size: string, qty = 1): CartLine => ({ kind: "dish", section: "veg-pizzas", name: "Tandoori Paneer", size, qty });
const fries: CartLine = { kind: "dish", section: "starters", name: "Peri Peri Fries", size: "", qty: 1 };
const full = { base: "cheese-burst", cheese: "extra", toppings: ["onion"], addOns: [] };

describe("cart extras", () => {
  it("offers a pizza crust, cheese and toppings: veg toppings on a veg pizza, all on a chicken one", () => {
    const veg = extraChoices(paneer("8 inch"), services, builder)!;
    expect(veg.size?.id).toBe("regular");
    expect(veg.bases.map((b) => b.id)).toEqual(["classic", "cheese-burst"]);
    expect(veg.cheeses).toHaveLength(2);
    expect(veg.toppings.map((t) => t.id)).toEqual(["onion"]);
    const chicken = extraChoices({ kind: "dish", section: "chicken-pizzas", name: "Chicken Tikka", size: "8 inch", qty: 1 }, services, builder)!;
    expect(chicken.toppings.map((t) => t.id)).toEqual(["onion", "chicken"]);
  });

  it("offers no cheese burst on a cheese burst pizza, add-ons on other dishes, and nothing on a plain drink", () => {
    const burst = extraChoices({ kind: "dish", section: "veg-pizzas", name: "Cheese Burst Paneer Delux Pizza", size: "8 inch", qty: 1 }, services, builder)!;
    expect(burst.bases).toEqual([]);
    expect(burst.cheeses).toHaveLength(2);
    const starter = extraChoices(fries, services, builder)!;
    expect([starter.size, starter.toppings.length, starter.addOns.map((a) => a.id)]).toEqual([null, 0, ["cheese-dip", "chutney"]]);
    expect(extraChoices({ kind: "dish", section: "drinks", name: "Cold Coffee", size: "", qty: 1 }, services, builder)).toBeNull();
  });

  it("prices extras at the pizza's size and lists them", () => {
    const small = paneer("8 inch", 2);
    const smallDone = withExtras(small, full, extraChoices(small, services, builder)!, builder);
    const large = paneer("10 inch");
    const largeDone = withExtras(large, full, extraChoices(large, services, builder)!, builder);
    const cart = priceCart([smallDone, largeDone], services, builder, words);
    // 8 inch: 210 + 120 + 50 + 40; 10 inch: 310 + 200 + 65 + 55.
    expect(cart.lines.map((l) => [l.each, l.total, l.detail, l.hasExtras])).toEqual([
      [420, 840, "8 inch · Cheese burst · Extra cheese · + Onion", true],
      [630, 630, "10 inch · Cheese burst · Extra cheese · + Onion", true],
    ]);
    expect(priceWithExtras(small, full, services, builder)).toBe(420);
  });

  it("adds a dip to a starter", () => {
    const done = withExtras(fries, { base: "", cheese: "", toppings: [], addOns: ["chutney", "cheese-dip"] }, extraChoices(fries, services, builder)!, builder);
    expect(done).toEqual({ ...fries, extras: { addOns: ["cheese-dip", "chutney"] } });
    const [line] = priceCart([done], services, builder, words).lines;
    expect([line!.each, line!.detail]).toEqual([139, "+ Liquid cheese dip, Hariyali chutney"]);
  });

  it("drops the extras again when everything is set back to plain", () => {
    const line = paneer("8 inch");
    const choices = extraChoices(line, services, builder)!;
    const done = withExtras(line, full, choices, builder);
    expect(currentExtras(done, choices)).toEqual(full);
    expect(withExtras(done, { base: "classic", cheese: "regular", toppings: [], addOns: [] }, choices, builder)).toEqual(line);
  });

  it("joins a changed line with an identical one already in the cart", () => {
    const plain = paneer("8 inch", 1);
    const withBurst = withExtras(paneer("8 inch", 2), { ...full, cheese: "regular", toppings: [] }, extraChoices(plain, services, builder)!, builder);
    const lines = [plain, withBurst];
    const changed = withExtras(plain, { ...full, cheese: "regular", toppings: [] }, extraChoices(plain, services, builder)!, builder);
    expect(replaceLine(lines, lineKey(plain), changed)).toEqual([{ ...withBurst, qty: 3 }]);
  });

  it("changes a built pizza's own choices", () => {
    const built: CartLine = { kind: "pizza", size: "regular", base: "classic", cheese: "regular", toppings: [], qty: 1 };
    const choices = extraChoices(built, services, builder)!;
    expect(choices.toppings).toHaveLength(2);
    expect(withExtras(built, { base: "cheese-burst", cheese: "regular", toppings: ["chicken", "onion"], addOns: [] }, choices, builder)).toEqual({
      ...built,
      base: "cheese-burst",
      toppings: ["onion", "chicken"],
    });
  });

  it("keeps extras through a reload", () => {
    const saved = [withExtras(fries, { base: "", cheese: "", toppings: [], addOns: ["chutney"] }, extraChoices(fries, services, builder)!, builder)];
    expect(parseCart(JSON.parse(JSON.stringify(saved)))).toEqual(saved);
    expect(parseCart([{ ...fries, extras: { addOns: [5] } }])).toEqual([fries]);
  });
});
