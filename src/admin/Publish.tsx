// Publishing: a summary of what changed, the checks that must pass, and the commit to GitHub
// (or the save to disk, locally). After publishing, it watches /build.json until the new
// version is live.
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, CircleAlert, Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { SiteContent } from "@/data/types";
import type { Problem } from "@/lib/content-check";
import { api, ApiError, liveCommit } from "./api";
import { getAt } from "./path";
import { sectionPaths, sections, type Section } from "./schema";
import { clearSavedDraft, useEditor } from "./store";

export type PublishPhase = { kind: "idle" } | { kind: "building"; commit: string; since: number } | { kind: "live" } | { kind: "slow" } | { kind: "saved" };

/** Sections whose content differs from the published version. */
export function changedSections(draft: SiteContent, original: SiteContent): Section[] {
  if (draft === original) return [];
  return sections.filter((s) => sectionPaths(s).some((p) => JSON.stringify(getAt(draft, p)) !== JSON.stringify(getAt(original, p))));
}

export function PublishDialog({
  open,
  onOpenChange,
  problems,
  mode,
  onPublished,
  onGoTo,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  problems: Problem[];
  mode: "github" | "local";
  onPublished: (phase: PublishPhase) => void;
  onGoTo: (sectionId: string) => void;
}) {
  const { state, dispatch } = useEditor();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ text: string; conflict: boolean } | null>(null);
  const changed = changedSections(state.draft, state.original);
  const errors = problems.filter((p) => p.level === "error");
  const warnings = problems.filter((p) => p.level === "warning");

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  const publish = async (overwrite = false) => {
    setBusy(true);
    setError(null);
    try {
      // Overwrite: publish on top of whatever is there now.
      const version = overwrite ? (await api.content()).version : state.version;
      const res = await api.publish({ content: state.draft, version, uploads: state.uploads, message });
      clearSavedDraft();
      dispatch({ type: "published", version: res.version });
      setMessage("");
      onOpenChange(false);
      onPublished(mode === "local" ? { kind: "saved" } : { kind: "building", commit: res.commit, since: Date.now() });
    } catch (e) {
      const conflict = e instanceof ApiError && e.status === 409;
      setError({ text: e instanceof Error ? e.message : "Publishing failed.", conflict });
    } finally {
      setBusy(false);
    }
  };

  const loadLatest = async () => {
    setBusy(true);
    try {
      const { content, version } = await api.content();
      dispatch({ type: "reload", content, version });
      onOpenChange(false);
    } catch (e) {
      setError({ text: e instanceof Error ? e.message : "Could not load the latest version.", conflict: false });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent className="flex max-h-[90svh] w-[calc(100%-1.5rem)] max-w-xl flex-col gap-0 overflow-y-auto rounded-none border-0 bg-sheet p-0 sm:max-w-xl">
        <div className="border-b border-ash-200 p-6 pr-14">
          <DialogTitle className="text-[2.1rem]">Publish changes</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-ash-600">
            {mode === "github" ? "Your changes go live on the website about a minute after you publish." : "Saves your changes to src/data/content.json on this computer."}
          </DialogDescription>
        </div>

        <div className="flex flex-col gap-6 p-6">
          <div>
            <h3 className="label text-ash-600">What changed</h3>
            {changed.length || state.uploads.length ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {changed.map((s) => (
                  <li key={s.id} className="inline-flex items-center gap-1.5 border-[1.5px] border-ash-300 bg-white px-2.5 py-1 text-sm font-semibold text-ink">
                    <s.icon className="size-4 text-maroon-600" aria-hidden="true" />
                    {s.title}
                  </li>
                ))}
                {state.uploads.length > 0 && !changed.some((s) => s.id === "photos") && (
                  <li className="inline-flex items-center gap-1.5 border-[1.5px] border-ash-300 bg-white px-2.5 py-1 text-sm font-semibold text-ink">
                    {state.uploads.length} new photos
                  </li>
                )}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-ash-600">Nothing has changed since the last publish.</p>
            )}
          </div>

          {errors.length > 0 && (
            <div className="border-l-[3px] border-destructive bg-[#fff6f5] p-4">
              <p className="flex items-center gap-2 font-semibold text-destructive">
                <CircleAlert className="size-5" aria-hidden="true" /> Fix {errors.length === 1 ? "this" : `these ${errors.length} things`} first
              </p>
              <ul className="mt-2 flex flex-col gap-1.5 text-sm text-ash-800">
                {errors.slice(0, 8).map((p, i) => (
                  <li key={i}>
                    <button type="button" className="text-left underline-offset-4 hover:underline" onClick={() => (onOpenChange(false), onGoTo(p.section))}>
                      {p.message}
                    </button>
                  </li>
                ))}
                {errors.length > 8 && <li>…and {errors.length - 8} more.</li>}
              </ul>
            </div>
          )}

          {warnings.length > 0 && (
            <details className="border-l-[3px] border-cheese-400 bg-white p-4 text-sm">
              <summary className="flex cursor-pointer items-center gap-2 font-semibold text-ink">
                <AlertTriangle className="size-4 text-maroon-600" aria-hidden="true" /> {warnings.length} suggestion{warnings.length > 1 ? "s" : ""} (you can still publish)
              </summary>
              <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-ash-700">
                {warnings.map((p, i) => (
                  <li key={i}>{p.message}</li>
                ))}
              </ul>
            </details>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="publish-message" className="field-label">
              Note for the history <span className="font-normal text-ash-600">(optional)</span>
            </label>
            <Input id="publish-message" value={message} maxLength={120} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. New polycarbonate rates" className="h-11 bg-white text-[0.95rem]" />
          </div>

          {error && (
            <div role="alert" className="border-l-[3px] border-destructive bg-[#fff6f5] p-4 text-sm text-ash-800">
              <p className="font-semibold text-destructive">{error.text}</p>
              {error.conflict && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => publish(true)}>
                    Publish mine anyway
                  </Button>
                  <Button type="button" size="sm" variant="outline" disabled={busy} onClick={loadLatest}>
                    Discard mine, load latest
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-ash-200 bg-sheet p-4">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button type="button" onClick={() => publish()} disabled={busy || errors.length > 0 || (changed.length === 0 && state.uploads.length === 0)}>
            {busy ? <Loader2 className="animate-spin" /> : <UploadCloud />}
            {busy ? "Publishing…" : "Publish now"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Small status next to the Publish button. Polls the live site while a new version builds. */
export function PublishStatus({ phase, setPhase, dirty }: { phase: PublishPhase; setPhase: (p: PublishPhase) => void; dirty: boolean }) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (phase.kind !== "building") return;
    let stopped = false;
    const check = async () => {
      if (stopped) return;
      if ((await liveCommit()) === phase.commit) return setPhase({ kind: "live" });
      if (Date.now() - phase.since > 5 * 60 * 1000) return setPhase({ kind: "slow" });
      timer.current = setTimeout(check, 6000);
    };
    timer.current = setTimeout(check, 15000);
    return () => {
      stopped = true;
      clearTimeout(timer.current);
    };
  }, [phase, setPhase]);

  const chip = "hidden items-center gap-1.5 text-sm font-semibold md:flex";
  if (phase.kind === "building")
    return (
      <span className={`${chip} text-ash-700`} title="Vercel is rebuilding the site with your changes.">
        <Loader2 className="size-4 animate-spin text-maroon-600" aria-hidden="true" /> Going live…
      </span>
    );
  if (phase.kind === "slow")
    return (
      <span className={`${chip} text-maroon-700`} title="Check the deployment in Vercel. If the build failed, the previous version stays live.">
        <AlertTriangle className="size-4" aria-hidden="true" /> Still building. Check Vercel
      </span>
    );
  if (dirty) return <span className={`${chip} text-ash-600`}>Unpublished changes</span>;
  if (phase.kind === "live" || phase.kind === "saved")
    return (
      <span className={`${chip} text-ink`}>
        <CheckCircle2 className="size-4 text-whatsapp-600" aria-hidden="true" /> {phase.kind === "live" ? "Live on the site" : "Saved"}
      </span>
    );
  return <span className={`${chip} text-ash-500`}>All changes published</span>;
}
