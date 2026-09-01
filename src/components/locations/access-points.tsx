"use client";

import { useEffect, useState } from "react";
import type { AccessPoint, Coordinates } from "@/lib/types";

export function AccessPoints({ coordinates }: { coordinates?: Coordinates }) {
  const [points, setPoints] = useState<AccessPoint[]>();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!coordinates) return;
    const controller = new AbortController();
    fetch(`/api/ontario/access?lat=${coordinates.latitude}&lon=${coordinates.longitude}&radius=25`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Access data unavailable");
        return body.points as AccessPoint[];
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

  return (
    <div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {points.slice(0, 8).map((point) => (
          <li key={point.id} className="rounded-xl border border-slate-200 p-3">
            <p className="font-bold">{point.type}</p>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${point.coordinates.latitude},${point.coordinates.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-xs font-bold text-teal-800 underline"
            >
              Directions
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-slate-500">
        Official access records still require on-site verification; an access point does not guarantee parking,
        operating hours, launch condition, or shore permission.
      </p>
    </div>
  );
}
