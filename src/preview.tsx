// Live preview inside the admin panel (/admin/). Loaded only when the page runs in the
// admin's preview iframe: the site renders the admin's unpublished draft, and re-renders
// on every change. Messages are accepted only from the parent window on the same origin.
import { StrictMode, useEffect, useLayoutEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useLocation, useNavigate } from "react-router";
import { App } from "./App";
import { applyContent } from "./data/site";
import type { SiteContent } from "./data/types";
import { setPhotoOverrides } from "./lib/photo";
import { lazyPages } from "./pages/lazy";

export type ToPreview =
  | { type: "hungru:draft"; content: SiteContent; images: Record<string, string> }
  | { type: "hungru:navigate"; path: string };

export type FromPreview = { type: "hungru:ready" } | { type: "hungru:path"; path: string };

let rerender: (() => void) | null = null;
let navigateTo: ((path: string) => void) | null = null;

function tell(message: FromPreview) {
  window.parent.postMessage(message, window.location.origin);
}

/** Reports the current page to the admin, and lets the admin move the preview to another page. */
function RouterBridge() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    navigateTo = (path) => navigate(path);
    return () => {
      navigateTo = null;
    };
  }, [navigate]);
  useEffect(() => tell({ type: "hungru:path", path: pathname }), [pathname]);
  return null;
}

function PreviewRoot() {
  const [version, setVersion] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    rerender = () => {
      setScrollY(window.scrollY);
      setVersion((v) => v + 1);
    };
    return () => {
      rerender = null;
    };
  }, []);

  // A fresh render keeps the reader's place on the page.
  useLayoutEffect(() => {
    if (version > 0) window.scrollTo(0, scrollY);
  }, [version, scrollY]);

  return (
    <BrowserRouter>
      <RouterBridge />
      {/* A new key re-mounts the page, so nothing keeps values from the previous draft. */}
      <App key={version} pages={lazyPages} />
    </BrowserRouter>
  );
}

export function startPreview(): void {
  const root = document.getElementById("root")!;
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    // The prerendered HTML shows the published content: replace it instead of hydrating.
    root.textContent = "";
    createRoot(root).render(
      <StrictMode>
        <PreviewRoot />
      </StrictMode>,
    );
  };

  window.addEventListener("message", (event: MessageEvent<ToPreview>) => {
    if (event.origin !== window.location.origin || event.source !== window.parent) return;
    const msg = event.data;
    if (msg?.type === "hungru:draft") {
      applyContent(msg.content);
      setPhotoOverrides(msg.images ?? {});
      if (started) rerender?.();
      else start();
    } else if (msg?.type === "hungru:navigate" && navigateTo) {
      navigateTo(msg.path);
    }
  });

  tell({ type: "hungru:ready" });
  // If the admin never answers, show the published site rather than a blank frame.
  setTimeout(start, 2000);
}
