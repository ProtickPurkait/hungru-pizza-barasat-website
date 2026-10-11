import { ArrowUpRight } from "lucide-react";
import { DemoTag } from "@/components/common/DemoTag";
import { Stars } from "@/components/common/RatingBadge";
import { business, stats } from "@/data/site";

/** Google rating plus the four trust figures from the menu and the Google listing. */
export function TrustStrip() {
  return (
    <section aria-label="Why customers trust us" className="border-b border-ash-200 bg-sheet">
      <ul className="wrap grid grid-cols-2 lg:grid-cols-[1.35fr_repeat(4,1fr)]">
        <li className="col-span-2 border-b border-ash-200 py-6 lg:col-span-1 lg:border-b-0 lg:py-8 lg:pr-8">
          <a
            href={business.googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4"
          >
            <span className="figure text-[3.4rem] text-ink">{business.rating.value}</span>
            <span className="flex flex-col gap-1.5">
              <Stars value={5} className="h-4.5 w-24" />
              <span className="flex items-center gap-1 text-sm font-semibold text-ink">
                <span className="link-draw">{business.rating.count} Google reviews</span>
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </span>
            </span>
            <span className="sr-only"> (opens Google)</span>
          </a>
        </li>
        {stats.map((s, i) => (
          <li
            key={i}
            className={`flex flex-col justify-start gap-2 border-ash-200 py-6 lg:border-l lg:px-6 lg:py-8 ${i % 2 === 1 ? "border-l pl-5" : "pr-5"} ${i < 2 ? "border-b lg:border-b-0" : ""}`}
          >
            <span className="figure text-[2.6rem] text-ink">{s.value}</span>
            <span className="text-sm leading-snug font-medium text-ash-600">{s.label}</span>
            {s.placeholder && <DemoTag className="w-fit">Sample</DemoTag>}
          </li>
        ))}
      </ul>
    </section>
  );
}
