"use client";

import Link from "next/link";
import { useState } from "react";
import { filterTackleCatalog, tackleCategories, type tackleCatalog, type TackleCategory } from "@/lib/tackle-catalog";
import { TacklePicture } from "./tackle-picture";

type CatalogItem = (typeof tackleCatalog)[number];

function sourceLabel(url: string) {
  const parsed = new URL(url);
  const slug = decodeURIComponent(parsed.pathname.split("/").filter(Boolean).at(-1) ?? parsed.hostname);
  const title = slug.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  return `${parsed.hostname === "www.ontario.ca" ? "Ontario" : parsed.hostname.replace(/^www\./, "")}: ${title}`;
}

export function TackleCatalog({ items }: { items: CatalogItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<TackleCategory>("all");
  const matches = filterTackleCatalog(items, query, category);

  return <section className="mt-8" aria-label="Tackle catalog">
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <label htmlFor="tackle-search" className="block text-sm font-bold text-slate-900">Search tackle, fish or technique</label>
      <input id="tackle-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. walleye, jig, drift" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-teal-700 focus:outline-2 focus:outline-offset-2 focus:outline-teal-700" />
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by tackle category">
        {tackleCategories.map((option) => <button key={option.id} type="button" onClick={() => setCategory(option.id)} aria-pressed={category === option.id} className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${category === option.id ? "border-teal-800 bg-teal-800 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-teal-700"}`}>{option.label}</button>)}
      </div>
    </div>
    <p className="mt-4 text-sm text-slate-600" role="status" aria-live="polite">Showing {matches.length} of {items.length} tackle guides</p>
    {matches.length ? <div className="mt-4 grid items-start gap-6 md:grid-cols-2">
      {matches.map((item) => <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <TacklePicture id={item.id} title={item.title} preview />
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-black">{item.title}</h2>
            {item.natural ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-950">Check bait rules</span> : item.id === "roe-bead" ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-950">Check method rules</span> : null}
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{item.summary}</p>
          <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Possible targets:</strong> {item.targets.slice(0, 4).map((target, index) => <span key={target.id}>{index ? " · " : ""}<Link href={`/species/${target.id}`} className="text-teal-800 underline">{target.name}</Link></span>)}{item.targets.length > 4 ? ` · +${item.targets.length - 4} more` : ""}</p>
          <details className="mt-3 text-sm text-slate-700">
            <summary className="cursor-pointer font-bold text-teal-900">Sizes, technique, all targets &amp; evidence</summary>
            <div className="mt-2 space-y-2 leading-6">
              {item.caption !== item.summary ? <p><strong>About:</strong> {item.caption}</p> : null}
              <p><strong>Starting size:</strong> {item.sizes.length ? item.sizes.join(" · ") : "No single size fits; match hook/lure and weight to fish, water and rod rating."}</p>
              {item.examples.length ? <p><strong>Example technique:</strong> {item.examples[0].technique}</p> : null}
              <p><strong>All possible targets:</strong> {item.targets.map((target, index) => <span key={target.id}>{index ? " · " : ""}<Link href={`/species/${target.id}`} className="text-teal-800 underline">{target.name}</Link></span>)}</p>
              <p>{item.targetNote}</p>
              <p><strong>Target sources:</strong> {item.targetSources.map((url, index) => <span key={url}>{index ? " · " : ""}<a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${sourceLabel(url)} — ${item.title} source (opens in new tab)`} className="text-teal-800 underline">{sourceLabel(url)} ↗</a></span>)}</p>
              {item.natural ? <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-950">Natural or prepared bait: verify this water&apos;s bait rules before use{["minnow-float", "cut-bait"].includes(item.id) ? "; baitfish species, possession and transport restrictions also apply" : ""}.</p> : null}
              {item.id === "roe-bead" ? <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-950">An imitation bead is not automatically an artificial fly; check method and flies-only restrictions for this water.</p> : null}
            </div>
          </details>
        </div>
      </article>)}
    </div> : <p className="mt-4 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700">No tackle matches. Try another term or choose All tackle.</p>}
  </section>;
}
