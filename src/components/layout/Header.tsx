import { lazy, Suspense, useRef, useState } from "react";
import { Clock, MapPin, Menu, Phone } from "lucide-react";
import { NavLink } from "react-router";
import { Logo } from "@/components/common/Logo";
import { Stars } from "@/components/common/RatingBadge";
import { WhatsAppButton } from "@/components/common/ContactButtons";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";
import { business, copy } from "@/data/site";
import { useScrollScene } from "@/lib/motion";
import { telHref } from "@/lib/paths";
import { cn } from "@/lib/utils";
import { mainNav } from "./nav";

const MobileMenu = lazy(() => import("./MobileMenu"));

export function Header() {
  const nav = mainNav();
  const [open, setOpen] = useState(false);
  const [menuLoaded, setMenuLoaded] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Tuck the header away while reading down the page, bring it back on any scroll up.
  useScrollScene(headerRef, ({ ScrollTrigger }) => {
    const el = headerRef.current;
    if (!el) return;
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        el.classList.toggle("is-tucked", self.direction === 1 && self.scroll() > 320);
        el.classList.toggle("is-scrolled", self.scroll() > 8);
      },
    });
  });

  return (
    <>
      {/* Info bar (desktop) */}
      <div className="hidden border-b border-ash-200 bg-ground-2 text-[0.8rem] text-ash-700 md:block">
        <div className="wrap flex h-9 items-center justify-between gap-6">
          <p className="flex items-center gap-2">
            <Clock className="size-3.5 text-maroon-600" aria-hidden="true" />
            {business.hours.display}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="size-3.5 text-maroon-600" aria-hidden="true" />
            {copy.header.location}
          </p>
          <a
            href={business.googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-9 items-center gap-2 hover:text-ink"
          >
            <Stars value={5} className="h-3.5 w-[4.4rem]" />
            <span>
              <strong className="text-ink">{business.rating.value}</strong> on Google · {business.rating.count} reviews
            </span>
          </a>
        </div>
      </div>

      <header
        ref={headerRef}
        className="site-header group/header sticky top-0 z-40 border-b border-transparent bg-ground/90 backdrop-blur-md transition-[border-color,transform] supports-[backdrop-filter]:bg-ground/80 [&.is-scrolled]:border-ash-200"
      >
        <div className="wrap flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
          <Logo />

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "relative inline-flex min-h-11 items-center px-2.5 text-[0.95rem] font-semibold whitespace-nowrap text-ash-700 transition-colors hover:text-ink xl:px-3.5",
                        "after:absolute after:inset-x-2.5 after:bottom-1.5 xl:after:inset-x-3.5 after:h-0.5 after:rounded-full after:origin-left after:scale-x-0 after:bg-maroon-500 after:transition-transform after:duration-300 hover:after:scale-x-100",
                        isActive && "text-ink after:scale-x-100",
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="outline" size="icon-sm">
              <a href={telHref(business.phone.tel)} aria-label={`Call ${business.phone.display}`}>
                <Phone />
              </a>
            </Button>
            {/* Hidden from 1024 to 1279px, where the seven links need the room (the floating WhatsApp button is there) */}
            <WhatsAppButton className="hidden md:inline-flex lg:hidden xl:inline-flex" size="sm" />

            <Button
              variant="outline"
              size="icon-sm"
              className="lg:hidden"
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-expanded={open}
              onClick={() => {
                setMenuLoaded(true);
                setOpen(true);
              }}
            >
              <Menu />
            </Button>
            {menuLoaded && (
              <Suspense fallback={null}>
                <MobileMenu open={open} onOpenChange={setOpen} nav={nav} />
              </Suspense>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
