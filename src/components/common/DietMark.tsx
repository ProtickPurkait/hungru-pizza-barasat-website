import { copy } from "@/data/site";
import type { Diet } from "@/data/types";
import { cn } from "@/lib/utils";

/** One FSSAI food mark: a square outline with a dot (veg, green) or a triangle (non-veg, brown). */
function Mark({ veg, className }: { veg: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className={cn("size-4 shrink-0", veg ? "text-veg" : "text-nonveg", className)}>
      <rect x="1" y="1" width="14" height="14" rx="2" fill="#fff" stroke="currentColor" strokeWidth="1.6" />
      {veg ? <circle cx="8" cy="8" r="3.6" fill="currentColor" /> : <path d="M8 3.8 12.2 11.4H3.8Z" fill="currentColor" />}
    </svg>
  );
}

/** The Indian veg / non-veg mark for a dish, with its name for screen readers. "either" shows both. */
export function DietMark({ diet, className }: { diet: Diet; className?: string }) {
  const label = diet === "veg" ? copy.menu.vegLabel : diet === "non-veg" ? copy.menu.nonVegLabel : copy.menu.eitherLabel;
  return (
    <span className={cn("inline-flex items-center gap-1", className)} title={label}>
      {diet !== "non-veg" && <Mark veg />}
      {diet !== "veg" && <Mark veg={false} />}
      <span className="sr-only">{label}</span>
    </span>
  );
}
