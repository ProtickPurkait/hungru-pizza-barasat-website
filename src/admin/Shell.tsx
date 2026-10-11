// The editor screen: sections on the left, the form in the middle, the live preview on the right.
import { useCallback, useEffect, useMemo, useState } from "react";
import { CircleAlert, Eye, LogOut, Menu, Redo2, Undo2, UploadCloud, X } from "lucide-react";
import { SliceMark } from "@/components/common/icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { checkContent, type Problem } from "@/lib/content-check";
import { cn } from "@/lib/utils";
import type { Session } from "./api";
import { FieldView } from "./fields/FieldView";
import { History } from "./History";
import { toPath } from "./path";
import { PhotoLibrary } from "./PhotoLibrary";
import { PreviewPane } from "./Preview";
import { changedSections, PublishDialog, PublishStatus, type PublishPhase } from "./Publish";
import { groups, previewPath, sectionById, sections, type Section } from "./schema";
import { isDirty, useEditor, type SavedDraft } from "./store";
import { useUi } from "./ui";

function readHash(): string {
  const id = window.location.hash.replace(/^#/, "");
  return sections.some((s) => s.id === id) ? id : sections[0]!.id;
}

function Brand({ mode }: { mode: Session["mode"] }) {
  return (
    <div className="flex items-center gap-3 px-5 py-5">
      <span className="round-panel grid size-10 shrink-0 place-items-center bg-maroon-500 text-white [--cut:9px]">
        <SliceMark className="h-[1.35rem] w-8" />
      </span>
      <span className="leading-none">
        <span className="block font-display text-[1.45rem] font-[800] text-white uppercase [font-stretch:84%]">Site editor</span>
        <span className="label mt-1 block text-[0.58rem] text-ash-400">{mode === "local" ? "This computer" : "Live website"}</span>
      </span>
    </div>
  );
}

function Nav({ current, onPick, changed, problems }: { current: string; onPick: (id: string) => void; changed: Set<string>; problems: Problem[] }) {
  return (
    <nav aria-label="Sections" className="flex flex-col gap-6 px-3 pb-8">
      {groups.map((g) => (
        <div key={g}>
          <p className="label px-2 pb-2 text-[0.62rem] text-ash-500">{g}</p>
          <ul className="flex flex-col">
            {sections
              .filter((s) => s.group === g)
              .map((s) => {
                const errors = problems.filter((p) => p.section === s.id && p.level === "error").length;
                const active = s.id === current;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => onPick(s.id)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-10 w-full items-center gap-3 px-2 text-left text-[0.92rem] transition-colors",
                        active ? "bg-white/10 font-semibold text-white shadow-[inset_3px_0_0_var(--color-maroon-500)]" : "text-ash-300 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <s.icon className={cn("size-4 shrink-0", active ? "text-cheese-400" : "text-ash-500")} aria-hidden="true" />
                      <span className="flex-1 truncate">{s.title}</span>
                      {errors > 0 && (
                        <span className="grid min-w-5 place-items-center bg-destructive px-1 text-[0.7rem] font-bold text-white" title={`${errors} to fix`}>
                          {errors}
                        </span>
                      )}
                      {errors === 0 && changed.has(s.id) && <span className="size-2 shrink-0 bg-cheese-400" title="Unpublished changes" />}
                    </button>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SectionView({ section, problems, mode }: { section: Section; problems: Problem[]; mode: Session["mode"] }) {
  const mine = problems.filter((p) => p.section === section.id);
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pt-8 pb-28 sm:px-8">
      <header>
        <p className="label text-maroon-600">{section.group}</p>
        <h1 className="mt-2 text-[2.6rem] text-ink sm:text-[3rem]">{section.title}</h1>
        {section.description && <p className="mt-3 max-w-[62ch] text-ash-600">{section.description}</p>}
      </header>
      {mine.length > 0 && (
        <ul className="flex flex-col gap-1.5 border-l-[3px] border-destructive bg-[#fff6f5] p-4 text-sm">
          {mine.map((p, i) => (
            <li key={i} className={cn("flex items-start gap-2", p.level === "warning" ? "text-ash-700" : "font-medium text-destructive")}>
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {p.message}
            </li>
          ))}
        </ul>
      )}
      {section.custom === "photos" && <PhotoLibrary />}
      {section.custom === "history" && <History mode={mode} />}
      {section.fields && (
        <div className="flex flex-col gap-6">
          {section.fields.map((f, i) => (
            <FieldView key={`${section.id}-${i}`} field={f} path={toPath(section.path)} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Shell({ session, staleDraft, onSignOut }: { session: Session; staleDraft: SavedDraft | null; onSignOut: () => void }) {
  const { state, dispatch } = useEditor();
  const { previewOverride, toast } = useUi();
  const [current, setCurrent] = useState(readHash);
  const [navOpen, setNavOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [phase, setPhase] = useState<PublishPhase>({ kind: "idle" });
  const [stale, setStale] = useState(staleDraft);
  const section = sectionById(current);
  const mode = session.mode ?? "local";

  // Checking takes a few milliseconds; do it once the typing pauses.
  const [problems, setProblems] = useState<Problem[]>(() => checkContent(state.draft));
  useEffect(() => {
    const t = setTimeout(() => setProblems(checkContent(state.draft)), 300);
    return () => clearTimeout(t);
  }, [state.draft]);

  const changed = useMemo(() => new Set(changedSections(state.draft, state.original).map((s) => s.id)), [state.draft, state.original]);
  const dirty = isDirty(state);
  const target = previewOverride ?? previewPath(section, state.draft);

  const pick = useCallback((id: string) => {
    setCurrent(id);
    setNavOpen(false);
    window.history.replaceState(null, "", `#${id}`);
    document.getElementById("editor-main")?.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const onHash = () => setCurrent(readHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Ctrl+Z / Ctrl+Shift+Z (or Ctrl+Y) undo and redo across the whole editor; Ctrl+S opens Publish.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === "z" && !e.shiftKey) dispatch({ type: "undo" });
      else if ((k === "z" && e.shiftKey) || k === "y") dispatch({ type: "redo" });
      else if (k === "s") setPublishOpen(true);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const onPublished = (p: PublishPhase) => {
    setPhase(p);
    toast(p.kind === "saved" ? "Saved to content.json." : "Published. The website updates in about a minute.", { tone: "success" });
  };

  const nav = <Nav current={current} onPick={pick} changed={changed} problems={problems} />;

  return (
    <div className="flex h-svh overflow-hidden bg-ground">
      <aside className="thin-scroll hidden w-64 shrink-0 overflow-y-auto bg-ink lg:block">
        <Brand mode={session.mode} />
        {nav}
      </aside>
      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="thin-scroll w-72 gap-0 overflow-y-auto border-0 bg-ink p-0 [&>button]:text-white">
          <SheetTitle className="sr-only">Sections</SheetTitle>
          <SheetDescription className="sr-only">Choose what to edit</SheetDescription>
          <Brand mode={session.mode} />
          {nav}
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-ash-200 bg-sheet px-2 sm:px-4">
          <Button type="button" variant="ghost" size="icon-sm" className="lg:hidden" onClick={() => setNavOpen(true)} aria-label="Sections">
            <Menu />
          </Button>
          <div className="flex items-center">
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => dispatch({ type: "undo" })} disabled={!state.past.length} aria-label="Undo" title="Undo (Ctrl+Z)">
              <Undo2 />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => dispatch({ type: "redo" })} disabled={!state.future.length} aria-label="Redo" title="Redo (Ctrl+Shift+Z)">
              <Redo2 />
            </Button>
          </div>
          <div className="flex-1" />
          <PublishStatus phase={phase} setPhase={setPhase} dirty={dirty} />
          {dirty && (
            <Button type="button" variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => dispatch({ type: "discard" })} title="Go back to the published version">
              Discard
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" className="xl:hidden" onClick={() => setPreviewOpen(true)}>
            <Eye /> <span className="max-sm:sr-only">Preview</span>
          </Button>
          <Button type="button" size="sm" onClick={() => setPublishOpen(true)} disabled={!dirty} title="Publish (Ctrl+S)">
            <UploadCloud /> Publish
          </Button>
          {!session.open && (
            <Button type="button" variant="ghost" size="icon-sm" onClick={onSignOut} aria-label="Sign out" title="Sign out">
              <LogOut />
            </Button>
          )}
        </header>

        {stale && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-cheese-300 bg-[#fff4ee] px-4 py-2.5 text-sm text-ink">
            <p className="flex-1">
              You have unpublished changes from {new Date(stale.savedAt).toLocaleString("en-IN")}, made before the site was last published. Restoring them replaces what is live now.
            </p>
            <Button type="button" size="sm" variant="outline" className="h-9" onClick={() => (dispatch({ type: "replace", content: stale.draft, uploads: stale.uploads }), setStale(null))}>
              Restore them
            </Button>
            <Button type="button" size="sm" variant="ghost" className="h-9" onClick={() => setStale(null)}>
              Discard
            </Button>
          </div>
        )}

        <div className="flex min-h-0 flex-1">
          <main id="editor-main" className="thin-scroll min-w-0 flex-1 overflow-y-auto">
            <SectionView section={section} problems={problems} mode={session.mode} />
          </main>
          <PreviewPane
            target={target}
            className={cn(
              "border-l border-ash-300",
              previewOpen ? "fixed inset-0 z-50 flex xl:static xl:z-auto" : "hidden xl:flex",
              "xl:w-[46%] xl:max-w-[52rem] xl:shrink-0",
            )}
          />
          {previewOpen && (
            <Button type="button" size="sm" variant="dark" className="fixed right-4 bottom-4 z-[55] shadow-lg xl:hidden" onClick={() => setPreviewOpen(false)}>
              <X /> Close preview
            </Button>
          )}
        </div>
      </div>

      <PublishDialog open={publishOpen} onOpenChange={setPublishOpen} problems={problems} mode={mode === "github" ? "github" : "local"} onPublished={onPublished} onGoTo={pick} />
    </div>
  );
}
