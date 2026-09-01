"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteTrip, readTrips, writeTrips } from "@/lib/trips/storage";
import { getLocationById } from "@/lib/fishing-locations";
import type { TripPlan } from "@/lib/types";

export function SavedTrips() {
  const [trips, setTrips] = useState<TripPlan[]>([]);

  useEffect(() => {
    const refresh = () => setTrips(readTrips());
    refresh();
    window.addEventListener("fishing-trips-updated", refresh);
    return () => window.removeEventListener("fishing-trips-updated", refresh);
  }, []);

  function toggle(trip: TripPlan, item: string) {
    const next = trips.map((candidate) =>
      candidate.id === trip.id
        ? { ...candidate, checklist: { ...candidate.checklist, [item]: !candidate.checklist[item] } }
        : candidate,
    );
    setTrips(next);
    writeTrips(next);
  }

  if (!trips.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <h2 className="text-xl font-black">No saved trips yet</h2>
        <p className="mt-2 text-slate-600">Open a location, choose a date, and save it here with its checklist.</p>
        <Link href="/trips/new" className="mt-5 inline-block rounded-xl border border-teal-800 px-4 py-3 font-bold text-teal-900">
          Start a new trip
        </Link>
        <Link href="/explore" className="mt-5 inline-block rounded-xl bg-teal-800 px-4 py-3 font-bold text-white">
          Find a fishing spot
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {trips.map((trip) => {
        const location = getLocationById(trip.locationId);
        const checked = Object.values(trip.checklist).filter(Boolean).length;
        const total = Object.keys(trip.checklist).length;
        return (
          <article key={trip.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-teal-800">{trip.date}</p>
                <h2 className="mt-1 text-2xl font-black">{location?.name ?? "Unknown location"}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {trip.licenceType} licence · {trip.targetSpeciesIds.join(", ") || "No target selected"}
                </p>
              </div>
              <div className="flex gap-2">
                {location ? (
                  <Link href={`/locations/${location.slug ?? location.id}?date=${trip.date}`} className="rounded-lg bg-teal-50 px-3 py-2 text-sm font-bold text-teal-900">
                    Open
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    deleteTrip(trip.id);
                    setTrips(readTrips());
                  }}
                  className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
            {trip.notes ? <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">{trip.notes}</p> : null}
            <div className="mt-5">
              <div className="flex items-center justify-between text-sm">
                <h3 className="font-black">Before-you-go checklist</h3>
                <span className="text-slate-500">{checked}/{total}</span>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {Object.entries(trip.checklist).map(([item, complete]) => (
                  <label key={item} className="flex min-h-12 items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm">
                    <input type="checkbox" checked={complete} onChange={() => toggle(trip, item)} className="mt-0.5 size-4" />
                    <span className={complete ? "text-slate-400 line-through" : "text-slate-700"}>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
