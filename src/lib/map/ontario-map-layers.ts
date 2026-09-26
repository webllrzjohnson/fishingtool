import type {
  RasterLayerSpecification,
  RasterSourceSpecification,
  StyleSpecification,
} from "maplibre-gl";

/**
 * Map sources behind Fish ON-Line, consumed directly rather than through the ArcGIS SDK.
 *
 * The two basemaps are pre-cached tile services, so they slot into MapLibre as plain
 * raster tile sources. The operational layers have no tile cache and are fetched through
 * the ArcGIS dynamic `export` endpoint, which MapLibre can drive with its
 * `{bbox-epsg-3857}` placeholder.
 */

const LIO_TOPOGRAPHIC =
  "https://ws.lioservices.lrc.gov.on.ca/arcgis1/rest/services/LIO_Cartographic/LIO_Topographic/MapServer";

const LIO_IMAGERY =
  "https://ws.lioservices.lrc.gov.on.ca/arcgis2/rest/services/LIO_Imagery/Ontario_Imagery_Web_Map_Service/MapServer";

const FISH_ONLINE_MAP =
  "https://ws.lioservices.lrc.gov.on.ca/arcgis4/rest/services/FishONLine/Fish_Online_Map/MapServer";

const ARA_OPEN_DATA =
  "https://ws.lioservices.lrc.gov.on.ca/arcgis2/rest/services/LIO_OPEN_DATA/LIO_Open07/MapServer";

const ONTARIO_ATTRIBUTION =
  '© King\'s Printer for Ontario. <a href="https://www.ontario.ca/page/open-government-licence-ontario" target="_blank" rel="noreferrer">Open Government Licence – Ontario</a>';

export type BasemapId = "topographic" | "imagery";

export type Basemap = {
  id: BasemapId;
  label: string;
  tiles: string;
  maxZoom: number;
};

export const BASEMAPS: readonly Basemap[] = [
  {
    id: "topographic",
    label: "Topographic",
    tiles: `${LIO_TOPOGRAPHIC}/tile/{z}/{y}/{x}`,
    maxZoom: 19,
  },
  {
    id: "imagery",
    label: "Imagery",
    tiles: `${LIO_IMAGERY}/tile/{z}/{y}/{x}`,
    maxZoom: 21,
  },
];

export const DEFAULT_BASEMAP: BasemapId = "topographic";

export function isBasemapId(value: string | null | undefined): value is BasemapId {
  return value === "topographic" || value === "imagery";
}

/**
 * ArcGIS layers declare visibility as a map scale denominator. Converts one to the
 * nearest web-map zoom level so a layer is not requested where the service draws nothing.
 */
export function zoomFromScale(scale: number) {
  return Math.round(Math.log2(559_082_264.028_8 / scale));
}

export type OverlayId =
  | "waterbodies"
  | "access"
  | "bathymetry"
  | "fmz"
  | "fmz-closed"
  | "bmz"
  | "licence"
  | "municipality";

export type Overlay = {
  id: OverlayId;
  label: string;
  description: string;
  service: string;
  serviceLayers: string;
  defaultVisible: boolean;
  defaultOpacity: number;
  /** Omitted where the service draws the layer at every scale. */
  minZoom?: number;
};

export const OVERLAYS: readonly Overlay[] = [
  {
    id: "municipality",
    label: "Upper-tier municipalities",
    description: "County, district, and regional municipality boundaries.",
    service: FISH_ONLINE_MAP,
    serviceLayers: "10",
    defaultVisible: false,
    defaultOpacity: 0.6,
  },
  {
    id: "bmz",
    label: "Bait management zones",
    description: "Zones that govern where baitfish may be moved and used.",
    service: FISH_ONLINE_MAP,
    serviceLayers: "12",
    defaultVisible: false,
    defaultOpacity: 0.5,
  },
  {
    id: "fmz",
    label: "Fisheries management zones",
    description: "The zone boundaries that seasons and limits are written against.",
    service: FISH_ONLINE_MAP,
    serviceLayers: "4",
    defaultVisible: false,
    defaultOpacity: 0.55,
  },
  {
    id: "fmz-closed",
    label: "Zones closed to all fishing",
    description: "Areas where the zone is closed to fishing outright.",
    service: FISH_ONLINE_MAP,
    serviceLayers: "7",
    defaultVisible: false,
    defaultOpacity: 0.7,
  },
  {
    id: "waterbodies",
    label: "Waterbodies",
    description: "Aquatic Resource Area lakes, ponds, rivers, and streams.",
    service: ARA_OPEN_DATA,
    serviceLayers: "2,1",
    defaultVisible: true,
    defaultOpacity: 0.9,
  },
  {
    id: "bathymetry",
    label: "Lake depth contours (m)",
    description: "Surveyed depth contours. Drawn once you zoom in past about 1:72,000.",
    service: FISH_ONLINE_MAP,
    serviceLayers: "3",
    defaultVisible: false,
    defaultOpacity: 0.85,
    minZoom: zoomFromScale(72_225),
  },
  {
    id: "access",
    label: "Fishing access points",
    description: "Boat launches and shore access. Drawn once you zoom in past about 1:289,000.",
    service: FISH_ONLINE_MAP,
    serviceLayers: "0",
    defaultVisible: true,
    defaultOpacity: 1,
    minZoom: zoomFromScale(288_896),
  },
  {
    id: "licence",
    label: "Licence issuers",
    description: "ServiceOntario counters and seasonal licence issuers.",
    service: FISH_ONLINE_MAP,
    serviceLayers: "1",
    defaultVisible: false,
    defaultOpacity: 1,
  },
];

export function overlayById(id: OverlayId) {
  return OVERLAYS.find((overlay) => overlay.id === id);
}

export function isOverlayId(value: string): value is OverlayId {
  return OVERLAYS.some((overlay) => overlay.id === value);
}

export function defaultOverlayState() {
  const state: Record<OverlayId, { visible: boolean; opacity: number }> = {} as never;
  for (const overlay of OVERLAYS) {
    state[overlay.id] = { visible: overlay.defaultVisible, opacity: overlay.defaultOpacity };
  }
  return state;
}

function exportTemplate(overlay: Overlay) {
  const params = new URLSearchParams({
    bboxSR: "3857",
    imageSR: "3857",
    size: "512,512",
    dpi: "96",
    format: "png32",
    transparent: "true",
    layers: `show:${overlay.serviceLayers}`,
    f: "image",
  });
  // The bbox placeholder is substituted by MapLibre and must not be URL-encoded.
  return `${overlay.service}/export?bbox={bbox-epsg-3857}&${params}`;
}

export type OverlayState = Record<OverlayId, { visible: boolean; opacity: number }>;

/**
 * Builds a complete MapLibre style. Keeping every basemap and overlay in one style lets
 * MapLibre diff visibility and opacity in place instead of tearing the map down on each
 * toggle.
 */
export function buildViewerStyle(basemap: BasemapId, overlays: OverlayState): StyleSpecification {
  const sources: Record<string, RasterSourceSpecification> = {};
  const layers: RasterLayerSpecification[] = [];

  for (const option of BASEMAPS) {
    sources[`basemap-${option.id}`] = {
      type: "raster",
      tiles: [option.tiles],
      tileSize: 256,
      maxzoom: option.maxZoom,
      attribution: ONTARIO_ATTRIBUTION,
    };
    layers.push({
      id: `basemap-${option.id}`,
      type: "raster",
      source: `basemap-${option.id}`,
      layout: { visibility: option.id === basemap ? "visible" : "none" },
    });
  }

  for (const overlay of OVERLAYS) {
    const state = overlays[overlay.id];
    sources[`overlay-${overlay.id}`] = {
      type: "raster",
      tiles: [exportTemplate(overlay)],
      tileSize: 512,
      attribution: ONTARIO_ATTRIBUTION,
    };
    layers.push({
      id: `overlay-${overlay.id}`,
      type: "raster",
      source: `overlay-${overlay.id}`,
      ...(overlay.minZoom ? { minzoom: overlay.minZoom } : {}),
      layout: { visibility: state?.visible ? "visible" : "none" },
      paint: { "raster-opacity": state?.opacity ?? 1 },
    });
  }

  return { version: 8 as const, sources, layers };
}
