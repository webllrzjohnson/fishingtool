import { z } from "zod";
import { fetchSpotDetail } from "@/lib/spots/detail";
import { fetchWaterbodyByLid } from "@/lib/sources/ontario-waterbodies";

const pointSchema = z.object({
  name: z.string().trim().min(1).max(120).default("Selected spot"),
  lat: z.coerce.number().min(41).max(57),
  lon: z.coerce.number().min(-96).max(-74),
});

const lidPattern = /^\d{2}-\d{4}-\d{5}$/;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lid = url.searchParams.get("lid");

  try {
    // A waterbody chosen by name has no point yet, so resolve one before the fan-out.
    if (lid) {
      if (!lidPattern.test(lid)) {
        return Response.json({ error: "A valid waterbody id is required." }, { status: 400 });
      }
      const waterbody = await fetchWaterbodyByLid(lid);
      if (!waterbody?.coordinates) {
        return Response.json({ error: "That waterbody has no mapped location." }, { status: 404 });
      }
      const detail = await fetchSpotDetail(
        waterbody.officialName,
        waterbody.coordinates.latitude,
        waterbody.coordinates.longitude,
      );
      return Response.json(detail, {
        headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
      });
    }

    const parsed = pointSchema.safeParse({
      name: url.searchParams.get("name") ?? undefined,
      lat: url.searchParams.get("lat"),
      lon: url.searchParams.get("lon"),
    });
    if (!parsed.success) {
      return Response.json({ error: "Valid Ontario coordinates are required." }, { status: 400 });
    }

    const detail = await fetchSpotDetail(parsed.data.name, parsed.data.lat, parsed.data.lon);
    return Response.json(detail, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
    });
  } catch (error) {
    console.error("Spot detail failed", error);
    return Response.json({ error: "Spot details are temporarily unavailable." }, { status: 503 });
  }
}
