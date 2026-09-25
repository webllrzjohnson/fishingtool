import type { AccessPoint, Coordinates } from "@/lib/types";

export type CardinalDirection = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";

export type NearbyAccessPoint = AccessPoint & {
  distanceKm: number;
  direction: CardinalDirection;
};

const directions: CardinalDirection[] = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceBetweenKm(origin: Coordinates, destination: Coordinates) {
  const earthRadiusKm = 6_371;
  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);
  const halfChord =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) * Math.cos(destinationLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(halfChord), Math.sqrt(1 - halfChord));
}

export function directionFrom(origin: Coordinates, destination: Coordinates): CardinalDirection {
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);
  const bearing =
    (Math.atan2(
      Math.sin(longitudeDelta) * Math.cos(destinationLatitude),
      Math.cos(originLatitude) * Math.sin(destinationLatitude) -
        Math.sin(originLatitude) * Math.cos(destinationLatitude) * Math.cos(longitudeDelta),
    ) *
      180) /
    Math.PI;
  const directionIndex = Math.round((((bearing + 360) % 360) / 45)) % directions.length;

  return directions[directionIndex];
}

export function withAccessPointLocation(origin: Coordinates, points: AccessPoint[]): NearbyAccessPoint[] {
  return points
    .map((point) => ({
      ...point,
      distanceKm: distanceBetweenKm(origin, point.coordinates),
      direction: directionFrom(origin, point.coordinates),
    }))
    .sort((first, second) => first.distanceKm - second.distanceKm || first.id.localeCompare(second.id));
}

export function accessPointCategory(type: string) {
  const normalized = type.toLowerCase();
  if (normalized.includes("shore")) return "Shore access";
  if (normalized.includes("boat launch")) return "Boat launch";
  return "Official access";
}

export function accessPointDescription(type: string) {
  if (type.toLowerCase().includes("shoreline access")) {
    return "Ontario mapped an access reference at this shore location. It is not a guarantee of permission or current conditions.";
  }
  return `Official record classified as ${type.toLowerCase()}.`;
}
