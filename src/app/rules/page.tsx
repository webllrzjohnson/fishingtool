import type { Metadata } from "next";
import Link from "next/link";
import { LicenceFmzGuide } from "@/components/rules/licence-fmz-guide";
import { RulesChecker } from "@/components/rules/rules-checker";

export const metadata: Metadata = {
  title: "Ontario fishing rules check",
  description: "Conservative date, FMZ, species, and licence-aware Ontario fishing rules guidance.",
};

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-red-800">Rules check</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Check before you cast or keep</h1>
      <p className="mt-3 max-w-3xl leading-7 text-slate-600">
        Choose the exact FMZ, date, licence, and fish. The checker is deliberately conservative and always
        sends you to Ontario&apos;s official source for final verification. For broader 2026 topics such as bait
        receipts, ice huts, or combined limits, use the{" "}
        <Link href="/regulations" className="font-bold text-teal-800 underline">2026 regulations library</Link>.
      </p>
      <div className="mt-7">
        <LicenceFmzGuide />
      </div>
      <div className="mt-7">
        <RulesChecker />
      </div>
    </div>
  );
}
