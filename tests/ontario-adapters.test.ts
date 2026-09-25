import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { accessPointCategory, directionFrom, withAccessPointLocation } from "../src/lib/access-points";
import { parseAccessFeatures, parseFmzZoneId, parseOntarioGisDate } from "../src/lib/sources/ontario-gis";
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

  it("preserves official access evidence without treating unknown values as facts", () => {
    const [point] = parseAccessFeatures({
      features: [{
        attributes: {
          OGF_ID: 104317812,
          FISHING_ACCESS_POINT_TYPE: "Shoreline Access",
          SITE_NAME: "Ashbridge's Bay Park",
          PARKING_PRESENCE_FLG: "Yes",
          SITE_OWNERSHIP_TYPE: "Municipal",
          MATERIAL_TYPE: "Unknown",
          ACCESSIBILITY_FLG: "Unknown",
          USER_FEE_FLG: "Yes",
          SITE_LAST_VERIFICATION_DATE: 1359994695000,
          SITE_PHOTO_URL: "https://example.org/photo.jpg",
          ADDITIONAL_INFORMATION_URL: "https://example.org/info",
        },
        geometry: { x: -79.31, y: 43.66 },
      }],
    });
    assert.equal(point.evidence?.siteName, "Ashbridge's Bay Park");
    assert.equal(point.evidence?.ownership, "Municipal");
    assert.equal(point.evidence?.parkingRecorded, true);
    assert.equal(point.evidence?.userFeeRecorded, true);
    assert.equal(point.evidence?.accessibilityRecorded, undefined);
    assert.equal(point.evidence?.surface, undefined);
    assert.equal(point.evidence?.verifiedDate, "2013-02-04");
    assert.equal(point.evidence?.photoUrl, "https://example.org/photo.jpg");
    assert.equal(point.evidence?.informationUrl, "https://example.org/info");
    assert.match(point.evidence?.officialRecordUrl ?? "", /where=OGF_ID%3D104317812/);
    assert.equal(parseOntarioGisDate("not a timestamp"), undefined);
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

  it("sorts official access records by distance and labels direction and type", () => {
    const source = { name: "Ontario", url: "https://data.ontario.ca", lastVerified: "2026-08-30", kind: "official" as const };
    const points = withAccessPointLocation(
      { latitude: 43.7, longitude: -79.23 },
      [
        { id: "far", type: "Boat Launch", coordinates: { latitude: 43.8, longitude: -79.23 }, source },
        { id: "near", type: "Shoreline Access", coordinates: { latitude: 43.71, longitude: -79.23 }, source },
      ],
    );
    assert.deepEqual(points.map((point) => point.id), ["near", "far"]);
    assert.equal(points[0].direction, "N");
    assert.equal(directionFrom({ latitude: 43.7, longitude: -79.23 }, { latitude: 43.69, longitude: -79.22 }), "SE");
    assert.equal(accessPointCategory("Shoreline Access"), "Shore access");
    assert.equal(accessPointCategory("Boat Launch"), "Boat launch");
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
