import { z } from "zod";
import type { WeatherForecast } from "@/lib/types";

const payloadSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: z.array(z.number()),
    precipitation_probability: z.array(z.number()),
    wind_speed_10m: z.array(z.number()),
    wind_gusts_10m: z.array(z.number()),
    wind_direction_10m: z.array(z.number()),
    weather_code: z.array(z.number()),
  }),
  daily: z.object({
    sunrise: z.array(z.string()),
    sunset: z.array(z.string()),
  }),
});

export async function fetchWeather(latitude: number, longitude: number): Promise<WeatherForecast> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    timezone: "auto",
    forecast_days: "7",
    hourly:
      "temperature_2m,precipitation_probability,wind_speed_10m,wind_gusts_10m,wind_direction_10m,weather_code",
    daily: "sunrise,sunset",
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
    signal: AbortSignal.timeout(8_000),
    next: { revalidate: 1800 },
  });
  if (!response.ok) throw new Error(`Weather service returned ${response.status}`);
  return parseWeatherPayload(await response.json());
}

export function parseWeatherPayload(raw: unknown, fetchedAt = new Date().toISOString()): WeatherForecast {
  const payload = payloadSchema.parse(raw);
  const shortest = Math.min(
    payload.hourly.time.length,
    payload.hourly.temperature_2m.length,
    payload.hourly.precipitation_probability.length,
    payload.hourly.wind_speed_10m.length,
    payload.hourly.wind_gusts_10m.length,
    payload.hourly.wind_direction_10m.length,
    payload.hourly.weather_code.length,
  );

  return {
    latitude: payload.latitude,
    longitude: payload.longitude,
    timezone: payload.timezone,
    fetchedAt,
    sunrise: payload.daily.sunrise,
    sunset: payload.daily.sunset,
    hours: Array.from({ length: shortest }, (_, index) => ({
      time: payload.hourly.time[index],
      temperature: payload.hourly.temperature_2m[index],
      precipitationProbability: payload.hourly.precipitation_probability[index],
      windSpeed: payload.hourly.wind_speed_10m[index],
      windGust: payload.hourly.wind_gusts_10m[index],
      windDirection: payload.hourly.wind_direction_10m[index],
      weatherCode: payload.hourly.weather_code[index],
    })),
    attribution: { label: "Weather data by Open-Meteo.com", url: "https://open-meteo.com/" },
  };
}

export function windDirectionLabel(degrees: number) {
  const points = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return points[Math.round(degrees / 45) % 8];
}

export function shoreCondition(hour: WeatherForecast["hours"][number]) {
  if (hour.windGust >= 45 || hour.windSpeed >= 32) {
    return { level: "avoid", label: "Poor shore conditions", reason: "Strong wind or gusts make exposed shorelines hazardous." };
  }
  if (hour.windGust >= 32 || hour.windSpeed >= 22 || hour.precipitationProbability >= 70) {
    return { level: "caution", label: "Use caution", reason: "Wind, gusts, or rain may make shore access uncomfortable or unsafe." };
  }
  return { level: "good", label: "Generally manageable", reason: "Forecast values are below the planner's caution thresholds." };
}
