import { z } from "zod";
import { fetchRoadDriveMinutes } from "@/lib/spots/drive-times";
import { estimateDriveMinutes } from "@/lib/spots/suggest";
import { distanceBetweenKm } from "@/lib/access-points";

const querySchema = z.object({
  lat: z.coerce.number().min(41).max(57),
  lon: z.coerce.number().min(-96).max(-74),
  dlat: z.coerce.number().min(41).max(57),
  dlon: z.coerce.number().min(-96).max(-74),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    lat: url.searchParams.get("lat"),
    lon: url.searchParams.get("lon"),
    dlat: url.searchParams.get("dlat"),
    dlon: url.searchParams.get("dlon"),
  });
  if (!parsed.success) {
    return Response.json({ error: "Invalid drive parameters." }, { status: 400 });
  }

  const origin = { latitude: parsed.data.lat, longitude: parsed.data.lon };
  const destination = { latitude: parsed.data.dlat, longitude: parsed.data.dlon };
  try {
    const [minutes] = await fetchRoadDriveMinutes(origin, [destination]);
    if (minutes != null) {
      return Response.json(
        { minutes, source: "road" },
        { headers: { "Cache-Control": "private, max-age=300" } },
      );
    }
  } catch {
    // Fall through to the straight-line estimate.
  }

  const estimate = estimateDriveMinutes(distanceBetweenKm(origin, destination));
  return Response.json(
    { minutes: estimate, source: "estimate" },
    { headers: { "Cache-Control": "private, max-age=60" } },
  );
}
