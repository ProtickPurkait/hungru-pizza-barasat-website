import { photos } from "@/data/site";
import type { Photo } from "@/data/types";
import { isLocal, unsplashUrl, WIDTHS } from "./photo-url";

export { isLocal, unsplashUrl };

/** In the admin's live preview: photos uploaded but not published yet (file path → data URL). */
let overrides: Record<string, string> = {};
export function setPhotoOverrides(next: Record<string, string>): void {
  overrides = next;
}

export function getPhoto(key: string): Photo {
  const photo = photos[key];
  if (photo) return photo;
  // The build refuses unknown keys (src/lib/content-check.ts). At runtime, show any photo rather than crash the page.
  if (typeof console !== "undefined") console.warn(`Unknown photo "${key}"`);
  return Object.values(photos)[0] ?? { src: "", alt: "" };
}

export function photoSources(key: string, ratio?: number, maxWidth = 1600, quality?: number) {
  const { src, alt } = getPhoto(key);
  if (isLocal(src)) return { src: overrides[src] ?? src, srcSet: undefined, alt };
  const widths = WIDTHS.filter((w) => w <= maxWidth);
  return {
    src: unsplashUrl(src, widths[widths.length - 1] ?? 1080, ratio, quality),
    srcSet: widths.map((w) => `${unsplashUrl(src, w, ratio, quality)} ${w}w`).join(", "),
    alt,
  };
}

/** Absolute URL for social previews (og:image). */
export function ogImageUrl(key: string, siteUrl: string): string {
  const { src } = getPhoto(key);
  if (src.startsWith("http")) return src;
  if (src.startsWith("/")) return siteUrl + src;
  return unsplashUrl(src, 1200, 1200 / 630, 75);
}
