import { HeartHandshake } from "lucide-react";
import { DemoTag } from "@/components/common/DemoTag";
import { PageHero } from "@/components/common/PageHero";
import { Reveal } from "@/components/common/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { JsonLd, Seo } from "@/components/common/Seo";
import { SitePhoto } from "@/components/common/SitePhoto";
import { CtaBand } from "@/components/sections/CtaBand";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { brands, copy, pageSeo, praise, story, team, warranty } from "@/data/site";
import { paths } from "@/lib/paths";
import { breadcrumbSchema } from "@/lib/schema";

function initials(name: string) {
  return name
    .replace(/\(.*?\)/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export default function About() {
  const text = copy.aboutPage;
  const crumbs = [
    { name: copy.nav.home, path: paths.home },
    { name: copy.nav.about, path: paths.about },
  ];
  const [photoA, photoB] = text.storyPhotos;
  return (
    <>
      <Seo {...pageSeo.about} path={paths.about} image={text.hero.photo} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <PageHero
        breadcrumbs={crumbs}
        eyebrow={text.hero.eyebrow}
        title={text.hero.title}
        lead={text.hero.lead}
        photo={text.hero.photo}
      />
      <TrustStrip />

      <section aria-labelledby="story-title" className="wrap py-20 md:py-28">
        <div className="grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="lg:col-span-6">
            <SectionHeading id="story-title" size="md" title={text.storyTitle} />
            <DemoTag className="mt-5">To confirm</DemoTag>
            <div className="mt-6 flex max-w-[60ch] flex-col gap-5 text-lg leading-relaxed text-ash-700">
              {story.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
          <Reveal className="grid grid-cols-2 gap-4 lg:col-span-6">
            {photoA && <SitePhoto photo={photoA} ratio={3 / 4} maxWidth={768} sizes="(min-width: 1024px) 300px, 50vw" className="round-panel [--cut:24px]" />}
            {photoB && <SitePhoto photo={photoB} ratio={3 / 4} maxWidth={768} sizes="(min-width: 1024px) 300px, 50vw" className="round-panel mt-14 [--cut:24px]" />}
          </Reveal>
        </div>
      </section>

      {/* Shown once the team is added in the admin (Team & story) */}
      {team.length > 0 && (
        <section aria-labelledby="team-title" className="border-y border-ash-200 bg-ground-2">
          <div className="wrap py-20 md:py-28">
            <SectionHeading
              id="team-title"
              title={text.teamTitle}
              lead={text.teamLead}
            />
            <ul className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((m, i) => (
                <Reveal as="li" key={i} delay={i * 80} className="border-t-2 border-ink pt-6">
                  <span className="figure grid size-20 place-items-center rounded-full bg-maroon-950 text-[2.1rem] text-cheese-400" aria-hidden="true">
                    {initials(m.name)}
                  </span>
                  <h3 className="mt-6 text-[1.8rem]">{m.name}</h3>
                  <p className="label mt-2 text-maroon-600">{m.role}</p>
                  <p className="mt-3 leading-relaxed text-ash-600">{m.bio}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section aria-labelledby="materials-title" className="wrap py-20 md:py-28">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <SectionHeading id="materials-title" size="md" title={text.brandsTitle} />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {brands.map((b, i) => (
                <li key={i} className="rounded-[var(--cut)] bg-sheet p-5">
                  <p className="font-display text-[1.45rem] leading-none font-[740] text-ink [font-stretch:84%]">{b.name}</p>
                  <p className="mt-2 text-sm text-ash-600">{b.type}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-6">
            <SectionHeading id="warranty-title" size="md" title={warranty.headline} />
            <div className="round-panel ground-dark dot-texture mt-8 p-7 [--cut:24px] sm:p-9">
              <HeartHandshake className="size-10 text-cheese-400" aria-hidden="true" />
              <ul className="mt-6 flex flex-col gap-4">
                {warranty.points.map((p, i) => (
                  <li key={i} className="border-l-2 border-maroon-500 pl-4 text-ash-100">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <h3 className="mt-12 text-[1.8rem]">{text.praiseTitle}</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {praise.map((p, i) => (
                <li key={i} className="rounded-full border-[1.5px] border-ash-300 px-4 py-2 text-sm font-semibold text-ash-700">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
