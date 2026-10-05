// Kept as an explicit typed catalog so generated assets can fully replace
// credited photographs without weakening the photo fallback API.
type TacklePhoto = {
  file: string;
  subject: string;
  creator: string;
  license: string;
  licenseUrl: string;
  source: string;
};

export const tacklePhotos: Record<string, TacklePhoto> = {};

export function tacklePhoto(id: string) {
  const photo = tacklePhotos[id as keyof typeof tacklePhotos];
  return photo ? { ...photo, src: `/tackle/photos/${photo.file}`, sourceUrl: photo.source.startsWith("https://") ? photo.source : `https://commons.wikimedia.org/wiki/File:${photo.source}` } : undefined;
}
