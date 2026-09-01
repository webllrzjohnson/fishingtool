"use client";

import { useEffect, useState } from "react";
import type { Coordinates } from "@/lib/types";

export function FmzLookup({ coordinates, curatedFmz }: { coordinates?: Coordinates; curatedFmz: string }) {
  const [resolved, setResolved] = useState<string>();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!coordinates) return;
    const controller = new AbortController();
    fetch(`/api/ontario/fmz?lat=${coordinates.latitude}&lon=${coordinates.longitude}`, { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "FMZ lookup unavailable");
        return body.fmz as string | null;
      })
      .then((zone) => setResolved(zone ? `fmz-${zone}`.replace("fmz-fmz-", "fmz-") : "unresolved"))
      .catch((reason) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "FMZ lookup unavailable");
      });
    return () => controller.abort();
  }, [coordinates]);

  if (!coordinates) return null;
  if (error) return <p className="mt-3 text-xs text-amber-800">{error}. Use Fish ON-Line to confirm the zone.</p>;
  if (!resolved) return <p className="mt-3 animate-pulse text-xs text-slate-500">Confirming the official FMZ polygon…</p>;
  if (resolved === "unresolved") {
    return <p className="mt-3 text-xs text-amber-800">The GIS lookup did not resolve a zone. Confirm the exact coordinates in Fish ON-Line.</p>;
  }

  const matches = resolved === curatedFmz;
  return (
    <p className={`mt-3 text-xs ${matches ? "text-slate-500" : "font-bold text-amber-800"}`}>
      Official FMZ polygon at these coordinates: {resolved.toUpperCase()}
      {matches ? " (matches this record)." : " — does not match the curated record. Treat the boundary as unresolved."}
    </p>
  );
}
