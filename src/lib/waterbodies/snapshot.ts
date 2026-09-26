import type { OfficialWaterbody, WaterbodySnapshotEntry } from "@/lib/types";

type SnapshotFile = Record<string, WaterbodySnapshotEntry>;

let cachedSnapshot: SnapshotFile | null = null;

export async function loadWaterbodySnapshot(): Promise<SnapshotFile> {
  if (cachedSnapshot) return cachedSnapshot;
  try {
    const imported = await import("@/data/generated/ontario-waterbodies.json");
    cachedSnapshot = (imported.default ?? imported) as SnapshotFile;
    return cachedSnapshot;
  } catch {
    return {};
  }
}

export function getWaterbodySnapshotEntry(
  snapshot: SnapshotFile,
  locationId: string,
): WaterbodySnapshotEntry | undefined {
  return snapshot[locationId];
}

export function formatDepthM(value?: number) {
  if (value === undefined) return undefined;
  return `${value.toFixed(1)} m`;
}

export function formatAreaHa(value?: number) {
  if (value === undefined) return undefined;
  if (value >= 1000) return `${(value / 100).toFixed(0)} km²`;
  return `${value.toFixed(0)} ha`;
}

export type EnrichedWaterbody = OfficialWaterbody & {
  fishOnlineUrl: string;
  fmzRegulationUrl: string;
};
