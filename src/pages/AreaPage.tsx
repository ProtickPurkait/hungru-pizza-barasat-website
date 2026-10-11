import { ArrowUpRight, Check, MapPin } from "lucide-react";
import { Link, useParams } from "react-router";
import { DemoTag } from "@/components/common/DemoTag";
import { PageHero } from "@/components/common/PageHero";
import { Reveal } from "@/components/common/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { JsonLd, Seo } from "@/components/common/Seo";
import { CtaBand } from "@/components/sections/CtaBand";
import { FaqSection } from "@/components/sections/FaqSection";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { areaPages, copy, photos, services } from "@/data/site";
import { paths } from "@/lib/paths";
import { breadcrumbSchema } from "@/lib/schema";
import { fill } from "@/lib/text";
import { areaMessage } from "@/lib/whatsapp";
import NotFound from "./NotFound";

/** /delivery/:slug/. Every delivery area has its own copy in `areaPages` (content.json). */
export default function AreaPage() {
  const { slug } = useParams();
  const area = areaPages.find((a) => a.slug === slug);
  if (!area) return <NotFound />;

  const text = copy.areaPage;
  const t = (template: string) => fill(template, { area: area.name });
  const path = paths.area(area.slug);
  const crumbs = [
    { name: copy.nav.home, path: paths.home },
    { name: t(text.eyebrow), path },
  ];
  const offered = area.services.map((s) => services.find((x) => x.slug === s)).filter((s) => s !== undefined);
  const nearbyAreas = areaPages.filter((a) => a.slug !== area.slug);
  const heroPhoto = photos[area.photo] ? area.photo : text.fallbackPhoto;

  return (
    <>
      <Seo title={area.seo.title} description={area.seo.description} path={path} image={heroPhoto} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <PageHero
        breadcrumbs={crumbs}
        eyebrow={t(text.eyebrow)}
        title={area.heading}
        lead={area.lead}
        photo={heroPhoto}
        whatsappText={areaMessage(area.name)}
      />

      <section aria-labelledby="local-title" className="wrap py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <SectionHeading id="local-title" size="md" title={t(text.workingTitle)} />
            <div className="mt-8 flex max-w-[62ch] flex-col gap-5 text-lg leading-relaxed text-ash-700">
              {area.intro.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
          <Reveal className="lg:col-span-5 lg:pt-2">
            <div className="round-panel dot-texture bg-maroon-950 p-7 text-white [--cut:24px] sm:p-9">
              <h2 className="text-[2rem] text-white">{area.localNotes.title}</h2>
              <ul className="mt-6 flex flex-col gap-4">
                {area.localNotes.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-ash-100">
                    <Check className="mt-0.5 size-5 shrink-0 text-cheese-400" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <DemoTag dark className="mt-6">Sample delivery details</DemoTag>
              <h3 className="label mt-9 text-ash-400">{text.nearLabel}</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {area.landmarks.map((l, i) => (
                  <li key={i} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-sm text-ash-200">
                    <MapPin className="size-3.5 text-cheese-400" aria-hidden="true" />
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="offered-title" className="border-y border-ash-200 bg-ground-2">
        <div className="wrap py-20 md:py-28">
          <SectionHeading
            id="offered-title"
            title={t(text.offeredTitle)}
            lead={text.offeredLead}
          />
          <div className="mt-12">
            <ServicesGrid services={offered} />
          </div>
        </div>
      </section>

      <div className="border-t border-ash-200">
        <FaqSection faqs={area.faqs} title={t(text.faqTitle)} />
      </div>

      <section aria-labelledby="more-areas" className="border-t border-ash-200">
        <div className="wrap py-14 md:py-20">
          <h2 id="more-areas" className="text-[2rem] sm:text-[2.6rem]">
            {text.alsoTitle}
          </h2>
          <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
            {nearbyAreas.map((a) => (
              <li key={a.slug}>
                <Link
                  to={paths.area(a.slug)}
                  className="figure group inline-flex min-h-11 items-baseline gap-1 text-[2.2rem] text-ink underline decoration-ash-300 decoration-[0.06em] underline-offset-[0.14em] transition-colors hover:text-maroon-500 hover:decoration-maroon-500 sm:text-[3rem]"
                >
                  {a.name}
                  <ArrowUpRight
                    className="size-[0.45em] self-start text-maroon-500 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand title={t(text.ctaTitle)} defaultLocality={area.name} />
    </>
  );
}
