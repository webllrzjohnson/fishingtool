import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fishingLocations } from "../src/lib/fishing-locations";
import { validateWaterbodyLid } from "../src/lib/sources/ontario-waterbodies";
import type { WaterbodySnapshotEntry } from "../src/lib/types";

const snapshotPath = join(process.cwd(), "src/data/generated/ontario-waterbodies.json");

describe("waterbody snapshot", () => {
  it("covers every curated location with coordinates", () => {
    assert.ok(existsSync(snapshotPath), "Run npm run data:snapshot:waterbodies to generate the snapshot.");
    const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8")) as Record<string, WaterbodySnapshotEntry>;
    const withCoordinates = fishingLocations.filter((location) => location.coordinates);
    for (const location of withCoordinates) {
      const entry = snapshot[location.id];
      assert.ok(entry, `missing snapshot for ${location.id}`);
      assert.ok(validateWaterbodyLid(entry.waterbody.waterbodyLid), location.id);
      assert.match(entry.waterbody.fmz, /^fmz-\d+$/);
      assert.ok(entry.fetchedAt);
      assert.equal(typeof entry.curatedFmzMismatch, "boolean");
      assert.ok(Array.isArray(entry.speciesNotInCurated));
    }
  });
});
