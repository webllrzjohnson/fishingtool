"use client";

import { useEffect, useMemo, useState } from "react";
import { shoreCondition, windDirectionLabel, bestShoreWindow } from "@/lib/sources/weather";
import type { Coordinates, WeatherForecast } from "@/lib/types";
import { AsyncState } from "@/components/ui/async-state";
import { Callout } from "@/components/ui/card";

export function WeatherPanel({ coordinates, tripDate }: { coordinates?: Coordinates; tripDate?: string }) {
  const [forecast, setForecast] = useState<WeatherForecast>();
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!coordinates) return;
    const controller = new AbortController();
    fetch(`/api/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}`, { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Weather unavailable");
        return body as WeatherForecast;
      })
      .then((data) => {
        setForecast(data);
        setError("");
      })
      .catch((reason) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "Weather unavailable");
      });
    return () => controller.abort();
  }, [coordinates, retryCount]);

  const hours = useMemo(() => {
    if (!forecast) return [];
    const selectedDate = tripDate || forecast.hours[0]?.time.slice(0, 10);
    return forecast.hours.filter((hour) => hour.time.startsWith(selectedDate)).filter((_, index) => index % 3 === 0);
  }, [forecast, tripDate]);

  if (!coordinates) {
    return <AsyncState unavailable unavailableMessage="Coordinates are not yet available for this location." />;
  }

  if (!forecast && !error) {
    return <AsyncState loading loadingMessage="Loading wind and weather…" />;
  }

  if (error && !forecast) {
    return (
      <AsyncState
        error={error}
        onRetry={() => {
          setError("");
          setForecast(undefined);
          setRetryCount((count) => count + 1);
        }}
      />
    );
  }

  if (!forecast) return null;

  if (!hours.length) {
    return (
      <AsyncState
        empty
        emptyMessage="This date is outside the 7-day forecast. Recheck closer to your trip."
      />
    );
  }

  const representative = hours[Math.min(2, hours.length - 1)];
  const condition = shoreCondition(representative);
  const conditionTone = condition.level === "good" ? "emerald" : condition.level === "caution" ? "amber" : "red";
  const day = hours[0]?.time.slice(0, 10) ?? "";
  const windowLine = bestShoreWindow(
    forecast.hours.filter((hour) => hour.time.startsWith(day)),
    {
      sunrise: forecast.sunrise.find((value) => value.startsWith(day)),
      sunset: forecast.sunset.find((value) => value.startsWith(day)),
    },
  );

  return (
    <div>
      <Callout tone={conditionTone}>
        <span className="font-black">{condition.label}</span>
        <span className="mt-1 block text-sm font-normal">{condition.reason}</span>
        {windowLine ? <span className="mt-2 block text-sm font-bold">{windowLine}</span> : null}
      </Callout>
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
