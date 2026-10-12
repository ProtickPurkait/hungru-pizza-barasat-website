import { useState } from "react";
import { DietMark } from "@/components/common/DietMark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { builder, copy, services } from "@/data/site";
import type { BuilderOption } from "@/data/types";
import { extraCost } from "@/lib/builder";
import { currentExtras, priceWithExtras, withExtras, type ExtraChoices, type ExtrasChoice, type PricedLine } from "@/lib/cart";
import { updateCartLine } from "@/lib/cart-store";
import { formatINR } from "@/lib/format";
import { fill } from "@/lib/text";

const legendClass = "font-display text-[1.45rem] leading-none font-[740] text-ink [font-stretch:84%]";
const cardClass = "radio-card flex min-h-12 items-center gap-3 px-3.5 py-2.5";

/**
 * The extras panel for one cart line: crust, cheese and toppings for a pizza (at its size's
 * add-on prices, as on the pizza builder) and the section's add-ons (dips …) for any dish.
 * The price of one updates as you choose; Save changes every one on the line.
 */
export function CartExtras({ line, choices, onClose }: { line: PricedLine; choices: ExtraChoices; onClose: () => void }) {
  const text = copy.cart;
  const [choice, setChoice] = useState<ExtrasChoice>(() => currentExtras(line.line, choices));
  const cost = (o: BuilderOption) => (choices.size ? extraCost(o, choices.size) : 0);
  const priceLabel = (n: number) => (n > 0 ? `+${formatINR(n)}` : text.noCharge);
  const each = priceWithExtras(line.line, choice, services, builder);
  const full = choice.toppings.length >= choices.maxToppings;
  const item = [line.name, line.line.kind === "dish" ? line.line.size : ""].filter(Boolean).join(", ");

  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const save = () => {
    updateCartLine(line.key, withExtras(line.line, choice, choices, builder));
    onClose();
  };

  const radios = (legend: string, name: "base" | "cheese", options: BuilderOption[]) => (
    <fieldset>
      <legend className={legendClass}>{legend}</legend>
      <div className="mt-3 grid gap-2">
        {options.map((o) => (
          <label key={o.id} className={cardClass}>
            <input
              type="radio"
              name={name}
              checked={choice[name] === o.id}
              onChange={() => setChoice((c) => ({ ...c, [name]: o.id }))}
              className="size-5 shrink-0 accent-maroon-500"
            />
            <span className="min-w-0 flex-1 font-semibold text-ink">{o.label}</span>
            <span className="shrink-0 text-sm font-semibold text-ash-700 tabular-nums">{priceLabel(cost(o))}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto border-l-0 bg-ground p-0 sm:max-w-md [&>button]:top-3 [&>button]:right-3 [&>button]:grid [&>button]:size-11 [&>button]:place-items-center [&>button]:rounded-full [&>button]:opacity-100"
      >
        <SheetHeader className="gap-1.5 border-b border-ash-200 px-5 pt-5 pb-4 pr-16 text-left">
          <SheetTitle className="font-display text-[1.75rem] leading-[1.05] font-[740] text-ink [font-stretch:84%]">
            {fill(text.extrasTitle, { item })}
          </SheetTitle>
          <SheetDescription className="text-sm leading-relaxed text-ash-600">
            {text.extrasLead}
            {line.qty > 1 && ` ${fill(text.extrasForAll, { qty: line.qty })}`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-8 px-5 py-6">
          {choices.bases.length > 0 && radios(text.crustLegend, "base", choices.bases)}
          {choices.cheeses.length > 0 && radios(text.cheeseLegend, "cheese", choices.cheeses)}

          {choices.toppings.length > 0 && (
            <fieldset>
              <legend className={legendClass}>{text.toppingsLegend}</legend>
              <p className="mt-2 text-sm text-ash-600">
                {fill(text.toppingsHint, { max: choices.maxToppings })}{" "}
                <strong className="font-semibold text-ink tabular-nums" aria-live="polite">
                  {choice.toppings.length} / {choices.maxToppings}
                </strong>
              </p>
              <div className="mt-3 grid gap-2">
                {choices.toppings.map((t) => {
                  const checked = choice.toppings.includes(t.id);
                  return (
                    <label key={t.id} className={cardClass}>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!checked && full}
                        onChange={() => setChoice((c) => ({ ...c, toppings: toggle(c.toppings, t.id) }))}
                        className="size-5 shrink-0 accent-maroon-500"
                      />
                      <DietMark diet={t.diet} />
                      <span className="min-w-0 flex-1 font-semibold text-ink">{t.label}</span>
                      <span className="shrink-0 text-sm font-semibold text-ash-700 tabular-nums">{priceLabel(cost(t))}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          {choices.addOns.length > 0 && (
            <fieldset>
              <legend className={legendClass}>{text.addOnsLegend}</legend>
              <div className="mt-3 grid gap-2">
                {choices.addOns.map((a) => (
                  <label key={a.id} className={cardClass}>
                    <input
                      type="checkbox"
                      checked={choice.addOns.includes(a.id)}
                      onChange={() => setChoice((c) => ({ ...c, addOns: toggle(c.addOns, a.id) }))}
                      className="size-5 shrink-0 accent-maroon-500"
                    />
                    <span className="min-w-0 flex-1 font-semibold text-ink">{a.label}</span>
                    <span className="shrink-0 text-sm font-semibold text-ash-700 tabular-nums">{priceLabel(a.price)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
        </div>

        <SheetFooter className="sticky bottom-0 gap-3 border-t border-ash-200 bg-ground px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <p className="text-right text-ink" aria-live="polite">
            {text.extrasEach}
            <span className="figure ml-2 text-[1.8rem]">{formatINR(each)}</span>
          </p>
          <div className="flex gap-3">
            <Button size="lg" className="flex-1" onClick={save}>
              {text.save}
            </Button>
            <Button size="lg" variant="outline" onClick={onClose}>
              {text.cancel}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
