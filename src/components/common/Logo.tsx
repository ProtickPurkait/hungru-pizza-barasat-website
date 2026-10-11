import { Link } from "react-router";
import { business, photos } from "@/data/site";
import { paths } from "@/lib/paths";
import { photoSources } from "@/lib/photo";
import { cn } from "@/lib/utils";
import { SliceMark } from "./icons";

/** A logo at least this many times wider than tall almost always has the name in it. */
const WIDE = 2;

/**
 * The logo in the header and (dark) in the footer.
 *
 * With no logo uploaded: the built-in wordmark, the business name set heavy and a little
 * narrow (long names put the rest in small caps below), next to a round maroon tile with the slice mark.
 *
 * With an uploaded logo (admin: Business details > Logo): the image is fitted to a fixed
 * height and a maximum width, never cropped or stretched, and shrinks further when the
 * header runs short of room, so a logo of any shape fits on every screen. On the dark
 * footer it sits on a white panel, unless a light version was uploaded for dark backgrounds;
 * that version also replaces it in the header in dark mode.
 */
export function Logo({ className, dark = false }: { className?: string; dark?: boolean }) {
  const logo = business.logo;
  const main = logo?.image ? photos[logo.image] : undefined;
  if (!main) {
    return (
      <Link to={paths.home} className={cn("group inline-flex min-h-11 items-center gap-3", className)}>
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-maroon-500 text-white">
          <SliceMark className="mt-0.5 h-[1.45rem] w-[2.1rem] transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5" />
        </span>
        <Wordmark dark={dark} />
      </Link>
    );
  }

  const lightKey = dark && logo.imageDark && photos[logo.imageDark] ? logo.imageDark : "";
  const key = lightKey || logo.image;
  // In dark mode the header swaps to the version for dark backgrounds, when one was uploaded.
  const nightKey = !dark && logo.imageDark && logo.imageDark !== logo.image && photos[logo.imageDark] ? logo.imageDark : "";
  const wide = !!main.width && !!main.height && main.width / main.height >= WIDE;
  const showName = logo.name === "show" || (logo.name === "auto" && !wide);
  // A dark logo would disappear on the dark footer, so it gets a white panel there.
  const plate = dark && !lightKey;

  const image = (k: string, className?: string) => {
    const photo = photos[k]!;
    // A stacked logo (lines of text under each other, so not much wider than tall) gets more height, or its small print would be unreadable.
    const stacked = !!photo.width && !!photo.height && photo.width / photo.height < WIDE;
    return (
      <img
        key={k}
        src={photoSources(k, undefined, 720).src}
        // The link's name: the business name, unless it is already written beside the image.
        alt={showName ? "" : business.name}
        width={photo.width}
        height={photo.height}
        // With two versions, lazy loading fetches only the one on show (the other is display: none).
        loading={dark || nightKey ? "lazy" : "eager"}
        decoding="async"
        className={cn(
          "block w-auto max-w-full min-w-0 object-contain object-left",
          showName ? cn("max-w-[4.5rem]", stacked ? "h-12" : "h-10") : dark ? (stacked ? "h-20" : "h-12") : stacked ? "h-12 md:h-16" : "h-10 md:h-12",
          className,
        )}
      />
    );
  };
  const img = nightKey ? (
    <>
      {image(key, "dark:hidden")}
      {image(nightKey, "hidden dark:block")}
    </>
  ) : (
    image(key)
  );

  return (
    <Link
      to={paths.home}
      className={cn(
        "inline-flex min-h-11 min-w-0 items-center gap-3",
        !showName && (dark ? "max-w-[16rem]" : "max-w-[11rem] sm:max-w-[15rem]"),
        className,
      )}
    >
      {plate ? <span className={cn("round-panel flex min-w-0 max-w-full bg-white [--cut:10px]", showName ? "shrink-0 p-1.5" : "px-3 py-2.5")}>{img}</span> : img}
      {showName && <Wordmark dark={dark} />}
    </Link>
  );
}

function Wordmark({ dark }: { dark: boolean }) {
  // "Hungru" large over "PIZZA" in small caps; longer names keep their first two words large.
  const words = business.name.split(" ");
  const lead = words.length > 2 ? 2 : 1;
  return (
    <span className="flex flex-col leading-none">
      <span className={cn("font-display text-[1.55rem] leading-[0.85] font-[780] tracking-[-0.02em] [font-stretch:82%]", dark ? "text-white" : "text-ink")}>
        {words.slice(0, lead).join(" ")}
      </span>
      <span className={cn("label mt-1 text-[0.58rem] tracking-[0.3em]", dark ? "text-ash-300" : "text-ash-600")}> {words.slice(lead).join(" ")}</span>
    </span>
  );
}
