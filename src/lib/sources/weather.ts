import { z } from "zod";
import type { WeatherForecast, WeatherHour } from "@/lib/types";

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

function minutesOfDay(iso: string) {
  const clock = hourClock(iso);
  if (!clock) return null;
  return clock.hour * 60 + Number(clock.minutes);
}

function isDaylightHour(iso: string, bounds?: { sunrise?: string; sunset?: string }) {
  const minute = minutesOfDay(iso);
  if (minute === null) return false;
  const date = iso.slice(0, 10);
  const sunrise =
    bounds?.sunrise?.startsWith(date) ? minutesOfDay(bounds.sunrise) : 6 * 60;
  const sunset = bounds?.sunset?.startsWith(date) ? minutesOfDay(bounds.sunset) : 20 * 60;
  if (sunrise === null || sunset === null) return false;
  return minute >= sunrise && minute < sunset;
}

function hourClock(iso: string) {
  const match = iso.match(/T(\d{2}):(\d{2})/);
  if (!match) return null;
  return { hour: Number(match[1]), minutes: match[2] };
}

function clockLabel(iso: string) {
  const clock = hourClock(iso);
  if (!clock) return iso;
  const suffix = clock.hour >= 12 ? "PM" : "AM";
  const hour12 = clock.hour % 12 || 12;
  return `${hour12} ${suffix}`;
}

/**
 * One line a shore angler can act on: the longest calm stretch, or when the day turns.
 */
export function bestShoreWindow(
  hours: readonly WeatherHour[],
  bounds?: { sunrise?: string; sunset?: string },
): string | null {
  const daytime = hours.filter((hour) => isDaylightHour(hour.time, bounds));
  if (daytime.length === 0) return null;

  let best: WeatherHour[] = [];
  let current: WeatherHour[] = [];
  for (const hour of daytime) {
    if (shoreCondition(hour).level === "good") {
      current.push(hour);
      if (current.length > best.length) best = [...current];
    } else {
      current = [];
    }
  }

  if (best.length >= 2) {
    const start = clockLabel(best[0].time);
    const end = clockLabel(best[best.length - 1].time);
    return `Best window ${start}–${end}: lighter wind and a lower chance of rain.`;
  }

  const morning = daytime.filter((hour) => (hourClock(hour.time)?.hour ?? 0) < 12);
  const afternoon = daytime.filter((hour) => (hourClock(hour.time)?.hour ?? 0) >= 12);
  const morningRough =
    morning.length > 0 &&
    morning.filter(
      (hour) => hour.precipitationProbability >= 50 || shoreCondition(hour).level !== "good",
    ).length >= Math.ceil(morning.length / 2);
  const firstClear = afternoon.find((hour) => shoreCondition(hour).level === "good");
  if (morningRough && firstClear) {
    return `Wind or rain is more likely this morning. Clearer after ${clockLabel(firstClear.time)}.`;
  }

  if (daytime.every((hour) => shoreCondition(hour).level === "avoid")) {
    return "No comfortable shore window in this forecast.";
  }

  const calmest = [...daytime].sort((first, second) => first.windSpeed - second.windSpeed)[0];
  return `Lightest wind around ${clockLabel(calmest.time)} (${Math.round(calmest.windSpeed)} km/h).`;
}
