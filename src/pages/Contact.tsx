import { ArrowUpRight, Bike, Clock, MapPin, Navigation, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/common/icons";
import { CrustDivider } from "@/components/common/Motifs";
import { PageHero } from "@/components/common/PageHero";
import { SectionHeading } from "@/components/common/SectionHeading";
import { JsonLd, Seo } from "@/components/common/Seo";
import { OrderForm } from "@/components/sections/OrderForm";
import { Button } from "@/components/ui/button";
import { business, copy, pageSeo } from "@/data/site";
import { paths, telHref } from "@/lib/paths";
import { breadcrumbSchema } from "@/lib/schema";
import { defaultWhatsAppText, waUrl } from "@/lib/whatsapp";

function ContactCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col rounded-[var(--cut)] bg-sheet p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-maroon-950 text-cheese-400">{icon}</span>
        <h3 className="label text-ash-600">{title}</h3>
      </div>
      <div className="mt-4 min-w-0 text-ink">{children}</div>
    </div>
  );
}

export default function Contact() {
  const text = copy.contactPage;
  const crumbs = [
    { name: copy.nav.home, path: paths.home },
    { name: copy.nav.contact, path: paths.contact },
  ];
  const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(business.mapsQuery)}&output=embed`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(business.mapsQuery)}`;
  return (
    <>
      <Seo {...pageSeo.contact} path={paths.contact} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <PageHero
        breadcrumbs={crumbs}
        eyebrow={text.hero.eyebrow}
        title={text.hero.title}
        lead={text.hero.lead}
        photo={text.hero.photo}
      />

      <section aria-labelledby="reach-title" className="wrap py-16 md:py-24">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <SectionHeading id="reach-title" size="md" title={text.reachTitle} />
            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <ContactCard icon={<Phone className="size-5" aria-hidden="true" />} title={text.phoneTitle}>
                <a href={telHref(business.phone.tel)} className="figure inline-flex min-h-11 items-center text-[2.4rem] hover:text-maroon-500">
                  {business.phone.display}
                </a>
                <p className="text-sm text-ash-600">{text.phoneHint}</p>
              </ContactCard>
              <ContactCard icon={<WhatsAppIcon className="size-5" />} title={text.whatsappTitle}>
                <Button asChild variant="whatsapp">
                  <a href={waUrl(defaultWhatsAppText())} target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon className="size-5" />
                    {copy.buttons.whatsappChat}
                  </a>
                </Button>
                <p className="mt-3 text-sm text-ash-600">{text.whatsappHint}</p>
              </ContactCard>
              <ContactCard icon={<MapPin className="size-5" aria-hidden="true" />} title={text.addressTitle}>
                <address className="not-italic">{business.address.full}</address>
                <a
                  href={directions}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-2 inline-flex min-h-11 items-center gap-1.5 font-semibold"
                >
                  <Navigation className="size-4 text-maroon-600" aria-hidden="true" />
                  <span className="link-draw">{text.directions}</span>
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </a>
              </ContactCard>
              <ContactCard icon={<Clock className="size-5" aria-hidden="true" />} title={text.hoursTitle}>
                <p className="font-semibold">{business.hours.display}</p>
                <p className="mt-1 text-sm text-ash-600">{text.hoursNote}</p>
              </ContactCard>
              {business.orderOnline.length > 0 && (
                <ContactCard icon={<Bike className="size-5" aria-hidden="true" />} title={text.orderOnlineTitle}>
                  <div className="flex flex-wrap gap-2">
                    {business.orderOnline.map((l) => (
                      <Button key={l.url} asChild variant="outline" size="sm">
                        <a href={l.url} target="_blank" rel="noopener noreferrer">
                          {l.label}
                          <ArrowUpRight className="size-4" aria-hidden="true" />
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      </Button>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-ash-600">{text.orderOnlineHint}</p>
                </ContactCard>
              )}
            </div>
          </div>
          <div className="lg:col-span-7">
            <SectionHeading
              size="md"
              eyebrow={text.formEyebrow}
              title={text.formTitle}
              lead={text.formLead}
            />
            <OrderForm className="mt-9" />
          </div>
        </div>
      </section>

      <section aria-labelledby="map-title">
        <CrustDivider from="ground" to="dark" />
        <div className="ground-dark dot-texture">
          <div className="wrap py-16 md:py-24">
            <SectionHeading id="map-title" dark size="md" title={text.mapTitle} lead={business.address.full} />
            <div className="round-panel mt-10 overflow-hidden bg-ash-800 [--cut:32px]">
              <iframe
                title={`Map showing ${business.name}, ${business.address.full}`}
                src={mapEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block aspect-[4/3] w-full grayscale-[35%] sm:aspect-[16/7]"
              />
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href={directions} target="_blank" rel="noopener noreferrer">
                  <Navigation />
                  {text.directions}
                </a>
              </Button>
              <Button asChild variant="outline-light" size="lg">
                <a href={telHref(business.phone.tel)}>
                  <Phone />
                  {text.callFirst}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
