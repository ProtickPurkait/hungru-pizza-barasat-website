// Runs the admin API (api/admin.ts) inside `npm run dev`, saving straight to the project
// files: src/data/content.json and public/images/uploads/. Never deployed.
// Without ADMIN_PASSWORD in .env.local, anyone on this computer is signed in.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import type { IncomingMessage } from "node:http";
import path from "node:path";
import { loadEnv, type Plugin } from "vite";
import { blobSha, CONTENT_PATH, createAdminHandler, deriveSecret, HttpError, serializeContent, type Storage } from "../api/admin.ts";

export function localStorage(root: string): Storage {
  const file = path.join(root, CONTENT_PATH);
  return {
    mode: "local",
    async read() {
      const text = await readFile(file, "utf8");
      return { content: JSON.parse(text), version: blobSha(text) };
    },
    async upload(publicPath, data) {
      const target = path.join(root, "public", publicPath);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, data);
      return { ref: "local" };
    },
    async publish({ content, version }) {
      const now = await readFile(file, "utf8");
      if (blobSha(now) !== version) throw new HttpError(409, "content.json changed on disk after you opened the editor. Reload to get the latest version.");
      const text = serializeContent(content);
      await writeFile(file, text);
      return { commit: `local-${Date.now()}`, version: blobSha(text) };
    },
    async history() {
      return [];
    },
  };
}

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

export function adminDevApi(): Plugin {
  return {
    name: "hungru-admin-api",
    apply: "serve",
    configureServer(server) {
      const root = server.config.root;
      const env = loadEnv(server.config.mode, root, "");
      const password = env.ADMIN_PASSWORD || undefined;
      const handle = createAdminHandler(() => ({
        storage: localStorage(root),
        password,
        secret: deriveSecret(password ?? "local", "dev"),
        open: !password,
      }));

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/admin")) return next();
        try {
          const headers = new Headers();
          for (const [k, v] of Object.entries(req.headers)) if (typeof v === "string") headers.set(k, v);
          const method = req.method ?? "GET";
          const request = new Request(`http://${req.headers.host}${req.url}`, {
            method,
            headers,
            body: method === "GET" || method === "HEAD" ? undefined : new Uint8Array(await readBody(req)),
          });
          const response = await handle(request);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => {
            if (key !== "set-cookie") res.setHeader(key, value);
          });
          const cookies = response.headers.getSetCookie();
          if (cookies.length) res.setHeader("set-cookie", cookies);
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (err) {
          next(err);
        }
      });
    },
  };
}
