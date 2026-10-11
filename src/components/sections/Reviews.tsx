import { ArrowUpRight } from "lucide-react";
import { DemoTag } from "@/components/common/DemoTag";
import { Reveal } from "@/components/common/Reveal";
import { Stars } from "@/components/common/RatingBadge";
import { SectionHeading } from "@/components/common/SectionHeading";
import { business, copy, praise, reviews } from "@/data/site";
import { fill } from "@/lib/text";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(/[\s.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

/** What customers praise, as one slow band of outlined type. Decorative: the same words are in the lead below. */
function PraiseMarquee() {
  const items = [...praise, ...praise];
  return (
    <div aria-hidden="true" className="overflow-hidden border-b border-ash-200 py-6 select-none md:py-9">
      <div className="flex w-max animate-marquee items-center">
        {items.map((p, i) => (
          <span key={i} className="flex items-center">
            <span className="figure type-outline px-6 text-[3.2rem] whitespace-nowrap md:px-10 md:text-[5.5rem]">{p}</span>
            <span className="size-3 rounded-full bg-maroon-500 md:size-4" />
          </span>
        ))}
      </div>
    </div>
  );
}

/** Google rating and customer reviews, as a staggered two-column wall (no carousel to swipe through). */
export function Reviews() {
  return (
    <section aria-labelledby="reviews-title" className="overflow-hidden">
      <PraiseMarquee />
      <div className="wrap grid gap-14 py-20 md:py-28 lg:grid-cols-12 lg:gap-10">
        <div className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
          <SectionHeading
            id="reviews-title"
            size="md"
            title={copy.reviews.title}
            lead={fill(copy.reviews.lead, { praise: praise.join(", ").toLowerCase() })}
          />
          <div className="mt-10 flex items-end gap-5">
            <p className="figure text-[6.5rem] leading-[0.78] text-ink">{business.rating.value}</p>
            <div className="pb-1">
              <Stars value={5} className="h-5 w-25" />
              <p className="mt-2 text-sm font-semibold text-ash-600">{business.rating.count} Google reviews</p>
            </div>
          </div>
          <a
            href={business.googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-ink"
          >
            <span className="link-draw">{copy.reviews.readAll}</span>
            <ArrowUpRight className="size-4 text-maroon-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            <span className="sr-only"> (opens Google)</span>
          </a>
        </div>

        <ul className="grid gap-x-10 gap-y-12 sm:grid-cols-2 sm:pb-16 lg:col-span-8">
          {reviews.map((r, i) => (
            <Reveal as="li" key={i} delay={(i % 2) * 120} className={cn(i % 2 === 1 && "sm:translate-y-16")}>
              <figure className="flex h-full flex-col border-t-2 border-ink pt-6">
                <div className="flex items-center justify-between gap-2">
                  <Stars value={r.rating} />
                  {r.placeholder && <DemoTag>Sample review</DemoTag>}
                </div>
                <blockquote className="mt-5 flex-1 text-[1.12rem] leading-[1.55] text-ink">“{r.text}”</blockquote>
                <figcaption className="mt-7 flex items-center gap-3.5">
                  <span aria-hidden="true" className="figure grid size-11 shrink-0 place-items-center rounded-full bg-ground-2 text-[1.15rem] text-ash-700">
                    {initials(r.name)}
                  </span>
                  <span>
                    <span className="block font-semibold text-ink">{r.name}</span>
                    <span className="text-sm text-ash-600">
                      {r.locality} · {r.service}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
