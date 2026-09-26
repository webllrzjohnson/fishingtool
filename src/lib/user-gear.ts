import { defaultOutfit } from "@/lib/gear/default-outfit";
import { evaluateOutfitSummary } from "@/lib/gear/evaluate";

export const userGear = {
  rodReel: defaultOutfit.name,
  rodReelSummary: evaluateOutfitSummary(defaultOutfit),
  licence: "Ontario Outdoors Card + Ontario Sport Fishing Licence",
  defaultArea: "Toronto / GTA",
} as const;
