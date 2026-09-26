import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shoreCondition, bestShoreWindow } from "../src/lib/sources/weather";
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

  it("names a calm stretch and a morning that should wait", () => {
    const calm = [
      hour({ time: "2026-08-31T08:00", windSpeed: 10, windGust: 14, precipitationProbability: 10 }),
      hour({ time: "2026-08-31T09:00", windSpeed: 12, windGust: 16, precipitationProbability: 20 }),
      hour({ time: "2026-08-31T15:00", windSpeed: 28, windGust: 36, precipitationProbability: 40 }),
    ];
    assert.match(bestShoreWindow(calm) ?? "", /Best window 8 AM–9 AM/);

    const wetMorning = [
      hour({ time: "2026-08-31T08:00", windSpeed: 18, precipitationProbability: 80 }),
      hour({ time: "2026-08-31T09:00", windSpeed: 18, precipitationProbability: 70 }),
      hour({ time: "2026-08-31T14:00", windSpeed: 10, windGust: 14, precipitationProbability: 10 }),
    ];
    assert.match(bestShoreWindow(wetMorning) ?? "", /Clearer after 2 PM/);
  });

  it("stops the calm window at sunset", () => {
    const hours = [
      hour({ time: "2026-09-26T16:00", windSpeed: 10, windGust: 14, precipitationProbability: 5 }),
      hour({ time: "2026-09-26T17:00", windSpeed: 10, windGust: 14, precipitationProbability: 5 }),
      hour({ time: "2026-09-26T18:00", windSpeed: 10, windGust: 14, precipitationProbability: 5 }),
      hour({ time: "2026-09-26T19:00", windSpeed: 8, windGust: 12, precipitationProbability: 0 }),
      hour({ time: "2026-09-26T20:00", windSpeed: 6, windGust: 10, precipitationProbability: 0 }),
    ];
    const line = bestShoreWindow(hours, {
      sunrise: "2026-09-26T07:05",
      sunset: "2026-09-26T19:03",
    });
    assert.match(line ?? "", /4 PM–7 PM/);
    assert.doesNotMatch(line ?? "", /8 PM/);
  });
});
