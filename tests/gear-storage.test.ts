import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultOutfit } from "../src/lib/gear/default-outfit";
import { migrateGearState } from "../src/lib/gear/storage";

describe("gear storage migration", () => {
  it("seeds the default GX2 outfit when storage is empty or corrupt", () => {
    const empty = migrateGearState(null);
    assert.equal(empty.defaultOutfitId, defaultOutfit.id);
    assert.equal(empty.outfits.length, 1);
    assert.equal(empty.outfits[0].name, defaultOutfit.name);
  });

  it("preserves valid saved outfits and default selection", () => {
    const custom = {
      ...defaultOutfit,
      id: "backup-spinning",
      name: "Backup spinning combo",
      isDefault: false,
    };
    const migrated = migrateGearState({
      version: 1,
      outfits: [defaultOutfit, custom],
      defaultOutfitId: custom.id,
    });
    assert.equal(migrated.defaultOutfitId, custom.id);
    assert.equal(migrated.outfits.length, 2);
    assert.equal(migrated.outfits.find((outfit) => outfit.id === custom.id)?.isDefault, true);
  });

  it("drops invalid outfits instead of crashing", () => {
    const migrated = migrateGearState({
      version: 1,
      outfits: [{ id: "bad" }],
      defaultOutfitId: "bad",
    });
    assert.equal(migrated.outfits.length, 1);
    assert.equal(migrated.defaultOutfitId, defaultOutfit.id);
  });
});
