import Link from "next/link";
import { SpeciesIllustration } from "@/components/species/species-illustration";
import { getSpeciesImage } from "@/data/curated/species-images";
import type { SpeciesProfile } from "@/lib/types";

export function SpeciesCard({ species }: { species: SpeciesProfile }) {
  const natural = species.baits.filter((bait) => bait.kind === "natural").slice(0, 2);
  const artificial = species.baits.filter((bait) => bait.kind === "artificial").slice(0, 3);
  const image = species.image ?? getSpeciesImage(species.id);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {image ? (
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
          <SpeciesIllustration image={image} sizes="(max-width: 768px) 100vw, 320px" className="max-h-36" />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-black uppercase tracking-wide text-teal-800">{species.aliases.join(" · ") || "Ontario sport fish"}</p>
        <h2 className="mt-2 text-2xl font-black">{species.name}</h2>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{species.summary}</p>
        <div className="mt-4">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Common baits</p>
          <p className="mt-1 text-sm text-slate-700">{natural.map((bait) => bait.name).join(", ") || "See lure guidance"}</p>
        </div>
        <div className="mt-3">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Lures</p>
          <p className="mt-1 text-sm text-slate-700">{artificial.map((bait) => bait.name).join(", ")}</p>
        </div>
        <Link
          href={`/species/${species.id}`}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-800 px-4 text-sm font-bold text-white"
        >
          Bait, rigs, and seasons
        </Link>
      </div>
    </article>
  );
}
