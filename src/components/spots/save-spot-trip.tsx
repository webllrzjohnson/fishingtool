"use client";

import { useState } from "react";
import { matchSpecies } from "@/data/curated/species";
import { buildTripChecklist } from "@/lib/gear/storage";
import { upsertTrip } from "@/lib/trips/storage";
import { useGearOutfits } from "@/hooks/use-gear-outfits";
import { DarkField } from "@/components/ui/field";
import type { LicenceType } from "@/lib/types";
import type { SpotDetail } from "@/lib/spots/detail";

export function SaveSpotTrip({ spot }: { spot: SpotDetail }) {
  const { outfits, defaultOutfitId, selected } = useGearOutfits();
  const [date, setDate] = useState("");
  const [licence, setLicence] = useState<LicenceType>("sport");
  const [target, setTarget] = useState("");
  const [selectedGearId, setSelectedGearId] = useState(defaultOutfitId);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  // The spot's own species list is better grounded than a generic catalogue.
  const gameSpecies = spot.species.filter((entry) => entry.game);

  function save() {
    const normalizedDate = date || new Date().toISOString().slice(0, 10);
    const species = target ? matchSpecies(target) : undefined;
    const outfit = selected(selectedGearId);
    upsertTrip({
      id: `${spot.latitude.toFixed(4)},${spot.longitude.toFixed(4)}:${normalizedDate}`,
      locationId: "",
      spot: { name: spot.name, latitude: spot.latitude, longitude: spot.longitude },
      date: normalizedDate,
      licenceType: licence,
      targetSpeciesIds: species ? [species.id] : [],
      selectedGearId: outfit.id,
      notes,
      checklist: buildTripChecklist(outfit, species?.name ?? target),
      createdAt: new Date().toISOString(),
    });
    setSaved(true);
  }

  return (
    <div className="rounded-2xl bg-slate-950 p-5 text-white">
      <h2 className="text-xl font-black">Save this trip</h2>
      <p className="mt-1 text-sm text-teal-100/80">
        Stored in this browser with a before-you-go checklist.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <DarkField label="Date">
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-900 px-3"
          />
        </DarkField>
        <DarkField label="Licence">
          <select
            value={licence}
            onChange={(event) => setLicence(event.target.value as LicenceType)}
            className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-900 px-3"
          >
            <option value="sport">Sport</option>
            <option value="conservation">Conservation</option>
          </select>
        </DarkField>
        <DarkField label="Target fish">
          <select
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-900 px-3"
          >
            <option value="">Open to suggestions</option>
            {gameSpecies.map((entry) => (
              <option key={entry.name} value={entry.name}>
                {entry.name}
              </option>
            ))}
          </select>
        </DarkField>
        <DarkField label="Outfit">
          <select
            value={selectedGearId}
            onChange={(event) => setSelectedGearId(event.target.value)}
            className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-900 px-3"
          >
            {outfits.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name}
              </option>
            ))}
          </select>
        </DarkField>
        <DarkField label="Notes" className="sm:col-span-2">
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={2}
            placeholder="Meet-up time, exact shore spot, backup plan…"
            className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-900 p-3"
          />
        </DarkField>
      </div>
      <button
        type="button"
        onClick={save}
        className="mt-4 min-h-11 rounded-xl bg-amber-400 px-4 font-black text-slate-950"
      >
        {saved ? "Trip saved" : "Save trip"}
      </button>
    </div>
  );
}
