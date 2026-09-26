import { defaultOutfit } from "@/lib/gear/default-outfit";
import type { GearOutfit } from "@/lib/gear/types";

export function resolveOutfit(outfits: readonly GearOutfit[], outfitId?: string): GearOutfit {
  if (outfitId) {
    const match = outfits.find((outfit) => outfit.id === outfitId);
    if (match) return match;
  }
  const defaultMatch = outfits.find((outfit) => outfit.isDefault);
  return defaultMatch ?? outfits[0] ?? defaultOutfit;
}

export function outfitToSavedGear(outfit: GearOutfit) {
  const line =
    outfit.rod.lineRatingMinLb && outfit.rod.lineRatingMaxLb
      ? `${outfit.rod.lineRatingMinLb}–${outfit.rod.lineRatingMaxLb} lb`
      : outfit.line.testLb;
  const power = outfit.rod.power === "medium-light" || outfit.rod.power === "ultra-light"
    ? "medium"
    : outfit.rod.power === "extra-heavy"
      ? "heavy"
      : outfit.rod.power;
  return {
    id: outfit.id,
    name: outfit.name,
    power,
    line,
    notes: outfit.notes,
  };
}
