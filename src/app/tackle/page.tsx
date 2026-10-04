import Link from "next/link";
import { tackleCatalog } from "@/lib/tackle-catalog";
import { TackleCatalog } from "@/components/tackle/tackle-catalog";

export const metadata = { title: "Illustrated tackle & bait reference" };

export default function TacklePage() {
  return <main className="mx-auto max-w-6xl px-4 py-10">
    <p className="text-sm font-bold uppercase tracking-widest text-teal-800">Field reference · illustrated</p>
    <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Recognize your tackle</h1>
    <p className="mt-4 max-w-3xl text-slate-600">Explore full-size rigging guides, tackle examples and researched possible Ontario targets. The target lists may be broader than the fish pictured in an infographic; neither is a guaranteed catch or permission to fish a specific water. Match lure size to the fish, check local rules, and <Link href="/tackle/reels" className="font-bold text-teal-800 underline">see the reel & spool guide →</Link></p>
    <TackleCatalog items={tackleCatalog} />
    <aside className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-700">
      <h2 className="text-lg font-black text-slate-900">Another common lure to know</h2>
      <p className="mt-2"><strong>Buzzbait</strong> is listed by Ontario for <Link href="/species/largemouth-bass" className="text-teal-800 underline">largemouth bass</Link> and <Link href="/species/northern-pike" className="text-teal-800 underline">northern pike</Link>. It is a different surface lure from the cupped popper above. We have not added a buzzbait infographic yet, so it is listed here rather than represented by an inaccurate image. <a href="https://www.ontario.ca/page/largemouth-bass" className="text-teal-800 underline">Bass source ↗</a> · <a href="https://www.ontario.ca/page/northern-pike" className="text-teal-800 underline">Pike source ↗</a></p>
    </aside>
    <aside className="mt-8 rounded-2xl bg-amber-50 p-5 text-sm text-amber-950"><strong>Natural bait is not universally permitted.</strong> Check exact waterbody and property restrictions for worms, maggots and prepared bait. Baitfish and leeches also have bait-management-zone possession and transport rules; cut bait requires permitted species. An imitation bead is not automatically legal on flies-only water. <a className="underline" href="https://www.ontario.ca/page/sustainable-bait-management-ontario">Ontario sustainable bait management ↗</a></aside>
    <p className="mt-5 text-sm text-slate-600">Further reading: <a className="underline" href="https://www.takemefishing.org/freshwater-fishing/freshwater-bait-and-lures/freshwater-lures">Take Me Fishing · freshwater lure types</a> · <a className="underline" href="https://www.ontario.ca/page/learn-fish-guide">Ontario Learn to Fish</a>. Species-specific sizes and techniques in the <Link className="underline" href="/species">fish guide</Link> are curated planning starting points, not manufacturer specifications.</p>
  </main>;
}
