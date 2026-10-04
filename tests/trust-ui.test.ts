import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RulesChecker } from "../src/components/rules/rules-checker";
import { AccessSection } from "../src/components/spots/spot-sections";
import { araSource } from "../src/lib/sources";
import { suggestShareQuery } from "../src/lib/spots/share";

describe("trust and access copy", () => {
  it("defaults the exact-water exception to unresolved and hides cross-edition limits", () => {
    const current = renderToStaticMarkup(createElement(RulesChecker, {
      initialFmz: "fmz-16", initialDate: "2026-07-01",
    }));
    assert.match(current, /checked=""/);
    assert.match(current, /Official exception check required/);
    assert.match(current, /Zone-wide 2026 summary/);

    const otherYear = renderToStaticMarkup(createElement(RulesChecker, {
      initialFmz: "fmz-16", initialDate: "2027-07-01",
    }));
    assert.match(otherYear, /Check current edition/);
    assert.doesNotMatch(otherYear, /Zone-wide licence limit \(2026\)/);
  });

  it("warns prominently about private and unknown access", () => {
    const html = renderToStaticMarkup(createElement(AccessSection, {
      points: [{
        id: "private", type: "Shoreline access", coordinates: { latitude: 44, longitude: -79 },
        source: araSource, distanceKm: 1, direction: "N", evidence: { ownership: "Private" },
      }],
    }));
    assert.match(html, /Nearby access references/);
    assert.match(html, /Private property and unknown ownership are not public fishing access/);
    assert.match(html, /do not enter without permission/);
  });

  it("strips GPS coordinates from existing and new shareable page URLs", () => {
    const current = new URLSearchParams("name=Harbour&olat=43.12345&olon=-79.12345&oname=Your+location");
    const gps = suggestShareQuery(current, {
      origin: { kind: "gps", label: "Your location", coordinates: { latitude: 44.12, longitude: -80.34 } },
      mode: "drive", range: 60, species: "",
    });
    assert.equal(gps.get("name"), "Harbour");
    assert.equal(gps.has("olat"), false);
    assert.equal(gps.has("olon"), false);
    assert.equal(gps.has("oname"), false);

    const place = suggestShareQuery(gps, {
      origin: { kind: "place", label: "Barrie", coordinates: { latitude: 44.39, longitude: -79.69 } },
      mode: "distance", range: 50, species: "",
    });
    assert.equal(place.get("olat"), "44.39000");
    assert.equal(place.get("oname"), "Barrie");
  });
});
