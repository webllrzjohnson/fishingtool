"use client";

import { gearFitView } from "@/lib/gear-fit";
import type { SpeciesProfile } from "@/lib/types";
import { useGearOutfits } from "@/hooks/use-gear-outfits";

export function SpeciesGearFit({ species }: { species: SpeciesProfile }) {
  const { defaultOutfit } = useGearOutfits();
  const fit = gearFitView(species, defaultOutfit);

  return (
    <>
      <p className={`rounded-xl p-3 text-sm font-bold ${
        fit.level === "good"
          ? "bg-emerald-50 text-emerald-900"
          : fit.level === "unsuitable"
            ? "bg-red-50 text-red-900"
            : "bg-amber-50 text-amber-900"
      }`}>
        {fit.label}: {fit.detail}
      </p>
      <dl className="mt-4 space-y-3 text-sm">
        <div><dt className="font-black">Your combo</dt><dd className="text-slate-600">{fit.gear}</dd></div>
        <div><dt className="font-black">Typical power</dt><dd className="text-slate-600">{species.gear.power}</dd></div>
        <div><dt className="font-black">Line</dt><dd className="text-slate-600">{species.gear.line}</dd></div>
        {species.gear.leader ? <div><dt className="font-black">Leader</dt><dd className="text-slate-600">{species.gear.leader}</dd></div> : null}
      </dl>
      {fit.suggestion ? <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{fit.suggestion}</p> : null}
    </>
  );
}
