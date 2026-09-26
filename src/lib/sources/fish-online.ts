import { z } from "zod";

/**
 * The service behind Fish ON-Line's own operational layers. The Aquatic Resource Area
 * records carry no administrative attributes, so the bait zone and municipality shown in
 * the waterbody panel come from a point lookup against these layers.
 */
const FISH_ONLINE_MAP =
  "https://ws.lioservices.lrc.gov.on.ca/arcgis4/rest/services/FishONLine/Fish_Online_Map/MapServer";

const BMZ_LAYER = 12;
const MUNICIPALITY_LAYER = 10;

const responseSchema = z.object({
  features: z
    .array(z.object({ attributes: z.record(z.string(), z.unknown()) }))
    .default([]),
});

function optionalText(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed && trimmed.toLowerCase() !== "unknown" ? trimmed : undefined;
}

async function queryAtPoint(layerId: number, latitude: number, longitude: number, outFields: string) {
  const params = new URLSearchParams({
    f: "json",
    geometry: `${longitude},${latitude}`,
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields,
    returnGeometry: "false",
    resultRecordCount: "1",
  });
  const response = await fetch(`${FISH_ONLINE_MAP}/${layerId}/query?${params}`, {
    signal: AbortSignal.timeout(8_000),
    next: { revalidate: 86_400 },
  });
  if (!response.ok) throw new Error(`Fish ON-Line service returned ${response.status}`);
  return responseSchema.parse(await response.json()).features[0]?.attributes;
}

export type WaterbodyContext = {
  baitManagementZone?: string;
  municipality?: string;
};

export function parseBaitZone(attributes: Record<string, unknown> | undefined) {
  if (!attributes) return undefined;
  const name = optionalText(attributes.BMZ_NAME);
  const code = optionalText(attributes.BMZ);
  // Names already read like "Southern BMZ", so the code only adds noise when both exist.
  return name ?? code;
}

/** The service stores municipality names in upper case, which reads badly in a detail list. */
export function titleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
    .replace(/\bOf\b/g, "of")
    .replace(/\bAnd\b/g, "and");
}

export function parseMunicipality(attributes: Record<string, unknown> | undefined) {
  if (!attributes) return undefined;
  const name = optionalText(attributes.MUNICIPAL_NAME);
  return name ? titleCase(name) : undefined;
}

export async function fetchWaterbodyContext(
  latitude: number,
  longitude: number,
): Promise<WaterbodyContext> {
  const [bait, municipality] = await Promise.allSettled([
    queryAtPoint(BMZ_LAYER, latitude, longitude, "BMZ,BMZ_NAME"),
    queryAtPoint(MUNICIPALITY_LAYER, latitude, longitude, "MUNICIPAL_NAME,MUNICIPAL_TYPE"),
  ]);
  return {
    baitManagementZone: bait.status === "fulfilled" ? parseBaitZone(bait.value) : undefined,
    municipality:
      municipality.status === "fulfilled" ? parseMunicipality(municipality.value) : undefined,
  };
}
