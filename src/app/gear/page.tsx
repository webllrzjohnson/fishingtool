import type { Metadata } from "next";
import Link from "next/link";
import { commonSpecies } from "@/data/curated/species";
import { defaultGear } from "@/lib/gear";
import { gearFitForSpecies } from "@/lib/gear-fit";
import { userGear } from "@/lib/user-gear";

export const metadata: Metadata = { title: "My gear" };

export default function GearPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-teal-800">My gear</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight">What this planner assumes you are carrying</h1>
      <p className="mt-3 max-w-3xl leading-7 text-slate-600">
        Recommendations start from your Ugly Stik GX2 medium spinning combo. Add extra outfits later; until then the app will say when a fish is a poor match.
      </p>
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black">{defaultGear.name}</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
          <div><dt className="font-black">Power</dt><dd>{defaultGear.power}</dd></div>
          <div><dt className="font-black">Line</dt><dd>{defaultGear.line}</dd></div>
          <div className="sm:col-span-2"><dt className="font-black">Notes</dt><dd className="text-slate-600">{defaultGear.notes}</dd></div>
          <div className="sm:col-span-2"><dt className="font-black">Licence</dt><dd>{userGear.licence}</dd></div>
        </dl>
      </section>
      <section className="mt-8">
        <h2 className="text-2xl font-black">Fit by species</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {commonSpecies.map((species) => {
            const fit = gearFitForSpecies(species);
            return (
              <Link key={species.id} href={`/species/${species.id}`} className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-teal-300">
                <p className="font-black">{species.name}</p>
                <p className="mt-1 text-xs font-bold uppercase text-teal-800">{fit.label}</p>
                <p className="mt-2 text-sm text-slate-600">{fit.detail}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
