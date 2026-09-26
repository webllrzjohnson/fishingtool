import type { BaitOption, FishingLocation, GearFit, SpeciesProfile } from "./types";
import { defaultOutfit } from "@/lib/gear/default-outfit";
import { evaluateOutfit, toLegacyGearFit } from "@/lib/gear/evaluate";
import { outfitToSavedGear } from "@/lib/gear/resolve";
import type { FishingTechnique, GearOutfit, OutfitFitResult } from "@/lib/gear/types";
import { seasonForDate } from "./regulations/evaluate";

export const defaultGear = outfitToSavedGear(defaultOutfit);

export function gearFitForSpecies(
  species: SpeciesProfile,
  outfit: GearOutfit = defaultOutfit,
  technique?: FishingTechnique,
): GearFit {
  const result = evaluateOutfit(outfit, species, technique);
  const legacy = toLegacyGearFit(result, outfit.name);
  return {
    level: legacy.level,
    message: legacy.message,
  };
}

export function evaluateGearFit(
  species: SpeciesProfile,
  outfit: GearOutfit = defaultOutfit,
  technique?: FishingTechnique,
): OutfitFitResult {
  return evaluateOutfit(outfit, species, technique);
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

export function tackleChecklist(species: SpeciesProfile, fit: GearFit | OutfitFitResult, outfit?: GearOutfit) {
  const level = fit.level;
  const items = [
    `${species.name} hooks or jigs in the listed sizes`,
    "Needle-nose pliers and line cutters",
    "PFD for exposed shore, ice, boat, or kayak",
  ];
  if (species.gear.leader) items.push(species.gear.leader);
  if (outfit?.leader) items.push(`Rig leader: ${outfit.leader.testLb} ${outfit.leader.material}`);
  if (level !== "good") items.push("Backup plan or alternate outfit if the fish is a poor match");
  if (species.baits.some((bait) => bait.kind === "artificial")) items.push("A small selection of the listed artificial lures");
  if (outfit?.safetyGear?.length) items.push(...outfit.safetyGear);
  return items;
}
