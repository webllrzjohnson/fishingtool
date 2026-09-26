import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SpeciesIllustration } from "@/components/species/species-illustration";
import { commonSpecies, getSpeciesById } from "@/data/curated/species";
import { fishingLocations } from "@/lib/fishing-locations";
import { SpeciesGearFit } from "@/components/species/species-gear-fit";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return commonSpecies.map((species) => ({ slug: species.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const species = getSpeciesById((await params).slug);
  return { title: species ? `${species.name} bait guide` : "Fish guide" };
}

export default async function SpeciesDetailPage({ params }: Props) {
  const species = getSpeciesById((await params).slug);
  if (!species) notFound();
  const matchingLocations = fishingLocations.filter((location) =>
    location.expectedSpecies.some(
      (candidate) =>
        candidate.toLowerCase().includes(species.name.toLowerCase()) ||
        species.aliases.some((alias) => candidate.toLowerCase().includes(alias.toLowerCase())),
    ),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <Link href="/species" className="text-sm font-bold text-teal-800 underline">← All common fish</Link>
      <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-teal-800">
        {species.aliases.join(" · ") || "Ontario sport fish"}
      </p>
      <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-6xl">{species.name}</h1>
      {species.image ? (
        <div className="mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <SpeciesIllustration image={species.image} priority sizes="(max-width: 768px) 100vw, 640px" className="max-h-56" />
          <p className="mt-3 text-xs text-slate-500">
            Illustration: {species.image.credit} ·{" "}
            <a href={species.image.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
              Source
            </a>
            {" "}· {species.image.license}
          </p>
        </div>
      ) : null}
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{species.summary}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <GuideCard title="Where to look">
          <ul className="space-y-2 text-sm leading-6 text-slate-700">
            {species.habitat.map((item) => <li key={item}>- {item}</li>)}
          </ul>
        </GuideCard>
        <GuideCard title="Gear fit">
          <SpeciesGearFit species={species} />
          <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{species.handling}</p>
        </GuideCard>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-black">Seasonal pattern</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(species.seasonalPattern).map(([season, pattern]) => (
            <div key={season} className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-teal-800">{season}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{pattern}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-black">Bait, lures, and rigs</h2>
        <p className="mt-1 text-sm text-slate-500">
          “Natural” does not mean legal everywhere. Follow the waterbody&apos;s bait-management and property rules.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {species.baits.map((bait) => (
            <article key={`${bait.kind}-${bait.name}`} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-black">{bait.name}</h3>
                <span className={`rounded-full px-2 py-1 text-[11px] font-black uppercase ${
                  bait.kind === "natural" ? "bg-amber-100 text-amber-900" : "bg-teal-100 text-teal-900"
                }`}>{bait.kind}</span>
              </div>
              {bait.sizes ? <p className="mt-2 text-sm"><strong>Size:</strong> {bait.sizes}</p> : null}
              {bait.rig ? <p className="mt-1 text-sm"><strong>Rig:</strong> {bait.rig}</p> : null}
              <p className="mt-2 text-sm leading-6 text-slate-600">{bait.technique}</p>
              <p className="mt-2 text-xs font-semibold text-slate-500">Best: {bait.seasons.join(", ")}</p>
              {bait.liveBaitWarning ? (
                <p className="mt-3 rounded-lg bg-red-50 p-2 text-xs font-bold text-red-900">
                  Verify bait species, BMZ transport, possession, and property restrictions before use.
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-black">Places to try for this fish</h2>
        {matchingLocations.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {matchingLocations
              .filter((location) => location.coordinates)
              .map((location) => (
                <Link
                  key={location.id}
                  href={`/?name=${encodeURIComponent(location.name)}&lat=${location.coordinates!.latitude}&lon=${location.coordinates!.longitude}`}
                  className="rounded-xl bg-teal-50 px-3 py-2 text-sm font-bold text-teal-900"
                >
                  {location.name}
                </Link>
              ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            <Link href="/" className="font-bold text-teal-800 underline">Search any Ontario place</Link>
            {" "}to see whether this fish is on record there.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs text-slate-500">
        Source: <a href={species.source.url} target="_blank" rel="noopener noreferrer" className="underline">{species.source.name}</a>
        {" "}· Last reviewed {species.source.lastVerified}
      </p>
    </div>
  );
}

function GuideCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-2xl font-black">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
