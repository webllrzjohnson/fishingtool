import type { Metadata } from "next";
import { TripPlanner } from "@/components/planner/trip-planner";
import { fishingLocations } from "@/lib/fishing-locations";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";

export const metadata: Metadata = { title: "Plan a new trip" };

export default function NewTripPage() {
  return (
    <PageShell>
      <PageHeader
        backHref="/trips"
        backLabel="← Saved trips"
        eyebrow="New trip"
        title="Build a shore-first plan"
        intro="Choose a date, target fish, and licence. Suggested waters stay shore-accessible unless you open Explore and turn that filter off."
      />
      <div className="mt-7">
        <TripPlanner locations={fishingLocations} />
      </div>
    </PageShell>
  );
}
