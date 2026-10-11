import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import { App } from "./App";
import { isPreviewWindow } from "./lib/preview-flag";
import { lazyPages } from "./pages/lazy";

// "/index.html" is the same page as "/".
if (window.location.pathname.endsWith("/index.html")) {
  window.history.replaceState(null, "", window.location.pathname.replace(/index\.html$/, "") + window.location.search + window.location.hash);
}

if (isPreviewWindow()) {
  // Inside the admin panel's preview: render the unpublished draft (src/preview.tsx).
  import("./preview").then((m) => m.startPreview());
} else {
  // Scroll-reveal starts only once the app runs, so content is never hidden without JS.
  // Anything already on screen (or scrolled past) is shown straight away, without animating.
  for (const el of document.querySelectorAll(".reveal")) {
    if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-visible");
  }
  document.documentElement.classList.add("js");

  const root = document.getElementById("root")!;
  const app = (
    <StrictMode>
      <BrowserRouter>
        <App pages={lazyPages} />
      </BrowserRouter>
    </StrictMode>
  );

  // Prerendered pages arrive with HTML inside #root: hydrate it. In dev, or when the
  // inline guard in index.html cleared a mismatched page, render from scratch.
  if (root.firstElementChild) hydrateRoot(root, app);
  else createRoot(root).render(app);
}
