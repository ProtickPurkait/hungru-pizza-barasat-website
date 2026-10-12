import { describe, expect, it } from "vitest";
import { getContent } from "@/data/site";
import { paths } from "@/lib/paths";
import { routesFor } from "@/lib/routes";
import { closeness, groupHits, markParts, parseQuery, prepareIndex, searchSite } from "@/lib/search";
import { searchEntries } from "@/lib/search-index";

const content = getContent();
const index = prepareIndex(searchEntries(content));
const find = (q: string) => searchSite(index, q);
const ids = (q: string) => find(q).hits.map((h) => h.entry.id);
const dishes = (q: string) => find(q).hits.filter((h) => h.entry.kind === "dish");

describe("reading a search", () => {
  it("finds the price, the words that matter and 'cheap'", () => {
    expect(parseQuery("Chicken under ₹250")).toMatchObject({ maxPrice: 250, cheap: false, terms: [{ word: "chicken" }] });
    expect(parseQuery("pizza 199").maxPrice).toBe(199);
    expect(parseQuery("10 inch pizza")).toMatchObject({ maxPrice: null, terms: [{ word: "10" }, { word: "inch" }, { word: "pizza" }] });
    expect(parseQuery("cheap momos")).toMatchObject({ cheap: true, terms: [{ word: "momo" }] });
    expect(parseQuery("do you have non-veg pizzas?").terms.map((t) => t.word)).toEqual(["nonveg", "pizza"]);
    expect(parseQuery("order pizza").terms.map((t) => t.word)).toEqual(["pizza"]);
  });

  it("forgives slips but not unrelated words", () => {
    expect(closeness("panner", "paneer")).toBeGreaterThan(0);
    expect(closeness("margarita", "margherita")).toBeGreaterThan(0);
    expect(closeness("chike", "chicken")).toBeGreaterThan(0);
    expect(closeness("piza", "pizza")).toBeGreaterThan(0);
    expect(closeness("coke", "come")).toBe(0);
    expect(closeness("pizza", "burger")).toBe(0);
    expect(closeness("veg", "nonveg")).toBe(0);
  });
});

describe("site search", () => {
  it("finds dishes despite spelling slips", () => {
    expect(dishes("chiken tika")[0]?.entry.title).toBe("Chicken Tikka Pizza");
    expect(dishes("margarita")[0]?.entry.title).toBe("Cheesy Margherita Pizza");
    expect(dishes("panner pizza")[0]?.entry.title).toMatch(/Paneer/);
    expect(dishes("cold coffee")[0]?.entry.title).toBe("Cold Coffee");
    expect(dishes("veg burger")[0]?.entry.title).toBe("Veg Burger");
  });

  it("answers hours, phone, address and delivery first", () => {
    expect(ids("timings")[0]).toBe("answer-hours");
    expect(ids("what time do you open")[0]).toBe("answer-hours");
    expect(ids("phone number")[0]).toBe("answer-phone");
    // The home page question "Where are you?" fits just as well.
    expect(ids("where are you").slice(0, 2)).toContain("answer-address");
    expect(ids("kazipara")).toContain("answer-delivery");
    expect(ids("madhyamgram")[0]).toBe("area-madhyamgram");
  });

  it("finds pages, jobs, posts and policies by the words people use", () => {
    expect(ids("job").slice(0, 3)).toContain("page-careers");
    expect(ids("refund")).toContain("policy-refund-policy");
    expect(ids("photos")[0]).toBe("page-projects");
    expect(ids("offers")[0]).toBe("page-offers");
    expect(ids("any discount").slice(0, 3)).toContain("page-offers");
    expect(dishes("couple combo").map((h) => h.entry.title)).toEqual(expect.arrayContaining(["Veg Couple Combo", "Chicken Couple Combo"]));
    expect(ids("make my own pizza").slice(0, 3)).toContain("page-builder");
    expect(ids("cheese burst")).toContain("post-what-is-cheese-burst-pizza");
    expect(dishes("cheese burst")[0]?.entry.title).toMatch(/^Cheese Burst/);
    expect(dishes("spicy pizza").some((h) => /Fiery|Inferno|Spicy/.test(h.entry.title))).toBe(true);
  });

  it("lists dishes up to a price, cheapest first", () => {
    const r = find("momos under 120");
    const prices = r.hits.map((h) => Math.min(...h.entry.prices!));
    expect(r.hits.every((h) => h.entry.kind === "dish")).toBe(true);
    expect(r.hits.map((h) => h.entry.title)).toContain("Veg Momo");
    expect(prices.every((p) => p <= 120)).toBe(true);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    expect(find("under 100").hits.length).toBeGreaterThan(5);
  });

  it("falls back to the closest matches, and finds nothing for nonsense", () => {
    const r = find("paneer pizza unicorn");
    expect(r.partial).toBe(true);
    expect(r.hits.length).toBeGreaterThan(0);
    expect(find("xyzzy").hits).toEqual([]);
    expect(find("p").hits).toEqual([]);
  });

  it("opens every result on a real page", () => {
    const pages = new Set([...routesFor(content), paths.cart]);
    for (const e of searchEntries(content)) expect(pages.has(e.path.split("#")[0]!), e.path).toBe(true);
    expect(dishes("tandoori paneer")[0]?.entry.path).toBe("/menu/veg-pizzas/#tandoori-paneer-pizza");
  });

  it("shows a few of each kind, and picks out the matched words", () => {
    const groups = groupHits(find("pizza").hits);
    const dish = groups.find((g) => g.kind === "dish")!;
    expect(dish.hits).toHaveLength(8);
    expect(dish.more).toBeGreaterThan(50);
    expect(markParts("Chicken Tikka Pizza", ["chicken", "tikka"])).toEqual([
      { text: "Chicken", mark: true },
      { text: " ", mark: false },
      { text: "Tikka", mark: true },
      { text: " Pizza", mark: false },
    ]);
  });
});
