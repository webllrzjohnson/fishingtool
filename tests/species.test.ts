import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { getSpeciesImage, speciesImageCatalog } from "../src/data/curated/species-images";

import { commonSpecies, getSpeciesById, matchSpecies } from "../src/data/curated/species";
import { gearFitForSpecies } from "../src/lib/gear-fit";

describe("species and bait catalog", () => {
  it("covers the common Ontario sport fish from the product plan", () => {
    const ids = commonSpecies.map((species) => species.id);
    for (const id of [
      "walleye",
      "northern-pike",
      "smallmouth-bass",
      "largemouth-bass",
      "yellow-perch",
      "crappie",
      "brook-trout",
      "lake-trout",
      "rainbow-trout",
      "brown-trout",
      "pacific-salmon",
      "muskellunge",
      "lake-whitefish",
      "carp",
      "channel-catfish",
    ]) {
      assert.ok(ids.includes(id), id);
    }
  });

  it("separates natural bait from artificial lures and warns on live bait", () => {
    for (const species of commonSpecies) {
      assert.ok(species.baits.length > 0, species.id);
      assert.ok(species.source.url.startsWith("https://"));
    }
    const pike = getSpeciesById("northern-pike");
    assert.ok(pike);
    assert.ok(pike.baits.some((bait) => bait.kind === "artificial"));
    assert.ok(pike.baits.some((bait) => bait.liveBaitWarning));
  });

  it("matches location labels and reports gear fit conservatively", () => {
    assert.equal(matchSpecies("Chinook salmon")?.id, "pacific-salmon");
    assert.equal(matchSpecies("pickerel")?.id, "walleye");
    assert.equal(gearFitForSpecies(getSpeciesById("smallmouth-bass")).level, "good");
    assert.equal(gearFitForSpecies(getSpeciesById("muskellunge")).level, "unsuitable");
    assert.equal(gearFitForSpecies(getSpeciesById("northern-pike")).level, "workable");
  });

  it("uses local species imagery and verifies every reviewed AI asset", () => {
    for (const species of commonSpecies) {
      const image = getSpeciesImage(species.id);
      assert.ok(image, species.id);
      const src = image.kind === "ai-generated" || image.kind === "owner-photo" ? image.src : image.localSrc;
      assert.ok(src.startsWith("/species/"), species.id);
      assert.ok(existsSync(`public${src}`), species.id);
      if (image.kind === "ai-generated") {
        assert.ok(image.src.startsWith("/species/generated/"), species.id);
        assert.equal(image.watermark, "lesterfish", species.id);
        assert.match(image.caveat, /not a photograph/i, species.id);
        assert.match(image.sha256, /^[a-f0-9]{64}$/, species.id);
        assert.equal(createHash("sha256").update(readFileSync(`public${src}`)).digest("hex"), image.sha256, species.id);
      }
    }
    assert.equal(Object.keys(speciesImageCatalog).length, commonSpecies.length);
  });
});
