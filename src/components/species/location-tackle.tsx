"use client";

import Link from "next/link";
import { commonSpecies, matchSpecies } from "@/data/curated/species";
import { baitsForTrip, tackleChecklist } from "@/lib/gear";
import { gearFitForSpecies } from "@/lib/gear-fit";
import type { FishingLocation } from "@/lib/types";

export function LocationTackle({ location, date }: { location: FishingLocation; date?: string }) {
  const tripDate = date || new Date().toISOString().slice(0, 10);
  const targets = location.beginnerTargets
    .map((target) => matchSpecies(target) ?? commonSpecies.find((species) => target.toLowerCase().includes(species.name.toLowerCase().split(" ")[0])))
    .filter(Boolean)
    .slice(0, 3);

  if (!targets.length) {
    return (
      <p className="leading-7 text-slate-700">
        {location.tackleNotes}{" "}
        <Link href="/species" className="font-bold text-teal-800 underline">Open the fish and bait guide</Link>
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <p className="leading-7 text-slate-700">{location.tackleNotes}</p>
      {targets.map((species) => {
        if (!species) return null;
        const fit = gearFitForSpecies(species);
        const baits = baitsForTrip(species, location, tripDate);
        return (
          <article key={species.id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-black">{species.name}</h3>
              <span className={`rounded-full px-2 py-1 text-[11px] font-black uppercase ${
                fit.level === "good" ? "bg-emerald-100 text-emerald-900" : fit.level === "workable" ? "bg-amber-100 text-amber-900" : "bg-red-100 text-red-900"
              }`}>{fit.label}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{fit.detail}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {baits.slice(0, 4).map((bait) => (
                <li key={bait.name}>
                  <span className="font-semibold">{bait.name}</span>
                  <span className="text-slate-500"> · {bait.kind}</span>
                  {bait.allowed === "no" ? <span className="block text-xs font-bold text-red-800">{bait.reason}</span> : null}
                  {bait.allowed === "verify" ? <span className="block text-xs text-amber-800">{bait.reason}</span> : null}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">Pack: {tackleChecklist(species, fit).join(" · ")}</p>
            <Link href={`/species/${species.id}`} className="mt-3 inline-block text-sm font-bold text-teal-800 underline">
              Full {species.name} guide
            </Link>
          </article>
        );
      })}
    </div>
  );
}
