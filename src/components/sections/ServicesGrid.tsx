import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { Reveal } from "@/components/common/Reveal";
import { SitePhoto } from "@/components/common/SitePhoto";
import { copy, services as allServices } from "@/data/site";
import type { Service } from "@/data/types";
import { formatINR } from "@/lib/format";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/utils";
import { lowestPrice } from "./MenuList";

/** Round arrow "button" at the foot of a card. The whole card is the link. */
function CardArrow() {
  return (
    <span
      aria-hidden="true"
      className="grid size-10 place-items-center rounded-full border-[1.5px] border-ink text-ink transition-colors duration-300 group-hover:border-maroon-500 group-hover:bg-maroon-500 group-hover:text-white"
    >
      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
    </span>
  );
}

/**
 * Menu section card. Lays itself out from its own width (container query): stacked when
 * narrow, photo beside the text when wide.
 */
export function ServiceCard({ service, headingLevel = "h3", className }: { service: Service; headingLevel?: "h2" | "h3"; className?: string }) {
  const H = headingLevel;
  return (
    <Link
      to={paths.service(service.slug)}
      className={cn(
        "group @container flex h-full overflow-hidden rounded-[var(--cut)] transition-shadow duration-500 hover:shadow-[0_24px_50px_-28px_rgb(22_21_20/0.45)]",
        "bg-sheet text-ink",
        className,
      )}
    >
      <div className="flex w-full flex-col @xl:flex-row">
        <div className="relative overflow-hidden @xl:w-[44%] @xl:shrink-0">
          <SitePhoto
            photo={service.heroPhoto}
            ratio={16 / 10}
            maxWidth={1080}
            sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, calc(100vw - 2rem)"
            className="@xl:h-full @xl:aspect-auto!"
            imgClassName="transition-transform duration-700 ease-out-expo group-hover:scale-[1.05]"
          />
        </div>
        <div className="flex flex-1 flex-col p-5 sm:p-6 lg:p-7">
          <H className="text-[1.75rem] leading-[0.95] sm:text-[1.95rem]">{service.name}</H>
          <p className="mt-3 max-w-[48ch] flex-1 leading-relaxed text-ash-600">{service.summary}</p>
          <span className="mt-6 flex items-center justify-between gap-3 font-semibold">
            <span className="flex items-baseline gap-2">
              <span className="label text-ash-600">{copy.menu.fromLabel}</span>
              <span className="figure text-[1.6rem] text-maroon-600">{formatINR(lowestPrice(service.items))}</span>
            </span>
            <span className="flex items-center gap-3">
              <span className="whitespace-nowrap @max-2xl:sr-only">{copy.buttons.seeDetails}</span>
              <CardArrow />
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Menu section cards: on menu section pages ("the rest of the menu") and delivery area pages. */
export function ServicesGrid({ services = allServices, headingLevel = "h3" }: { services?: Service[]; headingLevel?: "h2" | "h3" }) {
  return (
    <ul className={cn("grid gap-4 lg:gap-5", services.length % 3 === 0 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2")}>
      {services.map((s, i) => (
        <Reveal as="li" key={s.slug} delay={(i % 3) * 70}>
          <ServiceCard service={s} headingLevel={headingLevel} />
        </Reveal>
      ))}
    </ul>
  );
}
