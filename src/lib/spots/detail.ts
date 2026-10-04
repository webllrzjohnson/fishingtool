import { fmzRegulationUrl, fishOnlineWaterbodyUrl } from "@/lib/sources";
import { fetchNearbyAccessPoints, fetchStockingByWaterbody } from "@/lib/sources/ontario-gis";
import { fetchWaterbodyForPoint } from "@/lib/sources/ontario-waterbodies";
import { fetchWaterbodyContext } from "@/lib/sources/fish-online";
import { targetableSpecies } from "@/lib/waterbodies/species-map";
import type { AccessPoint, OfficialWaterbody } from "@/lib/types";

/**
 * Everything one spot needs, resolved in a single request.
 *
 * The caller's coordinates stay authoritative throughout: the waterbody is reported as
 * context for the place, and the map is never recentred on a waterbody's extent centroid,
 * which for a large lake can sit over a hundred kilometres from where the person searched.
 */
export type SpotDetail = {
  name: string;
  latitude: number;
  longitude: number;
  water?: {
    officialName: string;
    waterbodyLid: string;
    waterbodyType: string;
    fishOnlineUrl: string;
  } & ({
    /** Search radius, not measured distance to the shoreline. */
    matchDistanceM?: number;
    matchConfidence: "nearby";
  } | {
    matchConfidence: "exact";
    fmz: string;
    thermalRegime?: string;
    surfaceAreaHa?: number;
    maxDepthM?: number;
    meanDepthM?: number;
    baitManagementZone?: string;
    municipality?: string;
    fmzRegulationUrl: string;
  });
  species: { name: string; catalogSpeciesId?: string; game: boolean }[];
  accessPoints: AccessPoint[];
  stocking: { species: string; year?: number; numberStocked?: number }[];
  /** Records which lookups failed so the UI can say so instead of showing nothing. */
  unavailable: string[];
};

export function toWater(
  waterbody: OfficialWaterbody,
  context: { baitManagementZone?: string; municipality?: string },
): NonNullable<SpotDetail["water"]> {
  const base = {
    officialName: waterbody.officialName,
    waterbodyLid: waterbody.waterbodyLid,
    waterbodyType: waterbody.waterbodyType,
    fishOnlineUrl: fishOnlineWaterbodyUrl(waterbody.waterbodyLid),
  };
  if (waterbody.matchConfidence !== "exact") {
    return { ...base, matchConfidence: "nearby", matchDistanceM: waterbody.matchDistanceM };
  }
  const zone = waterbody.fmz.replace("fmz-", "");
  return {
    ...base,
    matchConfidence: "exact",
    fmz: waterbody.fmz,
    thermalRegime: waterbody.thermalRegime,
    surfaceAreaHa: waterbody.surfaceAreaHa,
    maxDepthM: waterbody.maxDepthM,
    meanDepthM: waterbody.meanDepthM,
    baitManagementZone: context.baitManagementZone,
    municipality: context.municipality,
    fmzRegulationUrl: fmzRegulationUrl(zone),
  };
}

export async function fetchSpotDetail(
  name: string,
  latitude: number,
  longitude: number,
): Promise<SpotDetail> {
  const unavailable: string[] = [];

  const [waterResult, accessResult, contextResult] = await Promise.allSettled([
    fetchWaterbodyForPoint(latitude, longitude, { maxDistanceM: 4_000 }),
    // 8 km keeps Port Hope on its marina instead of pulling Rice Lake launches 20 km inland.
    fetchNearbyAccessPoints(latitude, longitude, 8),
    fetchWaterbodyContext(latitude, longitude),
  ]);

  if (waterResult.status === "rejected") unavailable.push("water");
  if (accessResult.status === "rejected") unavailable.push("access");

  const waterbody = waterResult.status === "fulfilled" ? waterResult.value : null;
  const context = contextResult.status === "fulfilled" ? contextResult.value : {};

  let stocking: SpotDetail["stocking"] = [];
  if (waterbody?.matchConfidence === "exact") {
    const stockingResult = await Promise.allSettled([
      fetchStockingByWaterbody(waterbody.waterbodyLid),
    ]);
    if (stockingResult[0].status === "fulfilled") {
      stocking = stockingResult[0].value.slice(0, 8).map((record) => ({
        species: record.species,
        year: record.year,
        numberStocked: record.numberStocked,
      }));
    } else {
      unavailable.push("stocking");
    }
  }

  const exactWaterbody = waterbody?.matchConfidence === "exact" ? waterbody : null;
  const game = new Set(targetableSpecies(exactWaterbody?.species ?? []).map((entry) => entry.name));

  return {
    name,
    latitude,
    longitude,
    water: waterbody ? toWater(waterbody, context) : undefined,
    species: (exactWaterbody?.species ?? []).map((entry) => ({
      name: entry.name,
      catalogSpeciesId: entry.catalogSpeciesId,
      game: game.has(entry.name),
    })),
    accessPoints: accessResult.status === "fulfilled" ? accessResult.value.slice(0, 6) : [],
    stocking,
    unavailable,
  };
}
