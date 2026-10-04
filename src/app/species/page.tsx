import type { Metadata } from "next";
import { SpeciesDirectory } from "@/components/species/species-directory";
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
        intro="Find an Ontario fish by name, alias or region. Compare where it occurs, seasonal depth and habitat starting points, and lures before opening the full guide."
      />
      <p className="mt-4 text-sm text-slate-600">These are general habitat clues, not proof that a fish occurs at a specific spot or that its season is open. Check Fish ON-Line and current zone/waterbody rules before targeting.</p>
      <SpeciesDirectory species={commonSpecies} />
    </PageShell>
  );
}
