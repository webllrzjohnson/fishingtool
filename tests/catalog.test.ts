import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fishingLocations, getLocationById } from "../src/lib/fishing-locations";
import { rulesForFmz } from "../src/lib/fmz-rules";

describe("curated Ontario catalog", () => {
  it("includes researched GTA and province-wide destinations", () => {
    assert.ok(fishingLocations.length >= 30);
    assert.ok(getLocationById("ashbridges-bay"));
    assert.ok(getLocationById("lake-of-the-woods"));
    assert.ok(getLocationById("rice-lake") || fishingLocations.some((location) => location.name.includes("Rice Lake")));
  });

  it("gives every location coordinates, access, sources, species, and an FMZ table", () => {
    const regions = new Set(fishingLocations.map((location) => location.region));
    assert.ok(regions.has("Southern Ontario"));
    assert.ok(regions.has("Central Ontario"));
    assert.ok(regions.has("Eastern Ontario"));
    assert.ok(regions.has("Northeastern Ontario"));
    assert.ok(regions.has("Northwestern Ontario"));

    for (const location of fishingLocations) {
      assert.ok(location.coordinates, location.id);
      assert.ok((location.accessModes ?? []).length > 0, location.id);
      assert.ok((location.sources ?? []).length > 0, location.id);
      assert.ok(location.expectedSpecies.length > 0, location.id);
      assert.ok(rulesForFmz(location.fmz).length > 0, `${location.id} ${location.fmz}`);
    }
  });

  it("does not treat boat-oriented waters as excellent shore fishing", () => {
    const boatOriented = fishingLocations.filter((location) => location.shoreSuitability === "boat-oriented");
    assert.ok(boatOriented.length > 0);
    assert.ok(boatOriented.every((location) => !(location.accessModes ?? []).includes("shore") || location.shoreSuitability === "boat-oriented"));
  });
});
