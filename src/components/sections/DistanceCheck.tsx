import { CheckCircle2, LocateFixed, MapPinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { business, copy } from "@/data/site";
import { distanceKm, formatKm, withinRadius, type LatLng } from "@/lib/distance";
import { fill } from "@/lib/text";

export type DistanceResult =
  | { status: "idle" }
  | { status: "checking" }
  /** "blocked": the visitor (or the browser) said no to location; "unavailable": the phone could not find itself. */
  | { status: "failed"; reason: "blocked" | "unavailable" }
  | { status: "in" | "out"; km: number; at: LatLng };

/**
 * For an address that is not in the area list: asks the phone where it is (the browser asks
 * the visitor first) and works out the straight-line distance to the café. Nothing leaves the
 * page here; the distance and a map link only go out in the WhatsApp message, if the visitor sends it.
 */
export function DistanceCheck({ result, onResult, onPickup }: { result: DistanceResult; onResult: (r: DistanceResult) => void; onPickup: () => void }) {
  const text = copy.delivery;
  const km = business.deliveryKm;

  const check = () => {
    // Location only works on a secure (https) page; the live site is one.
    if (!("geolocation" in navigator) || !window.isSecureContext) return onResult({ status: "failed", reason: "unavailable" });
    onResult({ status: "checking" });
    const found = (pos: GeolocationPosition) => {
      const at = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      onResult({ status: withinRadius(business.geo, at, km) ? "in" : "out", km: distanceKm(business.geo, at), at });
    };
    const ask = (precise: boolean) =>
      navigator.geolocation.getCurrentPosition(
        found,
        (e) => {
          if (e.code === e.PERMISSION_DENIED) onResult({ status: "failed", reason: "blocked" });
          // No GPS fix in time (indoors, or a computer): try once more with Wi-Fi and mobile towers, which is enough for a 5 km check.
          else if (precise) ask(false);
          else onResult({ status: "failed", reason: "unavailable" });
        },
        precise ? { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 } : { enableHighAccuracy: false, timeout: 20000, maximumAge: 300000 },
      );
    ask(true);
  };

  return (
    <div aria-live="polite" className="mt-3 rounded-md border-[1.5px] border-ash-200 bg-ground-2 px-4 py-3.5 text-sm leading-relaxed">
      {result.status === "in" ? (
        <p className="flex items-start gap-2.5 text-ink">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-veg" aria-hidden="true" />
          {fill(text.inRange, { distance: formatKm(result.km) })}
        </p>
      ) : result.status === "out" ? (
        <>
          <p className="flex items-start gap-2.5 font-medium text-ink">
            <MapPinOff className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
            {fill(text.outOfRange, { distance: formatKm(result.km), km })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onPickup}>
              {text.pickupButton}
            </Button>
            {/* A first reading indoors can be off; let them try again. */}
            <Button type="button" variant="ghost" size="sm" onClick={check}>
              <LocateFixed />
              {text.checkButton}
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-ash-700">
            {result.status === "failed" ? (result.reason === "blocked" ? text.blocked : text.failed) : fill(text.checkPrompt, { km })}
          </p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={check} disabled={result.status === "checking"}>
            <LocateFixed />
            {result.status === "checking" ? text.checking : text.checkButton}
          </Button>
        </>
      )}
    </div>
  );
}
