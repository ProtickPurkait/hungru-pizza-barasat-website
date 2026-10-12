// Pure: the delivery radius maths, for the order form, the content check and the tests.
import type { Locality } from "@/data/types";

export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_KM = 6371;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Straight-line distance between two map points, in km (the haversine formula). */
export function distanceKm(a: LatLng, b: LatLng): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** "3.4": one decimal, as the order form and the WhatsApp message show it. */
export const formatKm = (km: number): string => (Math.round(km * 10) / 10).toFixed(1);

export function isLatLng(p: Partial<LatLng> | undefined): boolean {
  return !!p && Number.isFinite(p.lat) && Number.isFinite(p.lng) && Math.abs(p.lat!) <= 90 && Math.abs(p.lng!) <= 180 && !(p.lat === 0 && p.lng === 0);
}

/** Whether a point is inside the delivery circle. A tiny allowance stops a spot right on the line from flickering in and out. */
export const withinRadius = (shop: LatLng, point: LatLng, radiusKm: number): boolean => distanceKm(shop, point) <= radiusKm + 0.05;

/** The localities inside the delivery circle, in their list order: the ones the order form offers for delivery. */
export function deliveryLocalities(localities: Locality[], shop: LatLng, radiusKm: number): Locality[] {
  return localities.filter((l) => isLatLng(l) && withinRadius(shop, l, radiusKm));
}

/** A Google Maps link to a point, for the delivery rider. */
export const mapsLink = (p: LatLng): string => `https://maps.google.com/?q=${p.lat.toFixed(5)},${p.lng.toFixed(5)}`;
