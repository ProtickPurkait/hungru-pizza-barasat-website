import { useRef } from "react";
import { ArrowRight, Pizza } from "lucide-react";
import { Link } from "react-router";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";
import { builder, copy } from "@/data/site";
import { cleanToppings, pizzaDiet, pricePizza } from "@/lib/builder";
import { formatINR } from "@/lib/format";
import { belowFold, useScrollScene } from "@/lib/motion";
import { paths } from "@/lib/paths";
import { OrderTicket } from "./OrderTicket";

/**
 * Pizza builder teaser. The example is printed as a kitchen order ticket, line by line
 * with the total counting up: it shows how the price is reached, which is the point.
 */
export function BuilderTeaser() {
  const text = copy.builderTeaser;
  // The example is set in the admin. Unknown choices fall back to the first one (pricePizza does that).
  const ex = text.example;
  const toppings = cleanToppings(ex.toppings, builder);
  const price = pricePizza({ size: ex.size, base: ex.base, cheese: ex.cheese, toppings, quantity: 1 }, builder);
  const startFrom = `${paths.builder}?${new URLSearchParams({ size: ex.size, base: ex.base, cheese: ex.cheese, toppings: toppings.join(",") }).toString()}`;
  const ref = useRef<HTMLElement>(null);

  useScrollScene(ref, ({ gsap }) => {
    const slip = ref.current?.querySelector<HTMLElement>("[data-slip]");
    if (!slip || belowFold([slip]).length === 0) return;
    const rows = gsap.utils.toArray<HTMLElement>("[data-row]", slip);
    const figures = gsap.utils.toArray<HTMLElement>("[data-count]", slip);
    const tl = gsap.timeline({ scrollTrigger: { trigger: slip, start: "top 78%", once: true } });
    tl.from(rows, { opacity: 0, y: 10, duration: 0.5, ease: "power2.out", stagger: 0.09 });
    figures.forEach((el) => {
      const end = Number(el.dataset.count);
      const n = { v: 0 };
      tl.to(
        n,
        {
          v: end,
          duration: 1,
          ease: "power3.out",
          onUpdate: () => {
            el.textContent = formatINR(Math.round(n.v / 10) * 10);
          },
          onComplete: () => {
            el.textContent = formatINR(end);
          },
        },
        ">-0.3",
      );
    });
  });

  return (
    <section ref={ref} aria-labelledby="builder-title" className="border-y border-ash-200 bg-sheet">
      <div className="wrap grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-5">
          <SectionHeading id="builder-title" eyebrow={text.eyebrow} title={text.title} lead={text.lead} />
          <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <Link to={paths.builder}>
                <Pizza />
                {text.button}
              </Link>
            </Button>
            <Link to={startFrom} className="group inline-flex min-h-11 items-center gap-2 px-2 font-semibold text-ink">
              <span className="link-draw">{text.exampleLink}</span>
              <ArrowRight className="size-4 text-maroon-600 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="flour-dust -mx-4 border-y border-ash-200 px-4 py-12 sm:mx-0 sm:rounded-[28px] sm:border sm:px-10 sm:py-16 lg:col-span-7">
          {/* drop-shadow on the wrapper: a box-shadow would be cut off by the torn edges */}
          <div data-slip className="mx-auto max-w-md drop-shadow-[0_22px_28px_rgb(22_21_20/0.2)] lg:-rotate-1">
            <OrderTicket title={text.exampleLabel} price={price} diet={pizzaDiet(toppings, builder)} includedLabel="No charge">
              <p data-row className="mt-4 border-t border-ash-200 pt-4 text-sm text-ash-600">
                {copy.builderPage.disclaimer}
              </p>
            </OrderTicket>
          </div>
        </div>
      </div>
    </section>
  );
}
