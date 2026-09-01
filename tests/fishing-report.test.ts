import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fishingLocations, getLocationById } from "../src/lib/fishing-locations";
import { buildFishingReport, formatReportText } from "../src/lib/fishing-report";

describe("fishing report", () => {
  it("builds a report for every catalogued location", () => {
    for (const location of fishingLocations) {
      const report = buildFishingReport(location.id);
      assert.ok(report, `missing report for ${location.id}`);
      assert.equal(report.location.id, location.id);
      assert.ok(report.speciesForZone.length > 0);
      assert.ok(report.tackleForTargets.length > 0);
      assert.ok(report.officialSources.length > 0);
    }
  });

  it("returns null for unknown locations", () => {
    assert.equal(buildFishingReport("not-a-real-spot"), null);
  });

  it("includes location name in formatted report text", () => {
    const location = getLocationById("ashbridges-bay");
    assert.ok(location);
    const text = formatReportText(buildFishingReport(location.id)!);
    assert.match(text, /Ashbridges Bay Park/);
    assert.match(text, /FMZ/);
    assert.match(text, /VERIFY BEFORE KEEPING FISH/);
  });
});
