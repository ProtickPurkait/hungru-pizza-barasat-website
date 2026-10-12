import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { Reveal } from "@/components/common/Reveal";
import { ServiceIcon } from "@/components/common/ServiceIcon";
import { copy, services } from "@/data/site";
import { formatINR } from "@/lib/format";
import { filtersToSearch, NO_FILTERS } from "@/lib/menu-filter";
import { paths } from "@/lib/paths";
import { fill } from "@/lib/text";
import { lowestPrice } from "./MenuList";

/**
 * The menu on the home page, in brief: a small tile for each section (dishes and lowest
 * price) that opens the menu finder on that section. The dishes themselves live on /menu/.
 * The combo offers have their own band above it.
 */
export function MenuTeaser() {
  const text = copy.menu;
  const sections = services.filter((s) => !s.offer);
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
      {sections.map((s, i) => (
        <Reveal as="li" key={s.slug} delay={(i % 3) * 70}>
          <Link
            to={`${paths.services}${filtersToSearch({ ...NO_FILTERS, section: s.slug })}`}
            className="group flex h-full flex-col rounded-[var(--cut)] border-[1.5px] border-ash-200 bg-sheet p-4 transition-[border-color,box-shadow] duration-300 hover:border-ink hover:shadow-[0_18px_40px_-26px_rgb(22_21_20/0.45)] sm:p-5"
          >
            <span className="grid size-11 place-items-center rounded-full bg-maroon-50 text-maroon-600">
              <ServiceIcon icon={s.icon} className="size-5" />
            </span>
            <h3 className="mt-4 text-[1.35rem] leading-[1.02] sm:text-[1.5rem]">{s.shortName}</h3>
            <span className="mt-1.5 text-sm text-ash-600">{fill(text.dishCount, { count: s.items.length })}</span>
            <span className="mt-auto flex items-end justify-between gap-2 pt-4">
              <span className="flex items-baseline gap-1.5">
                <span className="label text-ash-600">{text.fromLabel}</span>
                <span className="figure text-[1.4rem] text-maroon-600">{formatINR(lowestPrice(s.items))}</span>
              </span>
              <ArrowRight
                className="mb-1 size-4 shrink-0 text-ash-600 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-ink"
                aria-hidden="true"
              />
            </span>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}
