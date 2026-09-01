import Link from "next/link";
import type { FishingLocation } from "@/lib/types";

export function LocationCard({ location }: { location: FishingLocation }) {
  const slug = location.slug ?? location.id;
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wide">
        <span className="rounded-full bg-teal-50 px-2 py-1 text-teal-800">{location.fmz.toUpperCase()}</span>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">{location.region ?? "Ontario"}</span>
        {location.shoreSuitability ? (
          <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-800">
            Shore: {location.shoreSuitability}
          </span>
        ) : null}
      </div>
      <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950">{location.name}</h2>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{location.accessNotes}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {(location.accessModes ?? ["shore"]).map((mode) => (
          <span key={mode} className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600">
            {mode}
          </span>
        ))}
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Common targets</p>
      <p className="mt-1 text-sm text-slate-700">{location.beginnerTargets.slice(0, 4).join(" · ")}</p>
      <Link
        href={`/locations/${slug}`}
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-800 px-4 py-2 text-sm font-bold text-white hover:bg-teal-900"
      >
        Open trip details
      </Link>
    </article>
  );
}
