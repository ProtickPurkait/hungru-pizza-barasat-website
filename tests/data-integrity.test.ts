// Guards the site content (src/data/content.json) and the checker the admin panel relies on.
import { describe, expect, it } from "vitest";
import { getContent } from "@/data/site";
import type { SiteContent } from "@/data/types";
import { checkContent, hasErrors } from "@/lib/content-check";
import { routesFor } from "@/lib/routes";

const fresh = (): SiteContent => structuredClone(getContent());
const messages = (c: SiteContent, level: "error" | "warning" = "error") =>
  checkContent(c)
    .filter((p) => p.level === level)
    .map((p) => p.message);

describe("current content", () => {
  it("has no errors or warnings", () => {
    expect(checkContent(getContent())).toEqual([]);
  });

  it("all routes end with a slash and are unique", () => {
    const routes = routesFor(getContent());
    expect(new Set(routes).size).toBe(routes.length);
    for (const r of routes) expect(r.endsWith("/"), r).toBe(true);
  });
});

describe("content checker", () => {
  it("catches a photo that is not in the library", () => {
    const c = fresh();
    c.services[0].heroPhoto = "missingPhoto";
    expect(messages(c).join("\n")).toContain('"missingPhoto" is not in the photo library');
  });

  it("catches a photo without alt text", () => {
    const c = fresh();
    c.photos[c.copy.home.hero.photo]!.alt = " ";
    expect(hasErrors(checkContent(c))).toBe(true);
  });

  it("catches broken links between areas, menu sections and gallery photos", () => {
    const c = fresh();
    c.areaPages[0].services.push("no-such-section");
    c.areaPages[0].photo = "gonePhoto";
    (c.projects[0] as { category: string }).category = "atlantis";
    const found = messages(c).join("\n");
    expect(found).toContain('"no-such-section"');
    expect(found).toContain('the photo "gonePhoto" is not in the photo library');
    expect(found).toContain('unknown type "atlantis"');
  });

  it("catches duplicate and badly formed page addresses", () => {
    const c = fresh();
    c.services[1].slug = c.services[0].slug;
    c.areaPages[0].slug = "Colony More";
    const found = messages(c).join("\n");
    expect(found).toContain("Two menu sections use the address");
    expect(found).toContain("may only use lower-case letters");
  });

  it("catches impossible prices and a bad phone number", () => {
    const c = fresh();
    c.services[0].items[0]!.prices[0]!.price = -5;
    c.builder.sizes[0]!.price = 0;
    c.business.whatsapp = "+91 98300 12345";
    const found = messages(c).join("\n");
    expect(found).toContain("the price must be a whole number of rupees above 0");
    expect(found).toContain("a size needs a price above 0");
    expect(found).toContain("WhatsApp number should be digits only");
  });

  it("checks dishes: a food mark and a price are required, sizes must be named, a repeated size only warns", () => {
    const c = fresh();
    (c.services[0].items[0] as { diet: string }).diet = "vegan-ish";
    c.services[0].items[1]!.prices = [];
    c.services[0].items[2]!.prices = [
      { size: "", price: 100 },
      { size: "Large", price: 150 },
    ];
    const found = messages(c).join("\n");
    expect(found).toContain("choose veg, non-veg or either");
    expect(found).toContain("add a price");
    expect(found).toContain("name each size");
    const w = fresh();
    w.services[0].items[0]!.prices = [
      { size: "Regular", price: 100 },
      { size: "Regular", price: 150 },
    ];
    expect(messages(w)).toEqual([]);
    expect(messages(w, "warning").join("\n")).toContain('the size "Regular" is listed twice');
  });

  it("checks the delivery app and social links", () => {
    const c = fresh();
    c.business.orderOnline.push({ label: "", url: "zomato.com/hungru" });
    const found = messages(c).join("\n");
    expect(found).toContain("add a name, e.g. Zomato");
    expect(found).toContain("should start with https://");
  });

  it("warns when the home page example pizza uses a removed topping", () => {
    const c = fresh();
    c.copy.builderTeaser.example.toppings = ["truffle"];
    expect(messages(c)).toEqual([]);
    expect(messages(c, "warning").join("\n")).toContain("example pizza on the home page");
  });

  it("checks policy pages: address, date, contact and links", () => {
    const c = fresh();
    const [privacy, terms] = c.legal.pages;
    privacy!.slug = "contact";
    terms!.updated = "10/10/2026";
    terms!.sections[0]!.body += " See [the old page](/old-terms/) or [this](ftp://files.example).";
    c.legal.contact.email = "not an email";
    c.copy.form.privacyNote = "[Privacy](/privacy/)";
    const found = messages(c).join("\n");
    expect(found).toContain('the address "/contact/" is already used');
    expect(found).toContain("should be a date like 2026-10-10");
    expect(found).toContain('the link "/old-terms/" goes to a page that does not exist');
    expect(found).toContain('the link "ftp://files.example" should start with');
    expect(found).toContain("email for privacy questions");
    expect(found).toContain('Order form privacy line: the link "/privacy/"');
  });

  it("checks the logo: photos must exist, the dark version needs a main logo", () => {
    const c = fresh();
    c.business.logo.image = "";
    c.business.logo.imageDark = "goneLogo";
    expect(messages(c).join("\n")).toContain('Logo for dark backgrounds: the photo "goneLogo" is not in the photo library');
    c.business.logo.imageDark = Object.keys(c.photos)[0]!;
    expect(messages(c)).toEqual([]);
    expect(messages(c, "warning").join("\n")).toContain("only used together with a main logo");
    c.business.logo.image = "missingLogo";
    expect(messages(c).join("\n")).toContain('Logo: the photo "missingLogo" is not in the photo library');
  });

  it("checks the browser tab icon: it must exist, and a wide or sample picture gets a warning", () => {
    const c = fresh();
    c.business.logo.icon = "goneIcon";
    expect(messages(c).join("\n")).toContain('Browser tab icon: the photo "goneIcon" is not in the photo library');
    c.business.logo.icon = "";
    c.photos.wideLogo = { src: "/images/uploads/wide-logo-123abc.webp", alt: "Logo", width: 960, height: 166 };
    c.business.logo.image = "wideLogo";
    expect(messages(c)).toEqual([]);
    expect(messages(c, "warning").join("\n")).toContain("The logo is wide, so it is tiny in a browser tab");
    c.photos.squareIcon = { src: "/images/uploads/icon-456def.webp", alt: "Icon", width: 320, height: 320 };
    c.business.logo.icon = "squareIcon";
    expect(messages(c, "warning")).toEqual([]);
    c.business.logo.icon = Object.keys(getContent().photos)[0]!;
    expect(messages(c, "warning").join("\n")).toContain("not a sample photo");
  });

  it("requires exactly four steps and four trust figures", () => {
    const c = fresh();
    c.steps.pop();
    c.stats.push({ value: "1", label: "Extra" });
    expect(messages(c)).toHaveLength(2);
  });

  it("warns, without blocking, about copied SEO titles and area text", () => {
    const c = fresh();
    c.pageSeo.about.title = c.pageSeo.home.title;
    c.areaPages[1].intro = c.areaPages[0].intro.map((p) => p.replaceAll(c.areaPages[0].name, c.areaPages[1].name));
    const problems = checkContent(c);
    expect(hasErrors(problems)).toBe(false);
    expect(messages(c, "warning")).toHaveLength(2);
  });
});
