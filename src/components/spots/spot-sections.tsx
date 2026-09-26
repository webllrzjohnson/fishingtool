"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState, SectionCard } from "@/components/ui/card";
import { TextLink } from "@/components/ui/button";
import { KeyLegend } from "@/components/ui/key-legend";
import { rulesForFmz } from "@/lib/fmz-rules";
import { evaluateRule } from "@/lib/regulations/evaluate";
import { formatDistance } from "@/lib/spots/directions";
import { accessPointCategory } from "@/lib/access-points";
import type { NearbyAccessPoint } from "@/lib/access-points";
import type { SpotDetail } from "@/lib/spots/detail";
import type { FmzId } from "@/lib/types";

const ZONE_STATUS_LEGEND = [
  { label: "Open", meaning: "In season with a keep limit", swatchClassName: "bg-emerald-100 text-emerald-900" },
  { label: "Closed", meaning: "Out of season — do not keep", swatchClassName: "bg-red-100 text-red-900" },
  {
    label: "C&R",
    meaning: "Catch and release only",
    swatchClassName: "bg-sky-100 text-sky-900",
  },
  {
    label: "Check",
    meaning: "Unclear — verify on official rules",
    swatchClassName: "bg-amber-100 text-amber-950",
  },
] as const;

function localDateIso() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function statusTone(status: string) {
  if (status === "open") return "bg-emerald-100 text-emerald-900";
  if (status === "closed") return "bg-red-100 text-red-900";
  if (status === "catch-and-release") return "bg-sky-100 text-sky-900";
  return "bg-amber-100 text-amber-950";
}

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
  fmz,
  baitZone,
}: {
  species: SpotDetail["species"];
  stocking: SpotDetail["stocking"];
  fmz?: string;
  baitZone?: string;
}) {
  const game = species.filter((entry) => entry.game);
  const other = species.filter((entry) => !entry.game);
  const today = useMemo(() => localDateIso(), []);
  const zoneToday = useMemo(() => {
    if (!fmz) return [];
    const rules = rulesForFmz(fmz as FmzId);
    return game
      .filter((entry) => entry.catalogSpeciesId)
      .slice(0, 4)
      .map((entry) => {
        const rule = rules.find((item) => item.speciesId === entry.catalogSpeciesId);
        if (!rule) {
          return {
            name: entry.name,
            label: "Check official",
            status: "unknown",
            reason: "This species is not in the zone summary loaded here.",
            speciesId: entry.catalogSpeciesId,
          };
        }
        const result = evaluateRule(rule, today, "sport");
        return {
          name: entry.name,
          label: result.label,
          status: result.status,
          reason: result.reason,
          speciesId: entry.catalogSpeciesId,
        };
      });
  }, [fmz, game, today]);

  return (
    <SectionCard title="What you can catch" subtitle="Sport fish Ontario has recorded in the connected water">
      {baitZone ? (
        <p className="mb-4 text-sm leading-6 text-slate-700">
          <span className="font-black">Bait zone: {baitZone}.</span> Do not move baitfish or leeches
          into or out of this zone.{" "}
          <TextLink href="https://www.ontario.ca/page/bait-management-zones" external size="xs">
            Official bait rules
          </TextLink>
        </p>
      ) : null}
      {zoneToday.length > 0 ? (
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Today in this zone</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {zoneToday.map((entry) => (
              <li key={entry.name}>
                <a
                  href={`/rules?fmz=${fmz}&species=${entry.speciesId ?? ""}&date=${today}`}
                  title={entry.reason}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${statusTone(entry.status)}`}
                >
                  <span className="text-slate-800 underline">{entry.name}</span>
                  <span>{entry.label}</span>
                </a>
              </li>
            ))}
          </ul>
          {zoneToday.some((entry) => entry.status !== "open" && entry.status !== "closed" && entry.status !== "catch-and-release") ? (
            <ul className="mt-2 space-y-1">
              {zoneToday
                .filter((entry) => entry.status !== "open" && entry.status !== "closed" && entry.status !== "catch-and-release")
                .map((entry) => (
                  <li key={`${entry.name}-why`} className="text-xs text-amber-950">
                    <span className="font-bold">{entry.name}:</span> {entry.reason}
                  </li>
                ))}
            </ul>
          ) : null}
          <KeyLegend title="Colour key" items={ZONE_STATUS_LEGEND} className="mt-3 border-t border-slate-200 pt-2" />
          <p className="mt-2 text-xs text-slate-600">
            Zone-wide summary for today — not a waterbody-specific ruling.{" "}
            <TextLink href={`/rules?fmz=${fmz}`} size="xs">Full rules for {fmz?.replace("fmz-", "FMZ ")}</TextLink>
          </p>
        </div>
      ) : null}
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
              <KeyLegend
                title="Name styles"
                className="mt-3"
                items={[
                  {
                    label: "Linked name",
                    meaning: "Opens this app’s species guide",
                    swatchClassName: "bg-white text-teal-800 underline",
                  },
                  {
                    label: "PILL NAME",
                    meaning: "On Ontario’s list here, but no guide page yet",
                    swatchClassName: "bg-teal-100 text-teal-900",
                  },
                ]}
              />
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
        <>
          <KeyLegend
            title="Signs"
            className="mb-3"
            items={[
              {
                label: "1",
                meaning: "Matches the numbered pin on the map",
                swatchClassName: "bg-slate-700 text-white",
              },
              {
                label: "Selected",
                meaning: "Yellow highlight is the access you picked",
                swatchClassName: "border border-amber-400 bg-amber-50 text-amber-950",
              },
            ]}
          />
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
        </>
      )}
    </SectionCard>
  );
}
