// The photo library: every photo the site can use, with its description and where it appears.
import { useMemo, useRef, useState } from "react";
import { RefreshCw, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Photo } from "@/data/types";
import { api } from "./api";
import { TextControl } from "./fields/controls";
import { PhotoThumb, UploadButton } from "./fields/photo";
import { photoUsage, prepareImage } from "./images";
import { useEditor } from "./store";
import { useUi } from "./ui";

function ReplaceButton({ photoKey }: { photoKey: string }) {
  const { state, dispatch } = useEditor();
  const logo = photoKey === state.draft.business.logo?.image || photoKey === state.draft.business.logo?.imageDark;
  const { toast } = useUi();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        tabIndex={-1}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          try {
            const img = await prepareImage(file, { logo });
            const upload = await api.upload(img.name, img.base64);
            dispatch({ type: "uploaded", upload, dataUrl: img.dataUrl });
            const current = state.draft.photos[photoKey]!;
            dispatch({ type: "edit", path: ["photos", photoKey], value: { ...current, src: upload.path, width: img.width, height: img.height } });
            toast("Photo replaced everywhere it is used. Check the description still fits.", { tone: "success" });
          } catch (err) {
            toast(err instanceof Error ? err.message : "Could not upload the photo.", { tone: "error" });
          } finally {
            setBusy(false);
          }
        }}
      />
      <Button type="button" variant="outline" size="sm" className="h-9 px-3" disabled={busy} onClick={() => input.current?.click()}>
        <RefreshCw className={busy ? "animate-spin" : undefined} /> {busy ? "Uploading…" : "Replace"}
      </Button>
    </>
  );
}

export function PhotoLibrary() {
  const { state, dispatch } = useEditor();
  const { toast } = useUi();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "missing" | "unused" | "samples">("all");
  const photos = state.draft.photos;
  const usage = useMemo(() => photoUsage(state.draft), [state.draft]);

  const entries = Object.entries(photos).filter(([key, p]) => {
    const q = query.trim().toLowerCase();
    if (q && !key.toLowerCase().includes(q) && !p.alt.toLowerCase().includes(q)) return false;
    if (filter === "missing") return p.alt.trim() === "";
    if (filter === "unused") return !usage[key]?.length;
    if (filter === "samples") return !p.src.startsWith("/");
    return true;
  });
  const samples = Object.values(photos).filter((p) => !p.src.startsWith("/")).length;

  const setPhoto = (key: string, next: Photo) => dispatch({ type: "edit", path: ["photos", key], value: next });

  const remove = (key: string) => {
    const { [key]: _removed, ...rest } = photos;
    dispatch({ type: "edit", path: ["photos"], value: rest });
    toast(`Removed "${key}" from the library.`, { action: { label: "Undo", run: () => dispatch({ type: "undo" }) } });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3 border-[1.5px] border-ash-200 bg-sheet p-3">
        <UploadButton variant="default" />
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ash-500" aria-hidden="true" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or description" aria-label="Search photos" className="h-11 bg-white pl-9 text-sm" />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Show">
          {(
            [
              ["all", `All ${Object.keys(photos).length}`],
              ["samples", `Sample photos ${samples}`],
              ["missing", "No description"],
              ["unused", "Not used"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
              className={`min-h-9 border-[1.5px] px-3 text-sm font-semibold ${filter === id ? "border-ink bg-ink text-white" : "border-ash-300 bg-white text-ash-700 hover:border-ink"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {samples > 0 && (
        <p className="border-l-[3px] border-maroon-500 bg-sheet px-4 py-3 text-sm text-ash-700">
          {samples} photos are still samples from Unsplash. Use <strong>Replace</strong> to swap each one for a real photo of your work: it changes everywhere that photo is used.
        </p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2">
        {entries.map(([key, p]) => {
          const used = usage[key] ?? [];
          return (
            <li key={key} className="flex flex-col border-[1.5px] border-ash-200 bg-sheet">
              <div className="relative">
                <PhotoThumb photoKey={key} ratio={16 / 10} />
                <span className="label absolute top-2 left-2 bg-white/90 px-1.5 py-1 text-[0.6rem] text-ash-700">{p.src.startsWith("/") ? "Your photo" : "Sample"}</span>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-mono text-xs font-semibold text-ink">{key}</p>
                  <span className="flex shrink-0 gap-1.5">
                    <ReplaceButton photoKey={key} />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 px-2.5 hover:border-destructive hover:bg-destructive"
                      disabled={used.length > 0}
                      title={used.length ? "Used on the site. Choose another photo there first." : "Remove from the library"}
                      onClick={() => remove(key)}
                    >
                      <Trash2 />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </span>
                </div>
                <TextControl
                  label="Description"
                  hint="What the photo shows, in a few words. Read aloud to blind visitors and used by Google."
                  value={p.alt}
                  required
                  multiline
                  rows={2}
                  onChange={(alt) => setPhoto(key, { ...p, alt })}
                />
                <p className="text-xs text-ash-600">{used.length ? <>Used on: {used.join(", ")}</> : "Not used on any page yet."}</p>
              </div>
            </li>
          );
        })}
      </ul>
      {entries.length === 0 && <p className="py-10 text-center text-ash-600">No photos match.</p>}
    </div>
  );
}
