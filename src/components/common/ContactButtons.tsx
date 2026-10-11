import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { business, copy } from "@/data/site";
import { telHref } from "@/lib/paths";
import { defaultWhatsAppText, waUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./icons";

type Size = "default" | "sm" | "lg";

export function CallButton({
  className,
  size = "default",
  label = copy.buttons.call,
  showNumber = false,
  numberClassName,
  variant = "default",
}: {
  className?: string;
  size?: Size;
  label?: string;
  showNumber?: boolean;
  numberClassName?: string;
  /** "outline-light" on photos and video, where a filled maroon button would sink into the picture. */
  variant?: "default" | "outline-light";
}) {
  return (
    <Button asChild variant={variant} size={size} className={cn("group", className)}>
      <a href={telHref(business.phone.tel)}>
        <Phone aria-hidden="true" className="transition-transform duration-300 group-hover:-rotate-12" />
        <span>
          {label}
          {showNumber && <span className={cn("ml-1.5 font-bold tabular-nums", numberClassName)}>{business.phone.display}</span>}
        </span>
      </a>
    </Button>
  );
}

export function WhatsAppButton({
  className,
  size = "default",
  label = copy.buttons.whatsapp,
  text = defaultWhatsAppText(),
}: {
  className?: string;
  size?: Size;
  label?: string;
  text?: string;
}) {
  return (
    <Button asChild variant="whatsapp" size={size} className={cn("group", className)}>
      <a href={waUrl(text)} target="_blank" rel="noopener noreferrer">
        <WhatsAppIcon className="size-5 transition-transform duration-300 group-hover:scale-110" />
        <span>{label}</span>
        <span className="sr-only"> (opens WhatsApp)</span>
      </a>
    </Button>
  );
}
