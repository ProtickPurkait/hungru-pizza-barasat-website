// Admin API for the site editor at /admin/.
//
// On Vercel this file is a serverless function at /api/admin/. "Publish" commits
// src/data/content.json (and any uploaded photos) to the GitHub repo; Vercel then
// rebuilds the site, so it is live about a minute later.
// Locally, vite.config.ts mounts the same handler on the dev server, with a storage
// that reads and writes the files directly (scripts/admin-dev.ts).
//
// Vercel environment variables:
//   ADMIN_PASSWORD   the password for /admin/ (required)
//   GITHUB_TOKEN     fine-grained token with "Contents: read and write" on this repo (required)
//   GITHUB_REPO      "owner/name", only if Vercel's own Git variables are not available
//   GITHUB_BRANCH    defaults to the branch Vercel deployed (usually "main")
//   SESSION_SECRET   optional extra secret for signing logins
//
// Kept in one file with only Node built-ins, so Vercel can run it without bundling.
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const CONTENT_PATH = "src/data/content.json";
export const UPLOAD_DIR = "/images/uploads/";
const COOKIE = "hungru_admin";
const SESSION_DAYS = 7;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_CONTENT_BYTES = 2 * 1024 * 1024;
const REQUIRED_KEYS = ["business", "pageSeo", "photos", "copy", "services", "localities", "areaPages", "projects", "builder"];

export interface Upload {
  /** Public path, e.g. "/images/uploads/margherita-3f9a1c.webp" */
  path: string;
  /** Storage reference: a Git blob sha on GitHub, "local" in development. */
  ref: string;
}

export interface HistoryEntry {
  commit: string;
  message: string;
  date: string;
  author: string;
}

export interface Storage {
  mode: "github" | "local";
  read(ref?: string): Promise<{ content: unknown; version: string }>;
  upload(path: string, data: Buffer): Promise<{ ref: string }>;
  publish(input: { content: unknown; version: string; uploads: Upload[]; message: string }): Promise<{ commit: string; version: string }>;
  history(): Promise<HistoryEntry[]>;
}

export interface AdminOptions {
  /** null when the server is missing its settings; `setup` says what to add. */
  storage: Storage | null;
  password?: string;
  secret: string;
  /** Local development without a password: anyone on this computer is signed in. */
  open?: boolean;
  setup?: string[];
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Git's blob id for a file, so local and GitHub versions compare the same way. */
export function blobSha(text: string | Buffer): string {
  const data = typeof text === "string" ? Buffer.from(text, "utf8") : text;
  return createHash("sha1").update(`blob ${data.length}\0`).update(data).digest("hex");
}

export function serializeContent(content: unknown): string {
  return JSON.stringify(content, null, 2) + "\n";
}

/* ------------------------------------------------------------------ sessions */

const hmac = (secret: string, data: string) => createHmac("sha256", secret).update(data).digest("base64url");

export function signSession(secret: string, now = Date.now()): string {
  const exp = Math.floor(now / 1000) + SESSION_DAYS * 86400;
  return `${exp}.${hmac(secret, `v1.${exp}`)}`;
}

export function verifySession(secret: string, token: string | undefined, now = Date.now()): boolean {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) * 1000 < now) return false;
  const expected = Buffer.from(hmac(secret, `v1.${exp}`));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function passwordMatches(expected: string, given: string): boolean {
  const a = createHash("sha256").update(expected).digest();
  const b = createHash("sha256").update(given).digest();
  return timingSafeEqual(a, b);
}

/** Signing key: changes when the password changes, so old logins stop working. */
export function deriveSecret(password: string, extra = ""): string {
  return createHash("sha256").update(`hungru-admin\0${password}\0${extra}`).digest("hex");
}

function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return undefined;
}

function sessionCookie(request: Request, value: string, maxAge: number): string {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE}=${value}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}

// Slows down password guessing: a short pause on every failure, and a lock-out per address.
const failures = new Map<string, { count: number; since: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 10;

function clientKey(request: Request): string {
  return (request.headers.get("x-forwarded-for") ?? "local").split(",")[0]!.trim();
}

function tooManyFailures(key: string, now = Date.now()): boolean {
  const f = failures.get(key);
  if (!f || now - f.since > WINDOW_MS) return false;
  return f.count >= MAX_FAILURES;
}

function recordFailure(key: string, now = Date.now()): void {
  const f = failures.get(key);
  if (!f || now - f.since > WINDOW_MS) failures.set(key, { count: 1, since: now });
  else f.count++;
}

/* ------------------------------------------------------------------ uploads */

export function imageType(data: Buffer): "jpg" | "png" | "webp" | "avif" | null {
  if (data.length < 12) return null;
  if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return "jpg";
  if (data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (data.toString("latin1", 0, 4) === "RIFF" && data.toString("latin1", 8, 12) === "WEBP") return "webp";
  const brand = data.toString("latin1", 4, 12);
  if (brand === "ftypavif" || brand === "ftypavis") return "avif";
  return null;
}

/** "My Terrace Photo.JPG" → "my-terrace-photo-1a2b3c.webp" (always unique). */
export function uploadName(original: string, ext: string): string {
  const base = original
    .replace(/\.[^.]*$/, "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base || "photo"}-${randomBytes(3).toString("hex")}.${ext}`;
}

const UPLOAD_PATH = /^\/images\/uploads\/[a-z0-9-]+\.(jpg|png|webp|avif)$/;

/* ------------------------------------------------------------------ handler */

const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function body<T>(request: Request, limit: number): Promise<T> {
  const text = await request.text();
  if (text.length > limit) throw new HttpError(413, "That is too large to send in one go.");
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new HttpError(400, "The request was not valid JSON.");
  }
}

/** Blocks requests started by other websites: they cannot set this header, and their Origin will not match. */
function checkSameOrigin(request: Request): void {
  if (request.headers.get("x-requested-with") !== "hungru-admin") throw new HttpError(403, "Missing admin header.");
  const origin = request.headers.get("origin");
  if (!origin) return;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? new URL(request.url).host;
  if (new URL(origin).host !== host) throw new HttpError(403, "Request from another website.");
}

function validateContent(content: unknown): asserts content is Record<string, unknown> {
  if (!content || typeof content !== "object" || Array.isArray(content)) throw new HttpError(400, "Content must be an object.");
  const missing = REQUIRED_KEYS.filter((k) => !(k in content));
  if (missing.length) throw new HttpError(400, `Content is missing: ${missing.join(", ")}.`);
}

export function createAdminHandler(getOptions: () => AdminOptions) {
  return async function handle(request: Request): Promise<Response> {
    const opts = getOptions();
    const url = new URL(request.url);
    const action = url.searchParams.get("action") ?? "";
    const method = request.method.toUpperCase();
    const configured = !!opts.storage && (opts.open || !!opts.password);
    const signedIn = configured && (opts.open || verifySession(opts.secret, readCookie(request, COOKIE)));

    try {
      if (method === "POST") checkSameOrigin(request);

      if (method === "GET" && action === "session") {
        return json({ signedIn, open: !!opts.open, mode: opts.storage?.mode ?? null, setup: configured ? [] : (opts.setup ?? []) });
      }

      if (method === "POST" && action === "login") {
        if (!configured || !opts.password) throw new HttpError(503, "The admin panel is not set up on the server yet.");
        const key = clientKey(request);
        if (tooManyFailures(key)) throw new HttpError(429, "Too many wrong passwords. Try again in 15 minutes.");
        const { password } = await body<{ password?: string }>(request, 2000);
        if (typeof password !== "string" || !passwordMatches(opts.password, password)) {
          recordFailure(key);
          await pause(800);
          throw new HttpError(401, "That password is not right.");
        }
        failures.delete(key);
        return json({ signedIn: true }, 200, { "set-cookie": sessionCookie(request, signSession(opts.secret), SESSION_DAYS * 86400) });
      }

      if (method === "POST" && action === "logout") {
        return json({ signedIn: false }, 200, { "set-cookie": sessionCookie(request, "", 0) });
      }

      if (!configured) throw new HttpError(503, "The admin panel is not set up on the server yet.");
      if (!signedIn) throw new HttpError(401, "Please sign in again.");
      const storage = opts.storage!;

      if (method === "GET" && action === "content") {
        const ref = url.searchParams.get("ref") ?? undefined;
        if (ref && !/^[0-9a-f]{40}$/.test(ref)) throw new HttpError(400, "Unknown version.");
        return json(await storage.read(ref));
      }

      if (method === "GET" && action === "history") {
        return json({ history: await storage.history() });
      }

      if (method === "POST" && action === "upload") {
        const { name, data } = await body<{ name?: string; data?: string }>(request, Math.ceil(MAX_IMAGE_BYTES * 1.4) + 2000);
        if (typeof data !== "string") throw new HttpError(400, "No image was sent.");
        const bytes = Buffer.from(data, "base64");
        if (bytes.length > MAX_IMAGE_BYTES) throw new HttpError(413, "That photo is too large (3 MB at most).");
        const type = imageType(bytes);
        if (!type) throw new HttpError(415, "Only JPG, PNG, WebP or AVIF photos can be uploaded.");
        const path = UPLOAD_DIR + uploadName(typeof name === "string" ? name : "photo", type);
        const { ref } = await storage.upload(path, bytes);
        return json({ path, ref });
      }

      if (method === "POST" && action === "publish") {
        const input = await body<{ content?: unknown; version?: string; uploads?: Upload[]; message?: string }>(request, MAX_CONTENT_BYTES);
        validateContent(input.content);
        if (typeof input.version !== "string" || !input.version) throw new HttpError(400, "Missing version.");
        const uploads = Array.isArray(input.uploads) ? input.uploads : [];
        for (const u of uploads) {
          if (!u || typeof u.path !== "string" || !UPLOAD_PATH.test(u.path) || typeof u.ref !== "string") throw new HttpError(400, "Bad photo upload.");
        }
        const message = (typeof input.message === "string" ? input.message : "").replace(/\s+/g, " ").trim().slice(0, 120) || "Update website content";
        return json(await storage.publish({ content: input.content, version: input.version, uploads, message }));
      }

      throw new HttpError(404, "Unknown admin action.");
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, err.status);
      console.error(err);
      return json({ error: "Something went wrong on the server. Please try again." }, 500);
    }
  };
}

/* ------------------------------------------------------------------ GitHub storage */

export function githubStorage(cfg: { token: string; owner: string; repo: string; branch: string }): Storage {
  const base = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}`;

  async function gh<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(base + path, {
      ...init,
      headers: {
        authorization: `Bearer ${cfg.token}`,
        accept: "application/vnd.github+json",
        "x-github-api-version": "2022-11-28",
        "user-agent": "hungru-admin",
        ...(init.body ? { "content-type": "application/json" } : {}),
      },
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      if (res.status === 401) throw new HttpError(502, "GitHub refused the token. Check GITHUB_TOKEN in Vercel.");
      if (res.status === 403 || res.status === 404) throw new HttpError(502, `GitHub says the token cannot reach ${cfg.owner}/${cfg.repo} (${res.status}). Give it "Contents: read and write" on this repo.`);
      // Moving the branch fails like this when someone pushed in the meantime.
      if (init.method === "PATCH" && (res.status === 409 || res.status === 422)) {
        throw new HttpError(409, "The site changed while you were publishing. Reload to get the latest version, then publish again.");
      }
      throw new HttpError(502, `GitHub error ${res.status}. ${detail.slice(0, 200)}`);
    }
    return (await res.json()) as T;
  }

  async function fileAt(ref: string): Promise<{ text: string; sha: string }> {
    const file = await gh<{ sha: string; content?: string; encoding?: string }>(`/contents/${CONTENT_PATH}?ref=${encodeURIComponent(ref)}`);
    if (file.encoding === "base64" && file.content) return { text: Buffer.from(file.content, "base64").toString("utf8"), sha: file.sha };
    // Files over 1 MB come without content: fetch the blob instead.
    const blob = await gh<{ content: string }>(`/git/blobs/${file.sha}`);
    return { text: Buffer.from(blob.content, "base64").toString("utf8"), sha: file.sha };
  }

  return {
    mode: "github",

    async read(ref) {
      const { text, sha } = await fileAt(ref ?? cfg.branch);
      return { content: JSON.parse(text), version: sha };
    },

    async upload(_path, data) {
      // Stored now, committed with the next publish (so uploading alone does not rebuild the site).
      const blob = await gh<{ sha: string }>("/git/blobs", { method: "POST", body: JSON.stringify({ content: data.toString("base64"), encoding: "base64" }) });
      return { ref: blob.sha };
    },

    async publish({ content, version, uploads, message }) {
      const head = await gh<{ object: { sha: string } }>(`/git/ref/heads/${encodeURIComponent(cfg.branch)}`);
      const current = await fileAt(head.object.sha);
      if (current.sha !== version) {
        throw new HttpError(409, "Someone published changes after you opened the editor. Reload to get them, then make your edits again.");
      }
      const text = serializeContent(content);
      const commit = await gh<{ tree: { sha: string } }>(`/git/commits/${head.object.sha}`);
      const tree = await gh<{ sha: string }>("/git/trees", {
        method: "POST",
        body: JSON.stringify({
          base_tree: commit.tree.sha,
          tree: [
            { path: CONTENT_PATH, mode: "100644", type: "blob", content: text },
            ...uploads.map((u) => ({ path: `public${u.path}`, mode: "100644", type: "blob", sha: u.ref })),
          ],
        }),
      });
      const created = await gh<{ sha: string }>("/git/commits", {
        method: "POST",
        body: JSON.stringify({ message: `${message}\n\nPublished from the website admin panel.`, tree: tree.sha, parents: [head.object.sha] }),
      });
      // Not forced: if someone pushed in the meantime, GitHub refuses and the editor asks to reload.
      await gh(`/git/refs/heads/${encodeURIComponent(cfg.branch)}`, { method: "PATCH", body: JSON.stringify({ sha: created.sha, force: false }) });
      return { commit: created.sha, version: blobSha(text) };
    },

    async history() {
      const list = await gh<{ sha: string; commit: { message: string; author: { name: string; date: string } } }[]>(
        `/commits?path=${encodeURIComponent(CONTENT_PATH)}&sha=${encodeURIComponent(cfg.branch)}&per_page=20`,
      );
      return list.map((c) => ({ commit: c.sha, message: c.commit.message.split("\n")[0]!, date: c.commit.author.date, author: c.commit.author.name }));
    },
  };
}

/** Options from Vercel's environment variables. */
export function vercelOptions(env: Record<string, string | undefined>): AdminOptions {
  const password = env.ADMIN_PASSWORD || undefined;
  const token = env.GITHUB_TOKEN || undefined;
  const [owner, repo] = env.GITHUB_REPO ? env.GITHUB_REPO.split("/") : [env.VERCEL_GIT_REPO_OWNER, env.VERCEL_GIT_REPO_SLUG];
  const branch = env.GITHUB_BRANCH || env.VERCEL_GIT_COMMIT_REF || "main";
  const setup: string[] = [];
  if (!password) setup.push("ADMIN_PASSWORD");
  if (!token) setup.push("GITHUB_TOKEN");
  if (!owner || !repo) setup.push("GITHUB_REPO");
  return {
    storage: token && owner && repo ? githubStorage({ token, owner, repo, branch }) : null,
    password,
    secret: deriveSecret(password ?? "", env.SESSION_SECRET || token || ""),
    setup,
  };
}

const handler = createAdminHandler(() => vercelOptions(process.env));

export function GET(request: Request): Promise<Response> {
  return handler(request);
}

export function POST(request: Request): Promise<Response> {
  return handler(request);
}
