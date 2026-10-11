import type { Application, OrderForm } from "./whatsapp";

export type FormErrors = Partial<Record<keyof OrderForm, string>>;
export type ApplicationErrors = Partial<Record<keyof Application, string>>;

/** Returns a clean 10-digit Indian mobile number, or null. Accepts +91, 91 or 0 prefixes, spaces and dashes. */
export function normalizeIndianMobile(input: string): string | null {
  let digits = input.replace(/[\s\-().]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (!/^\d+$/.test(digits)) return null;
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

export const MESSAGE_MAX = 500;

export const ORDER_MAX = 600;

export function validateOrder(form: OrderForm): FormErrors {
  const errors: FormErrors = {};
  const name = form.name.trim();
  if (name.length < 2) errors.name = "Please enter your name.";
  else if (name.length > 60) errors.name = "Please keep your name under 60 letters.";
  if (!form.phone.trim()) errors.phone = "Please enter your phone number.";
  else if (!normalizeIndianMobile(form.phone)) errors.phone = "Please enter a 10-digit mobile number, like 98300 12345.";
  if (!form.locality) errors.locality = "Please choose your area, or pickup.";
  if (!form.when) errors.when = "Please choose when you want it.";
  const order = form.order.trim();
  if (order.length < 3) errors.order = "Please tell us what you would like to order.";
  else if (order.length > ORDER_MAX) errors.order = `Please keep the order under ${ORDER_MAX} letters, or send the rest on WhatsApp.`;
  if (form.message.length > MESSAGE_MAX) errors.message = `Please keep the note under ${MESSAGE_MAX} letters.`;
  return errors;
}

function checkName(name: string): string | undefined {
  const n = name.trim();
  if (n.length < 2) return "Please enter your name.";
  if (n.length > 60) return "Please keep your name under 60 letters.";
}

function checkPhone(phone: string): string | undefined {
  if (!phone.trim()) return "Please enter your phone number.";
  if (!normalizeIndianMobile(phone)) return "Please enter a 10-digit mobile number, like 98300 12345.";
}

export function validateApplication(form: Application): ApplicationErrors {
  const errors: ApplicationErrors = {};
  errors.name = checkName(form.name);
  errors.phone = checkPhone(form.phone);
  if (!form.role) errors.role = "Please choose a job.";
  if (!form.experience) errors.experience = "Please choose your experience.";
  const area = form.area.trim();
  if (area.length < 2) errors.area = "Please tell us where you live.";
  else if (area.length > 80) errors.area = "Please keep this under 80 letters.";
  if (form.message.length > MESSAGE_MAX) errors.message = `Please keep the note under ${MESSAGE_MAX} letters.`;
  for (const key of Object.keys(errors) as (keyof Application)[]) if (!errors[key]) delete errors[key];
  return errors;
}
