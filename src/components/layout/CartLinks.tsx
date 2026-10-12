import { useEffect, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { builder, copy, services } from "@/data/site";
import { priceCart } from "@/lib/cart";
import { CART_ADDED, useCart } from "@/lib/cart-store";
import { paths } from "@/lib/paths";
import { fill } from "@/lib/text";
import { cn } from "@/lib/utils";

/** "1 item" / "3 items". */
export function itemsText(count: number): string {
  return count === 1 ? copy.cart.item : fill(copy.cart.items, { count });
}

/** How many things are in the cart (dishes no longer on the menu are not counted). */
export function useCartCount(): number {
  const lines = useCart();
  return priceCart(lines, services, builder, { builtName: copy.cart.builtName, noToppings: copy.builderPage.noToppings }).count;
}

/** The cart button in the header, with how many things are in it. */
export function CartButton({ className }: { className?: string }) {
  const count = useCartCount();
  return (
    <Button asChild variant="outline" size="icon-sm" className={cn("relative", className)}>
      <Link to={paths.cart} aria-label={fill(copy.cart.buttonLabel, { items: itemsText(count) })}>
        <ShoppingBag />
        {count > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-maroon-500 px-1 text-[0.7rem] leading-none font-bold text-white tabular-nums"
          >
            {count}
          </span>
        )}
      </Link>
    </Button>
  );
}

/** A short note at the foot of the screen after something is added, with a link to the cart. */
export function CartToast() {
  const [note, setNote] = useState<{ what: string; n: number } | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const onAdded = (e: Event) => setNote((cur) => ({ what: String((e as CustomEvent).detail ?? ""), n: (cur?.n ?? 0) + 1 }));
    window.addEventListener(CART_ADDED, onAdded);
    return () => window.removeEventListener(CART_ADDED, onAdded);
  }, []);

  useEffect(() => {
    if (!note) return;
    const t = window.setTimeout(() => setNote(null), 4000);
    return () => window.clearTimeout(t);
  }, [note]);

  // Gone once the visitor moves to another page.
  useEffect(() => setNote(null), [pathname]);

  return (
    // Above the phone call and WhatsApp bar; clear of the floating WhatsApp button on bigger screens.
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-4 md:bottom-8"
    >
      {note && (
        <div
          key={note.n}
          className="pointer-events-auto flex max-w-md animate-in items-center gap-3 rounded-full bg-ink py-1.5 pr-1.5 pl-4 text-sm text-sheet shadow-[0_14px_34px_-10px_rgb(22_21_20/0.5)] duration-300 fade-in slide-in-from-bottom-2"
        >
          <Check className="size-4 shrink-0 text-whatsapp" strokeWidth={3} aria-hidden="true" />
          <span className="min-w-0 truncate">
            {copy.cart.added} <span className="font-semibold">{note.what}</span>
          </span>
          <Link
            to={paths.cart}
            className="inline-flex min-h-10 shrink-0 items-center rounded-full bg-sheet px-4 font-semibold text-ink hover:bg-cheese-300 hover:text-ink"
          >
            {copy.cart.viewCart}
          </Link>
        </div>
      )}
    </div>
  );
}
