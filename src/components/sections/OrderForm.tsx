import { useId, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, MessageCircleQuestion, Phone, ShoppingBag } from "lucide-react";
import { Link } from "react-router";
import { WhatsAppIcon } from "@/components/common/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { InlineText } from "@/components/common/Prose";
import { RichText } from "@/components/common/RichText";
import { itemsText, useCartCount } from "@/components/layout/CartLinks";
import { business, copy, localities, whenOptions } from "@/data/site";
import { deliveryLocalities, formatKm, mapsLink } from "@/lib/distance";
import { paths, telHref } from "@/lib/paths";
import { MESSAGE_MAX, ORDER_MAX, validateOrder, type FormErrors } from "@/lib/validation";
import { openWhatsApp, orderMessage, waUrl, type OrderForm as FormValues } from "@/lib/whatsapp";
import { fill } from "@/lib/text";
import { cn } from "@/lib/utils";
import { DistanceCheck, type DistanceResult } from "./DistanceCheck";

const fieldOrder: (keyof FormValues)[] = ["name", "phone", "locality", "when", "order", "message"];
/** "Deliver to": somewhere not in the area list, checked by distance. */
const ELSEWHERE = "elsewhere";

interface OrderFormProps {
  /** Pre-selects the delivery area, e.g. on an area page. Use the locality name. */
  defaultLocality?: string;
  /**
   * On the cart page: the cart written out as order lines. The "your order" box is left out
   * and the cart is sent instead; after sending, the visitor can empty the cart.
   */
  cart?: { text: string; onNewOrder: () => void };
  className?: string;
}

/** Order form. No backend: on submit it opens WhatsApp with the order written out. */
export function OrderForm({ defaultLocality = "", cart, className }: OrderFormProps) {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  // Only the areas inside the delivery circle are offered (an area page outside it starts with nothing chosen).
  const areas = deliveryLocalities(localities, business.geo, business.deliveryKm);
  const start = areas.some((a) => a.name === defaultLocality) ? defaultLocality : "";
  const [values, setValues] = useState<FormValues>({ name: "", phone: "", locality: start, when: "", order: "", message: "" });
  const [distance, setDistance] = useState<DistanceResult>({ status: "idle" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [sentUrl, setSentUrl] = useState<string | null>(null);
  const refs = useRef<Partial<Record<keyof FormValues, HTMLElement | null>>>({});
  const text = copy.form;
  const cartCount = useCartCount();
  const km = business.deliveryKm;
  const ref = (key: keyof FormValues) => (el: HTMLElement | null) => {
    refs.current[key] = el;
  };

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    let sending = cart ? { ...values, order: cart.text } : values;
    const found = validateOrder(sending);
    // A cart can be longer than a typed order; WhatsApp takes it all.
    if (cart) delete found.order;
    // Somewhere not in the list: only once the distance check says it is inside the delivery circle.
    if (values.locality === ELSEWHERE) {
      if (distance.status === "in")
        sending = { ...sending, locality: fill(copy.delivery.otherInMessage, { distance: formatKm(distance.km) }), location: mapsLink(distance.at) };
      else found.locality = distance.status === "out" ? fill(copy.delivery.tooFar, { km }) : copy.delivery.needCheck;
    }
    setErrors(found);
    const first = fieldOrder.find((k) => found[k]);
    if (first) {
      refs.current[first]?.focus();
      return;
    }
    const url = waUrl(orderMessage(sending));
    setSentUrl(url);
    openWhatsApp(url);
  }

  const describedBy = (key: keyof FormValues) => (errors[key] ? id(`${key}-error`) : undefined);

  const onDistance = (r: DistanceResult) => {
    setDistance(r);
    if (r.status === "in" && errors.locality) setErrors((e) => ({ ...e, locality: undefined }));
  };

  const errorText = (key: keyof FormValues) =>
    errors[key] ? (
      <p id={id(`${key}-error`)} className="mt-1.5 text-sm font-medium text-destructive">
        {errors[key]}
      </p>
    ) : null;

  if (sentUrl) {
    return (
      <div className={cn("ground-light round-panel bg-sheet p-6 [--cut:28px] sm:p-10", className)} role="status">
        <CheckCircle2 className="size-11 text-whatsapp-600" aria-hidden="true" />
        <h3 className="mt-4 text-[2.2rem] sm:text-[2.6rem]">{text.successTitle}</h3>
        <p className="mt-4 max-w-[52ch] text-ash-600">
          <RichText text={fill(text.successText, { hours: business.hours.short })} />
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="whatsapp">
            <a href={sentUrl} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="size-5" />
              {text.reopen}
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={telHref(business.phone.tel)}>
              <Phone />
              {fill(text.orCall, { phone: business.phone.display })}
            </a>
          </Button>
        </div>
        {cart && (
          <Button variant="outline" className="mt-3 w-full sm:w-auto" onClick={cart.onNewOrder}>
            {copy.cart.newOrder}
          </Button>
        )}
        <button
          type="button"
          onClick={() => setSentUrl(null)}
          className="mt-5 min-h-11 text-sm font-semibold text-ash-700 underline underline-offset-4 hover:text-ink"
        >
          {text.edit}
        </button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className={cn("ground-light round-panel bg-sheet p-5 [--cut:28px] sm:p-9", className)} aria-label="Order form">
      {/* Elsewhere on the site, a reminder that the cart is waiting, so it is not left behind. */}
      {!cart && cartCount > 0 && (
        <p className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md bg-cheese-300/35 px-4 py-3 text-sm text-ink dark:bg-ash-100">
          <ShoppingBag className="size-5 shrink-0 text-maroon-600" aria-hidden="true" />
          <span>{fill(copy.cart.formBanner, { items: itemsText(cartCount) })}</span>
          <Link to={paths.cart} className="min-h-11 content-center font-semibold underline decoration-maroon-500 decoration-2 underline-offset-4">
            {copy.cart.formBannerLink}
          </Link>
        </p>
      )}
      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
        <div>
          <Label htmlFor={id("name")}>{text.name}</Label>
          <Input
            id={id("name")}
            ref={ref("name")}
            className="mt-1.5"
            autoComplete="name"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={describedBy("name")}
            required
          />
          {errorText("name")}
        </div>

        <div>
          <Label htmlFor={id("phone")}>{text.phone}</Label>
          <Input
            id={id("phone")}
            ref={ref("phone")}
            className="mt-1.5"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={text.phonePlaceholder}
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            aria-invalid={!!errors.phone}
            aria-describedby={describedBy("phone")}
            required
          />
          {errorText("phone")}
        </div>

        <div>
          <Label htmlFor={id("locality")}>{text.area}</Label>
          <NativeSelect
            id={id("locality")}
            ref={ref("locality")}
            className="mt-1.5"
            value={values.locality}
            onChange={(e) => update("locality", e.target.value)}
            aria-invalid={!!errors.locality}
            aria-describedby={[id("locality-note"), describedBy("locality")].filter(Boolean).join(" ")}
            required
          >
            <NativeSelectOption value="">{text.areaPlaceholder}</NativeSelectOption>
            <NativeSelectOption value={text.pickup}>{text.pickup}</NativeSelectOption>
            {areas.map((l) => (
              <NativeSelectOption key={l.slug} value={l.name}>
                {l.name}
              </NativeSelectOption>
            ))}
            <NativeSelectOption value={ELSEWHERE}>{fill(copy.delivery.otherArea, { km })}</NativeSelectOption>
          </NativeSelect>
          <p id={id("locality-note")} className="mt-1.5 text-sm text-ash-600">
            {fill(copy.delivery.note, { km })}
          </p>
          {values.locality === ELSEWHERE && <DistanceCheck result={distance} onResult={onDistance} onPickup={() => update("locality", text.pickup)} />}
          {errorText("locality")}
        </div>

        <div>
          <Label htmlFor={id("when")}>{text.when}</Label>
          <NativeSelect
            id={id("when")}
            ref={ref("when")}
            className="mt-1.5"
            value={values.when}
            onChange={(e) => update("when", e.target.value)}
            aria-invalid={!!errors.when}
            aria-describedby={describedBy("when")}
            required
          >
            <NativeSelectOption value="">{text.whenPlaceholder}</NativeSelectOption>
            {whenOptions.map((w, i) => (
              <NativeSelectOption key={i} value={w}>
                {w}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {errorText("when")}
        </div>

        {!cart && (
          <div className="sm:col-span-2">
            <Label htmlFor={id("order")}>{text.order}</Label>
            <Textarea
              id={id("order")}
              ref={ref("order")}
              className="mt-1.5"
              rows={3}
              maxLength={ORDER_MAX + 50}
              placeholder={text.orderPlaceholder}
              value={values.order}
              onChange={(e) => update("order", e.target.value)}
              aria-invalid={!!errors.order}
              aria-describedby={describedBy("order")}
              required
            />
            {errorText("order")}
          </div>
        )}

        <div className="sm:col-span-2">
          <Label htmlFor={id("message")}>
            {text.message} <span className="font-normal text-ash-600">(optional)</span>
          </Label>
          <Input
            id={id("message")}
            ref={ref("message")}
            className="mt-1.5"
            maxLength={MESSAGE_MAX + 50}
            placeholder={text.messagePlaceholder}
            value={values.message}
            onChange={(e) => update("message", e.target.value)}
            aria-invalid={!!errors.message}
            aria-describedby={describedBy("message")}
          />
          {errorText("message")}
        </div>
      </div>

      {/* "Not sure what to get?": not needed once the cart is chosen. */}
      {!cart && (
        <p className="mt-5 flex items-start gap-3 rounded-md border-l-[3px] border-maroon-500 bg-ground-2 px-4 py-3 text-sm text-ash-700">
          <MessageCircleQuestion className="mt-0.5 size-5 shrink-0 text-maroon-600" aria-hidden="true" />
          <span>{text.menuNote}</span>
        </p>
      )}

      <Button type="submit" variant="whatsapp" size="lg" className="mt-6 w-full">
        <WhatsAppIcon className="size-5" />
        {text.submit}
      </Button>
      <p className="mt-3 text-center text-sm text-ash-600">{text.submitNote}</p>
      {text.privacyNote && (
        <p className="mt-1 text-center text-xs leading-relaxed text-ash-600">
          <InlineText text={text.privacyNote} linkClassName="font-semibold underline underline-offset-4 hover:text-ink" />
        </p>
      )}
    </form>
  );
}
