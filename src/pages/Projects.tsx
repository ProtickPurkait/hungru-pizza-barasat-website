import { PageHero } from "@/components/common/PageHero";
import { JsonLd, Seo } from "@/components/common/Seo";
import { DemoTag } from "@/components/common/DemoTag";
import { CtaBand } from "@/components/sections/CtaBand";
import { ProjectsGallery } from "@/components/sections/ProjectsGallery";
import { copy, pageSeo, projectFilters, projects } from "@/data/site";
import { paths } from "@/lib/paths";
import { breadcrumbSchema } from "@/lib/schema";

export default function Projects() {
  const text = copy.projectsPage;
  const crumbs = [
    { name: copy.nav.home, path: paths.home },
    { name: copy.nav.projects, path: paths.projects },
  ];
  return (
    <>
      <Seo {...pageSeo.projects} path={paths.projects} image={text.hero.photo} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <PageHero
        breadcrumbs={crumbs}
        eyebrow={text.hero.eyebrow}
        title={text.hero.title}
        lead={text.hero.lead}
        photo={text.hero.photo}
      />
      <section aria-labelledby="gallery-title" className="wrap py-16 md:py-24">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 id="gallery-title" className="text-[2.4rem] sm:text-[3.2rem]">
            <span className="figure text-maroon-500">{projects.length}</span> {text.countLabel}
          </h2>
          <DemoTag>Some sample photos</DemoTag>
        </div>
        <ProjectsGallery filterIds={projectFilters.map((f) => f.id)} />
      </section>
      <CtaBand title={text.ctaTitle} />
    </>
  );
}
