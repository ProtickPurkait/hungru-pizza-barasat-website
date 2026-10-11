import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { CallButton, WhatsAppButton } from "./ContactButtons";
import { CrustLine } from "./Motifs";
import { RatingBadge } from "./RatingBadge";
import { SitePhoto } from "./SitePhoto";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  lead: ReactNode;
  breadcrumbs?: Crumb[];
  photo?: string;
  whatsappText?: string;
  /** Buttons in place of the usual WhatsApp and Call buttons (the Careers page has its own). */
  actions?: ReactNode;
  children?: ReactNode;
}

/** Light editorial hero used on every inner page. Holds the page's only H1. */
export function PageHero({ eyebrow, title, lead, breadcrumbs, photo, whatsappText, actions, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden">
      {breadcrumbs && (
        <div className="wrap pt-3 sm:pt-5">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      )}
      <div
        className={cn(
          "wrap grid gap-10 pb-12 md:pb-16 lg:gap-12 lg:pb-20",
          breadcrumbs ? "pt-4 lg:pt-6" : "pt-8 lg:pt-12",
          photo && "lg:grid-cols-12 lg:items-center",
        )}
      >
        <div className={cn(photo ? "lg:col-span-7 lg:pb-2" : "max-w-4xl")}>
          <p className="label flex items-center gap-3 text-maroon-600">
            <span className="h-px w-8 bg-current" aria-hidden="true" />
            {eyebrow}
          </p>
          <h1 className="mt-4 text-[2.7rem] text-ink sm:text-6xl lg:text-[4.75rem]">{title}</h1>
          <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-ash-600 sm:text-xl">{lead}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {actions ?? (
              <>
                <WhatsAppButton size="lg" text={whatsappText} />
                <CallButton size="lg" />
              </>
            )}
          </div>
          <RatingBadge className="mt-5" />
          {children}
        </div>
        {photo && (
          <div className="lg:col-span-5">
            <SitePhoto
              photo={photo}
              ratio={4 / 3}
              lgRatio={4 / 5}
              priority
              sizes="(min-width: 1280px) 480px, (min-width: 1024px) 38vw, calc(100vw - 2rem)"
              className="round-panel [--cut:28px]"
            />
          </div>
        )}
      </div>
      <CrustLine />
    </section>
  );
}
