import { defaultOutfit } from "@/lib/gear/default-outfit";
import { gearOutfitSchema, userGearStateSchema } from "@/lib/gear/schemas";
import type { GearOutfit, UserGearState } from "@/lib/gear/types";

export const GEAR_STORAGE_KEY = "ontario-fishing-tool:gear:v1";

export const GEAR_UPDATED_EVENT = "fishing-gear-updated";

function seedState(): UserGearState {
  return {
    version: 1,
    outfits: [defaultOutfit],
    defaultOutfitId: defaultOutfit.id,
  };
}

function sanitizeOutfit(raw: unknown): GearOutfit | null {
  const parsed = gearOutfitSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export function migrateGearState(raw: unknown): UserGearState {
  if (!raw || typeof raw !== "object") return seedState();

  const candidate = raw as Partial<UserGearState>;
  if (candidate.version === 1 && Array.isArray(candidate.outfits)) {
    const outfits = candidate.outfits.map(sanitizeOutfit).filter(Boolean) as GearOutfit[];
    if (!outfits.length) return seedState();
    const defaultOutfitId =
      outfits.some((outfit) => outfit.id === candidate.defaultOutfitId)
        ? candidate.defaultOutfitId!
        : outfits.find((outfit) => outfit.isDefault)?.id ?? outfits[0].id;
    const normalized = outfits.map((outfit) => ({
      ...outfit,
      isDefault: outfit.id === defaultOutfitId,
    }));
    const state = { version: 1 as const, outfits: normalized, defaultOutfitId };
    const validated = userGearStateSchema.safeParse(state);
    return validated.success ? validated.data : seedState();
  }

  return seedState();
}

export function readGearState(): UserGearState {
  if (typeof window === "undefined") return seedState();
  try {
    const raw = window.localStorage.getItem(GEAR_STORAGE_KEY);
    if (!raw) return seedState();
    return migrateGearState(JSON.parse(raw));
  } catch {
    return seedState();
  }
}

export function writeGearState(state: UserGearState) {
  const validated = userGearStateSchema.parse(state);
  window.localStorage.setItem(GEAR_STORAGE_KEY, JSON.stringify(validated));
  window.dispatchEvent(new Event(GEAR_UPDATED_EVENT));
}

export function listOutfits() {
  return readGearState().outfits;
}

export function getDefaultOutfitId() {
  return readGearState().defaultOutfitId;
}

export function upsertOutfit(outfit: GearOutfit) {
  const state = readGearState();
  const parsed = gearOutfitSchema.parse(outfit);
  const index = state.outfits.findIndex((item) => item.id === parsed.id);
  const outfits = [...state.outfits];
  if (index >= 0) outfits[index] = parsed;
  else outfits.unshift(parsed);
  writeGearState({ ...state, outfits });
}

export function deleteOutfit(id: string) {
  const state = readGearState();
  if (state.outfits.length <= 1) return;
  const outfits = state.outfits.filter((outfit) => outfit.id !== id);
  const defaultOutfitId =
    state.defaultOutfitId === id
      ? outfits[0]?.id ?? defaultOutfit.id
      : state.defaultOutfitId;
  writeGearState({
    version: 1,
    outfits: outfits.map((outfit) => ({ ...outfit, isDefault: outfit.id === defaultOutfitId })),
    defaultOutfitId,
  });
}

export function setDefaultOutfit(id: string) {
  const state = readGearState();
  if (!state.outfits.some((outfit) => outfit.id === id)) return;
  writeGearState({
    version: 1,
    defaultOutfitId: id,
    outfits: state.outfits.map((outfit) => ({ ...outfit, isDefault: outfit.id === id })),
  });
}

export function buildTripChecklist(outfit: GearOutfit, speciesName?: string) {
  const base = {
    "Outdoors Card and official Licence Summary PDF": false,
    "Verified exact waterbody and FMZ in Fish ON-Line": false,
    "Checked species season, limit, size, and exceptions": false,
    "Checked weather, wind, waves, and daylight": false,
    "Packed PFD for exposed water, boat, or kayak": false,
    [`Packed line and leader for ${outfit.name}`]: false,
    "Packed appropriate hooks, bait, and lures": false,
    "Checked parking, fees, hours, and posted access signs": false,
    "Checked bait-management and invasive-species rules": false,
  };
  if (speciesName) {
    return {
      ...base,
      [`Confirmed outfit fit for ${speciesName}`]: false,
    };
  }
  return base;
}
