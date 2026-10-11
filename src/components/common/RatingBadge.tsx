import { ArrowUpRight } from "lucide-react";
import { business } from "@/data/site";
import { cn } from "@/lib/utils";

const STAR = "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.5L12 17.3l-5.9 3.2 1.3-6.5L2.5 9.4l6.6-.8z";

/** Five stars in a single SVG (keeps the DOM small). Colour comes from `currentColor`. */
export function Stars({ value = 5, className }: { value?: number; className?: string }) {
  const filled = Math.round(value);
  return (
    <svg viewBox="0 0 120 24" className={cn("h-4 w-20 shrink-0 text-maroon-500", className)} aria-hidden="true" focusable="false">
      {Array.from({ length: 5 }, (_, i) => (
        <path
          key={i}
          d={STAR}
          transform={`translate(${i * 24} 0)`}
          fill={i < filled ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

/** "★★★★★ 4.7 · 415 Google reviews", links to Google. */
export function RatingBadge({ className, dark = false }: { className?: string; dark?: boolean }) {
  const { value, count } = business.rating;
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-x-3", className)}>
      <RatingLink dark={dark} value={value} count={count} />
    </span>
  );
}

function RatingLink({ dark, value, count }: { dark: boolean; value: number; count: number }) {
  return (
    <a
      href={business.googleReviewsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("group inline-flex min-h-11 items-center gap-3 text-sm font-semibold", dark ? "text-white" : "text-ink")}
    >
      <Stars value={value} className={dark ? "text-cheese-400" : undefined} />
      <span>
        <span className="font-bold">{value}★</span>
        <span className={dark ? "text-ash-300" : "text-ash-600"}> · </span>
        <span className="link-draw">{count} Google reviews</span>
      </span>
      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
      <span className="sr-only"> (opens Google)</span>
    </a>
  );
}
