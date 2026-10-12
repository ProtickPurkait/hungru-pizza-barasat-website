import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { DemoTag } from "@/components/common/DemoTag";
import { DietMark } from "@/components/common/DietMark";
import { PageHero } from "@/components/common/PageHero";
import { JsonLd, Seo } from "@/components/common/Seo";
import { ServiceIcon } from "@/components/common/ServiceIcon";
import { CtaBand } from "@/components/sections/CtaBand";
import { lowestPrice, MenuList } from "@/components/sections/MenuList";
import { copy, pageSeo, services } from "@/data/site";
import { formatINR } from "@/lib/format";
import { paths } from "@/lib/paths";
import { breadcrumbSchema } from "@/lib/schema";
import { fill } from "@/lib/text";

/**
 * /offers/: the combo meals. Every menu section marked as an offer (admin: Content → Menu → Combo offers),
 * one after the other, each price an add-to-cart button as on the menu.
 */
export default function Offers() {
  const text = copy.offersPage;
  const offers = services.filter((s) => s.offer);
  const crumbs = [
    { name: copy.nav.home, path: paths.home },
    { name: copy.nav.offers, path: paths.offers },
  ];

  return (
    <>
      <Seo {...pageSeo.offers} path={paths.offers} image={text.hero.photo} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <PageHero breadcrumbs={crumbs} eyebrow={text.hero.eyebrow} title={text.hero.title} lead={text.hero.lead} photo={text.hero.photo} />

      <div className="wrap pt-6 pb-8 md:pt-10">
        {/* One tap to each kind of combo */}
        <nav aria-label={text.jumpLabel} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {offers.map((s) => (
            <a
              key={s.slug}
              href={`#${s.slug}`}
              className="inline-flex min-h-12 shrink-0 items-center gap-2.5 rounded-full border-[1.5px] border-ash-300 bg-sheet py-1.5 pr-4 pl-1.5 font-semibold whitespace-nowrap text-ink transition-colors hover:border-ink"
            >
              <span className="grid size-9 place-items-center rounded-full bg-maroon-50 text-maroon-600">
                <ServiceIcon icon={s.icon} className="size-[1.1rem]" />
              </span>
              {s.shortName}
              <span className="text-sm font-medium text-ash-600">
                {copy.menu.fromLabel} {formatINR(lowestPrice(s.items))}
              </span>
            </a>
          ))}
        </nav>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ash-600">
          {text.note && <p className="font-semibold text-ink">{text.note}</p>}
          <span className="inline-flex items-center gap-1.5">
            <DietMark diet="veg" /> {copy.menu.vegLabel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <DietMark diet="non-veg" /> {copy.menu.nonVegLabel}
          </span>
          <DemoTag>Sample photos</DemoTag>
        </div>
      </div>

      <div className="wrap pb-20 md:pb-28">
        {offers.map((s) => (
          <section key={s.slug} id={s.slug} aria-labelledby={`${s.slug}-title`} className="scroll-mt-24 border-t-2 border-ink py-12 md:py-16">
            <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
              <div>
                <h2 id={`${s.slug}-title`} className="text-[2.3rem] sm:text-[2.8rem]">
                  {s.name}
                </h2>
                <p className="mt-4 max-w-[60ch] leading-relaxed text-ash-600">{s.summary}</p>
              </div>
              <Link to={paths.service(s.slug)} className="group inline-flex min-h-11 items-center gap-2 font-semibold text-ink">
                <span className="link-draw">{fill(text.sectionLink, { section: s.shortName })}</span>
                <ArrowRight className="size-4 text-maroon-600 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
            {/* The page's own note (GST) is said once, at the top */}
            {s.note && s.note !== text.note && <p className="mt-5 max-w-[70ch] text-sm leading-relaxed text-ash-600">{s.note}</p>}
            <MenuList section={s.slug} items={s.items} columns={2} className="mt-10" />
          </section>
        ))}
      </div>

      <CtaBand title={text.ctaTitle} />
    </>
  );
}
