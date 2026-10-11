import { describe, expect, it } from "vitest";
import { normalizeIndianMobile, validateApplication, validateOrder } from "@/lib/validation";

describe("normalizeIndianMobile", () => {
  it.each([
    ["9830012345", "9830012345"],
    ["98300 12345", "9830012345"],
    ["+91 98300 12345", "9830012345"],
    ["+91-98300-12345", "9830012345"],
    ["919830012345", "9830012345"],
    ["09830012345", "9830012345"],
    ["091631 48329", "9163148329"],
  ])("accepts %s", (input, expected) => {
    expect(normalizeIndianMobile(input)).toBe(expected);
  });

  it.each(["12345", "5830012345", "98300123456", "abcdefghij", "033 2412 3456", ""])("rejects %s", (input) => {
    expect(normalizeIndianMobile(input)).toBeNull();
  });
});

const valid = {
  name: "Rahul",
  phone: "9830012345",
  locality: "Ballygunge",
  when: "As soon as possible",
  order: "1 Margherita",
  message: "",
};

describe("validateOrder", () => {
  it("passes a complete order with an empty optional note", () => {
    expect(validateOrder(valid)).toEqual({});
  });

  it("flags every missing required field", () => {
    const errors = validateOrder({ name: " ", phone: "", locality: "", when: "", order: "  ", message: "" });
    expect(Object.keys(errors).sort()).toEqual(["locality", "name", "order", "phone", "when"]);
  });

  it("flags a bad phone number, a very long order and a too-long note", () => {
    const errors = validateOrder({ ...valid, phone: "12345", order: "x".repeat(700), message: "x".repeat(600) });
    expect(errors.phone).toMatch(/10-digit/);
    expect(errors.order).toBeDefined();
    expect(errors.message).toBeDefined();
  });
});

describe("validateApplication", () => {
  const ok = { name: "Priya Saha", phone: "98300 12345", role: "Pizza maker", experience: "1 to 3 years", area: "Champadali", message: "" };

  it("accepts a complete application", () => {
    expect(validateApplication(ok)).toEqual({});
  });

  it("asks for each missing field", () => {
    const errors = validateApplication({ name: "", phone: "123", role: "", experience: "", area: " ", message: "x".repeat(501) });
    expect(Object.keys(errors).sort()).toEqual(["area", "experience", "message", "name", "phone", "role"]);
  });
});
