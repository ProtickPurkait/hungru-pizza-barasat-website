import { describe, expect, it } from "vitest";
import type { MenuItem, Service } from "@/data/types";
import { dietShown, filterMenu, filtersFromSearch, filtersToSearch, fromPrice, isFiltered, NO_FILTERS, sectionCounts } from "@/lib/menu-filter";

const dish = (name: string, diet: MenuItem["diet"], ...prices: number[]): MenuItem => ({
  name,
  description: `${name} with cheese`,
  prices: prices.map((price, i) => ({ size: prices.length > 1 ? `${8 + i * 2} inch` : "", price })),
  diet,
  tag: "",
});
const section = (slug: string, name: string, items: MenuItem[]) => ({ slug, name, items }) as Service;

const menu = [
  section("veg-pizzas", "Veg pizzas", [dish("Tandoori Paneer", "veg", 210, 310), dish("Cheesy Margherita", "veg", 139, 220), dish("Santa Corn", "veg", 135, 235)]),
  section("chicken-pizzas", "Chicken pizzas", [dish("Golden Chicken", "non-veg", 120, 220), dish("Chicken Tikka", "non-veg", 230, 330)]),
  section("momos", "Momos", [dish("Fried Momos", "either", 99)]),
];
const names = (f = NO_FILTERS) => filterMenu(menu, f).flatMap((g) => g.items.map((i) => i.name));

describe("menu finder", () => {
  it("shows the whole menu, in menu order, with no filters", () => {
    expect(names()).toEqual(["Tandoori Paneer", "Cheesy Margherita", "Santa Corn", "Golden Chicken", "Chicken Tikka", "Fried Momos"]);
    expect(isFiltered(NO_FILTERS)).toBe(false);
  });

  it("shows one section", () => {
    expect(names({ ...NO_FILTERS, section: "chicken-pizzas" })).toEqual(["Golden Chicken", "Chicken Tikka"]);
  });

  it("searches names, descriptions and section names, every word", () => {
    expect(names({ ...NO_FILTERS, query: "paneer" })).toEqual(["Tandoori Paneer"]);
    expect(names({ ...NO_FILTERS, query: "CHICKEN tikka" })).toEqual(["Chicken Tikka"]);
    expect(names({ ...NO_FILTERS, query: "momos" })).toEqual(["Fried Momos"]);
    expect(names({ ...NO_FILTERS, query: "nothing like this" })).toEqual([]);
  });

  it("sorts within each section by the smallest size's price, or by name", () => {
    expect(names({ ...NO_FILTERS, sort: "price-low", section: "veg-pizzas" })).toEqual(["Santa Corn", "Cheesy Margherita", "Tandoori Paneer"]);
    expect(names({ ...NO_FILTERS, sort: "price-high", section: "veg-pizzas" })).toEqual(["Tandoori Paneer", "Cheesy Margherita", "Santa Corn"]);
    expect(names({ ...NO_FILTERS, sort: "name", section: "veg-pizzas" })).toEqual(["Cheesy Margherita", "Santa Corn", "Tandoori Paneer"]);
    // Sections keep their menu order.
    expect(filterMenu(menu, { ...NO_FILTERS, sort: "price-low" }).map((g) => g.section.slug)).toEqual(["veg-pizzas", "chicken-pizzas", "momos"]);
    expect(fromPrice(menu[0]!.items[0]!)).toBe(210);
  });

  it("switches veg and non-veg off; dishes that can be either stay while one is on", () => {
    expect(names({ ...NO_FILTERS, nonVeg: false })).toEqual(["Tandoori Paneer", "Cheesy Margherita", "Santa Corn", "Fried Momos"]);
    expect(names({ ...NO_FILTERS, veg: false })).toEqual(["Golden Chicken", "Chicken Tikka", "Fried Momos"]);
    expect(names({ ...NO_FILTERS, veg: false, nonVeg: false })).toEqual([]);
    expect(dietShown("either", { veg: false, nonVeg: true })).toBe(true);
  });

  it("counts each section's matches for the tabs", () => {
    expect(sectionCounts(menu, { ...NO_FILTERS, nonVeg: false, section: "momos" })).toEqual({ "veg-pizzas": 3, momos: 1 });
  });

  it("round-trips the filters through the page address, and ignores rubbish", () => {
    const f = { section: "veg-pizzas", query: "paneer", sort: "price-low" as const, veg: true, nonVeg: false };
    const search = filtersToSearch(f);
    expect(search).toBe("?section=veg-pizzas&q=paneer&sort=price-low&diet=veg");
    expect(filtersFromSearch(search, ["veg-pizzas"])).toEqual(f);
    expect(filtersToSearch(NO_FILTERS)).toBe("");
    expect(filtersFromSearch("?section=nope&sort=cheapest&diet=none", ["veg-pizzas"])).toEqual({ ...NO_FILTERS, veg: false, nonVeg: false });
  });
});
