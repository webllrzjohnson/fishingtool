import type { WaterbodyException } from "@/lib/types";
import { regulationsSource } from "@/lib/sources";

export const waterbodyExceptions: WaterbodyException[] = [
  {
    id: "humber-boundary",
    locationId: "humber-bay",
    waterbody: "Humber River mouth / Humber Bay",
    fmz: "fmz-20",
    summary: "Lake/bay water is generally FMZ 20; the river is FMZ 16 with tributary exceptions and sanctuary dates.",
    effectiveDate: "2026-01-01",
    source: regulationsSource,
  },
  {
    id: "rouge-boundary",
    locationId: "rouge-marsh",
    waterbody: "Rouge River Marsh",
    fmz: "fmz-16",
    summary: "FMZ 16/20 boundary water. Access and construction closures can apply; confirm the exact fishing position.",
    effectiveDate: "2026-01-01",
    source: regulationsSource,
  },
  {
    id: "lake-simcoe",
    locationId: "lake-simcoe",
    waterbody: "Lake Simcoe",
    fmz: "fmz-16",
    summary: "Lake Simcoe has additional species, sanctuary, and gear exceptions beyond the FMZ 16 zone-wide table.",
    effectiveDate: "2026-01-01",
    source: regulationsSource,
  },
  {
    id: "lake-nipissing",
    locationId: "lake-nipissing",
    waterbody: "Lake Nipissing",
    fmz: "fmz-11",
    summary: "Lake Nipissing walleye and other species are managed with additional limits beyond generic FMZ 11 rules.",
    effectiveDate: "2026-01-01",
    source: regulationsSource,
  },
  {
    id: "nipigon",
    locationId: "nipigon-river",
    waterbody: "Nipigon River and Lake Nipigon",
    fmz: "fmz-6",
    summary: "Brook trout and other species have significant waterbody-specific exceptions.",
    effectiveDate: "2026-01-01",
    source: regulationsSource,
  },
  {
    id: "quetico-bait",
    locationId: "quetico-park",
    waterbody: "Quetico Provincial Park",
    fmz: "fmz-5",
    summary: "Park rules prohibit live baitfish and add tackle restrictions on top of FMZ 5.",
    effectiveDate: "2026-01-01",
    source: regulationsSource,
  },
  {
    id: "ottawa-boundary",
    locationId: "ottawa-river",
    waterbody: "Ottawa River",
    fmz: "fmz-12",
    summary: "Ontario–Quebec boundary water. Confirm the exact reach and which province’s rules apply.",
    effectiveDate: "2026-01-01",
    source: regulationsSource,
  },
];

export function exceptionsForLocation(locationId: string) {
  return waterbodyExceptions.filter((item) => item.locationId === locationId);
}
