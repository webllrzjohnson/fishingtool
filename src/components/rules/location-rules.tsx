"use client";

import Link from "next/link";
import { useMemo } from "react";
import { exceptionsForLocation } from "@/data/curated/exceptions";
import { rulesForFmz } from "@/lib/fmz-rules";
import { evaluateRule } from "@/lib/regulations/evaluate";
import { fmzRegulationUrl } from "@/lib/sources";
import type { FishingLocation, LicenceType } from "@/lib/types";

export function LocationRules({
  location,
  date,
  licence,
}: {
  location: FishingLocation;
  date?: string;
  licence: LicenceType;
}) {
  const rules = rulesForFmz(location.fmz);
  const exceptions = exceptionsForLocation(location.id);
  const evaluations = useMemo(
    () =>
      date
        ? rules.map((rule) =>
            evaluateRule(rule, date, licence, {
              exceptions,
              ambiguousBoundary: location.ambiguousBoundary,
            }),
          )
        : [],
    [date, exceptions, licence, location.ambiguousBoundary, rules],
  );
  const zone = location.fmz.replace("fmz-", "");

  return (
    <section className="rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">
      <h2 className="text-2xl font-black text-red-950">Rules guidance</h2>
      <p className="mt-2 text-sm leading-6 text-red-900">
        Zone-wide {RULE_YEAR_LABEL} summary only. Waterbody exceptions, sanctuaries, and boundaries can override this table.
      </p>
      {exceptions.length ? (
        <ul className="mt-3 space-y-2 text-sm text-red-950">
          {exceptions.map((item) => (
            <li key={item.id}>- {item.summary}</li>
          ))}
        </ul>
      ) : null}
      {date && evaluations.length ? (
        <div className="mt-4 overflow-x-auto rounded-xl bg-white">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="p-3">Species</th>
                <th className="p-3">Status on {date}</th>
                <th className="p-3">Limit</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((result, index) => (
                <tr key={result.speciesId + index} className="border-b border-slate-100 align-top">
                  <td className="p-3 font-bold">{rules[index]?.species}</td>
                  <td className="p-3">
                    {result.label}
                    <span className="mt-1 block text-xs text-slate-500">{result.reason}</span>
                  </td>
                  <td className="p-3">{result.limit ?? "Verify"}{result.sizeNote ? ` · ${result.sizeNote}` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl bg-white">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="p-3">Species</th>
                <th className="p-3">Season</th>
                <th className="p-3">Sport limit</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.species} className="border-b border-slate-100 align-top">
                  <td className="p-3 font-bold">{rule.species}</td>
                  <td className="p-3">{rule.season}</td>
                  <td className="p-3">{rule.sportLimit}{rule.sizeNote ? ` · ${rule.sizeNote}` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={location.fishOnlineUrl ?? "https://www.ontario.ca/fishonline"}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-red-900 px-4 py-3 text-sm font-black text-white"
        >
          Verify in Fish ON-Line
        </a>
        <a
          href={fmzRegulationUrl(zone)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-red-300 px-4 py-3 text-sm font-black text-red-950"
        >
          Open current FMZ {zone} rules
        </a>
        <Link
          href="/regulations"
          className="rounded-xl border border-red-300 bg-white px-4 py-3 text-sm font-black text-red-950"
        >
          Browse 2026 regulations library
        </Link>
      </div>
    </section>
  );
}

const RULE_YEAR_LABEL = "2026";
