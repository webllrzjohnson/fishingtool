/**
 * Town-centre geocodes put the pin inland. These well-known harbours are pinned
 * on the water people actually fish, so Port Hope lands on the marina rather than
 * the downtown block 12 km inland.
 */
export type KnownPlace = {
  aliases: readonly string[];
  label: string;
  detail: string;
  latitude: number;
  longitude: number;
};

export const KNOWN_FISHING_PLACES: readonly KnownPlace[] = [
  {
    aliases: ["port dalhousie", "portdalhousie", "dalhousie"],
    label: "Port Dalhousie",
    detail: "Harbour and piers, St. Catharines · Lake Ontario",
    latitude: 43.20011,
    longitude: -79.26629,
  },
  {
    aliases: ["port hope", "porthope"],
    label: "Port Hope",
    detail: "Marina and harbour · Lake Ontario",
    // Official Ontario access point "Port Hope Marina", not the town centroid.
    latitude: 43.94438,
    longitude: -78.29113,
  },
  {
    aliases: ["port dover"],
    label: "Port Dover",
    detail: "Harbour and pier · Lake Erie",
    latitude: 42.7856,
    longitude: -80.198,
  },
];

/** "porthope" and "portDalhousie" should still match the harbour people mean. */
export function normalizePlaceQuery(query: string) {
  return query
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\bport([a-z])/gi, "Port $1");
}

export function matchKnownPlaces(query: string): KnownPlace[] {
  const needle = normalizePlaceQuery(query).toLowerCase();
  if (needle.length < 3) return [];
  return KNOWN_FISHING_PLACES.filter((place) =>
    place.aliases.some((alias) => alias.includes(needle) || needle.includes(alias)),
  );
}
