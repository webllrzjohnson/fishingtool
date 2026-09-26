import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultOutfit } from "../src/lib/gear/default-outfit";
import { buildFishingReport, buildFishingReportFromTrip } from "../src/lib/fishing-report";

describe("fishing report", () => {
  it("includes the selected outfit and licence type", () => {
    const report = buildFishingReport("ashbridges-bay", {
      outfit: defaultOutfit,
      licenceType: "conservation",
    });
    assert.ok(report);
    assert.ok(report.licenceReminders.some((line) => line.includes(defaultOutfit.name)));
    assert.ok(report.licenceReminders.some((line) => line.includes("Conservation")));
  });

  it("builds from trip selections", () => {
    const report = buildFishingReportFromTrip("ashbridges-bay", {
      selectedGearId: defaultOutfit.id,
      licenceType: "sport",
      outfits: [defaultOutfit],
    });
    assert.ok(report);
    assert.ok(report.licenceReminders.some((line) => line.includes("Sport")));
  });
});
