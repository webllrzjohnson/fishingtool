import type { Coordinates } from "@/lib/types";

/**
 * Turn-by-turn navigation is handed off to whichever map app the person already uses,
 * which avoids a routing API key and keeps live traffic and road closures accurate.
 */
export function googleDirectionsUrl(destination: Coordinates, origin?: Coordinates) {
  const params = new URLSearchParams({
    api: "1",
    destination: `${destination.latitude},${destination.longitude}`,
    travelmode: "driving",
  });
  if (origin) params.set("origin", `${origin.latitude},${origin.longitude}`);
  return `https://www.google.com/maps/dir/?${params}`;
}

export function appleDirectionsUrl(destination: Coordinates, origin?: Coordinates) {
  const params = new URLSearchParams({
    daddr: `${destination.latitude},${destination.longitude}`,
    dirflg: "d",
  });
  if (origin) params.set("saddr", `${origin.latitude},${origin.longitude}`);
  return `https://maps.apple.com/?${params}`;
}

/** Road distance always exceeds straight-line, so this is labelled as an estimate in the UI. */
export function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

const COMPASS_NAMES: Record<string, string> = {
  N: "north",
  NE: "north-east",
  E: "east",
  SE: "south-east",
  S: "south",
  SW: "south-west",
  W: "west",
  NW: "north-west",
};

export function compassName(direction: string) {
  return COMPASS_NAMES[direction] ?? direction;
}
