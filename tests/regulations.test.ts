import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  evaluateRule,
  isDateInWindow,
  nthWeekdayOfMonth,
  seasonForDate,
} from "../src/lib/regulations/evaluate";
import type { SpeciesRule } from "../src/lib/types";

const standardRule: SpeciesRule = {
  speciesId: "walleye",
  species: "Walleye",
  season: "May through September",
  sportLimit: "S-4",
  conservationLimit: "C-2",
  openWindows: [{ start: "05-01", end: "09-30" }],
};

describe("deterministic regulation evaluation", () => {
  it("computes nth Saturdays used by Ontario season text", () => {
    assert.equal(nthWeekdayOfMonth(2026, { nth: 1, weekday: 6, month: 5 }), "05-02");
    assert.equal(nthWeekdayOfMonth(2026, { nth: 3, weekday: 6, month: 6 }), "06-20");
    assert.equal(nthWeekdayOfMonth(2026, { nth: 4, weekday: 6, month: 4, offsetDays: -1 }), "04-24");
    assert.equal(nthWeekdayOfMonth(2026, { nth: 1, weekday: 1, month: 9 }), "09-07");
  });

  it("evaluates standard windows and calendar seasons", () => {
    assert.equal(isDateInWindow("2026-06-15", "05-01", "09-30"), true);
    assert.equal(isDateInWindow("2026-10-01", "05-01", "09-30"), false);
    assert.equal(seasonForDate("2026-06-15"), "summer");

    const result = evaluateRule(standardRule, "2026-06-15", "sport");
    assert.equal(result.status, "open");
    assert.equal(result.limit, "S-4");
    assert.equal(result.requiresOfficialCheck, false);
  });

  it("supports windows that cross a year boundary", () => {
    assert.equal(isDateInWindow("2026-01-15", "11-01", "02-28"), true);
    assert.equal(isDateInWindow("2026-12-15", "11-01", "02-28"), true);
    assert.equal(isDateInWindow("2026-06-15", "11-01", "02-28"), false);
  });

  it("recognizes closed-all-year rules", () => {
    const result = evaluateRule(
      {
        speciesId: "lake-sturgeon",
        species: "Lake sturgeon",
        season: "Closed all year",
        sportLimit: "S-0",
      },
      "2026-08-01",
      "sport",
    );

    assert.equal(result.status, "closed");
    assert.equal(result.requiresOfficialCheck, false);
  });

  it("distinguishes catch-and-release windows from keep windows", () => {
    const rule: SpeciesRule = {
      speciesId: "bass",
      species: "Bass",
      season: "Structured bass season",
      sportLimit: "S-6",
      openWindows: [
        { start: "01-01", end: "05-10", mode: "catch-and-release" },
        { start: "06-20", end: "12-31", mode: "keep" },
      ],
    };

    const releaseOnly = evaluateRule(rule, "2026-03-01", "sport");
    assert.equal(releaseOnly.status, "catch-and-release");
    assert.equal(releaseOnly.limit, undefined);

    const keep = evaluateRule(rule, "2026-07-01", "sport");
    assert.equal(keep.status, "open");
    assert.equal(keep.limit, "S-6");
  });

  it("uses the conservation licence limit when supplied", () => {
    const result = evaluateRule(standardRule, "2026-06-15", "conservation");
    assert.equal(result.status, "open");
    assert.equal(result.limit, "C-2");
  });

  it("forces an official exception check for exception and boundary waters", () => {
    const exceptionResult = evaluateRule(standardRule, "2026-06-15", "sport", {
      hasWaterbodyExceptions: true,
    });
    const boundaryResult = evaluateRule(standardRule, "2026-06-15", "sport", {
      ambiguousBoundary: true,
    });

    assert.equal(exceptionResult.status, "exception-check-required");
    assert.equal(exceptionResult.requiresOfficialCheck, true);
    assert.equal(boundaryResult.status, "exception-check-required");
    assert.equal(boundaryResult.requiresOfficialCheck, true);
  });

  it("returns unknown for invalid dates and invalid structured windows", () => {
    const invalidDate = evaluateRule(standardRule, "2026-02-30", "sport");
    assert.equal(invalidDate.status, "unknown");
    assert.equal(invalidDate.requiresOfficialCheck, true);
    assert.equal(seasonForDate("not-a-date"), "unknown");

    const invalidWindow = evaluateRule(
      {
        ...standardRule,
        openWindows: [{ start: "13-01", end: "09-30" }],
      },
      "2026-06-15",
      "sport",
    );
    assert.equal(invalidWindow.status, "unknown");
    assert.equal(invalidWindow.requiresOfficialCheck, true);
  });

  it("mentions combined-species limits without treating them as extra keep permission", () => {
    const result = evaluateRule(
      {
        ...standardRule,
        combinedGroup: "walleye and sauger combined",
      },
      "2026-06-15",
      "sport",
    );
    assert.equal(result.status, "open");
    assert.match(result.reason, /Combined-species limit/);
  });
});
