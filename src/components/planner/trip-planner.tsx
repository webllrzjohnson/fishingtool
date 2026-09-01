"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Coordinates, FishingLocation, LicenceType } from "@/lib/types";

const ORIGINS: Array<{ id: string; label: string; coordinates: Coordinates }> = [
  { id: "toronto", label: "Toronto / GTA", coordinates: { latitude: 43.6532, longitude: -79.3832 } },
  { id: "hamilton", label: "Hamilton", coordinates: { latitude: 43.2557, longitude: -79.8711 } },
  { id: "london", label: "London", coordinates: { latitude: 42.9849, longitude: -81.2453 } },
  { id: "ottawa", label: "Ottawa", coordinates: { latitude: 45.4215, longitude: -75.6972 } },
  { id: "kingston", label: "Kingston", coordinates: { latitude: 44.2312, longitude: -76.486 } },
  { id: "barrie", label: "Barrie", coordinates: { latitude: 44.3894, longitude: -79.6903 } },
  { id: "north-bay", label: "North Bay", coordinates: { latitude: 46.3091, longitude: -79.4608 } },
  { id: "sudbury", label: "Sudbury", coordinates: { latitude: 46.4917, longitude: -80.993 } },
  { id: "thunder-bay", label: "Thunder Bay", coordinates: { latitude: 48.3809, longitude: -89.2477 } },
  { id: "kenora", label: "Kenora", coordinates: { latitude: 49.767, longitude: -94.4894 } },
];

function distanceKm(a: Coordinates, b: Coordinates) {
  const radius = 6371;
  const lat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const lon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const value =
    Math.sin(lat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      Math.sin(lon / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(value));
}

export function TripPlanner({ locations }: { locations: FishingLocation[] }) {
  const [date, setDate] = useState("");
  const [target, setTarget] = useState("any");
  const [licence, setLicence] = useState<LicenceType>("sport");
  const [originId, setOriginId] = useState("toronto");
  const [radiusKm, setRadiusKm] = useState(250);
  const [experience, setExperience] = useState<"beginner" | "any">("beginner");
  const [userLocation, setUserLocation] = useState<Coordinates>();
  const [locationError, setLocationError] = useState("");
  const origin = userLocation ?? ORIGINS.find((item) => item.id === originId)?.coordinates;

  const targets = useMemo(
    () => [...new Set(locations.flatMap((location) => location.expectedSpecies))].sort(),
    [locations],
  );

  const suggestions = useMemo(() => {
    return locations
      .filter((location) => {
        const hasTarget =
          target === "any" ||
          location.expectedSpecies.some((species) => species.toLowerCase().includes(target.toLowerCase()));
        const hasShore = (location.accessModes ?? ["shore"]).some((mode) => mode === "shore" || mode === "pier");
        const matchesExperience =
          experience === "any" ||
          location.familyFriendly ||
          location.shoreSuitability === "excellent" ||
          location.shoreSuitability === "good";
        const distance = origin && location.coordinates ? Math.round(distanceKm(origin, location.coordinates)) : null;
        return hasTarget && hasShore && matchesExperience && (distance === null || distance <= radiusKm);
      })
      .map((location) => ({
        location,
        distance: origin && location.coordinates ? Math.round(distanceKm(origin, location.coordinates)) : null,
      }))
      .sort((a, b) => {
        if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
        const rank = { featured: 0, popular: 1, local: 2 };
        return rank[a.location.popularity ?? "local"] - rank[b.location.popularity ?? "local"];
      })
      .slice(0, 4);
  }, [experience, locations, origin, radiusKm, target]);

  function locateMe() {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Location is unavailable in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setUserLocation({ latitude: coords.latitude, longitude: coords.longitude }),
      () => setLocationError("Location permission was not granted. You can still browse all locations."),
      { maximumAge: 300_000, timeout: 8_000 },
    );
  }

  return (
    <section className="rounded-3xl bg-slate-950 p-5 text-white shadow-xl sm:p-8">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-sm font-bold">
          Starting area
          <select
            value={originId}
            onChange={(event) => {
              setOriginId(event.target.value);
              setUserLocation(undefined);
            }}
            className="mt-2 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-white"
          >
            {ORIGINS.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-bold">
          Travel radius
          <select
            value={radiusKm}
            onChange={(event) => setRadiusKm(Number(event.target.value))}
            className="mt-2 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-white"
          >
            <option value={75}>About 75 km</option>
            <option value={150}>About 150 km</option>
            <option value={250}>About 250 km</option>
            <option value={800}>Anywhere in Ontario</option>
          </select>
        </label>
        <label className="text-sm font-bold">
          Trip date
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-white"
          />
        </label>
        <label className="text-sm font-bold">
          Target fish
          <select
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-white"
          >
            <option value="any">Show me good options</option>
            {targets.map((species) => (
              <option key={species}>{species}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-bold">
          Licence
          <select
            value={licence}
            onChange={(event) => setLicence(event.target.value as LicenceType)}
            className="mt-2 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-white"
          >
            <option value="sport">Sport</option>
            <option value="conservation">Conservation</option>
          </select>
        </label>
        <label className="text-sm font-bold">
          Experience
          <select
            value={experience}
            onChange={(event) => setExperience(event.target.value as "beginner" | "any")}
            className="mt-2 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-white"
          >
            <option value="beginner">Beginner-friendly shore first</option>
            <option value="any">Show all shore access</option>
          </select>
        </label>
        <div className="md:col-span-2">
          <p className="text-sm font-bold">Or use this device</p>
          <button
            type="button"
            onClick={locateMe}
            className="mt-2 min-h-12 w-full rounded-xl border border-teal-500 bg-teal-900 px-3 text-sm font-bold hover:bg-teal-800"
          >
            {userLocation ? "Using your current location" : "Use my location"}
          </button>
        </div>
      </div>
      {locationError ? <p className="mt-3 text-sm text-amber-300">{locationError}</p> : null}
      <div className="mt-7">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-300">Suggested shore trips</p>
            <h2 className="mt-1 text-xl font-black">{target === "any" ? "Popular starting points" : `Places for ${target}`}</h2>
          </div>
          <Link href="/explore" className="text-sm font-bold text-teal-300 underline">
            Explore all
          </Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {suggestions.map(({ location, distance }) => (
            <Link
              key={location.id}
              href={`/locations/${location.slug ?? location.id}?date=${date}&licence=${licence}&target=${encodeURIComponent(target)}`}
              className="rounded-2xl border border-slate-700 bg-slate-900 p-4 hover:border-teal-500"
            >
              <p className="font-bold">{location.name}</p>
              <p className="mt-1 text-xs text-slate-400">
                {location.region ?? "Ontario"} · {location.fmz.toUpperCase()}
                {distance !== null ? ` · about ${distance} km away` : ""}
              </p>
              <p className="mt-2 text-sm text-slate-300">{location.beginnerTargets.slice(0, 3).join(" · ")}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
