import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { HeroVideo as HeroVideoContent } from "@/data/types";
import { photoSources } from "@/lib/photo";
import { cn } from "@/lib/utils";

type Shape = "wide" | "tall";

/** navigator.connection, where the browser has it (Chrome, Edge, Android). */
type Connection = { saveData?: boolean; effectiveType?: string };

/** Visitors who asked for less motion, or who are saving data or on a very slow connection, keep the still picture. */
function stillOnly(): boolean {
  const connection = (navigator as Navigator & { connection?: Connection }).connection;
  return matchMedia("(prefers-reduced-motion: reduce)").matches || !!connection?.saveData || /2g/.test(connection?.effectiveType ?? "");
}

const FIT = "absolute inset-0 size-full object-cover object-bottom lg:object-right";

export type HeroPlayer = ReturnType<typeof useHeroVideo>;

/**
 * The state the video and its (keyboard only) pause button share, so the hero can put the button wherever it fits.
 * The video loads after the page has, plays while it is on screen, and never plays for visitors
 * who switch motion off or save data.
 */
export function useHeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  /** Which video plays; null until the page has loaded, and for good when the still picture should stay. */
  const [shape, setShape] = useState<Shape | null>(null);
  /** The video has started at least once, so it can be shown over the picture. */
  const [shown, setShown] = useState(false);
  const [running, setRunning] = useState(false);
  /** Paused with the button. */
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (stillOnly()) return;
    const wide = matchMedia("(min-width: 1024px)");
    const pick = () => {
      setShown(false);
      setShape(wide.matches ? "wide" : "tall");
    };
    // Start once the page has loaded, so the video never holds up the text and the first picture.
    if (document.readyState === "complete") pick();
    else window.addEventListener("load", pick, { once: true });
    wide.addEventListener("change", pick);
    return () => {
      window.removeEventListener("load", pick);
      wide.removeEventListener("change", pick);
    };
  }, []);

  // Play while the hero is on screen and the visitor has not paused it.
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true; // Browsers only start a video on their own when it is muted.
    const watch = new IntersectionObserver(([entry]) => {
      // A refused start (a phone in low-power mode) leaves the still picture, with the play button.
      if (entry?.isIntersecting && !paused) v.play().catch(() => {});
      else v.pause();
    });
    watch.observe(v);
    return () => watch.disconnect();
  }, [shape, paused]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      setPaused(false);
      v.play().catch(() => {});
    } else setPaused(true);
  };

  const onPlaying = () => {
    setRunning(true);
    setShown(true);
  };

  return { ref, shape, shown, running, toggle, onPlaying, onPause: () => setRunning(false) };
}

/**
 * The looping food video behind the whole home page hero: wide on computers (food on the right,
 * text on the left), tall on phones and tablets (heading over its dark top, food in the middle,
 * buttons over its foot). Its first frame shows straight away as a plain picture, so the page
 * paints at once; the video fades in over that same frame once it plays.
 */
export function HeroVideo({ video, player, className }: { video: HeroVideoContent; player: HeroPlayer; className?: string }) {
  const still = { wide: photoSources(video.wide.poster).src, tall: photoSources(video.tall.poster).src };

  return (
    <div aria-hidden="true" className={cn("absolute inset-0", className)}>
      <picture>
        <source media="(min-width: 1024px)" srcSet={still.wide} />
        <img src={still.tall} alt="" fetchPriority="high" className={FIT} />
      </picture>
      {player.shape && (
        <video
          key={player.shape}
          ref={player.ref}
          src={video[player.shape].mp4}
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          onPlaying={player.onPlaying}
          onPause={player.onPause}
          className={cn(FIT, "transition-opacity duration-700", player.shown ? "opacity-100" : "opacity-0")}
        />
      )}
      {/* Shade for the text. Phones and tablets: at the top for the heading and text, and a little at the
          foot for the buttons, leaving the food in the middle clear. Computers: from the left. */}
      <div className="absolute inset-0 bg-linear-to-b from-maroon-950/85 via-maroon-950/50 via-30% to-transparent to-50% lg:bg-linear-to-r lg:from-maroon-950/95 lg:from-0% lg:via-maroon-950/80 lg:via-45% lg:to-transparent lg:to-80% xl:via-maroon-950/70 xl:via-38% xl:to-68%" />
      <div className="absolute inset-0 bg-linear-to-t from-maroon-950 from-2% via-maroon-950/45 via-16% to-transparent to-32% lg:hidden" />
      {/* A fade into the crust edge below */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-maroon-950 to-transparent" />
    </div>
  );
}

/**
 * The video's credit line (when there is one) and its pause button. The button stays out of
 * sight until it is reached with the keyboard, so keyboard and screen reader users can still stop the video.
 */
export function HeroVideoControls({ video, player, className }: { video: HeroVideoContent; player: HeroPlayer; className?: string }) {
  return (
    <div className={cn("pointer-events-none flex justify-end gap-3", className)}>
      <div className="flex items-center gap-3">
        {video.credit && <p className="rounded-full bg-black/45 px-3 py-1.5 text-xs text-white/90 backdrop-blur-sm">{video.credit}</p>}
        {player.shape && (
          <button
            type="button"
            onClick={player.toggle}
            aria-label={player.running ? video.pause : video.play}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-black/45 text-white opacity-0 ring-1 ring-white/30 backdrop-blur-sm transition-colors hover:bg-black/65 focus-visible:pointer-events-auto focus-visible:opacity-100"
          >
            {player.running ? <Pause className="size-4 fill-current" aria-hidden="true" /> : <Play className="size-4 translate-x-px fill-current" aria-hidden="true" />}
          </button>
        )}
      </div>
    </div>
  );
}
