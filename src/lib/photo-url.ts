// Photo URL helpers with no dependency on the site content (the admin panel uses them too).

export const WIDTHS = [360, 540, 720, 960, 1280, 1600];

/** A file path ("/images/x.jpg") or full URL, as opposed to an Unsplash photo id. */
export function isLocal(src: string): boolean {
  return src.startsWith("/") || src.startsWith("http") || src.startsWith("data:");
}

/** Unsplash CDN URL, cropped to the given aspect ratio. */
export function unsplashUrl(id: string, width: number, ratio?: number, quality = 55): string {
  const params = new URLSearchParams({ auto: "format", fit: "crop", w: String(width), q: String(quality) });
  if (ratio) params.set("h", String(Math.round(width / ratio)));
  return `https://images.unsplash.com/photo-${id}?${params.toString()}`;
}

/** Small preview image for any photo source. A null ratio keeps the whole photo (no crop). */
export function thumbUrl(src: string, width = 360, ratio: number | null = 4 / 3): string {
  return isLocal(src) ? src : unsplashUrl(src, width, ratio ?? undefined, 50);
}
