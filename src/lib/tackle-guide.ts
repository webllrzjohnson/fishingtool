import type { TackleSuggestion } from "./types";

/** Hook/lure matrix for Ugly Stik GX2 6'6" Medium spinning combo. */
export const tackleGuide: TackleSuggestion[] = [
  {
    target: "Perch / bluegill / pumpkinseed / rock bass",
    setup: "Size 6–10 baitholder hook + worm pieces; 1/16–1/8 oz jig + small grub/tube; small inline spinner.",
  },
  {
    target: "Largemouth bass",
    setup: "2/0–4/0 EWG worm hook + soft plastic; 1/8–3/8 oz jig; spinnerbait; shallow crankbait. Weedless in weedy bays.",
  },
  {
    target: "Smallmouth bass",
    setup: "1/8–1/4 oz tube jig; Ned rig; drop-shot size 1–2 hook; small crankbait or inline spinner.",
  },
  {
    target: "Northern pike",
    setup: "Medium spoon, spinnerbait, jerkbait, swimbait; add short wire or heavy fluorocarbon leader.",
  },
  {
    target: "Carp",
    setup: "Size 4–8 strong hook with corn/dough where allowed; sliding sinker; keep drag loose.",
  },
  {
    target: "Bullhead / channel catfish",
    setup: "Size 2–1/0 bait hook with worm/cut bait where legal; bottom rig with enough weight.",
  },
  {
    target: "Trout / salmon (river mouths)",
    setup: "Spoons, spinners, crankbaits, roe-imitation beads/flies where legal; verify tributary rules first.",
  },
  {
    target: "Walleye",
    setup: "1/8–3/8 oz jig with minnow-style soft plastic; dusk crankbait; worm harness where suitable.",
  },
];

const tackleByKeyword: Record<string, string> = {
  pike: "Northern pike",
  bass: "Largemouth bass",
  largemouth: "Largemouth bass",
  smallmouth: "Smallmouth bass",
  perch: "Perch / bluegill / pumpkinseed / rock bass",
  panfish: "Perch / bluegill / pumpkinseed / rock bass",
  bluegill: "Perch / bluegill / pumpkinseed / rock bass",
  carp: "Carp",
  bullhead: "Bullhead / channel catfish",
  catfish: "Bullhead / channel catfish",
  trout: "Trout / salmon (river mouths)",
  salmon: "Trout / salmon (river mouths)",
  walleye: "Walleye",
};

export function tackleForTargets(targets: string[]): TackleSuggestion[] {
  const seen = new Set<string>();
  const results: TackleSuggestion[] = [];

  for (const target of targets) {
    const lower = target.toLowerCase();
    const matchKey = Object.keys(tackleByKeyword).find((key) => lower.includes(key));
    if (!matchKey) continue;

    const guideTarget = tackleByKeyword[matchKey];
    if (seen.has(guideTarget)) continue;
    seen.add(guideTarget);

    const entry = tackleGuide.find((item) => item.target === guideTarget);
    if (entry) results.push(entry);
  }

  return results.length > 0 ? results : tackleGuide.slice(0, 4);
}
