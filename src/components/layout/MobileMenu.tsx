import { ArrowRight } from "lucide-react";
import { Link, NavLink } from "react-router";
import { CallButton, WhatsAppButton } from "@/components/common/ContactButtons";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { business, copy, services } from "@/data/site";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/utils";

/** Slide-in menu for phones. Loaded only when first opened, to keep the first page load light. */
export default function MobileMenu({
  open,
  onOpenChange,
  nav,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nav: { label: string; to: string }[];
}) {
  const close = () => onOpenChange(false);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[90%] gap-0 overflow-y-auto border-l-0 bg-ground p-0 sm:max-w-sm [&>button]:top-3 [&>button]:right-3 [&>button]:grid [&>button]:size-11 [&>button]:place-items-center [&>button]:rounded-full [&>button]:opacity-100"
      >
        <div className="border-b border-ash-200 px-5 py-4">
          <SheetTitle className="label text-ash-600">{business.name}</SheetTitle>
          <SheetDescription className="mt-1 text-sm text-ash-600">{business.hours.display}</SheetDescription>
        </div>
        <nav aria-label="Mobile" className="px-5 pt-4 pb-6">
          <ul>
            {[{ label: copy.nav.home, to: paths.home }, ...nav].map((item) => (
              <li key={item.to} className="border-b border-ash-200">
                <NavLink
                  to={item.to}
                  end={item.to === paths.home}
                  onClick={close}
                  className={({ isActive }) =>
                    cn(
                      "group flex min-h-14 items-center justify-between font-display text-[2rem] leading-none font-[740] text-ink [font-stretch:84%]",
                      isActive && "text-maroon-600",
                    )
                  }
                >
                  {item.label}
                  <ArrowRight className="size-5 text-ash-400 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </NavLink>
              </li>
            ))}
          </ul>
          <p className="label mt-8 text-ash-600">{copy.nav.services}</p>
          <ul className="mt-2">
            {services.map((s) => (
              <li key={s.slug}>
                <Link to={paths.service(s.slug)} onClick={close} className="flex min-h-11 items-center text-ash-700 hover:text-ink">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto grid gap-3 border-t border-ash-200 bg-sheet p-5">
          <WhatsAppButton />
          <CallButton showNumber label={copy.buttons.callShort} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
