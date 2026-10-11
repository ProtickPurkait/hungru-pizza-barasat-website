import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { useLocation } from "react-router";
import { WhatsAppIcon } from "@/components/common/icons";
import { business, copy } from "@/data/site";
import { ctaBarCovered, onCtaBarCovered } from "@/lib/cta-bar";
import { paths, telHref } from "@/lib/paths";
import { cn } from "@/lib/utils";
import { defaultWhatsAppText, waUrl } from "@/lib/whatsapp";

/**
 * Fixed Call | WhatsApp bar on phones. Layout adds matching bottom padding.
 * It keeps out of sight while the home page hero, which has the same two buttons, is on
 * screen (see lib/cta-bar), so the buttons never show twice.
 */
export function MobileCtaBar() {
  const { pathname } = useLocation();
  // Hidden from the start on the home page, so the prerendered page never flashes the bar over the hero.
  const [hidden, setHidden] = useState(pathname === paths.home);

  useEffect(() => {
    setHidden(pathname === paths.home || ctaBarCovered());
    return onCtaBarCovered(() => setHidden(ctaBarCovered()));
  }, [pathname]);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 bg-maroon-950 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgb(22_21_20/0.22)] transition-[translate,visibility] duration-300 ease-out md:hidden",
        hidden && "invisible translate-y-full",
      )}
    >
      <div className="grid grid-cols-2 gap-px bg-maroon-950">
        <a
          href={telHref(business.phone.tel)}
          className="flex h-16 items-center justify-center gap-2.5 bg-maroon-500 text-[1.05rem] font-semibold text-white active:bg-maroon-700"
        >
          <Phone className="size-5" aria-hidden="true" />
          {copy.buttons.call}
        </a>
        <a
          href={waUrl(defaultWhatsAppText())}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-16 items-center justify-center gap-2.5 bg-whatsapp text-[1.05rem] font-semibold text-ink active:bg-whatsapp-600"
        >
          <WhatsAppIcon className="size-6" />
          {copy.buttons.whatsappShort}
          <span className="sr-only"> (opens WhatsApp)</span>
        </a>
      </div>
    </div>
  );
}

/** WhatsApp button, desktop and tablet only. */
export function FloatingWhatsApp() {
  return (
    <a
      href={waUrl(defaultWhatsAppText())}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed right-6 bottom-6 z-40 hidden items-center gap-3 rounded-full bg-whatsapp p-3.5 text-ink shadow-[0_14px_34px_-8px_rgb(22_21_20/0.45)] transition-transform duration-300 hover:-translate-y-1 md:flex"
    >
      <span className="sr-only font-semibold lg:not-sr-only lg:pl-1.5">{copy.buttons.whatsappChat}</span>
      <span className="sr-only"> (opens WhatsApp)</span>
      <WhatsAppIcon className="size-7 transition-transform duration-300 group-hover:rotate-[-8deg]" />
    </a>
  );
}
