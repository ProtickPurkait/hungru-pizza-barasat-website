import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type Kind = "olive" | "capsicum" | "onion" | "chilli" | "leaf" | "mushroom" | "tomato" | "paneer" | "corn";

/**
 * Pizza toppings as line drawings, 48 × 48, in the same drawn style as the crust line and the
 * cheese stretch: an olive ring, a capsicum ring, an onion ring, a chilli, a basil leaf, a
 * mushroom slice, a tomato slice, a paneer cube and a sweetcorn kernel.
 */
function ToppingShape({ kind }: { kind: Kind }) {
  const shape = {
    olive: <circle cx="24" cy="24" r="12" strokeWidth="7" />,
    capsicum: (
      <>
        <path
          d="M24 7c5 0 6 3 10 3 5 0 7 4 7 9 0 4-2 5-2 9 0 5 3 7-1 11s-8 1-14 2c-6 1-10 2-14-2s-1-7-1-11-2-6-2-10c0-5 3-8 8-8 4 0 5-3 9-3Z"
          strokeWidth="3.4"
        />
        <path d="M24 11v5M36.5 26h-4.5M14 36l3-3" />
      </>
    ),
    onion: (
      <>
        <ellipse cx="24" cy="24" rx="17" ry="15" />
        <ellipse cx="25" cy="24.5" rx="11.5" ry="10" />
      </>
    ),
    chilli: (
      <>
        <path d="M11 37c9-2 17-8 22-18 1-2 3-3 5-2s1 3 0 5c-6 11-15 17-26 17-2 0-3-1-1-2Z" />
        <path d="M38 17c0-3 2-6 5-7" />
      </>
    ),
    leaf: (
      <>
        <path d="M9 39C9 21 21 10 40 9c0 19-12 30-31 30Z" />
        <path d="M9 39 31 17M18 30h7M23 25v-7" />
      </>
    ),
    mushroom: (
      <>
        <path d="M7 24c0-9 8-15 17-15s17 6 17 15c0 2-1 3-3 3H10c-2 0-3-1-3-3Z" />
        <path d="M18 27v8c0 3 3 5 6 5s6-2 6-5v-8M17 20l2 3M24 18v4M31 20l-2 3" />
      </>
    ),
    tomato: (
      <>
        <circle cx="24" cy="24" r="16" />
        <circle cx="24" cy="24" r="3" />
        <path d="M24 13c3 2 3 5 0 7-3-2-3-5 0-7ZM33 29c-3 1-6 0-7-3 3-1 6 0 7 3ZM15 29c1-3 4-4 7-3-1 3-4 4-7 3Z" />
      </>
    ),
    paneer: (
      <>
        <path d="M24 8l14 8v16l-14 8-14-8V16Z" />
        <path d="M10 16l14 8 14-8M24 24v16" />
      </>
    ),
    corn: (
      <>
        <path d="M17 12h14c3 0 5 3 5 7v5c0 8-5 14-12 14s-12-6-12-14v-5c0-4 2-7 5-7Z" />
        <path d="M18 19c1-2 3-3 5-3" />
      </>
    ),
  }[kind];
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="size-full">
      {shape}
    </svg>
  );
}

interface Topping {
  kind: Kind;
  /** Position on large screens, as a share of the page's content width (1280px at most) and of the hero's height. */
  x: string;
  y: string;
  /** Size in px. */
  size: number;
  /** Faintness: 0.14 to 0.3, so text in front stays easy to read. */
  opacity: number;
  /** How far it drifts as the page scrolls (0 = not at all). Further away moves less. */
  depth: number;
  /** The float: seconds per swing, a head start, the drift and the turn at each end. */
  float: { dur: number; delay: number; dx: number; dy: number; r0: number; r1: number };
  /** Position on phones. Without it the topping is hidden there. */
  phone?: { x: string; y: string };
  /** Only on screens at least this wide: 1440 for the side margins, 1280 where the text column is tight. */
  from?: 1280 | 1440;
}

// Placed in the empty spaces: the side margins, above and below the text, and between the
// text and the pizza. Never over the heading or the pizza itself.
const TOPPINGS: Topping[] = [
  { kind: "olive", x: "-3.5%", y: "14%", size: 34, opacity: 0.26, depth: 0.5, float: { dur: 9, delay: -2, dx: 6, dy: -16, r0: 0, r1: 40 }, from: 1440 },
  { kind: "capsicum", x: "45.5%", y: "5%", size: 58, opacity: 0.22, depth: 0.8, float: { dur: 11, delay: -6, dx: -8, dy: 14, r0: -12, r1: 22 }, phone: { x: "80%", y: "3.5%" } },
  { kind: "chilli", x: "47.5%", y: "58%", size: 46, opacity: 0.24, depth: 1, float: { dur: 8, delay: -1, dx: 10, dy: -12, r0: 8, r1: -14 }, from: 1280 },
  { kind: "leaf", x: "-2.5%", y: "68%", size: 44, opacity: 0.22, depth: 0.6, float: { dur: 10, delay: -4, dx: 8, dy: -10, r0: -20, r1: 6 }, from: 1440 },
  { kind: "onion", x: "31%", y: "84%", size: 60, opacity: 0.18, depth: 0.4, float: { dur: 13, delay: -7, dx: -10, dy: -12, r0: 10, r1: 34 }, phone: { x: "3%", y: "89%" } },
  { kind: "mushroom", x: "101.5%", y: "8%", size: 42, opacity: 0.22, depth: 0.7, float: { dur: 12, delay: -3, dx: -6, dy: 14, r0: 14, r1: -10 }, from: 1440 },
  { kind: "paneer", x: "101%", y: "76%", size: 38, opacity: 0.24, depth: 0.9, float: { dur: 9, delay: -5, dx: -8, dy: -14, r0: -8, r1: 20 }, from: 1440 },
  { kind: "corn", x: "58%", y: "86%", size: 28, opacity: 0.26, depth: 0.5, float: { dur: 7, delay: -2, dx: 6, dy: -10, r0: 20, r1: -6 } },
  { kind: "tomato", x: "32%", y: "2%", size: 40, opacity: 0.18, depth: 0.3, float: { dur: 14, delay: -9, dx: 10, dy: 10, r0: 0, r1: 50 }, phone: { x: "64%", y: "9.5%" } },
  { kind: "olive", x: "49%", y: "78%", size: 24, opacity: 0.22, depth: 0.7, float: { dur: 8, delay: -6, dx: -6, dy: -12, r0: 0, r1: -30 } },
];

/**
 * The hero's background: pizza toppings drifting slowly around the text and the spinning pizza,
 * each bobbing and turning at its own pace (CSS, so it moves before any JavaScript). While the
 * page scrolls they also drift apart at different speeds, so they seem to float at different
 * depths (data-depth, picked up by the hero's scroll scene). Faint and decorative only: hidden
 * from screen readers, never in the way of a tap, and still for anyone who asks for less motion.
 */
export function HeroToppings({ className }: { className?: string }) {
  return (
    // Anchored to the content column, not the window, so the toppings keep their places beside the text and the pizza on wide screens.
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-y-0 left-1/2 w-full max-w-[80rem] -translate-x-1/2 text-maroon-600 select-none", className)}>
      {TOPPINGS.map((t, i) => (
        <span
          key={i}
          data-depth={t.depth}
          className={cn("absolute top-(--py) left-(--px) lg:top-(--y) lg:left-(--x)", !t.phone && "max-lg:hidden", t.from === 1280 && "max-xl:hidden", t.from === 1440 && "max-[1440px]:hidden")}
          style={
            {
              "--x": t.x,
              "--y": t.y,
              "--px": t.phone?.x ?? t.x,
              "--py": t.phone?.y ?? t.y,
              width: t.size,
              height: t.size,
              opacity: t.opacity,
            } as CSSProperties
          }
        >
          <span
            className="topping-float block size-full"
            style={
              {
                "--dur": `${t.float.dur}s`,
                "--delay": `${t.float.delay}s`,
                "--dx": `${t.float.dx}px`,
                "--dy": `${t.float.dy}px`,
                "--r0": `${t.float.r0}deg`,
                "--r1": `${t.float.r1}deg`,
              } as CSSProperties
            }
          >
            <ToppingShape kind={t.kind} />
          </span>
        </span>
      ))}
    </div>
  );
}
