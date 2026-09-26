import type { SourceRecord } from "./types";

export const VERIFIED_ON = "2026-08-30";
export const RULE_YEAR = 2026;

export const fishOnlineUrl =
  "https://www.lioapplications.lrc.gov.on.ca/fishonline/Index.html?viewer=FishONLine.FishONLine&locale=en-CA";

export const officialRegulationUrl =
  "https://www.ontario.ca/document/ontario-fishing-regulations-summary";

export function fmzRegulationUrl(zone: number | string) {
  return `https://www.ontario.ca/document/ontario-fishing-regulations-summary/fisheries-management-zone-${String(zone).replace("fmz-", "")}`;
}

export const fishOnlineSource: SourceRecord = {
  name: "Ontario Fish ON-Line",
  url: fishOnlineUrl,
  lastVerified: VERIFIED_ON,
  kind: "official",
};

export const araSource: SourceRecord = {
  name: "Ontario Aquatic Resource Area polygon segment",
  url: "https://data.ontario.ca/dataset/aquatic-resource-area-polygon-segment",
  lastVerified: VERIFIED_ON,
  kind: "official",
};

export function fishOnlineWaterbodyUrl(waterbodyLid: string) {
  const params = new URLSearchParams({
    viewer: "FishONLine.FishONLine",
    locale: "en-CA",
    waterbody: waterbodyLid,
  });
  return `https://www.lioapplications.lrc.gov.on.ca/fishonline/Index.html?${params}`;
}

export const regulationsSource: SourceRecord = {
  name: "Ontario Fishing Regulations Summary",
  url: officialRegulationUrl,
  lastVerified: VERIFIED_ON,
  kind: "official",
};

export const destinationOntarioSource: SourceRecord = {
  name: "Destination Ontario fishing guide",
  url: "https://www.destinationontario.com/en-ca/articles/top-fishing-destinations-ontario",
  lastVerified: VERIFIED_ON,
  kind: "provincial-tourism",
};

export const baitManagementSource: SourceRecord = {
  name: "Ontario sustainable bait management",
  url: "https://www.ontario.ca/page/sustainable-bait-management-ontario",
  lastVerified: VERIFIED_ON,
  kind: "official",
};

export const eatingFishSource: SourceRecord = {
  name: "Guide to Eating Ontario Fish",
  url: "https://www.ontario.ca/page/guide-eating-ontario-fish",
  lastVerified: VERIFIED_ON,
  kind: "official",
};

export function isStale(lastVerified: string, maxAgeDays = 400) {
  const verified = Date.parse(`${lastVerified}T00:00:00Z`);
  if (Number.isNaN(verified)) return true;
  return Date.now() - verified > maxAgeDays * 24 * 60 * 60 * 1000;
}
