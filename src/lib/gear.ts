import type { BaitOption, FishingLocation, GearFit, SavedGear, SpeciesProfile } from "./types";
import { seasonForDate } from "./regulations/evaluate";
import { userGear } from "./user-gear";

export const defaultGear: SavedGear = {
  id: "ugly-stik-gx2",
  name: userGear.rodReel,
  power: "medium",
  line: "6–15 lb",
  notes: "A versatile shore spinning combo. Add a leader for pike. It is not muskie gear.",
};

export function gearFitForSpecies(species: SpeciesProfile, gear: SavedGear = defaultGear): GearFit {
  const id = species.id;
  if (id === "muskellunge") {
    return {
      level: "unsuitable",
      message: `${gear.name} is too light for muskie. Use dedicated heavy baitcasting gear or book a guided trip.`,
    };
  }
  if (id === "lake-trout" || id === "pacific-salmon") {
    return {
      level: "workable",
      message: `Shore and light trolling can work on ${gear.name}. Deep summer trolling needs heavier or specialized gear.`,
    };
  }
  if (id === "northern-pike") {
    return {
      level: "workable",
      message: `${gear.name} can handle typical shore pike if you add a wire or heavy fluorocarbon leader.`,
    };
  }
  if (id === "brook-trout" || id === "yellow-perch" || id === "crappie") {
    return {
      level: gear.power === "heavy" ? "workable" : "good",
      message: `${gear.name} is a good match if you downsize hooks, jigs, and line for these fish.`,
    };
  }
  return {
    level: "good",
    message: `${gear.name} is a reasonable match for ${species.name} from shore with the listed line and leader.`,
  };
}

export function liveBaitAllowed(location: FishingLocation) {
  const rules = `${location.baitRules} ${location.baitManagementZone ?? ""}`.toLowerCase();
  if (location.bodyType === "conservation-lake") return false;
  if (
    /no live bait|prohibits live|live baitfish|live fish may not|artificial lures only|worms and artificial|live bait except worms/.test(
      rules,
    )
  ) {
    return false;
  }
  return "uncertain" as const;
}

export function baitsForTrip(
  species: SpeciesProfile,
  location: FishingLocation,
  date: string,
): Array<BaitOption & { allowed: "yes" | "verify" | "no"; reason?: string }> {
  const season = seasonForDate(date);
  const livePolicy = liveBaitAllowed(location);
  return species.baits
    .filter((bait) => season === "unknown" || bait.seasons.includes(season))
    .map((bait) => {
      if (bait.kind === "artificial") return { ...bait, allowed: "yes" as const };
      if (livePolicy === false && bait.liveBaitWarning) {
        return {
          ...bait,
          allowed: "no" as const,
          reason: "This property or waterbody does not allow that live bait. Use worms only if posted, or artificial lures.",
        };
      }
      if (bait.liveBaitWarning || livePolicy === "uncertain") {
        return {
          ...bait,
          allowed: "verify" as const,
          reason: "Natural or live bait is never suggested as ready-to-use. Confirm BMZ transport, species, and property rules.",
        };
      }
      return { ...bait, allowed: "verify" as const, reason: "Confirm posted bait rules before using natural bait." };
    });
}

export function tackleChecklist(species: SpeciesProfile, fit: GearFit) {
  const items = [
    `${species.name} hooks or jigs in the listed sizes`,
    "Needle-nose pliers and line cutters",
    "PFD for exposed shore, ice, boat, or kayak",
  ];
  if (species.gear.leader) items.push(species.gear.leader);
  if (fit.level !== "good") items.push("Backup plan or heavier/lighter outfit if the fish is a poor match");
  if (species.baits.some((bait) => bait.kind === "artificial")) items.push("A small selection of the listed artificial lures");
  return items;
}
