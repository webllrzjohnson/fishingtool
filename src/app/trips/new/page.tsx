import type { Metadata } from "next";
import { TripPlanner } from "@/components/planner/trip-planner";
import { fishingLocations } from "@/lib/fishing-locations";

export const metadata: Metadata = { title: "Plan a new trip" };

export default function NewTripPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-teal-800">New trip</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight">Build a shore-first plan</h1>
      <p className="mt-3 max-w-3xl leading-7 text-slate-600">
        Choose a date, target fish, and licence. Suggested waters stay shore-accessible unless you open Explore and turn that filter off.
      </p>
      <div className="mt-7">
        <TripPlanner locations={fishingLocations} />
      </div>
    </div>
  );
}
