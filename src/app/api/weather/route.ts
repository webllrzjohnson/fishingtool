import { z } from "zod";
import { fetchWeather } from "@/lib/sources/weather";

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
    return Response.json({ error: "Valid Ontario latitude and longitude are required." }, { status: 400 });
  }

  try {
    const forecast = await fetchWeather(parsed.data.lat, parsed.data.lon);
    return Response.json(forecast, {
      headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" },
    });
  } catch (error) {
    console.error("Weather lookup failed", error);
    return Response.json(
      { error: "Weather is temporarily unavailable. Check Environment Canada before leaving." },
      { status: 503 },
    );
  }
}
