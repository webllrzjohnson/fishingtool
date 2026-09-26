import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { waterbodyExceptions } from "../src/data/curated/exceptions";
import { commonSpecies } from "../src/data/curated/species";
import { fishingLocations } from "../src/lib/fishing-locations";
import { rulesForFmz } from "../src/lib/fmz-rules";
import { waterbodyExceptionSchema } from "../src/lib/schemas";
import { validateWaterbodyLid } from "../src/lib/sources/ontario-waterbodies";
import type { WaterbodySnapshotEntry } from "../src/lib/types";

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

if (fishingLocations.length < 30) {
  fail(`Expected at least 30 curated locations, found ${fishingLocations.length}.`);
}

for (const location of fishingLocations) {
  if (!location.coordinates) fail(`${location.id} is missing coordinates.`);
  if (!location.accessModes?.length) fail(`${location.id} is missing access modes.`);
  if (!location.sources?.length) fail(`${location.id} is missing sources.`);
  if (!location.expectedSpecies.length) fail(`${location.id} is missing species.`);
  if (!rulesForFmz(location.fmz).length) {
    fail(`${location.id} has no structured or fallback rule table for ${location.fmz}.`);
  }
}

const locationById = new Map(fishingLocations.map((location) => [location.id, location]));
const exceptionIds = new Set<string>();
for (const exception of waterbodyExceptions) {
  const parsed = waterbodyExceptionSchema.safeParse(exception);
  if (!parsed.success) {
    fail(`Invalid exception ${exception.id}: ${parsed.error.issues[0]?.message ?? "schema error"}`);
  }
  if (exceptionIds.has(exception.id)) fail(`Duplicate exception id: ${exception.id}.`);
  exceptionIds.add(exception.id);

  const location = locationById.get(exception.locationId!);
  if (!location) fail(`Exception ${exception.id} references missing location ${exception.locationId}.`);
  if (location.fmz !== exception.fmz) {
    fail(`Exception ${exception.id} FMZ ${exception.fmz} does not match ${location.id} (${location.fmz}).`);
  }
  if (exception.source.kind !== "official") {
    fail(`Exception ${exception.id} must cite an official source.`);
  }
}

if (commonSpecies.length < 12) {
  fail(`Expected at least 12 species profiles, found ${commonSpecies.length}.`);
}

const snapshotPath = join(process.cwd(), "src/data/generated/ontario-waterbodies.json");
if (!existsSync(snapshotPath)) {
  fail(`Missing waterbody snapshot at ${snapshotPath}. Run npm run data:snapshot:waterbodies first.`);
}
const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8")) as Record<string, WaterbodySnapshotEntry>;
const missingSnapshots = fishingLocations
  .filter((location) => location.coordinates)
  .filter((location) => !snapshot[location.id]);
if (missingSnapshots.length) {
  fail(`Missing waterbody snapshots for: ${missingSnapshots.map((location) => location.id).join(", ")}`);
}
for (const [locationId, entry] of Object.entries(snapshot)) {
  if (!validateWaterbodyLid(entry.waterbody.waterbodyLid)) {
    fail(`Invalid WATERBODY_LID for ${locationId}: ${entry.waterbody.waterbodyLid}`);
  }
  if (!entry.waterbody.fmz.startsWith("fmz-")) {
    fail(`Invalid FMZ for ${locationId}: ${entry.waterbody.fmz}`);
  }
}

console.log(
  `Validated ${fishingLocations.length} locations, ${commonSpecies.length} species, ${waterbodyExceptions.length} linked exceptions, and ${Object.keys(snapshot).length} waterbody snapshots.`,
);
console.log("Official GIS endpoints used by the app:");
console.log("- FMZ polygons: LIO_Open07 MapServer layer 14");
console.log("- Access points: LIO_Open07 MapServer layer 15");
console.log("- ARA water polygons: LIO_Open07 MapServer layer 2");
console.log("- ARA water lines: LIO_Open07 MapServer layer 1");
console.log("- Weather: https://api.open-meteo.com/v1/forecast");
console.log("Download exceptions from https://data.ontario.ca/dataset/recreational-fishing-regulations-data");
