import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { baitsForTrip, liveBaitAllowed } from "../src/lib/gear";
import { getLocationById } from "../src/lib/fishing-locations";
import { getSpeciesById } from "../src/data/curated/species";

describe("bait and gear safeguards", () => {
  it("never marks live bait as ready to use", () => {
    const pike = getSpeciesById("northern-pike");
    const walleye = getSpeciesById("walleye");
    const ashbridges = getLocationById("ashbridges-bay");
    assert.ok(pike && walleye && ashbridges);

    for (const bait of baitsForTrip(pike, ashbridges, "2026-06-15")) {
      if (bait.liveBaitWarning || bait.kind === "natural") {
        assert.notEqual(bait.allowed, "yes", bait.name);
      }
    }
  });

  it("blocks live bait at conservation lakes and Quetico", () => {
    const heart = getLocationById("heart-lake");
    const quetico = getLocationById("quetico-park");
    assert.equal(liveBaitAllowed(heart!), false);
    assert.equal(liveBaitAllowed(quetico!), false);

    const pike = getSpeciesById("northern-pike");
    assert.ok(pike && heart);
    const baits = baitsForTrip(pike, heart, "2026-04-15").filter((bait) => bait.liveBaitWarning);
    assert.ok(baits.length > 0);
    assert.ok(baits.every((bait) => bait.allowed === "no"));
  });
});
