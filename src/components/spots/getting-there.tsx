"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/card";
import { distanceBetweenKm, directionFrom } from "@/lib/access-points";
import {
  appleDirectionsUrl,
  compassName,
  formatDistance,
  googleDirectionsUrl,
} from "@/lib/spots/directions";
import type { Coordinates } from "@/lib/types";

type Status = "idle" | "locating" | "denied" | "unsupported" | "failed";

export function GettingThere({ spot, spotName }: { spot: Coordinates; spotName: string }) {
  const [origin, setOrigin] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<Status>("idle");

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

  const distanceKm = origin ? distanceBetweenKm(origin, spot) : undefined;
  const bearing = origin ? directionFrom(origin, spot) : undefined;

  return (
    <SectionCard title="Getting there" subtitle={`Directions to ${spotName}`}>
      {origin && distanceKm !== undefined && bearing ? (
        <p className="text-sm text-slate-700">
          <strong className="font-black">{formatDistance(distanceKm)}</strong> away,{" "}
          {compassName(bearing)} of you in a straight line. Driving distance will be longer.
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
                  : "Optional. Used only in your browser to measure the distance, never stored or sent to us."}
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
