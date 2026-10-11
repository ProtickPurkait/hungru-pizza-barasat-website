import { useRef } from "react";
import { Check, MapPin } from "lucide-react";
import { CallButton, WhatsAppButton } from "@/components/common/ContactButtons";
import { CrustDivider } from "@/components/common/Motifs";
import { copy } from "@/data/site";
import { useCoversCtaBar } from "@/lib/cta-bar";
import { HeroVideo, HeroVideoControls, useHeroVideo } from "./HeroVideo";

/**
 * Home page hero. Holds the page's only H1. Text never animates in: it is the first
 * thing painted. Behind all of it loops a food video (HeroVideo). On computers the text sits
 * on the left with the food on the right. On phones and tablets the hero fills the screen:
 * the heading and text at the top, a clear view of the food in the middle, then the buttons.
 * A crust edge leads into the light page below.
 */
export function Hero() {
  const hero = copy.home.hero;
  const player = useHeroVideo();
  const buttons = useRef<HTMLDivElement>(null);
  // The phone call and WhatsApp bar keeps out of sight while these buttons are on screen.
  useCoversCtaBar(buttons);

  return (
    <section className="ground-dark relative isolate overflow-hidden">
      <HeroVideo video={hero.video} player={player} />
      {/* Screen height less the header and the crust edge below */}
      <div className="wrap relative z-10 flex min-h-[calc(100svh-5.5rem)] flex-col pt-8 pb-8 sm:pt-12 sm:pb-10 md:min-h-[calc(100svh-7rem)] lg:min-h-[min(44rem,calc(100svh-7rem))] lg:justify-center lg:py-24">
        <div className="max-w-[40rem] xl:max-w-[46rem]">
          <p className="label flex items-center gap-2.5 text-cheese-300">
            <MapPin className="size-4" aria-hidden="true" />
            {hero.eyebrow}
          </p>
          <h1 className="mt-5 text-[2.45rem] leading-[0.94] text-white min-[400px]:text-[2.8rem] sm:text-[4.4rem] lg:text-[4.6rem] xl:text-[5.4rem]">
            {hero.title} {hero.titleAccent && <span className="block text-cheese-300 min-[360px]:whitespace-nowrap">{hero.titleAccent}</span>}
            {hero.titleLine2 && <span className="mt-1 block text-ash-300 xl:whitespace-nowrap">{hero.titleLine2}</span>}
          </h1>
          <p className="mt-5 max-w-[48ch] text-[1.0625rem] leading-relaxed text-ash-100 [text-shadow:0_1px_12px_rgb(0_0_0/0.7)] sm:mt-6 sm:text-xl lg:[text-shadow:none]">{hero.lead}</p>
        </div>

        <HeroVideoControls
          video={hero.video}
          player={player}
          className="min-h-36 flex-1 items-end pt-6 pb-5 lg:absolute lg:inset-x-8 lg:top-6 lg:min-h-0 lg:items-start lg:p-0"
        />

        <div className="max-w-[40rem] xl:max-w-[46rem]">
          <div ref={buttons} className="flex flex-col gap-3 sm:flex-row lg:mt-8">
            <WhatsAppButton size="lg" />
            <CallButton size="lg" variant="outline-light" />
          </div>
          {/* Hidden on phones, where the trust strip just below says the same and the food needs the room */}
          <ul className="mt-7 hidden flex-wrap gap-x-6 gap-y-2 sm:flex">
            {hero.promises.map((p, i) => (
              <li key={i} className="flex items-center gap-2 text-[0.95rem] font-semibold text-ash-100">
                <Check className="size-4 shrink-0 text-cheese-400" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <CrustDivider from="dark" to="sheet" className="z-10" />
    </section>
  );
}
