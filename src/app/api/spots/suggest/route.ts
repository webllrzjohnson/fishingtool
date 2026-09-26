import { z } from "zod";
import { fetchRoadDriveMinutes } from "@/lib/spots/drive-times";
import { suggestNearbySpots, type SuggestSpot } from "@/lib/spots/suggest";

const querySchema = z.object({
  lat: z.coerce.number().min(41).max(57),
  lon: z.coerce.number().min(-96).max(-74),
  mode: z.enum(["distance", "drive"]).default("distance"),
  range: z.coerce.number().positive().max(500),
  limit: z.coerce.number().int().min(1).max(25).default(12),
  species: z.string().trim().max(40).optional(),
  shore: z
    .enum(["0", "1", "true", "false"])
    .optional()
    .transform((value) => value === "1" || value === "true"),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    lat: url.searchParams.get("lat"),
    lon: url.searchParams.get("lon"),
    mode: url.searchParams.get("mode") ?? "distance",
    range: url.searchParams.get("range"),
    limit: url.searchParams.get("limit") ?? "12",
    species: url.searchParams.get("species") || undefined,
    shore: url.searchParams.get("shore") ?? "1",
  });

  if (!parsed.success) {
    return Response.json({ error: "Invalid suggest parameters." }, { status: 400 });
  }

  try {
    const origin = { latitude: parsed.data.lat, longitude: parsed.data.lon };
    let spots = await suggestNearbySpots(origin, {
      mode: parsed.data.mode,
      range: parsed.data.range,
      limit: parsed.data.limit,
      species: parsed.data.species,
      shoreOnly: parsed.data.shore ?? true,
    });
    let driveTimes: "road" | "estimate" = "estimate";

    if (parsed.data.mode === "drive" && spots.length > 0) {
      const refined = await applyRoadDriveTimes(origin, spots, parsed.data.range);
      spots = refined.spots;
      driveTimes = refined.driveTimes;
    }

    return Response.json(
      { spots, driveTimes },
      { headers: { "Cache-Control": "private, max-age=60" } },
    );
  } catch (error) {
    console.error("Spot suggest failed", error);
    return Response.json({ error: "Suggestions are temporarily unavailable." }, { status: 503 });
  }
}

async function applyRoadDriveTimes(
  origin: { latitude: number; longitude: number },
  spots: SuggestSpot[],
  rangeMinutes: number,
): Promise<{ spots: SuggestSpot[]; driveTimes: "road" | "estimate" }> {
  try {
    const minutes = await fetchRoadDriveMinutes(origin, spots);
    const refined: SuggestSpot[] = [];
    spots.forEach((spot, index) => {
      const roadMinutes = minutes[index];
      if (roadMinutes == null) {
        refined.push({ ...spot, driveSource: "estimate" });
        return;
      }
      if (roadMinutes > rangeMinutes) return;
      refined.push({ ...spot, driveMinutesEstimate: roadMinutes, driveSource: "road" });
    });
    const anyRoad = refined.some((spot) => spot.driveSource === "road");
    return {
      spots: refined,
      driveTimes: anyRoad ? "road" : "estimate",
    };
  } catch {
    return {
      spots: spots.map((spot) => ({ ...spot, driveSource: "estimate" as const })),
      driveTimes: "estimate",
    };
  }
}
