"use client";

import { useMemo, useState } from "react";
import { matchSpecies } from "@/data/curated/species";
import { gearFitForSpecies } from "@/lib/gear-fit";
import { buildFishingReport, formatReportText } from "@/lib/fishing-report";
import { defaultChecklist, upsertTrip } from "@/lib/trips/storage";
import type { FishingLocation, LicenceType } from "@/lib/types";

export function SaveTripPanel({
  location,
  initialDate = "",
  initialLicence = "sport",
  initialTarget = "",
}: {
  location: FishingLocation;
  initialDate?: string;
  initialLicence?: LicenceType;
  initialTarget?: string;
}) {
  const [date, setDate] = useState(initialDate);
  const [licence, setLicence] = useState<LicenceType>(initialLicence);
  const [target, setTarget] = useState(initialTarget === "any" ? "" : initialTarget);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fullReportCopied, setFullReportCopied] = useState(false);
  const fit = useMemo(() => gearFitForSpecies(matchSpecies(target || location.beginnerTargets[0] || "")), [location.beginnerTargets, target]);

  function save() {
    const normalizedDate = date || new Date().toISOString().slice(0, 10);
    upsertTrip({
      id: `${location.id}:${normalizedDate}`,
      locationId: location.id,
      date: normalizedDate,
      licenceType: licence,
      targetSpeciesIds: target ? [target] : [],
      notes,
      checklist: { ...defaultChecklist },
      createdAt: new Date().toISOString(),
    });
    setSaved(true);
  }

  async function copy() {
    const text = [
      `Fishing trip: ${location.name}`,
      `Date: ${date || "Not set"}`,
      `Licence: ${licence}`,
      `Target: ${target || "Open to suggestions"}`,
      `FMZ: ${location.fmz.toUpperCase()}`,
      `Access: ${location.accessNotes}`,
      `Tackle: ${location.tackleNotes}`,
      `Cautions: ${location.cautions.join("; ")}`,
      "",
      "Verify on Fish ON-Line and the current Ontario Fishing Regulations Summary before leaving.",
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function copyFullReport() {
    const report = buildFishingReport(location.id);
    if (!report) return;
    await navigator.clipboard.writeText(formatReportText(report));
    setFullReportCopied(true);
    window.setTimeout(() => setFullReportCopied(false), 1800);
  }

  return (
    <div className="rounded-2xl bg-slate-950 p-5 text-white">
      <h2 className="text-xl font-black">Build this trip</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-bold">
          Date
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-900 px-3"
          />
        </label>
        <label className="text-sm font-bold">
          Licence
          <select
            value={licence}
            onChange={(event) => setLicence(event.target.value as LicenceType)}
            className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-900 px-3"
          >
            <option value="sport">Sport</option>
            <option value="conservation">Conservation</option>
          </select>
        </label>
        <label className="text-sm font-bold sm:col-span-2">
          Target fish
          <input
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            placeholder={location.beginnerTargets.join(", ")}
            className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-900 px-3"
          />
        </label>
        <label className="text-sm font-bold sm:col-span-2">
          Notes
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-900 p-3"
            placeholder="Meet-up time, exact shore spot, backup plan…"
          />
        </label>
      </div>
      <p className="mt-3 rounded-xl bg-white/10 p-3 text-xs leading-5 text-teal-50">
        {fit.label}: {fit.detail}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={save} className="min-h-11 rounded-xl bg-amber-400 px-4 font-black text-slate-950">
          {saved ? "Trip saved" : "Save trip locally"}
        </button>
        <button type="button" onClick={copy} className="min-h-11 rounded-xl border border-slate-600 px-4 font-bold">
          {copied ? "Copied" : "Copy summary"}
        </button>
        <button type="button" onClick={copyFullReport} className="min-h-11 rounded-xl border border-slate-600 px-4 font-bold">
          {fullReportCopied ? "Copied" : "Copy full report"}
        </button>
        <button type="button" onClick={() => window.print()} className="min-h-11 rounded-xl border border-slate-600 px-4 font-bold">
          Print
        </button>
      </div>
    </div>
  );
}
