import type { ReactNode } from "react";
import { DietMark } from "@/components/common/DietMark";
import { business } from "@/data/site";
import type { PizzaPrice } from "@/lib/builder";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * A kitchen order ticket (KOT), the slip that prints in every restaurant kitchen:
 * torn paper edges, one line per part of the pizza with its price, then the total.
 * Rows carry data-row and the total carries data-count, so a scroll scene can
 * "print" the ticket line by line.
 */
export function OrderTicket({
  title,
  price,
  diet,
  includedLabel = "No charge",
  live = false,
  children,
  className,
}: {
  title: string;
  price: PizzaPrice;
  diet: "veg" | "non-veg";
  includedLabel?: string;
  /** Announce price changes to screen readers (the builder page). */
  live?: boolean;
  /** Buttons and notes under the ticket. */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("ticket px-6 sm:px-8", className)}>
      <div data-row className="flex items-start justify-between gap-3">
        <div>
          <p className="label text-maroon-600">{title}</p>
          <p className="mt-1.5 text-sm text-ash-600">{business.name}</p>
        </div>
      </div>

      <dl className="mt-6 border-t-2 border-dashed border-ash-300 pt-4 text-[0.98rem]">
        {price.lines.map((line, i) => (
          <div key={i} data-row className="flex items-baseline gap-2 py-1.5">
            <dt className="flex min-w-0 items-center gap-2 text-ink">
              {i === 0 && <DietMark diet={diet} />}
              <span className="truncate">{line.label}</span>
            </dt>
            <span aria-hidden="true" className="min-w-4 flex-1 border-b border-dotted border-ash-400" />
            <dd className={cn("shrink-0 tabular-nums", line.price ? "font-semibold text-ink" : "text-ash-600")}>
              {line.price ? formatINR(line.price) : includedLabel}
            </dd>
          </div>
        ))}
      </dl>

      <div data-row className="mt-4 flex items-baseline justify-between gap-4 border-t-2 border-dashed border-ash-300 pt-4 text-sm text-ash-600">
        <span>
          {price.quantity} × {formatINR(price.each)}
        </span>
        <span className="label">Total</span>
      </div>
      <p data-row className="figure mt-2 text-right text-[3.2rem] text-ink sm:text-[3.8rem]" aria-live={live ? "polite" : undefined}>
        <span data-count={price.total}>{formatINR(price.total)}</span>
      </p>
      {children}
    </div>
  );
}
