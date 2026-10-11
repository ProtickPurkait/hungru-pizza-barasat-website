import { DietMark } from "@/components/common/DietMark";
import { WhatsAppIcon } from "@/components/common/icons";
import type { MenuItem } from "@/data/types";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { projectMessage, waUrl } from "@/lib/whatsapp";

/** "From ₹139": the lowest price in a menu section. */
export function lowestPrice(items: MenuItem[]): number {
  return items.reduce((min, it) => it.prices.reduce((m, p) => Math.min(m, p.price), min), Number.POSITIVE_INFINITY);
}

/** Each price with its size above it, like the columns of a printed menu (just the price for one-price dishes). */
function Prices({ item }: { item: MenuItem }) {
  const [only] = item.prices;
  if (item.prices.length === 1 && !only!.size) return <span className="figure text-[1.45rem] text-ink">{formatINR(only!.price)}</span>;
  return (
    <span className={cn("flex text-right", item.prices.length > 2 ? "gap-3" : "gap-4")}>
      {item.prices.map((p, i) => (
        <span key={i} className="flex flex-col items-end">
          <span className="label text-[0.6rem] whitespace-nowrap text-ash-600">{p.size}</span>
          <span className="figure mt-1 text-[1.45rem] text-ink">{formatINR(p.price)}</span>
        </span>
      ))}
    </span>
  );
}

/**
 * Dishes as a printed menu: food mark, name and price on one line with a dotted leader
 * between them, the description underneath, and a small WhatsApp button to order that
 * dish straight away.
 */
export function MenuList({
  items,
  headingLevel = "h3",
  columns = 1,
  className,
}: {
  items: MenuItem[];
  headingLevel?: "h3" | "h4";
  columns?: 1 | 2;
  className?: string;
}) {
  const H = headingLevel;
  return (
    <ul className={cn("grid gap-x-12 gap-y-7", columns === 2 && "lg:grid-cols-2", className)}>
      {items.map((it) => (
        <li key={it.name}>
          <div className="min-w-0">
            {/* Three or more prices drop below a long name on narrow screens instead of squeezing it */}
            <div className={cn("flex items-end gap-x-3 gap-y-2", it.prices.length > 2 && "flex-wrap")}>
              {/* The mark stays beside the first line; a long name and its tag wrap next to it */}
              <H className="flex min-w-0 items-start gap-x-2.5 text-[1.3rem] leading-tight sm:text-[1.4rem]">
                <DietMark diet={it.diet} className="mt-[0.2em]" />
                <span className="min-w-0">
                  {it.name}
                  {it.tag && (
                    <span className="label ml-2 inline-block rounded-full bg-maroon-50 px-2 py-1 align-[0.2em] text-[0.58rem] tracking-[0.08em] text-maroon-600">{it.tag}</span>
                  )}
                </span>
              </H>
              <span aria-hidden="true" className="mb-1.5 hidden min-w-6 flex-1 border-b-2 border-dotted border-ash-300 sm:block" />
              <span className="ml-auto shrink-0">
                <Prices item={it} />
              </span>
            </div>
            <div className="mt-1.5 flex items-start justify-between gap-4">
              <p className="max-w-[52ch] leading-relaxed text-ash-600">{it.description}</p>
              <a
                href={waUrl(projectMessage(it.name))}
                target="_blank"
                rel="noopener noreferrer"
                className="-mt-1 grid size-11 shrink-0 place-items-center rounded-full text-ash-600 transition-colors hover:bg-whatsapp hover:text-ink"
              >
                <WhatsAppIcon className="size-5" />
                <span className="sr-only">
                  Order {it.name} on WhatsApp (opens WhatsApp)
                </span>
              </a>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
