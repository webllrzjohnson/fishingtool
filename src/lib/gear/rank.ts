import { evaluateOutfit } from "@/lib/gear/evaluate";
import type { FishingTechnique, GearOutfit, RankedOutfit } from "@/lib/gear/types";
import type { SpeciesProfile } from "@/lib/types";

const STATUS_ORDER = {
  "best-match": 0,
  "works-with-compromises": 1,
  "missing-component": 2,
  "outside-rating": 3,
} as const;

export function rankOutfits(
  outfits: readonly GearOutfit[],
  species: SpeciesProfile,
  technique?: FishingTechnique,
): RankedOutfit[] {
  return outfits
    .map((outfit) => ({
      outfit,
      fit: evaluateOutfit(outfit, species, technique),
    }))
    .sort((left, right) => {
      const statusDiff = STATUS_ORDER[left.fit.status] - STATUS_ORDER[right.fit.status];
      if (statusDiff !== 0) return statusDiff;
      if (left.outfit.isDefault && !right.outfit.isDefault) return -1;
      if (!left.outfit.isDefault && right.outfit.isDefault) return 1;
      return left.outfit.name.localeCompare(right.outfit.name);
    });
}

export function bestOutfit(
  outfits: readonly GearOutfit[],
  species: SpeciesProfile,
  technique?: FishingTechnique,
) {
  const ranked = rankOutfits(outfits, species, technique);
  return ranked[0];
}
