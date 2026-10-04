import type { SpeciesProfile } from "@/lib/types";

export function searchSpecies(species: SpeciesProfile[], query: string): SpeciesProfile[] {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return species;
  return species.filter((fish) => {
    const haystack = [fish.name, ...fish.aliases, fish.distribution].join(" ").toLocaleLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}
