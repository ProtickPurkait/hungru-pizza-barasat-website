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

type CardTone = "light" | "dark";

/** Square arrow "button" at the foot of a card. The whole card is the link. */
function CardArrow({ tone }: { tone: CardTone }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-10 place-items-center rounded-full border-[1.5px] transition-colors duration-300 group-hover:border-maroon-500 group-hover:bg-maroon-500 group-hover:text-white",
        tone === "dark" ? "border-white/50 text-white" : "border-ink text-ink",
      )}
    >
      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
    </span>
  );
}

/**
 * Menu section card. Lays itself out from its own width (container query): stacked when
 * narrow, photo beside the text when wide. `feature` always stacks, with a tall photo.
 */
export function ServiceCard({
  service,
  headingLevel = "h3",
  feature = false,
  tone = "light",
  className,
}: {
  service: Service;
  headingLevel?: "h2" | "h3";
  feature?: boolean;
  tone?: CardTone;
  className?: string;
}) {
  const H = headingLevel;
  const dark = tone === "dark";
  return (
    <Link
      to={paths.service(service.slug)}
      className={cn(
        "group @container flex h-full overflow-hidden rounded-[var(--cut)] transition-shadow duration-500 hover:shadow-[0_24px_50px_-28px_rgb(22_21_20/0.45)]",
        dark ? "bg-maroon-950 text-white" : "bg-sheet text-ink",
        className,
      )}
    >
      <div className={cn("flex w-full flex-col", !feature && "@xl:flex-row", dark && "@xl:flex-row-reverse")}>
        <div className={cn("relative overflow-hidden", feature ? "lg:flex-1" : "@xl:w-[44%] @xl:shrink-0")}>
          <SitePhoto
            photo={service.heroPhoto}
            ratio={16 / 10}
            maxWidth={1080}
            sizes={feature ? "(min-width: 1024px) 600px, calc(100vw - 2rem)" : "(min-width: 1024px) 400px, (min-width: 768px) 50vw, calc(100vw - 2rem)"}
            className={cn(feature ? "lg:h-full lg:min-h-80 lg:aspect-auto!" : "@xl:h-full @xl:aspect-auto!")}
            imgClassName="transition-transform duration-700 ease-out-expo group-hover:scale-[1.05]"
          />
        </div>
        <div className={cn("flex flex-col p-5 sm:p-6 lg:p-7", feature ? "flex-none" : "flex-1")}>
          <H className={cn("leading-[0.95]", feature ? "text-[2.1rem] sm:text-[2.6rem]" : "text-[1.75rem] sm:text-[1.95rem]")}>{service.name}</H>
          <p className={cn("mt-3 max-w-[48ch] flex-1 leading-relaxed", dark ? "text-ash-300" : "text-ash-600")}>{service.summary}</p>
          <span className="mt-6 flex items-center justify-between gap-3 font-semibold">
            <span className="flex items-baseline gap-2">
              <span className={cn("label", dark ? "text-ash-300" : "text-ash-600")}>{copy.menu.fromLabel}</span>
              <span className={cn("figure text-[1.6rem]", dark ? "text-cheese-300" : "text-maroon-600")}>{formatINR(lowestPrice(service.items))}</span>
            </span>
            <span className="flex items-center gap-3">
              <span className="whitespace-nowrap @max-2xl:sr-only">{copy.buttons.seeDetails}</span>
              <CardArrow tone={tone} />
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

// Bento placement for the menu sections on the home page, by how many there are. Exact cell count, no gaps.
const BENTO: Record<number, string[]> = {
  // md (2 cols): 2 / 1+1 / 2 / 2.  lg (6 cols): 3 tall beside 3 + 3, then 3 + 3.
  5: ["md:col-span-2 lg:col-span-3 lg:row-span-2", "lg:col-span-3", "lg:col-span-3", "md:col-span-2 lg:col-span-3", "md:col-span-2 lg:col-span-3"],
  // md (2 cols): 2 / 1+1 / 1+1 / 2.  lg (6 cols): 3 tall beside 3 + 3, then 2 + 2 + 2.
  6: ["md:col-span-2 lg:col-span-3 lg:row-span-2", "lg:col-span-3", "lg:col-span-3", "lg:col-span-2", "lg:col-span-2", "md:col-span-2 lg:col-span-2"],
};

export function ServicesGrid({
  services = allServices,
  headingLevel = "h3",
  layout = "tiles",
}: {
  services?: Service[];
  headingLevel?: "h2" | "h3";
  layout?: "bento" | "tiles";
}) {
  const bento = layout === "bento" ? BENTO[services.length] : undefined;
  const useBento = !!bento;
  return (
    <ul
      className={cn(
        "grid gap-4 lg:gap-5",
        useBento
          ? // phones: one swipeable row, the next card peeking in from the right
            "no-scrollbar max-md:-mx-4 max-md:flex max-md:snap-x max-md:snap-mandatory max-md:scroll-px-4 max-md:overflow-x-auto max-md:px-4 max-md:pb-2 md:grid-cols-2 lg:grid-cols-6"
          : services.length % 3 === 0
            ? "sm:grid-cols-2 lg:grid-cols-3"
            : "sm:grid-cols-2",
      )}
    >
      {services.map((s, i) => (
        <Reveal
          as="li"
          key={s.slug}
          delay={(i % 3) * 70}
          className={bento ? cn(bento[i], "max-md:w-[84%] max-md:shrink-0 max-md:snap-start") : undefined}
        >
          <ServiceCard
            service={s}
            headingLevel={headingLevel}
            feature={useBento && i === 0}
            tone={bento && i === bento.length - 1 ? "dark" : "light"}
          />
        </Reveal>
      ))}
    </ul>
  );
}
