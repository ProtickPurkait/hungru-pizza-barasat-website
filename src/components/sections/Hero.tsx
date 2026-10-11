import { Check, MapPin } from "lucide-react";
import { CallButton, WhatsAppButton } from "@/components/common/ContactButtons";
import { CrustDivider } from "@/components/common/Motifs";
import { copy } from "@/data/site";
import { HeroVideo } from "./HeroVideo";

/**
 * Home page hero. Holds the page's only H1. Text never animates in: it is the first
 * thing painted. Behind it loops a food video (HeroVideo): on computers it fills the
 * whole hero with the food on the right; on phones and tablets it sits below the text,
 * its dark top running up under the buttons. A crust edge leads into the light page below.
 */
export function Hero() {
  const hero = copy.home.hero;

  return (
    <section className="ground-dark relative isolate overflow-hidden">
      <div className="wrap relative z-10 pt-8 sm:pt-12 lg:flex lg:min-h-[min(44rem,calc(100svh-7rem))] lg:flex-col lg:justify-center lg:py-24">
        <div className="max-w-[40rem] xl:max-w-[46rem]">
          <p className="label flex items-center gap-2.5 text-cheese-300">
            <MapPin className="size-4" aria-hidden="true" />
            {hero.eyebrow}
          </p>
          <h1 className="mt-5 text-[2.45rem] leading-[0.94] text-white min-[400px]:text-[2.8rem] sm:text-[4.4rem] lg:text-[4.6rem] xl:text-[5.4rem]">
            {hero.title} {hero.titleAccent && <span className="block text-cheese-300 min-[360px]:whitespace-nowrap">{hero.titleAccent}</span>}
            {hero.titleLine2 && <span className="mt-1 block text-ash-300 xl:whitespace-nowrap">{hero.titleLine2}</span>}
          </h1>
          <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-ash-100 sm:text-xl">{hero.lead}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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

      <HeroVideo video={hero.video} className="-mt-[60vw] aspect-[720/1224] sm:-mt-[18vw] sm:aspect-[4/5] lg:absolute lg:inset-0 lg:mt-0 lg:aspect-auto" />
      <CrustDivider from="dark" to="sheet" className="z-10" />
    </section>
  );
}
