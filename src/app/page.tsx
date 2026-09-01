import Link from "next/link";
import { TripPlanner } from "@/components/planner/trip-planner";
import { LocationCard } from "@/components/locations/location-card";
import { fishingLocations } from "@/lib/fishing-locations";

export default function Home() {
  const featured = fishingLocations
    .filter((location) => location.popularity === "featured" || location.popularity === undefined)
    .slice(0, 6);

  return (
    <>
      <section className="overflow-hidden bg-gradient-to-br from-teal-950 via-teal-900 to-sky-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-[1.15fr_.85fr] lg:py-20">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-200">Ontario trip planner</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
              Know where to go, what to use, and what rules apply.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-teal-50/85">
              Shore-first fishing plans with popular Ontario waters, common species, bait and tackle,
              access notes, weather, and official regulation links.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#planner" className="rounded-xl bg-amber-400 px-5 py-3 font-black text-slate-950 hover:bg-amber-300">
                Plan my next trip
              </a>
              <Link href="/explore" className="rounded-xl border border-white/30 px-5 py-3 font-bold hover:bg-white/10">
                Browse Ontario
              </Link>
            </div>
          </div>
          <div className="grid content-center gap-3 sm:grid-cols-2">
            {[
              ["30+", "researched destinations"],
              ["Shore-first", "access and safety"],
              ["Date-aware", "rules guidance"],
              ["Live", "wind and weather"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <p className="text-2xl font-black">{value}</p>
                <p className="mt-1 text-sm text-teal-100">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div id="planner" className="scroll-mt-28">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-teal-800">Start here</p>
          <TripPlanner locations={fishingLocations} />
        </div>

        <section className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-teal-800">Popular waters</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">Research-backed places to begin</h2>
            </div>
            <Link href="/explore" className="font-bold text-teal-800 underline">
              View every location
            </Link>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featured.map((location) => (
              <LocationCard key={location.id} location={location} />
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-5 lg:grid-cols-3">
          {[
            {
              title: "Find the right water",
              body: "Search by fish, region, FMZ, or shore access. Boat-oriented destinations are clearly labelled.",
              href: "/explore",
              label: "Explore locations",
            },
            {
              title: "Choose bait with context",
              body: "See natural bait and artificial lures, seasonal behaviour, rigs, techniques, and gear fit.",
              href: "/species",
              label: "Open fish guide",
            },
            {
              title: "Check before you keep",
              body: "Use date-aware guidance, then verify waterbody exceptions on Ontario's official sources.",
              href: "/rules",
              label: "Check regulations",
            },
          ].map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black">{item.title}</h2>
              <p className="mt-2 leading-6 text-slate-600">{item.body}</p>
              <Link href={item.href} className="mt-5 inline-block font-bold text-teal-800 underline">
                {item.label}
              </Link>
            </article>
          ))}
        </section>
      </div>
    </>
  );
}
