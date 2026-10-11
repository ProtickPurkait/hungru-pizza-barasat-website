// The editor's state: the published content, the draft being edited, undo/redo history,
// and photos uploaded since the last publish. The draft is saved in this browser, so a
// closed tab or a reload never loses work.
import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from "react";
import type { SiteContent } from "@/data/types";
import type { Upload } from "./api";
import { getAt, setAt, toPath, type Path } from "./path";

export interface EditorState {
  original: SiteContent;
  draft: SiteContent;
  /** Version of content.json the draft is based on (a Git blob id). */
  version: string;
  past: SiteContent[];
  future: SiteContent[];
  /** Photos uploaded but not yet part of a publish. */
  uploads: Upload[];
  /** Data URLs of uploaded photos, so the preview can show them before they are live. */
  images: Record<string, string>;
  lastEdit: { path: string; at: number } | null;
}

export type EditorAction =
  | { type: "edit"; path: Path; value: unknown }
  | { type: "replace"; content: SiteContent; uploads?: Upload[] }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "discard" }
  | { type: "uploaded"; upload: Upload; dataUrl: string }
  | { type: "published"; version: string }
  | { type: "reload"; content: SiteContent; version: string };

const HISTORY_LIMIT = 100;
/** Typing in one field within this time counts as one step for undo. */
const COALESCE_MS = 1200;

function push(past: SiteContent[], entry: SiteContent) {
  const next = [...past, entry];
  return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next;
}

function reducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "edit": {
      const key = action.path.join(".");
      if (getAt(state.draft, action.path) === action.value) return state;
      const now = Date.now();
      const coalesce = state.lastEdit?.path === key && now - state.lastEdit.at < COALESCE_MS;
      return {
        ...state,
        draft: setAt(state.draft, action.path, action.value),
        past: coalesce ? state.past : push(state.past, state.draft),
        future: [],
        lastEdit: { path: key, at: now },
      };
    }
    case "replace":
      return { ...state, draft: action.content, uploads: action.uploads ?? state.uploads, past: push(state.past, state.draft), future: [], lastEdit: null };
    case "undo": {
      const prev = state.past[state.past.length - 1];
      if (!prev) return state;
      return { ...state, draft: prev, past: state.past.slice(0, -1), future: [state.draft, ...state.future], lastEdit: null };
    }
    case "redo": {
      const [next, ...rest] = state.future;
      if (!next) return state;
      return { ...state, draft: next, past: push(state.past, state.draft), future: rest, lastEdit: null };
    }
    case "discard":
      return { ...state, draft: state.original, past: push(state.past, state.draft), future: [], uploads: [], lastEdit: null };
    case "uploaded":
      return {
        ...state,
        uploads: [...state.uploads, action.upload],
        images: { ...state.images, [action.upload.path]: action.dataUrl },
      };
    case "published":
      return { ...state, original: state.draft, version: action.version, uploads: [], lastEdit: null };
    case "reload":
      return { ...initialState(action.content, action.version), images: state.images };
  }
}

export function initialState(content: SiteContent, version: string, saved?: SavedDraft | null): EditorState {
  const base: EditorState = { original: content, draft: content, version, past: [], future: [], uploads: [], images: {}, lastEdit: null };
  return saved ? { ...base, draft: saved.draft, uploads: saved.uploads } : base;
}

/* ---------------------------------------------------------------- saved draft */

const STORAGE_KEY = "hungru-admin-draft";

export interface SavedDraft {
  version: string;
  draft: SiteContent;
  uploads: Upload[];
  savedAt: number;
}

export function loadSavedDraft(): SavedDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedDraft) : null;
  } catch {
    return null;
  }
}

export function clearSavedDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private mode: nothing was saved */
  }
}

function saveDraft(state: EditorState): void {
  try {
    if (state.draft === state.original && state.uploads.length === 0) localStorage.removeItem(STORAGE_KEY);
    else {
      const saved: SavedDraft = { version: state.version, draft: state.draft, uploads: state.uploads, savedAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    }
  } catch {
    /* storage full or blocked: the draft still lives in memory */
  }
}

/* ---------------------------------------------------------------- context */

const EditorContext = createContext<{ state: EditorState; dispatch: Dispatch<EditorAction> } | null>(null);

export function EditorProvider({ initial, children }: { initial: EditorState; children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    const t = setTimeout(() => saveDraft(state), 400);
    return () => clearTimeout(t);
  }, [state]);

  return <EditorContext.Provider value={{ state, dispatch }}>{children}</EditorContext.Provider>;
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor outside EditorProvider");
  return ctx;
}

/** Value and setter for one place in the draft. */
export function useField<T = unknown>(path: Path | string): [T, (value: T) => void] {
  const { state, dispatch } = useEditor();
  const p = toPath(path);
  return [getAt(state.draft, p) as T, (value: T) => dispatch({ type: "edit", path: p, value })];
}

export function isDirty(state: EditorState): boolean {
  return state.draft !== state.original || state.uploads.length > 0;
}
