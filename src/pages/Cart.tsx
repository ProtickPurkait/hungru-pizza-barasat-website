import { useRef, useState, useSyncExternalStore } from "react";
import { Minus, Plus, ShoppingBag, SlidersHorizontal, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { DietMark } from "@/components/common/DietMark";
import { Seo } from "@/components/common/Seo";
import { itemsText } from "@/components/layout/CartLinks";
import { CartExtras } from "@/components/sections/CartExtras";
import { OrderForm } from "@/components/sections/OrderForm";
import { Button } from "@/components/ui/button";
import { builder, copy, pageSeo, services } from "@/data/site";
import { cartOrderText, extraChoices, MAX_LINE_QTY, priceCart, type PricedLine } from "@/lib/cart";
import { clearCart, setCartQty, useCart } from "@/lib/cart-store";
import { useCoversCtaBar } from "@/lib/cta-bar";
import { formatINR } from "@/lib/format";
import { paths } from "@/lib/paths";
import { fill } from "@/lib/text";

const noSubscribe = () => () => {};
/** False while prerendering and hydrating (the cart lives in the browser), so a full cart never flashes "empty" first. */
const useInBrowser = () =>
  useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );

function CartRow({ line }: { line: PricedLine }) {
  const text = copy.cart;
  const item = [line.name, line.detail].filter(Boolean).join(", ");
  // Crust, cheese and toppings for a pizza, the section's add-ons (dips …) for other dishes.
  const choices = extraChoices(line.line, services, builder);
  const [extrasOpen, setExtrasOpen] = useState(false);
  return (
    <li className="flex gap-3.5 py-5">
      <DietMark diet={line.diet} className="mt-1.5 self-start" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-[1.3rem] leading-tight">{line.name}</h3>
            {line.detail && <p className="mt-1 text-sm leading-snug text-ash-600">{line.detail}</p>}
            {choices && (
              <button
                type="button"
                onClick={() => setExtrasOpen(true)}
                aria-haspopup="dialog"
                className="mt-1 -ml-1 inline-flex min-h-11 items-center gap-1.5 rounded-md px-1 text-sm font-semibold text-maroon-600 underline decoration-2 underline-offset-4 hover:text-maroon-700"
              >
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                {fill(line.hasExtras ? text.extrasEdit : text.extrasButton, { item: line.name })}
              </button>
            )}
            {extrasOpen && choices && <CartExtras line={line} choices={choices} onClose={() => setExtrasOpen(false)} />}
          </div>
          <span className="figure shrink-0 text-[1.5rem] text-ink">{formatINR(line.total)}</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          {/* At one, the minus takes the dish out. */}
          <Button variant="outline" size="icon-sm" aria-label={fill(text.less, { item })} onClick={() => setCartQty(line.key, line.qty - 1)}>
            <Minus />
          </Button>
          <span className="figure w-8 text-center text-[1.45rem] text-ink tabular-nums">{line.qty}</span>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={fill(text.more, { item })}
            disabled={line.qty >= MAX_LINE_QTY}
            onClick={() => setCartQty(line.key, line.qty + 1)}
          >
            <Plus />
          </Button>
          <span className="ml-1 text-sm text-ash-600 tabular-nums">× {formatINR(line.each)}</span>
          <Button
            variant="ghost"
            size="icon-sm"
            className="ml-auto text-ash-600 hover:text-destructive"
            aria-label={fill(text.remove, { item })}
            onClick={() => setCartQty(line.key, 0)}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
    </li>
  );
}

/** "Empty the cart", asked twice so one stray tap never loses an order. */
function ClearButton() {
  const [sure, setSure] = useState(false);
  const link = "min-h-11 text-sm font-semibold underline underline-offset-4";
  if (!sure)
    return (
      <button type="button" onClick={() => setSure(true)} className={`${link} text-ash-700 hover:text-ink`}>
        {copy.cart.clear}
      </button>
    );
  return (
    <span className="flex items-center gap-5">
      <button type="button" onClick={clearCart} className={`${link} text-destructive`}>
        {copy.cart.clearConfirm}
      </button>
      <button type="button" onClick={() => setSure(false)} className={`${link} text-ash-700 hover:text-ink`}>
        {copy.cart.clearKeep}
      </button>
    </span>
  );
}

/** /cart/: what is in the cart, with quantities and the total, and the details form that sends it all on WhatsApp. */
export default function Cart() {
  const text = copy.cart;
  const inBrowser = useInBrowser();
  const cart = priceCart(useCart(), services, builder, { builtName: text.builtName, noToppings: copy.builderPage.noToppings });
  const crumbs = [
    { name: copy.nav.home, path: paths.home },
    { name: text.hero.title, path: paths.cart },
  ];
  // The page has its own send button, so the phone call and WhatsApp bar (which would send an empty message) steps aside.
  const checkout = useRef<HTMLDivElement>(null);
  useCoversCtaBar(checkout);

  return (
    <>
      <Seo {...pageSeo.cart} path={paths.cart} noindex />
      <section className="wrap pt-3 sm:pt-5">
        <Breadcrumbs items={crumbs} />
        <div className="pt-4 pb-10 lg:pt-6 lg:pb-12">
          <p className="label flex items-center gap-3 text-maroon-600">
            <span className="h-px w-8 bg-current" aria-hidden="true" />
            {text.hero.eyebrow}
          </p>
          <h1 className="mt-4 text-[2.7rem] text-ink sm:text-6xl">{text.hero.title}</h1>
          <p className="mt-5 max-w-[56ch] text-lg leading-relaxed text-ash-600">{text.hero.lead}</p>
        </div>
      </section>

      {!inBrowser ? (
        <div className="wrap min-h-[40vh]" aria-busy="true" />
      ) : cart.lines.length === 0 ? (
        <div className="wrap pb-20 md:pb-28">
          <div className="rounded-[var(--cut)] border-[1.5px] border-dashed border-ash-300 px-6 py-14 text-center">
            <ShoppingBag className="mx-auto size-10 text-maroon-600" aria-hidden="true" />
            <h2 className="mt-4 text-[2rem] sm:text-[2.4rem]">{text.emptyTitle}</h2>
            <p className="mx-auto mt-3 max-w-[44ch] text-lg text-ash-600">{text.emptyText}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to={paths.services}>{text.menuButton}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to={paths.builder}>{text.builderButton}</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div ref={checkout} className="wrap grid gap-12 pb-20 md:pb-28 lg:grid-cols-12 lg:gap-10">
          <section aria-labelledby="cart-list-title" className="lg:col-span-6 xl:col-span-7">
            <div className="flex items-end justify-between gap-4 border-b-2 border-ink pb-3">
              <h2 id="cart-list-title" className="text-[1.9rem] sm:text-[2.2rem]">
                {text.listTitle}
              </h2>
              <span className="pb-1 text-sm font-semibold text-ash-600">{itemsText(cart.count)}</span>
            </div>
            <ul className="divide-y divide-ash-200">
              {cart.lines.map((line) => (
                <CartRow key={line.key} line={line} />
              ))}
            </ul>
            <div className="flex items-baseline justify-between gap-4 border-t-2 border-ink pt-4">
              <span className="text-lg font-semibold text-ink">{text.totalLabel}</span>
              <span className="figure text-[2.4rem] text-ink">{formatINR(cart.total)}</span>
            </div>
            <p className="mt-2 max-w-[56ch] text-sm leading-relaxed text-ash-600">{text.totalNote}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button asChild variant="outline">
                <Link to={paths.services}>
                  <Plus />
                  {text.menuButton}
                </Link>
              </Button>
              <ClearButton />
            </div>
          </section>

          <section aria-labelledby="cart-details-title" className="lg:col-span-6 xl:col-span-5">
            <h2 id="cart-details-title" className="text-[1.9rem] sm:text-[2.2rem]">
              {text.detailsTitle}
            </h2>
            <OrderForm className="mt-5" cart={{ text: cartOrderText(cart, text.totalLabel), onNewOrder: clearCart }} />
          </section>
        </div>
      )}
    </>
  );
}
