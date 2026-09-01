import { defaultGear, gearFitForSpecies as fitSpecies } from "./gear";
import { userGear } from "./user-gear";
import type { GearFit, SpeciesProfile } from "./types";

export type GearFitView = GearFit & {
  label: string;
  detail: string;
  gear: string;
};

export function gearFitForSpecies(species: SpeciesProfile | undefined): GearFitView {
  if (!species) {
    return {
      level: "workable",
      message: "Match lure weight to the 6–15 lb rating and confirm leaders if the species has teeth or size.",
      label: "Check the setup",
      detail: "Match lure weight to the 6–15 lb rating and confirm leaders if the species has teeth or size.",
      gear: userGear.rodReel,
    };
  }
  const fit = fitSpecies(species, defaultGear);
  return {
    ...fit,
    label: fit.level === "good" ? "Good fit" : fit.level === "unsuitable" ? "Unsuitable" : "Workable",
    detail: fit.message,
    gear: defaultGear.name,
  };
}
