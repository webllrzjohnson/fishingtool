import { z } from "zod";
import { fetchFmzForPoint } from "@/lib/sources/ontario-gis";

const querySchema = z.object({
  lat: z.coerce.number().min(41).max(57),
  lon: z.coerce.number().min(-96).max(-74),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    lat: url.searchParams.get("lat"),
    lon: url.searchParams.get("lon"),
  });
  if (!parsed.success) {
    return Response.json({ error: "Valid Ontario coordinates are required." }, { status: 400 });
  }

  try {
    const result = await fetchFmzForPoint(parsed.data.lat, parsed.data.lon);
    return Response.json(
      {
        fmz: result.zoneId,
        officialUrl: result.zoneId
          ? `https://www.ontario.ca/document/ontario-fishing-regulations-summary/fisheries-management-zone-${result.zoneId}`
          : "https://www.ontario.ca/fishonline",
        source: result.source,
        fetchedAt: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
    );
  } catch (error) {
    console.error("FMZ lookup failed", error);
    return Response.json({ error: "FMZ lookup is temporarily unavailable." }, { status: 503 });
  }
}
