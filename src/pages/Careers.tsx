import { useRef } from "react";
import { ArrowDown, Check } from "lucide-react";
import { WhatsAppButton } from "@/components/common/ContactButtons";
import { DemoTag } from "@/components/common/DemoTag";
import { PageHero } from "@/components/common/PageHero";
import { Reveal } from "@/components/common/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { JsonLd, Seo } from "@/components/common/Seo";
import { Button } from "@/components/ui/button";
import { ApplyForm, type ApplyFormHandle } from "@/components/sections/ApplyForm";
import { CtaBand } from "@/components/sections/CtaBand";
import { copy, jobs, pageSeo } from "@/data/site";
import type { JobOpening } from "@/data/types";
import { paths } from "@/lib/paths";
import { breadcrumbSchema } from "@/lib/schema";
import { applicationText } from "@/lib/whatsapp";

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="label text-ash-600">{title}</h4>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2.5 leading-snug text-ash-700">
            <Check className="mt-0.5 size-4 shrink-0 text-maroon-600" aria-hidden="true" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function JobCard({ job, onApply }: { job: JobOpening; onApply: () => void }) {
  const text = copy.careersPage;
  return (
    <article aria-labelledby={`job-${job.id}`} className="rounded-[var(--cut)] bg-sheet p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <h3 id={`job-${job.id}`} className="text-[1.9rem] sm:text-[2.3rem]">
          {job.title}
        </h3>
        {job.placeholder && <DemoTag>Sample</DemoTag>}
      </div>
      <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
        {[
          [text.typeLabel, job.type],
          [text.hoursLabel, job.hours],
          [text.payLabel, job.pay],
        ].map(([k, v]) => (
          <div key={k} className="flex gap-2">
            <dt className="text-ash-600">{k}</dt>
            <dd className="font-semibold text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 max-w-[62ch] text-lg leading-relaxed text-ash-700">{job.summary}</p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <List title={text.dutiesTitle} items={job.duties} />
        <List title={text.needsTitle} items={job.needs} />
      </div>
      <Button className="mt-8" onClick={onApply}>
        {text.applyButton}
      </Button>
    </article>
  );
}

/** /careers/: why work here, the open jobs, and an application that goes out on WhatsApp. */
export default function Careers() {
  const text = copy.careersPage;
  const form = useRef<ApplyFormHandle>(null);
  const formSection = useRef<HTMLElement>(null);
  const crumbs = [
    { name: copy.nav.home, path: paths.home },
    { name: copy.nav.careers, path: paths.careers },
  ];

  const apply = (role: string) => {
    formSection.current?.scrollIntoView({ block: "start" });
    form.current?.choose(role);
  };

  return (
    <>
      <Seo {...pageSeo.careers} path={paths.careers} image={text.hero.photo} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <PageHero
        breadcrumbs={crumbs}
        eyebrow={text.hero.eyebrow}
        title={text.hero.title}
        lead={text.hero.lead}
        photo={text.hero.photo}
        actions={
          <>
            <Button asChild size="lg" className="group">
              <a href="#jobs">
                {text.jobsButton}
                <ArrowDown className="transition-transform group-hover:translate-y-0.5" />
              </a>
            </Button>
            <WhatsAppButton size="lg" label={text.applyWhatsApp} text={applicationText()} />
          </>
        }
      />

      <section aria-labelledby="perks-title" className="wrap pt-16 pb-6 md:pt-24">
        <div className="flex flex-wrap items-center gap-3">
          <SectionHeading id="perks-title" title={text.perksTitle} size="md" />
          {text.perksPlaceholder && <DemoTag>Sample</DemoTag>}
        </div>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {text.perks.map((p, i) => (
            <Reveal as="li" key={i} delay={i * 70} className="border-t-2 border-ink pt-5">
              <span className="figure text-[1.6rem] text-maroon-600">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-[1.5rem]">{p.title}</h3>
              <p className="mt-2 leading-relaxed text-ash-600">{p.text}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      <section id="jobs" aria-labelledby="jobs-title" className="wrap scroll-mt-24 py-16 md:py-24">
        <SectionHeading id="jobs-title" title={text.openingsTitle} lead={text.openingsLead} size="md" />
        {jobs.length > 0 ? (
          <div className="mt-10 flex flex-col gap-5">
            {jobs.map((j) => (
              <JobCard key={j.id} job={j} onApply={() => apply(j.title)} />
            ))}
          </div>
        ) : (
          <p className="mt-8 max-w-[56ch] text-lg text-ash-700">{text.noOpenings}</p>
        )}
      </section>

      <section ref={formSection} id="apply" aria-labelledby="apply-title" className="scroll-mt-20 bg-ground-2">
        <div className="wrap grid gap-10 py-16 md:py-24 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <SectionHeading id="apply-title" eyebrow={text.formEyebrow} title={text.formTitle} lead={text.formLead} size="md" />
          </div>
          <div className="lg:col-span-7">
            <ApplyForm ref={form} />
          </div>
        </div>
      </section>

      <CtaBand title={text.ctaTitle} from="ground2" />
    </>
  );
}
