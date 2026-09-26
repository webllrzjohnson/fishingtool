import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getSpeciesById } from "../src/data/curated/species";
import { defaultOutfit } from "../src/lib/gear/default-outfit";
import { evaluateOutfit } from "../src/lib/gear/evaluate";
import { rankOutfits } from "../src/lib/gear/rank";
import type { GearOutfit } from "../src/lib/gear/types";

const lightPanfishOutfit: GearOutfit = {
  id: "light-panfish",
  name: "Light panfish spinning",
  rod: {
    lengthFt: 6,
    power: "ultra-light",
    lineRatingMinLb: 2,
    lineRatingMaxLb: 6,
    lureRatingMinOz: 0.03125,
    lureRatingMaxOz: 0.25,
  },
  reel: { type: "spinning", sizeLabel: "1000" },
  line: { material: "mono", testLb: "4" },
};

const muskieOutfit: GearOutfit = {
  id: "muskie-heavy",
  name: "Heavy muskie baitcaster",
  rod: { lengthFt: 8, power: "extra-heavy", lineRatingMinLb: 65, lineRatingMaxLb: 100 },
  reel: { type: "baitcasting", sizeLabel: "300" },
  line: { material: "braid", testLb: "80" },
  leader: { material: "fluoro", testLb: "130" },
  safetyGear: ["Large coated net", "Long pliers", "Heavy hook cutters"],
};

describe("gear outfit evaluator", () => {
  it("rates the default GX2 combo conservatively by species", () => {
    assert.equal(evaluateOutfit(defaultOutfit, getSpeciesById("smallmouth-bass")!).level, "good");
    assert.equal(evaluateOutfit(defaultOutfit, getSpeciesById("muskellunge")!).level, "unsuitable");
    assert.equal(evaluateOutfit(defaultOutfit, getSpeciesById("northern-pike")!).level, "workable");
  });

  it("flags lure and line rating boundaries", () => {
    const perch = getSpeciesById("yellow-perch")!;
    const heavy: GearOutfit = {
      ...defaultOutfit,
      rod: { ...defaultOutfit.rod, power: "heavy", lureRatingMinOz: 0.5, lureRatingMaxOz: 2 },
    };
    assert.equal(evaluateOutfit(heavy, perch).level, "workable");
  });

  it("requires dedicated muskie gear for muskie", () => {
    const muskie = getSpeciesById("muskellunge")!;
    assert.equal(evaluateOutfit(muskieOutfit, muskie).status, "best-match");
    assert.equal(evaluateOutfit(defaultOutfit, muskie).status, "outside-rating");
  });

  it("ranks owned outfits with the best match first", () => {
    const bass = getSpeciesById("largemouth-bass")!;
    const ranked = rankOutfits([muskieOutfit, defaultOutfit, lightPanfishOutfit], bass);
    assert.equal(ranked[0].outfit.id, defaultOutfit.id);
  });

  it("rejects open-water outfits for ice jigging", () => {
    const perch = getSpeciesById("yellow-perch")!;
    const ice = {
      ...lightPanfishOutfit,
      reel: { type: "inline-ice" as const, sizeLabel: "500" },
      rod: { lengthFt: 2, lengthIn: 4, power: "ultra-light" as const },
    };
    assert.equal(evaluateOutfit(defaultOutfit, perch, "ice-jigging").status, "outside-rating");
    assert.notEqual(evaluateOutfit(ice, perch, "ice-jigging").status, "outside-rating");
  });
});
