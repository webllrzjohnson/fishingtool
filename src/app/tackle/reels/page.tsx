import Link from "next/link";
import { reelTypes } from "@/data/curated/tackle-reference";
import { TacklePicture } from "@/components/tackle/tackle-picture";

export const metadata = { title: "Reel types & spool size guide" };

export default function ReelsPage() {
  return <main className="mx-auto max-w-6xl px-4 py-10">
    <Link className="text-sm font-bold text-teal-800 underline" href="/tackle">← Tackle illustrations</Link>
    <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">Reels & spool size</h1>
    <p className="mt-4 max-w-3xl text-slate-600">Match reel, rod, line diameter and method. Representative reel photographs are credited on each card; unmatched mechanisms use labeled original schematics. Neither is a scale drawing or product recommendation.</p>
    <div className="mt-6 rounded-2xl border-l-4 border-amber-500 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>Size numbers are not a standard.</strong> A 2500 from one maker may differ from another in diameter, usable capacity, drag and weight. A baitcaster 300, line-counter 30 and spinning 3000 are <strong>not interchangeable classes</strong>. Read the specific model&apos;s line-capacity label (diameter and length), drag, rod and lure ratings; leave reserve for runs and for deployed trolling line. These examples are planning ranges, not guaranteed capacity.</div>
    <div className="mt-8 grid gap-5 md:grid-cols-2">
      {reelTypes.map((reel) => <article key={reel.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <TacklePicture id={`reel-${reel.id}`} title={`${reel.title} reel`} />
        <div className="p-5"><h2 className="text-xl font-black">{reel.title}</h2><p className="mt-2 text-sm text-slate-600">{reel.description}</p><p className="mt-3 text-sm"><strong>Class / capacity:</strong> {reel.classNote}</p><p className="mt-2 text-sm"><strong>Line pairing:</strong> {reel.line}</p><a className="mt-3 inline-block text-xs font-bold text-teal-800 underline" href={reel.source} target="_blank" rel="noopener noreferrer">Read source ↗</a></div>
      </article>)}
    </div>
    <p className="mt-7 text-sm text-slate-600">Maker references: <a href="https://daiwa.us/products/25-tatula-200" className="underline">Daiwa Tatula 200</a> for another baitcaster designation; <a href="https://www.orvis.com/how-do-i-choose-a-fly-reel.html" className="underline">Orvis fly reel selection</a>; <a href="https://okumafishingusa.com/products/cold-water-a-line-counters" className="underline">Okuma line-counter capacity</a>. <Link href="/species" className="underline">Open fish profiles</Link> for shore, ice, boat and heavy-tackle pairings.</p>
  </main>;
}
