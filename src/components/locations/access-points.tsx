"use client";

import { useEffect, useState } from "react";
import { accessPointCategory, accessPointDescription, type NearbyAccessPoint } from "@/lib/access-points";
import type { Coordinates } from "@/lib/types";

export function AccessPoints({ coordinates }: { coordinates?: Coordinates }) {
  const [points, setPoints] = useState<NearbyAccessPoint[]>();
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!coordinates) return;
    const controller = new AbortController();
    fetch(`/api/ontario/access?lat=${coordinates.latitude}&lon=${coordinates.longitude}&radius=25`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Access data unavailable");
        return body.points as NearbyAccessPoint[];
      })
      .then(setPoints)
      .catch((reason) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "Access data unavailable");
      });
    return () => controller.abort();
  }, [coordinates]);

  if (!coordinates) return <p className="text-sm text-slate-500">No coordinates are available for this record.</p>;
  if (error) return <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{error}</p>;
  if (!points) return <p className="animate-pulse text-sm text-slate-500">Checking Ontario&apos;s official nearby access dataset…</p>;
  if (!points.length) {
    return (
      <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700">
        No official access points were returned nearby. Use Fish ON-Line or local park maps before assuming shore access.
      </p>
    );
  }

  const visiblePoints = showAll ? points : points.slice(0, 8);

  return (
    <div>
      <p className="rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">
        Nearest first. This Ontario Open Data layer reports an official point type and map position only. Shore
        access records are labelled separately from boat launches. It does not establish shore permission, parking,
        operating hours, or launch condition.
      </p>
      <p className="mt-3 text-xs font-semibold text-slate-600">
        Showing the {visiblePoints.length} nearest of {points.length} returned official records.
      </p>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {visiblePoints.map((point) => (
          <li key={point.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-bold text-slate-950">{point.evidence?.siteName ?? point.type}</p>
                {point.evidence?.siteName ? <p className="mt-0.5 text-sm font-semibold text-slate-700">{point.type}</p> : null}
                <p className="mt-1 text-sm text-slate-600">{accessPointDescription(point.type)}</p>
              </div>
              <span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-bold text-teal-900">
                {accessPointCategory(point.type)}
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">From this location</dt>
                <dd className="mt-1 font-semibold text-slate-800">{point.distanceKm.toFixed(1)} km {point.direction}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Official record ID</dt>
                <dd className="mt-1 font-mono text-xs text-slate-800">{point.id}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Coordinates</dt>
                <dd className="mt-1 font-mono text-xs text-slate-800">
                  {point.coordinates.latitude.toFixed(4)}, {point.coordinates.longitude.toFixed(4)}
                </dd>
              </div>
            </dl>
            <div className="mt-4 rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Dataset recorded</p>
              <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-slate-700">
                <div>
                  <dt className="text-slate-500">Ownership</dt>
                  <dd className="font-medium">{point.evidence?.ownership ?? "Not recorded"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Parking</dt>
                  <dd className="font-medium">{point.evidence?.parkingRecorded ? "Yes" : "Not recorded"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">User fee</dt>
                  <dd className="font-medium">{point.evidence?.userFeeRecorded ? "Yes" : "Not recorded"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Accessibility</dt>
                  <dd className="font-medium">{point.evidence?.accessibilityRecorded ? "Yes" : "Not recorded"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Surface</dt>
                  <dd className="font-medium">{point.evidence?.surface ?? "Not recorded"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Record verified</dt>
                  <dd className="font-medium">{point.evidence?.verifiedDate ?? "Not recorded"}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs leading-5 text-slate-600">
                These are historic dataset fields, not live availability. A past verification date may be stale; check signs,
                fees, parking, and conditions when you arrive.
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-sm font-bold">
              {point.evidence?.officialRecordUrl ? (
                <a href={point.evidence.officialRecordUrl} target="_blank" rel="noopener noreferrer" className="text-teal-800 underline">
                  Open official record
                </a>
              ) : null}
              {point.evidence?.informationUrl ? (
                <a href={point.evidence.informationUrl} target="_blank" rel="noopener noreferrer" className="text-teal-800 underline">
                  Official site information
                </a>
              ) : null}
              {point.evidence?.photoUrl ? (
                <a href={point.evidence.photoUrl} target="_blank" rel="noopener noreferrer" className="text-teal-800 underline">
                  Official dataset photo
                </a>
              ) : null}
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${point.coordinates.latitude},${point.coordinates.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-teal-800 px-3 py-2 text-sm font-bold text-white hover:bg-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2"
            >
              Get directions
            </a>
          </li>
        ))}
      </ul>
      {points.length > 8 ? (
        <button
          type="button"
          onClick={() => setShowAll((current) => !current)}
          className="mt-4 rounded-lg border border-teal-800 px-3 py-2 text-sm font-bold text-teal-900 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2"
        >
          {showAll ? "Show nearest 8" : `Show ${points.length - 8} more official records`}
        </button>
      ) : null}
      <p className="mt-3 text-xs text-slate-500">
        To inspect a record, open its official record link and search the returned data for its OGF_ID. Official records
        still require on-site verification before relying on any point.
      </p>
    </div>
  );
}
