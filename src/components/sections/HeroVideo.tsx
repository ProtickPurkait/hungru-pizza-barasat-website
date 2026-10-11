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

/**
 * The looping food video behind the home page heading: wide on computers (food on the right),
 * tall on phones and tablets (food below the text). Its first frame shows straight away as a
 * plain picture, so the page paints at once; the video loads after the page has, fades in over
 * that same frame, and pauses while it is scrolled out of view. Anyone can pause it (the button
 * in the corner), and it never plays for visitors who switch motion off or save data.
 */
export function HeroVideo({ video, className }: { video: HeroVideoContent; className?: string }) {
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

  const still = { wide: photoSources(video.wide.poster).src, tall: photoSources(video.tall.poster).src };

  return (
    <>
      <div aria-hidden="true" className={cn("relative", className)}>
        <picture>
          <source media="(min-width: 1024px)" srcSet={still.wide} />
          <img src={still.tall} alt="" fetchPriority="high" className={FIT} />
        </picture>
        {shape && (
          <video
            key={shape}
            ref={ref}
            src={video[shape].mp4}
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            onPlaying={() => {
              setRunning(true);
              setShown(true);
            }}
            onPause={() => setRunning(false)}
            className={cn(FIT, "transition-opacity duration-700", shown ? "opacity-100" : "opacity-0")}
          />
        )}
        {/* Shade for the text: from the top on phones, from the left on computers. Then a fade into the crust edge below. */}
        <div className="absolute inset-0 bg-linear-to-b from-maroon-950 from-4% via-maroon-950/55 via-30% to-transparent to-50% lg:bg-linear-to-r lg:from-maroon-950/95 lg:from-0% lg:via-maroon-950/80 lg:via-45% lg:to-transparent lg:to-80% xl:via-maroon-950/70 xl:via-38% xl:to-68%" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-maroon-950 to-transparent" />
      </div>

      {/* Credit and pause button: bottom right on phones and tablets, top right on computers (clear of the floating WhatsApp button) */}
      <div className="wrap pointer-events-none absolute inset-x-0 bottom-9 z-20 flex items-center justify-end gap-3 lg:top-6 lg:bottom-auto">
        {video.credit && <p className="rounded-full bg-black/45 px-3 py-1.5 text-xs text-white/90 backdrop-blur-sm">{video.credit}</p>}
        {shape && (
          <button
            type="button"
            onClick={toggle}
            aria-label={running ? video.pause : video.play}
            className="pointer-events-auto grid size-11 shrink-0 place-items-center rounded-full bg-black/45 text-white ring-1 ring-white/30 backdrop-blur-sm transition-colors hover:bg-black/65"
          >
            {running ? <Pause className="size-4 fill-current" aria-hidden="true" /> : <Play className="size-4 translate-x-px fill-current" aria-hidden="true" />}
          </button>
        )}
      </div>
    </>
  );
}
