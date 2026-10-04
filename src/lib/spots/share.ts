import type { SuggestShareState } from "@/components/spots/spot-suggest";

/** GPS coordinates are used for suggestions but never serialized to a page URL. */
export function suggestShareQuery(current: URLSearchParams, state: SuggestShareState | null) {
  const params = new URLSearchParams(current);
  for (const key of ["suggest", "olat", "olon", "oname", "mode", "range", "species"]) {
    params.delete(key);
  }
  if (state) {
    params.set("suggest", "1");
    if (state.origin.kind === "place") {
      params.set("olat", state.origin.coordinates.latitude.toFixed(5));
      params.set("olon", state.origin.coordinates.longitude.toFixed(5));
      params.set("oname", state.origin.label);
    }
    params.set("mode", state.mode);
    params.set("range", String(state.range));
    if (state.species) params.set("species", state.species);
  }
  return params;
}
