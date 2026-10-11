import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  /** Small label above the title. Use sparingly: most sections need only the title. */
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  as?: "h1" | "h2";
  align?: "left" | "center";
  dark?: boolean;
  size?: "lg" | "md";
  id?: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  as: Tag = "h2",
  align = "left",
  dark = false,
  size = "lg",
  id,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className={cn("label mb-4 flex items-center gap-3", align === "center" && "justify-center", dark ? "text-cheese-300" : "text-maroon-600")}>
          <span className="h-px w-8 bg-current" aria-hidden="true" />
          {eyebrow}
        </p>
      )}
      <Tag
        id={id}
        className={cn(
          size === "lg" ? "text-[2.4rem] sm:text-[3.4rem] lg:text-[4rem]" : "text-[2rem] sm:text-[2.6rem]",
          dark ? "text-white" : "text-ink",
        )}
      >
        {title}
      </Tag>
      {lead && (
        <p className={cn("mt-5 max-w-[58ch] text-lg leading-relaxed", align === "center" && "mx-auto", dark ? "text-ash-300" : "text-ash-600")}>
          {lead}
        </p>
      )}
    </div>
  );
}
