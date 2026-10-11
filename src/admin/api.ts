// Calls to the admin API (api/admin.ts). Same origin; the session is an HttpOnly cookie.
import type { SiteContent } from "@/data/types";

export interface Session {
  signedIn: boolean;
  /** Local development without a password. */
  open: boolean;
  mode: "github" | "local" | null;
  /** Settings the server is missing, e.g. ["GITHUB_TOKEN"]. */
  setup: string[];
}

export interface Upload {
  path: string;
  ref: string;
}

export interface HistoryEntry {
  commit: string;
  message: string;
  date: string;
  author: string;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const ENDPOINT = "/api/admin/";

async function call<T>(action: string, init: { body?: unknown; params?: Record<string, string> } = {}): Promise<T> {
  const query = new URLSearchParams({ action, ...init.params });
  let res: Response;
  try {
    res = await fetch(`${ENDPOINT}?${query}`, {
      method: init.body === undefined ? "GET" : "POST",
      credentials: "same-origin",
      headers: { "x-requested-with": "hungru-admin", ...(init.body === undefined ? {} : { "content-type": "application/json" }) },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch {
    throw new ApiError(0, "Could not reach the server. Check your internet connection.");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 404 && !data) throw new ApiError(404, "The admin server is not available here. The editor needs the Vercel deployment (or npm run dev).");
    throw new ApiError(res.status, (data as { error?: string } | null)?.error ?? `Server error ${res.status}.`);
  }
  return data as T;
}

export const api = {
  session: () => call<Session>("session"),
  login: (password: string) => call<{ signedIn: boolean }>("login", { body: { password } }),
  logout: () => call<{ signedIn: boolean }>("logout", { body: {} }),
  content: (ref?: string) => call<{ content: SiteContent; version: string }>("content", { params: ref ? { ref } : {} }),
  history: () => call<{ history: HistoryEntry[] }>("history"),
  upload: (name: string, data: string) => call<Upload>("upload", { body: { name, data } }),
  publish: (body: { content: SiteContent; version: string; uploads: Upload[]; message: string }) =>
    call<{ commit: string; version: string }>("publish", { body }),
};

/** The commit the live site was built from (written by scripts/prerender.mjs). */
export async function liveCommit(): Promise<string | null> {
  try {
    const res = await fetch(`/build.json?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    return ((await res.json()) as { commit?: string | null }).commit ?? null;
  } catch {
    return null;
  }
}
