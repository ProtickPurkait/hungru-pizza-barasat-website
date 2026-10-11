import { ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router";
import { PageHero } from "@/components/common/PageHero";
import { Seo } from "@/components/common/Seo";
import { CtaBand } from "@/components/sections/CtaBand";
import { copy, pageSeo, services } from "@/data/site";
import { paths } from "@/lib/paths";

export default function NotFound() {
  const { pathname } = useLocation();
  const text = copy.notFound;
  return (
    <>
      <Seo {...pageSeo.notFound} path={pathname} noindex />
      <PageHero
        eyebrow={text.eyebrow}
        title={text.title}
        lead={text.lead}
      />
      <section aria-labelledby="try-title" className="wrap py-16 md:py-20">
        <h2 id="try-title" className="text-[2rem] sm:text-[2.6rem]">
          {text.popularTitle}
        </h2>
        <ul className="mt-8 grid border-t border-ash-300 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3">
          {[
            { name: copy.nav.home, to: paths.home },
            { name: copy.nav.services, to: paths.services },
            { name: copy.nav.builder, to: paths.builder },
            ...services.slice(0, 3).map((s) => ({ name: s.name, to: paths.service(s.slug) })),
          ].map((l) => (
            <li key={l.to} className="border-b border-ash-300">
              <Link to={l.to} className="group flex min-h-16 items-center justify-between gap-3 font-semibold text-ink hover:text-maroon-600">
                {l.name}
                <ArrowRight className="size-4 text-maroon-600 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <CtaBand />
    </>
  );
}
