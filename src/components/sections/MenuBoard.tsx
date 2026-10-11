import { useState } from "react";
import { ArrowRight, Leaf } from "lucide-react";
import { Link } from "react-router";
import { DietMark } from "@/components/common/DietMark";
import { ServiceIcon } from "@/components/common/ServiceIcon";
import { copy, services } from "@/data/site";
import { paths } from "@/lib/paths";
import { fill } from "@/lib/text";
import { cn } from "@/lib/utils";
import { MenuList } from "./MenuList";

/**
 * The whole menu on one page: a bar of section links that stays in reach while
 * scrolling, a veg-only switch, then every section with its dishes and prices.
 * Without JavaScript the switch does nothing and the full menu is shown.
 */
export function MenuBoard() {
  const [vegOnly, setVegOnly] = useState(false);
  const text = copy.menu;
  const shown = services.map((s) => ({ ...s, items: vegOnly ? s.items.filter((it) => it.diet !== "non-veg") : s.items })).filter((s) => s.items.length > 0);

  return (
    <div>
      <div className="sticky top-0 z-30 -mx-4 border-y border-ash-200 bg-ground/95 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-ground/85 sm:mx-0 sm:rounded-full sm:border sm:px-2">
        <div className="flex items-center gap-2 py-2">
          <nav aria-label={text.jumpLabel} className="no-scrollbar min-w-0 flex-1 overflow-x-auto">
            <ul className="flex gap-1">
              {services.map((s) => (
                <li key={s.slug}>
                  <a
                    href={`#${s.slug}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full px-3.5 text-[0.95rem] font-semibold whitespace-nowrap text-ash-700 transition-colors hover:bg-ash-100 hover:text-ink"
                  >
                    <ServiceIcon icon={s.icon} className="size-4 text-maroon-600" />
                    {s.shortName}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <button
            type="button"
            aria-pressed={vegOnly}
            onClick={() => setVegOnly((v) => !v)}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border-[1.5px] px-4 text-[0.95rem] font-semibold transition-colors",
              vegOnly ? "border-veg bg-veg text-white" : "border-ash-300 text-ash-700 hover:border-veg hover:text-veg",
            )}
          >
            <Leaf className="size-4" aria-hidden="true" />
            {text.vegOnly}
          </button>
        </div>
      </div>

      <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ash-600">
        <span>{text.sizeNote}</span>
        <span className="inline-flex items-center gap-1.5">
          <DietMark diet="veg" /> {text.vegLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <DietMark diet="non-veg" /> {text.nonVegLabel}
        </span>
      </p>
      <p className="sr-only" aria-live="polite">
        {vegOnly ? "Showing vegetarian dishes only" : "Showing all dishes"}
      </p>

      <div className="mt-6 flex flex-col">
        {shown.map((s) => (
          <section key={s.slug} id={s.slug} aria-labelledby={`${s.slug}-title`} className="scroll-mt-24 border-t-2 border-ink py-12 first:mt-4 md:py-16">
            <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
              <div>
                <h2 id={`${s.slug}-title`} className="text-[2.3rem] sm:text-[2.8rem]">
                  {s.name}
                </h2>
                <p className="mt-4 max-w-[60ch] leading-relaxed text-ash-600">{s.summary}</p>
              </div>
              <Link to={paths.service(s.slug)} className="group inline-flex min-h-11 items-center gap-2 font-semibold text-ink">
                <span className="link-draw">{fill(text.sectionLink, { section: s.shortName })}</span>
                <ArrowRight className="size-4 text-maroon-600 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
            {s.note && <p className="mt-5 max-w-[70ch] text-sm leading-relaxed text-ash-600">{s.note}</p>}
            {/* Two columns on large screens: the pizza sections have around 50 dishes each */}
            <MenuList items={s.items} columns={2} className="mt-10" />
          </section>
        ))}
      </div>
    </div>
  );
}
