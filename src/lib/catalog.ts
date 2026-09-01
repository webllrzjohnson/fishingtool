import { matchSpecies } from "../data/curated/species";
import { exceptionsForLocation } from "../data/curated/exceptions";
import { fishingLocationSchema } from "./schemas";
import { fishOnlineSource } from "./sources";
import type { FishingLocation, SpeciesPresence } from "./types";

export function inferBaitManagementZone(fmz: string) {
  const zone = Number(fmz.replace("fmz-", ""));
  if ([16, 17, 18].includes(zone)) return "Southern Bait Management Zone";
  if ([13, 14, 19, 20, 9].includes(zone)) return "Great Lakes Bait Management Zone";
  if (zone <= 8) return "Northwest / Far North bait-management rules — verify";
  return "Verify bait-management zone on Ontario.ca/bait";
}

export function inferSpeciesPresence(location: FishingLocation): SpeciesPresence[] {
  const seen = new Set<string>();
  const results: SpeciesPresence[] = [];
  for (const label of location.expectedSpecies) {
    const species = matchSpecies(label);
    if (!species || seen.has(species.id)) continue;
    seen.add(species.id);
    const stocked = /stocked/i.test(label);
    results.push({
      speciesId: species.id,
      status: stocked ? "stocked" : "reported",
      confidence: stocked ? "high" : location.popularity === "featured" ? "medium" : "low",
      source: fishOnlineSource,
    });
  }
  return results;
}

export function enrichLocation(location: FishingLocation): FishingLocation {
  const note = `${location.fmzNote ?? ""} ${location.cautions.join(" ")}`.toLowerCase();
  return {
    ...location,
    slug: location.slug ?? location.id,
    baitManagementZone: location.baitManagementZone ?? inferBaitManagementZone(location.fmz),
    ambiguousBoundary:
      location.ambiguousBoundary ??
      (location.bodyType === "river-mouth" || note.includes("boundary")),
    hasWaterbodyExceptions: exceptionsForLocation(location.id).length > 0,
    species: location.species?.length ? location.species : inferSpeciesPresence(location),
  };
}

export function validateLocation(location: FishingLocation) {
  return fishingLocationSchema.safeParse(location);
}
