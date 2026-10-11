import { useId } from "react";
import { cn } from "@/lib/utils";

const colors = {
  ground: "var(--color-ground)",
  ground2: "var(--color-ground-2)",
  sheet: "var(--color-sheet)",
  dark: "var(--color-maroon-950)",
} as const;
export type MotifColor = keyof typeof colors;

/*
 * The edge of a baked pizza crust is never even: it rises in bubbles of
 * different sizes. One "run" of bubbles, 240 units wide, repeated.
 * Each pair is [width, height].
 */
const BLISTERS: [number, number][] = [
  [34, 7],
  [22, 4],
  [46, 10],
  [28, 5],
  [40, 8],
  [18, 3],
  [52, 9],
];
const RUN = BLISTERS.reduce((w, [bw]) => w + bw, 0);

/** Quadratic bumps along a baseline at `y`, starting at x = 0. */
function blisterPath(runs: number, y: number, scale = 1): string {
  let d = "";
  for (let r = 0; r < runs; r++) for (const [w, h] of BLISTERS) d += `q${w / 2} ${-h * 2 * scale} ${w} 0`;
  return `M0 ${y}${d}`;
}

/**
 * The crust edge as a filled silhouette, used once per page where the light page
 * meets the dark closing band. `from` is the colour above, `to` the colour below.
 */
export function CrustDivider({ from, to, className }: { from: MotifColor; to: MotifColor; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <div aria-hidden="true" className={cn("pointer-events-none relative h-6 w-full", className)} style={{ background: colors[from] }}>
      <svg className="absolute inset-0 size-full">
        <defs>
          <pattern id={`crust-${id}`} width={RUN} height="24" patternUnits="userSpaceOnUse" patternTransform="translate(0 0)">
            <path d={`${blisterPath(1, 24, 1)}V24H0z`} fill={colors[to]} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#crust-${id})`} />
      </svg>
    </div>
  );
}

/**
 * The same crust edge as a single drawn line, along the bottom of every hero.
 * It draws itself once on load (CSS only, so it never waits for JavaScript).
 */
export function CrustLine({ className, runs = 8 }: { className?: string; runs?: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${runs * RUN} 22`}
      preserveAspectRatio="xMinYMid slice"
      className={cn("pointer-events-none block h-5 w-full text-ash-300", className)}
    >
      <path
        d={blisterPath(runs, 20, 0.9)}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1"
        className="animate-draw"
      />
    </svg>
  );
}

/* ------------------------------------------------------------- cheese stretch */

/** Melted cheese pulled across the width, sagging at each step: 1000 wide, steps at 1/8, 3/8, 5/8 and 7/8. */
const STRETCH = { w: 1000, h: 150, steps: [125, 375, 625, 875], top: 22, sag: 70, dripEnd: 128 } as const;

/** One strand: hangs from the top between the steps and sags to `low` above each of them. */
function strandPath(top: number, low: number): string {
  const control = 2 * low - top; // a quadratic curve reaches halfway to its control point
  let d = `M0 ${top}`;
  for (const x of STRETCH.steps) d += `Q${x} ${control} ${x + 125} ${top}`;
  return d;
}

/** The drips, in one path from left to right so a dash can let them fall in order: a long teardrop under each sag. */
function dripsPath(): string {
  const { sag, dripEnd: end } = STRETCH;
  return STRETCH.steps.map((x) => `M${x} ${sag}C${x} ${sag + 28} ${x - 7} ${end - 16} ${x - 7} ${end - 6}a7 7 0 0 0 14 0C${x + 7} ${end - 16} ${x} ${sag + 28} ${x} ${sag}`).join("");
}

/**
 * Melted cheese stretched across the section, the "cheese pull" of a slice of
 * cheese burst pizza, with a drip falling onto each of the four steps below.
 * Every path runs left to right with pathLength 1, so a scroll scene can pull
 * the cheese across by drawing them together. Scales with its container width.
 */
export function CheeseStretch({ className, pathClassName }: { className?: string; pathClassName?: string }) {
  return (
    <svg aria-hidden="true" viewBox={`-4 -4 ${STRETCH.w + 8} ${STRETCH.h + 8}`} className={cn("pointer-events-none block w-full overflow-visible", className)}>
      <path d={strandPath(STRETCH.top, STRETCH.sag)} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" pathLength={1} className={pathClassName} />
      <path d={strandPath(STRETCH.top - 10, STRETCH.sag - 16)} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" pathLength={1} className={pathClassName} />
      <path d={strandPath(STRETCH.top + 6, STRETCH.sag + 12)} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".7" pathLength={1} className={pathClassName} />
      <path d={dripsPath()} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" pathLength={1} className={pathClassName} />
    </svg>
  );
}
