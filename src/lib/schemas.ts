import { z } from "zod";

export const sourceSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  lastVerified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  kind: z.enum(["official", "provincial-tourism", "local-authority", "curated"]),
});

export const coordinatesSchema = z.object({
  latitude: z.number().min(41).max(57),
  longitude: z.number().min(-96).max(-74),
});

export const baitOptionSchema = z.object({
  name: z.string().min(1),
  kind: z.enum(["natural", "artificial"]),
  sizes: z.string().optional(),
  rig: z.string().optional(),
  technique: z.string().min(1),
  seasons: z.array(z.enum(["spring", "summer", "fall", "winter"])).min(1),
  liveBaitWarning: z.boolean().optional(),
});

export const speciesProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  aliases: z.array(z.string()),
  summary: z.string().min(1),
  habitat: z.array(z.string()).min(1),
  seasonalPattern: z.object({
    spring: z.string(),
    summer: z.string(),
    fall: z.string(),
    winter: z.string(),
  }),
  baits: z.array(baitOptionSchema).min(1),
  gear: z.object({
    power: z.string(),
    line: z.string(),
    leader: z.string().optional(),
  }),
  handling: z.string(),
  source: sourceSchema,
});

export const fishingLocationSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1).optional(),
  name: z.string().min(1),
  region: z.string().min(1).optional(),
  municipality: z.string().optional(),
  bodyType: z.string().min(1),
  fmz: z.string().regex(/^fmz-\d+$/),
  coordinates: coordinatesSchema.optional(),
  accessModes: z.array(z.string()).optional(),
  shoreSuitability: z.enum(["excellent", "good", "limited", "boat-oriented"]).optional(),
  expectedSpecies: z.array(z.string()).min(1),
  beginnerTargets: z.array(z.string()).min(1),
  tackleNotes: z.string().min(1),
  accessNotes: z.string().min(1),
  baitRules: z.string().min(1),
  cautions: z.array(z.string()).min(1),
  sources: z.array(sourceSchema).optional(),
});

export const waterbodyExceptionSchema = z.object({
  id: z.string().min(1),
  locationId: z.string().min(1),
  waterbody: z.string().min(1),
  fmz: z.string().regex(/^fmz-\d+$/),
  summary: z.string().min(1),
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  source: sourceSchema,
});
