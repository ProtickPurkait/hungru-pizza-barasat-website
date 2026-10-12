import { Suspense, useEffect, useRef, type ReactNode } from "react";
import { useLocation } from "react-router";
import { JsonLd } from "@/components/common/Seo";
import { ctaBarPageLoaded } from "@/lib/cta-bar";
import { businessSchema } from "@/lib/schema";
import { CartToast } from "./CartLinks";
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

/**
 * Sits beside the page inside its Suspense, so it mounts only once the page's code has loaded.
 * Its effect runs after the page's own, when any row of call and WhatsApp buttons has registered,
 * and lets the phone bar decide whether to show.
 */
function PageLoaded() {
  const { pathname } = useLocation();
  useEffect(() => ctaBarPageLoaded(), [pathname]);
  return null;
}

/**
 * Scrolls to the part of the page named after # in the address (a dish, a question, a job …),
 * which browsers do not do for links inside the site, and picks out a dish, question or job
 * (marked data-flash) for a moment. Beside the page inside its Suspense, so the page is there.
 */
function ScrollToHash() {
  const { hash, key } = useLocation();
  useEffect(() => {
    if (hash.length < 2) return;
    let target: HTMLElement | null = null;
    try {
      target = document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch {
      return;
    }
    if (!target) return;
    const el = target;
    // Clear of the header: the part's own scroll margin, or 6rem.
    const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 96;
    const land = () => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - margin, behavior: "instant" });
    land();
    // Parts above it that render only once near the screen can change its place: land again a moment later.
    const frame = requestAnimationFrame(() => requestAnimationFrame(land));
    if (!el.hasAttribute("data-flash")) return () => cancelAnimationFrame(frame);
    el.classList.add("found-target", "is-found");
    const fade = window.setTimeout(() => el.classList.remove("is-found"), 1600);
    const done = window.setTimeout(() => el.classList.remove("found-target"), 3000);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(fade);
      window.clearTimeout(done);
      el.classList.remove("found-target", "is-found");
    };
  }, [hash, key]);
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
        <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
          {children}
          <PageLoaded />
          <ScrollToHash />
        </Suspense>
      </main>
      <Footer />
      <MobileCtaBar />
      <FloatingWhatsApp />
      <CartToast />
      <JsonLd data={businessSchema()} />
    </div>
  );
}
