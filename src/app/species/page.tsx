import type { Metadata } from "next";
import { SpeciesCard } from "@/components/species/species-card";
import { commonSpecies } from "@/data/curated/species";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";

export const metadata: Metadata = {
  title: "Ontario fish and bait guide",
  description: "Common Ontario sport fish with seasonal bait, lure, rig, technique, and gear guidance.",
};

export default function SpeciesPage() {
  return (
    <PageShell width="wide">
      <PageHeader
        eyebrow="Fish and bait guide"
        title="Match your tackle to the fish"
        intro="Choose a target to see habitat, seasonal behaviour, natural bait, artificial lures, rigging, technique, and whether your current medium spinning setup is a good fit."
      />
      <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {commonSpecies.map((species) => (
          <SpeciesCard key={species.id} species={species} />
        ))}
      </div>
    </PageShell>
  );
}
