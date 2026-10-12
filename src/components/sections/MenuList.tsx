import { useEffect, useState } from "react";
import { Check, Plus } from "lucide-react";
import { DietMark } from "@/components/common/DietMark";
import { copy } from "@/data/site";
import type { MenuItem, MenuPrice } from "@/data/types";
import { lineKey } from "@/lib/cart";
import { addToCart, useCart } from "@/lib/cart-store";
import { formatINR } from "@/lib/format";
import { anchorFor } from "@/lib/paths";
import { fill } from "@/lib/text";
import { cn } from "@/lib/utils";

/** "From ₹139": the lowest price in a menu section. */
export function lowestPrice(items: MenuItem[]): number {
  return items.reduce((min, it) => it.prices.reduce((m, p) => Math.min(m, p.price), min), Number.POSITIVE_INFINITY);
}

/**
 * One price as an add button: the size above, the price and a plus beside it. A tap adds that
 * dish in that size to the cart; the plus turns into a tick for a moment, and a small badge
 * shows how many are already in the cart.
 */
function AddPrice({ section, item, price, inCart }: { section: string; item: MenuItem; price: MenuPrice; inCart: number }) {
  const [justAdded, setJustAdded] = useState(false);
  useEffect(() => {
    if (!justAdded) return;
    const t = window.setTimeout(() => setJustAdded(false), 1200);
    return () => window.clearTimeout(t);
  }, [justAdded]);

  const what = [item.name, price.size].filter(Boolean).join(", ");
  const add = () => {
    addToCart({ kind: "dish", section, name: item.name, size: price.size, qty: 1 }, what);
    setJustAdded(true);
  };

  return (
    <button
      type="button"
      onClick={add}
      aria-label={fill(copy.cart.addLabel, { item: `${what}, ${formatINR(price.price)}` })}
      className="group/add relative flex min-h-11 flex-col items-end justify-center rounded-xl border-[1.5px] border-ash-200 bg-sheet py-1 pr-2 pl-2.5 transition-colors hover:border-maroon-500 active:translate-y-px"
    >
      {price.size && <span className="label text-[0.6rem] whitespace-nowrap text-ash-600">{price.size}</span>}
      <span className="flex items-center gap-1">
        <span className="figure text-[1.35rem] text-ink">{formatINR(price.price)}</span>
        <span
          aria-hidden="true"
          className={cn(
            "grid size-5 place-items-center rounded-full transition-colors",
            justAdded ? "bg-whatsapp text-ink" : "bg-maroon-500 text-white group-hover/add:bg-maroon-700",
          )}
        >
          {justAdded ? <Check className="size-3.5" strokeWidth={3} /> : <Plus className="size-3.5" strokeWidth={3} />}
        </span>
      </span>
      {inCart > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-2 -right-2 grid min-w-5 place-items-center rounded-full bg-ink px-1 text-[0.7rem] leading-5 font-bold text-sheet tabular-nums"
        >
          {inCart}
        </span>
      )}
    </button>
  );
}

/**
 * Dishes as a printed menu: food mark, name and prices on one line with a dotted leader
 * between them, the description underneath. Each price is a button that adds the dish in
 * that size to the cart. With `anchors` (a section's own page), each dish has an id, so the
 * site search can open the page at it: /menu/veg-pizzas/#tandoori-paneer-pizza.
 */
export function MenuList({
  section,
  items,
  headingLevel = "h3",
  columns = 1,
  anchors = false,
  className,
}: {
  /** The menu section's slug, which the cart keeps with each dish. */
  section: string;
  items: MenuItem[];
  headingLevel?: "h3" | "h4";
  columns?: 1 | 2;
  anchors?: boolean;
  className?: string;
}) {
  const H = headingLevel;
  const cart = useCart();
  const qtyOf = (name: string, size: string) => cart.find((l) => lineKey(l) === lineKey({ kind: "dish", section, name, size, qty: 1 }))?.qty ?? 0;

  return (
    <ul className={cn("grid gap-x-12 gap-y-7", columns === 2 && "lg:grid-cols-2", className)}>
      {items.map((it) => (
        <li key={it.name} id={anchors ? anchorFor(it.name) : undefined} data-flash={anchors || undefined}>
          {/* Three or more prices drop below a long name on narrow screens instead of squeezing it */}
          <div className={cn("flex items-end gap-x-3 gap-y-2", it.prices.length > 2 && "flex-wrap")}>
            {/* The mark stays beside the first line; a long name and its tag wrap next to it */}
            <H className="flex min-w-0 items-start gap-x-2.5 text-[1.3rem] leading-tight sm:text-[1.4rem]">
              <DietMark diet={it.diet} className="mt-[0.2em]" />
              <span className="min-w-0">
                {it.name}
                {it.tag && (
                  <span className="label ml-2 inline-block rounded-full bg-maroon-50 px-2 py-1 align-[0.2em] text-[0.58rem] tracking-[0.08em] text-maroon-600">
                    {it.tag}
                  </span>
                )}
              </span>
            </H>
            <span aria-hidden="true" className="mb-3 hidden min-w-6 flex-1 border-b-2 border-dotted border-ash-300 sm:block" />
            <span className={cn("ml-auto flex shrink-0", it.prices.length > 2 ? "gap-2" : "gap-2.5")}>
              {it.prices.map((p, i) => (
                <AddPrice key={i} section={section} item={it} price={p} inCart={qtyOf(it.name, p.size)} />
              ))}
            </span>
          </div>
          <p className="mt-1.5 max-w-[52ch] leading-relaxed text-ash-600">{it.description}</p>
        </li>
      ))}
    </ul>
  );
}
