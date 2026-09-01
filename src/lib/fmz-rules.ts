import type { FmzId, SeasonWindow, SpeciesRule, WeekdayAnchor } from "./types";
import { RULE_YEAR, fmzRegulationUrl } from "./sources";

const firstSatMay: WeekdayAnchor = { nth: 1, weekday: 6, month: 5 };
const secondSatMay: WeekdayAnchor = { nth: 2, weekday: 6, month: 5 };
const thirdSatMay: WeekdayAnchor = { nth: 3, weekday: 6, month: 5 };
const fridayBeforeThirdSatMay: WeekdayAnchor = { nth: 3, weekday: 6, month: 5, offsetDays: -1 };
const thirdSunMar: WeekdayAnchor = { nth: 3, weekday: 0, month: 3 };
const firstSatJun: WeekdayAnchor = { nth: 1, weekday: 6, month: 6 };
const thirdSatJun: WeekdayAnchor = { nth: 3, weekday: 6, month: 6 };
const fridayBeforeThirdSatJun: WeekdayAnchor = { nth: 3, weekday: 6, month: 6, offsetDays: -1 };
const fourthSatJun: WeekdayAnchor = { nth: 4, weekday: 6, month: 6 };
const firstSatJul: WeekdayAnchor = { nth: 1, weekday: 6, month: 7 };
const fourthSatApr: WeekdayAnchor = { nth: 4, weekday: 6, month: 4 };
const fridayBeforeFourthSatApr: WeekdayAnchor = { nth: 4, weekday: 6, month: 4, offsetDays: -1 };
const labourDay: WeekdayAnchor = { nth: 1, weekday: 1, month: 9 };

const YEAR = RULE_YEAR;
const WALLEYE = "walleye and sauger combined";
const BASS = "largemouth and smallmouth bass combined";

function yearRound(
  speciesId: string,
  species: string,
  sportLimit: string,
  conservationLimit: string,
  extra: Partial<SpeciesRule> = {},
): SpeciesRule {
  return {
    speciesId,
    species,
    season: "Open all year",
    sportLimit,
    conservationLimit,
    openWindows: [{ start: "01-01", end: "12-31" }],
    sourceYear: YEAR,
    ...extra,
  };
}

function closed(speciesId: string, species: string): SpeciesRule {
  return {
    speciesId,
    species,
    season: "Closed all year",
    sportLimit: "S-0",
    conservationLimit: "C-0",
    sourceYear: YEAR,
  };
}

function seasonal(
  speciesId: string,
  species: string,
  season: string,
  sportLimit: string,
  conservationLimit: string,
  openWindows: SeasonWindow[],
  extra: Partial<SpeciesRule> = {},
): SpeciesRule {
  return {
    speciesId,
    species,
    season,
    sportLimit,
    conservationLimit,
    openWindows,
    sourceYear: YEAR,
    ...extra,
  };
}

export const fmzLabels: Record<FmzId, string> = {
  "fmz-1": "FMZ 1 — Far North",
  "fmz-2": "FMZ 2 — Far North",
  "fmz-3": "FMZ 3 — Northeast far north",
  "fmz-4": "FMZ 4 — Northwest / Lac Seul area",
  "fmz-5": "FMZ 5 — Northwest / Lake of the Woods area",
  "fmz-6": "FMZ 6 — Nipigon country",
  "fmz-7": "FMZ 7 — Northeast",
  "fmz-8": "FMZ 8 — Northeast / James Bay lowlands",
  "fmz-9": "FMZ 9 — Lake Superior",
  "fmz-10": "FMZ 10 — Northeast / French River area",
  "fmz-11": "FMZ 11 — Nipissing / Temagami",
  "fmz-12": "FMZ 12 — Ottawa River",
  "fmz-13": "FMZ 13 — Lake Huron main basin",
  "fmz-14": "FMZ 14 — Georgian Bay / Lake Huron",
  "fmz-15": "FMZ 15 — Algonquin / Muskoka",
  "fmz-16": "FMZ 16 — Southern inland waters and GTA tributaries",
  "fmz-17": "FMZ 17 — Kawartha / Rice Lake",
  "fmz-18": "FMZ 18 — Rideau",
  "fmz-19": "FMZ 19 — Lake Erie / St. Clair connecting waters",
  "fmz-20": "FMZ 20 — Lake Ontario / Toronto waterfront",
};

const fmz20: SpeciesRule[] = [
  seasonal("northern-pike", "Northern pike", "Jan 1–Mar 31 and first Saturday in May–Dec 31", "S-6", "C-2", [
    { start: "01-01", end: "03-31" },
    { start: "05-01", end: "12-31", startAnchor: firstSatMay },
  ]),
  seasonal("largemouth-bass", "Largemouth bass", "Catch-and-release Jan 1–May 10; regular third Saturday in June–Dec 31", "S-6", "C-2", [
    { start: "01-01", end: "05-10", mode: "catch-and-release" },
    { start: "06-01", end: "12-31", startAnchor: thirdSatJun },
  ], { combinedGroup: BASS }),
  seasonal("smallmouth-bass", "Smallmouth bass", "Catch-and-release Jan 1–May 10; regular first Saturday in July–Dec 31", "S-6", "C-2", [
    { start: "01-01", end: "05-10", mode: "catch-and-release" },
    { start: "07-01", end: "12-31", startAnchor: firstSatJul },
  ], { combinedGroup: BASS }),
  yearRound("yellow-perch", "Yellow perch", "S-50", "C-25"),
  yearRound("crappie", "Crappie", "S-30", "C-10"),
  yearRound("channel-catfish", "Channel catfish", "S-12", "C-6"),
  yearRound("rainbow-trout", "Rainbow trout", "S-2", "C-1", { combinedGroup: "all trout and salmon combined" }),
  yearRound("brown-trout", "Brown trout", "S-5", "C-2", { combinedGroup: "all trout and salmon combined" }),
  yearRound("pacific-salmon", "Pacific salmon", "S-5", "C-2", { combinedGroup: "all trout and salmon combined" }),
  yearRound("atlantic-salmon", "Atlantic salmon", "S-1", "C-0", { sizeNote: "Must be greater than 63 cm" }),
  seasonal("walleye", "Walleye/sauger", "Jan 1–Mar 1 and first Saturday in May–Dec 31", "S-4", "C-2", [
    { start: "01-01", end: "03-01" },
    { start: "05-01", end: "12-31", startAnchor: firstSatMay },
  ], { sizeNote: "Not more than 1 greater than 63 cm", combinedGroup: WALLEYE }),
  closed("lake-sturgeon", "Lake sturgeon"),
];

const fmz16: SpeciesRule[] = [
  seasonal("northern-pike", "Northern pike", "Jan 1–Mar 31 and second Saturday in May–Dec 31", "S-6", "C-2", [
    { start: "01-01", end: "03-31" },
    { start: "05-01", end: "12-31", startAnchor: secondSatMay },
  ]),
  seasonal("largemouth-bass", "Largemouth/smallmouth bass (combined)", "Fourth Saturday in June–Nov 30", "S-6", "C-2", [
    { start: "06-01", end: "11-30", startAnchor: fourthSatJun },
  ], { combinedGroup: BASS }),
  yearRound("yellow-perch", "Yellow perch", "S-50", "C-25"),
  yearRound("crappie", "Crappie", "S-30", "C-10"),
  yearRound("channel-catfish", "Channel catfish", "S-12", "C-6"),
  seasonal("rainbow-trout", "Rainbow trout", "Fourth Saturday in April–Sept 30", "S-2", "C-1", [
    { start: "04-01", end: "09-30", startAnchor: fourthSatApr },
  ], { combinedGroup: "all trout and salmon combined" }),
  seasonal("brown-trout", "Brown trout", "Fourth Saturday in April–Sept 30", "S-5", "C-2", [
    { start: "04-01", end: "09-30", startAnchor: fourthSatApr },
  ], { combinedGroup: "all trout and salmon combined" }),
  seasonal("pacific-salmon", "Pacific salmon", "Fourth Saturday in April–Sept 30", "S-5", "C-2", [
    { start: "04-01", end: "09-30", startAnchor: fourthSatApr },
  ], { combinedGroup: "all trout and salmon combined" }),
  seasonal("atlantic-salmon", "Atlantic salmon", "Fourth Saturday in April–Sept 30", "S-0", "C-0", [
    { start: "04-01", end: "09-30", startAnchor: fourthSatApr, mode: "catch-and-release" },
  ]),
  seasonal("walleye", "Walleye/sauger", "Jan 1–Mar 15 and second Saturday in May–Dec 31", "S-4", "C-2", [
    { start: "01-01", end: "03-15" },
    { start: "05-01", end: "12-31", startAnchor: secondSatMay },
  ], { sizeNote: "Not more than 1 greater than 46 cm", combinedGroup: WALLEYE }),
  closed("lake-sturgeon", "Lake sturgeon"),
];

/** Zone-wide 2026 summary data from Ontario.ca. Always verify waterbody exceptions. */
export const fmzSpeciesRules: Record<FmzId, SpeciesRule[]> = {
  "fmz-20": fmz20,
  "fmz-16": fmz16,
  "fmz-1": [
    seasonal("brook-trout", "Brook trout", "Jan 1–Sept 30", "S-5", "C-2", [{ start: "01-01", end: "09-30" }], {
      sizeNote: "Not more than 1 greater than 40 cm",
    }),
    seasonal("lake-sturgeon", "Lake sturgeon", "Jan 1–Apr 30 and Jul 1–Dec 31, catch-and-release", "S-0", "C-0", [
      { start: "01-01", end: "04-30", mode: "catch-and-release" },
      { start: "07-01", end: "12-31", mode: "catch-and-release" },
    ]),
    yearRound("lake-trout", "Lake trout", "S-3", "C-1"),
    yearRound("lake-whitefish", "Lake whitefish", "S-12", "C-6"),
    yearRound("northern-pike", "Northern pike", "S-6", "C-2", {
      sizeNote: "S: not more than 2 > 61 cm, of which not more than 1 > 86 cm",
    }),
    yearRound("walleye", "Walleye/sauger", "S-4", "C-2", {
      sizeNote: "Not more than 1 greater than 46 cm",
      combinedGroup: WALLEYE,
    }),
    yearRound("yellow-perch", "Yellow perch", "S-50", "C-25"),
  ],
  "fmz-2": [
    seasonal("brook-trout", "Brook trout", "Jan 1–Labour Day", "S-5", "C-2", [
      { start: "01-01", end: "09-01", endAnchor: labourDay },
    ], { sizeNote: "Not more than 1 greater than 30 cm" }),
    yearRound("brown-trout", "Brown trout", "S-5", "C-2"),
    seasonal("lake-sturgeon", "Lake sturgeon", "Jan 1–Apr 30 and Jul 1–Dec 31, catch-and-release", "S-0", "C-0", [
      { start: "01-01", end: "04-30", mode: "catch-and-release" },
      { start: "07-01", end: "12-31", mode: "catch-and-release" },
    ]),
    seasonal("lake-trout", "Lake trout", "Jan 1–Sept 30", "S-2", "C-1", [{ start: "01-01", end: "09-30" }], {
      sizeNote: "Not more than 1 greater than 56 cm from Sept 1–30",
    }),
    yearRound("lake-whitefish", "Lake whitefish", "S-12", "C-6"),
    yearRound("largemouth-bass", "Largemouth/smallmouth bass (combined)", "S-4", "C-2", {
      sizeNote: "Must be less than 35 cm Jan 1–Jun 30 and Dec 1–31; no size Jul 1–Nov 30. Sport limit is S-2 in the slot period.",
      combinedGroup: BASS,
    }),
    seasonal("muskellunge", "Muskellunge", "Third Saturday in June–Dec 15", "S-1", "C-0", [
      { start: "06-01", end: "12-15", startAnchor: thirdSatJun },
    ], { sizeNote: "Must be greater than 91 cm" }),
    yearRound("northern-pike", "Northern pike", "S-4", "C-2", {
      sizeNote: "None between 70–90 cm; not more than 1 greater than 90 cm",
    }),
    yearRound("rainbow-trout", "Rainbow trout", "S-5", "C-2"),
    seasonal("walleye", "Walleye/sauger", "Jan 1–Apr 14 and third Saturday in May–Dec 31", "S-4", "C-2", [
      { start: "01-01", end: "04-14" },
      { start: "05-01", end: "12-31", startAnchor: thirdSatMay },
    ], { sizeNote: "Not more than 1 greater than 46 cm", combinedGroup: WALLEYE }),
    yearRound("yellow-perch", "Yellow perch", "S-50", "C-25"),
  ],
  "fmz-3": [
    seasonal("brook-trout", "Brook trout", "Jan 1–Sept 15", "S-5", "C-2", [{ start: "01-01", end: "09-15" }]),
    seasonal("lake-sturgeon", "Lake sturgeon", "Jan 1–Apr 15 and Jul 1–Dec 31, catch-and-release", "S-0", "C-0", [
      { start: "01-01", end: "04-15", mode: "catch-and-release" },
      { start: "07-01", end: "12-31", mode: "catch-and-release" },
    ]),
    seasonal("lake-trout", "Lake trout", "Jan 1–Sept 30", "S-3", "C-1", [{ start: "01-01", end: "09-30" }]),
    yearRound("lake-whitefish", "Lake whitefish", "S-12", "C-6"),
    yearRound("largemouth-bass", "Largemouth/smallmouth bass (combined)", "S-6", "C-2", { combinedGroup: BASS }),
    yearRound("northern-pike", "Northern pike", "S-6", "C-2", {
      sizeNote: "S: not more than 2 > 61 cm, of which not more than 1 > 86 cm",
    }),
    seasonal("walleye", "Walleye/sauger", "Jan 1–Apr 14 and third Saturday in May–Dec 31", "S-4", "C-2", [
      { start: "01-01", end: "04-14" },
      { start: "05-01", end: "12-31", startAnchor: thirdSatMay },
    ], { sizeNote: "Not more than 1 greater than 46 cm", combinedGroup: WALLEYE }),
    yearRound("yellow-perch", "Yellow perch", "S-50", "C-25"),
  ],
  "fmz-4": [
    seasonal("brook-trout", "Brook trout", "Jan 1–Labour Day", "S-5", "C-2", [
      { start: "01-01", end: "09-01", endAnchor: labourDay },
    ], { sizeNote: "Not more than 1 greater than 30 cm" }),
    yearRound("crappie", "Crappie", "S-15", "C-10"),
    closed("lake-sturgeon", "Lake sturgeon"),
    seasonal("lake-trout", "Lake trout", "Jan 1–Sept 30", "S-2", "C-1", [{ start: "01-01", end: "09-30" }], {
      sizeNote: "Not more than 1 greater than 56 cm",
    }),
    yearRound("lake-whitefish", "Lake whitefish", "S-12", "C-6"),
    yearRound("largemouth-bass", "Largemouth/smallmouth bass (combined)", "S-4", "C-2", {
      sizeNote: "Must be less than 35 cm Jan 1–Jun 30 and Dec 1–31; no size Jul 1–Nov 30",
      combinedGroup: BASS,
    }),
    seasonal("muskellunge", "Muskellunge", "Third Saturday in June–Dec 15", "S-1", "C-0", [
      { start: "06-01", end: "12-15", startAnchor: thirdSatJun },
    ], { sizeNote: "Must be greater than 102 cm" }),
    yearRound("northern-pike", "Northern pike", "S-4", "C-2", {
      sizeNote: "None between 70–90 cm; not more than 1 greater than 90 cm",
    }),
    yearRound("rainbow-trout", "Rainbow trout", "S-5", "C-2"),
    seasonal("walleye", "Walleye/sauger", "Jan 1–Apr 14 and third Saturday in May–Dec 31", "S-4", "C-2", [
      { start: "01-01", end: "04-14" },
      { start: "05-01", end: "12-31", startAnchor: thirdSatMay },
    ], { sizeNote: "Not more than 1 greater than 46 cm", combinedGroup: WALLEYE }),
    yearRound("yellow-perch", "Yellow perch", "S-50", "C-25"),
  ],
  "fmz-5": [
    yearRound("brook-trout", "Brook trout", "S-5", "C-2"),
    yearRound("brown-trout", "Brown trout", "S-5", "C-2"),
    yearRound("crappie", "Crappie", "S-10", "C-5"),
    closed("lake-sturgeon", "Lake sturgeon"),
    seasonal("lake-trout", "Lake trout", "Jan 1–Sept 30", "S-2", "C-1", [{ start: "01-01", end: "09-30" }], {
      sizeNote: "Not more than 1 greater than 56 cm from Sept 1–30",
    }),
    yearRound("lake-whitefish", "Lake whitefish", "S-12", "C-6"),
    yearRound("largemouth-bass", "Largemouth/smallmouth bass (combined)", "S-4", "C-2", {
      sizeNote: "Must be less than 35 cm from Jan 1–Jun 30",
      combinedGroup: BASS,
    }),
    seasonal("muskellunge", "Muskellunge", "Third Saturday in June–Dec 15", "S-1", "C-0", [
      { start: "06-01", end: "12-15", startAnchor: thirdSatJun },
    ], { sizeNote: "Must be greater than 102 cm" }),
    yearRound("northern-pike", "Northern pike", "S-4", "C-2", { sizeNote: "None greater than 75 cm" }),
    yearRound("rainbow-trout", "Rainbow trout", "S-5", "C-2"),
    seasonal("walleye", "Walleye/sauger", "Jan 1–Apr 14 and third Saturday in May–Dec 31", "S-4", "C-2", [
      { start: "01-01", end: "04-14" },
      { start: "05-01", end: "12-31", startAnchor: thirdSatMay },
    ], { sizeNote: "Not more than 1 greater than 46 cm", combinedGroup: WALLEYE }),
    yearRound("yellow-perch", "Yellow perch", "S-50", "C-25"),
  ],
  "fmz-6": [
    yearRound("atlantic-salmon", "Atlantic salmon", "S-1", "C-0"),
    seasonal("brook-trout", "Brook trout", "Fourth Saturday in April–Labour Day", "S-5", "C-2", [
      { start: "04-01", end: "09-01", startAnchor: fourthSatApr, endAnchor: labourDay },
    ], { sizeNote: "Not more than 1 greater than 30 cm" }),
    yearRound("brown-trout", "Brown trout", "S-5", "C-2"),
    yearRound("channel-catfish", "Channel catfish", "S-12", "C-6"),
    yearRound("crappie", "Crappie", "S-15", "C-10"),
    closed("lake-sturgeon", "Lake sturgeon"),
    seasonal("lake-trout", "Lake trout", "Jan 1–Sept 30", "S-2", "C-1", [{ start: "01-01", end: "09-30" }], {
      sizeNote: "Not more than 1 greater than 56 cm from Sept 1–30",
    }),
    yearRound("lake-whitefish", "Lake whitefish", "S-12", "C-6"),
    yearRound("largemouth-bass", "Largemouth/smallmouth bass (combined)", "S-4", "C-2", { combinedGroup: BASS }),
    seasonal("muskellunge", "Muskellunge", "Third Saturday in June–Dec 15", "S-1", "C-0", [
      { start: "06-01", end: "12-15", startAnchor: thirdSatJun },
    ], { sizeNote: "Must be greater than 91 cm" }),
    yearRound("northern-pike", "Northern pike", "S-4", "C-2", {
      sizeNote: "Not more than 1 greater than or equal to 70 cm",
    }),
    yearRound("pacific-salmon", "Pacific salmon", "S-5", "C-2"),
    yearRound("rainbow-trout", "Rainbow trout", "S-1", "C-0"),
    seasonal("walleye", "Walleye/sauger", "Jan 1–Apr 14 and third Saturday in May–Dec 31", "S-4", "C-2", [
      { start: "01-01", end: "04-14" },
      { start: "05-01", end: "12-31", startAnchor: thirdSatMay },
    ], { sizeNote: "Not more than 1 greater than 46 cm", combinedGroup: WALLEYE }),
    yearRound("yellow-perch", "Yellow perch", "S-50", "C-25"),
  ],
  "fmz-7": [
    yearRound("atlantic-salmon", "Atlantic salmon", "S-1", "C-0"),
    seasonal("brook-trout", "Brook trout", "Jan 1–Labour Day", "S-5", "C-2", [
      { start: "01-01", end: "09-01", endAnchor: labourDay },
    ], { sizeNote: "S: not more than 2 > 30 cm, of which not more than 1 > 40 cm" }),
    yearRound("brown-trout", "Brown trout", "S-5", "C-2"),
    closed("lake-sturgeon", "Lake sturgeon"),
    seasonal("lake-trout", "Lake trout", "Jan 1–Sept 30", "S-2", "C-1", [{ start: "01-01", end: "09-30" }]),
    yearRound("lake-whitefish", "Lake whitefish", "S-25", "C-12"),
    yearRound("largemouth-bass", "Largemouth/smallmouth bass (combined)", "S-6", "C-2", { combinedGroup: BASS }),
    closed("muskellunge", "Muskellunge"),
    yearRound("northern-pike", "Northern pike", "S-6", "C-2", {
      sizeNote: "S: not more than 2 > 61 cm, of which not more than 1 > 86 cm",
    }),
    yearRound("pacific-salmon", "Pacific salmon", "S-5", "C-2"),
    yearRound("rainbow-trout", "Rainbow trout", "S-1", "C-0"),
    seasonal("walleye", "Walleye/sauger", "Jan 1–Apr 14 and third Saturday in May–Dec 31", "S-4", "C-2", [
      { start: "01-01", end: "04-14" },
      { start: "05-01", end: "12-31", startAnchor: thirdSatMay },
    ], { sizeNote: "Not more than 1 greater than 46 cm", combinedGroup: WALLEYE }),
    yearRound("yellow-perch", "Yellow perch", "S-50", "C-25"),
  ],
  "fmz-8": [
    seasonal("brook-trout", "Brook trout", "Jan 1–Sept 15", "S-5", "C-2", [{ start: "01-01", end: "09-15" }]),
    seasonal("lake-sturgeon", "Lake sturgeon", "Jan 1–Apr 30 and Jul 1–Dec 31, catch-and-release", "S-0", "C-0", [
      { start: "01-01", end: "04-30", mode: "catch-and-release" },
      { start: "07-01", end: "12-31", mode: "catch-and-release" },
    ]),
    seasonal("lake-trout", "Lake trout", "Feb 15–Mar 15 and third Saturday in May–Sept 30", "S-3", "C-1", [
      { start: "02-15", end: "03-15" },
      { start: "05-01", end: "09-30", startAnchor: thirdSatMay },
    ]),
    yearRound("lake-whitefish", "Lake whitefish", "S-25", "C-12"),
    yearRound("largemouth-bass", "Largemouth/smallmouth bass (combined)", "S-6", "C-2", { combinedGroup: BASS }),
    yearRound("northern-pike", "Northern pike", "S-6", "C-2", {
      sizeNote: "S: not more than 2 > 61 cm, of which not more than 1 > 86 cm",
    }),
    yearRound("rainbow-trout", "Rainbow trout", "S-5", "C-2"),
    seasonal("walleye", "Walleye/sauger", "Jan 1–Apr 14 and third Saturday in May–Dec 31", "S-4", "C-2", [
      { start: "01-01", end: "04-14" },
      { start: "05-01", end: "12-31", startAnchor: thirdSatMay },
    ], { sizeNote: "Not more than 1 greater than 46 cm", combinedGroup: WALLEYE }),
    yearRound("yellow-perch", "Yellow perch", "S-50", "C-25"),
  ],
  "fmz-9": [
    yearRound("atlantic-salmon", "Atlantic salmon", "S-1", "C-0"),
    seasonal("brook-trout", "Brook trout", "Fourth Saturday in April–Labour Day", "S-1", "C-0", [
      { start: "04-01", end: "09-01", startAnchor: fourthSatApr, endAnchor: labourDay },
    ], { sizeNote: "Must be greater than 56 cm" }),
    yearRound("brown-trout", "Brown trout", "S-5", "C-2"),
    yearRound("channel-catfish", "Channel catfish", "S-12", "C-6"),
    yearRound("crappie", "Crappie", "S-30", "C-10"),
    closed("lake-sturgeon", "Lake sturgeon"),
    seasonal("lake-trout", "Lake trout", "Jan 1–Sept 30", "S-3", "C-1", [{ start: "01-01", end: "09-30" }]),
    yearRound("lake-whitefish", "Lake whitefish", "S-12", "C-6"),
    yearRound("largemouth-bass", "Largemouth/smallmouth bass (combined)", "S-6", "C-2", { combinedGroup: BASS }),
    seasonal("muskellunge", "Muskellunge", "Third Saturday in June–Dec 15", "S-1", "C-0", [
      { start: "06-01", end: "12-15", startAnchor: thirdSatJun },
    ], { sizeNote: "Must be greater than 137 cm" }),
    yearRound("northern-pike", "Northern pike", "S-4", "C-2", {
      sizeNote: "None between 70–90 cm; not more than 1 greater than 90 cm",
    }),
    yearRound("pacific-salmon", "Pacific salmon", "S-5", "C-2"),
    yearRound("rainbow-trout", "Rainbow trout", "S-1", "C-0"),
    seasonal("walleye", "Walleye/sauger", "Jan 1–Apr 14 and third Saturday in May–Dec 31", "S-2", "C-1", [
      { start: "01-01", end: "04-14" },
      { start: "05-01", end: "12-31", startAnchor: thirdSatMay },
    ], { combinedGroup: WALLEYE }),
    yearRound("yellow-perch", "Yellow perch", "S-25", "C-12"),
  ],
  "fmz-10": [
    seasonal("atlantic-salmon", "Atlantic salmon", "Jan 1–Sept 30", "S-1", "C-0", [{ start: "01-01", end: "09-30" }]),
    seasonal("brook-trout", "Brook trout", "Jan 1–Sept 30", "S-5", "C-2", [{ start: "01-01", end: "09-30" }]),
    yearRound("brown-trout", "Brown trout", "S-5", "C-2"),
    yearRound("channel-catfish", "Channel catfish", "S-12", "C-6"),
    yearRound("crappie", "Crappie", "S-30", "C-10"),
    closed("lake-sturgeon", "Lake sturgeon"),
    seasonal("lake-trout", "Lake trout", "Jan 1–Labour Day", "S-2", "C-1", [
      { start: "01-01", end: "09-01", endAnchor: labourDay },
    ], { sizeNote: "Not more than 1 greater than 40 cm" }),
    yearRound("lake-whitefish", "Lake whitefish", "S-12", "C-6"),
    seasonal("largemouth-bass", "Largemouth/smallmouth bass (combined)", "Third Saturday in June–Nov 30", "S-6", "C-3", [
      { start: "06-01", end: "11-30", startAnchor: thirdSatJun },
    ], { combinedGroup: BASS }),
    seasonal("muskellunge", "Muskellunge", "Third Saturday in June–Dec 15", "S-1", "C-0", [
      { start: "06-01", end: "12-15", startAnchor: thirdSatJun },
    ], { sizeNote: "Must be greater than 122 cm" }),
    yearRound("northern-pike", "Northern pike", "S-6", "C-2", {
      sizeNote: "S: not more than 1 > 61 cm, none > 86 cm",
    }),
    yearRound("pacific-salmon", "Pacific salmon", "S-5", "C-2"),
    yearRound("rainbow-trout", "Rainbow trout", "S-2", "C-1"),
    seasonal("walleye", "Walleye/sauger", "Jan 1–third Sunday in March and third Saturday in May–Dec 31", "S-4", "C-2", [
      { start: "01-01", end: "03-01", endAnchor: thirdSunMar },
      { start: "05-01", end: "12-31", startAnchor: thirdSatMay },
    ], { sizeNote: "None greater than 46 cm", combinedGroup: WALLEYE }),
    yearRound("yellow-perch", "Yellow perch", "S-50", "C-25"),
  ],
  "fmz-11": [
    closed("atlantic-salmon", "Atlantic salmon"),
    seasonal("brook-trout", "Brook trout", "Feb 15–Sept 30", "S-5", "C-2", [{ start: "02-15", end: "09-30" }], {
      sizeNote: "S: not more than 1 greater than 31 cm; C: none greater than 31 cm",
    }),
    seasonal("brown-trout", "Brown trout", "Fourth Saturday in April–Sept 30", "S-5", "C-2", [
      { start: "04-01", end: "09-30", startAnchor: fourthSatApr },
    ]),
    yearRound("channel-catfish", "Channel catfish", "S-12", "C-6"),
    yearRound("crappie", "Crappie", "S-30", "C-10"),
    closed("lake-sturgeon", "Lake sturgeon"),
    seasonal("lake-trout", "Lake trout", "Feb 15–third Sunday in March and third Saturday in May–Labour Day", "S-2", "C-1", [
      { start: "02-15", end: "03-01", endAnchor: thirdSunMar },
      { start: "05-01", end: "09-01", startAnchor: thirdSatMay, endAnchor: labourDay },
    ], { sizeNote: "Not more than 1 greater than 40 cm" }),
    yearRound("lake-whitefish", "Lake whitefish", "S-12", "C-6"),
    seasonal("largemouth-bass", "Largemouth/smallmouth bass (combined)", "Jan 1–third Sunday in March and third Saturday in May–Dec 31", "S-6", "C-2", [
      { start: "01-01", end: "03-01", endAnchor: thirdSunMar },
      { start: "05-01", end: "12-31", startAnchor: thirdSatMay },
    ], { combinedGroup: BASS }),
    seasonal("muskellunge", "Muskellunge", "Third Saturday in June–Dec 15", "S-1", "C-0", [
      { start: "06-01", end: "12-15", startAnchor: thirdSatJun },
    ], { sizeNote: "Must be greater than 122 cm" }),
    seasonal("northern-pike", "Northern pike", "Jan 1–third Sunday in March and third Saturday in May–Dec 31", "S-6", "C-2", [
      { start: "01-01", end: "03-01", endAnchor: thirdSunMar },
      { start: "05-01", end: "12-31", startAnchor: thirdSatMay },
    ], { sizeNote: "S: not more than two > 61 cm, of which not more than 1 > 86 cm" }),
    yearRound("pacific-salmon", "Pacific salmon", "S-5", "C-2"),
    yearRound("rainbow-trout", "Rainbow trout", "S-5", "C-2"),
    seasonal("walleye", "Walleye/sauger", "Jan 1–third Sunday in March and third Saturday in May–Dec 31", "S-4", "C-2", [
      { start: "01-01", end: "03-01", endAnchor: thirdSunMar },
      { start: "05-01", end: "12-31", startAnchor: thirdSatMay },
    ], { sizeNote: "None between 43–60 cm; not more than 1 greater than 60 cm", combinedGroup: WALLEYE }),
    yearRound("yellow-perch", "Yellow perch", "S-50", "C-25"),
  ],
  "fmz-12": [
    seasonal("atlantic-salmon", "Atlantic salmon", "Friday before fourth Saturday in April–Sept 30", "S-1", "C-0", [
      { start: "04-01", end: "09-30", startAnchor: fridayBeforeFourthSatApr },
    ]),
    seasonal("brook-trout", "Brook trout", "Friday before fourth Saturday in April–Sept 30", "S-5", "C-2", [
      { start: "04-01", end: "09-30", startAnchor: fridayBeforeFourthSatApr },
    ]),
    seasonal("rainbow-trout", "Brown trout and rainbow trout", "Friday before fourth Saturday in April–Sept 30", "S-5", "C-2", [
      { start: "04-01", end: "09-30", startAnchor: fridayBeforeFourthSatApr },
    ]),
    yearRound("channel-catfish", "Channel catfish", "S-12", "C-6"),
    yearRound("crappie", "Crappie", "S-30", "C-10"),
    closed("lake-sturgeon", "Lake sturgeon"),
    seasonal("lake-trout", "Lake trout and splake", "Friday before fourth Saturday in April–Sept 30", "S-2", "C-1", [
      { start: "04-01", end: "09-30", startAnchor: fridayBeforeFourthSatApr },
    ], { sizeNote: "Must be greater than 45 cm" }),
    yearRound("lake-whitefish", "Lake whitefish", "S-12", "C-6"),
    seasonal("largemouth-bass", "Largemouth/smallmouth bass (combined)", "Friday before fourth Saturday in June–Nov 30", "S-6", "C-2", [
      { start: "06-01", end: "11-30", startAnchor: { nth: 4, weekday: 6, month: 6, offsetDays: -1 } },
    ], { combinedGroup: BASS }),
    seasonal("muskellunge", "Muskellunge", "Friday before third Saturday in June–Dec 15", "S-1", "C-0", [
      { start: "06-01", end: "12-15", startAnchor: fridayBeforeThirdSatJun },
    ], { sizeNote: "Must be greater than 137 cm" }),
    seasonal("northern-pike", "Northern pike", "Jan 1–Mar 31 and Friday before third Saturday in May–Dec 31", "S-6", "C-2", [
      { start: "01-01", end: "03-31" },
      { start: "05-01", end: "12-31", startAnchor: fridayBeforeThirdSatMay },
    ]),
    yearRound("sunfish", "Sunfish", "no limit", "no limit"),
    seasonal("walleye", "Walleye/sauger", "Jan 1–Mar 31 and Friday before third Saturday in May–Dec 31", "S-5", "C-2", [
      { start: "01-01", end: "03-31" },
      { start: "05-01", end: "12-31", startAnchor: fridayBeforeThirdSatMay },
    ], { sizeNote: "Must be less than 40 cm from March 1 to June 15", combinedGroup: WALLEYE }),
    yearRound("yellow-perch", "Yellow perch", "S-50", "C-25"),
  ],
  "fmz-13": [
    yearRound("atlantic-salmon", "Atlantic salmon", "S-1", "C-0"),
    yearRound("brown-trout", "Brown trout", "S-5", "C-2"),
    yearRound("channel-catfish", "Channel catfish", "S-12", "C-6"),
    yearRound("crappie", "Crappie", "S-30", "C-10"),
    closed("lake-sturgeon", "Lake sturgeon"),
    seasonal("lake-trout", "Lake trout", "Jan 1–Sept 30 and Dec 1–Dec 31", "S-2", "C-1", [
      { start: "01-01", end: "09-30" },
      { start: "12-01", end: "12-31" },
    ]),
    yearRound("lake-whitefish", "Lake whitefish", "S-12", "C-6"),
    seasonal("largemouth-bass", "Largemouth/smallmouth bass (combined)", "Fourth Saturday in June–Nov 30", "S-6", "C-2", [
      { start: "06-01", end: "11-30", startAnchor: fourthSatJun },
    ], { combinedGroup: BASS }),
    seasonal("muskellunge", "Muskellunge", "Third Saturday in June–Dec 15", "S-1", "C-0", [
      { start: "06-01", end: "12-15", startAnchor: thirdSatJun },
    ], { sizeNote: "Must be greater than 102 cm" }),
    yearRound("northern-pike", "Northern pike", "S-4", "C-2"),
    yearRound("pacific-salmon", "Pacific salmon", "S-5", "C-2"),
    yearRound("rainbow-trout", "Rainbow trout", "S-2", "C-1"),
    yearRound("walleye", "Walleye/sauger", "S-6", "C-2", { combinedGroup: WALLEYE }),
    yearRound("yellow-perch", "Yellow perch", "S-50", "C-25"),
  ],
  "fmz-14": [
    yearRound("atlantic-salmon", "Atlantic salmon", "S-1", "C-0"),
    yearRound("brown-trout", "Brown trout", "S-5", "C-2"),
    yearRound("channel-catfish", "Channel catfish", "S-12", "C-6"),
    yearRound("crappie", "Crappie", "S-30", "C-10"),
    closed("lake-sturgeon", "Lake sturgeon"),
    seasonal("lake-trout", "Lake trout", "Jan 1–Sept 30 and Dec 1–Dec 31", "S-2", "C-1", [
      { start: "01-01", end: "09-30" },
      { start: "12-01", end: "12-31" },
    ]),
    yearRound("lake-whitefish", "Lake whitefish", "S-12", "C-6"),
    seasonal("largemouth-bass", "Largemouth/smallmouth bass (combined)", "Fourth Saturday in June–Nov 30", "S-3", "C-1", [
      { start: "06-01", end: "11-30", startAnchor: fourthSatJun },
    ], { combinedGroup: BASS }),
    seasonal("muskellunge", "Muskellunge", "Third Saturday in June–Dec 15", "S-1", "C-0", [
      { start: "06-01", end: "12-15", startAnchor: thirdSatJun },
    ], { sizeNote: "Must be greater than 137 cm" }),
    seasonal("northern-pike", "Northern pike", "Jan 1–Mar 1 and May 1–Dec 31", "S-2", "C-1", [
      { start: "01-01", end: "03-01" },
      { start: "05-01", end: "12-31" },
    ], { sizeNote: "Possession higher than daily catch; not more than one greater than 86 cm" }),
    yearRound("pacific-salmon", "Pacific salmon", "S-5", "C-2"),
    yearRound("rainbow-trout", "Rainbow trout", "S-2", "C-1"),
    seasonal("walleye", "Walleye/sauger", "Jan 1–Mar 1 and May 1–Dec 31", "S-2", "C-1", [
      { start: "01-01", end: "03-01" },
      { start: "05-01", end: "12-31" },
    ], { sizeNote: "None between 41–56 cm; not more than one greater than 56 cm", combinedGroup: WALLEYE }),
    yearRound("yellow-perch", "Yellow perch", "S-25", "C-12", {
      sizeNote: "Possession limit is higher than the daily catch limit",
    }),
  ],
  "fmz-15": [
    closed("atlantic-salmon", "Atlantic salmon"),
    seasonal("brook-trout", "Brook trout", "Jan 1–Sept 30", "S-5", "C-2", [{ start: "01-01", end: "09-30" }]),
    yearRound("brown-trout", "Brown trout", "S-5", "C-2"),
    yearRound("channel-catfish", "Channel catfish", "S-12", "C-6"),
    yearRound("crappie", "Crappie", "S-30", "C-10"),
    closed("lake-sturgeon", "Lake sturgeon"),
    seasonal("lake-trout", "Lake trout", "Jan 1–Sept 30", "S-2", "C-1", [{ start: "01-01", end: "09-30" }]),
    yearRound("lake-whitefish", "Lake whitefish", "S-12", "C-6"),
    seasonal("largemouth-bass", "Largemouth/smallmouth bass (combined)", "Fourth Saturday in June–Nov 30", "S-6", "C-2", [
      { start: "06-01", end: "11-30", startAnchor: fourthSatJun },
    ], { combinedGroup: BASS }),
    seasonal("muskellunge", "Muskellunge", "First Saturday in June–Dec 15", "S-1", "C-0", [
      { start: "06-01", end: "12-15", startAnchor: firstSatJun },
    ], { sizeNote: "Must be greater than 91 cm" }),
    seasonal("northern-pike", "Northern pike", "Jan 1–Mar 31 and third Saturday in May–Dec 31", "S-6", "C-2", [
      { start: "01-01", end: "03-31" },
      { start: "05-01", end: "12-31", startAnchor: thirdSatMay },
    ]),
    yearRound("pacific-salmon", "Pacific salmon", "S-5", "C-2"),
    yearRound("rainbow-trout", "Rainbow trout", "S-5", "C-2"),
    seasonal("walleye", "Walleye/sauger", "Jan 1–Mar 15 and third Saturday in May–Dec 31", "S-4", "C-2", [
      { start: "01-01", end: "03-15" },
      { start: "05-01", end: "12-31", startAnchor: thirdSatMay },
    ], { sizeNote: "Not more than 1 greater than 46 cm", combinedGroup: WALLEYE }),
    yearRound("yellow-perch", "Yellow perch", "S-50", "C-25"),
  ],
  "fmz-17": [
    seasonal("atlantic-salmon", "Atlantic salmon", "Fourth Saturday in April–Sept 30", "S-0", "C-0", [
      { start: "04-01", end: "09-30", startAnchor: fourthSatApr, mode: "catch-and-release" },
    ]),
    seasonal("brook-trout", "Brook trout", "Fourth Saturday in April–Sept 30", "S-2", "C-1", [
      { start: "04-01", end: "09-30", startAnchor: fourthSatApr },
    ]),
    seasonal("brown-trout", "Brown trout", "Fourth Saturday in April–Sept 30", "S-5", "C-2", [
      { start: "04-01", end: "09-30", startAnchor: fourthSatApr },
    ]),
    seasonal("channel-catfish", "Channel catfish", "Fourth Saturday in April–Nov 15", "S-12", "C-6", [
      { start: "04-01", end: "11-15", startAnchor: fourthSatApr },
    ]),
    yearRound("crappie", "Crappie", "S-30", "C-10"),
    closed("lake-sturgeon", "Lake sturgeon"),
    seasonal("lake-trout", "Lake trout", "Fourth Saturday in April–Sept 30", "S-3", "C-1", [
      { start: "04-01", end: "09-30", startAnchor: fourthSatApr },
    ]),
    seasonal("lake-whitefish", "Lake whitefish", "Fourth Saturday in April–Nov 15", "S-12", "C-6", [
      { start: "04-01", end: "11-15", startAnchor: fourthSatApr },
    ]),
    seasonal("largemouth-bass", "Largemouth/smallmouth bass (combined)", "Third Saturday in June–Dec 15", "S-6", "C-2", [
      { start: "06-01", end: "12-15", startAnchor: thirdSatJun },
    ], { combinedGroup: BASS }),
    seasonal("muskellunge", "Muskellunge", "First Saturday in June–Dec 15", "S-1", "C-0", [
      { start: "06-01", end: "12-15", startAnchor: firstSatJun },
    ], { sizeNote: "Must be greater than 112 cm" }),
    yearRound("northern-pike", "Northern pike", "S-6", "C-2"),
    seasonal("pacific-salmon", "Pacific salmon", "Fourth Saturday in April–Sept 30", "S-5", "C-2", [
      { start: "04-01", end: "09-30", startAnchor: fourthSatApr },
    ]),
    seasonal("rainbow-trout", "Rainbow trout", "Fourth Saturday in April–Sept 30", "S-2", "C-1", [
      { start: "04-01", end: "09-30", startAnchor: fourthSatApr },
    ]),
    seasonal("walleye", "Walleye/sauger", "Second Saturday in May–Nov 15", "S-4", "C-1", [
      { start: "05-01", end: "11-15", startAnchor: secondSatMay },
    ], { sizeNote: "Must be between 35–50 cm", combinedGroup: WALLEYE }),
    yearRound("yellow-perch", "Yellow perch", "S-50", "C-25"),
  ],
  "fmz-18": [
    closed("atlantic-salmon", "Atlantic salmon"),
    yearRound("brook-trout", "Brook trout", "S-5", "C-2"),
    yearRound("brown-trout", "Brown trout", "S-5", "C-2"),
    yearRound("channel-catfish", "Channel catfish", "S-12", "C-6"),
    yearRound("crappie", "Crappie", "S-30", "C-10"),
    closed("lake-sturgeon", "Lake sturgeon"),
    seasonal("lake-trout", "Lake trout", "Fourth Saturday in May–Sept 8", "S-2", "C-1", [
      { start: "05-01", end: "09-08", startAnchor: { nth: 4, weekday: 6, month: 5 } },
    ]),
    yearRound("lake-whitefish", "Lake whitefish", "S-12", "C-6"),
    seasonal("largemouth-bass", "Largemouth/smallmouth bass (combined)", "Third Saturday in June–Dec 15", "S-6", "C-2", [
      { start: "06-01", end: "12-15", startAnchor: thirdSatJun },
    ], { combinedGroup: BASS }),
    seasonal("muskellunge", "Muskellunge", "First Saturday in June–Dec 15", "S-1", "C-0", [
      { start: "06-01", end: "12-15", startAnchor: firstSatJun },
    ], { sizeNote: "Must be greater than 91 cm" }),
    seasonal("northern-pike", "Northern pike", "Jan 1–Mar 31 and second Saturday in May–Dec 31", "S-6", "C-2", [
      { start: "01-01", end: "03-31" },
      { start: "05-01", end: "12-31", startAnchor: secondSatMay },
    ]),
    yearRound("pacific-salmon", "Pacific salmon", "S-5", "C-2"),
    yearRound("rainbow-trout", "Rainbow trout", "S-5", "C-2"),
    seasonal("walleye", "Walleye/sauger", "Jan 1–Mar 1 and second Saturday in May–Dec 31", "S-4", "C-2", [
      { start: "01-01", end: "03-01" },
      { start: "05-01", end: "12-31", startAnchor: secondSatMay },
    ], { sizeNote: "Must be between 40–50 cm", combinedGroup: WALLEYE }),
    yearRound("yellow-perch", "Yellow perch", "S-50", "C-25"),
  ],
  "fmz-19": [
    yearRound("atlantic-salmon", "Atlantic salmon", "S-1", "C-0"),
    yearRound("brown-trout", "Brown trout", "S-5", "C-2"),
    yearRound("channel-catfish", "Channel catfish", "S-12", "C-6"),
    yearRound("crappie", "Crappie", "S-30", "C-10"),
    closed("lake-sturgeon", "Lake sturgeon"),
    seasonal("lake-trout", "Lake trout", "Jan 1–Sept 30 and Dec 1–Dec 31", "S-3", "C-1", [
      { start: "01-01", end: "09-30" },
      { start: "12-01", end: "12-31" },
    ]),
    yearRound("lake-whitefish", "Lake whitefish", "S-12", "C-6"),
    seasonal("largemouth-bass", "Largemouth/smallmouth bass (combined)", "Fourth Saturday in June–Nov 30", "S-6", "C-2", [
      { start: "06-01", end: "11-30", startAnchor: fourthSatJun },
    ], { combinedGroup: BASS }),
    seasonal("muskellunge", "Muskellunge", "First Saturday in June–Dec 15", "S-1", "C-0", [
      { start: "06-01", end: "12-15", startAnchor: firstSatJun },
    ], { sizeNote: "Must be greater than 112 cm" }),
    yearRound("northern-pike", "Northern pike", "S-6", "C-2"),
    yearRound("pacific-salmon", "Pacific salmon", "S-5", "C-2"),
    yearRound("rainbow-trout", "Rainbow trout", "S-5", "C-2"),
    yearRound("walleye", "Walleye/sauger", "S-6", "C-2", { combinedGroup: WALLEYE }),
    yearRound("yellow-perch", "Yellow perch", "S-50", "C-25", {
      sizeNote: "Possession limit is higher than the daily catch limit",
    }),
  ],
};

export function rulesForFmz(fmz: FmzId): SpeciesRule[] {
  return fmzSpeciesRules[fmz] ?? [];
}

export function fmzLabel(fmz: FmzId) {
  return fmzLabels[fmz] ?? fmz.toUpperCase();
}

export function officialFmzUrl(fmz: FmzId) {
  return fmzRegulationUrl(fmz);
}
