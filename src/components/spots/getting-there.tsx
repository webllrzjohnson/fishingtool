"use client";

import { useEffect, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/card";
import { distanceBetweenKm, directionFrom } from "@/lib/access-points";
import {
  appleDirectionsUrl,
  compassName,
  formatDistance,
  googleDirectionsUrl,
} from "@/lib/spots/directions";
import { formatDriveTimeEstimate } from "@/lib/spots/suggest";
import type { Coordinates } from "@/lib/types";

type Status = "idle" | "locating" | "denied" | "unsupported" | "failed";

export function GettingThere({ spot, spotName }: { spot: Coordinates; spotName: string }) {
  const [origin, setOrigin] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [drive, setDrive] = useState<{ minutes: number; source: "road" | "estimate" } | null>(null);
  const [drivePending, setDrivePending] = useState(false);

  function locate() {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setStatus("idle");
      },
      (error) => setStatus(error.code === error.PERMISSION_DENIED ? "denied" : "failed"),
      { timeout: 10_000, maximumAge: 300_000 },
    );
  }

  useEffect(() => {
    if (!origin) return;
    const controller = new AbortController();
    const params = new URLSearchParams({
      lat: origin.latitude.toFixed(5),
      lon: origin.longitude.toFixed(5),
      dlat: spot.latitude.toFixed(5),
      dlon: spot.longitude.toFixed(5),
    });
    setDrivePending(true);
    fetch(`/api/spots/drive?${params}`, { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Drive time unavailable");
        return body as { minutes: number; source: "road" | "estimate" };
      })
      .then((body) => {
        setDrive(body);
      })
      .catch((reason) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setDrive(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setDrivePending(false);
      });
    return () => controller.abort();
  }, [origin, spot.latitude, spot.longitude]);

  const distanceKm = origin ? distanceBetweenKm(origin, spot) : undefined;
  const bearing = origin ? directionFrom(origin, spot) : undefined;

  return (
    <SectionCard title="Getting there" subtitle={`Directions to ${spotName}`}>
      {origin && distanceKm !== undefined && bearing ? (
        <p className="text-sm text-slate-700">
          <strong className="font-black">{formatDistance(distanceKm)}</strong> away,{" "}
          {compassName(bearing)} of you.
          {drivePending ? " Checking the road time…" : null}
          {drive ? ` ${formatDriveTimeEstimate(drive.minutes, drive.source)}.` : null}
        </p>
      ) : (
        <div>
          <Button onClick={locate} disabled={status === "locating"}>
            {status === "locating" ? "Finding you…" : "Use my location"}
          </Button>
          <p className="mt-2 text-xs text-slate-500">
            {status === "denied"
              ? "Location permission was declined. You can still open directions and set your own start point."
              : status === "unsupported"
                ? "This browser cannot share a location. Open directions and set your own start point."
                : status === "failed"
                  ? "Your location could not be read. Open directions and set your own start point."
                  : "Optional. Used only in your browser to measure distance and driving time."}
          </p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <ButtonLink
          href={googleDirectionsUrl(spot, origin ?? undefined)}
          external
          variant="primary"
        >
          Directions in Google Maps
        </ButtonLink>
        <ButtonLink href={appleDirectionsUrl(spot, origin ?? undefined)} external variant="secondary">
          Apple Maps
        </ButtonLink>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Coordinates: {spot.latitude.toFixed(5)}, {spot.longitude.toFixed(5)}
      </p>
    </SectionCard>
  );
}
