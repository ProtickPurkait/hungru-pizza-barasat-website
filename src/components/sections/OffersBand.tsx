import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { copy, services } from "@/data/site";
import { paths } from "@/lib/paths";
import { MenuList } from "./MenuList";

/**
 * The combo offers on the home page: a maroon menu board with the headline and a button to
 * /offers/, and beside it the combos of one offer section (the ₹129 combos), ready to add to the cart.
 */
export function OffersBand() {
  const text = copy.offersPage.band;
  const section = services.find((s) => s.offer && s.slug === text.section) ?? services.find((s) => s.offer);
  if (!section) return null;

  return (
    <section aria-labelledby="offers-title" className="wrap pt-20 md:pt-28">
      <div className="round-panel ground-dark dot-texture grid gap-10 p-6 [--cut:28px] sm:p-10 lg:grid-cols-12 lg:items-center lg:gap-12 lg:p-14">
        <div className="lg:col-span-5">
          <p className="label flex items-center gap-3 text-cheese-300">
            <span className="h-px w-8 bg-current" aria-hidden="true" />
            {text.eyebrow}
          </p>
          <h2 id="offers-title" className="mt-4 text-[2.7rem] text-white sm:text-[3.6rem] lg:text-[4rem]">
            {text.title} <span className="block text-cheese-400">{text.titleAccent}</span>
          </h2>
          <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-ash-300">{text.lead}</p>
          <Button asChild size="lg" className="group mt-8 bg-cheese-400 text-maroon-950 hover:bg-cheese-300">
            <Link to={paths.offers}>
              {text.button}
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
        <div className="round-panel ground-light bg-ground p-5 [--cut:22px] sm:p-7 lg:col-span-7">
          <h3 className="text-[1.9rem] sm:text-[2.2rem]">{section.name}</h3>
          {section.note && <p className="mt-2 text-sm leading-relaxed text-ash-600">{section.note}</p>}
          <MenuList section={section.slug} items={section.items} headingLevel="h4" className="mt-7" />
        </div>
      </div>
    </section>
  );
}
