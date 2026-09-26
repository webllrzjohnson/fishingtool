import type { SpeciesProfile } from "@/lib/types";
import { destinationOntarioSource } from "@/lib/sources";
import { getSpeciesImage } from "@/data/curated/species-images";

const source = destinationOntarioSource;

export const commonSpecies: SpeciesProfile[] = [
  {
    id: "walleye",
    name: "Walleye",
    aliases: ["pickerel"],
    summary: "Ontario’s most popular table fish. Walleye hold on points, reefs, drop-offs, and current breaks, and they feed best in low light.",
    habitat: ["Main-lake points and rocky reefs", "Drop-offs and the first break", "River tails, bridges, and current seams"],
    seasonalPattern: {
      spring: "Shallow bays, spawning areas, and current after ice-out.",
      summer: "Deeper structure, weeds edges, and dusk feeding windows.",
      fall: "Move back toward points, river mouths, and bait schools.",
      winter: "Basins and humps; a staple ice target where the season is open.",
    },
    baits: [
      { name: "Minnow-style soft plastic", kind: "artificial", sizes: "3–4 in on 1/8–3/8 oz jig", rig: "Jig head, slow lift", technique: "Hop or drag along bottom at dusk and in current.", seasons: ["spring", "summer", "fall"] },
      { name: "Shallow crankbait", kind: "artificial", sizes: "size 5–7", technique: "Troll or cast along breaks and over reefs.", seasons: ["summer", "fall"] },
      { name: "Worm harness", kind: "natural", sizes: "nightcrawler", rig: "Spinner harness", technique: "Slow-troll or drift where live bait is legal.", seasons: ["spring", "summer"], liveBaitWarning: true },
      { name: "Live minnow", kind: "natural", rig: "Jig or float", technique: "Only if legal in the bait-management zone and on that property.", seasons: ["spring", "winter"], liveBaitWarning: true },
    ],
    gear: { power: "Medium spinning", line: "8–12 lb braid with 8–12 lb fluoro leader" },
    handling: "Walleye have sharp gill covers. Wet hands, support the body, and release quickly in warm water.",
    source,
  },
  {
    id: "northern-pike",
    name: "Northern pike",
    aliases: ["jackfish"],
    summary: "An ambush predator that patrols weeds, fallen trees, and rocky reefs. A medium spinning outfit can handle typical shore pike if you add a leader.",
    habitat: ["Weed beds and fallen timber", "Rocky reefs and points", "Shallow bays in spring"],
    seasonalPattern: {
      spring: "Shallow bays and incoming weeds; smaller, slower baits often win.",
      summer: "Weed edges, cabbage, and over weeds with weedless spoons.",
      fall: "Larger baits around remaining weeds and baitfish.",
      winter: "Weedy bays and first breaks through the ice where open.",
    },
    baits: [
      { name: "Spoon", kind: "artificial", sizes: "medium, 1/2–3/4 oz", rig: "Short wire or heavy fluoro leader", technique: "Cast and retrieve; pause on the fall.", seasons: ["spring", "summer", "fall"] },
      { name: "Spinnerbait", kind: "artificial", sizes: "3/8–3/4 oz", technique: "Roll over weeds and timber.", seasons: ["spring", "summer"] },
      { name: "Jerkbait", kind: "artificial", technique: "Twitch along remaining weeds and points.", seasons: ["fall"] },
      { name: "Live minnow", kind: "natural", rig: "Under a float or on a jig", technique: "Only if legal in the bait-management zone and on that property.", seasons: ["spring", "winter"], liveBaitWarning: true },
    ],
    gear: { power: "Medium to medium-heavy spinning", line: "10–20 lb", leader: "Wire or 40–60 lb fluorocarbon" },
    handling: "Pike teeth cut line and skin. Use a leader, long-nose pliers, and keep fingers away from the gill rakers.",
    source,
  },
  {
    id: "largemouth-bass",
    name: "Largemouth bass",
    aliases: ["black bass"],
    summary: "A beginner-friendly warmwater fish that lives in weeds, docks, timber, and slop. Weedless plastics are the shore-fishing staple.",
    habitat: ["Weedy bays and pads", "Docks, timber, and laydowns", "Shallow cover on sunny days"],
    seasonalPattern: {
      spring: "Shallow spawning bays; respect catch-and-release windows.",
      summer: "Thick cover, docks, and early/late topwater.",
      fall: "Baitfish and remaining weeds; crankbaits and spinnerbaits.",
      winter: "Limited open-water bite; some ice fisheries exist.",
    },
    baits: [
      { name: "Soft plastic worm or senko", kind: "artificial", sizes: "4–5 in", rig: "2/0–4/0 EWG, weedless", technique: "Weightless or texas-rig through cover.", seasons: ["spring", "summer", "fall"] },
      { name: "Spinnerbait", kind: "artificial", sizes: "3/8 oz", technique: "Burn along weed edges and wind-blown banks.", seasons: ["spring", "summer"] },
      { name: "Shallow crankbait", kind: "artificial", technique: "Cast to visible cover and deflect off wood.", seasons: ["summer", "fall"] },
      { name: "Topwater popper", kind: "artificial", technique: "Walk or pop at first and last light.", seasons: ["summer"] },
    ],
    gear: { power: "Medium spinning", line: "10–15 lb braid or 8–12 lb fluoro" },
    handling: "Support the fish horizontally. Avoid hanging heavy bass by the jaw for long photos.",
    source,
  },
  {
    id: "smallmouth-bass",
    name: "Smallmouth bass",
    aliases: ["bronzeback"],
    summary: "Ontario’s open-water bass. Smallmouth use rock, current, and reefs and fight harder than their size suggests.",
    habitat: ["Rocky shorelines and reefs", "Current seams and river rock", "Drop-offs and gravel"],
    seasonalPattern: {
      spring: "Shallow rock and spawning areas during catch-and-release periods.",
      summer: "Deeper rock, smallmouth often take tubes, Ned rigs, and topwater.",
      fall: "Baitfish schools and remaining rock points.",
      winter: "Deep rock basins in some ice fisheries.",
    },
    baits: [
      { name: "Tube jig", kind: "artificial", sizes: "1/8–1/4 oz", technique: "Drag and hop on rock.", seasons: ["spring", "summer", "fall"] },
      { name: "Ned rig", kind: "artificial", sizes: "2.5–3 in", technique: "Slow drag on gravel and rock.", seasons: ["summer", "fall"] },
      { name: "Drop-shot", kind: "artificial", sizes: "size 1–2 hook", technique: "Hold over visible fish or breaks.", seasons: ["summer"] },
      { name: "Topwater popper", kind: "artificial", technique: "Walk over shallow rock when water is warm.", seasons: ["summer"] },
    ],
    gear: { power: "Medium spinning", line: "8–10 lb fluoro or braid-to-fluoro" },
    handling: "Smallmouth are often released. Wet hands, unhook quickly, and keep them in the water when possible.",
    source,
  },
  {
    id: "yellow-perch",
    name: "Yellow perch",
    aliases: ["perch"],
    summary: "A family-friendly panfish that schools along weeds, harbours, and ice. Small jigs and worm pieces are enough.",
    habitat: ["Harbours and weed edges", "Piersons, docks, and slow current", "Ice basins over remaining weeds"],
    seasonalPattern: {
      spring: "Shallow weeds and harbours after ice-out.",
      summer: "Weed edges and shade; small presentations.",
      fall: "Schools tighten; excellent shore and pier fishing.",
      winter: "A primary ice target in many southern lakes.",
    },
    baits: [
      { name: "Small jig and grub", kind: "artificial", sizes: "1/16–1/8 oz", technique: "Short hops under a float or on bottom.", seasons: ["spring", "summer", "fall", "winter"] },
      { name: "Worm pieces", kind: "natural", sizes: "size 6–10 hook", rig: "Baitholder under a float", technique: "Simple shore method where worms are allowed.", seasons: ["spring", "summer", "fall"] },
      { name: "Small inline spinner", kind: "artificial", technique: "Slow retrieve along weeds.", seasons: ["spring", "summer"] },
    ],
    gear: { power: "Light to medium spinning", line: "4–8 lb" },
    handling: "Perch spines are sharp. Unhook with pliers and ice fish quickly in summer heat.",
    source,
  },
  {
    id: "crappie",
    name: "Crappie",
    aliases: ["black crappie", "speckled bass"],
    summary: "A schooling panfish found around timber, brush, and weeds. Tiny jigs and slow retrieves outperform large bass baits.",
    habitat: ["Brush, timber, and docks", "Weedy bays", "Creek mouths"],
    seasonalPattern: {
      spring: "Shallow brush during the spawn.",
      summer: "Suspend over brush or weed edges.",
      fall: "Creek mouths and remaining cover.",
      winter: "Timber and basins through the ice.",
    },
    baits: [
      { name: "1/16 oz jig and small plastic", kind: "artificial", technique: "Slow swim or float around timber.", seasons: ["spring", "summer", "fall"] },
      { name: "Small minnow", kind: "natural", rig: "Float or tiny jig", technique: "Only where baitfish are legal.", seasons: ["spring", "winter"], liveBaitWarning: true },
    ],
    gear: { power: "Light spinning", line: "4–6 lb" },
    handling: "Soft mouths tear easily. Use a small net and unhook gently.",
    source,
  },
  {
    id: "brook-trout",
    name: "Brook trout",
    aliases: ["speckled trout", "squaretail"],
    summary: "Ontario’s native jewel. Brook trout need cold, clean water and are often a catch-and-release or highly regulated fish.",
    habitat: ["Spring creeks and tributaries", "Cold lakes and beaver ponds", "Lake Superior coaster shorelines"],
    seasonalPattern: {
      spring: "Shallow shorelines and river mouths while water is cold.",
      summer: "Springs, shade, and deeper cold water.",
      fall: "Spawning colours; extra care and closed or restricted seasons are common.",
      winter: "Limited, highly regulated ice opportunities on some waters.",
    },
    baits: [
      { name: "Inline spinner", kind: "artificial", sizes: "size 0–2", technique: "Across and down in current.", seasons: ["spring", "summer"] },
      { name: "Small spoon", kind: "artificial", technique: "Cast along cold shorelines and drop-offs.", seasons: ["spring", "fall"] },
      { name: "Muddler or woolly streamer", kind: "artificial", technique: "Swing or strip in rivers.", seasons: ["spring", "summer", "fall"] },
    ],
    gear: { power: "Light to medium spinning or fly", line: "4–8 lb" },
    handling: "Keep trout in cold water, never squeeze, and revive facing into current. Barbless hooks help.",
    source,
  },
  {
    id: "lake-trout",
    name: "Lake trout",
    aliases: ["togue", "grey trout"],
    summary: "A deep, cold-water fish. Shore opportunities exist in spring and fall; summer fishing is usually a boat troll.",
    habitat: ["Deep lakes and Great Lakes", "Spring shallows after ice-out", "Shoals and humps"],
    seasonalPattern: {
      spring: "Shallow enough for spoons from shore or boat.",
      summer: "Typically 12–18 m and deeper; trolling or jigging.",
      fall: "Return to shallower structure.",
      winter: "A major ice fishery on many lakes.",
    },
    baits: [
      { name: "Spoon", kind: "artificial", sizes: "medium to large", technique: "Cast shallows in spring or troll deeper later.", seasons: ["spring", "summer", "fall"] },
      { name: "Jigging spoon", kind: "artificial", technique: "Vertical jig over structure.", seasons: ["summer", "winter"] },
    ],
    gear: { power: "Medium to medium-heavy; trolling setups for summer", line: "10–15 lb" },
    handling: "Lake trout have fragile jaws. Support the body and avoid long air exposure.",
    source,
  },
  {
    id: "rainbow-trout",
    name: "Rainbow trout",
    aliases: ["steelhead", "stocked trout"],
    summary: "Stocked pond rainbows and migratory steelhead are different fisheries. Tributary steelhead need exact section rules.",
    habitat: ["Stocked ponds and conservation lakes", "Great Lakes tributaries", "River mouths"],
    seasonalPattern: {
      spring: "Steelhead in tributaries; stocked ponds after ice-out.",
      summer: "Ponds and cold lake shorelines.",
      fall: "Another tributary run on many Lake Ontario streams.",
      winter: "Limited open or ice opportunities depending on waterbody.",
    },
    baits: [
      { name: "Small spoon or spinner", kind: "artificial", technique: "Cast across current or along pond shore.", seasons: ["spring", "summer", "fall"] },
      { name: "Worm under a float", kind: "natural", technique: "Stocked ponds where worms are allowed.", seasons: ["spring", "summer"] },
      { name: "Bead or nymph", kind: "artificial", technique: "Tributary steelhead where legal.", seasons: ["spring", "fall"] },
    ],
    gear: { power: "Medium spinning", line: "6–10 lb" },
    handling: "Keep steelhead in the water as much as possible. Check tributary hook, bait, and sanctuary rules first.",
    source,
  },
  {
    id: "brown-trout",
    name: "Brown trout",
    aliases: ["german brown"],
    summary: "A wary trout of rivers and Great Lakes shore. Fly and spinning both work; exact tributary rules matter.",
    habitat: ["Rivers with cover and current", "Great Lakes shore and mouths", "Stocked sections"],
    seasonalPattern: {
      spring: "River and shore bite as water warms.",
      summer: "Dawn, dusk, and fly hatches.",
      fall: "Spawning movements; many waters have extra restrictions.",
      winter: "Limited; verify open seasons.",
    },
    baits: [
      { name: "Small crankbait or spoon", kind: "artificial", technique: "Cast to cover and current seams.", seasons: ["spring", "fall"] },
      { name: "Dry fly or nymph", kind: "artificial", technique: "Match local hatches on rivers such as the Grand.", seasons: ["spring", "summer"] },
    ],
    gear: { power: "Light to medium spinning or fly", line: "6–8 lb" },
    handling: "Photograph quickly and revive in current. Brown trout are easily stressed in warm water.",
    source,
  },
  {
    id: "pacific-salmon",
    name: "Pacific salmon",
    aliases: ["chinook", "coho", "pink salmon", "chinook salmon", "king salmon"],
    summary: "Great Lakes salmon are a seasonal shore fishery at river mouths and a boat fishery offshore. Tributary rules are strict.",
    habitat: ["Lake Ontario and Huron shore", "River mouths in late summer and fall", "Tributary runs"],
    seasonalPattern: {
      spring: "Nearshore and river mouths on some waters.",
      summer: "Offshore trolling for most anglers.",
      fall: "Peak shore and tributary fishery.",
      winter: "Generally not a shore target.",
    },
    baits: [
      { name: "Spoon", kind: "artificial", sizes: "3/8 oz and up", technique: "Cast from piers and mouths; troll offshore.", seasons: ["summer", "fall"] },
      { name: "Spinner", kind: "artificial", technique: "Swing in tributary current where legal.", seasons: ["fall"] },
      { name: "Roe-imitation bead", kind: "artificial", technique: "Only where beads and similar methods are legal.", seasons: ["fall"] },
    ],
    gear: { power: "Medium spinning; heavier for kings", line: "10–15 lb" },
    handling: "Kings are powerful. Use a net if legal, keep them wet, and never block the entire stream.",
    source,
  },
  {
    id: "muskellunge",
    name: "Muskellunge",
    aliases: ["muskie"],
    summary: "A trophy fish that needs heavy tackle, large baits, and careful release. A 6'6\" medium spinning combo is not a muskie outfit.",
    habitat: ["Weedy bays and cabbage", "Rock-to-weed transitions", "Large lakes and rivers"],
    seasonalPattern: {
      spring: "Shallow after close times end; often closed early.",
      summer: "Weed edges and over cabbage.",
      fall: "Prime trophy window with large baits.",
      winter: "Generally not targeted through ice in this planner.",
    },
    baits: [
      { name: "Bucktail spinner", kind: "artificial", sizes: "large", technique: "Figure-eight at boatside after a long retrieve.", seasons: ["summer", "fall"] },
      { name: "Large jerkbait or rubber", kind: "artificial", technique: "Cover water; dedicated heavy gear required.", seasons: ["fall"] },
    ],
    gear: { power: "Heavy baitcasting, 8–10 ft", line: "80–100 lb braid", leader: "Fluoro or steel muskie leader" },
    handling: "Use a large net, cutters, and two people. Keep the fish horizontal and in the water. Many waters are catch-and-release.",
    source,
  },
  {
    id: "lake-whitefish",
    name: "Lake whitefish",
    aliases: ["whitefish"],
    summary: "A cold-water school fish popular through the ice and in Great Lakes shallows during cold months.",
    habitat: ["Deep cold lakes", "Shoals in late fall", "Ice basins"],
    seasonalPattern: {
      spring: "Some shallow movement after ice-out.",
      summer: "Deep; boat jigging.",
      fall: "Shoals and points.",
      winter: "Prime ice target.",
    },
    baits: [
      { name: "Small jigging spoon", kind: "artificial", technique: "Short hops over remaining schools.", seasons: ["fall", "winter"] },
      { name: "Minnow or maggot", kind: "natural", technique: "Ice fishing where bait is legal.", seasons: ["winter"], liveBaitWarning: true },
    ],
    gear: { power: "Light to medium spinning or ice rod", line: "4–8 lb" },
    handling: "Soft-mouthed. Use a small hook and support the body.",
    source,
  },
  {
    id: "carp",
    name: "Carp",
    aliases: ["common carp"],
    summary: "A strong urban shore fish. Corn and dough work where bait is allowed; keep drag loose and check local rules.",
    habitat: ["Harbours, lagoons, and slow rivers", "Warm shallows", "Urban parks"],
    seasonalPattern: {
      spring: "Shallow as water warms.",
      summer: "All-day opportunity in harbours.",
      fall: "Still active in remaining warm water.",
      winter: "Much slower.",
    },
    baits: [
      { name: "Corn or dough", kind: "natural", sizes: "size 4–8 strong hook", rig: "Sliding sinker", technique: "Hair-rig or simple bottom rig where bait is allowed.", seasons: ["spring", "summer", "fall"] },
      { name: "Boilie-style bait", kind: "natural", technique: "Same bottom-rig approach in permitted waters.", seasons: ["summer"] },
    ],
    gear: { power: "Medium spinning", line: "12–15 lb" },
    handling: "Never drag carp on gravel. Use a wet unhooking mat or keep them in the water. Do not use banned methods.",
    source,
  },
  {
    id: "channel-catfish",
    name: "Channel catfish",
    aliases: ["catfish", "cats"],
    summary: "A night-friendly bottom fish in rivers and lower Great Lakes connected waters. Simple bait rigs work when legal.",
    habitat: ["Deep river holes", "Current seams", "Harbours and warm bays"],
    seasonalPattern: {
      spring: "As water warms in rivers.",
      summer: "Night bite on bottom rigs.",
      fall: "Still active until water cools.",
      winter: "Slow; not a primary target.",
    },
    baits: [
      { name: "Worm or cut bait", kind: "natural", sizes: "size 2–1/0", rig: "Bottom rig with enough weight", technique: "Fish the bottom in current where bait is legal.", seasons: ["spring", "summer", "fall"], liveBaitWarning: true },
      { name: "Stink or dough bait", kind: "natural", technique: "Same bottom presentation in permitted waters.", seasons: ["summer"] },
    ],
    gear: { power: "Medium spinning", line: "12–20 lb" },
    handling: "Watch the spines. Support the belly and keep fingers away from the dorsal and pectoral spines.",
    source,
  },
  {
    id: "rock-bass",
    name: "Rock bass",
    aliases: ["redeye", "goggle-eye"],
    summary: "A chunky sunfish of rocky shorelines, docks, and weed edges. Small jigs and worms catch them from shore.",
    habitat: ["Rocky points and riprap", "Docks and timber", "Weed edges near shore"],
    seasonalPattern: {
      spring: "Shallow rock as the water warms.",
      summer: "Shade, docks, and the first drop.",
      fall: "Still near shore until the water cools.",
      winter: "Slow; not a main ice target.",
    },
    baits: [
      { name: "Small jig", kind: "artificial", sizes: "1/16 oz", technique: "Hop along rock and dock pilings.", seasons: ["spring", "summer", "fall"] },
      { name: "Worm", kind: "natural", sizes: "size 6–8 hook", rig: "Float or split shot", technique: "Where bait is legal, a worm under a float is enough.", seasons: ["spring", "summer"], liveBaitWarning: true },
    ],
    gear: { power: "Light spinning", line: "4–8 lb" },
    handling: "The spiny dorsal fin pokes. Wet hands, support the body, and unhook with pliers.",
    source,
  },
  {
    id: "pumpkinseed",
    name: "Pumpkinseed",
    aliases: ["pumpkinseed sunfish"],
    summary: "The common colourful sunfish of weedy bays and harbours. A light rod and a small bait or jig is the whole setup.",
    habitat: ["Weedy bays and harbours", "Docks and lily edges", "Shallow warm water"],
    seasonalPattern: {
      spring: "Shallow weeds and spawning beds.",
      summer: "Shade and weed edges through the day.",
      fall: "Remaining weeds until the water cools.",
      winter: "Occasional through the ice in shallow basins.",
    },
    baits: [
      { name: "Tiny jig or grub", kind: "artificial", sizes: "1/32–1/16 oz", technique: "Short hops under a float.", seasons: ["spring", "summer", "fall"] },
      { name: "Worm piece", kind: "natural", sizes: "size 8–10 hook", technique: "Where bait is legal.", seasons: ["spring", "summer"], liveBaitWarning: true },
    ],
    gear: { power: "Light spinning", line: "4–6 lb" },
    handling: "Soft mouths and sharp spines. Keep them wet and unhook gently.",
    source,
  },
  {
    id: "bluegill",
    name: "Bluegill",
    aliases: ["bream"],
    summary: "A schooling sunfish that holds in weeds, timber, and harbours. Fish them small: oversized bass lures are ignored.",
    habitat: ["Weed beds and timber", "Harbours and quiet bays", "Shade under docks"],
    seasonalPattern: {
      spring: "Shallow beds when the water is warm.",
      summer: "Weed edges and shade.",
      fall: "Schools tighten around remaining cover.",
      winter: "A light ice target on some southern lakes.",
    },
    baits: [
      { name: "Small jig", kind: "artificial", sizes: "1/32–1/16 oz", technique: "Dead-stick or twitch beside weeds.", seasons: ["spring", "summer", "fall", "winter"] },
      { name: "Worm piece", kind: "natural", sizes: "size 8–10 hook", rig: "Float", technique: "Where bait is legal.", seasons: ["spring", "summer"], liveBaitWarning: true },
    ],
    gear: { power: "Light spinning", line: "4–6 lb" },
    handling: "Support the body. The dorsal spines are sharp and the mouth is small.",
    source,
  },
];

const byId = new Map(commonSpecies.map((species) => [species.id, species]));

export function getSpeciesById(id: string) {
  const found = byId.get(id) ?? matchSpecies(id.replaceAll("-", " "));
  if (!found) return undefined;
  const image = getSpeciesImage(found.id);
  return image ? { ...found, image } : found;
}

export function matchSpecies(label: string) {
  const needle = label.toLowerCase();
  return commonSpecies.find(
    (species) =>
      needle.includes(species.name.toLowerCase()) ||
      species.aliases.some((alias) => needle.includes(alias.toLowerCase())) ||
      species.name.toLowerCase().includes(needle),
  );
}
