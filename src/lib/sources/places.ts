import { z } from "zod";

/**
 * Place name lookup, so a harbour like Port Dalhousie or a town like Port Hope is
 * findable even though neither is an Aquatic Resource Area waterbody name.
 *
 * Uses the Open-Meteo geocoder, the same provider already supplying the forecast, so
 * this adds no new vendor and needs no API key.
 */
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

const responseSchema = z.object({
  results: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        country_code: z.string().nullish(),
        admin1: z.string().nullish(),
        admin2: z.string().nullish(),
        feature_code: z.string().nullish(),
        population: z.number().nullish(),
      }),
    )
    .nullish(),
});

export type Place = {
  id: string;
  name: string;
  /** Municipality or county, used to tell identically named places apart. */
  region?: string;
  latitude: number;
  longitude: number;
  population?: number;
};

/** Ontario's bounding box, so border-town matches in other provinces are excluded. */
function isInOntario(latitude: number, longitude: number) {
  return latitude >= 41.6 && latitude <= 57 && longitude >= -95.2 && longitude <= -74;
}

export async function searchPlaces(query: string, limit = 6): Promise<Place[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const params = new URLSearchParams({
    name: trimmed,
    count: "20",
    language: "en",
    format: "json",
  });

  const response = await fetch(`${GEOCODING_URL}?${params}`, {
    signal: AbortSignal.timeout(6_000),
    next: { revalidate: 604_800 },
  });
  if (!response.ok) throw new Error(`Geocoder returned ${response.status}`);

  const { results } = responseSchema.parse(await response.json());
  if (!results) return [];

  return results
    .filter((entry) => entry.country_code === "CA" && isInOntario(entry.latitude, entry.longitude))
    .map((entry) => ({
      id: `place-${entry.id}`,
      name: entry.name,
      region: entry.admin2 ?? entry.admin1 ?? undefined,
      latitude: entry.latitude,
      longitude: entry.longitude,
      population: entry.population ?? undefined,
    }))
    .sort((left, right) => (right.population ?? 0) - (left.population ?? 0))
    .slice(0, limit);
}
