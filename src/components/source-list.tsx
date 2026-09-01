import { isStale } from "@/lib/sources";
import type { SourceRecord } from "@/lib/types";

export function SourceList({ sources }: { sources?: SourceRecord[] }) {
  if (!sources?.length) return null;
  const stale = sources.some((source) => isStale(source.lastVerified));
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm">
      <h2 className="font-black">Sources</h2>
      {stale ? (
        <p className="mt-2 rounded-lg bg-amber-50 p-2 text-amber-900">
          At least one source is older than the planner&apos;s freshness window. Recheck official pages before you go.
        </p>
      ) : null}
      <ul className="mt-3 space-y-2">
        {sources.map((source) => (
          <li key={source.url}>
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-800 underline">
              {source.name}
            </a>
            <span className="text-slate-500"> · {source.kind} · reviewed {source.lastVerified}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
