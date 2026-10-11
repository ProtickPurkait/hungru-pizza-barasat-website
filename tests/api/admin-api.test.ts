import { describe, expect, it } from "vitest";
import {
  blobSha,
  createAdminHandler,
  deriveSecret,
  imageType,
  signSession,
  uploadName,
  vercelOptions,
  verifySession,
  type AdminOptions,
  type Storage,
  type Upload,
} from "../../api/admin.ts";

// Response bodies in these tests are plain JSON objects.
const read = async (res: Response) => (await res.json()) as Record<string, any>;

const ORIGIN = "https://hungru.example";
const minimal = { business: {}, pageSeo: {}, photos: {}, copy: {}, services: [], localities: [], areaPages: [], projects: [], builder: {} };
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(16)]);

function memoryStorage() {
  let text = JSON.stringify(minimal);
  const published: { uploads: Upload[]; message: string }[] = [];
  const storage: Storage = {
    mode: "github",
    async read() {
      return { content: JSON.parse(text), version: blobSha(text) };
    },
    async upload() {
      return { ref: "a".repeat(40) };
    },
    async publish({ content, version, uploads, message }) {
      if (version !== blobSha(text)) throw Object.assign(new Error("conflict"), { status: 409 });
      text = JSON.stringify(content);
      published.push({ uploads, message });
      return { commit: "c".repeat(40), version: blobSha(text) };
    },
    async history() {
      return [];
    },
  };
  return { storage, published };
}

function setup(overrides: Partial<AdminOptions> = {}) {
  const mem = memoryStorage();
  const opts: AdminOptions = { storage: mem.storage, password: "correct horse", secret: deriveSecret("correct horse", "t"), ...overrides };
  const handle = createAdminHandler(() => opts);
  const call = (action: string, init: { method?: string; body?: unknown; cookie?: string; headers?: Record<string, string> } = {}) =>
    handle(
      new Request(`${ORIGIN}/api/admin/?action=${action}`, {
        method: init.method ?? (init.body !== undefined ? "POST" : "GET"),
        headers: {
          "x-requested-with": "hungru-admin",
          origin: ORIGIN,
          host: "hungru.example",
          ...(init.cookie ? { cookie: init.cookie } : {}),
          ...init.headers,
        },
        body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      }),
    );
  return { call, mem, opts };
}

async function signIn(call: ReturnType<typeof setup>["call"]) {
  const res = await call("login", { body: { password: "correct horse" } });
  expect(res.status).toBe(200);
  const cookie = res.headers.get("set-cookie")!;
  expect(cookie).toMatch(/HttpOnly/);
  expect(cookie).toMatch(/SameSite=Strict/);
  expect(cookie).toMatch(/Secure/);
  return cookie.split(";")[0]!;
}

describe("sessions", () => {
  it("accepts a fresh token and rejects tampered or expired ones", () => {
    const secret = deriveSecret("pw");
    const token = signSession(secret);
    expect(verifySession(secret, token)).toBe(true);
    expect(verifySession(secret, token.replace(/.$/, (c) => (c === "A" ? "B" : "A")))).toBe(false);
    expect(verifySession(deriveSecret("other"), token)).toBe(false);
    expect(verifySession(secret, token, Date.now() + 8 * 86400 * 1000)).toBe(false);
    expect(verifySession(secret, undefined)).toBe(false);
  });
});

describe("admin API", () => {
  it("keeps content private until signed in", async () => {
    const { call } = setup();
    expect((await call("content")).status).toBe(401);
    const session = await read(await call("session"));
    expect(session).toMatchObject({ signedIn: false, mode: "github" });
  });

  it("rejects a wrong password, then signs in with the right one", async () => {
    const { call } = setup();
    expect((await call("login", { body: { password: "nope" } })).status).toBe(401);
    const cookie = await signIn(call);
    const res = await call("content", { cookie });
    expect(res.status).toBe(200);
    expect((await read(res)).content).toEqual(minimal);
  });

  it("blocks requests started by other websites", async () => {
    const { call } = setup();
    const cookie = await signIn(call);
    const body = { content: minimal, version: "x" };
    expect((await call("publish", { body, cookie, headers: { origin: "https://evil.example" } })).status).toBe(403);
    expect((await call("publish", { body, cookie, headers: { "x-requested-with": "" } })).status).toBe(403);
  });

  it("only accepts real image files, and names them safely", async () => {
    const { call } = setup();
    const cookie = await signIn(call);
    const bad = await call("upload", { cookie, body: { name: "x.png", data: Buffer.from("<script>").toString("base64") } });
    expect(bad.status).toBe(415);
    const ok = await call("upload", { cookie, body: { name: "../../My Terrace.PNG", data: PNG.toString("base64") } });
    expect(ok.status).toBe(200);
    expect((await read(ok)).path).toMatch(/^\/images\/uploads\/my-terrace-[0-9a-f]{6}\.png$/);
  });

  it("publishes, and refuses to overwrite changes made since loading", async () => {
    const { call, mem } = setup();
    const cookie = await signIn(call);
    const { version } = await read(await call("content", { cookie }));
    const next = { ...minimal, localities: [{ slug: "garia", name: "Garia" }] };
    const uploads = [{ path: "/images/uploads/garia-1a2b3c.webp", ref: "b".repeat(40) }];

    const ok = await call("publish", { cookie, body: { content: next, version, uploads, message: "  Add   Garia " } });
    expect(ok.status).toBe(200);
    expect(mem.published[0]).toEqual({ uploads, message: "Add Garia" });

    const stale = await call("publish", { cookie, body: { content: next, version } });
    expect(stale.status).toBe(500); // the memory storage throws a plain error; GitHub storage maps it to 409
  });

  it("refuses broken content and odd upload paths", async () => {
    const { call } = setup();
    const cookie = await signIn(call);
    const { version } = await read(await call("content", { cookie }));
    expect((await call("publish", { cookie, body: { content: { business: {} }, version } })).status).toBe(400);
    const uploads = [{ path: "/../../src/main.tsx", ref: "x" }];
    expect((await call("publish", { cookie, body: { content: minimal, version, uploads } })).status).toBe(400);
  });

  it("explains what is missing when the server is not set up", async () => {
    const opts = vercelOptions({});
    expect(opts.storage).toBeNull();
    expect(opts.setup).toEqual(["ADMIN_PASSWORD", "GITHUB_TOKEN", "GITHUB_REPO"]);
    const { call } = setup(opts);
    expect(await read(await call("session"))).toMatchObject({ signedIn: false, setup: ["ADMIN_PASSWORD", "GITHUB_TOKEN", "GITHUB_REPO"] });
    expect((await call("login", { body: { password: "" } })).status).toBe(503);
  });

  it("reads the repo and branch from Vercel's variables", () => {
    const opts = vercelOptions({ ADMIN_PASSWORD: "pw", GITHUB_TOKEN: "t", VERCEL_GIT_REPO_OWNER: "me", VERCEL_GIT_REPO_SLUG: "site" });
    expect(opts.setup).toEqual([]);
    expect(opts.storage?.mode).toBe("github");
  });
});

describe("upload helpers", () => {
  it("recognises image formats by their bytes", () => {
    expect(imageType(PNG)).toBe("png");
    expect(imageType(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]))).toBe("jpg");
    expect(imageType(Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBP")]))).toBe("webp");
    expect(imageType(Buffer.from("GIF89a......"))).toBeNull();
  });

  it("makes unique, URL-safe file names", () => {
    expect(uploadName("Pizza (1).jpeg", "jpg")).toMatch(/^pizza-1-[0-9a-f]{6}\.jpg$/);
    expect(uploadName("...", "webp")).toMatch(/^photo-[0-9a-f]{6}\.webp$/);
    expect(uploadName("a", "png")).not.toBe(uploadName("a", "png"));
  });

  it("computes the same blob id as git", () => {
    // `printf 'hello\n' | git hash-object --stdin`
    expect(blobSha("hello\n")).toBe("ce013625030ba8dba906f756967f9e9ca394464a");
  });
});
