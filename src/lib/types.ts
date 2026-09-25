export type FmzId = `fmz-${number}`;
export type LicenceType = "sport" | "conservation";
export type AccessMode = "shore" | "pier" | "boat" | "kayak" | "ice" | "fly";
export type RuleStatus =
  | "open"
  | "closed"
  | "catch-and-release"
  | "exception-check-required"
  | "unknown";

export type WaterBodyType =
  | "lake-shore"
  | "bay-harbour"
  | "river-tributary"
  | "river-mouth"
  | "conservation-lake"
  | "marsh"
  | "large-lake"
  | "river"
  | "reservoir";

export type SourceRecord = {
  name: string;
  url: string;
  lastVerified: string;
  kind: "official" | "provincial-tourism" | "local-authority" | "curated";
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type SpeciesPresence = {
  speciesId: string;
  status: "observed" | "stocked" | "reported";
  confidence: "high" | "medium" | "low";
  lastObservationYear?: number;
  source: SourceRecord;
};

export type BaitOption = {
  name: string;
  kind: "natural" | "artificial";
  sizes?: string;
  rig?: string;
  technique: string;
  seasons: Array<"spring" | "summer" | "fall" | "winter">;
  liveBaitWarning?: boolean;
};

export type SpeciesImage = {
  alt: string;
  /** Preferred bundled asset under /public/species when present. */
  localSrc: string;
  remoteSrc: string;
  credit: string;
  license: "Public Domain";
  sourceUrl: string;
};

export type SpeciesProfile = {
  id: string;
  name: string;
  aliases: string[];
  image?: SpeciesImage;
  summary: string;
  habitat: string[];
  seasonalPattern: Record<"spring" | "summer" | "fall" | "winter", string>;
  baits: BaitOption[];
  gear: {
    power: string;
    line: string;
    leader?: string;
  };
  handling: string;
  source: SourceRecord;
};

export type WeekdayAnchor = {
  nth: number;
  weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  month: number;
  /** Shift the computed weekday, e.g. -1 for “Friday before”. */
  offsetDays?: number;
};

export type SeasonWindow = {
  start: string;
  end: string;
  mode?: "keep" | "catch-and-release";
  startAnchor?: WeekdayAnchor;
  endAnchor?: WeekdayAnchor;
};

export type SpeciesRule = {
  speciesId?: string;
  species: string;
  season: string;
  sportLimit: string;
  conservationLimit?: string;
  sizeNote?: string;
  openWindows?: SeasonWindow[];
  sourceYear?: number;
  combinedGroup?: string;
};

export type WaterbodyException = {
  id: string;
  locationId?: string;
  waterbody: string;
  fmz: FmzId;
  summary: string;
  effectiveDate: string;
  source: SourceRecord;
};

export type GearFit = {
  level: "good" | "workable" | "unsuitable";
  message: string;
};

export type TackleSuggestion = {
  target: string;
  setup: string;
};

export type FishingLocation = {
  id: string;
  slug?: string;
  name: string;
  region?: string;
  municipality?: string;
  bodyType: WaterBodyType;
  fmz: FmzId;
  baitManagementZone?: string;
  fmzNote?: string;
  coordinates?: Coordinates;
  accessModes?: AccessMode[];
  shoreSuitability?: "excellent" | "good" | "limited" | "boat-oriented";
  familyFriendly?: boolean;
  popularity?: "featured" | "popular" | "local";
  parking?: string;
  fees?: string;
  facilities?: string[];
  directionsUrl?: string;
  fishOnlineUrl?: string;
  expectedSpecies: string[];
  species?: SpeciesPresence[];
  beginnerTargets: string[];
  tackleNotes: string;
  accessNotes: string;
  baitRules: string;
  cautions: string[];
  sources?: SourceRecord[];
  ambiguousBoundary?: boolean;
  hasWaterbodyExceptions?: boolean;
  hours?: string;
};

export type RuleEvaluation = {
  speciesId: string;
  status: RuleStatus;
  label: string;
  reason: string;
  limit?: string;
  sizeNote?: string;
  exceptionIds?: string[];
  requiresOfficialCheck: boolean;
};

export type SavedGear = {
  id: string;
  name: string;
  power: "light" | "medium" | "medium-heavy" | "heavy";
  line: string;
  notes?: string;
};

export type TripPlan = {
  id: string;
  locationId: string;
  date: string;
  licenceType: LicenceType;
  targetSpeciesIds: string[];
  notes: string;
  checklist: Record<string, boolean>;
  createdAt: string;
  origin?: string;
  selectedGearId?: string;
};

export type WeatherHour = {
  time: string;
  temperature: number;
  precipitationProbability: number;
  windSpeed: number;
  windGust: number;
  windDirection: number;
  weatherCode: number;
};

export type WeatherForecast = {
  latitude: number;
  longitude: number;
  timezone: string;
  fetchedAt: string;
  sunrise: string[];
  sunset: string[];
  hours: WeatherHour[];
  attribution: { label: string; url: string };
};

export type AccessPoint = {
  id: string;
  type: string;
  coordinates: Coordinates;
  source: SourceRecord;
  evidence?: {
    siteName?: string;
    ownership?: string;
    parkingRecorded?: boolean;
    userFeeRecorded?: boolean;
    accessibilityRecorded?: boolean;
    surface?: string;
    verifiedDate?: string;
    photoUrl?: string;
    informationUrl?: string;
    officialRecordUrl?: string;
  };
};

export type FishingReport = {
  location: FishingLocation;
  fmzLabel: string;
  speciesForZone: SpeciesRule[];
  tackleForTargets: TackleSuggestion[];
  licenceReminders: string[];
  baitAndParkRules: string[];
  safetyCautions: string[];
  verifyBeforeKeeping: string[];
  officialSources: { label: string; url: string }[];
};
