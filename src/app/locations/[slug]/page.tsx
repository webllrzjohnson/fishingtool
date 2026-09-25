import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccessPoints } from "@/components/locations/access-points";
import { FmzLookup } from "@/components/locations/fmz-lookup";
import { DiscoveryMap } from "@/components/map/discovery-map";
import { SaveTripPanel } from "@/components/planner/save-trip-panel";
import { WeatherPanel } from "@/components/planner/weather-panel";
import { LocationTackle } from "@/components/species/location-tackle";
import { LocationRules } from "@/components/rules/location-rules";
import { SourceList } from "@/components/source-list";
import { matchSpecies } from "@/data/curated/species";
import { fishingLocations, getLocationById } from "@/lib/fishing-locations";
import { fmzLabel } from "@/lib/fmz-rules";
import type { LicenceType } from "@/lib/types";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string; licence?: string; target?: string }>;
};

export function generateStaticParams() {
  return fishingLocations.map((location) => ({ slug: location.slug ?? location.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const location = getLocationById(slug);
  return { title: location?.name ?? "Fishing location" };
}

export default async function LocationPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const location = getLocationById(slug);
  if (!location) notFound();
  const initialLicence: LicenceType = query.licence === "conservation" ? "conservation" : "sport";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <Link href="/explore" className="text-sm font-bold text-teal-800 underline">
        ← Explore locations
      </Link>
      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-wide">
            <span className="rounded-full bg-teal-100 px-3 py-1 text-teal-900">{location.fmz.toUpperCase()}</span>
            <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-700">{location.region}</span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">
              Shore: {location.shoreSuitability ?? "verify"}
            </span>
            {location.ambiguousBoundary ? (
              <span className="rounded-full bg-red-100 px-3 py-1 text-red-900">Boundary check required</span>
            ) : null}
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{location.name}</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">{location.accessNotes}</p>
          {location.coordinates ? (
            <section className="mt-6" aria-label={`${location.name} map`}>
              <DiscoveryMap
                locations={[location]}
                selectedId={location.id}
                className="h-[300px] sm:h-[360px] lg:h-[420px]"
              />
            </section>
          ) : null}
        </div>
        <SaveTripPanel
          location={location}
          initialDate={query.date}
          initialLicence={initialLicence}
          initialTarget={query.target}
        />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <InfoCard title="Access and facilities">
          <dl className="space-y-3 text-sm">
            <InfoRow label="Access" value={(location.accessModes ?? ["shore"]).join(", ")} />
            <InfoRow label="Parking" value={location.parking ?? "Verify locally"} />
            <InfoRow label="Fees" value={location.fees ?? "Verify locally"} />
            <InfoRow label="Hours" value={location.hours ?? "Check posted hours"} />
            <InfoRow label="Facilities" value={location.facilities?.join(", ") ?? "Not confirmed"} />
            <InfoRow label="Bait zone" value={location.baitManagementZone ?? "Verify"} />
            <InfoRow label="Municipality" value={location.municipality ?? "Ontario"} />
          </dl>
          {location.directionsUrl ? (
            <a href={location.directionsUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block font-bold text-teal-800 underline">
              Open directions
            </a>
          ) : null}
          <FmzLookup coordinates={location.coordinates} curatedFmz={location.fmz} />
        </InfoCard>

        <InfoCard title="Common fish and shore targets">
          <p className="text-xs text-amber-800">
            Species presence is planning information, not proof that a season is open.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {location.expectedSpecies.map((species) => {
              const profile = matchSpecies(species);
              const className = "rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm";
              return profile ? (
                <Link key={species} href={`/species/${profile.id}`} className={`${className} font-semibold text-teal-900`}>
                  {species}
                </Link>
              ) : (
                <span key={species} className={className}>{species}</span>
              );
            })}
          </div>
          <p className="mt-4 text-sm">
            <strong>Best beginner targets:</strong> {location.beginnerTargets.join(", ")}
          </p>
        </InfoCard>
      </div>


      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-black">7-day shore forecast</h2>
        <p className="mt-1 text-sm text-slate-500">Wind and weather help judge comfort and safety, not whether fish will bite.</p>
        <div className="mt-4">
          <WeatherPanel coordinates={location.coordinates} tripDate={query.date} />
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <InfoCard title="Bait and tackle">
          <LocationTackle location={location} date={query.date} />
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{location.baitRules}</p>
        </InfoCard>
        <InfoCard title="Local cautions">
          <ul className="space-y-2 text-sm leading-6 text-slate-700">
            {location.cautions.map((caution) => (
              <li key={caution}>- {caution}</li>
            ))}
            <li>- Cold water, waves, slippery rocks, current, and changing weather can be life-threatening.</li>
            <li>- Check the Guide to Eating Ontario Fish before keeping fish to eat.</li>
            <li>- Clean, drain, and dry boats, waders, and bait buckets to slow invasive species.</li>
            <li>- Handle fish in the water when possible and never infer a keep is legal if the zone, date, exception, or licence is unresolved.</li>
          </ul>
        </InfoCard>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-black">Nearby official access points</h2>
        <p className="mt-1 text-sm text-slate-500">Queried from Ontario Open Data within approximately 25 km.</p>
        <div className="mt-4">
          <AccessPoints coordinates={location.coordinates} />
        </div>
      </section>

      <LocationRules location={location} date={query.date} licence={initialLicence} />
      <p className="mt-4 text-sm text-slate-500">{location.fmzNote ?? fmzLabel(location.fmz)}</p>
      <SourceList sources={location.sources} />
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-2xl font-black">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-slate-800">{value}</dd>
    </div>
  );
}
