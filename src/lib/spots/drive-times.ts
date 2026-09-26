import type { Coordinates } from "@/lib/types";

const OSRM_TABLE = "https://router.project-osrm.org/table/v1/driving";

/** Minutes from an OSRM table response. Index 0 of the duration row is the origin. */
export function parseOsrmDurationsMinutes(payload: unknown, destinationCount: number): (number | null)[] {
  const empty = () => Array.from({ length: destinationCount }, () => null);
  if (!payload || typeof payload !== "object") return empty();
  const record = payload as { code?: unknown; durations?: unknown };
  if (record.code !== "Ok" || !Array.isArray(record.durations)) return empty();
  const row = record.durations[0];
  if (!Array.isArray(row)) return empty();
  return Array.from({ length: destinationCount }, (_, index) => {
    const seconds = row[index + 1];
    if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds < 0) return null;
    return Math.max(1, Math.round(seconds / 60));
  });
}

/**
 * Driving minutes from origin to each destination, using the public OSRM table.
 * Null means that destination had no road route.
 */
export async function fetchRoadDriveMinutes(
  origin: Coordinates,
  destinations: readonly Coordinates[],
): Promise<(number | null)[]> {
  if (destinations.length === 0) return [];
  const coordinates = [origin, ...destinations]
    .map((point) => `${point.longitude.toFixed(5)},${point.latitude.toFixed(5)}`)
    .join(";");
  const response = await fetch(`${OSRM_TABLE}/${coordinates}?sources=0&annotations=duration`, {
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`Road routing returned ${response.status}`);
  return parseOsrmDurationsMinutes(await response.json(), destinations.length);
}
