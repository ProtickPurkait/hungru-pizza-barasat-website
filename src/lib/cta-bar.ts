import { useEffect, type RefObject } from "react";

/**
 * The phone Call | WhatsApp bar keeps out of sight while a row of the page's own call and
 * WhatsApp buttons is on screen (the top of every page, and the closing order band), so the
 * same buttons never show twice. Each row registers itself here; the bar reads it.
 */
const onScreen = new Set<Element>();
const listeners = new Set<() => void>();
/** Until the page itself has loaded, the bar cannot tell whether the page opens with its own buttons. */
let pageLoaded = false;

function changed(): void {
  listeners.forEach((listener) => listener());
}

export function ctaBarHidden(): boolean {
  return !pageLoaded || onScreen.size > 0;
}

export function onCtaBarChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Called by the layout once a page has loaded, after the page's button rows have registered. */
export function ctaBarPageLoaded(): void {
  pageLoaded = true;
  changed();
}

/** Marks a row of call and WhatsApp buttons: the phone bar stays hidden while it is on screen. */
export function useCoversCtaBar(ref: RefObject<Element | null>): void {
  useEffect(() => {
    const row = ref.current;
    if (!row) return;
    // Counted straight away when it starts on screen, so the bar never flashes up before the observer reports.
    const box = row.getBoundingClientRect();
    if (box.height > 0 && box.top < window.innerHeight && box.bottom > 0) {
      onScreen.add(row);
      changed();
    }
    const watch = new IntersectionObserver((entries) => {
      // A fast scroll can report several changes at once: the last one is where the row is now.
      if (entries.at(-1)?.isIntersecting) onScreen.add(row);
      else onScreen.delete(row);
      changed();
    });
    watch.observe(row);
    return () => {
      watch.disconnect();
      onScreen.delete(row);
      changed();
    };
  }, [ref]);
}
