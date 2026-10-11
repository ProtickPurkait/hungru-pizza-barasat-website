import { useEffect, useId, useState } from "react";
import { Info, Minus, Phone, Plus } from "lucide-react";
import { DietMark } from "@/components/common/DietMark";
import { WhatsAppIcon } from "@/components/common/icons";
import { PageHero } from "@/components/common/PageHero";
import { JsonLd, Seo } from "@/components/common/Seo";
import { CtaBand } from "@/components/sections/CtaBand";
import { OrderTicket } from "@/components/sections/OrderTicket";
import { Button } from "@/components/ui/button";
import { builder, business, copy, pageSeo } from "@/data/site";
import type { BuilderOption, BuilderSize } from "@/data/types";
import { clampQuantity, cleanToppings, extraCost, pizzaDiet, pricePizza } from "@/lib/builder";
import { formatINR } from "@/lib/format";
import { paths, telHref } from "@/lib/paths";
import { breadcrumbSchema } from "@/lib/schema";
import { fill } from "@/lib/text";
import { builderMessage, waUrl } from "@/lib/whatsapp";

const legendClass = "font-display text-[1.75rem] leading-none font-[740] text-ink [font-stretch:84%]";

/** "No extra cost" for free choices, "+₹30" for the rest. */
const extra = (price: number) => (price > 0 ? `+${formatINR(price)}` : "No extra cost");

function RadioCards<T extends BuilderOption | BuilderSize>({
  legend,
  name,
  options,
  value,
  onChange,
  priceLabel,
  columns = "sm:grid-cols-2",
}: {
  legend: string;
  name: string;
  options: T[];
  value: string;
  onChange: (id: string) => void;
  priceLabel: (o: T) => string;
  columns?: string;
}) {
  return (
    <fieldset>
      <legend className={legendClass}>{legend}</legend>
      <div className={`mt-4 grid gap-3 ${columns}`}>
        {options.map((o) => (
          <label key={o.id} className="radio-card flex min-h-[4.5rem] items-start gap-3.5 px-4 py-3.5">
            <input
              type="radio"
              name={name}
              value={o.id}
              checked={value === o.id}
              onChange={() => onChange(o.id)}
              className="mt-0.5 size-5 shrink-0 accent-maroon-500"
            />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-ink">{o.label}</span>
              {o.note && <span className="mt-0.5 block text-sm text-ash-600">{o.note}</span>}
            </span>
            <span className="shrink-0 text-sm font-semibold text-ash-700 tabular-nums">{priceLabel(o)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function Builder() {
  const uid = useId();
  const text = copy.builderPage;
  const crumbs = [
    { name: copy.nav.home, path: paths.home },
    { name: copy.nav.builder, path: paths.builder },
  ];
  const [size, setSize] = useState(builder.sizes[0]!.id);
  const [base, setBase] = useState(builder.bases[0]!.id);
  const [cheese, setCheese] = useState(builder.cheeses[0]!.id);
  const [toppings, setToppings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  // ?size=large&toppings=mushroom,olives from the home page example. Read after mount so prerendered HTML and hydration match.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const pick = (list: { id: string }[], id: string | null) => (id && list.some((o) => o.id === id) ? id : null);
    const s = pick(builder.sizes, q.get("size"));
    const b = pick(builder.bases, q.get("base"));
    const c = pick(builder.cheeses, q.get("cheese"));
    if (s) setSize(s);
    if (b) setBase(b);
    if (c) setCheese(c);
    const t = q.get("toppings");
    if (t) setToppings(cleanToppings(t.split(","), builder));
  }, []);

  const sizeOption = builder.sizes.find((s) => s.id === size) ?? builder.sizes[0]!;
  const price = pricePizza({ size, base, cheese, toppings, quantity }, builder);
  const diet = pizzaDiet(toppings, builder);
  const full = toppings.length >= builder.maxToppings;
  const label = (list: BuilderOption[], id: string) => list.find((x) => x.id === id)?.label ?? id;
  const extraLabel = (o: BuilderOption) => extra(extraCost(o, sizeOption));

  const toggleTopping = (id: string) =>
    setToppings((t) => (t.includes(id) ? t.filter((x) => x !== id) : cleanToppings([...t, id], builder)));

  const message = builderMessage(
    {
      size: sizeOption.label,
      base: label(builder.bases, base),
      cheese: label(builder.cheeses, cheese),
      toppings: toppings.map((id) => label(builder.toppings, id)),
      quantity: price.quantity,
      each: price.each,
      total: price.total,
    },
    text.noToppings,
  );

  return (
    <>
      <Seo {...pageSeo.builder} path={paths.builder} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <PageHero breadcrumbs={crumbs} eyebrow={text.hero.eyebrow} title={text.hero.title} lead={text.hero.lead} />

      <section aria-label="Pizza builder" className="wrap py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <form className="flex min-w-0 flex-col gap-11 lg:col-span-7" onSubmit={(e) => e.preventDefault()} aria-label="Your pizza">
            <RadioCards
              legend={text.sizeLegend}
              name="size"
              options={builder.sizes}
              value={size}
              onChange={setSize}
              priceLabel={(o) => formatINR(o.price)}
            />
            <RadioCards legend={text.baseLegend} name="base" options={builder.bases} value={base} onChange={setBase} priceLabel={extraLabel} />
            <RadioCards legend={text.cheeseLegend} name="cheese" options={builder.cheeses} value={cheese} onChange={setCheese} priceLabel={extraLabel} />

            <fieldset aria-describedby={`${uid}-toppings-hint`}>
              <legend className={legendClass}>{text.toppingsLegend}</legend>
              <p id={`${uid}-toppings-hint`} className="mt-3 flex items-start gap-2 text-sm text-ash-700">
                <Info className="mt-0.5 size-4 shrink-0 text-maroon-600" aria-hidden="true" />
                <span>
                  {fill(text.toppingsHint, { max: String(builder.maxToppings) })}{" "}
                  <strong className="font-semibold text-ink" aria-live="polite">
                    {toppings.length} of {builder.maxToppings} chosen.
                  </strong>
                </span>
              </p>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {builder.toppings.map((t) => {
                  const checked = toppings.includes(t.id);
                  return (
                    <label key={t.id} className="radio-card flex min-h-14 items-center gap-3 px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!checked && full}
                        onChange={() => toggleTopping(t.id)}
                        className="size-5 shrink-0 accent-maroon-500"
                      />
                      <DietMark diet={t.diet} />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-ink">{t.label}</span>
                        {t.note && <span className="block text-xs text-ash-600">{t.note}</span>}
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-ash-700 tabular-nums">+{formatINR(extraCost(t, sizeOption))}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className={legendClass}>{text.quantityLegend}</legend>
              <div className="mt-4 flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((n) => clampQuantity(n - 1, builder))}
                  disabled={quantity <= 1}
                  aria-label="One fewer pizza"
                >
                  <Minus />
                </Button>
                <label htmlFor={`${uid}-qty`} className="sr-only">
                  Number of pizzas
                </label>
                <input
                  id={`${uid}-qty`}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={builder.maxQuantity}
                  value={quantity}
                  onChange={(e) => setQuantity(clampQuantity(Number(e.target.value), builder))}
                  className="figure h-12 w-20 rounded-md border-[1.5px] border-input bg-white text-center text-[1.8rem] text-ink"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((n) => clampQuantity(n + 1, builder))}
                  disabled={quantity >= builder.maxQuantity}
                  aria-label="One more pizza"
                >
                  <Plus />
                </Button>
              </div>
            </fieldset>
          </form>

          <aside aria-label={text.resultTitle} className="min-w-0 lg:sticky lg:top-24 lg:col-span-5 lg:self-start">
            <div className="drop-shadow-[0_22px_28px_rgb(22_21_20/0.16)]">
              <OrderTicket title={text.resultTitle} price={price} diet={diet} includedLabel="No charge" live>
                <p className="mt-5 flex items-start gap-2 text-sm font-semibold text-ink">
                  <Info className="mt-0.5 size-4 shrink-0 text-maroon-600" aria-hidden="true" />
                  {text.disclaimer}
                </p>
                <Button asChild variant="whatsapp" size="lg" className="mt-4 w-full">
                  <a href={waUrl(message)} target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon className="size-5" />
                    {text.orderButton}
                    <span className="sr-only"> (opens WhatsApp)</span>
                  </a>
                </Button>
                <Button asChild variant="outline" className="mt-3 w-full">
                  <a href={telHref(business.phone.tel)}>
                    <Phone />
                    Call {business.phone.display}
                  </a>
                </Button>
                <p className="mt-4 text-xs leading-relaxed text-ash-600">{text.includedNote}</p>
              </OrderTicket>
            </div>
          </aside>
        </div>
      </section>

      <CtaBand title={text.ctaTitle} />
    </>
  );
}
