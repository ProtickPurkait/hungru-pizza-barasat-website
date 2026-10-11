import { JsonLd } from "@/components/common/Seo";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Faq } from "@/data/types";
import { faqSchema } from "@/lib/schema";

/** FAQ as large editorial rows, plus FAQPage structured data. The heading stays in view on wide screens. */
export function FaqSection({
  faqs,
  eyebrow,
  title = "Common questions",
  lead,
}: {
  faqs: Faq[];
  eyebrow?: string;
  title?: string;
  lead?: string;
}) {
  return (
    <section aria-labelledby="faq-title" className="wrap py-20 md:py-28">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
        <SectionHeading id="faq-title" size="md" eyebrow={eyebrow} title={title} lead={lead} className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start" />
        <Accordion type="single" collapsible className="lg:col-span-8">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent className="text-[1.02rem] leading-relaxed text-ash-600">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <JsonLd data={faqSchema(faqs)} />
    </section>
  );
}
