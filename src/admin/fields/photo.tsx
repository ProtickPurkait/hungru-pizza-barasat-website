// Choosing photos from the library (or uploading a new one) for a photo field.
import { useMemo, useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { thumbUrl } from "@/lib/photo-url";
import { cn } from "@/lib/utils";
import { useEditor } from "../store";
import { useUi } from "../ui";
import { FieldShell } from "./controls";

/** Thumbnail of a library photo, including ones uploaded but not yet published. */
export function PhotoThumb({ photoKey, className, ratio = 4 / 3, contain = false }: { photoKey: string; className?: string; ratio?: number; contain?: boolean }) {
  const { state } = useEditor();
  const photo = state.draft.photos[photoKey];
  const src = photo ? (state.images[photo.src] ?? thumbUrl(photo.src, 360, contain ? null : ratio)) : "";
  return (
    <span className={cn("relative block overflow-hidden bg-ash-200", className)} style={{ aspectRatio: String(ratio) }}>
      {src ? (
        <img src={src} alt="" loading="lazy" className={cn("absolute inset-0 size-full", contain ? "object-contain p-2" : "object-cover")} />
      ) : (
        <span className="absolute inset-0 grid place-items-center p-2 text-center text-xs text-ash-600">Missing photo</span>
      )}
    </span>
  );
}

export function UploadButton({
  onUploaded,
  label = "Upload photos",
  multiple = true,
  variant = "outline",
  logo = false,
}: {
  onUploaded?: (keys: string[]) => void;
  label?: string;
  multiple?: boolean;
  variant?: "outline" | "default";
  /** Trim and size the picture as a logo. */
  logo?: boolean;
}) {
  const { uploadPhotos, uploading } = useUi();
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/heic"
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        onChange={async (e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = "";
          if (!files.length) return;
          const keys = await uploadPhotos(files, { logo });
          onUploaded?.(keys);
        }}
      />
      <Button type="button" variant={variant} size="sm" onClick={() => input.current?.click()} disabled={uploading > 0}>
        {uploading > 0 ? <Loader2 className="animate-spin" /> : <ImagePlus />}
        {uploading > 0 ? `Uploading ${uploading}…` : label}
      </Button>
    </>
  );
}

export function PhotoPicker({
  open,
  onOpenChange,
  current,
  onPick,
  logo = false,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  current?: string;
  onPick: (key: string) => void;
  logo?: boolean;
}) {
  const { state } = useEditor();
  const [query, setQuery] = useState("");
  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return Object.entries(state.draft.photos).filter(([key, p]) => !q || key.toLowerCase().includes(q) || p.alt.toLowerCase().includes(q));
  }, [state.draft.photos, query]);

  const pick = (key: string) => {
    onPick(key);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88svh] w-[calc(100%-1.5rem)] max-w-4xl flex-col gap-0 rounded-none border-0 bg-ground p-0 sm:max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ash-200 bg-sheet p-5 pr-14">
          <div>
            <DialogTitle className="text-[1.9rem]">{logo ? "Choose the logo" : "Choose a photo"}</DialogTitle>
            <DialogDescription className="mt-1 text-sm text-ash-600">Pick one from the library, or upload a new one.</DialogDescription>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <div className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ash-500" aria-hidden="true" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" aria-label="Search photos" className="h-11 bg-white pl-9 text-sm" />
            </div>
            <UploadButton multiple={false} label="Upload" variant="default" logo={logo} onUploaded={(keys) => keys[0] && pick(keys[0])} />
          </div>
        </div>
        <ul className="thin-scroll grid grid-cols-2 gap-3 overflow-y-auto p-5 sm:grid-cols-3 lg:grid-cols-4">
          {entries.map(([key, p]) => (
            <li key={key}>
              <button
                type="button"
                onClick={() => pick(key)}
                className={cn("group block w-full text-left outline-offset-2", key === current && "outline-3 outline-maroon-500")}
                aria-label={`${p.alt || key}${key === current ? " (current)" : ""}`}
              >
                <PhotoThumb photoKey={key} contain={logo} className="transition-opacity group-hover:opacity-85" />
                <span className="mt-1.5 block truncate text-xs font-semibold text-ink">{key}</span>
                <span className="line-clamp-2 text-xs text-ash-600">{p.alt || "No description yet"}</span>
              </button>
            </li>
          ))}
          {entries.length === 0 && <li className="col-span-full py-10 text-center text-ash-600">No photos match.</li>}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

export function PhotoControl({ label, hint, value, onChange, optional = false }: { label: string; hint?: string; value: string; onChange: (key: string) => void; optional?: boolean }) {
  const { state } = useEditor();
  const [open, setOpen] = useState(false);
  const photo = state.draft.photos[value];
  return (
    <FieldShell label={label} hint={hint}>
      <div className="flex items-center gap-4 border-[1.5px] border-ash-200 bg-white p-2.5">
        <button type="button" onClick={() => setOpen(true)} className="w-32 shrink-0 sm:w-40" aria-label={`Change ${label.toLowerCase()}`}>
          <PhotoThumb photoKey={value} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{photo ? value : value ? `${value} (missing)` : "No photo chosen"}</p>
          <p className="line-clamp-2 text-xs text-ash-600">{photo?.alt || (photo ? "No description yet. Add one in the photo library." : "")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" className="h-9 px-3" onClick={() => setOpen(true)}>
              {value ? "Change photo" : "Choose photo"}
            </Button>
            {optional && value && (
              <Button type="button" variant="ghost" size="sm" className="h-9 px-3" onClick={() => onChange("")}>
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>
      <PhotoPicker open={open} onOpenChange={setOpen} current={value} onPick={onChange} />
    </FieldShell>
  );
}

/** An ordered list of photos, e.g. a service's gallery. */
export function PhotosControl({ label, hint, value, onChange, max }: { label: string; hint?: string; value: string[]; onChange: (keys: string[]) => void; max?: number }) {
  const [pickFor, setPickFor] = useState<number | null>(null);
  const list = value ?? [];
  const move = (i: number, d: number) => {
    const next = [...list];
    [next[i], next[i + d]] = [next[i + d]!, next[i]!];
    onChange(next);
  };
  return (
    <FieldShell label={label} hint={hint}>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {list.map((key, i) => (
          <li key={`${key}-${i}`} className="border-[1.5px] border-ash-200 bg-white p-1.5">
            <button type="button" className="block w-full" onClick={() => setPickFor(i)} aria-label={`Change photo ${i + 1}`}>
              <PhotoThumb photoKey={key} />
            </button>
            <div className="mt-1 flex items-center justify-between gap-1">
              <span className="truncate pl-1 text-xs text-ash-600">
                {i + 1}. {key}
              </span>
              <span className="flex shrink-0">
                <IconButton label="Move left" disabled={i === 0} onClick={() => move(i, -1)}>
                  <ChevronLeft />
                </IconButton>
                <IconButton label="Move right" disabled={i === list.length - 1} onClick={() => move(i, 1)}>
                  <ChevronRight />
                </IconButton>
                <IconButton label="Remove" onClick={() => onChange(list.filter((_, j) => j !== i))}>
                  <X />
                </IconButton>
              </span>
            </div>
          </li>
        ))}
        {(max === undefined || list.length < max) && (
          <li>
            <button
              type="button"
              onClick={() => setPickFor(list.length)}
              className="grid aspect-[4/3] w-full place-items-center border-[1.5px] border-dashed border-ash-400 bg-white text-sm font-semibold text-ash-700 hover:border-ink hover:text-ink"
            >
              <span className="flex items-center gap-1.5">
                <Plus className="size-4" /> Add photo
              </span>
            </button>
          </li>
        )}
      </ul>
      <PhotoPicker
        open={pickFor !== null}
        onOpenChange={(o) => !o && setPickFor(null)}
        current={pickFor !== null ? list[pickFor] : undefined}
        onPick={(key) => {
          const next = [...list];
          next[pickFor!] = key;
          onChange(next);
        }}
      />
    </FieldShell>
  );
}

export function IconButton({ label, onClick, disabled, children, className }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn("grid size-8 place-items-center text-ash-600 transition-colors hover:bg-ash-100 hover:text-ink disabled:pointer-events-none disabled:opacity-30 [&_svg]:size-4", className)}
    >
      {children}
    </button>
  );
}
