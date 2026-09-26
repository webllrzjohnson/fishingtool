"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { commonSpecies } from "@/data/curated/species";
import { evaluateOutfitSummary } from "@/lib/gear/evaluate";
import { gearFitView } from "@/lib/gear-fit";
import type { GearOutfit } from "@/lib/gear/types";
import { userGear } from "@/lib/user-gear";
import { useGearOutfits } from "@/hooks/use-gear-outfits";
import { OutfitForm } from "@/components/gear/outfit-form";

export function GearHub() {
  const { outfits, defaultOutfitId, saveOutfit, removeOutfit, makeDefault } = useGearOutfits();
  const [editing, setEditing] = useState<GearOutfit | "new" | null>(null);

  const fitCards = useMemo(
    () =>
      commonSpecies.map((species) => {
        const outfit = outfits.find((item) => item.id === defaultOutfitId) ?? outfits[0];
        const fit = gearFitView(species, outfit);
        return { species, fit };
      }),
    [defaultOutfitId, outfits],
  );

  return (
    <div>
      <section className="mt-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-black">Saved outfits</h2>
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="min-h-11 rounded-xl bg-teal-800 px-4 font-black text-white"
          >
            Add outfit
          </button>
        </div>
        {editing ? (
          <OutfitForm
            initial={editing === "new" ? undefined : editing}
            onSave={(outfit) => {
              saveOutfit(outfit);
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        ) : null}
        <div className="grid gap-4">
          {outfits.map((outfit) => (
            <article key={outfit.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-teal-800">
                    {outfit.isDefault ? "Default outfit" : "Saved outfit"}
                  </p>
                  <h3 className="mt-1 text-xl font-black">{outfit.name}</h3>
                  <p className="mt-2 text-sm text-slate-600">{evaluateOutfitSummary(outfit)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!outfit.isDefault ? (
                    <button type="button" onClick={() => makeDefault(outfit.id)} className="inline-flex min-h-11 items-center rounded-lg bg-teal-50 px-3 text-sm font-bold text-teal-900">
                      Set default
                    </button>
                  ) : null}
                  <button type="button" onClick={() => setEditing(outfit)} className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-3 text-sm font-bold">
                    Edit
                  </button>
                  {outfits.length > 1 ? (
                    <button type="button" onClick={() => removeOutfit(outfit.id)} className="inline-flex min-h-11 items-center rounded-lg bg-red-50 px-3 text-sm font-bold text-red-800">
                      Delete
                    </button>
                  ) : null}
                </div>
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="font-black">Power</dt><dd>{outfit.rod.power}</dd></div>
                <div><dt className="font-black">Line</dt><dd>{outfit.line.testLb}</dd></div>
                <div><dt className="font-black">Reel</dt><dd>{outfit.reel.type} · size {outfit.reel.sizeLabel}</dd></div>
                <div><dt className="font-black">Licence</dt><dd>{userGear.licence}</dd></div>
                {outfit.notes ? <div className="sm:col-span-2"><dt className="font-black">Notes</dt><dd className="text-slate-600">{outfit.notes}</dd></div> : null}
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black">Fit by species (default outfit)</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {fitCards.map(({ species, fit }) => (
            <Link key={species.id} href={`/species/${species.id}`} className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-teal-300">
              <p className="font-black">{species.name}</p>
              <p className="mt-1 text-xs font-bold uppercase text-teal-800">{fit.label}</p>
              <p className="mt-2 text-sm text-slate-600">{fit.detail}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
