import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseAccessFeatures, parseFmzZoneId } from "../src/lib/sources/ontario-gis";
import { parseWeatherPayload, windDirectionLabel } from "../src/lib/sources/weather";

describe("Ontario GIS response parsing", () => {
  it("maps access-point fixtures into source-backed records", () => {
    const points = parseAccessFeatures({
      features: [
        {
          attributes: { OGF_ID: 99, FISHING_ACCESS_POINT_TYPE: "Boat Launch" },
          geometry: { x: -79.38, y: 43.65 },
        },
        {
          attributes: { OBJECTID: 2 },
        },
      ],
    });
    assert.equal(points.length, 1);
    assert.equal(points[0].type, "Boat Launch");
    assert.equal(points[0].coordinates.latitude, 43.65);
    assert.equal(points[0].source.kind, "official");
  });

  it("reads an FMZ polygon identifier from a point-in-polygon fixture", () => {
    assert.equal(
      parseFmzZoneId({
        features: [{ attributes: { FISHERIES_MANAGEMENT_ZONE_ID: 16 } }],
      }),
      "16",
    );
    assert.equal(parseFmzZoneId({ features: [] }), null);
  });
});

describe("weather payload parsing", () => {
  it("validates Open-Meteo-shaped fixtures and compass labels", () => {
    const forecast = parseWeatherPayload({
      latitude: 43.65,
      longitude: -79.38,
      timezone: "America/Toronto",
      hourly: {
        time: ["2026-08-31T12:00"],
        temperature_2m: [18],
        precipitation_probability: [10],
        wind_speed_10m: [12],
        wind_gusts_10m: [18],
        wind_direction_10m: [270],
        weather_code: [1],
      },
      daily: { sunrise: ["2026-08-31T06:30"], sunset: ["2026-08-31T19:50"] },
    });
    assert.equal(forecast.hours[0].windSpeed, 12);
    assert.equal(windDirectionLabel(270), "W");
  });
});
