import Link from "next/link";
import { FMZ_NUMBERS, licenceFmzGuideLinks } from "@/lib/regulations/licence-fmz-guide";

export function LicenceFmzGuide() {
  return (
    <section aria-labelledby="licence-fmz-guide-title" className="rounded-2xl border border-teal-200 bg-teal-50 p-5 shadow-sm sm:p-7">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-800">Know the terms</p>
      <h2 id="licence-fmz-guide-title" className="mt-2 text-2xl font-black tracking-tight text-teal-950 sm:text-3xl">
        Sport and Conservation limits, plus FMZ 1 through 20
      </h2>
      <p className="mt-3 max-w-4xl leading-7 text-slate-700">
        A Fisheries Management Zone, or FMZ, is a place, not a licence rating. Ontario is divided into 20 zones.
        The exact zone, waterbody, species, and date all matter before you fish or keep a fish.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl bg-white p-4">
          <h3 className="font-black text-slate-950">Sport versus Conservation</h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            A Sport Fishing Licence uses the normal catch and possession limits. A Conservation Fishing Licence
            has reduced catch limits. In Ontario&apos;s rules, <strong>S</strong> identifies the Sport limit and <strong>C</strong>
            identifies the Conservation limit. For example, S-4 means a catch and possession limit of four for
            that listed species and rule.
          </p>
        </article>
        <article className="rounded-xl bg-white p-4">
          <h3 className="font-black text-slate-950">Limits are not province-wide</h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            There is no single Sport limit for all Ontario fishing. Limits, seasons, size rules, and combined-species
            limits vary by species, FMZ, season, licence, and sometimes the exact waterbody.
          </p>
        </article>
      </div>

      <div className="mt-5 rounded-xl border border-teal-200 bg-white p-4">
        <h3 className="font-black text-slate-950">How FMZs work</h3>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          Start by finding your exact water on Fish ON-Line, then open that zone&apos;s current regulations. Zone-wide
          rules can be changed by waterbody exceptions, sanctuaries, boundaries, variation orders, or local access
          rules. A lake and a nearby tributary can be in different zones.
        </p>
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Ontario Fisheries Management Zones 1 through 20">
          {FMZ_NUMBERS.map((zone) => (
            <span key={zone} className="rounded-full bg-teal-100 px-3 py-1 text-sm font-bold text-teal-950">
              FMZ {zone}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <OfficialLink href={licenceFmzGuideLinks.fishingLicence}>Ontario licence types</OfficialLink>
        <OfficialLink href={licenceFmzGuideLinks.limitsExplainer}>How to read limits</OfficialLink>
        <OfficialLink href={licenceFmzGuideLinks.regulationsSummary}>Current regulations summary</OfficialLink>
        <OfficialLink href={licenceFmzGuideLinks.fishOnline}>Find a waterbody in Fish ON-Line</OfficialLink>
        <Link
          href="/regulations"
          className="rounded-xl border border-teal-300 bg-white px-4 py-3 text-sm font-black text-teal-950 underline"
        >
          Search the 2026 regulations library
        </Link>
      </div>
    </section>
  );
}

function OfficialLink({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-xl border border-teal-300 bg-white px-4 py-3 text-sm font-black text-teal-950 underline"
    >
      {children}
    </a>
  );
}
