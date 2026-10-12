import { describe, expect, it } from "vitest";
import { business, localities } from "@/data/site";
import type { Locality } from "@/data/types";
import { deliveryLocalities, distanceKm, formatKm, isLatLng, mapsLink, withinRadius } from "@/lib/distance";

const colonyMore = { lat: 22.72316, lng: 88.47847 };
const kazipara = { lat: 22.72265, lng: 88.50837 };

describe("delivery radius", () => {
  it("measures straight-line distance in km", () => {
    expect(distanceKm(colonyMore, colonyMore)).toBe(0);
    // Kazipara is about 3.1 km east of Colony More; 0.1 degrees of latitude is about 11.1 km anywhere.
    expect(distanceKm(colonyMore, kazipara)).toBeCloseTo(3.07, 1);
    expect(distanceKm({ lat: 22.7, lng: 88.4 }, { lat: 22.8, lng: 88.4 })).toBeCloseTo(11.12, 1);
    expect(formatKm(3.0649)).toBe("3.1");
    expect(formatKm(0.04)).toBe("0.0");
  });

  it("keeps only the localities inside the circle", () => {
    const far: Locality = { slug: "far", name: "Far away", lat: 22.8, lng: 88.48 };
    const unknown = { slug: "unknown", name: "No position", lat: 0, lng: 0 } as Locality;
    const list = [{ slug: "kazipara", name: "Kazipara", ...kazipara }, far, unknown];
    expect(deliveryLocalities(list, colonyMore, 5).map((l) => l.slug)).toEqual(["kazipara"]);
    expect(deliveryLocalities(list, colonyMore, 3).map((l) => l.slug)).toEqual([]);
    expect(withinRadius(colonyMore, kazipara, 3.07)).toBe(true);
  });

  it("rejects missing or impossible positions", () => {
    expect(isLatLng(colonyMore)).toBe(true);
    expect(isLatLng({ lat: 0, lng: 0 })).toBe(false);
    expect(isLatLng({ lat: 91, lng: 88 })).toBe(false);
    expect(isLatLng({ lat: Number.NaN, lng: 88 })).toBe(false);
    expect(isLatLng(undefined)).toBe(false);
  });

  it("links to the spot on Google Maps", () => {
    expect(mapsLink({ lat: 22.723164, lng: 88.478467 })).toBe("https://maps.google.com/?q=22.72316,88.47847");
  });

  it("offers every listed area of the real site for delivery", () => {
    expect(isLatLng(business.geo)).toBe(true);
    expect(deliveryLocalities(localities, business.geo, business.deliveryKm)).toHaveLength(localities.length);
  });
});
