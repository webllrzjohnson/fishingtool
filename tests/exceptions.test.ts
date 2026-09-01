import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { exceptionsForLocation, waterbodyExceptions } from "../src/data/curated/exceptions";
import { getLocationById } from "../src/lib/fishing-locations";
import { enrichLocation } from "../src/lib/catalog";
import { rulesForFmz } from "../src/lib/fmz-rules";
import { evaluateRule } from "../src/lib/regulations/evaluate";


describe("curated waterbody exceptions", () => {
  it("links every exception to an existing location in the same FMZ", () => {
    for (const exception of waterbodyExceptions) {
      const location = getLocationById(exception.locationId!);
      assert.ok(location, `${exception.id} has no curated location`);
      assert.equal(location.fmz, exception.fmz, `${exception.id} has the wrong FMZ`);
      assert.equal(exception.source.kind, "official", `${exception.id} needs an official source`);
      assert.match(exception.effectiveDate, /^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("uses linked exception records to require an official check", () => {
    const location = getLocationById("lake-simcoe");
    assert.ok(location);
    const exceptionRecords = exceptionsForLocation(location.id);
    const rule = rulesForFmz(location.fmz).find((item) => item.speciesId === "walleye");
    assert.ok(rule);

    const result = evaluateRule(rule, "2026-06-15", "sport", { exceptions: exceptionRecords });
    assert.equal(result.status, "exception-check-required");
    assert.equal(result.requiresOfficialCheck, true);
    assert.deepEqual(result.exceptionIds, ["lake-simcoe"]);
    assert.match(result.reason, /lake-simcoe/);
  });

  it("does not infer an exception flag from location prose", () => {
    const baseLocation = getLocationById("ashbridges-bay");
    assert.ok(baseLocation);

    const proseOnly = enrichLocation({
      ...baseLocation,
      id: "prose-only-location",
      fmzNote: "This note mentions an exception but has no curated exception record.",
    });
    const linked = enrichLocation(baseLocation);

    assert.equal(proseOnly.hasWaterbodyExceptions, false);
    assert.equal(linked.hasWaterbodyExceptions, false);
    assert.equal(enrichLocation(getLocationById("lake-simcoe")!).hasWaterbodyExceptions, true);
  });
});
