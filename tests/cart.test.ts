import { describe, expect, it } from "vitest";
import type { BuilderConfig, MenuItem, Service } from "@/data/types";
import { addLine, cartOrderText, lineKey, MAX_LINE_QTY, parseCart, priceCart, setLineQty, type CartLine } from "@/lib/cart";

const dish = (name: string, diet: MenuItem["diet"], prices: [string, number][]): MenuItem => ({
  name,
  description: "",
  prices: prices.map(([size, price]) => ({ size, price })),
  diet,
  tag: "",
  photo: "",
});
const services = [
  {
    slug: "veg-pizzas",
    name: "Veg pizzas",
    items: [
      dish("Tandoori Paneer", "veg", [
        ["8 inch", 210],
        ["10 inch", 310],
      ]),
    ],
  },
  { slug: "drinks", name: "Drinks", items: [dish("Cold Coffee", "veg", [["", 140]])] },
] as Service[];
const builder: BuilderConfig = {
  sizes: [
    { id: "regular", label: "8 inch", note: "", price: 139, large: false },
    { id: "large", label: "10 inch", note: "", price: 220, large: true },
  ],
  bases: [{ id: "classic", label: "Classic crust", note: "", price: 0, priceLarge: 0 }],
  cheeses: [{ id: "mozzarella", label: "Mozzarella", note: "", price: 0, priceLarge: 0 }],
  toppings: [
    { id: "onion", label: "Onion", note: "", price: 30, priceLarge: 50, diet: "veg" },
    { id: "chicken", label: "Chicken", note: "", price: 60, priceLarge: 90, diet: "non-veg" },
  ],
  maxToppings: 6,
  maxQuantity: 10,
};
const words = { builtName: "Your own pizza", noToppings: "No toppings" };

const paneer8: CartLine = { kind: "dish", section: "veg-pizzas", name: "Tandoori Paneer", size: "8 inch", qty: 1 };
const coffee: CartLine = { kind: "dish", section: "drinks", name: "Cold Coffee", size: "", qty: 2 };
const built: CartLine = { kind: "pizza", size: "large", base: "classic", cheese: "mozzarella", toppings: ["chicken", "onion"], qty: 1 };

describe("cart", () => {
  it("adds a dish, and adds more of the same dish and size to the same line", () => {
    let lines = addLine([], paneer8);
    lines = addLine(lines, paneer8);
    lines = addLine(lines, { ...paneer8, size: "10 inch" });
    expect(lines.map((l) => l.qty)).toEqual([2, 1]);
    expect(addLine([{ ...paneer8, qty: MAX_LINE_QTY }], paneer8)[0]!.qty).toBe(MAX_LINE_QTY);
  });

  it("changes how many, and takes a line out at zero", () => {
    const lines = [paneer8, coffee];
    expect(setLineQty(lines, lineKey(coffee), 5)[1]!.qty).toBe(5);
    expect(setLineQty(lines, lineKey(paneer8), 0)).toEqual([coffee]);
  });

  it("prices every line from the current menu and builder", () => {
    const cart = priceCart([paneer8, coffee, built], services, builder, words);
    expect(cart.lines.map((l) => [l.name, l.detail, l.each, l.total])).toEqual([
      ["Tandoori Paneer", "8 inch", 210, 210],
      ["Cold Coffee", "", 140, 280],
      // 10 inch 220 + chicken 90 + onion 50, toppings in builder order.
      ["Your own pizza", "10 inch · Classic crust · Mozzarella · Onion, Chicken", 360, 360],
    ]);
    expect(cart.lines[2]!.diet).toBe("non-veg");
    expect(cart.count).toBe(4);
    expect(cart.total).toBe(850);
  });

  it("leaves out dishes and sizes that are no longer on the menu", () => {
    const gone = { ...paneer8, name: "Old Pizza" };
    const noSize = { ...paneer8, size: "12 inch" };
    const badPizza = { ...built, size: "huge" };
    expect(priceCart([gone, noSize, badPizza, coffee], services, builder, words).lines.map((l) => l.name)).toEqual(["Cold Coffee"]);
  });

  it("writes the order lines and total for WhatsApp", () => {
    const cart = priceCart([{ ...paneer8, qty: 2 }, coffee], services, builder, words);
    expect(cartOrderText(cart, "Items total")).toBe("2 × Tandoori Paneer (8 inch) = ₹420\n2 × Cold Coffee = ₹280\nItems total: ₹700");
  });

  it("reads a saved cart, dropping anything malformed", () => {
    const saved = JSON.parse(JSON.stringify([paneer8, built, { kind: "dish", name: "x" }, { ...coffee, qty: -1 }, "junk", { ...paneer8, qty: 3 }]));
    expect(parseCart(saved)).toEqual([{ ...paneer8, qty: 4 }, built]);
    expect(parseCart({ not: "an array" })).toEqual([]);
    expect(parseCart([{ ...built, toppings: [1, 2] }])).toEqual([]);
  });
});
