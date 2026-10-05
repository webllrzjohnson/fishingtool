import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { commonSpecies, getSpeciesById } from "../src/data/curated/species";
import { getSpeciesImage } from "../src/data/curated/species-images";
import { searchSpecies } from "../src/lib/species-search";

describe("Ontario fish reference", () => {
  it("covers all 18 existing fish with Ontario range, qualitative depth, seasonal habitat and official sources", () => {
    assert.equal(commonSpecies.length, 18);
    assert.equal(new Set(commonSpecies.map((fish) => fish.id)).size, 18);
    for (const fish of commonSpecies) {
      assert.ok(fish.distribution.length > 30, fish.id);
      assert.ok(fish.depthGuidance.length > 30, fish.id);
      assert.match(fish.seasonalDepth, /Spring:/, fish.id);
      assert.match(fish.seasonalDepth, /Summer:/, fish.id);
      assert.match(fish.seasonalDepth, /Fall:/, fish.id);
      assert.match(fish.seasonalDepth, /Winter:/, fish.id);
      assert.ok(fish.guideSources.length >= 1, fish.id);
      for (const source of fish.guideSources) {
        assert.match(source.url, /^https:\/\/www\.ontario\.ca\/page\/[a-z-]+$/, fish.id);
        assert.equal(source.kind, "official");
      }
      const image = getSpeciesImage(fish.id);
      assert.ok(image, fish.id);
      const src = image.kind === "ai-generated" || image.kind === "owner-photo" ? image.src : image.localSrc;
      assert.ok(existsSync(`public${src}`), fish.id);
      assert.match(image.alt.toLowerCase(), /illustration|photograph/, fish.id);
    }
  });

  it("searches case-insensitively by name, alias and region; trims terms and returns empty for no match", () => {
    assert.equal(searchSpecies(commonSpecies, "").length, 18);
    assert.deepEqual(searchSpecies(commonSpecies, "  PiCkErEl  ").map((f) => f.id), ["walleye"]);
    assert.deepEqual(searchSpecies(commonSpecies, "CoHo").map((f) => f.id), ["pacific-salmon"]);
    assert.deepEqual(searchSpecies(commonSpecies, "St. Lawrence muskellunge").map((f) => f.id), ["muskellunge"]);
    assert.ok(searchSpecies(commonSpecies, "southern").length > 1);
    assert.deepEqual(searchSpecies(commonSpecies, "no-such-fish"), []);
  });

  it("labels representative images honestly and separates combined species", () => {
    assert.match(getSpeciesById("pacific-salmon")?.identificationNote ?? "", /Chinook salmon shown.*Coho/);
    assert.deepEqual(getSpeciesById("pacific-salmon")?.guideSources.map((s) => s.url), [
      "https://www.ontario.ca/page/chinook-salmon", "https://www.ontario.ca/page/coho-salmon",
    ]);
    assert.equal(getSpeciesById("crappie")?.guideSources[0].url, "https://www.ontario.ca/page/black-crappie");
    assert.ok(!getSpeciesById("pacific-salmon")?.aliases.includes("pink salmon"));
    assert.match(getSpeciesImage("crappie")?.alt ?? "", /^AI-generated realistic black crappie/);
    assert.match(getSpeciesImage("pacific-salmon")?.alt ?? "", /^AI-generated realistic Chinook salmon/);
    for (const id of commonSpecies.map((species) => species.id)) {
      assert.equal(getSpeciesImage(id)?.kind, "ai-generated", id);
    }
  });

  it("presents search/count/empty and guidance labels on the index and details", () => {
    const directory = readFileSync("src/components/species/species-directory.tsx", "utf8");
    const card = readFileSync("src/components/species/species-card.tsx", "utf8");
    const detail = readFileSync("src/app/species/[slug]/page.tsx", "utf8");
    const nav = readFileSync("src/components/app-nav.tsx", "utf8");
    assert.match(directory, /type="search"/);
    assert.match(directory, /role="status" aria-live="polite"/);
    assert.match(directory, /No fish match/);
    assert.match(card, /species\.distribution/);
    assert.match(card, /species\.depthGuidance/);
    assert.match(card, /Lures/);
    assert.match(detail, /species\.seasonalDepth/);
    assert.match(detail, /species\.guideSources\.map/);
    assert.match(detail, /species\.identificationNote/);
    assert.match(nav, /href: "\/species", label: "Fish guide"/);
    assert.match(readFileSync("src/components/species/species-illustration.tsx", "utf8"), /AI-generated illustration/);
    assert.match(readFileSync("src/components/species/species-illustration.tsx", "utf8"), /image\.watermark} watermark/);
    assert.doesNotMatch(readFileSync("src/components/species/species-illustration.tsx", "utf8"), /onError/);
  });
});
