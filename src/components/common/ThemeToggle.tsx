import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { copy } from "@/data/site";
import { currentTheme, setTheme, subscribeTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const isDark = () => currentTheme() === "dark";

/**
 * The light / dark switch in the header: a pill with a sun and a moon, and a knob that slides
 * to the mode in use (maroon with the sun, cheese yellow with the moon). The knob is placed by
 * CSS from <html data-theme>, so it is right from the first paint even though the page is
 * prerendered without knowing the visitor's mode; the on / off state for screen readers
 * follows as soon as the page is running.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const dark = useSyncExternalStore(subscribeTheme, isDark, () => false);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={copy.theme.label}
      title={copy.theme.label}
      onClick={() => setTheme(isDark() ? "light" : "dark")}
      className={cn(
        "relative inline-flex h-11 w-[4.75rem] shrink-0 items-center justify-between rounded-full border-[1.5px] border-ash-300 bg-ground-2 px-2.5 transition-colors hover:border-ink",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="absolute top-1/2 left-1 size-8 -translate-y-1/2 rounded-full bg-maroon-500 shadow-[0_2px_6px_rgb(22_21_20/0.3)] transition-[translate,background-color] duration-300 ease-out-expo dark:translate-x-[2.125rem] dark:bg-cheese-400"
      />
      <Sun className="relative size-[1.1rem] text-white transition-colors duration-300 dark:text-ash-500" aria-hidden="true" />
      <Moon className="relative size-[1.1rem] text-ash-500 transition-colors duration-300 dark:fill-current dark:text-maroon-950" aria-hidden="true" />
    </button>
  );
}
