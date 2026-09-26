import { fishingLocations } from "@/lib/fishing-locations";
import { searchPlaces } from "@/lib/sources/places";
import { searchAccessPointsByName } from "@/lib/sources/ontario-gis";
import { suggestWaterbodies } from "@/lib/sources/ontario-waterbodies";
import { matchKnownPlaces, normalizePlaceQuery } from "@/lib/spots/known-places";

/**
 * One search across everything a person might type: a town or harbour, an official
 * waterbody name, or one of the curated destinations. Each result carries the
 * coordinates needed to open a spot, so the caller never has to guess.
 */
export type SpotSuggestion = {
  id: string;
  kind: "place" | "access" | "waterbody" | "curated";
  label: string;
  detail?: string;
  latitude?: number;
  longitude?: number;
  waterbodyLid?: string;
};

function matches(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export function searchCuratedSpots(query: string, limit = 3): SpotSuggestion[] {
  const term = normalizePlaceQuery(query);
  if (term.length < 2) return [];
  return fishingLocations
    .filter((location) => {
      if (!location.coordinates) return false;
      return (
        matches(location.name, term) ||
        (location.region ? matches(location.region, term) : false) ||
        (location.municipality ? matches(location.municipality, term) : false)
      );
    })
    .slice(0, limit)
    .map((location) => ({
      id: `curated-${location.id}`,
      kind: "curated" as const,
      label: location.name,
      detail: [location.region, location.municipality].filter(Boolean).join(" · ") || undefined,
      latitude: location.coordinates?.latitude,
      longitude: location.coordinates?.longitude,
    }));
}

function knownSuggestions(query: string): SpotSuggestion[] {
  return matchKnownPlaces(query).map((place) => ({
    id: `known-${place.label.toLowerCase().replace(/\s+/g, "-")}`,
    kind: "place" as const,
    label: place.label,
    detail: place.detail,
    latitude: place.latitude,
    longitude: place.longitude,
  }));
}

/**
 * Known harbours first (accurate water pins), then official access names, then
 * waterbodies, then geocoded towns. A failure in any one source must not blank
 * the whole list.
 */
export async function searchSpots(query: string): Promise<SpotSuggestion[]> {
  const term = normalizePlaceQuery(query);
  if (term.length < 3) return [];

  const [waterbodies, places, access] = await Promise.allSettled([
    suggestWaterbodies(term, { limit: 4 }),
    searchPlaces(term, 4),
    searchAccessPointsByName(term, 4),
  ]);

  const suggestions: SpotSuggestion[] = [...knownSuggestions(term), ...searchCuratedSpots(term)];
  const seen = new Set(suggestions.map((entry) => entry.label.toLowerCase()));

  if (access.status === "fulfilled") {
    for (const point of access.value) {
      const label = point.evidence?.siteName ?? point.type;
      if (seen.has(label.toLowerCase())) continue;
      seen.add(label.toLowerCase());
      suggestions.push({
        id: `access-${point.id}`,
        kind: "access",
        label,
        detail: point.type,
        latitude: point.coordinates.latitude,
        longitude: point.coordinates.longitude,
      });
    }
  }

  if (waterbodies.status === "fulfilled") {
    for (const waterbody of waterbodies.value) {
      if (seen.has(waterbody.officialName.toLowerCase())) continue;
      seen.add(waterbody.officialName.toLowerCase());
      suggestions.push({
        id: `waterbody-${waterbody.waterbodyLid}`,
        kind: "waterbody",
        label: waterbody.officialName,
        detail: [
          waterbody.waterbodyType,
          waterbody.surfaceAreaHa
            ? `${Math.round(waterbody.surfaceAreaHa).toLocaleString("en-CA")} ha`
            : undefined,
          waterbody.fmz.toUpperCase(),
        ]
          .filter(Boolean)
          .join(" · "),
        waterbodyLid: waterbody.waterbodyLid,
      });
    }
  }

  if (places.status === "fulfilled") {
    for (const place of places.value) {
      if (seen.has(place.name.toLowerCase())) continue;
      seen.add(place.name.toLowerCase());
      suggestions.push({
        id: place.id,
        kind: "place",
        label: place.name,
        detail: place.region ?? "Ontario",
        latitude: place.latitude,
        longitude: place.longitude,
      });
    }
  }

  return suggestions;
}
