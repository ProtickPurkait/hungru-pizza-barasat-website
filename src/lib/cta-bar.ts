/**
 * Whether a section with its own call and WhatsApp buttons (the home page hero) is on screen,
 * so the phone bar with the same two buttons can keep out of sight. The section sets it, the bar reads it.
 */
let covered = false;
const listeners = new Set<() => void>();

export function setCtaBarCovered(value: boolean): void {
  covered = value;
  listeners.forEach((listener) => listener());
}

export function ctaBarCovered(): boolean {
  return covered;
}

export function onCtaBarCovered(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
