import { z } from "zod";
import { sourceSchema } from "@/lib/schemas";

const rodPowerSchema = z.enum([
  "ultra-light",
  "light",
  "medium-light",
  "medium",
  "medium-heavy",
  "heavy",
  "extra-heavy",
]);

const rodActionSchema = z.enum(["slow", "moderate", "moderate-fast", "fast", "extra-fast"]);

const reelTypeSchema = z.enum([
  "spinning",
  "baitcasting",
  "spincast",
  "centerpin",
  "fly",
  "line-counter",
  "inline-ice",
]);

const lineMaterialSchema = z.enum(["mono", "fluoro", "braid", "fly-line"]);

export const gearRodSchema = z.object({
  lengthFt: z.number().min(1).max(15),
  lengthIn: z.number().min(0).max(11).optional(),
  power: rodPowerSchema,
  action: rodActionSchema.optional(),
  pieces: z.number().int().min(1).max(4).optional(),
  lineRatingMinLb: z.number().positive().optional(),
  lineRatingMaxLb: z.number().positive().optional(),
  lureRatingMinOz: z.number().positive().optional(),
  lureRatingMaxOz: z.number().positive().optional(),
});

export const gearReelSchema = z.object({
  type: reelTypeSchema,
  sizeLabel: z.string().min(1),
  gearRatio: z.string().optional(),
  maxDragLb: z.number().positive().optional(),
  monoCapacity: z.string().optional(),
});

export const gearLineSchema = z.object({
  material: lineMaterialSchema,
  testLb: z.string().min(1),
});

export const gearLeaderSchema = z.object({
  material: lineMaterialSchema,
  testLb: z.string().min(1),
  length: z.string().optional(),
});

export const gearOutfitSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  rod: gearRodSchema,
  reel: gearReelSchema,
  line: gearLineSchema,
  leader: gearLeaderSchema.optional(),
  safetyGear: z.array(z.string()).optional(),
  notes: z.string().optional(),
  isDefault: z.boolean().optional(),
  templateId: z.string().optional(),
  source: sourceSchema.optional(),
  confidence: z.enum(["high", "medium", "low"]).optional(),
});

export const userGearStateSchema = z.object({
  version: z.literal(1),
  outfits: z.array(gearOutfitSchema).min(1),
  defaultOutfitId: z.string().min(1),
});
