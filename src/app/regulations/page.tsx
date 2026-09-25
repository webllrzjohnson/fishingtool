import type { Metadata } from "next";
import Link from "next/link";
import { RegulationsLibrary } from "@/components/regulations/regulations-library";

export const metadata: Metadata = {
  title: "2026 Ontario fishing regulations library",
  description: "Search source-backed 2026 Ontario fishing regulations topics and FMZ entry points, then verify the exact waterbody in Fish ON-Line.",
};

export default function RegulationsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-red-800">2026 regulations library</p>
      <h1 className="mt-2 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">Search the rules. Verify the water.</h1>
      <p className="mt-3 max-w-4xl leading-7 text-slate-600">
        A practical first-stage index of the official 2026 Ontario Fishing Regulations Summary, effective January 1, 2026. Every entry cites its printed PDF page and links back to Ontario sources. For a date- and species-specific check, use the{" "}
        <Link href="/rules" className="font-bold text-teal-800 underline">rules checker</Link>.
      </p>
      <div className="mt-8"><RegulationsLibrary /></div>
    </div>
  );
}
