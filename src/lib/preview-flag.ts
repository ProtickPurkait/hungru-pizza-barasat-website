/** window.name of the admin panel's preview iframe. The site renders the admin's draft when it finds it. */
export const PREVIEW_WINDOW = "hungru-preview";

export function isPreviewWindow(): boolean {
  return typeof window !== "undefined" && window.name === PREVIEW_WINDOW && window.parent !== window;
}
