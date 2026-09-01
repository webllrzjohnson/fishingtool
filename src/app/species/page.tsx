import type { Metadata } from "next";
import { SpeciesCard } from "@/components/species/species-card";
import { commonSpecies } from "@/data/curated/species";

export const metadata: Metadata = {
  title: "Ontario fish and bait guide",
  description: "Common Ontario sport fish with seasonal bait, lure, rig, technique, and gear guidance.",
};

export default function SpeciesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-teal-800">Fish and bait guide</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Match your tackle to the fish</h1>
      <p className="mt-3 max-w-3xl leading-7 text-slate-600">
        Choose a target to see habitat, seasonal behaviour, natural bait, artificial lures, rigging,
        technique, and whether your current medium spinning setup is a good fit.
      </p>
      <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {commonSpecies.map((species) => (
          <SpeciesCard key={species.id} species={species} />
        ))}
      </div>
    </div>
  );
}
