import { useEffect, useRef, type ReactNode } from "react";
import { observeReveal } from "@/lib/reveal";
import { cn } from "@/lib/utils";

type Tag = "div" | "section" | "li" | "article";

/**
 * Subtle fade-up on scroll. Content is only hidden once JS runs (html.js), never
 * with prefers-reduced-motion, and never used for above-the-fold content.
 */
export function Reveal({
  as: Tag = "div",
  className,
  delay = 0,
  children,
}: {
  as?: Tag;
  className?: string;
  delay?: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => observeReveal(ref.current), []);
  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={cn("reveal", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
