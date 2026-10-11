import { useContext, useEffect } from "react";
import { applyHead, buildHead, HeadContext } from "@/lib/seo";

interface SeoProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
}

/**
 * Sets the page title and meta tags.
 * Prerender: reports to HeadContext so the tags are written into the static HTML.
 * Browser: updates document.head after client-side navigation. Renders nothing,
 * so hydration never sees duplicate head tags.
 */
export function Seo(props: SeoProps) {
  const collector = useContext(HeadContext);
  const head = buildHead(props);
  if (collector) collector.set(head);

  useEffect(() => {
    applyHead(head);
  }, [head.title, head.description, head.path, head.image, head.noindex]);

  return null;
}

/** JSON-LD structured data, rendered inline in the page body. */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
