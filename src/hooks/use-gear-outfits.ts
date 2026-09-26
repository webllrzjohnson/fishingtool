"use client";

import { useCallback, useSyncExternalStore } from "react";
import { defaultOutfit } from "@/lib/gear/default-outfit";
import { resolveOutfit } from "@/lib/gear/resolve";
import {
  deleteOutfit,
  GEAR_UPDATED_EVENT,
  migrateGearState,
  readGearState,
  setDefaultOutfit,
  upsertOutfit,
  writeGearState,
} from "@/lib/gear/storage";
import type { GearOutfit, UserGearState } from "@/lib/gear/types";

const serverSnapshot: UserGearState = {
  version: 1,
  outfits: [defaultOutfit],
  defaultOutfitId: defaultOutfit.id,
};

let clientSnapshot: UserGearState = serverSnapshot;

function refreshSnapshot() {
  clientSnapshot = readGearState();
}

function subscribe(onStoreChange: () => void) {
  refreshSnapshot();
  const handler = () => {
    refreshSnapshot();
    onStoreChange();
  };
  window.addEventListener(GEAR_UPDATED_EVENT, handler);
  return () => window.removeEventListener(GEAR_UPDATED_EVENT, handler);
}

function getSnapshot() {
  return clientSnapshot;
}

function getServerSnapshot() {
  return serverSnapshot;
}

export function useGearOutfits() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const selected = useCallback(
    (outfitId?: string) => resolveOutfit(state.outfits, outfitId ?? state.defaultOutfitId),
    [state.defaultOutfitId, state.outfits],
  );

  const saveOutfit = useCallback((outfit: GearOutfit) => {
    upsertOutfit(outfit);
  }, []);

  const removeOutfit = useCallback((id: string) => {
    deleteOutfit(id);
  }, []);

  const makeDefault = useCallback((id: string) => {
    setDefaultOutfit(id);
  }, []);

  const reset = useCallback(() => {
    writeGearState(migrateGearState(null));
  }, []);

  return {
    outfits: state.outfits,
    defaultOutfitId: state.defaultOutfitId,
    defaultOutfit: selected(state.defaultOutfitId),
    selected,
    saveOutfit,
    removeOutfit,
    makeDefault,
    reset,
  };
}
