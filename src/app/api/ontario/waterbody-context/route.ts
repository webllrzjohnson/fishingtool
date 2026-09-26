import { z } from "zod";
import { fetchWaterbodyContext } from "@/lib/sources/fish-online";

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
    const context = await fetchWaterbodyContext(parsed.data.lat, parsed.data.lon);
    return Response.json(
      { ...context, fetchedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
    );
  } catch (error) {
    console.error("Waterbody context lookup failed", error);
    return Response.json({ error: "Zone details are temporarily unavailable." }, { status: 503 });
  }
}
