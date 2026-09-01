import type { Metadata } from "next";
import { SavedTrips } from "@/components/planner/saved-trips";

export const metadata: Metadata = { title: "Saved trips" };

export default function TripsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-teal-800">My trips</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight">Saved plans and checklists</h1>
      <p className="mt-3 max-w-3xl leading-7 text-slate-600">
        Trips stay in this browser. Recheck weather, access, closures, and official fishing rules before every outing.
      </p>
      <div className="mt-7">
        <SavedTrips />
      </div>
    </div>
  );
}
