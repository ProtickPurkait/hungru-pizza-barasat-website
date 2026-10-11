import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { adminDevApi } from "./scripts/admin-dev.ts";

// `vite build` builds the site; `vite build --mode admin` builds the admin panel (/admin/) on its own,
// so the two never share chunks and the site loads exactly what it needs. In dev both are served.
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), adminDevApi()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  build: {
    // Prerendered pages are written next to these files by scripts/prerender.mjs.
    outDir: "dist",
    emptyOutDir: mode !== "admin",
    assetsInlineLimit: 0,
    rolldownOptions: {
      input: path.resolve(import.meta.dirname, mode === "admin" ? "admin/index.html" : "index.html"),
    },
  },
  ssr: {
    // Bundle UI deps into the SSR build so the prerender script has no runtime surprises.
    noExternal: ["radix-ui", /^@radix-ui\//],
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
}));
