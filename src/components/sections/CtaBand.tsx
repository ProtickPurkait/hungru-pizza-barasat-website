import { Check, Clock, Phone } from "lucide-react";
import { CrustDivider, type MotifColor } from "@/components/common/Motifs";
import { CallButton, WhatsAppButton } from "@/components/common/ContactButtons";
import { business, copy } from "@/data/site";
import { telHref } from "@/lib/paths";
import { OrderForm } from "./OrderForm";

interface CtaBandProps {
  title?: string;
  lead?: string;
  defaultLocality?: string;
  /** Colour of the section above, for the crust edge. */
  from?: MotifColor;
}

/**
 * Closing band with the order form. Every page ends with it. This is the one place the
 * page turns dark: a blistered crust edge, then the charcoal ground runs on into the footer.
 */
export function CtaBand({ title, lead, defaultLocality, from = "ground" }: CtaBandProps) {
  const text = copy.ctaBand;
  return (
    <section aria-labelledby="cta-title" id="order" className="scroll-mt-20">
      <CrustDivider from={from} to="dark" />
      <div className="ground-dark dot-texture">
        <div className="wrap grid gap-12 py-16 md:py-24 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <p className="label flex items-center gap-3 text-cheese-300">
              <span className="h-px w-8 bg-current" aria-hidden="true" />
              {text.eyebrow}
            </p>
            <h2 id="cta-title" className="mt-4 text-[2.6rem] text-white sm:text-[3.6rem] lg:text-[4.1rem]">
              {title ?? text.title}
            </h2>
            <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-ash-300">{lead ?? text.lead}</p>
            <ul className="mt-8 flex flex-col gap-3.5">
              {text.points.map((p, i) => (
                <li key={i} className="flex items-start gap-3 text-ash-100">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-maroon-500" aria-hidden="true">
                    <Check className="size-3.5 text-white" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-10 border-t border-white/10 pt-8">
              <p className="text-ash-300">{text.talkPrompt}</p>
              <a
                href={telHref(business.phone.tel)}
                className="figure group mt-2 inline-flex min-h-11 items-center gap-3 text-[2.9rem] text-white transition-colors hover:text-cheese-300 sm:text-[3.4rem]"
              >
                <Phone className="size-7 text-cheese-400 transition-transform duration-300 group-hover:-rotate-12" aria-hidden="true" />
                {business.phone.display}
              </a>
              <p className="mt-2 flex items-center gap-2 text-sm text-ash-400">
                <Clock className="size-4" aria-hidden="true" />
                {business.hours.display}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:hidden">
                <WhatsAppButton />
                <CallButton />
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 lg:pl-6">
            <OrderForm defaultLocality={defaultLocality} />
          </div>
        </div>
      </div>
    </section>
  );
}
