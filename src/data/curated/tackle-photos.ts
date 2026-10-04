// Locally hosted Commons photographs, checked against each source file page and image.
// Photos of unrigged bait illustrate the bait only, not the full rig in the guide.
export const tacklePhotos = {
  "reel-spinning": { file: "reel-spinning.jpg", subject: "Spinning reel without line", creator: "JaredMcKenzie", license: "CC0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/", source: "Spinning_fishing_reel_without_line.jpg" },
  "reel-baitcasting": { file: "reel-baitcasting.jpg", subject: "Shimano Corsair baitcasting reel", creator: "Mikko J. Putkonen", license: "CC0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/", source: "Shimano_Corsair_CS_400_fishing_reel_20200613_001.jpg" },
  "reel-spincast": { file: "reel-spincast.jpg", subject: "Abu Garcia closed-face spincast reel", creator: "Petey21", license: "CC0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/", source: "Abu_Garcia_Abumatic_spincast_reel.jpg" },
  "reel-fly": { file: "reel-fly.jpg", subject: "British Fly Reels fly reel", creator: "R. Henrik Nilsson", license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0/", source: "2000s_British_Fly_Reels_BFR_DragonFly_Large_Arbor_70_fly_fishing_reel.jpg" },
  "reel-centerpin": { file: "reel-centerpin.jpg", subject: "Adcock Stanton centerpin reel", creator: "Adcockstanton", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", source: "EARLY-MODEL-ADCOCK-STANTON-NOTTINGHAM-4-3-422-CENTRE-PIN-REEL-045_copy.jpg" },
  "reel-ice": { file: "reel-ice.jpg", subject: "Simple inline ice reel attached to a short ice-fishing rod beside an ice hole; spinning version not shown", creator: "m.prinke", license: "CC BY-SA 2.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/", source: "https://www.flickr.com/photos/mprinke/2361806912/" },
} as const;

export function tacklePhoto(id: string) {
  const photo = tacklePhotos[id as keyof typeof tacklePhotos];
  return photo ? { ...photo, src: `/tackle/photos/${photo.file}`, sourceUrl: photo.source.startsWith("https://") ? photo.source : `https://commons.wikimedia.org/wiki/File:${photo.source}` } : undefined;
}
