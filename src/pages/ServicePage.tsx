import { Check } from "lucide-react";
import { useParams } from "react-router";
import { DemoTag } from "@/components/common/DemoTag";
import { PageHero } from "@/components/common/PageHero";
import { Reveal } from "@/components/common/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { JsonLd, Seo } from "@/components/common/Seo";
import { ServiceIcon } from "@/components/common/ServiceIcon";
import { SitePhoto } from "@/components/common/SitePhoto";
import { CtaBand } from "@/components/sections/CtaBand";
import { FaqSection } from "@/components/sections/FaqSection";
import { MenuList } from "@/components/sections/MenuList";
import { ProjectsGallery } from "@/components/sections/ProjectsGallery";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { copy, projects, services } from "@/data/site";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/utils";
import { breadcrumbSchema, menuSectionSchema } from "@/lib/schema";
import { fill } from "@/lib/text";
import { serviceMessage } from "@/lib/whatsapp";
import NotFound from "./NotFound";

/** One template for every menu section (/menu/<slug>/). All content comes from `services` in content.json. */
export default function ServicePage() {
  const { slug } = useParams();
  const service = services.find((s) => s.slug === slug);
  if (!service) return <NotFound />;

  const text = copy.servicePage;
  const path = paths.service(service.slug);
  const crumbs = [
    { name: copy.nav.home, path: paths.home },
    { name: copy.nav.services, path: paths.services },
    { name: service.name, path },
  ];
  const related = projects.filter((p) => p.category === service.category && !service.gallery.includes(p.photo));
  const others = services.filter((s) => s.slug !== service.slug);

  return (
    <>
      <Seo title={service.seo.title} description={service.seo.description} path={path} image={service.heroPhoto} />
      <JsonLd data={[menuSectionSchema(service), breadcrumbSchema(crumbs)]} />

      <PageHero
        breadcrumbs={crumbs}
        eyebrow={service.tagline}
        title={service.name}
        lead={service.summary}
        photo={service.heroPhoto}
        whatsappText={serviceMessage(service.shortName)}
      />

      {/* The dishes first (two columns on large screens: some sections have 50), then the story and "order these for" */}
      <section aria-labelledby="menu-title" className="wrap py-20 md:py-28">
        <SectionHeading id="menu-title" size="md" title={text.menuTitle} />
        {service.note && <p className="mt-4 max-w-[70ch] text-sm leading-relaxed text-ash-600">{service.note}</p>}
        <MenuList items={service.items} columns={2} className="mt-10" />

        <div className="mt-20 grid gap-12 border-t border-ash-300 pt-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <h2 className="text-[2rem] sm:text-[2.3rem]">{text.aboutTitle}</h2>
            <div className="mt-6 flex max-w-[60ch] flex-col gap-5 text-lg leading-relaxed text-ash-700">
              {service.intro.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5">
            <Reveal>
              <div className="round-panel dot-texture bg-maroon-950 p-7 text-white [--cut:24px] sm:p-9">
                <div className="flex items-center gap-4">
                  <span className="grid size-12 place-items-center rounded-full bg-maroon-500 text-white">
                    <ServiceIcon icon={service.icon} className="size-6" />
                  </span>
                  <h2 className="text-[2rem] text-white">{text.goodFor}</h2>
                </div>
                <ul className="mt-7 flex flex-col gap-4">
                  {service.idealFor.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-ash-100">
                      <Check className="mt-0.5 size-5 shrink-0 text-cheese-400" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* What goes in */}
      <section aria-labelledby="materials-title" className="border-y border-ash-200 bg-ground-2">
        <div className="wrap py-20 md:py-24">
          <SectionHeading id="materials-title" size="md" title={text.materialsTitle} lead={text.materialsNote} />
          <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {service.materials.map((m, i) => (
              <Reveal key={i} delay={i * 60} className="flex flex-col rounded-[var(--cut)] bg-sheet p-6">
                <dt className="font-display text-[1.5rem] leading-none font-[740] text-ink [font-stretch:84%]">{m.name}</dt>
                <dd className="mt-2.5 text-[0.95rem] leading-relaxed text-ash-600">{m.note}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* Gallery: one large photo and two small ones */}
      <section aria-labelledby="gallery-title" className="wrap py-20 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading id="gallery-title" size="md" title={fill(text.galleryTitle, { service: service.shortName })} />
          <DemoTag>Sample photos</DemoTag>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:grid-rows-2 md:gap-4">
          {service.gallery.map((key, i) => (
            <li key={i} className={cn(i === 0 && "col-span-2 md:row-span-2")}>
              <SitePhoto
                photo={key}
                ratio={4 / 3}
                maxWidth={i === 0 ? 1280 : 720}
                sizes={i === 0 ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 768px) 33vw, 50vw"}
                className={cn("round-panel", i === 0 ? "[--cut:28px] md:h-full md:aspect-auto!" : "[--cut:18px]")}
              />
            </li>
          ))}
        </ul>
        {related.length > 0 && (
          <div className="mt-20 border-t border-ash-300 pt-12">
            <h3 className="text-[2rem] sm:text-[2.4rem]">{text.relatedTitle}</h3>
            <ProjectsGallery projects={related} limit={3} className="mt-8" />
          </div>
        )}
      </section>

      <div className="border-t border-ash-200">
        <FaqSection faqs={service.faqs} title={fill(text.faqTitle, { service: service.shortName })} />
      </div>

      <section aria-labelledby="other-title" className="border-t border-ash-200 bg-ground-2">
        <div className="wrap py-20 md:py-24">
          <SectionHeading id="other-title" size="md" title={text.otherTitle} />
          <div className="mt-10">
            <ServicesGrid services={others} />
          </div>
        </div>
      </section>

      <CtaBand from="ground2" title={fill(text.ctaTitle, { service: service.shortName })} />
    </>
  );
}
