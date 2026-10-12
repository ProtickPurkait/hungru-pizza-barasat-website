import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { JsonLd } from "@/components/common/Seo";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Faq } from "@/data/types";
import { faqSchema } from "@/lib/schema";

/**
 * FAQ as large editorial rows, plus FAQPage structured data. The heading stays in view on wide screens.
 * A link to one question (#faq-2, from the site search) opens the page there with its answer unfolded.
 */
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
  const { hash, key } = useLocation();
  const [open, setOpen] = useState("");
  useEffect(() => {
    if (/^#faq-\d+$/.test(hash)) setOpen(hash.slice(1));
  }, [hash, key]);

  return (
    <section aria-labelledby="faq-title" className="wrap py-20 md:py-28">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
        <SectionHeading id="faq-title" size="md" eyebrow={eyebrow} title={title} lead={lead} className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start" />
        <Accordion type="single" collapsible value={open} onValueChange={setOpen} className="lg:col-span-8">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`} id={`faq-${i}`} data-flash>
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
