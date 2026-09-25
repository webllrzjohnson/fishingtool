import { fishOnlineUrl, officialRegulationUrl } from "@/lib/sources";

export const FMZ_NUMBERS = Array.from({ length: 20 }, (_, index) => index + 1) as readonly number[];

export const licenceFmzGuideLinks = {
  fishingLicence: "https://www.ontario.ca/page/fishing-licence-ontario-and-canadian-residents",
  limitsExplainer: "https://www.ontario.ca/page/fishing-limits-size-restrictions-and-catch-and-release",
  regulationsSummary: officialRegulationUrl,
  fishOnline: fishOnlineUrl,
} as const;
