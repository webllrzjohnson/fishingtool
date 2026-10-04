import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  escapeSqlLiteral,
  extentCenter,
  fetchWaterbodyForPoint,
  nameRelevance,
  parseWaterbodyFeatures,
  rankWaterbodyMatches,
  validateWaterbodyLid,
} from "../src/lib/sources/ontario-waterbodies";
import { toWater } from "../src/lib/spots/detail";

const northWindLakeFixture = {
  features: [
    {
      attributes: {
        OGF_ID: 125495444,
        ARA_SUMMARY_ID: 751903088,
        ARA_IDENT: "NI-0001-Nor",
        WATERBODY_TYPE: "Lake or Pond",
        WATERBODY_LID: "16-4308-55224",
        OFFICIAL_WATERBODY_NAME: "North Wind Lake",
        FISHERIES_MANAGEMENT_ZONE_ID: 6,
        THERMAL_REGIME: "Cold",
        FISH_SPECIES_SUMMARY: "Burbot,Lake Whitefish,Northern Pike,Trout-Perches,Walleye,White Sucker,Yellow Perch",
        SURFACE_AREA: 1282,
        MAXIMUM_DEPTH: 35.1,
        MEAN_DEPTH: 13.2,
        SPATIAL_VERIFICATION_FLG: "Verified",
        EFFECTIVE_DATETIME: 1554884802000,
      },
    },
    {
      attributes: {
        WATERBODY_LID: "16-4308-55224",
        OFFICIAL_WATERBODY_NAME: "North Wind Lake",
        FISHERIES_MANAGEMENT_ZONE_ID: 6,
        FISH_SPECIES_SUMMARY: "Burbot,Lake Whitefish,Northern Pike,Trout-Perches,Walleye,White Sucker,Yellow Perch",
        SURFACE_AREA: 900,
      },
    },
  ],
};

describe("Ontario waterbody adapter", () => {
  it("validates WATERBODY_LID shape", () => {
    assert.equal(validateWaterbodyLid("16-4308-55224"), true);
    assert.equal(validateWaterbodyLid("16-4308-5522"), false);
    assert.equal(validateWaterbodyLid("'; DROP TABLE--"), false);
  });

  it("escapes SQL literals for where clauses", () => {
    assert.equal(escapeSqlLiteral("O'Brien Lake"), "O''Brien Lake");
  });

  it("dedupes duplicate LIDs and keeps the largest surface area", () => {
    const parsed = parseWaterbodyFeatures(northWindLakeFixture);
    assert.equal(parsed.length, 1);
    assert.equal(parsed[0].officialName, "North Wind Lake");
    assert.equal(parsed[0].surfaceAreaHa, 1282);
    assert.equal(parsed[0].fmz, "fmz-6");
    assert.equal(parsed[0].species.length, 7);
  });

  it("computes extent centers", () => {
    const center = extentCenter({
      xmin: -88.043215425544844,
      ymin: 49.801826538084697,
      xmax: -87.878477458098146,
      ymax: 49.889806555483091,
    });
    assert.ok(Math.abs(center.latitude - 49.8458) < 0.01);
    assert.ok(Math.abs(center.longitude + 87.9608) < 0.01);
  });

  it("treats unknown values as absent", () => {
    const [parsed] = parseWaterbodyFeatures({
      features: [{
        attributes: {
          WATERBODY_LID: "16-4308-55224",
          OFFICIAL_WATERBODY_NAME: "North Wind Lake",
          FISHERIES_MANAGEMENT_ZONE_ID: 6,
          THERMAL_REGIME: "Unknown",
          SPATIAL_VERIFICATION_FLG: "Unknown",
        },
      }],
    });
    assert.equal(parsed.thermalRegime, undefined);
    assert.equal(parsed.spatialVerification, undefined);
  });

  it("scores name matches without regard to capitalisation", () => {
    assert.equal(nameRelevance("Lake Simcoe", "lake simcoe"), 0);
    assert.equal(nameRelevance("Lake Simcoe", "LAKE"), 1);
    assert.equal(nameRelevance("Lake Simcoe", "simcoe"), 2);
    assert.equal(nameRelevance("Baden-Powell Lake", "lake"), 2);
    assert.equal(nameRelevance("Snowflake Pond", "lake"), 3);
  });

  it("treats regex characters in a search term as literal text", () => {
    assert.equal(nameRelevance("St. Patrick Lake", "st."), 1);
    assert.equal(nameRelevance("Star Lake", "st."), 3);
  });

  it("ranks exact and prefix matches above incidental ones", () => {
    const ranked = rankWaterbodyMatches(
      [
        { officialName: "Baden-Powell Lake", surfaceAreaHa: 12 },
        { officialName: "Lake Simcoe", surfaceAreaHa: 72200 },
        { officialName: "Lake", surfaceAreaHa: 1 },
        { officialName: "Lake Nipigon", surfaceAreaHa: 428000 },
      ],
      "lake",
    );
    assert.deepEqual(
      ranked.map((entry) => entry.officialName),
      ["Lake", "Lake Nipigon", "Lake Simcoe", "Baden-Powell Lake"],
    );
  });

  it("falls back to surface area when relevance ties", () => {
    const ranked = rankWaterbodyMatches(
      [
        { officialName: "Trout Lake", surfaceAreaHa: 100 },
        { officialName: "Trout Lake", surfaceAreaHa: 900 },
      ],
      "trout",
    );
    assert.equal(ranked[0].surfaceAreaHa, 900);
  });

  it("queries exact intersections before proximity and does not require a species summary", async () => {
    const originalFetch = globalThis.fetch;
    const queries: URL[] = [];
    globalThis.fetch = async (input) => {
      const url = new URL(String(input));
      queries.push(url);
      if (url.searchParams.get("returnExtentOnly") === "true") {
        return Response.json({ extent: { xmin: -80, xmax: -78, ymin: 43, ymax: 45 } });
      }
      return Response.json({ features: [{ attributes: {
        WATERBODY_LID: "16-4308-55224", OFFICIAL_WATERBODY_NAME: "North Wind Lake",
        FISHERIES_MANAGEMENT_ZONE_ID: 6,
      } }] });
    };
    try {
      const match = await fetchWaterbodyForPoint(44, -79);
      assert.equal(match?.matchConfidence, "exact");
      assert.equal(match?.species.length, 0);
      assert.equal(queries[0].searchParams.has("distance"), false);
      assert.equal(queries[0].searchParams.get("where"), "1=1");
      assert.equal(queries.filter((url) => url.searchParams.has("distance")).length, 0);
    } finally { globalThis.fetch = originalFetch; }
  });

  it("labels a proximity fallback as nearby and does not pick between ambiguous matches", async () => {
    const originalFetch = globalThis.fetch;
    const queries: URL[] = [];
    let ambiguous = false;
    globalThis.fetch = async (input) => {
      const url = new URL(String(input));
      queries.push(url);
      if (url.searchParams.get("returnExtentOnly") === "true") {
        return Response.json({ extent: { xmin: -80, xmax: -78, ymin: 43, ymax: 45 } });
      }
      const feature = (lid: string) => ({ attributes: {
        WATERBODY_LID: lid, OFFICIAL_WATERBODY_NAME: lid, FISHERIES_MANAGEMENT_ZONE_ID: 6,
      } });
      return Response.json({ features: url.searchParams.has("distance")
        ? [feature("16-4308-55224"), ...(ambiguous ? [feature("16-4308-55225")] : [])] : [] });
    };
    try {
      const nearby = await fetchWaterbodyForPoint(44, -79, { maxDistanceM: 250 });
      assert.equal(nearby?.matchConfidence, "nearby");
      assert.equal(nearby?.matchDistanceM, 250);
      assert.equal(queries[0].searchParams.has("distance"), false);
      ambiguous = true;
      assert.equal(await fetchWaterbodyForPoint(44, -79, { maxDistanceM: 250 }), null);
    } finally { globalThis.fetch = originalFetch; }
  });

  it("does not serialize a nearby candidate's FMZ as the spot's zone", () => {
    const [record] = parseWaterbodyFeatures(northWindLakeFixture, { matchConfidence: "nearby", matchDistanceM: 250 });
    const candidate = toWater(record, { baitManagementZone: "Southern" });
    assert.equal(candidate.matchConfidence, "nearby");
    assert.equal("fmz" in candidate, false);
    assert.equal("baitManagementZone" in candidate, false);
    assert.equal("fmzRegulationUrl" in candidate, false);
  });
});
