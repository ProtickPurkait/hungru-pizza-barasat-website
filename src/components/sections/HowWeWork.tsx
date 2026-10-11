import { useRef } from "react";
import { ChefHat, MessageCircle, Pizza, Store } from "lucide-react";
import { CheeseStretch } from "@/components/common/Motifs";
import { SectionHeading } from "@/components/common/SectionHeading";
import { copy, steps } from "@/data/site";
import { useScrollScene } from "@/lib/motion";

const icons = [Pizza, MessageCircle, ChefHat, Store];

/**
 * Four steps under a strand of melted cheese. As the section scrolls by, the cheese
 * is pulled across from left to right, a drip falls onto each step and the step lights
 * up: the cheese pull of a cheese burst pizza, told as the order of the work. On phones
 * a vertical rail fills instead. Without JavaScript or with reduced motion everything
 * is simply shown complete.
 */
export function HowWeWork() {
  const ref = useRef<HTMLElement>(null);

  useScrollScene(ref, ({ gsap, desktop }) => {
    const root = ref.current;
    if (!root) return;
    const list = root.querySelector("[data-steps]");
    const nodes = gsap.utils.toArray<HTMLElement>("[data-node]", root);
    const titles = gsap.utils.toArray<HTMLElement>("[data-step-title]", root);
    if (!list || nodes.length === 0) return;

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: list, start: desktop ? "top 88%" : "top 80%", end: desktop ? "bottom 62%" : "bottom 55%", scrub: 0.8 },
    });

    if (desktop) {
      const lines = gsap.utils.toArray<SVGPathElement>("[data-stretch-draw] path", root);
      tl.fromTo(lines, { attr: { "stroke-dasharray": 1, "stroke-dashoffset": 1 } }, { attr: { "stroke-dashoffset": 0 }, duration: 1 }, 0);
    } else {
      const rail = root.querySelector("[data-rail]");
      if (rail) tl.fromTo(rail, { scaleY: 0 }, { scaleY: 1, transformOrigin: "50% 0%", duration: 1 }, 0);
    }

    nodes.forEach((node, i) => {
      // desktop nodes sit under the drips at 1/8, 3/8, 5/8 and 7/8 of the width; on phones the steps are evenly spaced down the rail
      const at = desktop ? (2 * i + 1) / 8 - 0.06 : i / nodes.length;
      tl.fromTo(
        node,
        // ash-200 / ash-600 to maroon-950 / cheese-400 (theme.css)
        { backgroundColor: "#dededa", color: "#5b5a54", scale: 0.82 },
        { backgroundColor: "#2a0505", color: "#ffd23f", scale: 1, duration: 0.08 },
        at,
      );
      // titles go from ash grey to ink: both shades pass WCAG AA, so the text is readable at every point
      if (titles[i]) tl.fromTo(titles[i], { color: "#5b5a54" }, { color: "#161514", duration: 0.08 }, at);
    });
  });

  return (
    <section ref={ref} aria-labelledby="how-title" className="overflow-hidden bg-ground-2">
      <div className="wrap py-20 md:py-28">
        <SectionHeading id="how-title" title={copy.howWeWork.title} lead={copy.howWeWork.lead} />

        <div className="relative mt-14 md:mt-20">
          {/* The cheese stretch (desktop). A pale full drawing underneath, the "pulled" maroon copy on top. */}
          <div className="relative hidden md:block" aria-hidden="true">
            <CheeseStretch className="text-ash-300" />
            <div className="absolute inset-0" data-stretch-draw>
              <CheeseStretch className="text-maroon-600" />
            </div>
          </div>

          <div data-steps className="relative md:-mt-6">
            {/* Rail (phones) */}
            <span aria-hidden="true" className="absolute top-2 bottom-2 left-6 w-0.5 -translate-x-1/2 bg-ash-300 md:hidden" />
            <span aria-hidden="true" data-rail className="absolute top-2 bottom-2 left-6 w-0.5 -translate-x-1/2 bg-maroon-600 md:hidden" />

            <ol className="relative grid gap-10 md:grid-cols-4 md:gap-0">
              {steps.map((step, i) => {
                const Icon = icons[i] ?? Pizza;
                return (
                  <li key={i} className="relative flex gap-5 md:flex-col md:items-center md:gap-0 md:px-4 md:text-center">
                    <span
                      data-node
                      aria-hidden="true"
                      className="relative z-10 grid size-12 shrink-0 place-items-center rounded-full bg-maroon-950 text-cheese-400 shadow-[0_0_0_6px_var(--color-ground-2)]"
                    >
                      <Icon className="size-5" />
                    </span>
                    <div className="md:mt-7 md:max-w-[17rem]">
                      <h3 data-step-title className="text-[1.6rem] text-ink sm:text-[1.8rem]">
                        {step.title}
                      </h3>
                      <p className="mt-2.5 leading-relaxed text-ash-600">{step.text}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
