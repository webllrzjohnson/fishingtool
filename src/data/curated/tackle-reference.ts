import { setupTemplates } from "./gear-setups";
import { commonSpecies } from "./species";

export const tackleFamilies = [
  { id: "jig", title: "Jig head & grub", caption: "A curled-tail grub threaded straight on a weighted jig hook, with its tail free to swim." },
  { id: "swimbait", title: "Paddle-tail swimbait", caption: "Fish-shaped soft plastic on a weighted jig hook, with the paddle tail free to kick." },
  { id: "worm-plastic", title: "Soft-plastic worm", caption: "Texas-rigged on an offset hook, with the point lightly tucked into a straight worm body. Fish weightless or add a sliding bullet weight." },
  { id: "tube-ned", title: "Tube jig", caption: "Hollow skirted tube rigged on an internal or exposed jig head, dragged and hopped on rock. The infographic shows an exposed head." },
  { id: "ned", title: "Ned rig", caption: "Short straight finesse plastic on a small exposed mushroom-style jig head." },
  { id: "drop-shot", title: "Drop-shot rig", caption: "A nose-hooked soft bait sits above a separate weight clipped to the line's tag end." },
  { id: "crankbait", title: "Crankbait / shallow plug", caption: "A lipped hard plug tied at the nose or bill; its shape, line and retrieve affect running depth." },
  { id: "jerkbait", title: "Jerkbait", caption: "A hard minnow plug worked with twitches and pauses; only suspending models hold depth on a pause." },
  { id: "spoon", title: "Casting / trolling spoon", caption: "Curved metal spoon with a front line tie and trailing hook; keep its retrieve wobbling rather than spinning." },
  { id: "jigging-spoon", title: "Vertical jigging spoon", caption: "A compact top-tied spoon with a trailing hook, worked vertically with short lifts and controlled falls." },
  { id: "spinnerbait", title: "Safety-pin spinnerbait", caption: "Bent wire keeps a rotating blade above a skirted single-hook head." },
  { id: "inline-spinner", title: "Inline spinner", caption: "Blade rotates around a straight wire shaft; not a safety-pin spinnerbait." },
  { id: "bucktail", title: "Bucktail spinner", caption: "Front-tied spinner with rotating blades, a dressed tail and trailing hooks; match line and leader to the actual lure." },
  { id: "topwater", title: "Surface popper", caption: "Concave face spits water on the surface; hooks hang below." },
  { id: "fly", title: "Streamer fly", caption: "Feather/fibre dressing tied to a hook and cast with a matched fly line." },
  { id: "bead-nymph", title: "Bead-head nymph", caption: "Small subsurface fly with a weighted bead head; a loose imitation bead uses a different rig." },
  { id: "roe-bead", title: "Roe-imitation bead", caption: "Imitation egg bead pegged on the leader above a separate bare hook for a natural drift; not a bead-head fly." },
  { id: "dry-fly", title: "Dry fly", caption: "Buoyant winged fly rides at the surface; drift it with a matched fly line." },
  { id: "soft-rubber", title: "Large soft rubber", caption: "Large flexible paddle-tail bait on a heavy hook; match the rod rating and use a tooth-resistant leader." },
  { id: "maggot", title: "Maggot on ice jig", caption: "Small natural larva tipped on a tiny vertical ice jig; check bait rules." },
  { id: "corn", title: "Corn on bottom rig", caption: "Full infographic shows natural corn kernels on an exposed bait hook after a sliding sinker, bead, swivel and leader; check local bait permission." },
  { id: "dough-bait", title: "Dough on bottom rig", caption: "Moulded dough around a bait hook above a bottom sinker; check bait permission." },
  { id: "boilie", title: "Boilie on bottom rig", caption: "Full infographic shows a boilie stopped on a separate hair beside the bare hook, with a sliding bottom sinker; check bait permission and lead safety." },
  { id: "bottom-worm", title: "Worm on bottom rig", caption: "Full infographic shows a real worm on an exposed hook below a sliding sinker, bead, swivel and leader; check bait permission." },
  { id: "cut-bait", title: "Cut bait on bottom rig", caption: "Piece of baitfish on a bottom hook; verify permitted species and bait rules." },
  { id: "stink-bait", title: "Stink bait on bottom rig", caption: "Moldable prepared scented paste on a bait-holder hook near a sliding bottom sinker; follow the product's baiting directions." },
  { id: "worm-float", title: "Worm under float", caption: "A worm on a single hook hangs below a float, with an optional split shot on the line. The AI illustration is an example, not rigging instructions; check natural-bait permission for the water." },
  { id: "minnow-float", title: "Minnow & float", caption: "Illustrative baitfish below a float; verify species, transport and use restrictions." },
  { id: "worm-harness", title: "Worm spinner harness", caption: "A clevis-mounted spinning blade and beads ride on the leader just ahead of a single worm-baited hook; drift or troll slowly where permitted." },
  { id: "bottom-rig", title: "Bottom bait rig", caption: "Full infographic shows a general sliding-sinker bottom rig with a worm-baited hook and natural corn as a separate alternative; bait rules vary." },
] as const;

export type TackleFamilyId = (typeof tackleFamilies)[number]["id"];
export const tackleImage = (id: TackleFamilyId) => `/tackle/${id}.svg`;

/** Intentional per-option classification: no fuzzy fallback that silently mislabels a bait. */
export const baitFamilyByName = {
  "Minnow-style soft plastic": "swimbait", "Shallow crankbait": "crankbait", "Worm harness": "worm-harness", "Live minnow": "minnow-float",
  "Spoon": "spoon", "Spinnerbait": "spinnerbait", "Jerkbait": "jerkbait", "Soft plastic worm": "worm-plastic",
  "Topwater popper": "topwater", "Tube jig": "tube-ned", "Ned rig": "ned", "Drop-shot": "drop-shot",
  "Small jig and grub": "jig", "Worm pieces": "worm-float", "Small inline spinner": "inline-spinner",
  "1/16 oz jig and small plastic": "jig", "Small minnow": "minnow-float", "Inline spinner": "inline-spinner", "Small spoon": "spoon",
  "Streamer fly": "fly", "Jigging spoon": "jigging-spoon", "Small crankbait": "crankbait",
  "Worm under a float": "worm-float", "Bead-head nymph": "bead-nymph", "Dry fly": "dry-fly",
  "Spinner": "inline-spinner", "Roe-imitation bead": "roe-bead", "Large jerkbait": "jerkbait",
  "Bucktail spinner": "bucktail", "Large soft rubber": "soft-rubber", "Small jigging spoon": "jigging-spoon",
  "Maggot": "maggot", "Corn": "corn", "Dough bait": "dough-bait", "Boilie-style bait": "boilie",
  "Worm on bottom rig": "bottom-worm", "Cut bait": "cut-bait", "Stink bait": "stink-bait", "Small jig": "jig", "Worm": "worm-float",
  "Tiny jig and grub": "jig", "Worm piece": "worm-float",
} as const satisfies Record<string, TackleFamilyId>;

export function familyForBait(name: string): TackleFamilyId | undefined {
  return baitFamilyByName[name as keyof typeof baitFamilyByName];
}

/** BMZ possession/transport rules target baitfish and leeches, not every natural bait. */
export function baitRuleWarning(name: string, kind: "natural" | "artificial"): string | undefined {
  if (name === "Roe-imitation bead") return "An imitation bead is not automatically an artificial fly. Verify this water's method, bead and flies-only restrictions before use.";
  if (kind !== "natural") return undefined;
  if (["Live minnow", "Small minnow", "Cut bait"].includes(name)) return "Verify permitted baitfish species, bait-management-zone possession and transport rules, and waterbody/property restrictions before use.";
  return "Verify natural or prepared bait permission and waterbody/property restrictions before use; baitfish BMZ transport rules do not automatically apply to worms, maggots or prepared bait.";
}

/** Examples and size notes are drawn from the same curated options shown on fish profiles. */
export function guideForFamily(id: TackleFamilyId) {
  const examples = commonSpecies.flatMap((species) => species.baits
    .filter((bait) => familyForBait(bait.name) === id)
    .map((bait) => ({ speciesId: species.id, speciesName: species.name, bait })));
  const sizes = [...new Set(examples.flatMap(({ bait }) => bait.sizes ? [bait.sizes] : []))];
  return {
    examples,
    sizes,
    natural: examples.some(({ bait }) => bait.kind === "natural") || ["bottom-rig", "worm-float", "minnow-float", "worm-harness", "maggot", "corn", "dough-bait", "boilie", "bottom-worm", "cut-bait", "stink-bait"].includes(id),
  };
}

export const reelTypes = [
  { id: "spinning", title: "Spinning", description: "Open fixed spool hangs below rod. Bail picks up line; versatile for light to medium shore casting.", classNote: "1000–2000 light/panfish; 2500–3500 general shore; 3000–4000 pike; 4000–5000 migratory salmon or bottom bait are examples, not guaranteed capacities. Check each model's rated diameter and length.", line: "4–6 lb mono light; 8–12 lb mono or 10–20 lb braid general; 15–30 lb braid plus tooth-resistant leader for pike; 12–20 lb mono or 20–30 lb braid for migratory salmon. Check spool capacity at actual line diameter.", source: "https://fish.shimano.com/en-US/product/reels/spinning/frontdrag/a075f00003slvodqas.html" },
  { id: "baitcasting", title: "Baitcasting", description: "Rotating spool on top of a casting rod; thumb controls spool. Match rod and bait rating.", classNote: "Compact bass sizes vary. Dedicated 300–400 class for heavy muskie casting, not a 3000–4000 spinning equivalent.", line: "Muskie: 80–100 lb braid and heavy tooth-resistant leader; match lure weight and rod.", source: "https://fish.shimano.com/en-US/product/reels/baitcast/lowprofile/a075f00002jagt4qam.html" },
  { id: "spincast", title: "Spincast", description: "Closed-face push-button reel, normally above its matched rod; easy short casts, limited heavy/long-line roles.", classNote: "No transferable size number; choose from stated line capacity and rod rating.", line: "Follow maker's capacity label; light mono is a common beginner choice.", source: "https://www.ontario.ca/page/learn-fish-guide" },
  { id: "fly", title: "Fly", description: "Wide spool stores fly line and backing; cast with line weight, not lure mass.", classNote: "Match reel to fly-rod/line weight and ensure backing capacity; not a spinning-size scale.", line: "Matching weight-forward fly line plus backing and tapered leader.", source: "https://www.orvis.com/how-do-i-choose-a-fly-reel.html" },
  { id: "ice", title: "Ice spinning / inline", description: "Small spinning or inline ice reel on a short ice rod for vertical jigging; inline reduces twist with tiny jigs.", classNote: "Compact reel is selected by ice rod, target, and capacity, not open-water spinning number alone.", line: "2–6 lb mono/fluoro for panfish; 8–12 lb for larger ice targets, with tooth leader for pike.", source: "https://fish.shimano.com/en-US/news/news-listing/Ice-Fishing-Starts-Here.html" },
  { id: "centerpin", title: "Centerpin", description: "Large free-running drum for long controlled river floats; specialist alternative for steelhead, not a spinning reel.", classNote: "Diameter and capacity vary; no conversion to 4000-size spinning.", line: "Float mainline and species/river-appropriate leader; check line capacity on model.", source: "https://www.ontario.ca/page/learn-fish-guide" },
  { id: "line-counter", title: "Line-counter trolling", description: "Boat trolling reel with a readout of deployed line; readout assists repeatable presentation, not guaranteed depth.", classNote: "Select capacity for deployed line PLUS reserve and line diameter; maker's 20/30 class is not spinning 2000/3000.", line: "Match mono/braid/lead-core to method, reel capacity and target; reserve must remain after deployment.", source: "https://okumafishingusa.com/products/cold-water-a-line-counters" },
] as const;

/** Curated contexts only: the first entry is the shore/default suggestion; ice/boat are alternatives. */
const speciesSetupIds: Record<string, readonly string[]> = {
  walleye: ["general-shore-spinning", "ice-walleye-pike", "trolling-line-counter"],
  "northern-pike": ["pike-cover-spinning", "ice-walleye-pike"],
  "largemouth-bass": ["general-shore-spinning"], "smallmouth-bass": ["general-shore-spinning"],
  "yellow-perch": ["panfish-light-spinning", "ice-panfish"], crappie: ["panfish-light-spinning", "ice-panfish"],
  "brook-trout": ["panfish-light-spinning", "fly-trout"], "lake-trout": ["lake-trout-shore", "trolling-line-counter"],
  "rainbow-trout": ["stocked-pond-trout", "salmon-steelhead-shore", "fly-trout", "fly-steelhead-salmon"], "brown-trout": ["fly-trout", "salmon-steelhead-shore", "fly-steelhead-salmon"],
  "pacific-salmon": ["salmon-steelhead-shore", "trolling-line-counter", "fly-steelhead-salmon"],
  muskellunge: ["muskie-casting"], "lake-whitefish": ["whitefish-shore", "ice-walleye-pike"],
  carp: ["carp-catfish-bait"], "channel-catfish": ["carp-catfish-bait"],
  "rock-bass": ["panfish-light-spinning"], pumpkinseed: ["panfish-light-spinning"], bluegill: ["panfish-light-spinning", "ice-panfish"],
};

export function reelSetupsForSpecies(id: string) {
  return (speciesSetupIds[id] ?? []).map((setupId) => {
    const setup = setupTemplates.find((item) => item.id === setupId);
    if (!setup) throw new Error(`Missing reel setup ${setupId}`);
    return setup;
  });
}
