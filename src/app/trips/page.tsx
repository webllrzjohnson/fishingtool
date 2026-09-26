import type { Metadata } from "next";
import { SavedTrips } from "@/components/planner/saved-trips";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Saved trips" };

export default function TripsPage() {
  return (
    <PageShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          eyebrow="Saved trips"
          title="Spots you saved"
          intro="Trips stay in this browser. Recheck weather, access, and official rules before every outing."
        />
        <ButtonLink href="/" variant="primary" className="shrink-0">
          Find a spot
        </ButtonLink>
      </div>

      <div className="mt-7">
        <SavedTrips />
      </div>
    </PageShell>
  );
}
