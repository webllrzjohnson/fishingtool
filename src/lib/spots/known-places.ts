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
  {
    aliases: ["port credit"],
    label: "Port Credit",
    detail: "Marina and Lake Ontario shore · Mississauga",
    latitude: 43.5497,
    longitude: -79.5847,
  },
  {
    aliases: ["bronte", "bronte harbour", "bronte harbor"],
    label: "Bronte Harbour",
    detail: "Harbour and pier · Oakville",
    latitude: 43.3922,
    longitude: -79.7111,
  },
  {
    aliases: ["whitby harbour", "whitby harbor", "whitby waterfront"],
    label: "Whitby Harbour",
    detail: "Marina and pier · Lake Ontario",
    latitude: 43.858,
    longitude: -78.936,
  },
  {
    aliases: ["cobourg", "cobourg harbour", "cobourg harbor"],
    label: "Cobourg Harbour",
    detail: "Marina and pier · Lake Ontario",
    latitude: 43.9592,
    longitude: -78.1675,
  },
  {
    aliases: ["kingston waterfront", "confederation basin", "kingston harbour"],
    label: "Kingston Waterfront",
    detail: "Confederation Basin · Lake Ontario",
    latitude: 44.2307,
    longitude: -76.481,
  },
  {
    aliases: ["niagara on the lake", "niagara-on-the-lake", "notl"],
    label: "Niagara-on-the-Lake",
    detail: "Harbour and Niagara River mouth",
    latitude: 43.2557,
    longitude: -79.0712,
  },
  {
    aliases: ["port burwell"],
    label: "Port Burwell",
    detail: "Harbour launch · Lake Erie",
    latitude: 42.65154,
    longitude: -80.80906,
  },
  {
    aliases: ["port colborne"],
    label: "Port Colborne",
    detail: "Boat launch · Lake Erie",
    latitude: 42.88003,
    longitude: -79.2549,
  },
  {
    aliases: ["oshawa", "oshawa harbour", "oshawa harbor", "port oshawa"],
    label: "Port Oshawa",
    detail: "Marina · Lake Ontario",
    latitude: 43.86819,
    longitude: -78.82768,
  },
  {
    aliases: ["port darlington", "bowmanville"],
    label: "Port Darlington",
    detail: "Public launch · Bowmanville, Lake Ontario",
    latitude: 43.89378,
    longitude: -78.66947,
  },
  {
    aliases: ["newcastle", "port of newcastle", "bond head"],
    label: "Port of Newcastle",
    detail: "Harbour · Lake Ontario",
    latitude: 43.89667,
    longitude: -78.57869,
  },
  {
    aliases: ["brighton"],
    label: "Brighton",
    detail: "Ontario Street docks · Lake Ontario",
    latitude: 44.01472,
    longitude: -77.73523,
  },
  {
    aliases: ["wellington", "wellington beach"],
    label: "Wellington",
    detail: "Beach launch · Prince Edward County",
    latitude: 43.95043,
    longitude: -77.33832,
  },
  {
    aliases: ["picton", "port picton"],
    label: "Picton",
    detail: "Port Picton Marina · Prince Edward County",
    latitude: 44.01046,
    longitude: -77.13516,
  },
  {
    aliases: ["trenton"],
    label: "Trenton",
    detail: "Ontario Street launch · Bay of Quinte",
    latitude: 44.10188,
    longitude: -77.57005,
  },
  {
    aliases: ["belleville"],
    label: "Belleville",
    detail: "Jane Forrester Park · Bay of Quinte",
    latitude: 44.15617,
    longitude: -77.37383,
  },
  {
    aliases: ["gananoque"],
    label: "Gananoque",
    detail: "Waterfront launch · St. Lawrence River",
    latitude: 44.32375,
    longitude: -76.16342,
  },
  {
    aliases: ["brockville"],
    label: "Brockville",
    detail: "Waterfront launch · St. Lawrence River",
    latitude: 44.58499,
    longitude: -75.68698,
  },
  {
    aliases: ["wasaga", "wasaga beach"],
    label: "Wasaga Beach",
    detail: "Provincial park launch · Georgian Bay",
    latitude: 44.53229,
    longitude: -80.0111,
  },
  {
    aliases: ["collingwood"],
    label: "Collingwood",
    detail: "Public harbour access · Georgian Bay",
    latitude: 44.50774,
    longitude: -80.20337,
  },
  {
    aliases: ["thornbury"],
    label: "Thornbury",
    detail: "Public access · Georgian Bay",
    latitude: 44.56864,
    longitude: -80.45628,
  },
  {
    aliases: ["meaford"],
    label: "Meaford",
    detail: "Public harbour access · Georgian Bay",
    latitude: 44.61179,
    longitude: -80.59318,
  },
  {
    aliases: ["owen sound"],
    label: "Owen Sound",
    detail: "Harbour launch · Georgian Bay",
    latitude: 44.57445,
    longitude: -80.94428,
  },
  {
    aliases: ["penetanguishene", "penetang"],
    label: "Penetanguishene",
    detail: "Public launch · Georgian Bay",
    latitude: 44.77513,
    longitude: -79.93803,
  },
  {
    aliases: ["parry sound"],
    label: "Parry Sound",
    detail: "Harbour boat ramp · Georgian Bay",
    latitude: 45.33585,
    longitude: -80.03108,
  },
  {
    aliases: ["tobermory"],
    label: "Tobermory",
    detail: "Little Tub area launch · Georgian Bay",
    latitude: 45.25672,
    longitude: -81.67759,
  },
  {
    aliases: ["wiarton"],
    label: "Wiarton",
    detail: "Harbour launch · Colpoys Bay",
    latitude: 44.74458,
    longitude: -81.13585,
  },
  {
    aliases: ["lions head", "lion's head", "lionshead"],
    label: "Lion's Head",
    detail: "Harbour launch · Georgian Bay",
    latitude: 44.99107,
    longitude: -81.25021,
  },
  {
    aliases: ["little current"],
    label: "Little Current",
    detail: "Harbour launch · Manitoulin Island",
    latitude: 45.97942,
    longitude: -81.91641,
  },
  {
    aliases: ["killarney"],
    label: "Killarney",
    detail: "Harbour launch · Georgian Bay",
    latitude: 45.97143,
    longitude: -81.51618,
  },
  {
    aliases: ["kincardine"],
    label: "Kincardine",
    detail: "Harbour launch · Lake Huron",
    latitude: 44.17602,
    longitude: -81.64056,
  },
  {
    aliases: ["southampton"],
    label: "Southampton",
    detail: "Harbour launch · Lake Huron",
    latitude: 44.50086,
    longitude: -81.36788,
  },
  {
    aliases: ["port elgin"],
    label: "Port Elgin",
    detail: "Harbour launch · Lake Huron",
    latitude: 44.44652,
    longitude: -81.40452,
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
