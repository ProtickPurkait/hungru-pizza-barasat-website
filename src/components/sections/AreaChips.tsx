import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { areaPages, localities, widerArea } from "@/data/site";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/utils";

/**
 * Every locality served, set as one big block of type. Areas with their own page are
 * underlined links; the rest are plain text in grey.
 */
export function AreaChips({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-baseline gap-x-6 gap-y-1 sm:gap-x-9", className)}>
      {localities.map((l) => {
        const hasPage = areaPages.some((a) => a.slug === l.slug);
        const type = "figure text-[2.6rem] leading-[1.05] sm:text-[4rem] lg:text-[5.25rem]";
        return (
          <li key={l.slug}>
            {hasPage ? (
              <Link
                to={paths.area(l.slug)}
                className={cn(
                  type,
                  "group inline-flex items-baseline gap-1 text-ink underline decoration-ash-300 decoration-[0.06em] underline-offset-[0.14em] transition-colors duration-300 hover:text-maroon-500 hover:decoration-maroon-500",
                )}
              >
                {l.name}
                <ArrowUpRight
                  className="size-[0.45em] self-start text-maroon-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  aria-hidden="true"
                />
              </Link>
            ) : (
              <span className={cn(type, "text-ash-500")}>{l.name}</span>
            )}
          </li>
        );
      })}
      <li className="self-center">
        <span className="label inline-flex min-h-11 items-center rounded-full border-[1.5px] border-dashed border-ash-400 px-4 text-ash-600">+ {widerArea}</span>
      </li>
    </ul>
  );
}
