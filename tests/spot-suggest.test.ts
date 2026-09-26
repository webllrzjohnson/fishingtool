import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { distanceBetweenKm } from "../src/lib/access-points";
import { fishingLocations } from "../src/lib/fishing-locations";
import {
  estimateDriveMinutes,
  estimateRoadDistanceKm,
  maxStraightLineKmForDriveMinutes,
  rankSuggestCandidates,
  selectSuggestResults,
  speciesIdsForLocation,
  suggestNearbySpots,
  suggestSpeciesOptions,
  withinSuggestRange,
} from "../src/lib/spots/suggest";

const toronto = { latitude: 43.6532, longitude: -79.3832 };

describe("drive-time estimate", () => {
  it("applies road factor and average speed", () => {
    const straightKm = 100;
    assert.equal(estimateRoadDistanceKm(straightKm), 135);
    assert.equal(estimateDriveMinutes(straightKm), Math.round((135 / 70) * 60));
  });

  it("inverts drive minutes back to straight-line km", () => {
    const km = maxStraightLineKmForDriveMinutes(120);
    assert.ok(Math.abs(estimateDriveMinutes(km) - 120) <= 1);
  });

  it("filters by distance or drive presets", () => {
    assert.equal(withinSuggestRange(40, "distance", 50), true);
    assert.equal(withinSuggestRange(60, "distance", 50), false);
    const minutes = estimateDriveMinutes(50);
    assert.equal(withinSuggestRange(50, "drive", minutes), true);
    assert.equal(withinSuggestRange(50, "drive", minutes - 1), false);
  });
});

describe("suggest species filter", () => {
  it("lists catalog fish only", () => {
    const options = suggestSpeciesOptions();
    assert.ok(options.length > 5);
    assert.ok(options.some((option) => option.id === "walleye" && option.label === "Walleye"));
    for (const option of options) {
      assert.match(option.id, /^[a-z0-9-]+$/);
      assert.doesNotMatch(option.label, /accessible|none expected|where open/i);
    }
  });
});

describe("suggest ranking", () => {
  it("returns GTA shore spots within about one hour of Toronto", () => {
    const pool = fishingLocations
      .filter((location) => location.coordinates)
      .map((location) => ({
        id: `curated-${location.id}`,
        kind: "curated" as const,
        label: location.name,
        detail: location.municipality,
        latitude: location.coordinates!.latitude,
        longitude: location.coordinates!.longitude,
        distanceKm: distanceBetweenKm(toronto, location.coordinates!),
        driveMinutesEstimate: 0,
        shoreSuitability: location.shoreSuitability,
        speciesChips: location.expectedSpecies.slice(0, 3),
        speciesIds: speciesIdsForLocation(location),
        popularity: location.popularity,
      }));

    for (const entry of pool) {
      entry.driveMinutesEstimate = estimateDriveMinutes(entry.distanceKm);
    }

    const ranked = rankSuggestCandidates(pool, { mode: "drive", range: 60, shoreOnly: true });
    assert.ok(ranked.length > 0);
    assert.ok(
      ranked.some((spot) => /ashbridges|toronto|credit|bronte/i.test(spot.label)),
      "expected a GTA shore-friendly spot",
    );
    for (const spot of ranked) {
      assert.ok(spot.driveMinutesEstimate <= 60);
    }
  });

  it("excludes walleye spots that do not list walleye", () => {
    const pool = fishingLocations
      .filter((location) => location.coordinates)
      .map((location) => ({
        id: location.id,
        kind: "curated" as const,
        label: location.name,
        latitude: location.coordinates!.latitude,
        longitude: location.coordinates!.longitude,
        distanceKm: 10,
        driveMinutesEstimate: estimateDriveMinutes(10),
        shoreSuitability: location.shoreSuitability,
        speciesChips: location.expectedSpecies.slice(0, 3),
        speciesIds: speciesIdsForLocation(location),
        popularity: location.popularity,
      }));

    const walleyeOnly = rankSuggestCandidates(pool, {
      mode: "distance",
      range: 200,
      species: "walleye",
      shoreOnly: false,
    });

    assert.ok(walleyeOnly.length > 0);
    for (const spot of walleyeOnly) {
      const location = fishingLocations.find((entry) => entry.name === spot.label);
      assert.ok(location);
      const ids = speciesIdsForLocation(location!);
      const hasWalleye =
        ids.includes("walleye") ||
        location!.expectedSpecies.some((name) => name.toLowerCase().includes("walleye"));
      assert.ok(hasWalleye, `${spot.label} should list walleye`);
    }
  });

  it("prefers closer excellent-shore spots over farther ones", () => {
    const ranked = rankSuggestCandidates(
      [
        {
          id: "far",
          kind: "curated",
          label: "Far spot",
          latitude: 45,
          longitude: -80,
          distanceKm: 80,
          driveMinutesEstimate: estimateDriveMinutes(80),
          shoreSuitability: "excellent",
          speciesChips: [],
          speciesIds: [],
          popularity: "featured",
        },
        {
          id: "near",
          kind: "curated",
          label: "Near spot",
          latitude: 44,
          longitude: -79,
          distanceKm: 20,
          driveMinutesEstimate: estimateDriveMinutes(20),
          shoreSuitability: "good",
          speciesChips: [],
          speciesIds: [],
          popularity: "local",
        },
      ],
      { mode: "distance", range: 200, shoreOnly: true },
    );
    assert.equal(ranked[0]?.label, "Near spot");
  });
});

describe("suggest range bands", () => {
  it("2 hour and 200 km presets include farther spots, not only ultra-local ones", async () => {
    const twoHour = await suggestNearbySpots(toronto, {
      mode: "drive",
      range: 120,
      limit: 12,
      shoreOnly: true,
    });
    const twoHundredKm = await suggestNearbySpots(toronto, {
      mode: "distance",
      range: 200,
      limit: 12,
      shoreOnly: true,
    });
    const thirtyMin = await suggestNearbySpots(toronto, {
      mode: "drive",
      range: 30,
      limit: 12,
      shoreOnly: true,
    });

    assert.ok(twoHour.length > 0);
    assert.ok(
      Math.max(...twoHour.map((spot) => spot.driveMinutesEstimate)) >= 90,
      "2 hr results should reach toward the outer end of the range",
    );
    assert.ok(
      Math.max(...twoHundredKm.map((spot) => spot.distanceKm)) >= 80,
      "200 km results should include spots well beyond the GTA core",
    );
    assert.ok(Math.max(...thirtyMin.map((spot) => spot.driveMinutesEstimate)) <= 30);

    const threeHour = await suggestNearbySpots(toronto, {
      mode: "drive",
      range: 180,
      limit: 12,
      shoreOnly: true,
    });
    const fourHour = await suggestNearbySpots(toronto, {
      mode: "drive",
      range: 240,
      limit: 12,
      shoreOnly: true,
    });
    assert.ok(threeHour.length > 0);
    assert.ok(
      Math.max(...threeHour.map((spot) => spot.driveMinutesEstimate)) >= 120,
      "3 hr results should reach beyond the 2 hr band",
    );
    assert.ok(fourHour.every((spot) => spot.driveMinutesEstimate <= 240));
    assert.ok(
      Math.max(...fourHour.map((spot) => spot.driveMinutesEstimate)) >=
        Math.max(...twoHour.map((spot) => spot.driveMinutesEstimate)),
      "4 hr should reach at least as far as 2 hr",
    );

    const ranked = rankSuggestCandidates(
      fishingLocations
        .filter((location) => location.coordinates)
        .map((location) => {
          const distanceKm = distanceBetweenKm(toronto, location.coordinates!);
          return {
            id: `curated-${location.id}`,
            kind: "curated" as const,
            label: location.name,
            latitude: location.coordinates!.latitude,
            longitude: location.coordinates!.longitude,
            distanceKm,
            driveMinutesEstimate: estimateDriveMinutes(distanceKm),
            shoreSuitability: location.shoreSuitability,
            speciesChips: location.expectedSpecies.slice(0, 3),
            speciesIds: speciesIdsForLocation(location),
            popularity: location.popularity,
          };
        }),
      { mode: "drive", range: 120, shoreOnly: true },
    );
    const banded = selectSuggestResults(ranked, { mode: "drive", range: 120, limit: 12, origin: toronto });
    assert.ok(Math.max(...banded.map((spot) => spot.driveMinutesEstimate)) >= 90);
  });
});


describe("suggest directional spread", () => {
  it("fans out across compass bearings from Toronto within 200 km", async () => {
    const spots = await suggestNearbySpots(toronto, {
      mode: "distance",
      range: 200,
      limit: 16,
      shoreOnly: true,
    });
    const directions = new Set(spots.map((spot) => spot.direction).filter(Boolean));
    assert.ok(
      directions.size >= 6,
      `expected suggestions in many directions, got ${[...directions].join(", ")}`,
    );
    for (const spot of spots) {
      assert.ok(spot.direction, `${spot.label} should include a compass direction`);
    }
  });
});
