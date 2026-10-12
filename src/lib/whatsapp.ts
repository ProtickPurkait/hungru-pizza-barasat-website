import { business, copy } from "@/data/site";
import { formatINR } from "./format";
import { fill } from "./text";

export function waUrl(text?: string, number: string = business.whatsapp): string {
  const base = `https://wa.me/${number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** Fills a WhatsApp message template from copy.whatsapp. {business} is always available. */
function message(template: string, values: Record<string, string> = {}): string {
  return fill(template, { business: business.name, ...values });
}

export function defaultWhatsAppText(): string {
  return message(copy.whatsapp.general);
}

/** "*Name:* Asha". A value of several lines (a cart, a long typed order) starts on the line below its label. */
function lines(rows: [string, string | undefined][]): string {
  return rows
    .filter(([, v]) => v !== undefined && v.trim() !== "")
    .map(([k, v]) => {
      const value = v!.trim();
      return value.includes("\n") ? `*${k}:*\n${value}` : `*${k}:* ${value}`;
    })
    .join("\n");
}

export interface OrderForm {
  name: string;
  phone: string;
  /** Delivery area, or the pickup label. */
  locality: string;
  /** A map link to the customer, when they checked their distance instead of picking an area. */
  location?: string;
  when: string;
  order: string;
  message: string;
}

export function orderMessage(form: OrderForm): string {
  return [
    message(copy.whatsapp.orderStart),
    "",
    lines([
      ["Name", form.name],
      ["Phone", form.phone],
      ["Deliver to", form.locality],
      [copy.delivery.locationLabel, form.location],
      ["When", form.when],
      ["Order", form.order],
      ["Note", form.message],
    ]),
    "",
    message(copy.whatsapp.orderEnd),
    "(Sent from the website)",
  ].join("\n");
}

/** A job application from the Careers page. */
export interface Application {
  name: string;
  phone: string;
  /** The job's title, or the "any job" label. */
  role: string;
  experience: string;
  /** Where they live. */
  area: string;
  message: string;
}

export function applicationText(): string {
  return message(copy.whatsapp.applyStart);
}

export function applicationMessage(form: Application): string {
  return [
    message(copy.whatsapp.applyStart),
    "",
    lines([
      ["Job", form.role],
      ["Name", form.name],
      ["Phone", form.phone],
      ["Experience", form.experience],
      ["Lives in", form.area],
      ["Note", form.message],
    ]),
    "",
    message(copy.whatsapp.applyEnd),
    "(Sent from the website)",
  ].join("\n");
}

export interface BuiltPizza {
  size: string;
  /** The crust, e.g. "Cheese burst". */
  base: string;
  cheese: string;
  toppings: string[];
  quantity: number;
  /** Price of one pizza and of the whole order, in rupees. */
  each: number;
  total: number;
}

export function builderMessage(p: BuiltPizza, noToppings: string): string {
  return [
    message(copy.whatsapp.builderStart),
    "",
    lines([
      ["Size", p.size],
      ["Crust", p.base],
      ["Cheese", p.cheese],
      ["Toppings", p.toppings.length ? p.toppings.join(", ") : noToppings],
      ["How many", String(p.quantity)],
      ["Website price", p.quantity > 1 ? `${formatINR(p.total)} (${p.quantity} × ${formatINR(p.each)})` : formatINR(p.total)],
    ]),
    "",
    message(copy.whatsapp.builderEnd),
  ].join("\n");
}

export function projectMessage(title: string): string {
  return message(copy.whatsapp.project, { project: title });
}

/** {service} is the menu section's short name ("Veg pizzas"). */
export function serviceMessage(serviceName: string): string {
  return message(copy.whatsapp.service, { service: serviceName });
}

export function areaMessage(areaName: string): string {
  return message(copy.whatsapp.area, { area: areaName });
}

/** Opens WhatsApp in a new tab, falling back to the same tab if pop-ups are blocked. */
export function openWhatsApp(url: string): void {
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) window.location.href = url;
}
