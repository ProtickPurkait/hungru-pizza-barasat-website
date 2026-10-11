import type { CSSProperties } from "react";
import { photoSources } from "@/lib/photo";
import { cn } from "@/lib/utils";

interface SitePhotoProps {
  /** Key from `photos` in src/data/site.ts */
  photo: string;
  /** Width / height, e.g. 4 / 3. The image is cropped to this ratio. */
  ratio?: number;
  /** Optional different crop from 1024px up, e.g. a tall 4 / 5 beside a hero headline. */
  lgRatio?: number;
  /** The `sizes` attribute, so phones download small files. */
  sizes?: string;
  /** Above-the-fold image: load eagerly instead of lazily. */
  priority?: boolean;
  maxWidth?: number;
  className?: string;
  imgClassName?: string;
  alt?: string;
  /** Show the whole photo inside the frame instead of cropping it (certificates, documents). */
  contain?: boolean;
}

/**
 * Every photo on the site goes through this component.
 *
 * TODO: Replace the Unsplash sample photos with real Hungru Pizza food and café photos
 * (the kids' pizzas are already Hungru's own). Upload them in the admin (Photos), or add
 * files to public/images/uploads/ and point the matching key in `photos`
 * (src/data/content.json) at "/images/uploads/your-file.webp". No component changes needed.
 */
export function SitePhoto({
  photo,
  ratio = 4 / 3,
  lgRatio,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, calc(100vw - 2rem)",
  priority = false,
  maxWidth,
  className,
  imgClassName,
  alt,
  contain = false,
}: SitePhotoProps) {
  // Above-the-fold photos use a lighter quality setting: they compete with text and fonts for the first paint.
  const quality = priority ? 45 : undefined;
  const source = photoSources(photo, contain ? undefined : ratio, maxWidth, quality);
  const lg = lgRatio ? photoSources(photo, lgRatio, maxWidth, quality) : undefined;
  const width = 1080;
  const height = Math.round(width / ratio);

  const img = (
    <img
      src={source.src}
      srcSet={source.srcSet}
      sizes={source.srcSet ? sizes : undefined}
      alt={alt ?? source.alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("absolute inset-0 size-full", contain ? "object-contain" : "object-cover", imgClassName)}
    />
  );

  return (
    <div
      className={cn("relative overflow-hidden bg-ash-200", lgRatio ? "aspect-(--ar) lg:aspect-(--ar-lg)" : "aspect-(--ar)", className)}
      style={{ "--ar": String(ratio), "--ar-lg": lgRatio ? String(lgRatio) : undefined } as CSSProperties}
    >
      {lg?.srcSet ? (
        <picture>
          <source media="(min-width: 1024px)" srcSet={lg.srcSet} sizes={sizes} />
          {img}
        </picture>
      ) : (
        img
      )}
    </div>
  );
}
