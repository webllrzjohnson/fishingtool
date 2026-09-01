"use client";

import { useEffect, useMemo, useState } from "react";
import { shoreCondition, windDirectionLabel } from "@/lib/sources/weather";
import type { Coordinates, WeatherForecast } from "@/lib/types";

export function WeatherPanel({ coordinates, tripDate }: { coordinates?: Coordinates; tripDate?: string }) {
  const [forecast, setForecast] = useState<WeatherForecast>();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!coordinates) return;
    const controller = new AbortController();
    fetch(`/api/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}`, { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Weather unavailable");
        return body as WeatherForecast;
      })
      .then(setForecast)
      .catch((reason) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "Weather unavailable");
      });
    return () => controller.abort();
  }, [coordinates]);

  const hours = useMemo(() => {
    if (!forecast) return [];
    const selectedDate = tripDate || forecast.hours[0]?.time.slice(0, 10);
    return forecast.hours.filter((hour) => hour.time.startsWith(selectedDate)).filter((_, index) => index % 3 === 0);
  }, [forecast, tripDate]);

  if (!coordinates) return <p className="text-sm text-slate-500">Coordinates are not yet available for this location.</p>;
  if (error) return <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{error}</p>;
  if (!forecast) return <p className="animate-pulse text-sm text-slate-500">Loading wind and weather…</p>;
  if (!hours.length) {
    return (
      <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700">
        This date is outside the 7-day forecast. Recheck closer to your trip.
      </p>
    );
  }

  const representative = hours[Math.min(2, hours.length - 1)];
  const condition = shoreCondition(representative);
  const conditionClass =
    condition.level === "good"
      ? "bg-emerald-50 text-emerald-900"
      : condition.level === "caution"
        ? "bg-amber-50 text-amber-900"
        : "bg-red-50 text-red-900";

  return (
    <div>
      <div className={`rounded-xl p-3 ${conditionClass}`}>
        <p className="font-black">{condition.label}</p>
        <p className="mt-1 text-sm">{condition.reason}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {hours.slice(0, 8).map((hour) => (
          <div key={hour.time} className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-bold text-slate-500">{formatClock(hour.time, { includeMinutes: false })}</p>
            <p className="mt-1 text-lg font-black">{Math.round(hour.temperature)}°C</p>
            <p className="mt-1 text-xs text-slate-600">
              Wind {Math.round(hour.windSpeed)} km/h {windDirectionLabel(hour.windDirection)}
            </p>
            <p className="text-xs text-slate-600">Gust {Math.round(hour.windGust)} km/h</p>
            <p className="text-xs text-slate-600">Rain {hour.precipitationProbability}%</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <a href={forecast.attribution.url} target="_blank" rel="noopener noreferrer" className="underline">
          {forecast.attribution.label}
        </a>
        <a
          href="https://weather.gc.ca/warnings/index_e.html?prov=on"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Environment Canada alerts
        </a>
        <span>Fetched {forecast.fetchedAt.slice(0, 16).replace("T", " ")} UTC</span>
      </div>
      {forecast.sunrise[0] && forecast.sunset[0] ? (
        <p className="mt-2 text-xs text-slate-500">
          Sunrise {formatClock(forecast.sunrise[0])}
          {" · "}
          Sunset {formatClock(forecast.sunset[0])}
        </p>
      ) : null}
    </div>
  );
}

function formatClock(iso: string, options?: { includeMinutes?: boolean }) {
  const match = iso.match(/T(\d{2}):(\d{2})/);
  if (!match) return iso;
  const hour24 = Number(match[1]);
  const minutes = match[2];
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  if (options?.includeMinutes === false) return `${hour12} ${suffix}`;
  return `${hour12}:${minutes} ${suffix}`;
}
