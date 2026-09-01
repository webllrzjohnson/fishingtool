import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shoreCondition } from "../src/lib/sources/weather";
import type { WeatherHour } from "../src/lib/types";

function hour(overrides: Partial<WeatherHour>): WeatherHour {
  return {
    time: "2026-08-31T12:00",
    temperature: 18,
    precipitationProbability: 10,
    windSpeed: 12,
    windGust: 18,
    windDirection: 270,
    weatherCode: 1,
    ...overrides,
  };
}

describe("shore condition summaries", () => {
  it("explains good, caution, and avoid thresholds from raw weather values", () => {
    assert.equal(shoreCondition(hour({})).level, "good");
    assert.equal(shoreCondition(hour({ windSpeed: 24 })).level, "caution");
    assert.equal(shoreCondition(hour({ precipitationProbability: 80 })).level, "caution");
    assert.equal(shoreCondition(hour({ windGust: 50 })).level, "avoid");
  });
});
