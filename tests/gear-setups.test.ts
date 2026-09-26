import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { setupTemplates } from "../src/data/curated/gear-setups";

describe("gear setup templates", () => {
  it("includes source URLs and review dates for every template", () => {
    for (const template of setupTemplates) {
      assert.ok(template.source.url.startsWith("https://"), template.id);
      assert.match(template.source.lastVerified, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(template.rod.powerRange.length > 0, template.id);
      assert.ok(template.speciesIds.length > 0, template.id);
      assert.ok(template.techniques.length > 0, template.id);
    }
  });

  it("covers specialty boundaries for muskie and ice", () => {
    const muskie = setupTemplates.find((template) => template.id === "muskie-casting");
    const ice = setupTemplates.find((template) => template.id === "ice-panfish");
    assert.ok(muskie);
    assert.ok(ice);
    assert.ok(muskie.rod.powerRange.includes("heavy"));
    assert.ok(ice.reel.types.includes("inline-ice"));
  });
});
