import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getLocationById } from "../src/lib/fishing-locations";
import { rulesForFmz } from "../src/lib/fmz-rules";
import { evaluateRule } from "../src/lib/regulations/evaluate";
import { exceptionsForLocation } from "../src/data/curated/exceptions";
import { baitsForTrip } from "../src/lib/gear";
import { getSpeciesById } from "../src/data/curated/species";

describe("five release scenarios", () => {
  it("plans a GTA shore trip with date-aware FMZ 20 rules", () => {
    const location = getLocationById("ashbridges-bay");
    assert.ok(location);
    assert.ok(location.accessModes?.includes("shore"));
    const pike = rulesForFmz("fmz-20").find((rule) => rule.speciesId === "northern-pike");
    assert.ok(pike);
    const result = evaluateRule(pike, "2026-08-15", "sport");
    assert.equal(result.status, "open");
  });

  it("flags Humber river-mouth boundary ambiguity", () => {
    const location = getLocationById("humber-bay");
    assert.ok(location?.ambiguousBoundary);
    assert.ok(exceptionsForLocation("humber-bay").length > 0);
    const pike = rulesForFmz("fmz-20").find((rule) => rule.speciesId === "northern-pike");
    assert.ok(pike);
    const result = evaluateRule(pike, "2026-08-15", "sport", {
      ambiguousBoundary: true,
      hasWaterbodyExceptions: true,
    });
    assert.equal(result.status, "exception-check-required");
    assert.equal(result.requiresOfficialCheck, true);
  });

  it("keeps a southern family lake labelled for shore anglers", () => {
    const location = getLocationById("rice-lake");
    assert.ok(location?.familyFriendly);
    assert.ok((location.accessModes ?? []).includes("shore") || (location.accessModes ?? []).includes("pier"));
  });

  it("labels a northern boat-oriented destination when viewed by a shore angler", () => {
    const location = getLocationById("lake-of-the-woods");
    assert.equal(location?.shoreSuitability, "boat-oriented");
    assert.ok(!(location.accessModes ?? []).includes("shore") || location.shoreSuitability === "boat-oriented");
  });

  it("marks a closed-season bass target instead of inferring a keep", () => {
    const bass = rulesForFmz("fmz-16").find((rule) => rule.speciesId === "largemouth-bass");
    assert.ok(bass);
    const result = evaluateRule(bass, "2026-05-20", "sport");
    assert.equal(result.status, "closed");
    assert.equal(result.requiresOfficialCheck, false);

    const heart = getLocationById("heart-lake");
    const pike = getSpeciesById("northern-pike");
    assert.ok(heart && pike);
    assert.ok(baitsForTrip(pike, heart, "2026-05-20").every((bait) => bait.allowed !== "yes" || bait.kind === "artificial"));
  });
});
