// The GitHub side of publishing, against a fake GitHub API.
import { afterEach, describe, expect, it, vi } from "vitest";
import { blobSha, CONTENT_PATH, githubStorage, HttpError, serializeContent } from "../../api/admin.ts";

const cfg = { token: "t0ken", owner: "me", repo: "site", branch: "main" };
const base = "https://api.github.com/repos/me/site";
const published = { business: { name: "Old" } };
const publishedText = serializeContent(published);

type Call = { method: string; url: string; body?: any; auth: string | null };

/** A fake GitHub with one branch whose content.json is `published`. */
function fakeGitHub(options: { moveRefStatus?: number } = {}) {
  const calls: Call[] = [];
  const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit = {}) => {
      const method = init.method ?? "GET";
      const headers = new Headers(init.headers);
      calls.push({ method, url, body: init.body ? JSON.parse(String(init.body)) : undefined, auth: headers.get("authorization") });
      const path = url.replace(base, "");
      if (method === "GET" && path === "/git/ref/heads/main") return reply({ object: { sha: "head1" } });
      if (method === "GET" && path.startsWith(`/contents/${CONTENT_PATH}`))
        return reply({ sha: blobSha(publishedText), encoding: "base64", content: Buffer.from(publishedText).toString("base64") });
      if (method === "GET" && path === "/git/commits/head1") return reply({ tree: { sha: "tree1" } });
      if (method === "POST" && path === "/git/blobs") return reply({ sha: "blob-img" }, 201);
      if (method === "POST" && path === "/git/trees") return reply({ sha: "tree2" }, 201);
      if (method === "POST" && path === "/git/commits") return reply({ sha: "commit2" }, 201);
      if (method === "PATCH" && path === "/git/refs/heads/main") return reply({}, options.moveRefStatus ?? 200);
      if (method === "GET" && path.startsWith("/commits?"))
        return reply([{ sha: "commit2", commit: { message: "Edit prices\n\nPublished from the website admin panel.", author: { name: "Me", date: "2026-10-10T08:00:00Z" } } }]);
      return reply({ message: "not found" }, 404);
    }),
  );
  return calls;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GitHub storage", () => {
  it("reads content.json and its version from the branch", async () => {
    const calls = fakeGitHub();
    const { content, version } = await githubStorage(cfg).read();
    expect(content).toEqual(published);
    expect(version).toBe(blobSha(publishedText));
    expect(calls[0]!.url).toBe(`${base}/contents/${CONTENT_PATH}?ref=main`);
    expect(calls[0]!.auth).toBe("Bearer t0ken");
  });

  it("publishes content and photos as one commit on top of the branch", async () => {
    const calls = fakeGitHub();
    const storage = githubStorage(cfg);
    const { ref } = await storage.upload("/images/uploads/a-1a2b3c.webp", Buffer.from("img"));
    expect(ref).toBe("blob-img");

    const next = { business: { name: "New" } };
    const res = await storage.publish({
      content: next,
      version: blobSha(publishedText),
      uploads: [{ path: "/images/uploads/a-1a2b3c.webp", ref }],
      message: "Edit prices",
    });
    expect(res).toEqual({ commit: "commit2", version: blobSha(serializeContent(next)) });

    const tree = calls.find((c) => c.url.endsWith("/git/trees"))!.body;
    expect(tree.base_tree).toBe("tree1");
    expect(tree.tree).toEqual([
      { path: CONTENT_PATH, mode: "100644", type: "blob", content: serializeContent(next) },
      { path: "public/images/uploads/a-1a2b3c.webp", mode: "100644", type: "blob", sha: "blob-img" },
    ]);
    const commit = calls.find((c) => c.method === "POST" && c.url.endsWith("/git/commits"))!.body;
    expect(commit).toMatchObject({ tree: "tree2", parents: ["head1"] });
    expect(commit.message).toMatch(/^Edit prices\n\nPublished from the website admin panel\.$/);
    const move = calls.find((c) => c.method === "PATCH")!.body;
    expect(move).toEqual({ sha: "commit2", force: false });
  });

  it("refuses to publish over changes made since the editor loaded", async () => {
    const calls = fakeGitHub();
    await expect(githubStorage(cfg).publish({ content: {}, version: "stale", uploads: [], message: "x" })).rejects.toMatchObject({ status: 409 });
    expect(calls.some((c) => c.method !== "GET")).toBe(false);
  });

  it("reports a 409 when the branch moved during the publish", async () => {
    fakeGitHub({ moveRefStatus: 422 });
    const err = await githubStorage(cfg)
      .publish({ content: {}, version: blobSha(publishedText), uploads: [], message: "x" })
      .catch((e) => e);
    expect(err).toBeInstanceOf(HttpError);
    expect(err.status).toBe(409);
  });

  it("lists the publish history of content.json", async () => {
    fakeGitHub();
    expect(await githubStorage(cfg).history()).toEqual([{ commit: "commit2", message: "Edit prices", date: "2026-10-10T08:00:00Z", author: "Me" }]);
  });
});
