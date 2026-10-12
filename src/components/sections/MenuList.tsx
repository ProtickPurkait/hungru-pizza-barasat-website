import { useEffect, useState } from "react";
import { Check, Plus, UtensilsCrossed, X } from "lucide-react";
import { DietMark } from "@/components/common/DietMark";
import { SitePhoto } from "@/components/common/SitePhoto";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
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

/** A dish's photo as a small square that opens it bigger. A dish without one gets a plain tile, so the list stays in line. */
function DishThumb({ item, onOpen }: { item: MenuItem; onOpen: () => void }) {
  if (!item.photo) {
    return (
      <span aria-hidden="true" className="grid size-full place-items-center rounded-2xl bg-ash-100 text-ash-400">
        <UtensilsCrossed className="size-6" />
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-label={fill(copy.menu.photoOpen, { item: item.name })}
      className="group/photo block size-full overflow-hidden rounded-2xl"
    >
      <SitePhoto
        photo={item.photo}
        ratio={1}
        maxWidth={360}
        sizes="(min-width: 640px) 88px, 72px"
        alt=""
        className="size-full transition-transform duration-500 ease-out-expo group-hover/photo:scale-105"
      />
    </button>
  );
}

/** A dish's photo, big, with its name, what is in it and its add buttons. */
function DishPhoto({ section, item, qtyOf, onClose }: { section: string; item: MenuItem; qtyOf: (size: string) => number; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-[1.5rem] border-0 bg-ground p-0 sm:max-w-xl">
        <div className="relative">
          <SitePhoto photo={item.photo} ratio={4 / 3} maxWidth={960} sizes="(min-width: 640px) 576px, calc(100vw - 2rem)" />
          <DialogClose
            aria-label={copy.menu.photoClose}
            className="absolute top-3 right-3 grid size-11 place-items-center rounded-full bg-ground/90 text-ink shadow-[0_4px_14px_rgb(22_21_20/0.25)] transition-colors hover:bg-ground"
          >
            <X className="size-5" aria-hidden="true" />
          </DialogClose>
        </div>
        <div className="p-5 sm:p-6">
          <DialogTitle className="flex items-start gap-x-2.5 font-display text-[1.6rem] leading-tight font-[740] text-ink [font-stretch:84%]">
            <DietMark diet={item.diet} className="mt-[0.3em]" />
            {item.name}
          </DialogTitle>
          {item.description ? (
            <DialogDescription className="mt-2 leading-relaxed text-ash-600">{item.description}</DialogDescription>
          ) : (
            <DialogDescription className="sr-only">{item.name}</DialogDescription>
          )}
          <div className="mt-5 flex flex-wrap gap-2.5">
            {item.prices.map((p, i) => (
              <AddPrice key={i} section={section} item={item} price={p} inCart={qtyOf(p.size)} />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Dishes as a printed menu, each with its photo: food mark, name and prices on one line with a
 * dotted leader between them, the description underneath. Each price is a button that adds the
 * dish in that size to the cart. Two prices go under the description on phones (and in the narrow
 * two-column view from 1024 to 1279px), three or more always do, so the name keeps its room.
 * Tapping a photo shows it bigger.
 * With `anchors` (a section's own page), each dish has an id, so the site search can open the
 * page at it: /menu/veg-pizzas/#tandoori-paneer-pizza.
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
  const [zoom, setZoom] = useState<MenuItem | null>(null);
  const qtyOf = (name: string, size: string) => cart.find((l) => lineKey(l) === lineKey({ kind: "dish", section, name, size, qty: 1 }))?.qty ?? 0;

  return (
    <>
      <ul className={cn("grid grid-cols-1 gap-x-12 gap-y-8", columns === 2 && "lg:grid-cols-2", className)}>
        {items.map((it) => {
          const many = it.prices.length > 2;
          const two = it.prices.length === 2;
          // Where the prices go: beside the name (with the dotted leader) or under the description.
          const beside = it.prices.length === 1 ? "ml-auto flex" : columns === 2 ? "ml-auto hidden sm:flex lg:hidden xl:flex" : "ml-auto hidden sm:flex";
          const below = many ? "mt-3" : columns === 2 ? "mt-3 sm:hidden lg:flex xl:hidden" : "mt-3 sm:hidden";
          const prices = (place: string) => (
            <span className={cn("flex shrink-0 flex-wrap", many ? "gap-2" : "gap-2.5", place)}>
              {it.prices.map((p, i) => (
                <AddPrice key={i} section={section} item={it} price={p} inCart={qtyOf(it.name, p.size)} />
              ))}
            </span>
          );
          return (
            <li key={it.name} id={anchors ? anchorFor(it.name) : undefined} data-flash={anchors || undefined} className="flex gap-3.5 sm:gap-4">
              <div className="size-[4.5rem] shrink-0 sm:size-[5.5rem]">
                <DishThumb item={it} onOpen={() => setZoom(it)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-end gap-x-3">
                  {/* The mark stays beside the first line; a long name and its tag wrap next to it */}
                  <H className="flex min-w-0 items-start gap-x-2.5 text-[1.3rem] leading-tight sm:text-[1.4rem]">
                    <DietMark diet={it.diet} className="mt-[0.2em]" />
                    <span className="min-w-0 break-words">
                      {it.name}
                      {it.tag && (
                        <span className="label ml-2 inline-block rounded-full bg-maroon-50 px-2 py-1 align-[0.2em] text-[0.58rem] tracking-[0.08em] text-maroon-600">
                          {it.tag}
                        </span>
                      )}
                    </span>
                  </H>
                  {!many && (
                    <>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "mb-3 hidden min-w-6 flex-1 border-b-2 border-dotted border-ash-300 sm:block",
                          two && columns === 2 && "lg:hidden xl:block",
                        )}
                      />
                      {prices(beside)}
                    </>
                  )}
                </div>
                {it.description && <p className="mt-1.5 max-w-[52ch] leading-relaxed text-ash-600">{it.description}</p>}
                {it.prices.length > 1 && prices(below)}
              </div>
            </li>
          );
        })}
      </ul>
      {zoom && <DishPhoto section={section} item={zoom} qtyOf={(size) => qtyOf(zoom.name, size)} onClose={() => setZoom(null)} />}
    </>
  );
}
