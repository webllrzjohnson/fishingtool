import { fmzLabels, rulesForFmz } from "./fmz-rules";
import { getLocationById } from "./fishing-locations";
import { officialSources } from "./official-sources";
import { tackleForTargets } from "./tackle-guide";
import { defaultOutfit } from "@/lib/gear/default-outfit";
import { evaluateOutfitSummary } from "@/lib/gear/evaluate";
import { resolveOutfit } from "@/lib/gear/resolve";
import type { GearOutfit } from "@/lib/gear/types";
import type { FishingReport, LicenceType } from "./types";
import { inferBaitManagementZone } from "./catalog";

const globalVerifyBeforeKeeping = [
  "Exact waterbody on Fish ON-Line",
  "Current FMZ and any waterbody-specific exceptions",
  "Species, season, size limit, and sanctuary dates for today",
  "Bait restrictions for the waterbody and bait-management zone",
  "Posted park / TRCA / municipal access and fishing signs",
];

const globalSafetyCautions = [
  "City of Toronto: shore anglers can use one rod and reel only; no nets.",
  "Lake sturgeon is closed all year in many southern and Great Lakes zones.",
  "Community apps are bite reports only — not legal sources for limits or seasons.",
];

function licenceLabel(type: LicenceType) {
  return type === "conservation" ? "Conservation" : "Sport";
}

export function buildFishingReport(
  locationId: string,
  options?: {
    outfit?: GearOutfit;
    licenceType?: LicenceType;
  },
): FishingReport | null {
  const location = getLocationById(locationId);
  if (!location) return null;

  const outfit = options?.outfit ?? defaultOutfit;
  const licenceType = options?.licenceType ?? "sport";

  const licenceReminders = [
    `Your setup: ${outfit.name} (${evaluateOutfitSummary(outfit)})`,
    `Licence: Ontario Outdoors Card + Ontario ${licenceLabel(licenceType)} Fishing Licence — ${licenceLabel(licenceType)} limits apply where seasons allow.`,
    "Carry Outdoors Card + official licence PDF (not a screenshot).",
    "Legal to keep ≠ advisable to eat — check Ontario Guide to Eating Fish.",
  ];

  const baitAndParkRules = [
    location.baitRules,
    location.baitManagementZone ?? inferBaitManagementZone(location.fmz),
    location.bodyType === "conservation-lake"
      ? "TRCA conservation areas: worms and artificial lures only unless a property says otherwise."
      : "Check posted signs on public lands for where fishing is allowed.",
  ];

  return {
    location,
    fmzLabel: location.fmzNote ?? fmzLabels[location.fmz] ?? location.fmz.toUpperCase(),
    speciesForZone: rulesForFmz(location.fmz),
    tackleForTargets: tackleForTargets(location.beginnerTargets),
    licenceReminders,
    baitAndParkRules,
    safetyCautions: [...location.cautions, ...globalSafetyCautions],
    verifyBeforeKeeping: globalVerifyBeforeKeeping,
    officialSources: [...officialSources],
  };
}

export function buildFishingReportFromTrip(
  locationId: string,
  trip: {
    selectedGearId?: string;
    licenceType?: LicenceType;
    outfits?: readonly GearOutfit[];
  },
) {
  const outfit = resolveOutfit(trip.outfits ?? [defaultOutfit], trip.selectedGearId);
  return buildFishingReport(locationId, {
    outfit,
    licenceType: trip.licenceType,
  });
}

export function formatReportText(report: FishingReport): string {
  const lines: string[] = [
    `Ontario fishing report — ${report.location.name}`,
    "",
    "ACCESS",
    report.location.accessNotes,
    "",
    "WATER BODY",
    report.location.bodyType.replaceAll("-", " "),
    "",
    "FMZ",
    report.fmzLabel,
    "",
    "EXPECTED SPECIES (opportunity, not permission to keep)",
    ...report.location.expectedSpecies.map((s) => `- ${s}`),
    "",
    "BEST TARGETS FOR YOUR ROD",
    ...report.location.beginnerTargets.map((t) => `- ${t}`),
    "",
    "TACKLE SUGGESTIONS",
    ...report.tackleForTargets.map((t) => `- ${t.target}: ${t.setup}`),
    report.location.tackleNotes,
    "",
    `SPORT LICENCE RULES (${report.location.fmz.toUpperCase()} zone-wide — verify exceptions)`,
    ...report.speciesForZone.map((rule) => {
      const size = rule.sizeNote ? ` (${rule.sizeNote})` : "";
      return `- ${rule.species}: ${rule.season} — ${rule.sportLimit}${size}`;
    }),
    "",
    "BAIT & PARK RULES",
    ...report.baitAndParkRules.map((r) => `- ${r}`),
    "",
    "CAUTIONS",
    ...report.safetyCautions.map((c) => `- ${c}`),
    "",
    "VERIFY BEFORE KEEPING FISH",
    ...report.verifyBeforeKeeping.map((v) => `- ${v}`),
    "",
    "OFFICIAL SOURCES",
    ...report.officialSources.map((s) => `- ${s.label}: ${s.url}`),
  ];

  return lines.join("\n");
}
