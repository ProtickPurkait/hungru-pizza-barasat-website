// JSON-LD builders. Placeholder reviews are deliberately never added to structured data.
import { business, localities, pageSeo, photos, services, widerArea } from "@/data/site";
import type { Faq, MenuItem, Service } from "@/data/types";
import { paths } from "./paths";
import { canonicalUrl, siteOrigin } from "./seo";
import { fill } from "./text";
import { ogImageUrl } from "./photo";

const businessId = () => `${siteOrigin()}/#business`;
const menuId = () => `${canonicalUrl(paths.services)}#menu`;
/** The business's own pages elsewhere: social pages, delivery apps and its Google listing. */
const sameAs = () => [...business.social, ...business.orderOnline].map((l) => l.url).concat(business.googleReviewsUrl).filter((u) => u.startsWith("https://"));

export function businessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": businessId(),
    name: business.name,
    description: fill(pageSeo.businessDescription, { category: business.category }),
    url: `${siteOrigin()}/`,
    image: ogImageUrl(pageSeo.shareImage, siteOrigin()),
    ...(business.logo?.image && photos[business.logo.image] ? { logo: ogImageUrl(business.logo.image, siteOrigin()) } : {}),
    telephone: business.phone.tel,
    priceRange: "₹",
    servesCuisine: ["Pizza", "Fast food", "Momos", "Burgers", "Beverages"],
    hasMenu: canonicalUrl(paths.services),
    acceptsReservations: true,
    ...(sameAs().length ? { sameAs: sameAs() } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address.street,
      addressLocality: business.address.locality,
      addressRegion: business.address.region,
      postalCode: business.address.postalCode,
      addressCountry: business.address.country,
    },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.mapsQuery)}`,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: business.hours.opens,
        closes: business.hours.closes,
      },
    ],
    areaServed: [
      ...localities.map((l) => ({ "@type": "Place", name: `${l.name}, ${business.address.region}` })),
      { "@type": "Place", name: `${widerArea[0]!.toUpperCase()}${widerArea.slice(1)} of ${business.address.locality}` },
    ],
    // A sample rating (demo mode) is never sent to Google.
    ...(business.demoMode
      ? {}
      : {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: business.rating.value,
            reviewCount: business.rating.count,
            bestRating: 5,
            worstRating: 1,
          },
        }),
  };
}

export function faqSchema(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}

function menuItemSchema(item: MenuItem) {
  const offer = (price: number, name?: string) => ({ "@type": "Offer", price, priceCurrency: "INR", ...(name ? { name } : {}) });
  return {
    "@type": "MenuItem",
    name: item.name,
    description: item.description,
    ...(item.diet === "veg" ? { suitableForDiet: "https://schema.org/VegetarianDiet" } : {}),
    offers: item.prices.length > 1 ? item.prices.map((p) => offer(p.price, p.size)) : offer(item.prices[0]!.price, item.prices[0]!.size),
  };
}

function menuSection(service: Service) {
  return {
    "@type": "MenuSection",
    name: service.name,
    description: service.summary,
    url: canonicalUrl(paths.service(service.slug)),
    hasMenuItem: service.items.map(menuItemSchema),
  };
}

/** One menu section, on its own page. */
export function menuSectionSchema(service: Service) {
  return { "@context": "https://schema.org", ...menuSection(service), isPartOf: { "@id": menuId() } };
}

/** The whole menu, on /menu/. */
export function menuSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": menuId(),
    name: `${business.name} menu`,
    url: canonicalUrl(paths.services),
    inLanguage: "en-IN",
    hasMenuSection: services.map(menuSection),
  };
}
