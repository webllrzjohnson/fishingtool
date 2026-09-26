import { defaultOutfit } from "@/lib/gear/default-outfit";
import { evaluateOutfit } from "@/lib/gear/evaluate";
import type { FishingTechnique, GearOutfit, OutfitFitView as GearFitViewType } from "@/lib/gear/types";
import type { SpeciesProfile } from "./types";

export type { OutfitFitView as GearFitView } from "@/lib/gear/types";

export function gearFitView(
  species: SpeciesProfile | undefined,
  outfit: GearOutfit = defaultOutfit,
  technique?: FishingTechnique,
): GearFitViewType {
  if (!species) {
    const lineRange =
      outfit.rod.lineRatingMinLb && outfit.rod.lineRatingMaxLb
        ? `${outfit.rod.lineRatingMinLb}–${outfit.rod.lineRatingMaxLb} lb`
        : outfit.line.testLb;
    return {
      status: "works-with-compromises",
      label: "Check the setup",
      reasons: [`Match lure weight to the ${lineRange} rating and confirm leaders if the species has teeth or size.`],
      confidence: "medium",
      level: "workable",
      detail: `Match lure weight to the ${lineRange} rating and confirm leaders if the species has teeth or size.`,
      gear: outfit.name,
      outfitId: outfit.id,
    };
  }
  const fit = evaluateOutfit(outfit, species, technique);
  return {
    ...fit,
    detail: fit.reasons.join(" "),
    gear: outfit.name,
    outfitId: outfit.id,
  };
}

/** Server-safe default fit using the seeded GX2 outfit. */
export function gearFitForSpecies(species: SpeciesProfile | undefined, technique?: FishingTechnique): GearFitViewType {
  return gearFitView(species, defaultOutfit, technique);
}
