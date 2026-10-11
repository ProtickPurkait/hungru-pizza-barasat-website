// Prepares a photo for upload in the browser: scaled to at most 1920px on the long side,
// saved as WebP (JPEG where the browser cannot), and stripped of camera data such as GPS.
// A logo is also cut down to its drawn part (empty margins would make it look small),
// sized for a header rather than a full screen, and keeps its see-through background.
import type { SiteContent } from "@/data/types";

const MAX_EDGE = 1920;
/** Logos show at most 56px tall and 256px wide: this is sharp on any phone and enough for Google. */
const LOGO_MAX = { width: 960, height: 320 };
/** Logos are checked for empty margins at this size, so a huge file does not stall the browser. */
const TRIM_EDGE = 1600;

export interface PreparedImage {
  /** Base64 without the data: prefix, for the API. */
  base64: string;
  /** For showing the photo before it is published. */
  dataUrl: string;
  name: string;
  width: number;
  height: number;
  bytes: number;
}

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function canvas2d(width: number, height: number, read = false) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: read })!;
  ctx.imageSmoothingQuality = "high";
  return { canvas, ctx };
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * The drawn part of a logo without its empty margins: see-through pixels, or a plain
 * background the colour of all four corners. `data` is RGBA, as a canvas gives it.
 * Null when nothing is drawn at all.
 */
export function contentBox(data: ArrayLike<number>, width: number, height: number): Box | null {
  const at = (x: number, y: number) => (y * width + x) * 4;
  const corners = [at(0, 0), at(width - 1, 0), at(0, height - 1), at(width - 1, height - 1)];
  const seeThrough = corners.some((i) => data[i + 3]! < 16);
  const c = corners[0]!;
  const background = (i: number) => Math.abs(data[i]! - data[c]!) <= 24 && Math.abs(data[i + 1]! - data[c + 1]!) <= 24 && Math.abs(data[i + 2]! - data[c + 2]!) <= 24;
  if (!seeThrough && !corners.every(background)) return { x: 0, y: 0, width, height };
  const empty = seeThrough ? (i: number) => data[i + 3]! < 16 : background;

  let top = height;
  let left = width;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (empty(at(x, y))) continue;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      bottom = y;
    }
  }
  return right < 0 ? null : { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
}

export async function prepareImage(file: File, { logo = false }: { logo?: boolean } = {}): Promise<PreparedImage> {
  if (!file.type.startsWith("image/")) throw new Error(`"${file.name}" is not a photo.`);
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(`"${file.name}" could not be opened. Try a JPG or PNG.`);
  }

  // The part of the original to keep: all of it, or for a logo only the drawn part.
  let [sx, sy, sw, sh] = [0, 0, bitmap.width, bitmap.height];
  if (logo) {
    const k = Math.min(1, TRIM_EDGE / Math.max(sw, sh));
    const probe = canvas2d(Math.max(1, Math.round(sw * k)), Math.max(1, Math.round(sh * k)), true);
    probe.ctx.drawImage(bitmap, 0, 0, probe.canvas.width, probe.canvas.height);
    const box = contentBox(probe.ctx.getImageData(0, 0, probe.canvas.width, probe.canvas.height).data, probe.canvas.width, probe.canvas.height);
    if (!box) {
      bitmap.close();
      throw new Error(`"${file.name}" looks empty. Choose the picture of your logo.`);
    }
    sx = Math.floor(box.x / k);
    sy = Math.floor(box.y / k);
    sw = Math.min(bitmap.width, Math.ceil((box.x + box.width) / k)) - sx;
    sh = Math.min(bitmap.height, Math.ceil((box.y + box.height) / k)) - sy;
  }

  const scale = logo ? Math.min(1, LOGO_MAX.width / sw, LOGO_MAX.height / sh) : Math.min(1, MAX_EDGE / Math.max(sw, sh));
  const width = Math.max(1, Math.round(sw * scale));
  const height = Math.max(1, Math.round(sh * scale));
  const { canvas, ctx } = canvas2d(width, height);
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, width, height);
  bitmap.close();

  let blob = await toBlob(canvas, "image/webp", logo ? 0.9 : 0.82);
  // Without WebP: PNG keeps a logo's see-through background, and photos are smaller as JPEG.
  if (!blob || blob.type !== "image/webp") blob = logo ? await toBlob(canvas, "image/png", 1) : await toBlob(canvas, "image/jpeg", 0.85);
  if (!blob) throw new Error(`"${file.name}" could not be converted.`);

  const dataUrl = await readAsDataUrl(blob);
  return { base64: dataUrl.slice(dataUrl.indexOf(",") + 1), dataUrl, name: file.name, width, height, bytes: blob.size };
}

/** "Garia terrace (2).jpg" → "gariaTerrace2", not already used in the library. */
export function photoKeyFor(fileName: string, content: SiteContent): string {
  const words = fileName
    .replace(/\.[^.]*$/, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  let base = words.map((w, i) => (i === 0 ? w.toLowerCase() : w[0]!.toUpperCase() + w.slice(1).toLowerCase())).join("") || "photo";
  if (/^\d/.test(base)) base = `photo${base}`;
  base = base.slice(0, 32);
  let key = base;
  for (let i = 2; key in content.photos; i++) key = `${base}${i}`;
  return key;
}

/** Where each photo is used, for the library ("Used on: Home page, Gallery: Margherita"). */
export function photoUsage(content: SiteContent): Record<string, string[]> {
  const usage: Record<string, string[]> = {};
  const add = (key: string, where: string) => (usage[key] ??= []).push(where);
  const c = content.copy;
  add(c.home.hero.video.wide.poster, "Home page video (computers)");
  add(c.home.hero.video.tall.poster, "Home page video (phones)");
  add(c.servicesPage.hero.photo, "Menu page");
  add(c.projectsPage.hero.photo, "Gallery page");
  add(c.aboutPage.hero.photo, "About page");
  c.aboutPage.storyPhotos.forEach((k) => add(k, "About page"));
  add(c.contactPage.hero.photo, "Contact page");
  add(c.areaPage.fallbackPhoto, "Delivery area pages");
  for (const a of content.areaPages) add(a.photo, `Delivery: ${a.name}`);
  add(content.pageSeo.shareImage, "Link previews");
  if (content.business.logo?.image) add(content.business.logo.image, "Logo");
  if (content.business.logo?.imageDark) add(content.business.logo.imageDark, "Logo (dark backgrounds)");
  if (content.business.logo?.icon) add(content.business.logo.icon, "Browser tab icon");
  for (const s of content.services) {
    add(s.heroPhoto, s.shortName || s.name);
    s.gallery.forEach((k) => add(k, s.shortName || s.name));
  }
  for (const p of content.projects) add(p.photo, `Gallery: ${p.title}`);
  for (const k of Object.keys(usage)) usage[k] = [...new Set(usage[k])];
  return usage;
}
