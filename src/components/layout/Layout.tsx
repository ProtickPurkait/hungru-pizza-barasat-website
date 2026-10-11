import { Suspense, useEffect, useRef, type ReactNode } from "react";
import { useLocation } from "react-router";
import { JsonLd } from "@/components/common/Seo";
import { businessSchema } from "@/lib/schema";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { FloatingWhatsApp, MobileCtaBar } from "./StickyCtas";

function ScrollToTop() {
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      <a
        href="#main"
        className="sr-only z-50 bg-maroon-500 px-4 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to main content
      </a>
      <ScrollToTop />
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>{children}</Suspense>
      </main>
      <Footer />
      <MobileCtaBar />
      <FloatingWhatsApp />
      <JsonLd data={businessSchema()} />
    </div>
  );
}
