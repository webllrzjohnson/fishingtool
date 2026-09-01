import type { TripPlan } from "@/lib/types";

export const TRIP_STORAGE_KEY = "ontario-fishing-tool:trips:v1";

export const defaultChecklist = {
  "Outdoors Card and official Licence Summary PDF": false,
  "Verified exact waterbody and FMZ in Fish ON-Line": false,
  "Checked species season, limit, size, and exceptions": false,
  "Checked weather, wind, waves, and daylight": false,
  "Packed PFD for exposed water, boat, or kayak": false,
  "Packed appropriate line, leader, hooks, bait, and lures": false,
  "Checked parking, fees, hours, and posted access signs": false,
  "Checked bait-management and invasive-species rules": false,
};

export function readTrips(): TripPlan[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(TRIP_STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function writeTrips(trips: TripPlan[]) {
  window.localStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(trips));
  window.dispatchEvent(new Event("fishing-trips-updated"));
}

export function upsertTrip(trip: TripPlan) {
  const trips = readTrips();
  const index = trips.findIndex((item) => item.id === trip.id);
  if (index >= 0) trips[index] = trip;
  else trips.unshift(trip);
  writeTrips(trips);
}

export function deleteTrip(id: string) {
  writeTrips(readTrips().filter((trip) => trip.id !== id));
}
