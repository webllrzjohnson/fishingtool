"use client";

import { Badge } from "@/components/ui/badge";
import { EmptyState, SectionCard } from "@/components/ui/card";
import { TextLink } from "@/components/ui/button";
import { formatDistance } from "@/lib/spots/directions";
import { accessPointCategory } from "@/lib/access-points";
import type { NearbyAccessPoint } from "@/lib/access-points";
import type { SpotDetail } from "@/lib/spots/detail";

/** Many access records are named only by an internal code such as "ST-7", which tells an angler nothing. */
function accessPointTitle(point: NearbyAccessPoint) {
  const category = accessPointCategory(point.type);
  const siteName = point.evidence?.siteName?.trim();
  if (!siteName) return category;
  return /^[A-Z]{1,4}[-\s]?\d+$/i.test(siteName) ? `${category} ${siteName}` : siteName;
}

export function FishSection({
  species,
  stocking,
}: {
  species: SpotDetail["species"];
  stocking: SpotDetail["stocking"];
}) {
  const game = species.filter((entry) => entry.game);
  const other = species.filter((entry) => !entry.game);

  return (
    <SectionCard title="What you can catch" subtitle="Sport fish Ontario has recorded in the connected water">
      {game.length === 0 && other.length === 0 ? (
        <EmptyState title="No species survey on record">
          Ontario has not published a species list for this water.
        </EmptyState>
      ) : (
        <>
          {game.length > 0 ? (
            <div>
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-500">
                Sport fish ({game.length})
              </h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {game.map((entry) => (
                  <li key={entry.name}>
                    {entry.catalogSpeciesId ? (
                      <TextLink href={`/species/${entry.catalogSpeciesId}`}>{entry.name}</TextLink>
                    ) : (
                      <Badge tone="teal">{entry.name}</Badge>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {other.length > 0 ? (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-bold text-teal-800">
                Also present: {other.length} non-sport species
              </summary>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {other.map((entry) => entry.name).join(", ")}
              </p>
            </details>
          ) : null}
        </>
      )}

      {stocking.length > 0 ? (
        <div className="mt-5 border-t border-slate-200 pt-4">
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-500">
            Recently stocked
          </h3>
          <ul className="mt-2 space-y-1">
            {stocking.map((entry, index) => (
              <li key={`${entry.species}-${entry.year}-${index}`} className="text-sm text-slate-700">
                <strong className="font-bold">{entry.year ?? "Year not recorded"}</strong>{" "}
                {entry.species}
                {entry.numberStocked ? ` — ${entry.numberStocked.toLocaleString()} fish` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </SectionCard>
  );
}

export function AccessSection({
  points,
  selectedId,
  onSelect,
}: {
  points: NearbyAccessPoint[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}) {
  return (
    <SectionCard
      title="Where exactly to fish"
      subtitle="Official Ontario access within 8 km. Numbers match the map."
    >
      {points.length === 0 ? (
        <EmptyState title="No mapped access point within 8 km">
          Ontario has no recorded launch or shore access this close. Check municipal parks or ask
          locally before fishing from private shoreline.
        </EmptyState>
      ) : (
        <ol className="space-y-2">
          {points.map((point, index) => (
            <li key={point.id}>
              <button
                type="button"
                onClick={() => onSelect?.(point.id)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                  selectedId === point.id
                    ? "border-amber-400 bg-amber-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-slate-700 text-[11px] font-black text-white">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black text-slate-900">
                      {accessPointTitle(point)}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-600">
                    {formatDistance(point.distanceKm)} {point.direction}
                    {point.evidence?.ownership ? ` · ${point.evidence.ownership}` : ""}
                    {point.evidence?.parkingRecorded ? " · parking" : ""}
                    {point.evidence?.userFeeRecorded ? " · fee" : ""}
                    {point.evidence?.surface ? ` · ${point.evidence.surface}` : ""}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </SectionCard>
  );
}
