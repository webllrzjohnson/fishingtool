import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseOsrmDurationsMinutes } from "../src/lib/spots/drive-times";

describe("road drive times", () => {
  it("reads minutes from an OSRM table row and skips the origin", () => {
    const minutes = parseOsrmDurationsMinutes(
      { code: "Ok", durations: [[0, 1800, null, 5400]] },
      3,
    );
    assert.deepEqual(minutes, [30, null, 90]);
  });

  it("returns nulls when routing did not succeed", () => {
    assert.deepEqual(parseOsrmDurationsMinutes({ code: "NoRoute" }, 2), [null, null]);
  });
});
