import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BASEMAPS,
  OVERLAYS,
  buildViewerStyle,
  defaultOverlayState,
  isBasemapId,
  isOverlayId,
  zoomFromScale,
} from "../src/lib/map/ontario-map-layers";
import { parseBaitZone, parseMunicipality, titleCase } from "../src/lib/sources/fish-online";

describe("Ontario map layers", () => {
  it("serves both basemaps from cached Ontario tile services", () => {
    for (const basemap of BASEMAPS) {
      assert.match(basemap.tiles, /^https:\/\/ws\.lioservices\.lrc\.gov\.on\.ca\//);
      assert.match(basemap.tiles, /\/tile\/\{z\}\/\{y\}\/\{x\}$/);
    }
    assert.deepEqual(
      BASEMAPS.map((basemap) => basemap.id),
      ["topographic", "imagery"],
    );
  });

  it("converts ArcGIS scale denominators to web zoom levels", () => {
    assert.equal(zoomFromScale(559_082_264.028_8), 0);
    // The bathymetry layer stops drawing above roughly 1:72,000.
    assert.equal(zoomFromScale(72_225), 13);
    assert.equal(zoomFromScale(288_896), 11);
  });

  it("guards basemap and overlay ids coming from the query string", () => {
    assert.equal(isBasemapId("topographic"), true);
    assert.equal(isBasemapId("satellite"), false);
    assert.equal(isBasemapId(null), false);
    assert.equal(isOverlayId("bathymetry"), true);
    assert.equal(isOverlayId("sanctuaries"), false);
  });

  it("builds a style with every basemap and overlay present", () => {
    const style = buildViewerStyle("imagery", defaultOverlayState());
    assert.equal(style.version, 8);
    assert.equal(Object.keys(style.sources).length, BASEMAPS.length + OVERLAYS.length);
    assert.equal(style.layers.length, BASEMAPS.length + OVERLAYS.length);
  });

  it("shows only the selected basemap", () => {
    const style = buildViewerStyle("imagery", defaultOverlayState());
    const visible = style.layers
      .filter((layer) => layer.id.startsWith("basemap-") && layer.layout?.visibility === "visible")
      .map((layer) => layer.id);
    assert.deepEqual(visible, ["basemap-imagery"]);
  });

  it("drives overlay visibility and opacity from state rather than rebuilding sources", () => {
    const state = defaultOverlayState();
    state.bathymetry = { visible: true, opacity: 0.4 };
    const style = buildViewerStyle("topographic", state);
    const layer = style.layers.find((entry) => entry.id === "overlay-bathymetry");
    assert.equal(layer?.type, "raster");
    if (layer?.type !== "raster") return;
    assert.equal(layer.layout?.visibility, "visible");
    assert.equal(layer.paint?.["raster-opacity"], 0.4);
    assert.equal(layer.minzoom, zoomFromScale(72_225));
  });

  it("leaves the bbox placeholder unencoded so MapLibre can substitute it", () => {
    const style = buildViewerStyle("topographic", defaultOverlayState());
    const source = style.sources["overlay-fmz"];
    assert.equal(source.type, "raster");
    const template = source.type === "raster" ? source.tiles?.[0] : undefined;
    assert.ok(template?.includes("bbox={bbox-epsg-3857}"));
    assert.ok(template?.includes("layers=show%3A4"));
  });
});

describe("Fish ON-Line attribute formatting", () => {
  it("title-cases the upper-case municipality names the service returns", () => {
    assert.equal(titleCase("REGIONAL MUNICIPALITY OF YORK"), "Regional Municipality of York");
    assert.equal(titleCase("DISTRICT OF THUNDER BAY"), "District of Thunder Bay");
  });

  it("reads a municipality name and ignores the redundant type suffix", () => {
    assert.equal(
      parseMunicipality({ MUNICIPAL_NAME: "COUNTY OF SIMCOE", MUNICIPAL_TYPE: "Upper Tier Municipality" }),
      "County of Simcoe",
    );
    assert.equal(parseMunicipality({}), undefined);
    assert.equal(parseMunicipality(undefined), undefined);
  });

  it("prefers the bait zone name over its code", () => {
    assert.equal(parseBaitZone({ BMZ: "S", BMZ_NAME: "Southern BMZ" }), "Southern BMZ");
    assert.equal(parseBaitZone({ BMZ: "NW" }), "NW");
    assert.equal(parseBaitZone({}), undefined);
  });
});
