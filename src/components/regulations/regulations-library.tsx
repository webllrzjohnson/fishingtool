"use client";

import { useMemo, useState } from "react";
import { DiscoveryMap } from "@/components/map/discovery-map";
import { fishingLocations } from "@/lib/fishing-locations";
import {
  fmzSummaries,
  regulationCategories,
  regulationEntries,
  type RegulationCategory,
} from "@/lib/regulations/library";
import { fishOnlineUrl, officialRegulationUrl } from "@/lib/sources";
import { OfficialLink } from "@/components/ui/button";

type Filter = "all" | RegulationCategory;

const searchable = (value: string) => value.toLocaleLowerCase();

export function RegulationsLibrary() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedZone, setSelectedZone] = useState<number | null>(null);

  const normalizedQuery = searchable(query.trim());
  const entryMatches = useMemo(
    () =>
      regulationEntries.filter((entry) => {
        const matchesCategory = filter === "all" || filter === entry.category;
        const haystack = searchable([entry.title, entry.summary, ...entry.points, ...entry.topics].join(" "));
        return matchesCategory && (!normalizedQuery || haystack.includes(normalizedQuery));
      }),
    [filter, normalizedQuery],
  );
  const fmzMatches = useMemo(
    () =>
      fmzSummaries.filter((entry) => {
        const matchesCategory = filter === "all" || filter === "fmz";
        const haystack = searchable([entry.title, entry.summary, ...entry.topics, `zone ${entry.zone}`].join(" "));
        return matchesCategory && (!normalizedQuery || haystack.includes(normalizedQuery));
      }),
    [filter, normalizedQuery],
  );
  const mappableLocations = useMemo(
    () => (selectedZone ? fishingLocations.filter((location) => location.fmz === `fmz-${selectedZone}`) : fishingLocations),
    [selectedZone],
  );

  return (
    <section aria-labelledby="regulations-library-title" className="space-y-7">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950 sm:p-6">
        <p className="font-black">Check the exact water before fishing or keeping a fish.</p>
        <p className="mt-1 max-w-4xl">
          This is a searchable guide to high-value 2026 PDF topics, not a complete legal rule engine. A named lake,
          tributary, bay, sanctuary, boundary water, or local exception can change a zone-wide rule.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <OfficialLink href={fishOnlineUrl}>Find the exact water in Fish ON-Line</OfficialLink>
          <OfficialLink href={officialRegulationUrl}>Open the official 2026 summary</OfficialLink>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[1fr_auto] lg:items-end">
        <label className="block">
          <span className="text-sm font-black text-slate-900">Search the 2026 library</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try bait receipt, walleye, ice hut, FMZ 16…"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none ring-teal-600 placeholder:text-slate-400 focus:ring-2"
          />
        </label>
        <label className="block lg:w-56">
          <span className="text-sm font-black text-slate-900">Category</span>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as Filter)}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold outline-none ring-teal-600 focus:ring-2"
          >
            <option value="all">All categories</option>
            {(Object.keys(regulationCategories) as RegulationCategory[]).map((category) => (
              <option key={category} value={category}>{regulationCategories[category]}</option>
            ))}
          </select>
        </label>
      </div>

      <section aria-labelledby="fmz-navigator-title" className="rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-800">Visual zone navigator</p>
            <h2 id="fmz-navigator-title" className="mt-1 text-2xl font-black tracking-tight text-teal-950">All 20 FMZs</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-700">
              Pick a zone to focus its PDF entry and show curated location markers in that FMZ. Markers are planning references, not FMZ boundaries or legal access confirmation.
            </p>
          </div>
          {selectedZone ? (
            <button type="button" onClick={() => setSelectedZone(null)} className="rounded-lg px-3 py-2 text-sm font-bold text-teal-900 underline">
              Show all zones
            </button>
          ) : null}
        </div>
        <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-10" aria-label="Select a Fisheries Management Zone">
          {fmzSummaries.map((entry) => (
            <button
              type="button"
              key={entry.zone}
              onClick={() => setSelectedZone(entry.zone)}
              aria-pressed={selectedZone === entry.zone}
              className={`rounded-xl border px-2 py-3 text-center text-sm font-black transition ${
                selectedZone === entry.zone
                  ? "border-teal-950 bg-teal-800 text-white"
                  : "border-teal-200 bg-white text-teal-950 hover:border-teal-500"
              }`}
            >
              {entry.zone}
            </button>
          ))}
        </div>
        <div className="mt-5">
          <DiscoveryMap locations={mappableLocations} className="h-[300px] sm:h-[370px]" />
          <p className="mt-2 text-xs text-slate-600">
            {mappableLocations.length} curated location marker{mappableLocations.length === 1 ? "" : "s"} shown{selectedZone ? ` for FMZ ${selectedZone}` : " across Ontario"}. Use the official zone map and Fish ON-Line for boundaries and waterbody details.
          </p>
        </div>
      </section>

      <div className="flex items-baseline justify-between gap-4">
        <h2 id="regulations-library-title" className="text-2xl font-black tracking-tight">Search results</h2>
        <p className="text-sm text-slate-600">{entryMatches.length + fmzMatches.length} source-backed entries</p>
      </div>

      {entryMatches.length === 0 && fmzMatches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          No indexed topic matches that search. Try a species, “licence”, “bait”, “sanctuary”, or an FMZ number.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {entryMatches.map((entry) => (
            <article key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700">{regulationCategories[entry.category]}</span>
                <Citation citation={entry.citation} />
              </div>
              <h3 className="mt-3 text-xl font-black tracking-tight">{entry.title}</h3>
              <p className="mt-2 leading-6 text-slate-700">{entry.summary}</p>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
                {entry.points.map((point) => <li key={point} className="flex gap-2"><span aria-hidden className="font-black text-teal-700">•</span><span>{point}</span></li>)}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                {entry.topics.map((topic) => <span key={topic} className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-900">{topic}</span>)}
              </div>
              {entry.officialUrl ? <div className="mt-4"><OfficialLink href={entry.officialUrl}>Exact-waterbody action</OfficialLink></div> : null}
            </article>
          ))}
          {fmzMatches.map((entry) => (
            <article key={entry.zone} className={`rounded-2xl border bg-white p-5 shadow-sm ${selectedZone === entry.zone ? "border-teal-500 ring-2 ring-teal-200" : "border-slate-200"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-black text-teal-950">FMZ summary</span>
                <Citation citation={entry.citation} />
              </div>
              <h3 className="mt-3 text-xl font-black tracking-tight">{entry.title}</h3>
              <p className="mt-2 leading-6 text-slate-700">{entry.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {entry.topics.map((topic) => <span key={topic} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{topic}</span>)}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" onClick={() => setSelectedZone(entry.zone)} className="rounded-xl border border-teal-300 bg-teal-50 px-3 py-2 text-sm font-black text-teal-950 underline">
                  View FMZ {entry.zone} markers
                </button>
                <OfficialLink href={entry.officialUrl}>Open official FMZ {entry.zone} rules</OfficialLink>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function Citation({ citation }: { citation: { page: number; label: string; url: string } }) {
  return <a href={citation.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-teal-800 underline">PDF p. {citation.page}: {citation.label}</a>;
}

