// Live preview: the real site in an iframe, showing the draft instead of the published content
// (see src/preview.tsx). Desktop is drawn at 1280px wide and scaled to fit; phone at 390px.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ExternalLink, Monitor, RotateCw, Smartphone } from "lucide-react";
import { PREVIEW_WINDOW } from "@/lib/preview-flag";
import type { FromPreview, ToPreview } from "@/preview";
import { cn } from "@/lib/utils";
import { useEditor } from "./store";

const DESKTOP = 1280;
const PHONE = 390;

export function PreviewPane({ target, className }: { target: string; className?: string }) {
  const { state } = useEditor();
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [path, setPath] = useState(target);
  // On a phone the preview opens full screen, where the phone view is the readable one.
  const [device, setDevice] = useState<"desktop" | "phone">(() => (window.innerWidth < 768 ? "phone" : "desktop"));
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [src] = useState(target);
  const draftRef = useRef({ content: state.draft, images: state.images });
  draftRef.current = { content: state.draft, images: state.images };

  const post = (msg: ToPreview) => frame.current?.contentWindow?.postMessage(msg, window.location.origin);

  useEffect(() => {
    const onMessage = (e: MessageEvent<FromPreview>) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return;
      if (e.data?.type === "hungru:ready") {
        setReady(true);
        post({ type: "hungru:draft", ...draftRef.current });
      } else if (e.data?.type === "hungru:path") setPath(e.data.path);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Send the draft a moment after typing stops.
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => post({ type: "hungru:draft", content: state.draft, images: state.images }), 180);
    return () => clearTimeout(t);
  }, [state.draft, state.images, ready]);

  useEffect(() => {
    if (ready) post({ type: "hungru:navigate", path: target });
  }, [target, ready]);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize({ w: entry!.contentRect.width, h: entry!.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const width = device === "desktop" ? DESKTOP : PHONE;
  const pad = device === "phone" ? 24 : 0;
  const scale = size.w ? Math.min(1, (size.w - pad * 2) / width) : 1;
  const height = size.h ? (size.h - pad * 2) / scale : 800;

  return (
    <div className={cn("flex min-h-0 flex-col bg-ash-200", className)}>
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-ash-300 bg-sheet px-3">
        <div className="flex border-[1.5px] border-ash-300" role="group" aria-label="Preview size">
          {(
            [
              ["desktop", Monitor, "Desktop"],
              ["phone", Smartphone, "Phone"],
            ] as const
          ).map(([d, Icon, label]) => (
            <button
              key={d}
              type="button"
              aria-pressed={device === d}
              title={label}
              onClick={() => setDevice(d)}
              className={cn("grid h-8 w-9 place-items-center", device === d ? "bg-ink text-white" : "text-ash-600 hover:text-ink")}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="sr-only">{label}</span>
            </button>
          ))}
        </div>
        <p className="min-w-0 flex-1 truncate border-[1.5px] border-ash-200 bg-white px-2.5 py-1 font-mono text-xs text-ash-700" title={path}>
          {path}
        </p>
        <button
          type="button"
          title="Reload preview"
          onClick={() => {
            setReady(false);
            frame.current?.contentWindow?.location.reload();
          }}
          className="grid size-8 place-items-center text-ash-600 hover:bg-ash-100 hover:text-ink"
        >
          <RotateCw className="size-4" aria-hidden="true" />
          <span className="sr-only">Reload preview</span>
        </button>
        <a href={path} target="_blank" rel="noopener" title="Open the published page in a new tab" className="grid size-8 place-items-center text-ash-600 hover:bg-ash-100 hover:text-ink">
          <ExternalLink className="size-4" aria-hidden="true" />
          <span className="sr-only">Open the published page</span>
        </a>
      </div>
      <div ref={box} className="relative min-h-0 flex-1 overflow-hidden">
        <div
          className={cn("absolute top-0 left-1/2 origin-top bg-white", device === "phone" && "shadow-[0_20px_50px_-20px_rgb(22_21_20/0.5)] ring-8 ring-ink")}
          style={{ width, height, top: pad, transform: `translateX(-50%) scale(${scale})` }}
        >
          <iframe ref={frame} name={PREVIEW_WINDOW} src={src} title="Live preview of the site" className="block size-full border-0" />
          {!ready && <div className="absolute inset-0 grid place-items-center bg-white/70 text-sm font-semibold text-ash-600">Loading preview…</div>}
        </div>
      </div>
    </div>
  );
}
