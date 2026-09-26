"use client";

import { useState } from "react";
import { officialFmzUrl, rulesForFmz } from "@/lib/fmz-rules";
import { evaluateRule } from "@/lib/regulations/evaluate";
import type { FmzId, LicenceType } from "@/lib/types";

export function RulesChecker({ initialFmz = "fmz-16" }: { initialFmz?: FmzId }) {
  const [fmz, setFmz] = useState<FmzId>(initialFmz);
  const [date, setDate] = useState("");
  const [licence, setLicence] = useState<LicenceType>("sport");
  const [speciesIndex, setSpeciesIndex] = useState(0);
  const [hasExceptions, setHasExceptions] = useState(false);
  const rules = rulesForFmz(fmz);
  const rule = rules[Math.min(speciesIndex, Math.max(0, rules.length - 1))];
  const result = rule ? evaluateRule(rule, date, licence, { hasWaterbodyExceptions: hasExceptions }) : null;
  const zoneNumber = fmz.replace("fmz-", "");

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Trip details</h2>
        <div className="mt-4 space-y-4">
          <label className="block text-sm font-bold">
            Fisheries Management Zone
            <select
              value={fmz}
              onChange={(event) => {
                setFmz(event.target.value as FmzId);
                setSpeciesIndex(0);
              }}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3"
            >
              {Array.from({ length: 20 }, (_, index) => index + 1).map((zone) => (
                <option key={zone} value={`fmz-${zone}`}>FMZ {zone}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold">
            Fishing date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3"
            />
          </label>
          <label className="block text-sm font-bold">
            Licence
            <select
              value={licence}
              onChange={(event) => setLicence(event.target.value as LicenceType)}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3"
            >
              <option value="sport">Sport Fishing Licence</option>
              <option value="conservation">Conservation Fishing Licence</option>
            </select>
          </label>
          {rules.length ? (
            <label className="block text-sm font-bold">
              Species
              <select
                value={speciesIndex}
                onChange={(event) => setSpeciesIndex(Number(event.target.value))}
                className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3"
              >
                {rules.map((item, index) => <option key={item.species} value={index}>{item.species}</option>)}
              </select>
            </label>
          ) : null}
          <label className="flex items-start gap-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-950">
            <input type="checkbox" checked={hasExceptions} onChange={(event) => setHasExceptions(event.target.checked)} className="mt-1" />
            <span>The exact waterbody has an exception, sanctuary, or boundary I have not resolved.</span>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800">Conservative guidance</p>
        {!rules.length ? (
          <>
            <h2 className="mt-2 text-3xl font-black">Official check required for FMZ {zoneNumber}</h2>
            <p className="mt-4 leading-7 text-slate-600">
              This app has not loaded a structured, tested rule table for this zone. It will not guess whether a
              species is open or what you may keep.
            </p>
          </>
        ) : result ? (
          <>
            <div className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-black ${
              result.status === "open"
                ? "bg-emerald-100 text-emerald-900"
                : result.status === "closed"
                  ? "bg-red-100 text-red-900"
                  : "bg-amber-100 text-amber-950"
            }`}>
              {result.label}
            </div>
            <h2 className="mt-4 text-3xl font-black">{rule.species}</h2>
            <p className="mt-3 text-lg leading-8 text-slate-700">{result.reason}</p>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div><dt className="text-xs font-black uppercase text-slate-500">Published season</dt><dd className="mt-1">{rule.season}</dd></div>
              <div><dt className="text-xs font-black uppercase text-slate-500">Selected licence limit</dt><dd className="mt-1">{result.limit ?? "Verify"}</dd></div>
              {result.sizeNote ? <div><dt className="text-xs font-black uppercase text-slate-500">Size rule</dt><dd className="mt-1">{result.sizeNote}</dd></div> : null}
            </dl>
          </>
        ) : (
          <p>Select a date and species.</p>
        )}
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-950">
          A zone-wide summary can be overridden by waterbody exceptions, sanctuaries, variation orders,
          combined-species limits, gear rules, and boundary details. Confirm before fishing or keeping fish.
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={officialFmzUrl(fmz)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-red-900 px-4 py-3 text-sm font-black text-white"
          >
            Open official FMZ {zoneNumber} rules
          </a>
          <a
            href="https://www.ontario.ca/fishonline"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-black"
          >
            Find exact waterbody
          </a>
        </div>
      </section>
    </div>
  );
}
