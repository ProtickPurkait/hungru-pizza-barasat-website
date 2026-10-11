import { ArrowRight, ChevronDown, Mail, MapPin, Phone, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { DemoTag } from "@/components/common/DemoTag";
import { CrustDivider, CrustLine } from "@/components/common/Motifs";
import { Prose } from "@/components/common/Prose";
import { JsonLd, Seo } from "@/components/common/Seo";
import { business, copy, legal } from "@/data/site";
import type { LegalSection } from "@/data/types";
import { formatDate } from "@/lib/format";
import { paths, telHref } from "@/lib/paths";
import { breadcrumbSchema } from "@/lib/schema";
import { fill } from "@/lib/text";
import { waUrl } from "@/lib/whatsapp";
import NotFound from "./NotFound";

/** What {email}, {officer} and the other placeholders in policy text become. */
function legalValues(): Record<string, string> {
  const wa = business.whatsapp;
  return {
    business: business.name,
    entity: legal.contact.entity || business.name,
    officer: legal.contact.officer,
    email: legal.contact.email,
    address: business.address.full,
    phone: business.phone.display,
    whatsapp: /^91\d{10}$/.test(wa) ? `+91 ${wa.slice(2, 7)} ${wa.slice(7)}` : `+${wa}`,
    hours: business.hours.display,
    website: business.siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""),
  };
}

/** "Your rights" → "your-rights", unique on the page, so each part can be linked to. */
function withAnchors(sections: LegalSection[]) {
  const used = new Set<string>();
  return sections.map((s, i) => {
    let id =
      s.heading
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48) || `part-${i + 1}`;
    if (used.has(id)) id = `${id}-${i + 1}`;
    used.add(id);
    return { ...s, id, number: String(i + 1).padStart(2, "0") };
  });
}

function ContactItem({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="bg-maroon-950 p-5 sm:p-6">
      <dt className="label flex items-center gap-2.5 text-ash-400">
        <span className="text-cheese-400">{icon}</span>
        {label}
      </dt>
      <dd className="mt-3 min-w-0 text-white">{children}</dd>
    </div>
  );
}

/** Privacy policy, terms and the other legal pages. All their text comes from `legal` in content.json. */
export default function LegalPage() {
  const { slug } = useParams();
  const page = legal.pages.find((p) => p.slug === slug);
  if (!page) return <NotFound />;

  const path = paths.legal(page.slug);
  const crumbs = [
    { name: copy.nav.home, path: paths.home },
    { name: page.title, path },
  ];
  const values = legalValues();
  const parts = withAnchors(page.sections);
  const others = legal.pages.filter((p) => p.slug !== page.slug);
  const contact = legal.contact;

  const contents = (
    <ol className="mt-1">
      {parts.map((s) => (
        <li key={s.id}>
          <a href={`#${s.id}`} className="flex min-h-11 items-center gap-3 py-1 text-ash-700 hover:text-ink lg:min-h-9">
            <span className="label w-6 shrink-0 text-maroon-600 tabular-nums" aria-hidden="true">
              {s.number}
            </span>
            {s.heading}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <Seo {...page.seo} path={path} />
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <section className="relative overflow-hidden">
        <div className="wrap pt-3 sm:pt-5">
          <Breadcrumbs items={crumbs} />
        </div>
        <div className="wrap pt-4 pb-12 md:pb-16 lg:pt-6">
          <div className="max-w-4xl">
            <p className="label flex items-center gap-3 text-maroon-600">
              <span className="h-px w-8 bg-current" aria-hidden="true" />
              {legal.eyebrow}
            </p>
            <h1 className="mt-4 text-[2.5rem] text-ink sm:text-[3.4rem] lg:text-[4.25rem]">{page.title}</h1>
            <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-ash-600 sm:text-xl">{fill(page.lead, values)}</p>
            <p className="mt-6 text-sm text-ash-600">
              <span className="label mr-2 text-ash-500">{legal.updatedLabel}</span>
              <time dateTime={page.updated}>{formatDate(page.updated)}</time>
            </p>
            {business.demoMode && legal.demoNote && (
              <p className="mt-6 flex max-w-[64ch] items-start gap-3 border border-dashed border-ash-400 bg-ash-50 px-4 py-3 text-sm text-ash-700">
                <DemoTag className="shrink-0">Sample</DemoTag>
                <span>{legal.demoNote}</span>
              </p>
            )}
          </div>
        </div>
        <CrustLine />
      </section>

      <div className="wrap py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <nav aria-label={legal.contentsTitle} className="lg:col-span-4 xl:col-span-3">
            <details className="group border-y border-ash-300 lg:hidden">
              <summary className="label flex min-h-12 cursor-pointer list-none items-center justify-between text-ash-700 [&::-webkit-details-marker]:hidden">
                {legal.contentsTitle}
                <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="pb-4">{contents}</div>
            </details>
            <div className="hidden lg:sticky lg:top-28 lg:block lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
              <p className="label border-b border-ash-300 pb-3 text-ash-600">{legal.contentsTitle}</p>
              <div className="pt-2">{contents}</div>
            </div>
          </nav>

          <article className="min-w-0 lg:col-span-8 xl:col-span-9">
            <div className="max-w-[72ch]">
              {parts.map((s) => (
                <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="border-t border-ash-300 py-9 first:border-t-0 first:pt-0">
                  <h2 id={`${s.id}-title`} className="flex items-baseline gap-4 text-[1.55rem] text-ink sm:text-[1.9rem]">
                    <span className="label shrink-0 text-maroon-600 tabular-nums" aria-hidden="true">
                      {s.number}
                    </span>
                    <span>{s.heading}</span>
                  </h2>
                  <Prose className="mt-4" text={fill(s.body, values)} />
                </section>
              ))}
            </div>
          </article>
        </div>

        {others.length > 0 && (
          <section aria-labelledby="other-policies-title" className="mt-10 md:mt-14">
            <h2 id="other-policies-title" className="text-[1.6rem] text-ink sm:text-[2rem]">
              {legal.otherTitle}
            </h2>
            <ul className="mt-6 grid border-t border-ash-300 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3">
              {others.map((p) => (
                <li key={p.slug} className="border-b border-ash-300">
                  <Link to={paths.legal(p.slug)} className="group flex min-h-16 items-center justify-between gap-3 font-semibold text-ink hover:text-maroon-600">
                    {p.title}
                    <ArrowRight className="size-4 shrink-0 text-maroon-600 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <section aria-labelledby="legal-contact-title">
        <CrustDivider from="ground" to="dark" />
        <div className="ground-dark dot-texture">
          <div className="wrap grid gap-10 py-16 md:py-20 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 id="legal-contact-title" className="text-[2.2rem] text-white sm:text-[3rem]">
                {legal.contactTitle}
              </h2>
              <p className="mt-5 max-w-[48ch] text-lg leading-relaxed text-ash-300">{fill(legal.contactLead, values)}</p>
            </div>
            <dl className="grid gap-px self-start border border-white/10 bg-white/10 sm:grid-cols-2 lg:col-span-7">
              <ContactItem icon={<UserRound className="size-4" aria-hidden="true" />} label={legal.officerLabel}>
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{contact.officer}</span>
                  {contact.placeholder && <DemoTag dark>Sample</DemoTag>}
                </span>
                <span className="mt-1 block text-sm text-ash-400">{values.entity}</span>
              </ContactItem>
              <ContactItem icon={<Mail className="size-4" aria-hidden="true" />} label={legal.emailLabel}>
                <a href={`mailto:${contact.email}`} className="inline-flex min-h-11 items-center font-semibold break-all underline decoration-cheese-400 underline-offset-4 hover:text-cheese-300">
                  {contact.email}
                </a>
              </ContactItem>
              <ContactItem icon={<Phone className="size-4" aria-hidden="true" />} label={legal.phoneLabel}>
                <span className="flex flex-wrap items-center gap-x-4">
                  <a href={telHref(business.phone.tel)} className="inline-flex min-h-11 items-center font-semibold hover:text-cheese-300">
                    {business.phone.display}
                  </a>
                  <a href={waUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-ash-300 underline underline-offset-4 hover:text-white">
                    {copy.buttons.whatsappShort}
                  </a>
                </span>
                <span className="block text-sm text-ash-400">{business.hours.display}</span>
              </ContactItem>
              <ContactItem icon={<MapPin className="size-4" aria-hidden="true" />} label={legal.addressLabel}>
                <address className="text-ash-100 not-italic">{business.address.full}</address>
              </ContactItem>
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
