import { getSpeciesById, matchSpecies } from "@/data/curated/species";
import { fishingLocations } from "@/lib/fishing-locations";
import { distanceBetweenKm, directionFrom, type CardinalDirection } from "@/lib/access-points";
import { fetchNearbyAccessPoints } from "@/lib/sources/ontario-gis";
import { KNOWN_FISHING_PLACES } from "@/lib/spots/known-places";
import type { Coordinates, FishingLocation } from "@/lib/types";

export const ROAD_DISTANCE_FACTOR = 1.35;
export const AVERAGE_ROAD_SPEED_KMH = 70;
const MIN_CURATED_HITS_BEFORE_ACCESS_FALLBACK = 3;
const HARBOUR_DEDUPE_KM = 2;

export type SuggestMode = "distance" | "drive";

export type SuggestSpot = {
  id: string;
  kind: "curated" | "harbour" | "access";
  label: string;
  detail?: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  driveMinutesEstimate: number;
  /** road = OSRM driving time; estimate = straight-line fallback. */
  driveSource?: "road" | "estimate";
  direction?: CardinalDirection;
  shoreSuitability?: FishingLocation["shoreSuitability"];
  speciesChips: string[];
};

type RankableCandidate = SuggestSpot & {
  speciesIds: string[];
  popularity?: FishingLocation["popularity"];
};

export function estimateRoadDistanceKm(straightLineKm: number) {
  return straightLineKm * ROAD_DISTANCE_FACTOR;
}

export function estimateDriveMinutes(straightLineKm: number) {
  const hours = estimateRoadDistanceKm(straightLineKm) / AVERAGE_ROAD_SPEED_KMH;
  return Math.round(hours * 60);
}

/** Inverse of estimateDriveMinutes: straight-line km that fits within a drive budget. */
export function maxStraightLineKmForDriveMinutes(minutes: number) {
  return (minutes * AVERAGE_ROAD_SPEED_KMH) / (ROAD_DISTANCE_FACTOR * 60);
}

function drivePhrase(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (remainder === 0) return `${hours} hr`;
  return `${hours} hr ${remainder} min`;
}

export function formatDriveTimeEstimate(minutes: number, source: "road" | "estimate" = "estimate") {
  const phrase = drivePhrase(minutes);
  return source === "road" ? `${phrase} by road` : `about ${phrase} drive`;
}

export function withinSuggestRange(distanceKm: number, mode: SuggestMode, range: number) {
  if (mode === "distance") return distanceKm <= range;
  return estimateDriveMinutes(distanceKm) <= range;
}

/** Travel metric for the selected preset: km or estimated drive minutes. */
export function suggestRangeMetric(
  candidate: Pick<SuggestSpot, "distanceKm" | "driveMinutesEstimate">,
  mode: SuggestMode,
) {
  return mode === "distance" ? candidate.distanceKm : candidate.driveMinutesEstimate;
}

function shoreRank(suitability?: FishingLocation["shoreSuitability"]) {
  if (suitability === "excellent") return 0;
  if (suitability === "good") return 1;
  if (suitability === "limited") return 2;
  return 3;
}

function popularityRank(popularity?: FishingLocation["popularity"]) {
  if (popularity === "featured") return 0;
  if (popularity === "popular") return 1;
  return 2;
}

function qualityThenDistance(first: RankableCandidate, second: RankableCandidate) {
  const byShore = shoreRank(first.shoreSuitability) - shoreRank(second.shoreSuitability);
  if (byShore !== 0) return byShore;
  const byPopularity = popularityRank(first.popularity) - popularityRank(second.popularity);
  if (byPopularity !== 0) return byPopularity;
  const byDistance = first.distanceKm - second.distanceKm;
  if (Math.abs(byDistance) > 0.01) return byDistance;
  return first.label.localeCompare(second.label);
}

export function speciesIdsForLocation(location: FishingLocation) {
  const ids = new Set<string>();
  for (const label of [...location.beginnerTargets, ...location.expectedSpecies]) {
    const match = matchSpecies(label);
    if (match) ids.add(match.id);
  }
  return [...ids];
}

export function locationMatchesSpeciesFilter(location: FishingLocation, speciesFilter?: string) {
  if (!speciesFilter) return true;
  const needle = speciesFilter.toLowerCase();
  const ids = speciesIdsForLocation(location);
  if (ids.some((id) => id === needle || id.includes(needle))) return true;
  return location.expectedSpecies.some((label) => label.toLowerCase().includes(needle));
}

function isShoreFriendly(
  kind: SuggestSpot["kind"],
  shore?: FishingLocation["shoreSuitability"],
) {
  if (kind === "harbour" || kind === "access") return true;
  return shore === "excellent" || shore === "good";
}

function candidateFromLocation(
  location: FishingLocation,
  origin: Coordinates,
): RankableCandidate | null {
  if (!location.coordinates) return null;
  const distanceKm = distanceBetweenKm(origin, location.coordinates);
  return {
    id: `curated-${location.id}`,
    kind: "curated",
    label: location.name,
    detail: [location.municipality, location.region].filter(Boolean).join(" · ") || undefined,
    latitude: location.coordinates.latitude,
    longitude: location.coordinates.longitude,
    distanceKm,
    driveMinutesEstimate: estimateDriveMinutes(distanceKm),
    direction: directionFrom(origin, location.coordinates),
    shoreSuitability: location.shoreSuitability,
    speciesChips: location.expectedSpecies.slice(0, 5),
    speciesIds: speciesIdsForLocation(location),
    popularity: location.popularity,
  };
}

function harbourNearCurated(latitude: number, longitude: number, curated: RankableCandidate[]) {
  const point = { latitude, longitude };
  return curated.some((spot) => distanceBetweenKm(point, spot) < HARBOUR_DEDUPE_KM);
}

function buildCuratedAndHarbourCandidates(origin: Coordinates): RankableCandidate[] {
  const curated = fishingLocations
    .map((location) => candidateFromLocation(location, origin))
    .filter((entry): entry is RankableCandidate => entry !== null);

  for (const harbour of KNOWN_FISHING_PLACES) {
    if (harbourNearCurated(harbour.latitude, harbour.longitude, curated)) continue;
    const distanceKm = distanceBetweenKm(origin, harbour);
    curated.push({
      id: `harbour-${harbour.label.toLowerCase().replace(/\s+/g, "-")}`,
      kind: "harbour",
      label: harbour.label,
      detail: harbour.detail,
      latitude: harbour.latitude,
      longitude: harbour.longitude,
      distanceKm,
      driveMinutesEstimate: estimateDriveMinutes(distanceKm),
      direction: directionFrom(origin, harbour),
      shoreSuitability: "excellent",
      speciesChips: [],
      speciesIds: [],
      popularity: "popular",
    });
  }

  return curated;
}

export function rankSuggestCandidates(
  candidates: RankableCandidate[],
  options: {
    mode: SuggestMode;
    range: number;
    species?: string;
    shoreOnly?: boolean;
  },
): RankableCandidate[] {
  const species = options.species?.trim().toLowerCase();
  const filtered = candidates.filter((candidate) => {
    if (options.shoreOnly && !isShoreFriendly(candidate.kind, candidate.shoreSuitability)) {
      return false;
    }
    if (!withinSuggestRange(candidate.distanceKm, options.mode, options.range)) return false;
    if (species) {
      const matches =
        candidate.speciesIds.some((id) => id === species || id.includes(species)) ||
        candidate.speciesChips.some((label) => label.toLowerCase().includes(species));
      if (!matches) return false;
    }
    return true;
  });

  return [...filtered].sort((first, second) => {
    const byDistance = first.distanceKm - second.distanceKm;
    if (Math.abs(byDistance) > 0.01) return byDistance;
    return qualityThenDistance(first, second);
  });
}

/**
 * Closest-first alone fills wide ranges with ultra-local spots (e.g. 2 hr still
 * shows only ~45 min Toronto waterfront). Spread picks across near / mid / far
 * bands of the selected range so changing the preset changes the results.
 */
export function selectSuggestResults(
  rankedClosestFirst: RankableCandidate[],
  options: { mode: SuggestMode; range: number; limit: number; origin: Coordinates },
): RankableCandidate[] {
  const { mode, range, limit, origin } = options;

  const withDirection = rankedClosestFirst.map((candidate) => ({
    ...candidate,
    direction:
      candidate.direction ??
      directionFrom(origin, { latitude: candidate.latitude, longitude: candidate.longitude }),
  }));

  if (withDirection.length <= limit) {
    return withDirection.sort((first, second) => first.distanceKm - second.distanceKm);
  }

  const COMPASS: CardinalDirection[] = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const byDirection = new Map<CardinalDirection, RankableCandidate[]>(
    COMPASS.map((dir) => [dir, []]),
  );

  for (const candidate of withDirection) {
    byDirection.get(candidate.direction ?? "N")?.push(candidate);
  }

  for (const list of byDirection.values()) {
    // Within a bearing, prefer quality and mixed distance so one direction is not all local.
    list.sort((first, second) => {
      const bandDelta = distanceBand(second, mode, range) - distanceBand(first, mode, range);
      if (bandDelta !== 0) return bandDelta;
      return qualityThenDistance(first, second);
    });
  }

  const selected: RankableCandidate[] = [];
  const selectedIds = new Set<string>();
  const pointers = new Map<CardinalDirection, number>(COMPASS.map((dir) => [dir, 0]));

  function takeNext(dir: CardinalDirection) {
    const list = byDirection.get(dir) ?? [];
    let index = pointers.get(dir) ?? 0;
    while (index < list.length) {
      const candidate = list[index];
      index += 1;
      pointers.set(dir, index);
      if (selectedIds.has(candidate.id)) continue;
      selected.push(candidate);
      selectedIds.add(candidate.id);
      return true;
    }
    return false;
  }

  // Round-robin across the eight bearings so results fan out from the origin.
  let progress = true;
  while (selected.length < limit && progress) {
    progress = false;
    for (const dir of COMPASS) {
      if (selected.length >= limit) break;
      if (takeNext(dir)) progress = true;
    }
  }

  if (selected.length < limit) {
    for (const candidate of withDirection) {
      if (selected.length >= limit) break;
      if (selectedIds.has(candidate.id)) continue;
      selected.push(candidate);
      selectedIds.add(candidate.id);
    }
  }

  return selected.sort((first, second) => first.distanceKm - second.distanceKm);
}

function distanceBand(candidate: RankableCandidate, mode: SuggestMode, range: number) {
  const metric = suggestRangeMetric(candidate, mode);
  const ratio = range > 0 ? metric / range : 0;
  if (ratio < 1 / 3) return 0;
  if (ratio < 2 / 3) return 1;
  return 2;
}


export function suggestSpeciesOptions() {
  const ids = new Set<string>();
  for (const location of fishingLocations) {
    for (const speciesId of speciesIdsForLocation(location)) ids.add(speciesId);
  }
  return [...ids]
    .map((id) => {
      const species = getSpeciesById(id);
      return species ? { id: species.id, label: species.name } : null;
    })
    .filter((option): option is { id: string; label: string } => option !== null)
    .sort((left, right) => left.label.localeCompare(right.label));
}

export async function suggestNearbySpots(
  origin: Coordinates,
  options: {
    mode: SuggestMode;
    range: number;
    limit: number;
    species?: string;
    shoreOnly?: boolean;
  },
): Promise<SuggestSpot[]> {
  const pool = buildCuratedAndHarbourCandidates(origin);
  const ranked = selectSuggestResults(rankSuggestCandidates(pool, options), {
    mode: options.mode,
    range: options.range,
    limit: options.limit,
    origin,
  });

  if (ranked.length < MIN_CURATED_HITS_BEFORE_ACCESS_FALLBACK) {
    const radiusKm =
      options.mode === "distance"
        ? options.range
        : Math.min(maxStraightLineKmForDriveMinutes(options.range), 350);
    try {
      const accessPoints = await fetchNearbyAccessPoints(
        origin.latitude,
        origin.longitude,
        radiusKm,
      );
      const seen = new Set(
        ranked.map((spot) => `${spot.latitude.toFixed(4)},${spot.longitude.toFixed(4)}`),
      );
      for (const point of accessPoints) {
        const key = `${point.coordinates.latitude.toFixed(4)},${point.coordinates.longitude.toFixed(4)}`;
        if (seen.has(key)) continue;
        const distanceKm = point.distanceKm;
        const candidate: RankableCandidate = {
          id: `access-${point.id}`,
          kind: "access",
          label: point.evidence?.siteName?.trim() || point.type,
          detail: "Official Ontario access",
          latitude: point.coordinates.latitude,
          longitude: point.coordinates.longitude,
          distanceKm,
          driveMinutesEstimate: estimateDriveMinutes(distanceKm),
          direction: directionFrom(origin, point.coordinates),
          shoreSuitability: "good",
          speciesChips: [],
          speciesIds: [],
        };
        if (!withinSuggestRange(candidate.distanceKm, options.mode, options.range)) continue;
        if (options.shoreOnly && !isShoreFriendly(candidate.kind, candidate.shoreSuitability)) {
          continue;
        }
        ranked.push(candidate);
        seen.add(key);
        if (ranked.length >= options.limit) break;
      }
    } catch {
      // Access fallback is best-effort; curated results still stand.
    }
  }

  return ranked.slice(0, options.limit);
}
