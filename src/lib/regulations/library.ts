import { fishOnlineUrl, fmzRegulationUrl, officialRegulationUrl } from "@/lib/sources";

export const REGULATIONS_PDF_TITLE = "2026 Ontario Fishing Regulations Summary";
export const REGULATIONS_EFFECTIVE_DATE = "January 1, 2026";

export type RegulationCategory =
  | "getting-started"
  | "licence-limits"
  | "general-rules"
  | "bait-bmz"
  | "invasive-species"
  | "fmz";

export type RegulationCitation = {
  /** Printed page in the official 2026 PDF, not a user-entered interpretation. */
  page: number;
  label: string;
  url: string;
};

export type RegulationEntry = {
  id: string;
  title: string;
  category: Exclude<RegulationCategory, "fmz">;
  summary: string;
  points: readonly string[];
  topics: readonly string[];
  citation: RegulationCitation;
  officialUrl?: string;
};

export type FmzSummary = {
  zone: number;
  title: string;
  /** The first printed page of the zone's PDF section. */
  startPage: number;
  topics: readonly string[];
  summary: string;
  citation: RegulationCitation;
  officialUrl: string;
};

const pdfCitation = (page: number, label: string): RegulationCitation => ({
  page,
  label,
  url: officialRegulationUrl,
});

/**
 * First-stage, source-backed navigation content. It intentionally indexes high-value
 * province-wide rules and zone entry points; it does not model waterbody exceptions.
 */
export const regulationEntries: readonly RegulationEntry[] = [
  {
    id: "how-to-use",
    title: "Use the rules in the right order",
    category: "getting-started",
    summary: "Confirm your licence, general rules, bait rules, FMZ, then the exact waterbody's exceptions and sanctuaries.",
    points: [
      "Ontario has 20 Fisheries Management Zones (FMZs).",
      "Zone-wide seasons and limits apply unless a species or waterbody exception says otherwise.",
      "Fish sanctuaries, bait restrictions and waterbody exceptions can change the zone-wide result.",
    ],
    topics: ["FMZ", "waterbody exceptions", "fish sanctuary", "Fish ON-Line", "seasons"],
    citation: pdfCitation(6, "How to Use this Summary"),
    officialUrl: fishOnlineUrl,
  },
  {
    id: "licence-types",
    title: "Sport and Conservation licences",
    category: "licence-limits",
    summary: "Sport uses the normal catch and possession limits; Conservation has reduced limits intended for anglers who release most fish.",
    points: [
      "In the summary, S is the Sport limit and C is the Conservation limit.",
      "Most people need a recreational fishing licence or a deemed licence to fish.",
      "Carry the required Outdoors Card and licence summary documents when fishing, as described in the official summary.",
    ],
    topics: ["licence", "Sport", "Conservation", "Outdoors Card", "S-4", "C-2"],
    citation: pdfCitation(8, "Recreational Fishing Licence and Fees"),
  },
  {
    id: "family-fishing-2026",
    title: "2026 family fishing opportunities",
    category: "licence-limits",
    summary: "Ontario and Canadian residents have four listed licence-free opportunities in 2026, but must follow Conservation licence limits and carry government-issued identification.",
    points: [
      "Family Fishing Weekend: February 14–16, 2026.",
      "Mother's Day Weekend: May 9–10; Father's Day Weekend: June 20–21; Ontario Family Fishing Week: June 27–July 5, 2026.",
      "This is a limited summary: check the official current free-fishing page before the trip.",
    ],
    topics: ["free fishing", "Family Fishing Weekend", "Mother's Day", "Father's Day", "2026 dates"],
    citation: pdfCitation(9, "Recreational Fishing Licence and Fees"),
  },
  {
    id: "catch-possession-combined",
    title: "Catch, possession and combined limits",
    category: "licence-limits",
    summary: "A daily catch limit includes fish kept, eaten or given away; possession includes fish on hand, in storage and in transit. Combined limits are not separate limits for each listed species.",
    points: [
      "If you reach a daily catch or possession limit, fish caught after that must be released immediately.",
      "Walleye and Sauger; Largemouth and Smallmouth Bass; and Black and White Crappie have combined limits where specified.",
      "Trout and salmon have an aggregate limit: Sport 5 and Conservation 2, in addition to any individual species limit.",
    ],
    topics: ["catch limit", "possession limit", "combined limit", "walleye", "bass", "trout", "salmon"],
    citation: pdfCitation(11, "General Fishing Regulations — Glossary of Terms"),
  },
  {
    id: "closed-seasons-exceptions",
    title: "Closed seasons and waterbody exceptions",
    category: "general-rules",
    summary: "Do not target a fish when its season is closed. An open season with a zero limit can be catch-and-release only. Exact-waterbody exceptions can replace the zone-wide rule.",
    points: [
      "Accidentally caught fish during a closed season must be immediately released.",
      "Fish sanctuaries may prohibit all fishing for all or part of the year and may not be marked with signs.",
      "Do not use this library as a determination for an unnamed bay, tributary, boundary water or exception waterbody.",
    ],
    topics: ["closed season", "catch and release", "sanctuary", "exception", "tributary", "boundary water"],
    citation: pdfCitation(12, "General Fishing Regulations"),
    officialUrl: fishOnlineUrl,
  },
  {
    id: "lines-hooks-release",
    title: "Lines, hooks and immediate release",
    category: "general-rules",
    summary: "Generally one line may be used unless the regulations state otherwise; a line cannot have more than four hooks. Fish that are illegal to possess must be immediately released at capture.",
    points: [
      "Two lines are only allowed in specified Great Lakes areas and for ice fishing in many areas; verify the applicable waterbody rule.",
      "A regulated invasive fish such as Round Goby is an exception to release: do not release it alive.",
      "Holding-box fish count toward catch and possession limits.",
    ],
    topics: ["lines", "hooks", "immediate release", "ice fishing", "Round Goby"],
    citation: pdfCitation(13, "General Fishing Regulations"),
  },
  {
    id: "transport-packaging",
    title: "Transporting and packaging sport fish",
    category: "general-rules",
    summary: "Do not transport live sport fish overland without a permit. Kept fish may be cleaned, but must remain readily measurable where size limits apply unless a listed exception applies.",
    points: [
      "Package fish so they can be easily counted and identified.",
      "Leave a large patch of skin on fillets for identification; some species need further identifying features.",
      "Do not freeze fish into an unidentifiable clump.",
    ],
    topics: ["transport", "packaging", "fillets", "size limit", "live fish"],
    citation: pdfCitation(16, "General Fishing Regulations — Transporting Sport Fish"),
  },
  {
    id: "ice-fishing",
    title: "Ice fishing and huts",
    category: "general-rules",
    summary: "Two lines may be used for ice fishing in most waters, but each line must be closely watched. Registration and removal rules apply to many huts and zones.",
    points: [
      "You must have a clear, unobstructed view of your ice-fishing lines at all times.",
      "Registration/removal dates differ by listed zone groups; confirm the current requirements before placing a hut.",
      "Local park or conservation-reserve approvals may also be required.",
    ],
    topics: ["ice fishing", "two lines", "ice hut", "registration"],
    citation: pdfCitation(17, "General Fishing Regulations — Ice Fishing"),
  },
  {
    id: "bait-bmz-movement",
    title: "Bait Management Zones: movement matters",
    category: "bait-bmz",
    summary: "Four Bait Management Zones limit the movement, possession and use of baitfish and leeches. The Great Lakes and Ottawa River are not BMZs, with rules for movement to and from adjacent BMZs.",
    points: [
      "Do not transport baitfish or leeches into or out of a BMZ except for limited stated exceptions.",
      "A direct route through an adjacent BMZ is allowed only to reach a destination in the BMZ where bait was lawfully acquired.",
      "The BMZ map is based on FMZ boundaries; use the official map and bait page for detailed boundaries.",
    ],
    topics: ["bait", "BMZ", "baitfish", "leeches", "Great Lakes", "Ottawa River"],
    citation: pdfCitation(20, "Bait Management Zones (BMZ) Map"),
  },
  {
    id: "bait-receipts-harvest",
    title: "Bait receipts and personal harvest",
    category: "bait-bmz",
    summary: "If you use or possess baitfish or leeches in a BMZ other than where your primary residence is located, the summary requires commercial bait and a receipt; personally harvested bait has its own location limits.",
    points: [
      "Keep a legible receipt and be able to produce it immediately if requested; baitfish or leeches may only be possessed or used within two weeks of the receipt date.",
      "Personally harvest baitfish and leeches only in the BMZ of your primary residence, or within the Great Lakes or Ottawa River under the listed conditions.",
      "Preserved bait has separate transport conditions; read the official bait section for the full definition.",
    ],
    topics: ["bait receipt", "primary residence", "personal harvest", "preserved bait", "leeches"],
    citation: pdfCitation(21, "Bait"),
  },
  {
    id: "bait-limits",
    title: "Bait capture limits and permitted species",
    category: "bait-bmz",
    summary: "A recreational fishing licence is required to capture baitfish, leeches, crayfish or frogs. The summary lists capture limits and permitted baitfish species; do not assume a fish is permitted bait.",
    points: [
      "Baitfish limit: 120, including caught or purchased baitfish.",
      "Leeches limit: 120; crayfish limit: 36; frogs limit: 12.",
      "Salamanders cannot be used as bait in Ontario. Chumming is only allowed with plant-based bait, not baitfish or other fish species.",
    ],
    topics: ["baitfish limit", "leeches", "crayfish", "frogs", "salamanders", "chumming"],
    citation: pdfCitation(22, "Bait — Permitted Baitfish and Limits and Capture Methods"),
  },
  {
    id: "invasive-vhs",
    title: "Invasive species, boats and VHS",
    category: "invasive-species",
    summary: "Remove drain plugs or open drainage devices before overland transport, remove aquatic plants/animals/algae, and ensure watercraft and equipment are clean before launching elsewhere.",
    points: [
      "If you catch a prohibited invasive fish, invertebrate or plant, destroy it in a way that prevents reproduction or growth; do not release it alive.",
      "It is illegal to use gobies as bait or possess live gobies. The summary says Round Goby should be destroyed and new sightings reported.",
      "VHS is not a threat to human health; the official page has current disease information.",
    ],
    topics: ["invasive species", "Round Goby", "VHS", "drain plug", "boat", "clean drain dry"],
    citation: pdfCitation(23, "Invasive Species and Viral Hemorrhagic Septicemia (VHS)"),
  },
] as const;

const fmzStartPages = [25, 25, 25, 31, 37, 45, 53, 64, 75, 78, 89, 96, 99, 99, 104, 116, 126, 130, 134, 137] as const;

export const fmzSummaries: readonly FmzSummary[] = fmzStartPages.map((startPage, index) => {
  const zone = index + 1;
  return {
    zone,
    title: `FMZ ${zone}`,
    startPage,
    topics: ["zone-wide seasons and limits", "species exceptions", "waterbody exceptions", "bait restrictions", "fish sanctuaries"],
    summary: `Open the official FMZ ${zone} section for its zone-wide seasons and limits, then check species exceptions, waterbody exceptions, bait restrictions and fish sanctuaries for the exact water you plan to fish.`,
    citation: pdfCitation(startPage, `Fisheries Management Zone ${zone}`),
    officialUrl: fmzRegulationUrl(zone),
  };
});

export const regulationCategories: Readonly<Record<RegulationCategory, string>> = {
  "getting-started": "Getting started",
  "licence-limits": "Licence & limits",
  "general-rules": "General rules",
  "bait-bmz": "Bait & BMZ",
  "invasive-species": "Invasive species & VHS",
  fmz: "FMZ summaries",
};

export function validateRegulationsLibrary() {
  if (fmzSummaries.length !== 20) throw new Error("Expected 20 FMZ summaries.");
  if (new Set(fmzSummaries.map((entry) => entry.zone)).size !== 20) throw new Error("FMZ summary zones must be unique.");
  if (regulationEntries.some((entry) => entry.citation.page < 1 || !entry.citation.url.startsWith("https://"))) {
    throw new Error("Every regulation entry must have a valid official PDF citation.");
  }
  if (fmzSummaries.some((entry) => entry.citation.page !== entry.startPage || !entry.officialUrl.startsWith("https://"))) {
    throw new Error("Every FMZ summary must have a source page and official link.");
  }
  return true;
}
