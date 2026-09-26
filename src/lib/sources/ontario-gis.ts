import { z } from "zod";
import { withAccessPointLocation, type NearbyAccessPoint } from "@/lib/access-points";
import type { AccessPoint } from "@/lib/types";

const ACCESS_LAYER =
  "https://ws.lioservices.lrc.gov.on.ca/arcgis2/rest/services/LIO_OPEN_DATA/LIO_Open07/MapServer/15/query";

const featureSchema = z.object({
  attributes: z.record(z.string(), z.unknown()),
  geometry: z.object({ x: z.number(), y: z.number() }).optional(),
});
const responseSchema = z.object({ features: z.array(featureSchema).default([]) });

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "Fishing access";
}

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function recordedYes(value: unknown) {
  return typeof value === "string" && value.trim().toLowerCase() === "yes" ? true : undefined;
}

function recordedValue(value: unknown) {
  const parsed = optionalText(value);
  return parsed && !["unknown", "no reliable"].includes(parsed.toLowerCase()) ? parsed : undefined;
}

function officialUrl(value: unknown) {
  const parsed = optionalText(value);
  try {
    return parsed && ["http:", "https:"].includes(new URL(parsed).protocol) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export function parseOntarioGisDate(value: unknown) {
  const timestamp = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isFinite(timestamp)) return undefined;
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
}

function officialRecordUrl(ogfId: unknown) {
  if (typeof ogfId !== "number" && typeof ogfId !== "string") return undefined;
  const id = String(ogfId);
  if (!/^\d+$/.test(id)) return undefined;
  const params = new URLSearchParams({
    f: "pjson",
    where: `OGF_ID=${id}`,
    outFields: "*",
    returnGeometry: "true",
    outSR: "4326",
  });
  return `${ACCESS_LAYER}?${params}`;
}

const FMZ_LAYER =
  "https://ws.lioservices.lrc.gov.on.ca/arcgis2/rest/services/LIO_OPEN_DATA/LIO_Open07/MapServer/14/query";

export async function fetchFmzForPoint(latitude: number, longitude: number): Promise<{
  zoneId: string | null;
  source: AccessPoint["source"];
}> {
  const params = new URLSearchParams({
    f: "json",
    geometry: `${longitude},${latitude}`,
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "FISHERIES_MANAGEMENT_ZONE_ID,LOCATION_DESCR",
    returnGeometry: "false",
    resultRecordCount: "1",
  });
  const response = await fetch(`${FMZ_LAYER}?${params}`, {
    signal: AbortSignal.timeout(8_000),
    next: { revalidate: 86_400 },
  });
  if (!response.ok) throw new Error(`Ontario GIS returned ${response.status}`);
  const data = responseSchema.parse(await response.json());
  return {
    zoneId: parseFmzZoneId(data),
    source: {
      name: "Ontario Fisheries Management Zone dataset",
      url: "https://data.ontario.ca/dataset/fisheries-management-zone",
      lastVerified: "2026-08-30",
      kind: "official",
    },
  };
}

function escapeSqlLiteral(value: string) {
  return value.replace(/'/g, "''");
}

/**
 * Finds official access records by the name printed on the site, so a marina or
 * harbour can be opened even when it is not an Aquatic Resource Area waterbody.
 */
export async function searchAccessPointsByName(name: string, limit = 6): Promise<AccessPoint[]> {
  const term = name.trim().replace(/[%_]/g, "");
  if (term.length < 3) return [];
  const params = new URLSearchParams({
    f: "json",
    where: `UPPER(SITE_NAME) LIKE '%${escapeSqlLiteral(term.toUpperCase())}%'`,
    outFields: "*",
    returnGeometry: "true",
    outSR: "4326",
    resultRecordCount: String(limit),
  });
  const response = await fetch(`${ACCESS_LAYER}?${params}`, {
    signal: AbortSignal.timeout(8_000),
    next: { revalidate: 86_400 },
  });
  if (!response.ok) throw new Error(`Ontario GIS returned ${response.status}`);
  return parseAccessFeatures(await response.json());
}

export async function fetchNearbyAccessPoints(
  latitude: number,
  longitude: number,
  radiusKm = 20,
): Promise<NearbyAccessPoint[]> {
  const params = new URLSearchParams({
    f: "json",
    where: "1=1",
    geometry: `${longitude},${latitude}`,
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    outSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    distance: String(Math.min(Math.max(radiusKm, 1), 100)),
    units: "esriSRUnit_Kilometer",
    outFields: "*",
    returnGeometry: "true",
    resultRecordCount: "50",
  });
  const response = await fetch(`${ACCESS_LAYER}?${params}`, {
    signal: AbortSignal.timeout(8_000),
    next: { revalidate: 86_400 },
  });
  if (!response.ok) throw new Error(`Ontario GIS returned ${response.status}`);
  return withAccessPointLocation(
    { latitude, longitude },
    parseAccessFeatures(await response.json()),
  );
}

export function parseFmzZoneId(raw: unknown): string | null {
  const data = responseSchema.parse(raw);
  const zone = data.features[0]?.attributes.FISHERIES_MANAGEMENT_ZONE_ID;
  return typeof zone === "number" || typeof zone === "string" ? String(zone) : null;
}

export function parseAccessFeatures(raw: unknown): AccessPoint[] {
  const data = responseSchema.parse(raw);
  return data.features.flatMap((feature, index) => {
    if (!feature.geometry) return [];
    return [
      {
        id: String(feature.attributes.OGF_ID ?? feature.attributes.OBJECTID ?? index),
        type: text(feature.attributes.FISHING_ACCESS_POINT_TYPE),
        coordinates: { latitude: feature.geometry.y, longitude: feature.geometry.x },
        source: {
          name: "Ontario Fishing Access Point dataset",
          url: "https://data.ontario.ca/dataset/fishing-access-points",
          lastVerified: "2026-08-30",
          kind: "official",
        },
        evidence: {
          siteName: optionalText(feature.attributes.SITE_NAME),
          ownership: recordedValue(feature.attributes.SITE_OWNERSHIP_TYPE),
          parkingRecorded: recordedYes(feature.attributes.PARKING_PRESENCE_FLG),
          userFeeRecorded: recordedYes(feature.attributes.USER_FEE_FLG),
          accessibilityRecorded: recordedYes(feature.attributes.ACCESSIBILITY_FLG),
          surface: recordedValue(feature.attributes.MATERIAL_TYPE),
          verifiedDate: parseOntarioGisDate(feature.attributes.SITE_LAST_VERIFICATION_DATE),
          photoUrl: officialUrl(feature.attributes.SITE_PHOTO_URL),
          informationUrl: officialUrl(feature.attributes.ADDITIONAL_INFORMATION_URL),
          officialRecordUrl: officialRecordUrl(feature.attributes.OGF_ID),
        },
      },
    ];
  });
}

const STOCKING_LAYER =
  "https://services1.arcgis.com/TJH5KDher0W13Kgo/arcgis/rest/services/FishStockingDataForRecreationalPurposes/FeatureServer/0/query";

export type StockingRecord = {
  species: string;
  year?: number;
  numberStocked?: number;
  developmentalStage?: string;
  waterbodyName?: string;
  mnrDistrict?: string;
};

const stockingFeatureSchema = z.object({
  attributes: z.object({
    Species: z.string().nullish(),
    Stocking_Year: z.number().nullish(),
    Number_of_Fish_Stocked: z.number().nullish(),
    Developmental_Stage: z.string().nullish(),
    Official_Waterbody_Name: z.string().nullish(),
    MNRF_District: z.string().nullish(),
  }),
});

export function parseStockingRecords(raw: unknown): StockingRecord[] {
  const data = z
    .object({ features: z.array(stockingFeatureSchema).default([]) })
    .parse(raw);

  return data.features
    .flatMap(({ attributes }) => {
      const species = optionalText(attributes.Species);
      if (!species) return [];
      return [
        {
          species,
          year: attributes.Stocking_Year ?? undefined,
          numberStocked: attributes.Number_of_Fish_Stocked ?? undefined,
          developmentalStage: optionalText(attributes.Developmental_Stage),
          waterbodyName: optionalText(attributes.Official_Waterbody_Name),
          mnrDistrict: optionalText(attributes.MNRF_District),
        },
      ];
    })
    .sort((left, right) => (right.year ?? 0) - (left.year ?? 0));
}

/**
 * Stocking for one waterbody. The stocking dataset carries the same location identifier
 * as the Aquatic Resource Area records, so this is an exact match rather than a radius.
 */
export async function fetchStockingByWaterbody(lid: string): Promise<StockingRecord[]> {
  const params = new URLSearchParams({
    f: "json",
    where: `Waterbody_Location_Identifier='${lid.replace(/'/g, "''")}'`,
    outFields: "*",
    returnGeometry: "false",
    resultRecordCount: "200",
  });
  const response = await fetch(`${STOCKING_LAYER}?${params}`, {
    signal: AbortSignal.timeout(8_000),
    next: { revalidate: 86_400 },
  });
  if (!response.ok) throw new Error(`Ontario GIS returned ${response.status}`);
  return parseStockingRecords(await response.json());
}

export async function fetchNearbyStocking(latitude: number, longitude: number) {
  const params = new URLSearchParams({
    f: "json",
    where: "1=1",
    geometry: `${longitude},${latitude}`,
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    distance: "25",
    units: "esriSRUnit_Kilometer",
    outFields: "*",
    returnGeometry: "false",
    resultRecordCount: "10",
  });
  const response = await fetch(`${STOCKING_LAYER}?${params}`, {
    signal: AbortSignal.timeout(8_000),
    next: { revalidate: 86_400 },
  });
  if (!response.ok) throw new Error(`Ontario GIS returned ${response.status}`);
  const data = responseSchema.parse(await response.json());
  return data.features.map((feature) => feature.attributes);
}
