import type { Metadata } from "next";
import { Suspense } from "react";
import { ExploreClient } from "@/components/planner/explore-client";
import { fishingLocations } from "@/lib/fishing-locations";

export const metadata: Metadata = {
  title: "Explore fishing locations",
  description: "Search popular Ontario fishing locations by region, species, and shore access.",
};

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-teal-800">Explore Ontario</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Find water that fits your trip</h1>
      <p className="mt-3 max-w-3xl leading-7 text-slate-600">
        Start with researched popular destinations, then confirm the exact access point and waterbody in
        Fish ON-Line. Shore and pier access are prioritized by default.
      </p>
      <div className="mt-7">
        <Suspense fallback={<p className="text-sm text-slate-500">Loading locations…</p>}>
          <ExploreClient locations={fishingLocations} />
        </Suspense>
      </div>
    </div>
  );
}
