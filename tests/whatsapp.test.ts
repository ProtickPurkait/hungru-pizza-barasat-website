import { describe, expect, it } from "vitest";
import { business } from "@/data/site";
import { applicationMessage, builderMessage, orderMessage, waUrl } from "@/lib/whatsapp";

const form = {
  name: "Rahul Das",
  phone: "98300 12345",
  locality: "Champadali",
  when: "Dinner, 8 to 10:30 pm",
  order: "1 Tandoori Paneer Pizza (10 inch) & 1 Butter Cheesy Garlic Bread",
  message: "Less chilli? Flat 3B",
};

describe("waUrl", () => {
  it("points at the business WhatsApp number", () => {
    expect(waUrl()).toBe(`https://wa.me/${business.whatsapp}`);
  });

  it("URL-encodes the message so it round-trips exactly", () => {
    const text = orderMessage(form);
    const url = new URL(waUrl(text));
    expect(url.hostname).toBe("wa.me");
    expect(url.searchParams.get("text")).toBe(text);
    expect(url.search).not.toContain(" ");
    expect(url.search).not.toContain("& 1 Butter");
  });
});

describe("orderMessage", () => {
  it("lists every field with bold labels", () => {
    const msg = orderMessage(form);
    expect(msg).toContain("*order*");
    expect(msg).toContain("*Name:* Rahul Das");
    expect(msg).toContain("*Phone:* 98300 12345");
    expect(msg).toContain("*Deliver to:* Champadali");
    expect(msg).toContain("*When:* Dinner, 8 to 10:30 pm");
    expect(msg).toContain("*Order:* 1 Tandoori Paneer Pizza (10 inch)");
    expect(msg).toContain("*Note:* Less chilli?");
  });

  it("leaves out an empty optional note", () => {
    expect(orderMessage({ ...form, message: "  " })).not.toContain("*Note:*");
  });

  it("starts an order of several lines (a cart) on the line below its label", () => {
    const cart = "2 × Tandoori Paneer (8 inch) = ₹420\nItems total: ₹420";
    expect(orderMessage({ ...form, order: cart })).toContain(`*Order:*\n${cart}\n*Note:*`);
  });
});

describe("builderMessage", () => {
  const pizza = { size: "10 inch", base: "Cheese burst", cheese: "Mozzarella", toppings: ["Paneer", "Capsicum"], quantity: 2, each: 540, total: 1080 };

  it("lists the pizza and the website price", () => {
    const msg = builderMessage(pizza, "No extra toppings");
    expect(msg).toContain("*Size:* 10 inch");
    expect(msg).toContain("*Crust:* Cheese burst");
    expect(msg).toContain("*Toppings:* Paneer, Capsicum");
    expect(msg).toContain("*How many:* 2");
    expect(msg).toContain("*Website price:* ₹1,080 (2 × ₹540)");
  });

  it("says so when there are no toppings, and shows one price for one pizza", () => {
    const msg = builderMessage({ ...pizza, toppings: [], quantity: 1, total: 540 }, "No extra toppings");
    expect(msg).toContain("*Toppings:* No extra toppings");
    expect(msg).toContain("*Website price:* ₹540");
    expect(msg).not.toContain("×");
  });
});

describe("applicationMessage", () => {
  it("writes out the job and the applicant's details", () => {
    const text = applicationMessage({ name: "Priya Saha", phone: "98300 12345", role: "Delivery rider", experience: "No experience yet", area: "Hridaypur", message: "" });
    expect(text).toContain("apply for a job");
    expect(text).toContain("*Job:* Delivery rider");
    expect(text).toContain("*Lives in:* Hridaypur");
    expect(text).not.toContain("*Note:*");
  });
});
