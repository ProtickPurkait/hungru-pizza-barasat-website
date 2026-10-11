import { business } from "@/data/site";
import { cn } from "@/lib/utils";

/** Small tag on placeholder content. Hidden when `demoMode` is false in site.ts. */
export function DemoTag({ children, className, dark = false }: { children: string; className?: string; dark?: boolean }) {
  if (!business.demoMode) return null;
  return (
    <span
      className={cn(
        "label inline-flex items-center rounded-full border border-dashed px-2 py-1 text-[0.6rem]",
        dark ? "border-white/40 text-ash-200" : "border-ash-400 bg-ash-50 text-ash-600",
        className,
      )}
    >
      {children}
    </span>
  );
}
