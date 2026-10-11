import { useRef } from "react";
import { Check, MapPin } from "lucide-react";
import { CallButton, WhatsAppButton } from "@/components/common/ContactButtons";
import { CrustLine } from "@/components/common/Motifs";
import { SitePhoto } from "@/components/common/SitePhoto";
import { copy } from "@/data/site";
import { useScrollScene } from "@/lib/motion";
import { HeroToppings } from "./HeroToppings";

/**
 * Home page hero. Holds the page's only H1. Text never animates in: it is the first
 * thing painted. The pizza beside it turns slowly on its own (CSS, so it starts before
 * any JavaScript), and a little faster while the page scrolls. Its shadow stays still.
 * Faint toppings float in the background (HeroToppings). With "reduce motion" switched
 * on, nothing moves.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const hero = copy.home.hero;

  useScrollScene(ref, ({ gsap }) => {
    const root = ref.current;
    if (!root) return;
    // A fresh trigger for each tween: the hero scrolling out of view, scrubbed.
    const scrub = () => ({ trigger: root, start: "top top", end: "bottom top", scrub: true });
    // An extra quarter turn as the hero scrolls away, on top of the slow CSS spin of the image inside.
    const turn = root.querySelector("[data-turn]");
    if (turn) gsap.to(turn, { rotate: 90, ease: "none", scrollTrigger: scrub() });
    // The toppings behind float up at different speeds, the nearer ones faster.
    for (const el of gsap.utils.toArray<HTMLElement>("[data-depth]", root)) {
      gsap.to(el, { y: -150 * Number(el.dataset.depth), ease: "none", scrollTrigger: scrub() });
    }
  });

  return (
    <section ref={ref} className="relative overflow-hidden">
      <HeroToppings />
      <div className="wrap relative grid gap-10 pt-6 pb-12 sm:pt-10 md:pb-16 lg:grid-cols-12 lg:items-center lg:gap-8 lg:pt-12 lg:pb-20">
        <div className="flex flex-col lg:col-span-7 lg:pr-6 lg:pb-10">
          <p className="label flex items-center gap-2.5 text-maroon-600">
            <MapPin className="size-4" aria-hidden="true" />
            {hero.eyebrow}
          </p>
          <h1 className="mt-5 text-[2.45rem] leading-[0.94] text-ink min-[400px]:text-[2.8rem] sm:text-[4.4rem] lg:text-[4.6rem] xl:text-[5.4rem]">
            {hero.title} {hero.titleAccent && <span className="block text-maroon-500 min-[360px]:whitespace-nowrap">{hero.titleAccent}</span>}
            {hero.titleLine2 && <span className="mt-1 block text-ash-500 xl:whitespace-nowrap">{hero.titleLine2}</span>}
          </h1>
          <p className="mt-7 max-w-[54ch] text-lg leading-relaxed text-ash-600 sm:text-xl">
            {hero.lead}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <WhatsAppButton size="lg" />
            <CallButton size="lg" />
          </div>
        </div>

        <figure className="relative lg:col-span-5">
          {/* The spinning pizza: a round photo taken from directly above, on a dashed "tray" ring */}
          <div className="relative mx-auto aspect-square w-full max-w-[22rem] sm:max-w-[28rem] lg:max-w-none">
            <span aria-hidden="true" className="absolute -inset-[4%] rounded-full border-2 border-dashed border-maroon-600/25" />
            {/* The shadow sits on a layer that never turns, so it does not wobble with the pizza */}
            <span aria-hidden="true" className="absolute inset-[1%] rounded-full shadow-[0_34px_60px_-18px_rgb(42_5_5/0.5)]" />
            <div data-turn className="relative size-full">
              <SitePhoto
                photo={hero.photo}
                ratio={1}
                priority
                maxWidth={1080}
                sizes="(min-width: 1280px) 500px, (min-width: 1024px) 40vw, (min-width: 640px) 448px, 352px"
                className="rounded-full bg-transparent"
                imgClassName="animate-pizza-spin"
              />
            </div>
          </div>
          {/* A paper slip pinned beside the pizza with the three promises. On large screens it overlaps the pizza and reaches into the text column. */}
          <figcaption className="relative -mt-6 mr-4 ml-auto w-fit max-w-[94%] rounded-xl border-l-4 border-maroon-500 bg-sheet px-5 py-4 shadow-[0_18px_40px_-18px_rgb(22_21_20/0.35)] sm:mr-6 lg:absolute lg:bottom-4 lg:-left-20 lg:m-0">
            <ul className="flex flex-col gap-2">
              {hero.promises.map((p, i) => (
                <li key={i} className="flex items-center gap-2.5 text-[0.95rem] font-semibold text-ink">
                  <Check className="size-4 shrink-0 text-maroon-500" aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
          </figcaption>
        </figure>
      </div>
      <CrustLine />
    </section>
  );
}
