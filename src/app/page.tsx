import { SpotFinder } from "@/components/spots/spot-finder";
import { fetchSpotDetail } from "@/lib/spots/detail";
import { fetchWaterbodyByLid } from "@/lib/sources/ontario-waterbodies";
import type { SpotDetail } from "@/lib/spots/detail";

export const metadata = {
  title: "Find a fishing spot in Ontario",
  description:
    "Search any Ontario town, harbour, lake, or river to see it on the map, how to drive there, the official access points, the fish on record, and the rules that apply.",
};

/**
 * The spot is rendered on the server when the URL carries one, so a shared link opens
 * straight onto the details instead of an empty search box.
 */
async function resolveSpot(params: Record<string, string | string[] | undefined>) {
  const read = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  try {
    const lid = read("lid");
    if (lid) {
      const waterbody = await fetchWaterbodyByLid(lid);
      if (!waterbody?.coordinates) return undefined;
      return await fetchSpotDetail(
        waterbody.officialName,
        waterbody.coordinates.latitude,
        waterbody.coordinates.longitude,
      );
    }

    const latitude = Number(read("lat"));
    const longitude = Number(read("lon"));
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return undefined;
    return await fetchSpotDetail(read("name") ?? "Selected spot", latitude, longitude);
  } catch {
    // A failed preload is not fatal; the client can retry from the search box.
    return undefined;
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialSpot: SpotDetail | undefined = await resolveSpot(params);

  return (
    <>
      <section className="bg-gradient-to-br from-teal-950 via-teal-900 to-sky-900 text-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-200">
            Ontario fishing
          </p>
          <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            Type a place. Get everything you need to fish it.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-teal-50/85">
            The map, how to drive there from where you are, the official access points, the fish on
            record, live conditions, and the rules that apply.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
        <SpotFinder initialSpot={initialSpot} />
      </div>
    </>
  );
}
