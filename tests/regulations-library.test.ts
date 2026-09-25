import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  fmzSummaries,
  regulationEntries,
  regulationCategories,
  validateRegulationsLibrary,
} from "../src/lib/regulations/library";

describe("2026 regulations library", () => {
  it("has all 20 source-backed FMZ entry points", () => {
    assert.equal(fmzSummaries.length, 20);
    assert.deepEqual(fmzSummaries.map((summary) => summary.zone), Array.from({ length: 20 }, (_, index) => index + 1));
    for (const summary of fmzSummaries) {
      assert.match(summary.officialUrl, /^https:\/\/www\.ontario\.ca\//);
      assert.equal(summary.citation.page, summary.startPage);
    }
  });

  it("indexes practical general, licence, bait/BMZ, and invasive-species topics", () => {
    const categories = new Set(regulationEntries.map((entry) => entry.category));
    assert.deepEqual(categories, new Set(["getting-started", "licence-limits", "general-rules", "bait-bmz", "invasive-species"]));
    assert.ok(regulationEntries.some((entry) => entry.id === "bait-bmz-movement"));
    assert.ok(regulationEntries.some((entry) => entry.id === "catch-possession-combined"));
    assert.ok(regulationEntries.some((entry) => entry.officialUrl?.includes("fishonline")));
  });

  it("keeps every indexed item cited to an official HTTPS source", () => {
    for (const entry of regulationEntries) {
      assert.ok(entry.citation.page > 0);
      assert.match(entry.citation.url, /^https:\/\/www\.ontario\.ca\//);
      assert.ok(regulationCategories[entry.category]);
    }
    assert.equal(validateRegulationsLibrary(), true);
  });
});
