import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { matchSpecies } from "../src/data/curated/species";
import { fishingLocations } from "../src/lib/fishing-locations";
import { fetchWaterbodyForPoint, searchWaterbodiesByName } from "../src/lib/sources/ontario-waterbodies";
import { gameSpeciesWithProfile } from "../src/lib/waterbodies/species-map";
import type { WaterbodySnapshotEntry } from "../src/lib/types";

const OUTPUT = join(process.cwd(), "src/data/generated/ontario-waterbodies.json");

async function fetchWithRetry(latitude: number, longitude: number, attempts = 3) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetchWaterbodyForPoint(latitude, longitude);
    } catch (error) {
      lastError = error;
      console.warn(`Lookup attempt ${attempt} failed: ${error instanceof Error ? error.message : error}`);
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
  throw lastError;
}

async function main() {
  const entries: Record<string, WaterbodySnapshotEntry> = {};
  const fetchedAt = new Date().toISOString().slice(0, 10);

  for (const location of fishingLocations) {
    if (!location.coordinates) {
      console.warn(`Skipping ${location.id}: missing coordinates`);
      continue;
    }
    let waterbody = await fetchWithRetry(
      location.coordinates.latitude,
      location.coordinates.longitude,
    );
    if (!waterbody) {
      const searchName = location.name.replace(/ Conservation Area.*/i, "").trim();
      const search = await searchWaterbodiesByName(searchName, {
        fmz: Number(location.fmz.replace("fmz-", "")),
      });
      waterbody = search.waterbodies[0] ?? null;
    }
    if (!waterbody) {
      console.warn(`No ARA match for ${location.id}`);
      continue;
    }

    const curatedSpeciesIds = new Set(
      location.expectedSpecies
        .map((label) => matchSpecies(label)?.id)
        .filter(Boolean) as string[],
    );
    const araProfileSpecies = gameSpeciesWithProfile(waterbody.species).map((entry) => entry.catalogSpeciesId!);
    const speciesNotInCurated = [...new Set(araProfileSpecies.filter((id) => !curatedSpeciesIds.has(id)))];

    entries[location.id] = {
      locationId: location.id,
      fetchedAt,
      waterbody,
      curatedFmzMismatch: waterbody.fmz !== location.fmz,
      speciesNotInCurated,
    };
    console.log(`Matched ${location.id} -> ${waterbody.officialName} (${waterbody.waterbodyLid})`);
    mkdirSync(dirname(OUTPUT), { recursive: true });
    writeFileSync(OUTPUT, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
  console.log(`Wrote ${Object.keys(entries).length} waterbody snapshots to ${OUTPUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
