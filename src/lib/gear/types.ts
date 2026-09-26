import type { SourceRecord } from "@/lib/types";

export type RodPower =
  | "ultra-light"
  | "light"
  | "medium-light"
  | "medium"
  | "medium-heavy"
  | "heavy"
  | "extra-heavy";

export type RodAction = "slow" | "moderate" | "moderate-fast" | "fast" | "extra-fast";

export type ReelType =
  | "spinning"
  | "baitcasting"
  | "spincast"
  | "centerpin"
  | "fly"
  | "line-counter"
  | "inline-ice";

export type LineMaterial = "mono" | "fluoro" | "braid" | "fly-line";

export type FishingTechnique =
  | "shore-casting"
  | "finesse-jig"
  | "cover-power"
  | "bottom-bait"
  | "float-fishing"
  | "salmon-steelhead-shore"
  | "ice-jigging"
  | "fly-fishing"
  | "trolling"
  | "muskie-casting";

export type OutfitFitStatus =
  | "best-match"
  | "works-with-compromises"
  | "outside-rating"
  | "missing-component";

export type GearRod = {
  lengthFt: number;
  lengthIn?: number;
  power: RodPower;
  action?: RodAction;
  pieces?: number;
  lineRatingMinLb?: number;
  lineRatingMaxLb?: number;
  lureRatingMinOz?: number;
  lureRatingMaxOz?: number;
};

export type GearReel = {
  type: ReelType;
  /** Manufacturer size label — not normalized across brands. */
  sizeLabel: string;
  gearRatio?: string;
  maxDragLb?: number;
  monoCapacity?: string;
};

export type GearLine = {
  material: LineMaterial;
  testLb: string;
};

export type GearLeader = {
  material: LineMaterial;
  testLb: string;
  length?: string;
};

export type GearOutfit = {
  id: string;
  name: string;
  rod: GearRod;
  reel: GearReel;
  line: GearLine;
  leader?: GearLeader;
  safetyGear?: readonly string[];
  notes?: string;
  isDefault?: boolean;
  templateId?: string;
  source?: SourceRecord;
  confidence?: "high" | "medium" | "low";
};

export type UserGearState = {
  version: 1;
  outfits: GearOutfit[];
  defaultOutfitId: string;
};

export type TechniqueProfile = {
  id: FishingTechnique;
  label: string;
  summary: string;
  speciesIds: readonly string[];
  preferredPowers: readonly RodPower[];
  preferredReelTypes: readonly ReelType[];
  minLineLb?: number;
  maxLineLb?: number;
  leaderRequired?: boolean;
  specialtySafetyGear?: readonly string[];
};

export type SetupTemplate = {
  id: string;
  title: string;
  category: "shore-spinning" | "specialty" | "ice" | "fly" | "trolling";
  summary: string;
  techniques: readonly FishingTechnique[];
  speciesIds: readonly string[];
  rod: {
    lengthRange: string;
    powerRange: readonly RodPower[];
    actionNotes: string;
    lineRatingRange: string;
    lureRatingRange: string;
  };
  reel: {
    types: readonly ReelType[];
    sizeNotes: string;
    capacityNotes: string;
  };
  line: {
    mainLine: string;
    leader?: string;
  };
  safetyGear: readonly string[];
  consensus: "strong" | "variable";
  source: SourceRecord;
};

export type OutfitFitResult = {
  status: OutfitFitStatus;
  label: string;
  reasons: readonly string[];
  confidence: "high" | "medium" | "low";
  suggestion?: string;
  /** Legacy three-level fit for existing UI badges. */
  level: "good" | "workable" | "unsuitable";
};

export type OutfitFitView = OutfitFitResult & {
  detail: string;
  gear: string;
  outfitId: string;
};

export type RankedOutfit = {
  outfit: GearOutfit;
  fit: OutfitFitResult;
};
