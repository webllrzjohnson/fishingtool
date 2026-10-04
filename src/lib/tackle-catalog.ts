import { guideForFamily, tackleFamilies, type TackleFamilyId } from "@/data/curated/tackle-reference";
import { tackleTargets } from "@/data/curated/tackle-targets";
import { commonSpecies } from "@/data/curated/species";

export const tackleCategories = [
  { id: "all", label: "All tackle" },
  { id: "soft", label: "Soft plastics & rigs" },
  { id: "lures", label: "Lures & spinners" },
  { id: "flies", label: "Flies & beads" },
  { id: "bait", label: "Natural & prepared bait" },
] as const;
export type TackleCategory = (typeof tackleCategories)[number]["id"];

const categoryIds: Record<Exclude<TackleCategory, "all">, readonly TackleFamilyId[]> = {
  soft: ["jig", "swimbait", "worm-plastic", "tube-ned", "ned", "drop-shot", "soft-rubber"],
  lures: ["crankbait", "jerkbait", "spoon", "jigging-spoon", "spinnerbait", "inline-spinner", "bucktail", "topwater"],
  flies: ["fly", "bead-nymph", "roe-bead", "dry-fly"],
  bait: ["maggot", "corn", "dough-bait", "boilie", "bottom-worm", "cut-bait", "stink-bait", "worm-float", "minnow-float", "worm-harness", "bottom-rig"],
};

// The full curator caption remains in the expanded details; these are scan-friendly card leads.
const shortSummaries: Partial<Record<TackleFamilyId, string>> = {
  "worm-plastic": "Weedless offset-hook worm, fished weightless or with a sliding weight.",
  "tube-ned": "Hollow tube on a jig head, hopped or dragged along bottom.",
  corn: "Natural corn kernels on a bottom bait hook.",
  boilie: "Boilie on a separate hair beside a bare bottom-rig hook.",
  "bottom-worm": "Real worm on a bottom hook below a sliding sinker.",
  "worm-float": "Worm suspended below a float on a single hook.",
  "bottom-rig": "Sliding-sinker bottom rig with a worm or separate corn alternative.",
};

export const tackleCatalog = tackleFamilies.map((family) => {
  const guide = guideForFamily(family.id);
  const research = tackleTargets[family.id];
  const targets = research.ids.map((id) => {
    const species = commonSpecies.find((item) => item.id === id);
    if (!species) throw new Error(`Unknown tackle target: ${family.id} → ${id}`);
    return { id: species.id, name: species.name };
  });
  const category = (Object.keys(categoryIds) as Exclude<TackleCategory, "all">[])
    .find((key) => categoryIds[key].includes(family.id));
  if (!category) throw new Error(`Uncategorized tackle family: ${family.id}`);
  return {
    ...family,
    category,
    summary: shortSummaries[family.id] ?? family.caption,
    sizes: guide.sizes,
    natural: guide.natural,
    targets,
    targetSources: research.sources,
    targetNote: research.note,
    examples: guide.examples.map(({ speciesId, speciesName, bait }) => ({
      speciesId, speciesName, technique: bait.technique,
    })),
  };
});

export function filterTackleCatalog<T extends (typeof tackleCatalog)[number]>(items: readonly T[], query: string, category: TackleCategory): T[] {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    const searchable = [item.title, item.caption, item.summary, ...item.sizes,
      ...item.targets.map((target) => target.name),
      ...item.examples.flatMap((example) => [example.speciesName, example.technique])].join(" ").toLocaleLowerCase();
    return words.every((word) => searchable.includes(word));
  });
}
