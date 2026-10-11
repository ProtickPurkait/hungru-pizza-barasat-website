import type { ComponentType } from "react";
import { Route, Routes } from "react-router";
import { Layout } from "@/components/layout/Layout";

export interface Pages {
  Home: ComponentType;
  ServicesIndex: ComponentType;
  ServicePage: ComponentType;
  Projects: ComponentType;
  Builder: ComponentType;
  AreaPage: ComponentType;
  About: ComponentType;
  Contact: ComponentType;
  LegalPage: ComponentType;
  NotFound: ComponentType;
}

/** Pages are passed in: lazy chunks in the browser (pages/lazy.ts), plain imports when prerendering (pages/eager.ts). */
export function App({ pages: P }: { pages: Pages }) {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<P.Home />} />
        <Route path="/menu" element={<P.ServicesIndex />} />
        <Route path="/menu/:slug" element={<P.ServicePage />} />
        <Route path="/gallery" element={<P.Projects />} />
        <Route path="/build-your-pizza" element={<P.Builder />} />
        <Route path="/delivery/:slug" element={<P.AreaPage />} />
        <Route path="/about" element={<P.About />} />
        <Route path="/contact" element={<P.Contact />} />
        {/* Policy pages (/privacy-policy/ …). Unknown single-segment paths show "page not found" from there. */}
        <Route path="/:slug" element={<P.LegalPage />} />
        <Route path="*" element={<P.NotFound />} />
      </Routes>
    </Layout>
  );
}
