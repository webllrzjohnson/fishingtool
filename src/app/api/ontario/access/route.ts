import { z } from "zod";
import { fetchNearbyAccessPoints } from "@/lib/sources/ontario-gis";

const querySchema = z.object({
  lat: z.coerce.number().min(41).max(57),
  lon: z.coerce.number().min(-96).max(-74),
  radius: z.coerce.number().min(1).max(100).default(20),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    lat: url.searchParams.get("lat"),
    lon: url.searchParams.get("lon"),
    radius: url.searchParams.get("radius") ?? 20,
  });
  if (!parsed.success) {
    return Response.json({ error: "Valid Ontario coordinates are required." }, { status: 400 });
  }

  try {
    const points = await fetchNearbyAccessPoints(parsed.data.lat, parsed.data.lon, parsed.data.radius);
    return Response.json(
      { points, source: "Ontario Open Data", fetchedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
    );
  } catch (error) {
    console.error("Ontario access lookup failed", error);
    return Response.json(
      { error: "Official access points are temporarily unavailable. Open Fish ON-Line to verify access." },
      { status: 503 },
    );
  }
}
