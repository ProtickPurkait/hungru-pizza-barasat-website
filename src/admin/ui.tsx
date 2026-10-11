// Editor-wide helpers: short notices ("Removed. Undo"), which page the preview shows,
// and uploading photos into the library.
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { api } from "./api";
import { photoKeyFor, prepareImage } from "./images";
import { useEditor } from "./store";

interface Toast {
  id: number;
  message: string;
  tone: "info" | "error" | "success";
  action?: { label: string; run: () => void };
}

interface UiContextValue {
  toast: (message: string, options?: { tone?: Toast["tone"]; action?: Toast["action"] }) => void;
  /** A page for the preview to show while an item is open (null = the section's own page). */
  previewOverride: string | null;
  setPreviewOverride: (path: string | null) => void;
  /** Uploads photos into the library. Returns the new photo keys. A logo is trimmed and sized for the header. */
  uploadPhotos: (files: File[], options?: { logo?: boolean }) => Promise<string[]>;
  uploading: number;
}

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const { state, dispatch } = useEditor();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [previewOverride, setPreviewOverride] = useState<string | null>(null);
  const [uploading, setUploading] = useState(0);
  const nextId = useRef(1);
  const draftRef = useRef(state.draft);
  draftRef.current = state.draft;

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback<UiContextValue["toast"]>(
    (message, options = {}) => {
      const id = nextId.current++;
      setToasts((t) => [...t.slice(-2), { id, message, tone: options.tone ?? "info", action: options.action }]);
      setTimeout(() => dismiss(id), options.tone === "error" ? 9000 : 5500);
    },
    [dismiss],
  );

  const uploadPhotos = useCallback(
    async (files: File[], { logo = false }: { logo?: boolean } = {}) => {
      const keys: string[] = [];
      setUploading((n) => n + files.length);
      for (const file of files) {
        try {
          const img = await prepareImage(file, { logo });
          const upload = await api.upload(img.name, img.base64);
          dispatch({ type: "uploaded", upload, dataUrl: img.dataUrl });
          const key = photoKeyFor(file.name, draftRef.current);
          const alt = logo ? `${draftRef.current.business.name} logo` : "";
          const photos = { ...draftRef.current.photos, [key]: { src: upload.path, alt, width: img.width, height: img.height } };
          dispatch({ type: "edit", path: ["photos"], value: photos });
          draftRef.current = { ...draftRef.current, photos };
          keys.push(key);
        } catch (err) {
          toast(err instanceof Error ? err.message : `Could not upload "${file.name}".`, { tone: "error" });
        } finally {
          setUploading((n) => n - 1);
        }
      }
      if (keys.length && logo) toast("Logo uploaded. Empty space around it was cut off, and it is sized to fit automatically.", { tone: "success" });
      else if (keys.length) toast(keys.length === 1 ? "Photo uploaded. Add a short description of it." : `${keys.length} photos uploaded. Add a short description to each.`, { tone: "success" });
      return keys;
    },
    [dispatch, toast],
  );

  const value = useMemo(() => ({ toast, previewOverride, setPreviewOverride, uploadPhotos, uploading }), [toast, previewOverride, uploadPhotos, uploading]);

  return (
    <UiContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex max-w-lg items-center gap-4 px-4 py-3 text-sm shadow-[0_14px_34px_-10px_rgb(22_21_20/0.5)] animate-in fade-in slide-in-from-bottom-2 ${
              t.tone === "error" ? "bg-[#7a1c12] text-white" : "bg-ink text-white"
            }`}
          >
            <span className={t.tone === "success" ? "border-l-2 border-whatsapp pl-3" : undefined}>{t.message}</span>
            {t.action && (
              <button
                type="button"
                className="shrink-0 font-semibold text-cheese-300 underline underline-offset-4 hover:text-white"
                onClick={() => {
                  t.action!.run();
                  dismiss(t.id);
                }}
              >
                {t.action.label}
              </button>
            )}
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Close" className="shrink-0 text-ash-400 hover:text-white">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </UiContext.Provider>
  );
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi outside UiProvider");
  return ctx;
}
