// The logo fields: upload a logo, see it on the light header and the dark footer, or go
// back to the built-in mark; and the browser-tab icon made from it. Uploads are trimmed and
// sized in src/admin/images.ts; the site fits them into the header and footer in
// src/components/common/Logo.tsx, and the build makes the icons (scripts/prerender.mjs).
import { useState } from "react";
import { Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SliceMark } from "@/components/common/icons";
import { isLocal, unsplashUrl } from "@/lib/photo-url";
import { cn } from "@/lib/utils";
import { useEditor } from "../store";
import { FieldShell } from "./controls";
import { PhotoPicker, UploadButton } from "./photo";

function useLogoSrc(key: string): string {
  const { state } = useEditor();
  const photo = key ? state.draft.photos[key] : undefined;
  if (!photo) return "";
  return state.images[photo.src] ?? (isLocal(photo.src) ? photo.src : unsplashUrl(photo.src, 480));
}

/** The logo on one of the backgrounds the site shows it on. */
function Sample({ src, label, dark = false, plate = false, name }: { src: string; label: string; dark?: boolean; plate?: boolean; name: string }) {
  const img = <img src={src} alt="" className="block h-10 w-auto max-w-full min-w-0 object-contain object-left" />;
  return (
    <figure className="flex min-w-0 flex-col gap-1.5">
      <div className={cn("flex h-20 min-w-0 items-center px-4", dark ? "bg-maroon-950" : "border border-ash-200 bg-ground")}>
        {!src ? (
          <span className="flex items-center gap-2.5">
            <span className="round-panel grid size-9 shrink-0 place-items-center bg-maroon-500 text-white [--cut:8px]">
              <SliceMark className="h-5 w-7" />
            </span>
            <span className={cn("font-display text-[1.25rem] leading-none font-[800] uppercase [font-stretch:84%]", dark ? "text-white" : "text-ink")}>{name}</span>
          </span>
        ) : plate ? (
          <span className="round-panel flex min-w-0 max-w-full bg-white px-3 py-2 [--cut:9px]">{img}</span>
        ) : (
          img
        )}
      </div>
      <figcaption className="label text-[0.6rem] text-ash-600">{label}</figcaption>
    </figure>
  );
}

/** The browser-tab icon as the build makes it: the whole picture, as large as fits in a square. */
function IconSample({ src, name, caption }: { src: string; name: string; caption: string }) {
  const icon = (className: string) => <img src={src || "/favicon.svg"} alt="" className={cn("shrink-0 object-contain", className)} />;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <figure className="flex min-w-0 flex-col gap-1.5">
          <div className="flex h-20 items-end bg-ash-200 px-3">
            <div className="flex h-10 w-full max-w-64 min-w-0 items-center gap-2 rounded-t-lg bg-white px-3 text-xs text-ink">
              {icon("size-4")}
              <span className="truncate">{name}</span>
            </div>
          </div>
          <figcaption className="label text-[0.6rem] text-ash-600">Browser tab</figcaption>
        </figure>
        <figure className="flex flex-col gap-1.5">
          <div className="grid h-20 place-items-center bg-maroon-950 px-6">
            <span className="grid size-14 place-items-center overflow-hidden rounded-[0.9rem] bg-white p-1.5">{icon("size-full")}</span>
          </div>
          <figcaption className="label text-[0.6rem] text-ash-600">Phone home screen</figcaption>
        </figure>
      </div>
      <p className="text-xs text-ash-600">{caption}</p>
    </div>
  );
}

const LABELS = {
  main: { upload: "Upload logo", again: "Upload a new logo", remove: "Use the built-in mark" },
  dark: { upload: "Upload light version", again: "Upload a new light version", remove: "Remove" },
  icon: { upload: "Upload square icon", again: "Upload a new icon", remove: "Make it from the logo" },
};

export function LogoControl({
  label,
  hint,
  value,
  onChange,
  variant = "main",
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (key: string) => void;
  variant?: "main" | "dark" | "icon";
}) {
  const { state } = useEditor();
  const [open, setOpen] = useState(false);
  const logo = state.draft.business.logo;
  const name = state.draft.business.name;
  const photo = value ? state.draft.photos[value] : undefined;
  const src = useLogoSrc(value);
  const mainSrc = useLogoSrc(logo?.image ?? "");
  const lightSrc = useLogoSrc(logo?.imageDark ?? "");
  const dark = variant === "dark";
  const labels = LABELS[variant];
  // The picture the browser-tab icon is made from, to warn when it is too wide to read there.
  const iconPhoto = variant === "icon" ? state.draft.photos[value || logo?.image || ""] : undefined;
  const iconTooWide = !!iconPhoto?.width && !!iconPhoto.height && iconPhoto.width / iconPhoto.height >= 2;

  return (
    <FieldShell label={label} hint={hint}>
      <div className="flex flex-col gap-3 border-[1.5px] border-ash-200 bg-white p-3">
        {variant === "icon" ? (
          <IconSample
            src={src || mainSrc}
            name={name}
            caption={
              iconTooWide
                ? `${value ? "This icon" : "Your logo"} is wide, so it is tiny in a browser tab. For a clear icon, upload a square one: just the symbol or the initials.`
                : value
                  ? "Your own icon."
                  : mainSrc
                    ? "Made from your logo automatically."
                    : "The built-in icon. Once you add a logo, the icon is made from it."
            }
          />
        ) : dark ? (
          <Sample src={src || mainSrc} plate={!src && !!mainSrc} dark name={name} label={src ? "Footer" : mainSrc ? "Footer now: your logo on a white panel" : "Footer now: built-in mark"} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <Sample src={src} name={name} label={src ? "Header" : "Now: built-in mark"} />
            <Sample src={lightSrc || src} plate={!!src && !lightSrc} dark name={name} label={src && !lightSrc ? "Footer (on a white panel)" : "Footer"} />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <UploadButton multiple={false} logo variant={value ? "outline" : "default"} label={value ? labels.again : labels.upload} onUploaded={(keys) => keys[0] && onChange(keys[0])} />
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
            <Images /> Choose from library
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
              {variant === "icon" && !logo?.image ? "Remove" : labels.remove}
            </Button>
          )}
        </div>
        {value && (
          <p className="text-xs text-ash-600">
            {photo ? (
              <>
                <span className="font-mono">{value}</span>
                {photo.width && photo.height ? ` · ${photo.width} × ${photo.height} px` : ""}
              </>
            ) : (
              `"${value}" is no longer in the photo library. Upload the logo again.`
            )}
          </p>
        )}
      </div>
      <PhotoPicker open={open} onOpenChange={setOpen} current={value} onPick={onChange} logo />
    </FieldShell>
  );
}
