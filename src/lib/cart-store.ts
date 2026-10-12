import { useSyncExternalStore } from "react";
import { addLine, parseCart, replaceLine, setLineQty, type CartLine } from "./cart";

/**
 * The visitor's cart, kept in this browser only (local storage, named in the cookie policy),
 * so it survives a reload or closing the tab. Nothing is sent anywhere until the visitor sends
 * the order on WhatsApp.
 */
const KEY = "hungru-cart";
const EMPTY: CartLine[] = [];
/** Fired after something is added, with a short description of it for the "added" note. */
export const CART_ADDED = "hungru:cart-added";

let lines: CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load(): void {
  if (loaded) return;
  loaded = true;
  try {
    lines = parseCart(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
  } catch {
    lines = EMPTY;
  }
}

function save(next: CartLine[]): void {
  lines = next;
  try {
    if (next.length) localStorage.setItem(KEY, JSON.stringify(next));
    else localStorage.removeItem(KEY);
  } catch {
    // Storage blocked (private window, full): the cart still works until the page closes.
  }
  listeners.forEach((listener) => listener());
}

function snapshot(): CartLine[] {
  load();
  return lines;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Another tab changed the cart.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    loaded = false;
    load();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** The cart's lines. Empty while prerendering and hydrating, then the saved cart. */
export function useCart(): CartLine[] {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}

/** Adds to the cart and announces it (`what`: "Tandoori Paneer, 8 inch"). */
export function addToCart(line: CartLine, what: string): void {
  load();
  save(addLine(lines, line));
  window.dispatchEvent(new CustomEvent(CART_ADDED, { detail: what }));
}

export function setCartQty(key: string, qty: number): void {
  load();
  save(setLineQty(lines, key, qty));
}

/** Puts a changed line (new extras) in place of the old one. */
export function updateCartLine(key: string, next: CartLine): void {
  load();
  save(replaceLine(lines, key, next));
}

export function clearCart(): void {
  save(EMPTY);
}
