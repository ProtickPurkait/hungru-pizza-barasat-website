import { describe, expect, it } from "vitest";
import { newestFirst, readMinutes } from "@/lib/blog";
import { formatDate, formatINR, formatNumber } from "@/lib/format";

describe("formatINR", () => {
  it("uses Indian lakh grouping", () => {
    expect(formatINR(125000)).toBe("₹1,25,000");
    expect(formatINR(1250000)).toBe("₹12,50,000");
    expect(formatINR(10000000)).toBe("₹1,00,00,000");
  });

  it("handles small numbers and rounds to whole rupees", () => {
    expect(formatINR(999)).toBe("₹999");
    expect(formatINR(76000.4)).toBe("₹76,000");
  });
});

describe("formatNumber", () => {
  it("groups digits the Indian way", () => {
    expect(formatNumber(4800)).toBe("4,800");
    expect(formatNumber(120000)).toBe("1,20,000");
  });
});

describe("formatDate", () => {
  it("writes dates the Indian way and leaves anything else alone", () => {
    expect(formatDate("2026-10-10")).toBe("10 October 2026");
    expect(formatDate("soon")).toBe("soon");
  });
});

describe("blog helpers", () => {
  const post = (date: string, words: number) => ({ slug: date, title: "T", excerpt: "", category: "", date, author: "", photo: "", sections: [{ heading: "", body: "word ".repeat(words) }], seo: { title: "", description: "" }, placeholder: false });

  it("lists the newest post first", () => {
    expect(newestFirst([post("2026-09-12", 1), post("2026-10-08", 1), post("2026-09-26", 1)]).map((p) => p.date)).toEqual(["2026-10-08", "2026-09-26", "2026-09-12"]);
  });

  it("reads at about 200 words a minute, at least 1", () => {
    expect(readMinutes(post("2026-10-08", 10))).toBe(1);
    expect(readMinutes(post("2026-10-08", 600))).toBe(3);
  });
});
