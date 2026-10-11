import { describe, expect, it } from "vitest";
import { boldParts, fill, inlineParts, isSafeHref, textBlocks } from "@/lib/text";

describe("fill", () => {
  it("replaces known placeholders and keeps unknown ones visible", () => {
    expect(fill("Pizza delivery in {area}", { area: "Ballygunge" })).toBe("Pizza delivery in Ballygunge");
    expect(fill("{service}: your questions", { service: "Kolkata specials" })).toBe("Kolkata specials: your questions");
    expect(fill("Hi {nme}", { name: "R. Das" })).toBe("Hi {nme}");
    expect(fill("{n} jobs", { n: 12 })).toBe("12 jobs");
  });
});

describe("boldParts", () => {
  it("splits **bold** words out of plain text", () => {
    expect(boldParts("Just press **send** in WhatsApp")).toEqual([
      { text: "Just press ", bold: false },
      { text: "send", bold: true },
      { text: " in WhatsApp", bold: false },
    ]);
    expect(boldParts("No bold here")).toEqual([{ text: "No bold here", bold: false }]);
  });
});

describe("inlineParts", () => {
  it("finds links and bold words", () => {
    expect(inlineParts("Read the [privacy policy](/privacy-policy/) **now**")).toEqual([
      { kind: "text", text: "Read the " },
      { kind: "link", text: "privacy policy", href: "/privacy-policy/" },
      { kind: "text", text: " " },
      { kind: "bold", text: "now" },
    ]);
  });

  it("never turns unsafe addresses into links", () => {
    expect(inlineParts("[click](javascript:alert(1))").every((p) => p.kind !== "link")).toBe(true);
    expect(isSafeHref("//evil.example")).toBe(false);
    for (const ok of ["/contact/", "#your-rights", "https://e-jagriti.gov.in", "mailto:a@b.in", "tel:+919163148329"]) expect(isSafeHref(ok), ok).toBe(true);
  });
});

describe("textBlocks", () => {
  it("splits paragraphs on empty lines and turns - lines into lists", () => {
    expect(textBlocks("First line\nsecond line\n\n**Heading**\n- one\n- two\n\nLast")).toEqual([
      { kind: "p", lines: ["First line", "second line"] },
      { kind: "p", lines: ["**Heading**"] },
      { kind: "ul", items: ["one", "two"] },
      { kind: "p", lines: ["Last"] },
    ]);
  });
});
