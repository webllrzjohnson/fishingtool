import { z } from "zod";
import { fmzRegulationUrl, fishOnlineWaterbodyUrl } from "@/lib/sources";
import {
  fetchWaterbodyByLid,
  fetchWaterbodyForPoint,
  searchWaterbodiesByName,
  searchWaterbodiesBySpecies,
  suggestWaterbodies,
  validateWaterbodyLid,
} from "@/lib/sources/ontario-waterbodies";

const lidSchema = z.object({ lid: z.string().regex(/^\d{2}-\d{4}-\d{5}$/) });
const searchSchema = z.object({
  q: z.string().trim().min(3).max(100),
  fmz: z.coerce.number().int().min(1).max(20).optional(),
});
const pointSchema = z.object({
  lat: z.coerce.number().min(41).max(57),
  lon: z.coerce.number().min(-96).max(-74),
});

const CACHE_HEADERS = { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" };

function enrichWaterbody(waterbody: NonNullable<Awaited<ReturnType<typeof fetchWaterbodyByLid>>>) {
  const zone = waterbody.fmz.replace("fmz-", "");
  return {
    waterbody,
    fmz: waterbody.fmz,
    fmzRegulationUrl: fmzRegulationUrl(zone),
    fishOnlineUrl: fishOnlineWaterbodyUrl(waterbody.waterbodyLid),
    source: waterbody.source,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lid = url.searchParams.get("lid");
  const q = url.searchParams.get("q");
  const lat = url.searchParams.get("lat");
  const lon = url.searchParams.get("lon");
  const fmz = url.searchParams.get("fmz");

  const modeCount = [lid, q, lat && lon ? "point" : null].filter(Boolean).length;
  if (modeCount !== 1) {
    return Response.json(
      { error: "Provide exactly one of lid, q, or lat/lon." },
      { status: 400 },
    );
  }

  try {
    if (lid) {
      const parsed = lidSchema.safeParse({ lid });
      if (!parsed.success || !validateWaterbodyLid(lid)) {
        return Response.json({ error: "A valid WATERBODY_LID is required." }, { status: 400 });
      }
      const waterbody = await fetchWaterbodyByLid(lid);
      if (!waterbody) {
        return Response.json({ error: "No official waterbody record was found for that LID." }, { status: 404 });
      }
      return Response.json(
        {
          ...enrichWaterbody(waterbody),
          fetchedAt: new Date().toISOString(),
        },
        { headers: CACHE_HEADERS },
      );
    }

    if (q) {
      const parsed = searchSchema.safeParse({ q, fmz: fmz ?? undefined });
      if (!parsed.success) {
        return Response.json({ error: "Search queries must be at least 3 characters." }, { status: 400 });
      }

      if (url.searchParams.get("by") === "species") {
        const suggestions = await searchWaterbodiesBySpecies(parsed.data.q, { fmz: parsed.data.fmz });
        return Response.json({ suggestions }, { headers: CACHE_HEADERS });
      }

      if (url.searchParams.get("suggest") === "1") {
        const suggestions = await suggestWaterbodies(parsed.data.q, { fmz: parsed.data.fmz });
        return Response.json({ suggestions }, { headers: CACHE_HEADERS });
      }

      const result = await searchWaterbodiesByName(parsed.data.q, { fmz: parsed.data.fmz });
      return Response.json(
        {
          results: result.waterbodies.map((waterbody) => enrichWaterbody(waterbody)),
          exceededTransferLimit: result.exceededTransferLimit,
          fetchedAt: new Date().toISOString(),
        },
        { headers: CACHE_HEADERS },
      );
    }

    const parsed = pointSchema.safeParse({ lat, lon });
    if (!parsed.success) {
      return Response.json({ error: "Valid Ontario coordinates are required." }, { status: 400 });
    }
    const waterbody = await fetchWaterbodyForPoint(parsed.data.lat, parsed.data.lon);
    if (!waterbody) {
      return Response.json({ error: "No official waterbody record was found near those coordinates." }, { status: 404 });
    }
    return Response.json(
      {
        ...enrichWaterbody(waterbody),
        fetchedAt: new Date().toISOString(),
      },
      { headers: CACHE_HEADERS },
    );
  } catch (error) {
    console.error("Waterbody lookup failed", error);
    return Response.json({ error: "Waterbody lookup is temporarily unavailable." }, { status: 503 });
  }
}
