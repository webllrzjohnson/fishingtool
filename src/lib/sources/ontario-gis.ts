import { z } from "zod";
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

export async function fetchNearbyAccessPoints(
  latitude: number,
  longitude: number,
  radiusKm = 20,
): Promise<AccessPoint[]> {
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
  return parseAccessFeatures(await response.json());
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
      },
    ];
  });
}

const STOCKING_LAYER =
  "https://services1.arcgis.com/TJH5KDher0W13Kgo/arcgis/rest/services/FishStockingDataForRecreationalPurposes/FeatureServer/0/query";

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
