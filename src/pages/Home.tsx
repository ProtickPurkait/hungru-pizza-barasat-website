import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Seo } from "@/components/common/Seo";
import { Button } from "@/components/ui/button";
import { AreaChips } from "@/components/sections/AreaChips";
import { CtaBand } from "@/components/sections/CtaBand";
import { BuilderTeaser } from "@/components/sections/BuilderTeaser";
import { FaqSection } from "@/components/sections/FaqSection";
import { Hero } from "@/components/sections/Hero";
import { HowWeWork } from "@/components/sections/HowWeWork";
import { ProjectsGallery } from "@/components/sections/ProjectsGallery";
import { Reviews } from "@/components/sections/Reviews";
import { MenuTeaser } from "@/components/sections/MenuTeaser";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { copy, homeFaqs, pageSeo } from "@/data/site";
import { paths } from "@/lib/paths";

/** Section header with the title on the left and a "see all" link at its foot on the right. */
function HeaderRow({ children, link }: { children: React.ReactNode; link: { to: string; label: string } }) {
  return (
    <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
      {children}
      <Button asChild variant="outline" className="group self-start md:self-auto">
        <Link to={link.to}>
          {link.label}
          <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </Button>
    </div>
  );
}

export default function Home() {
  const home = copy.home;
  return (
    <>
      <Seo {...pageSeo.home} path={paths.home} />
      <Hero />
      <TrustStrip />

      {/* Sections below the fold use .defer-render, so phones lay them out (and load their photos) only when needed. */}
      <section aria-labelledby="services-title" className="defer-render wrap py-20 md:py-28">
        <HeaderRow link={{ to: paths.services, label: home.services.link }}>
          <SectionHeading
            id="services-title"
            title={home.services.title}
            lead={home.services.lead}
          />
        </HeaderRow>
        <div className="mt-10 md:mt-14">
          <MenuTeaser />
        </div>
      </section>

      <div className="defer-render">
        <HowWeWork />
      </div>

      <section aria-labelledby="projects-title" className="defer-render wrap py-20 md:py-28">
        <HeaderRow link={{ to: paths.projects, label: home.projects.link }}>
          <SectionHeading
            id="projects-title"
            title={home.projects.title}
            lead={home.projects.lead}
          />
        </HeaderRow>
        <div className="mt-12">
          <ProjectsGallery filterIds={home.projects.filters} limit={home.projects.count} />
        </div>
      </section>

      <div className="defer-render">
        <BuilderTeaser />
      </div>

      <div className="defer-render">
        <Reviews />
      </div>

      <section aria-labelledby="areas-title" className="defer-render border-t border-ash-200 bg-ground-2">
        <div className="wrap py-20 md:py-28">
          <SectionHeading
            id="areas-title"
            title={home.areas.title}
            lead={home.areas.lead}
          />
          <AreaChips className="mt-12 md:mt-16" />
        </div>
      </section>

      <div className="defer-render">
        <FaqSection faqs={homeFaqs} title={home.faqTitle} />
      </div>
      <CtaBand />
    </>
  );
}
