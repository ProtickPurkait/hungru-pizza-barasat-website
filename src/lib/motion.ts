import { useEffect, type DependencyList, type RefObject } from "react";
import type { gsap as Gsap } from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";

/*
 * GSAP is only used for scroll moments below the fold, so it is not part of the
 * first download. It loads on the visitor's first scroll, touch, mouse move or key
 * press (or a few seconds after the page has loaded), then every scene on the page
 * sets itself up. Nothing on screen depends on it: scenes only animate content
 * that is still below the fold.
 */

export interface Motion {
  gsap: typeof Gsap;
  ScrollTrigger: typeof ScrollTriggerType;
}

export interface SceneContext extends Motion {
  /** true at 768px and wider */
  desktop: boolean;
}

let loading: Promise<Motion> | null = null;

const WAKE_EVENTS = ["scroll", "wheel", "touchstart", "pointermove", "keydown"] as const;

function whenNeeded(): Promise<void> {
  return new Promise((resolve) => {
    let timer: number | undefined;
    const go = () => {
      window.clearTimeout(timer);
      WAKE_EVENTS.forEach((e) => window.removeEventListener(e, go));
      resolve();
    };
    WAKE_EVENTS.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
    const fallback = () => (timer = window.setTimeout(go, 4000));
    if (document.readyState === "complete") fallback();
    else window.addEventListener("load", fallback, { once: true });
  });
}

export function loadMotion(): Promise<Motion> {
  loading ??= whenNeeded()
    .then(() => Promise.all([import("gsap"), import("gsap/ScrollTrigger")]))
    .then(([g, st]) => {
      const { gsap } = g;
      const { ScrollTrigger } = st;
      gsap.registerPlugin(ScrollTrigger);
      // Sections below the fold use content-visibility, so the page height changes as
      // they render. Re-measure trigger positions when that happens.
      let timer: number | undefined;
      new ResizeObserver(() => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => ScrollTrigger.refresh(), 200);
      }).observe(document.body);
      return { gsap, ScrollTrigger };
    });
  return loading;
}

/** Elements that are already on screen (or above it) are left alone, so nothing visible ever blinks out. */
export function belowFold<T extends Element>(elements: T[]): T[] {
  return elements.filter((el) => el.getBoundingClientRect().top > window.innerHeight);
}

/**
 * Runs a GSAP scene scoped to `scope`. Skipped entirely with prefers-reduced-motion.
 * Everything the scene creates is reverted on unmount or when `deps` change.
 * Content must look finished without this running: scenes only animate *from* a state.
 */
export function useScrollScene(
  scope: RefObject<HTMLElement | null>,
  /** May return a cleanup function, e.g. to remove event listeners it added. */
  setup: (ctx: SceneContext) => void | (() => void),
  deps: DependencyList = [],
) {
  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    let cancelled = false;
    let mm: ReturnType<typeof Gsap.matchMedia> | undefined;

    loadMotion().then((motion) => {
      if (cancelled) return;
      mm = motion.gsap.matchMedia(el);
      mm.add(
        { ok: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 768px)" },
        (c) => {
          const { ok, desktop } = c.conditions as { ok: boolean; desktop: boolean };
          if (ok) return setup({ ...motion, desktop });
        },
      );
    });

    return () => {
      cancelled = true;
      mm?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
