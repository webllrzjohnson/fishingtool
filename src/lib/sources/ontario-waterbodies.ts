import { z } from "zod";
import { parseOntarioGisDate } from "@/lib/sources/ontario-gis";
import { araSource } from "@/lib/sources";
import { parseSpeciesSummary } from "@/lib/waterbodies/species-map";
import type { Coordinates, FmzId, OfficialWaterbody } from "@/lib/types";

const BASE_URL =
  "https://ws.lioservices.lrc.gov.on.ca/arcgis2/rest/services/LIO_OPEN_DATA/LIO_Open07/MapServer";

const ARA_POLY_LAYER = 2;
const ARA_LINE_LAYER = 1;

const WATERBODY_LID_PATTERN = /^\d{2}-\d{4}-\d{5}$/;

const featureSchema = z.object({
  attributes: z.record(z.string(), z.unknown()),
  geometry: z
    .object({
      x: z.number().optional(),
      y: z.number().optional(),
      rings: z.array(z.array(z.array(z.number()))).optional(),
    })
    .optional(),
});

const responseSchema = z.object({
  features: z.array(featureSchema).default([]),
  exceededTransferLimit: z.boolean().optional(),
});

const extentSchema = z.object({
  extent: z
    .object({
      xmin: z.number(),
      ymin: z.number(),
      xmax: z.number(),
      ymax: z.number(),
    })
    .optional(),
});

const DEFAULT_TIMEOUT_MS = 8_000;

function fetchOptions(timeoutMs = DEFAULT_TIMEOUT_MS) {
  return {
    signal: AbortSignal.timeout(timeoutMs),
    next: { revalidate: 86_400 },
  } as const;
}

function optionalText(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === "unknown") return undefined;
  return trimmed;
}

function optionalNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function toFmzId(zone: unknown): FmzId | undefined {
  const parsed = optionalNumber(zone);
  if (parsed === undefined) return undefined;
  return `fmz-${Math.round(parsed)}`;
}

export function validateWaterbodyLid(lid: string) {
  return WATERBODY_LID_PATTERN.test(lid);
}

export function escapeSqlLiteral(value: string) {
  return value.replace(/'/g, "''");
}

export function extentCenter(extent: { xmin: number; ymin: number; xmax: number; ymax: number }): Coordinates {
  return {
    latitude: (extent.ymin + extent.ymax) / 2,
    longitude: (extent.xmin + extent.xmax) / 2,
  };
}

function parseFeature(
  attributes: Record<string, unknown>,
  options?: { matchConfidence?: OfficialWaterbody["matchConfidence"]; matchDistanceM?: number },
): OfficialWaterbody | null {
  const waterbodyLid = optionalText(attributes.WATERBODY_LID);
  const officialName = optionalText(attributes.OFFICIAL_WATERBODY_NAME);
  const fmz = toFmzId(attributes.FISHERIES_MANAGEMENT_ZONE_ID);
  if (!waterbodyLid || !officialName || !fmz) return null;

  const aliases = [
    optionalText(attributes.WATERBODY_ALIAS_NAME1),
    optionalText(attributes.WATERBODY_ALIAS_NAME2),
  ].filter(Boolean) as string[];

  const corporateName = optionalText(attributes.CORPORATE_WATERBODY_NAME);
  const speciesSummary = optionalText(attributes.FISH_SPECIES_SUMMARY);

  return {
    waterbodyLid,
    araIdent: optionalText(attributes.ARA_IDENT),
    araSummaryId: optionalNumber(attributes.ARA_SUMMARY_ID),
    ogfId: optionalNumber(attributes.OGF_ID),
    officialName,
    corporateName: corporateName && corporateName !== officialName ? corporateName : undefined,
    aliases,
    waterbodyType: optionalText(attributes.WATERBODY_TYPE) ?? "Unknown",
    fmz,
    thermalRegime: optionalText(attributes.THERMAL_REGIME),
    thermalRegimeReason: optionalText(attributes.THERMAL_REGIME_REASON),
    species: parseSpeciesSummary(speciesSummary),
    surfaceAreaHa: optionalNumber(attributes.SURFACE_AREA),
    maxDepthM: optionalNumber(attributes.MAXIMUM_DEPTH),
    meanDepthM: optionalNumber(attributes.MEAN_DEPTH),
    secchiDepthM: optionalNumber(attributes.SECCHI_DEPTH),
    morphoedaphicIndex: optionalNumber(attributes.MORPHOEDAPHIC_INDEX),
    spatialVerification: optionalText(attributes.SPATIAL_VERIFICATION_FLG),
    effectiveDate: parseOntarioGisDate(attributes.EFFECTIVE_DATETIME),
    source: araSource,
    matchConfidence: options?.matchConfidence,
    matchDistanceM: options?.matchDistanceM,
  };
}

export function parseWaterbodyFeatures(
  raw: unknown,
  options?: { matchConfidence?: OfficialWaterbody["matchConfidence"]; matchDistanceM?: number },
): OfficialWaterbody[] {
  const data = responseSchema.parse(raw);
  const byLid = new Map<string, OfficialWaterbody>();

  for (const feature of data.features) {
    const parsed = parseFeature(feature.attributes, options);
    if (!parsed) continue;
    const existing = byLid.get(parsed.waterbodyLid);
    if (!existing) {
      byLid.set(parsed.waterbodyLid, parsed);
      continue;
    }
    const existingArea = existing.surfaceAreaHa ?? 0;
    const nextArea = parsed.surfaceAreaHa ?? 0;
    if (nextArea > existingArea) {
      byLid.set(parsed.waterbodyLid, parsed);
    }
  }

  return [...byLid.values()].sort((left, right) => left.officialName.localeCompare(right.officialName));
}

export function parseWaterbodySearchResult(raw: unknown) {
  const data = responseSchema.parse(raw);
  return {
    waterbodies: parseWaterbodyFeatures(raw),
    exceededTransferLimit: Boolean(data.exceededTransferLimit),
  };
}

async function queryLayer(layerId: number, params: URLSearchParams, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const response = await fetch(`${BASE_URL}/${layerId}/query?${params}`, fetchOptions(timeoutMs));
  if (!response.ok) throw new Error(`Ontario GIS returned ${response.status}`);
  return response.json();
}

async function queryWaterbodyWhere(where: string, layerId = ARA_POLY_LAYER) {
  const params = new URLSearchParams({
    f: "json",
    where,
    outFields: "*",
    returnGeometry: "false",
    resultRecordCount: "50",
  });
  const raw = await queryLayer(layerId, params);
  const parsed = parseWaterbodyFeatures(raw);
  if (parsed.length || layerId !== ARA_POLY_LAYER) return parsed;
  const lineParams = new URLSearchParams(params);
  const lineRaw = await queryLayer(ARA_LINE_LAYER, lineParams);
  return parseWaterbodyFeatures(lineRaw);
}

export async function fetchWaterbodyExtent(lid: string): Promise<Coordinates | undefined> {
  if (!validateWaterbodyLid(lid)) return undefined;
  const params = new URLSearchParams({
    f: "json",
    where: `WATERBODY_LID='${escapeSqlLiteral(lid)}'`,
    returnExtentOnly: "true",
    outSR: "4326",
  });
  const raw = await queryLayer(ARA_POLY_LAYER, params);
  const extent = extentSchema.parse(raw).extent;
  if (!extent) {
    const lineRaw = await queryLayer(ARA_LINE_LAYER, params);
    const lineExtent = extentSchema.parse(lineRaw).extent;
    return lineExtent ? extentCenter(lineExtent) : undefined;
  }
  return extentCenter(extent);
}

export async function fetchWaterbodyByLid(lid: string): Promise<OfficialWaterbody | null> {
  if (!validateWaterbodyLid(lid)) return null;
  const where = `WATERBODY_LID='${escapeSqlLiteral(lid)}'`;
  const polyResults = await queryWaterbodyWhere(where, ARA_POLY_LAYER);
  const results = polyResults.length ? polyResults : await queryWaterbodyWhere(where, ARA_LINE_LAYER);
  const waterbody = results[0];
  if (!waterbody) return null;
  const coordinates = await fetchWaterbodyExtent(lid);
  return coordinates ? { ...waterbody, coordinates } : waterbody;
}

const SEARCH_OUT_FIELDS =
  "WATERBODY_LID,OFFICIAL_WATERBODY_NAME,WATERBODY_TYPE,FISHERIES_MANAGEMENT_ZONE_ID,THERMAL_REGIME,FISH_SPECIES_SUMMARY,SURFACE_AREA,MAXIMUM_DEPTH,MEAN_DEPTH";

const SUGGEST_OUT_FIELDS =
  "WATERBODY_LID,OFFICIAL_WATERBODY_NAME,WATERBODY_TYPE,FISHERIES_MANAGEMENT_ZONE_ID,SURFACE_AREA";

/** The ARA service runs on a case-sensitive backend, so both sides are upper-cased. */
function nameWhere(term: string, options: { prefixOnly?: boolean; fmz?: number } = {}) {
  const escaped = escapeSqlLiteral(term.replace(/[%_]/g, "")).toUpperCase();
  const pattern = options.prefixOnly ? `${escaped}%` : `%${escaped}%`;
  let where = `UPPER(OFFICIAL_WATERBODY_NAME) LIKE '${pattern}'`;
  if (options.fmz) where += ` AND FISHERIES_MANAGEMENT_ZONE_ID=${options.fmz}`;
  return where;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Exact name beats a prefix, which beats a match starting on a word boundary. */
export function nameRelevance(name: string, term: string) {
  const candidate = name.toLowerCase();
  const needle = term.trim().toLowerCase();
  if (!needle) return 3;
  if (candidate === needle) return 0;
  if (candidate.startsWith(needle)) return 1;
  if (new RegExp(`\\b${escapeRegex(needle)}`).test(candidate)) return 2;
  return 3;
}

export function rankWaterbodyMatches<T extends { officialName: string; surfaceAreaHa?: number }>(
  waterbodies: T[],
  term: string,
): T[] {
  return [...waterbodies].sort((left, right) => {
    const byRelevance = nameRelevance(left.officialName, term) - nameRelevance(right.officialName, term);
    if (byRelevance !== 0) return byRelevance;
    const byArea = (right.surfaceAreaHa ?? 0) - (left.surfaceAreaHa ?? 0);
    if (byArea !== 0) return byArea;
    return left.officialName.localeCompare(right.officialName);
  });
}

export async function searchWaterbodiesByName(name: string, options?: { fmz?: number }) {
  const trimmed = name.trim();
  if (trimmed.length < 3) {
    return { waterbodies: [], exceededTransferLimit: false };
  }
  const params = new URLSearchParams({
    f: "json",
    where: nameWhere(trimmed, { fmz: options?.fmz }),
    outFields: SEARCH_OUT_FIELDS,
    returnGeometry: "false",
    resultRecordCount: "50",
    returnDistinctValues: "true",
  });
  const raw = await queryLayer(ARA_POLY_LAYER, params);
  let result = parseWaterbodySearchResult(raw);
  if (!result.waterbodies.length) {
    const lineRaw = await queryLayer(ARA_LINE_LAYER, params);
    result = parseWaterbodySearchResult(lineRaw);
  }
  return { ...result, waterbodies: rankWaterbodyMatches(result.waterbodies, trimmed) };
}

export type WaterbodySuggestion = {
  waterbodyLid: string;
  officialName: string;
  waterbodyType: string;
  fmz: FmzId;
  surfaceAreaHa?: number;
};

function parseSuggestions(raw: unknown): WaterbodySuggestion[] {
  const data = responseSchema.parse(raw);
  const byLid = new Map<string, WaterbodySuggestion>();
  for (const feature of data.features) {
    const waterbodyLid = optionalText(feature.attributes.WATERBODY_LID);
    const officialName = optionalText(feature.attributes.OFFICIAL_WATERBODY_NAME);
    const fmz = toFmzId(feature.attributes.FISHERIES_MANAGEMENT_ZONE_ID);
    if (!waterbodyLid || !officialName || !fmz || byLid.has(waterbodyLid)) continue;
    byLid.set(waterbodyLid, {
      waterbodyLid,
      officialName,
      fmz,
      waterbodyType: optionalText(feature.attributes.WATERBODY_TYPE) ?? "Unknown",
      surfaceAreaHa: optionalNumber(feature.attributes.SURFACE_AREA),
    });
  }
  return [...byLid.values()];
}

/**
 * Typeahead lookup. Prefix matches are queried first so a broad word like "lake"
 * surfaces Lake Simcoe and Lake Nipigon rather than an alphabetical run of small lakes.
 */
export async function suggestWaterbodies(
  name: string,
  options?: { fmz?: number; limit?: number },
): Promise<WaterbodySuggestion[]> {
  const trimmed = name.trim();
  if (trimmed.length < 3) return [];
  const limit = options?.limit ?? 8;

  const query = (prefixOnly: boolean) =>
    queryLayer(
      ARA_POLY_LAYER,
      new URLSearchParams({
        f: "json",
        where: nameWhere(trimmed, { prefixOnly, fmz: options?.fmz }),
        outFields: SUGGEST_OUT_FIELDS,
        returnGeometry: "false",
        resultRecordCount: String(limit * 3),
        returnDistinctValues: "true",
      }),
      5_000,
    );

  const collected = new Map<string, WaterbodySuggestion>();
  for (const prefixOnly of [true, false]) {
    if (collected.size >= limit) break;
    const found = parseSuggestions(await query(prefixOnly));
    for (const entry of found) {
      if (!collected.has(entry.waterbodyLid)) collected.set(entry.waterbodyLid, entry);
    }
  }

  return rankWaterbodyMatches([...collected.values()], trimmed).slice(0, limit);
}

/**
 * Finds waterbodies whose Ontario species summary lists a species. Largest waters first,
 * since the summary field carries no abundance information to rank on.
 */
export async function searchWaterbodiesBySpecies(
  species: string,
  options?: { fmz?: number; limit?: number },
): Promise<WaterbodySuggestion[]> {
  const trimmed = species.trim();
  if (trimmed.length < 3) return [];
  const limit = options?.limit ?? 25;
  const escaped = escapeSqlLiteral(trimmed.replace(/[%_]/g, "")).toUpperCase();
  let where = `UPPER(FISH_SPECIES_SUMMARY) LIKE '%${escaped}%'`;
  if (options?.fmz) where += ` AND FISHERIES_MANAGEMENT_ZONE_ID=${options.fmz}`;

  const raw = await queryLayer(
    ARA_POLY_LAYER,
    new URLSearchParams({
      f: "json",
      where,
      outFields: SUGGEST_OUT_FIELDS,
      returnGeometry: "false",
      resultRecordCount: String(limit * 4),
      returnDistinctValues: "true",
    }),
  );

  return parseSuggestions(raw)
    .sort((left, right) => {
      const byArea = (right.surfaceAreaHa ?? 0) - (left.surfaceAreaHa ?? 0);
      return byArea !== 0 ? byArea : left.officialName.localeCompare(right.officialName);
    })
    .slice(0, limit);
}

async function queryWaterbodyAtPoint(
  latitude: number,
  longitude: number,
  distanceM?: number,
): Promise<OfficialWaterbody[]> {
  const params = new URLSearchParams({
    f: "json",
    where: "FISH_SPECIES_SUMMARY IS NOT NULL",
    geometry: `${longitude},${latitude}`,
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "*",
    returnGeometry: "false",
    resultRecordCount: "25",
  });
  if (distanceM) {
    params.set("distance", String(distanceM));
    params.set("units", "esriSRUnit_Meter");
  }
  const raw = await queryLayer(ARA_POLY_LAYER, params);
  const poly = parseWaterbodyFeatures(raw, {
    matchConfidence: distanceM ? "nearby" : "exact",
    matchDistanceM: distanceM,
  });
  if (poly.length) return poly;
  const lineRaw = await queryLayer(ARA_LINE_LAYER, params);
  return parseWaterbodyFeatures(lineRaw, {
    matchConfidence: distanceM ? "nearby" : "exact",
    matchDistanceM: distanceM,
  });
}

export async function fetchWaterbodyForPoint(
  latitude: number,
  longitude: number,
  options?: { maxDistanceM?: number },
): Promise<OfficialWaterbody | null> {
  const distances = [250, 1000, 2000, 5000, 10000, 0];
  const maxDistanceM = options?.maxDistanceM ?? 10000;
  for (const distanceM of distances.filter((distance) => distance <= maxDistanceM || distance === 0)) {
    const nearby = await queryWaterbodyAtPoint(
      latitude,
      longitude,
      distanceM === 0 ? undefined : distanceM,
    );
    if (!nearby.length) continue;
    const best = nearby
      .sort((left, right) => (right.surfaceAreaHa ?? 0) - (left.surfaceAreaHa ?? 0))[0];
    if (!best) continue;
    const coordinates = await fetchWaterbodyExtent(best.waterbodyLid);
    return {
      ...best,
      coordinates,
      matchConfidence: distanceM === 0 ? "exact" : "nearby",
      matchDistanceM: distanceM === 0 ? undefined : distanceM,
    };
  }

  return null;
}
