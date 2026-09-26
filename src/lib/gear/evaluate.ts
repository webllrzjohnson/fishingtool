import { templatesForSpecies } from "@/data/curated/gear-setups";
import { defaultTechniqueForSpecies, getTechniqueProfile } from "@/lib/gear/technique-profiles";
import { formatRodLength, parseLineTestLb, powerIndex } from "@/lib/gear/power";
import type {
  FishingTechnique,
  GearOutfit,
  OutfitFitResult,
  OutfitFitStatus,
  RodPower,
} from "@/lib/gear/types";
import type { SpeciesProfile } from "@/lib/types";

function statusToLevel(status: OutfitFitStatus): OutfitFitResult["level"] {
  if (status === "best-match") return "good";
  if (status === "outside-rating") return "unsuitable";
  return "workable";
}

function statusLabel(status: OutfitFitStatus) {
  switch (status) {
    case "best-match":
      return "Good fit";
    case "works-with-compromises":
      return "Workable";
    case "outside-rating":
      return "Unsuitable";
    case "missing-component":
      return "Missing gear";
  }
}

function finalize(
  status: OutfitFitStatus,
  reasons: string[],
  confidence: OutfitFitResult["confidence"],
  suggestion?: string,
): OutfitFitResult {
  const label = statusLabel(status);
  return {
    status,
    label,
    reasons,
    confidence,
    suggestion,
    level: statusToLevel(status),
  };
}

function isIceOutfit(outfit: GearOutfit) {
  return outfit.reel.type === "inline-ice" || outfit.rod.lengthFt < 3;
}

function isFlyOutfit(outfit: GearOutfit) {
  return outfit.reel.type === "fly";
}

function isMuskieOutfit(outfit: GearOutfit) {
  const power = powerIndex(outfit.rod.power);
  return power >= powerIndex("heavy") && (outfit.reel.type === "baitcasting" || outfit.reel.type === "line-counter");
}

function powerInRange(power: RodPower, allowed: readonly RodPower[]) {
  const value = powerIndex(power);
  const min = Math.min(...allowed.map(powerIndex));
  const max = Math.max(...allowed.map(powerIndex));
  return value >= min && value <= max;
}

function powerDistance(power: RodPower, preferred: readonly RodPower[]) {
  const value = powerIndex(power);
  const distances = preferred.map((candidate) => Math.abs(powerIndex(candidate) - value));
  return Math.min(...distances);
}

export function evaluateOutfit(
  outfit: GearOutfit,
  species: SpeciesProfile,
  technique?: FishingTechnique,
): OutfitFitResult {
  const reasons: string[] = [];
  const resolvedTechnique = technique ?? defaultTechniqueForSpecies(species.id);
  const techniqueProfile = resolvedTechnique ? getTechniqueProfile(resolvedTechnique) : undefined;
  const templates = templatesForSpecies(species.id);

  if (species.id === "muskellunge") {
    if (!isMuskieOutfit(outfit)) {
      return finalize(
        "outside-rating",
        [
          `${outfit.name} is too light for muskie.`,
          "Muskie needs dedicated heavy or extra-heavy baitcasting gear, heavy braid, and a tooth-proof leader.",
        ],
        "high",
        "Use a muskie-specific outfit or book a guided trip.",
      );
    }
    const missingSafety = (techniqueProfile?.specialtySafetyGear ?? []).filter(
      (item) => !outfit.safetyGear?.some((gear) => gear.toLowerCase().includes(item.toLowerCase().split(" ")[0])),
    );
    if (missingSafety.length) {
      return finalize(
        "missing-component",
        [`Add muskie safety gear: ${missingSafety.join(", ")}.`],
        "high",
        "Pack a large coated net, long pliers, and heavy hook cutters.",
      );
    }
    return finalize("best-match", [`${outfit.name} matches muskie casting requirements.`], "high");
  }

  if (resolvedTechnique === "ice-jigging" && !isIceOutfit(outfit)) {
    return finalize(
      "outside-rating",
      ["Ice fishing needs a short ice rod and inline or small spinning reel.", `${outfit.name} is a conventional open-water outfit.`],
      "high",
      "Switch to a dedicated ice setup.",
    );
  }

  if (resolvedTechnique === "fly-fishing" && !isFlyOutfit(outfit)) {
    return finalize(
      "outside-rating",
      ["Fly fishing needs a matched fly rod and reel.", `${outfit.name} is not a fly system.`],
      "high",
      "Use a fly outfit for this technique.",
    );
  }

  if (isFlyOutfit(outfit) && resolvedTechnique !== "fly-fishing") {
    return finalize(
      "works-with-compromises",
      [`${outfit.name} is fly gear — confirm you intend fly fishing for ${species.name}.`],
      "medium",
    );
  }

  let status: OutfitFitStatus = "best-match";

  if (techniqueProfile) {
    if (!techniqueProfile.preferredReelTypes.includes(outfit.reel.type)) {
      status = "works-with-compromises";
      reasons.push(
        `${species.name} via ${techniqueProfile.label} usually uses ${techniqueProfile.preferredReelTypes.join(" or ")} reels; yours is ${outfit.reel.type}.`,
      );
    }
    const distance = powerDistance(outfit.rod.power, techniqueProfile.preferredPowers);
    if (distance === 0) {
      reasons.push(`Rod power (${outfit.rod.power}) fits ${techniqueProfile.label}.`);
    } else if (distance === 1) {
      status = status === "best-match" ? "works-with-compromises" : status;
      reasons.push(`Rod power (${outfit.rod.power}) is close for ${techniqueProfile.label}; adjust lure size and drag.`);
    } else if (distance >= 2) {
      status = "outside-rating";
      reasons.push(
        `Rod power (${outfit.rod.power}) is outside the usual ${techniqueProfile.preferredPowers.join("/")} range for ${techniqueProfile.label}.`,
      );
    }

    const lineTest = parseLineTestLb(outfit.line.testLb);
    if (lineTest !== undefined) {
      if (techniqueProfile.minLineLb && lineTest < techniqueProfile.minLineLb) {
        status = status === "outside-rating" ? status : "works-with-compromises";
        reasons.push(`Main line (${outfit.line.testLb}) may be light for ${techniqueProfile.label}.`);
      }
      if (techniqueProfile.maxLineLb && lineTest > techniqueProfile.maxLineLb) {
        status = status === "outside-rating" ? status : "works-with-compromises";
        reasons.push(`Main line (${outfit.line.testLb}) may be heavy for finesse work on ${species.name}.`);
      }
    }

    if (techniqueProfile.leaderRequired && !outfit.leader && (species.id === "northern-pike" || species.gear.leader)) {
      status = status === "outside-rating" ? status : "missing-component";
      reasons.push(`Add a leader for ${species.name} — ${species.gear.leader ?? "tooth-proof or abrasion leader recommended"}.`);
    }
  }

  if (templates.length) {
    const primary = templates[0];
    if (!powerInRange(outfit.rod.power, primary.rod.powerRange)) {
      if (status !== "outside-rating") status = "works-with-compromises";
      reasons.push(
        `Template "${primary.title}" expects ${primary.rod.powerRange.join("/")} power; yours is ${outfit.rod.power}.`,
      );
    }
  }

  if (species.id === "northern-pike") {
    status = status === "best-match" ? "works-with-compromises" : status;
    reasons.push(
      outfit.leader
        ? `${outfit.name} can handle shore pike if you rig the listed ${outfit.leader.testLb} ${outfit.leader.material} leader.`
        : `${outfit.name} can handle shore pike if you add a wire or heavy fluorocarbon leader.`,
    );
  }

  if (species.id === "lake-trout" || species.id === "pacific-salmon") {
    if (resolvedTechnique === "trolling" && outfit.reel.type !== "line-counter" && outfit.reel.type !== "baitcasting") {
      status = "works-with-compromises";
      reasons.push("Open-water trolling usually needs a line-counter or trolling-class reel.");
    } else if (status === "best-match") {
      status = "works-with-compromises";
      reasons.push(`Shore and light presentations can work on ${outfit.name}; deep summer trolling may need heavier or specialized gear.`);
    }
  }

  if (
    (species.id === "brook-trout" || species.id === "yellow-perch" || species.id === "crappie") &&
    powerIndex(outfit.rod.power) >= powerIndex("medium-heavy")
  ) {
    status = "works-with-compromises";
    reasons.push(`Downsize hooks, jigs, and line for ${species.name} on ${outfit.name}.`);
  } else if (status === "best-match" && reasons.length === 0) {
    reasons.push(`${outfit.name} is a reasonable match for ${species.name} from shore with the listed line and leader.`);
  }

  const lureMax = outfit.rod.lureRatingMaxOz;
  const lureMin = outfit.rod.lureRatingMinOz;
  if (lureMax !== undefined && lureMax < 0.25 && species.id !== "yellow-perch" && species.id !== "crappie") {
    status = status === "best-match" ? "works-with-compromises" : status;
    reasons.push(`Printed lure rating tops out around ${lureMax} oz — confirm your bait weight is within range.`);
  }
  if (lureMin !== undefined && lureMin > 0.25 && (species.id === "yellow-perch" || species.id === "crappie")) {
    status = "works-with-compromises";
    reasons.push(`Light panfish lures below the ${lureMin} oz rod rating may be hard to cast.`);
  }

  const confidence =
    outfit.confidence === "high" && templates.some((template) => template.consensus === "strong")
      ? "high"
      : outfit.confidence ?? "medium";

  const suggestion =
    status === "outside-rating" && templates[0]
      ? `Closest curated template: ${templates[0].title}.`
      : status === "missing-component" && species.gear.leader
        ? species.gear.leader
        : undefined;

  return finalize(status, reasons.length ? reasons : [`${outfit.name} fits ${species.name}.`], confidence, suggestion);
}

export function evaluateOutfitSummary(outfit: GearOutfit) {
  const length = formatRodLength(outfit.rod);
  const lineRange =
    outfit.rod.lineRatingMinLb && outfit.rod.lineRatingMaxLb
      ? `${outfit.rod.lineRatingMinLb}–${outfit.rod.lineRatingMaxLb} lb`
      : outfit.line.testLb;
  return `${length} ${outfit.rod.power} ${outfit.reel.type} · ${lineRange} · reel ${outfit.reel.sizeLabel}`;
}

/** Legacy GearFit shape for tackleChecklist and older callers. */
export function toLegacyGearFit(result: OutfitFitResult, outfitName: string) {
  return {
    level: result.level,
    message: result.reasons.join(" "),
    outfitName,
  };
}
