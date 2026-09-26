import type { TechniqueProfile } from "@/lib/gear/types";

export const techniqueProfiles: readonly TechniqueProfile[] = [
  {
    id: "shore-casting",
    label: "Shore casting",
    summary: "Casting lures or bait from accessible shoreline.",
    speciesIds: [
      "largemouth-bass",
      "smallmouth-bass",
      "walleye",
      "northern-pike",
      "yellow-perch",
      "carp",
      "channel-catfish",
    ],
    preferredPowers: ["medium", "medium-heavy"],
    preferredReelTypes: ["spinning"],
    minLineLb: 6,
    maxLineLb: 20,
  },
  {
    id: "finesse-jig",
    label: "Finesse jigging",
    summary: "Light jigs, drop-shot, and small presentations.",
    speciesIds: ["yellow-perch", "crappie", "smallmouth-bass", "walleye", "brook-trout"],
    preferredPowers: ["ultra-light", "light", "medium-light", "medium"],
    preferredReelTypes: ["spinning"],
    minLineLb: 4,
    maxLineLb: 12,
  },
  {
    id: "cover-power",
    label: "Cover and power fishing",
    summary: "Spinnerbaits, spoons, and weedless baits in cover.",
    speciesIds: ["northern-pike", "largemouth-bass", "muskellunge"],
    preferredPowers: ["medium", "medium-heavy", "heavy"],
    preferredReelTypes: ["spinning", "baitcasting"],
    minLineLb: 12,
    maxLineLb: 30,
    leaderRequired: true,
  },
  {
    id: "bottom-bait",
    label: "Bottom bait fishing",
    summary: "Sliding sinker and bottom rigs for carp and catfish.",
    speciesIds: ["carp", "channel-catfish"],
    preferredPowers: ["medium", "medium-heavy"],
    preferredReelTypes: ["spinning"],
    minLineLb: 12,
    maxLineLb: 25,
  },
  {
    id: "float-fishing",
    label: "Float fishing",
    summary: "Slip floats and drift presentations.",
    speciesIds: ["brook-trout", "rainbow-trout", "brown-trout", "crappie"],
    preferredPowers: ["light", "medium-light", "medium"],
    preferredReelTypes: ["spinning", "centerpin"],
    minLineLb: 4,
    maxLineLb: 12,
  },
  {
    id: "salmon-steelhead-shore",
    label: "Salmon and steelhead shore",
    summary: "Long casts and heavy runs from piers and river mouths.",
    speciesIds: ["pacific-salmon", "rainbow-trout", "brown-trout"],
    preferredPowers: ["medium", "medium-heavy"],
    preferredReelTypes: ["spinning"],
    minLineLb: 10,
    maxLineLb: 25,
    leaderRequired: true,
  },
  {
    id: "ice-jigging",
    label: "Ice jigging",
    summary: "Short rods through the ice.",
    speciesIds: ["yellow-perch", "crappie", "walleye", "northern-pike", "lake-whitefish"],
    preferredPowers: ["ultra-light", "light", "medium", "heavy"],
    preferredReelTypes: ["spinning", "inline-ice"],
    minLineLb: 2,
    maxLineLb: 12,
  },
  {
    id: "fly-fishing",
    label: "Fly fishing",
    summary: "Dedicated fly rod and reel system.",
    speciesIds: ["brook-trout", "brown-trout", "rainbow-trout", "pacific-salmon"],
    preferredPowers: ["light", "medium"],
    preferredReelTypes: ["fly"],
    leaderRequired: true,
  },
  {
    id: "trolling",
    label: "Trolling",
    summary: "Boat trolling with divers, boards, or spoons.",
    speciesIds: ["lake-trout", "pacific-salmon", "walleye"],
    preferredPowers: ["medium", "medium-heavy"],
    preferredReelTypes: ["line-counter", "baitcasting"],
    minLineLb: 12,
    maxLineLb: 20,
  },
  {
    id: "muskie-casting",
    label: "Muskie casting",
    summary: "Heavy baitcasting for large muskie baits.",
    speciesIds: ["muskellunge"],
    preferredPowers: ["heavy", "extra-heavy"],
    preferredReelTypes: ["baitcasting", "line-counter"],
    minLineLb: 65,
    maxLineLb: 100,
    leaderRequired: true,
    specialtySafetyGear: ["Large coated net", "Long pliers", "Heavy hook cutters"],
  },
];

export function getTechniqueProfile(id: string) {
  return techniqueProfiles.find((profile) => profile.id === id);
}

export function techniquesForSpecies(speciesId: string) {
  return techniqueProfiles.filter((profile) => profile.speciesIds.includes(speciesId));
}

export function defaultTechniqueForSpecies(speciesId: string) {
  const matches = techniquesForSpecies(speciesId);
  return matches[0]?.id;
}
