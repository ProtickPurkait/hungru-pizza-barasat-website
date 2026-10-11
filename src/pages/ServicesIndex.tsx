import { PageHero } from "@/components/common/PageHero";
import { SectionHeading } from "@/components/common/SectionHeading";
import { JsonLd, Seo } from "@/components/common/Seo";
import { BuilderTeaser } from "@/components/sections/BuilderTeaser";
import { CtaBand } from "@/components/sections/CtaBand";
import { MenuFinder } from "@/components/sections/MenuFinder";
import { copy, pageSeo } from "@/data/site";
import { paths } from "@/lib/paths";
import { breadcrumbSchema, menuSchema } from "@/lib/schema";

/** /menu/: every section and dish with prices, with search, section tabs, sorting and Veg / Non-veg switches. */
export default function ServicesIndex() {
  const text = copy.servicesPage;
  const crumbs = [
    { name: copy.nav.home, path: paths.home },
    { name: copy.nav.services, path: paths.services },
  ];
  return (
    <>
      <Seo {...pageSeo.services} path={paths.services} image={text.hero.photo} />
      <JsonLd data={[menuSchema(), breadcrumbSchema(crumbs)]} />
      <PageHero breadcrumbs={crumbs} eyebrow={text.hero.eyebrow} title={text.hero.title} lead={text.hero.lead} photo={text.hero.photo} />
      <section aria-labelledby="list-title" className="wrap pt-16 pb-8 md:pt-24">
        <SectionHeading id="list-title" title={text.listTitle} lead={text.listLead} />
        <div className="mt-10">
          <MenuFinder />
        </div>
      </section>
      <div className="defer-render">
        <BuilderTeaser />
      </div>
      <CtaBand from="sheet" />
    </>
  );
}
