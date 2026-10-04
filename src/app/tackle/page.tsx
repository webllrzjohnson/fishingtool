import Link from "next/link";
import { guideForFamily, tackleFamilies } from "@/data/curated/tackle-reference";
import { TacklePicture } from "@/components/tackle/tackle-picture";

export const metadata = { title: "Illustrated tackle & bait reference" };

export default function TacklePage() {
  return <main className="mx-auto max-w-6xl px-4 py-10">
    <p className="text-sm font-bold uppercase tracking-widest text-teal-800">Field reference · illustrated</p>
    <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Recognize your tackle</h1>
    <p className="mt-4 max-w-3xl text-slate-600">Explore full-size rigging guides, tackle examples and possible target fish. These illustrated examples are not guaranteed catches or universal instructions; match your actual tackle and check local rules. <Link href="/tackle/reels" className="font-bold text-teal-800 underline">See the reel & spool guide →</Link></p>
    <div className="mt-8 grid items-start gap-6 md:grid-cols-2">
      {tackleFamilies.map((family) => {
        const guide = guideForFamily(family.id);
        return <article key={family.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <TacklePicture id={family.id} title={family.title} />
        <div className="p-4">
          <h2 className="text-lg font-black">{family.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{family.caption}</p>
          <p className="mt-3 text-sm"><strong>Starting size:</strong> {guide.sizes.length ? guide.sizes.slice(0, 3).join(" · ") : "No single size fits; match hook/lure and weight to fish, water and rod rating."}</p>
          <p className="mt-2 text-sm"><strong>Example use:</strong> {guide.examples[0]?.bait.technique ?? family.caption}</p>
          {guide.examples.length ? <p className="mt-2 text-sm"><strong>Example targets:</strong> {guide.examples.filter((item, index, all) => all.findIndex((other) => other.speciesId === item.speciesId) === index).slice(0, 4).map((item, index) => <span key={item.speciesId}>{index ? " · " : ""}<Link href={`/species/${item.speciesId}`} className="text-teal-800 underline">{item.speciesName}</Link></span>)}</p> : <p className="mt-2 text-xs text-slate-500">General rig example; no species-specific option in this guide.</p>}
          {guide.natural ? <p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-950">Natural or prepared bait: verify this water&apos;s bait rules before use{["minnow-float", "cut-bait"].includes(family.id) ? "; baitfish species, possession and transport restrictions also apply" : ""}.</p> : null}
        </div>
      </article>})}
    </div>
    <aside className="mt-8 rounded-2xl bg-amber-50 p-5 text-sm text-amber-950"><strong>Natural bait is not universally permitted.</strong> Check exact waterbody and property restrictions for worms, maggots and prepared bait. Baitfish and leeches also have bait-management-zone possession and transport rules; cut bait requires permitted species. An imitation bead is not automatically legal on flies-only water. <a className="underline" href="https://www.ontario.ca/page/sustainable-bait-management-ontario">Ontario sustainable bait management ↗</a></aside>
    <p className="mt-5 text-sm text-slate-600">Further reading: <a className="underline" href="https://www.takemefishing.org/freshwater-fishing/freshwater-bait-and-lures/freshwater-lures">Take Me Fishing · freshwater lure types</a> · <a className="underline" href="https://www.ontario.ca/page/learn-fish-guide">Ontario Learn to Fish</a>. Species-specific sizes and techniques in the <Link className="underline" href="/species">fish guide</Link> are curated planning starting points, not manufacturer specifications.</p>
  </main>;
}
