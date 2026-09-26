import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { matchKnownPlaces, normalizePlaceQuery } from "../src/lib/spots/known-places";
import { searchCuratedSpots } from "../src/lib/spots/search";

describe("place query normalisation", () => {
  it("splits jammed harbour names so Port Hope and Port Dalhousie still match", () => {
    assert.equal(normalizePlaceQuery("porthope"), "Port hope");
    assert.equal(normalizePlaceQuery("port dalhousie"), "port dalhousie");
    assert.equal(normalizePlaceQuery("  Port   Hope  "), "Port Hope");
  });
});

describe("known fishing places", () => {
  it("pins Port Hope on the marina, not the town centre", () => {
    const [place] = matchKnownPlaces("porthope");
    assert.equal(place?.label, "Port Hope");
    assert.ok(place && Math.abs(place.latitude - 43.94438) < 0.001);
    assert.ok(place && Math.abs(place.longitude + 78.29113) < 0.001);
  });

  it("finds Port Dalhousie by harbour or jammed spelling", () => {
    assert.equal(matchKnownPlaces("Port Dalhousie")[0]?.label, "Port Dalhousie");
    assert.equal(matchKnownPlaces("portdalhousie")[0]?.label, "Port Dalhousie");
  });
});

describe("curated spot search", () => {
  it("still finds a curated destination by municipality", () => {
    const matches = searchCuratedSpots("toronto");
    assert.ok(matches.some((entry) => /toronto|ashbridges|island/i.test(entry.label)));
  });
});
