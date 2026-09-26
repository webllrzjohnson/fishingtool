import type { AraSpeciesClass, OfficialWaterbodySpecies } from "@/lib/types";

const ARA_TO_CATALOG: Record<string, string> = {
  Walleye: "walleye",
  "Northern Pike": "northern-pike",
  "Largemouth Bass": "largemouth-bass",
  "Smallmouth Bass": "smallmouth-bass",
  "Yellow Perch": "yellow-perch",
  "Black Crappie": "crappie",
  "Brook Trout": "brook-trout",
  "Lake Trout": "lake-trout",
  "Rainbow Trout": "rainbow-trout",
  "Brown Trout": "brown-trout",
  "Chinook Salmon": "pacific-salmon",
  "Coho Salmon": "pacific-salmon",
  "Atlantic Salmon": "pacific-salmon",
  "Pacific Salmon": "pacific-salmon",
  Muskellunge: "muskellunge",
  "Lake Whitefish": "lake-whitefish",
  Carp: "carp",
  "Channel Catfish": "channel-catfish",
  "Brown Bullhead": "channel-catfish",
  "Rock Bass": "rock-bass",
  Pumpkinseed: "pumpkinseed",
  Bluegill: "bluegill",
};

const GAME_SPECIES = new Set([
  "Brown Bullhead",
  "Sauger",
  "Burbot",
  "Lake Sturgeon",
  "Aurora Trout",
  "Splake",
  "Tiger Trout",
  "Rainbow Smelt",
  "Round Whitefish",
  "Nipigon Cisco",
  "Cisco",
  "Bloater",
  "Blackfin Cisco",
  "Shortjaw Cisco",
  "Shortnose Cisco",
]);

const NON_GAME_PATTERNS = [
  /minnow/i,
  /shiner/i,
  /sculpin/i,
  /stickleback/i,
  /dace/i,
  /chub/i,
  /darter/i,
  /sucker/i,
  /redhorse/i,
  /lamprey/i,
  /mudminnow/i,
  /trout-perch/i,
  /carps and minnows/i,
  /sunfishes/i,
  /sticklebacks/i,
  /sculpins/i,
  /whitefish subfamily/i,
  /coregonus sp\./i,
  /alosa sp\./i,
  /ameiurus/i,
  /unidentifiable/i,
  / sp\./i,
  /subfamily/i,
  /goldfish/i,
];

/** Species worth offering in a "find waters holding X" search, as Ontario names them. */
export const ARA_SEARCHABLE_SPECIES: readonly string[] = [
  ...new Set([...Object.keys(ARA_TO_CATALOG), ...GAME_SPECIES]),
].sort((left, right) => left.localeCompare(right));

export function classifyAraSpecies(name: string): AraSpeciesClass {
  const trimmed = name.trim();
  if (!trimmed) return "non-game";
  if (ARA_TO_CATALOG[trimmed]) return "game-with-profile";
  if (GAME_SPECIES.has(trimmed)) return "game-no-profile";
  if (NON_GAME_PATTERNS.some((pattern) => pattern.test(trimmed))) return "non-game";
  if (/trout/i.test(trimmed) || /salmon/i.test(trimmed) || /bass/i.test(trimmed) || /pike/i.test(trimmed)) {
    return "game-no-profile";
  }
  return "non-game";
}

export function parseSpeciesSummary(summary?: string | null): OfficialWaterbodySpecies[] {
  if (!summary?.trim()) return [];
  const seen = new Set<string>();
  const results: OfficialWaterbodySpecies[] = [];
  for (const raw of summary.split(",")) {
    const name = raw.trim();
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    const classification = classifyAraSpecies(name);
    results.push({
      name,
      classification,
      catalogSpeciesId: ARA_TO_CATALOG[name],
    });
  }
  return results;
}

export function targetableSpecies(species: readonly OfficialWaterbodySpecies[]) {
  return species.filter((entry) => entry.classification !== "non-game");
}

export function gameSpeciesWithProfile(species: readonly OfficialWaterbodySpecies[]) {
  return species.filter((entry) => entry.classification === "game-with-profile");
}
