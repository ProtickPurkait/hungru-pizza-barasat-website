import { Clock, MapPin, Phone } from "lucide-react";
import { Link } from "react-router";
import { Logo } from "@/components/common/Logo";
import { Stars } from "@/components/common/RatingBadge";
import { WhatsAppIcon } from "@/components/common/icons";
import { areaPages, business, copy, legal, localities, services, widerArea } from "@/data/site";
import { paths, telHref } from "@/lib/paths";
import { fill } from "@/lib/text";
import { waUrl } from "@/lib/whatsapp";
import { mainNav } from "./nav";

const linkClass = "inline-flex min-h-11 items-center text-ash-300 transition-colors hover:text-white";

/** Dark footer. Every page ends with a dark band, so the footer simply continues it. */
export function Footer() {
  const year = new Date().getFullYear();
  const text = copy.footer;
  return (
    <footer className="ground-dark border-t border-white/10">
      <div className="wrap grid gap-12 pt-14 pb-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:pt-20">
        <div className="lg:col-span-3">
          <Logo dark />
          <p className="label mt-5 text-ash-400">{text.tagline}</p>
          <p className="mt-3 max-w-xs text-ash-300">{text.blurb}</p>
          <a
            href={business.googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-11 items-center gap-3 text-ash-100 hover:text-white"
          >
            <Stars value={5} className="text-cheese-400" />
            <span>
              <strong>{business.rating.value}★</strong> from {business.rating.count} Google reviews
            </span>
          </a>
        </div>

        <nav aria-label="Menu sections" className="lg:col-span-3">
          <h2 className="label text-ash-400">{text.servicesTitle}</h2>
          <ul className="mt-4">
            {services.map((s) => (
              <li key={s.slug}>
                <Link to={paths.service(s.slug)} className={linkClass}>
                  {s.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Delivery areas and pages" className="lg:col-span-3">
          <h2 className="label text-ash-400">{text.areasTitle}</h2>
          <ul className="mt-4">
            {areaPages.map((a) => (
              <li key={a.slug}>
                <Link to={paths.area(a.slug)} className={linkClass}>
                  {fill(copy.areaPage.eyebrow, { area: a.name })}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-2 max-w-xs text-sm text-ash-400">
            Also {localities.filter((l) => !areaPages.some((a) => a.slug === l.slug)).map((l) => l.name).join(", ")} and {widerArea}.
          </p>
          <ul className="mt-5 flex flex-wrap gap-x-5">
            {mainNav().map((l) => (
              <li key={l.to}>
                <Link to={l.to} className={linkClass}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <h2 className="label text-ash-400">{text.contactTitle}</h2>
          <address className="mt-4 flex flex-col gap-4 not-italic">
            <a href={telHref(business.phone.tel)} className="figure inline-flex min-h-11 items-center gap-3 text-[2rem] text-white hover:text-cheese-300">
              <Phone className="size-5 shrink-0 text-cheese-400" aria-hidden="true" />
              {business.phone.display}
            </a>
            <p className="flex items-center gap-3">
              <WhatsAppIcon className="size-5 shrink-0 text-whatsapp" />
              <a href={waUrl()} target="_blank" rel="noopener noreferrer" className={linkClass}>
                WhatsApp {business.phone.display}
              </a>
            </p>
            <p className="flex gap-3 text-ash-300">
              <MapPin className="mt-0.5 size-5 shrink-0 text-cheese-400" aria-hidden="true" />
              {business.address.full}
            </p>
            <p className="flex gap-3 text-ash-300">
              <Clock className="mt-0.5 size-5 shrink-0 text-cheese-400" aria-hidden="true" />
              {business.hours.display}
            </p>
          </address>
          {[
            { title: text.orderOnlineTitle, links: business.orderOnline },
            { title: text.socialTitle, links: business.social },
          ]
            .filter((g) => g.links.length > 0)
            .map((g) => (
              <p key={g.title} className="mt-3 flex flex-wrap items-center gap-x-4">
                <span className="label text-ash-400">{g.title}</span>
                {g.links.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    <span className="link-draw">{l.label}</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ))}
              </p>
            ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-x-8 gap-y-2 py-6 text-sm text-ash-400 lg:flex-row lg:items-center">
          <p suppressHydrationWarning>
            © {year} {business.name}. All rights reserved.
          </p>
          {legal.pages.length > 0 && (
            <nav aria-label={legal.eyebrow}>
              <ul className="flex flex-wrap gap-x-5">
                {legal.pages.map((p) => (
                  <li key={p.slug}>
                    <Link to={paths.legal(p.slug)} className="inline-flex min-h-11 items-center text-ash-300 transition-colors hover:text-white">
                      {p.navLabel || p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {text.credit && <p className="text-xs text-ash-400">{text.credit}</p>}
        </div>
      </div>
    </footer>
  );
}
