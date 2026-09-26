"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AsyncState } from "@/components/ui/async-state";
import { KeyLegend } from "@/components/ui/key-legend";
import { compassName, formatDistance } from "@/lib/spots/directions";
import type { SpotSuggestion } from "@/lib/spots/search";
import {
  formatDriveTimeEstimate,
  suggestSpeciesOptions,
  type SuggestMode,
  type SuggestSpot,
} from "@/lib/spots/suggest";
import type { Coordinates } from "@/lib/types";

const DEBOUNCE_MS = 250;

const DISTANCE_PRESETS = [25, 50, 100, 200] as const;
const DRIVE_PRESETS = [30, 60, 120, 180, 240] as const;

const SUGGEST_BADGE_LEGEND = [
  {
    label: "Excellent shore",
    meaning: "Strong walk-in / pier fishing",
    swatchClassName: "bg-teal-100 text-teal-900",
  },
  {
    label: "Official access",
    meaning: "Listed in Ontario’s fishing access map",
    swatchClassName: "bg-amber-100 text-amber-900",
  },
  {
    label: "Species",
    meaning: "Fish commonly noted for that spot",
    swatchClassName: "bg-slate-200 text-slate-700",
  },
] as const;

type Origin =
  | { kind: "gps"; label: string; coordinates: Coordinates }
  | { kind: "place"; label: string; coordinates: Coordinates };

function toSpotSuggestion(spot: SuggestSpot): SpotSuggestion {
  return {
    id: spot.id,
    kind: spot.kind === "curated" ? "curated" : spot.kind === "harbour" ? "place" : "access",
    label: spot.label,
    detail: spot.detail,
    latitude: spot.latitude,
    longitude: spot.longitude,
  };
}

function shoreBadge(suitability?: SuggestSpot["shoreSuitability"]) {
  if (suitability === "excellent") return "Excellent shore";
  if (suitability === "good") return "Good shore";
  return undefined;
}

export type SuggestShareState = {
  origin: Origin;
  mode: SuggestMode;
  range: number;
  species: string;
};

export function SpotSuggest({
  onPick,
  initial,
  onShare,
}: {
  onPick: (suggestion: SpotSuggestion) => void;
  initial?: SuggestShareState;
  onShare?: (state: SuggestShareState | null) => void;
}) {
  const speciesOptions = useMemo(() => suggestSpeciesOptions(), []);
  const [origin, setOrigin] = useState<Origin | null>(initial?.origin ?? null);
  const [placeQuery, setPlaceQuery] = useState(initial?.origin?.kind === "place" ? initial.origin.label : "");
  const [placeSuggestions, setPlaceSuggestions] = useState<SpotSuggestion[]>([]);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState("");
  const [mode, setMode] = useState<SuggestMode>(initial?.mode ?? "drive");
  const [range, setRange] = useState<number>(initial?.range ?? 60);
  const [species, setSpecies] = useState(initial?.species ?? "");
  const [spots, setSpots] = useState<SuggestSpot[]>([]);
  const [driveTimes, setDriveTimes] = useState<"road" | "estimate">("estimate");
  const [resolvedKey, setResolvedKey] = useState("");
  const [error, setError] = useState("");
  const listboxId = useId();
  const suppressPlaceSearch = useRef(Boolean(initial?.origin));

  const placeTerm = placeQuery.trim();
  const canSearchPlaces = placeTerm.length >= 3;
  const suggestKey = origin
    ? `${origin.coordinates.latitude.toFixed(5)},${origin.coordinates.longitude.toFixed(5)}|${mode}|${range}|${species}`
    : "";
  const loading = Boolean(suggestKey) && suggestKey !== resolvedKey;

  useEffect(() => {
    if (!canSearchPlaces) return;
    if (suppressPlaceSearch.current) {
      suppressPlaceSearch.current = false;
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/spots/search?q=${encodeURIComponent(placeTerm)}`, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : { suggestions: [] }))
        .then((body) =>
          setPlaceSuggestions((body.suggestions ?? []).filter((s: SpotSuggestion) => s.latitude)),
        )
        .catch(() => setPlaceSuggestions([]));
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [canSearchPlaces, placeTerm]);

  useEffect(() => {
    onShare?.(origin ? { origin, mode, range, species } : null);
  }, [origin, mode, range, species, onShare]);

  useEffect(() => {
    if (!origin) return;
    const controller = new AbortController();
    const params = new URLSearchParams({
      lat: origin.coordinates.latitude.toFixed(5),
      lon: origin.coordinates.longitude.toFixed(5),
      mode,
      range: String(range),
      shore: "1",
    });
    if (species) params.set("species", species);

    fetch(`/api/spots/suggest?${params}`, { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Could not load suggestions.");
        return body as { spots?: SuggestSpot[]; driveTimes?: "road" | "estimate" };
      })
      .then((body) => {
        setSpots(body.spots ?? []);
        setDriveTimes(body.driveTimes === "road" ? "road" : "estimate");
        setError("");
      })
      .catch((reason) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "Could not load suggestions.");
        setSpots([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setResolvedKey(suggestKey);
      });

    return () => controller.abort();
  }, [origin, mode, range, species, suggestKey]);

  function useGps() {
    setLocateError("");
    if (!("geolocation" in navigator)) {
      setLocateError("This browser cannot share your location.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin({
          kind: "gps",
          label: "Your location",
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
        setLocating(false);
      },
      (geoError) => {
        setLocateError(
          geoError.code === geoError.PERMISSION_DENIED
            ? "Location permission was declined."
            : "Your location could not be read.",
        );
        setLocating(false);
      },
      { timeout: 10_000, maximumAge: 300_000 },
    );
  }

  function pickPlace(suggestion: SpotSuggestion) {
    if (suggestion.latitude === undefined || suggestion.longitude === undefined) return;
    suppressPlaceSearch.current = true;
    setPlaceQuery(suggestion.label);
    setPlaceOpen(false);
    setOrigin({
      kind: "place",
      label: suggestion.label,
      coordinates: { latitude: suggestion.latitude, longitude: suggestion.longitude },
    });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div>
        <h2 className="text-lg font-black text-slate-900">Suggest a fishing spot</h2>
        <p className="mt-1 text-sm text-slate-600">
          Start from your location or a city, then filter by distance or drive time. Suggestions fan out in every direction from that point.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={useGps} disabled={locating}>
          {locating ? "Finding you…" : "Use my location"}
        </Button>
        {origin ? (
          <span className="self-center text-sm text-slate-700">
            From <strong className="font-bold">{origin.label}</strong>
          </span>
        ) : null}
      </div>
      {locateError ? <p className="text-xs text-red-700">{locateError}</p> : null}

      <label className="block text-sm font-bold text-slate-900">
        Or start from a town or harbour
        <input
          value={placeQuery}
          onChange={(event) => {
            setPlaceQuery(event.target.value);
            setPlaceOpen(true);
          }}
          onFocus={() => setPlaceOpen(true)}
          placeholder="Toronto, Barrie, Port Hope…"
          className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none ring-teal-600 placeholder:text-slate-400 focus:ring-2"
          autoComplete="off"
          role="combobox"
          aria-expanded={placeOpen && placeSuggestions.length > 0}
          aria-controls={listboxId}
        />
      </label>
      {placeOpen && canSearchPlaces && placeSuggestions.length > 0 ? (
        <ul id={listboxId} role="listbox" className="max-h-48 overflow-y-auto rounded-xl border border-slate-200">
          {placeSuggestions.map((suggestion) => (
            <li key={suggestion.id}>
              <button
                type="button"
                className="flex w-full flex-col px-3 py-2 text-left hover:bg-slate-50"
                onClick={() => pickPlace(suggestion)}
              >
                <span className="text-sm font-bold text-slate-900">{suggestion.label}</span>
                {suggestion.detail ? (
                  <span className="text-xs text-slate-500">{suggestion.detail}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm font-bold text-slate-900">Range</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setMode("distance");
                if (!DISTANCE_PRESETS.includes(range as (typeof DISTANCE_PRESETS)[number])) {
                  setRange(50);
                }
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-black ${
                mode === "distance" ? "bg-teal-800 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              Distance
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("drive");
                if (!DRIVE_PRESETS.includes(range as (typeof DRIVE_PRESETS)[number])) {
                  setRange(60);
                }
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-black ${
                mode === "drive" ? "bg-teal-800 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              Drive time
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(mode === "distance" ? DISTANCE_PRESETS : DRIVE_PRESETS).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setRange(preset)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                  range === preset ? "border-2 border-amber-500 bg-amber-50" : "border border-slate-200"
                }`}
              >
                {mode === "distance" ? `${preset} km` : preset < 60 ? `${preset} min` : `${preset / 60} hr`}
              </button>
            ))}
          </div>
        </div>

        <label className="text-sm font-bold text-slate-900">
          Target fish (optional)
          <select
            value={species}
            onChange={(event) => setSpecies(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold"
          >
            <option value="">Any species</option>
            {speciesOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      {!origin ? (
        <p className="text-sm text-slate-600">Choose a starting point to see shore-friendly suggestions.</p>
      ) : null}

      {loading ? <AsyncState loading loadingMessage="Ranking nearby spots…" /> : null}
      {error && !loading ? <AsyncState error={error} /> : null}

      {origin && !loading && spots.length === 0 && !error ? (
        <p className="text-sm text-slate-600">
          No shore-friendly spots matched this range. Try a wider radius or clear the species filter.
        </p>
      ) : null}

      {origin && spots.length > 0 ? (
        <div className="space-y-3">
          <KeyLegend title="Badge key" items={SUGGEST_BADGE_LEGEND} />
          {mode === "drive" ? (
            <p className="text-[11px] leading-5 text-slate-600">
              {driveTimes === "road"
                ? "Drive times follow public roads. Spots farther than the preset by road are left out."
                : "Drive times are straight-line estimates. Road routing did not answer."}
            </p>
          ) : null}
          <ul className="space-y-2">
            {spots.map((spot) => {
              const badge = shoreBadge(spot.shoreSuitability);
              return (
                <li key={spot.id}>
                  <button
                    type="button"
                    onClick={() => onPick(toSpotSuggestion(spot))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition-colors hover:border-teal-300 hover:bg-white"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900">{spot.label}</p>
                        {spot.detail ? (
                          <p className="mt-0.5 text-xs text-slate-600">{spot.detail}</p>
                        ) : null}
                      </div>
                      <div className="text-right text-xs text-slate-600">
                        <p className="font-bold text-slate-800">{formatDistance(spot.distanceKm)}</p>
                        <p>{formatDriveTimeEstimate(spot.driveMinutesEstimate, spot.driveSource)}</p>
                        {spot.direction ? (
                          <p className="text-slate-500">{compassName(spot.direction)} of you</p>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {badge ? <Badge tone="teal" size="sm">{badge}</Badge> : null}
                      {spot.kind === "access" ? <Badge tone="amber" size="sm">Official access</Badge> : null}
                      {spot.speciesChips.map((chip) => (
                        <Badge key={chip} tone="slate" size="sm">{chip}</Badge>
                      ))}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
