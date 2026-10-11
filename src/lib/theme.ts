// Light and dark mode. The script at the top of index.html sets <html data-theme> before the
// page paints: the visitor's saved choice, or else their device setting. This file keeps it
// in step afterwards, for the switch in the header (ThemeToggle.tsx).

export type Theme = "light" | "dark";

/** Local storage key. Also named in the cookie policy. */
export const THEME_KEY = "hungru-theme";

/** The browser bar colour in each mode: the page background. */
const BAR = { light: "#f4f4f1", dark: "#121110" } as const;

const listeners = new Set<() => void>();

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function apply(theme: Theme): void {
  const root = document.documentElement;
  root.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", BAR[theme]);
  listeners.forEach((l) => l());
}

function savedTheme(): Theme | null {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

/** The visitor pressed the switch: change now and remember it. */
export function setTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Private windows can refuse storage. The choice then lasts until the page closes.
  }
  apply(theme);
}

/** For useSyncExternalStore. Also follows the device setting while the visitor has not chosen. */
export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  const device = matchMedia("(prefers-color-scheme: dark)");
  const follow = () => {
    if (!savedTheme()) apply(device.matches ? "dark" : "light");
  };
  device.addEventListener("change", follow);
  return () => {
    listeners.delete(listener);
    device.removeEventListener("change", follow);
  };
}

/** Runs once in main.tsx: sets the browser bar colour to match the mode index.html chose. */
export function syncThemeColor(): void {
  apply(currentTheme());
}
