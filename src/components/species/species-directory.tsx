"use client";

import { useState } from "react";
import { SpeciesCard } from "@/components/species/species-card";
import { searchSpecies } from "@/lib/species-search";
import type { SpeciesProfile } from "@/lib/types";

export function SpeciesDirectory({ species }: { species: SpeciesProfile[] }) {
  const [query, setQuery] = useState("");
  const results = searchSpecies(species, query);
  return (
    <section className="mt-7" aria-label="Fish directory">
      <label htmlFor="species-search" className="block text-sm font-bold text-slate-800">Search fish, alias or Ontario region</label>
      <input
        id="species-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Try pickerel, coho, Great Lakes, southern…"
        className="mt-2 w-full max-w-xl rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 focus:border-teal-700 focus:outline-2 focus:outline-offset-2 focus:outline-teal-700"
      />
      <p role="status" aria-live="polite" className="mt-3 text-sm font-semibold text-slate-600">
        {results.length} {results.length === 1 ? "result" : "results"} found
      </p>
      {results.length ? (
        <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {results.map((fish) => <SpeciesCard key={fish.id} species={fish} />)}
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-slate-200 bg-white p-6 text-slate-700">No fish match “{query.trim()}”. Try a common name, alias or broader Ontario region.</p>
      )}
    </section>
  );
}
