import { z } from "zod";
import { searchSpots } from "@/lib/spots/search";

const querySchema = z.object({ q: z.string().trim().min(3).max(100) });

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({ q: url.searchParams.get("q") });
  if (!parsed.success) {
    return Response.json({ error: "Type at least 3 characters." }, { status: 400 });
  }

  try {
    const suggestions = await searchSpots(parsed.data.q);
    return Response.json(
      { suggestions },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
    );
  } catch (error) {
    console.error("Spot search failed", error);
    return Response.json({ error: "Search is temporarily unavailable." }, { status: 503 });
  }
}
