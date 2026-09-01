"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DiscoveryMap } from "@/components/map/discovery-map";
import { LocationCard } from "@/components/locations/location-card";
import type { FishingLocation } from "@/lib/types";

export function ExploreClient({ locations }: { locations: FishingLocation[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [region, setRegion] = useState(searchParams.get("region") ?? "all");
  const [species, setSpecies] = useState(searchParams.get("species") ?? "all");
  const [fmz, setFmz] = useState(searchParams.get("fmz") ?? "all");
  const [shoreOnly, setShoreOnly] = useState(searchParams.get("shore") !== "0");
  const [familyOnly, setFamilyOnly] = useState(searchParams.get("family") === "1");
  const [stockedOnly, setStockedOnly] = useState(searchParams.get("stocked") === "1");
  const [view, setView] = useState<"list" | "map">(searchParams.get("view") === "map" ? "map" : "list");
  const [selectedId, setSelectedId] = useState<string>();

  function updateUrl(next: Record<string, string>) {
    const params = new URLSearchParams({
      q: query,
      region,
      species,
      fmz,
      shore: shoreOnly ? "1" : "0",
      family: familyOnly ? "1" : "0",
      stocked: stockedOnly ? "1" : "0",
      view,
      ...next,
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const regions = useMemo(
    () => [...new Set(locations.map((location) => location.region).filter(Boolean) as string[])].sort(),
    [locations],
  );
  const speciesOptions = useMemo(
    () => [...new Set(locations.flatMap((location) => location.expectedSpecies))].sort((a, b) => a.localeCompare(b)),
    [locations],
  );
  const fmzOptions = useMemo(
    () => [...new Set(locations.map((location) => location.fmz))].sort(),
    [locations],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return locations.filter((location) => {
      const matchesQuery =
        !needle ||
        [location.name, location.region, location.municipality, location.fmz, ...location.expectedSpecies]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(needle));
      const matchesRegion = region === "all" || location.region === region;
      const matchesSpecies =
        species === "all" ||
        location.expectedSpecies.some((item) => item.toLowerCase().includes(species.toLowerCase()));
      const matchesFmz = fmz === "all" || location.fmz === fmz;
      const matchesShore =
        !shoreOnly || (location.accessModes ?? ["shore"]).some((mode) => mode === "shore" || mode === "pier");
      const matchesFamily = !familyOnly || location.familyFriendly;
      const matchesStocked =
        !stockedOnly ||
        /stocked/i.test(
          [...location.expectedSpecies, ...location.beginnerTargets, location.accessNotes].join(" "),
        ) ||
        (location.species ?? []).some((item) => item.status === "stocked");
      return matchesQuery && matchesRegion && matchesSpecies && matchesFmz && matchesShore && matchesFamily && matchesStocked;
    });
  }, [familyOnly, fmz, locations, query, region, shoreOnly, species, stockedOnly]);

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="text-sm font-bold text-slate-700 xl:col-span-2">
            Search place, town, or fish
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                updateUrl({ q: event.target.value });
              }}
              placeholder="Try Rice Lake, Ottawa, or walleye"
              className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
            />
          </label>
          <label className="text-sm font-bold text-slate-700">
            Region
            <select
              value={region}
              onChange={(event) => {
                setRegion(event.target.value);
                updateUrl({ region: event.target.value });
              }}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal"
            >
              <option value="all">All Ontario regions</option>
              {regions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-bold text-slate-700">
            Target species
            <select
              value={species}
              onChange={(event) => {
                setSpecies(event.target.value);
                updateUrl({ species: event.target.value });
              }}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal"
            >
              <option value="all">Any fish</option>
              {speciesOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-bold text-slate-700">
            FMZ
            <select
              value={fmz}
              onChange={(event) => {
                setFmz(event.target.value);
                updateUrl({ fmz: event.target.value });
              }}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal"
            >
              <option value="all">Any zone</option>
              {fmzOptions.map((item) => (
                <option key={item} value={item}>{item.toUpperCase()}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex min-h-10 items-center gap-2">
              <input
                type="checkbox"
                checked={shoreOnly}
                onChange={(event) => {
                  setShoreOnly(event.target.checked);
                  updateUrl({ shore: event.target.checked ? "1" : "0" });
                }}
              />
              Shore/pier access
            </label>
            <label className="flex min-h-10 items-center gap-2">
              <input
                type="checkbox"
                checked={familyOnly}
                onChange={(event) => {
                  setFamilyOnly(event.target.checked);
                  updateUrl({ family: event.target.checked ? "1" : "0" });
                }}
              />
              Family-friendly
            </label>
            <label className="flex min-h-10 items-center gap-2">
              <input
                type="checkbox"
                checked={stockedOnly}
                onChange={(event) => {
                  setStockedOnly(event.target.checked);
                  updateUrl({ stocked: event.target.checked ? "1" : "0" });
                }}
              />
              Stocked waters
            </label>
          </div>
          <div className="flex rounded-xl bg-slate-100 p-1" aria-label="View style">
            {(["list", "map"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setView(item);
                  updateUrl({ view: item });
                }}
                className={`min-h-10 rounded-lg px-4 text-sm font-bold ${
                  view === item ? "bg-white text-teal-900 shadow-sm" : "text-slate-500"
                }`}
              >
                {item === "list" ? "Cards" : "Map"}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="my-5 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-600">
          {filtered.length} {filtered.length === 1 ? "location" : "locations"}
        </p>
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setRegion("all");
            setSpecies("all");
            setFmz("all");
            setShoreOnly(true);
            setFamilyOnly(false);
            setStockedOnly(false);
            router.replace(pathname, { scroll: false });
          }}
          className="text-sm font-bold text-teal-800 underline"
        >
          Reset filters
        </button>
      </div>

      {view === "map" ? (
        <DiscoveryMap locations={filtered} selectedId={selectedId} onSelect={setSelectedId} />
      ) : filtered.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((location) => (
            <LocationCard key={location.id} location={location} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-bold">No locations match those filters.</p>
          <p className="mt-1 text-sm text-slate-500">Try a wider region or turn off shore-only access.</p>
        </div>
      )}
    </>
  );
}
