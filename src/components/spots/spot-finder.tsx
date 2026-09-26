"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AsyncState } from "@/components/ui/async-state";
import { Callout, SectionCard } from "@/components/ui/card";
import { ButtonLink, TextLink } from "@/components/ui/button";
import { WeatherPanel } from "@/components/planner/weather-panel";
import { SpotSearch } from "@/components/spots/spot-search";
import { SpotSuggest, type SuggestShareState } from "@/components/spots/spot-suggest";
import { SpotMap } from "@/components/spots/spot-map";
import { GettingThere } from "@/components/spots/getting-there";
import { AccessSection, FishSection } from "@/components/spots/spot-sections";
import { SaveSpotTrip } from "@/components/spots/save-spot-trip";
import { withAccessPointLocation } from "@/lib/access-points";
import type { SpotDetail } from "@/lib/spots/detail";
import type { SpotSuggestion } from "@/lib/spots/search";

export function SpotFinder({
  initialSpot,
  initialSuggest,
}: {
  initialSpot?: SpotDetail;
  initialSuggest?: SuggestShareState;
}) {
  const router = useRouter();
  const [detail, setDetail] = useState<SpotDetail | undefined>(initialSpot);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [selectedAccessId, setSelectedAccessId] = useState<string>();
  const [finderMode, setFinderMode] = useState<"search" | "suggest">(initialSuggest ? "suggest" : "search");

  const load = useCallback(async (url: string, signal?: AbortSignal) => {
    setPending(true);
    setError("");
    try {
      const response = await fetch(url, { signal });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Could not load that spot.");
      setDetail(body as SpotDetail);
      setSelectedAccessId(undefined);
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      setError(reason instanceof Error ? reason.message : "Could not load that spot.");
    } finally {
      setPending(false);
    }
  }, []);

  const pick = useCallback(
    (suggestion: SpotSuggestion) => {
      const params = new URLSearchParams();
      if (suggestion.latitude !== undefined && suggestion.longitude !== undefined) {
        params.set("name", suggestion.label);
        params.set("lat", suggestion.latitude.toFixed(5));
        params.set("lon", suggestion.longitude.toFixed(5));
      } else if (suggestion.waterbodyLid) {
        params.set("lid", suggestion.waterbodyLid);
      } else {
        return;
      }
      router.replace(`/?${params}`, { scroll: false });
      void load(`/api/spots/detail?${params}`);
    },
    [load, router],
  );

  const shareSuggest = useCallback((state: SuggestShareState | null) => {
    const params = new URLSearchParams(window.location.search);
    if (!state) {
      for (const key of ["suggest", "olat", "olon", "oname", "mode", "range", "species"]) {
        params.delete(key);
      }
    } else {
      params.set("suggest", "1");
      params.set("olat", state.origin.coordinates.latitude.toFixed(5));
      params.set("olon", state.origin.coordinates.longitude.toFixed(5));
      params.set("oname", state.origin.label);
      params.set("mode", state.mode);
      params.set("range", String(state.range));
      if (state.species) params.set("species", state.species);
      else params.delete("species");
    }
    const next = params.toString();
    const current = window.location.search.replace(/^\?/, "");
    if (next === current) return;
    router.replace(next ? `/?${next}` : "/", { scroll: false });
  }, [router]);

  const accessPoints = useMemo(
    () =>
      detail
        ? withAccessPointLocation(
            { latitude: detail.latitude, longitude: detail.longitude },
            detail.accessPoints,
          )
        : [],
    [detail],
  );

  const coordinates = useMemo(
    () => (detail ? { latitude: detail.latitude, longitude: detail.longitude } : undefined),
    [detail],
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setFinderMode("search")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-black ${
            finderMode === "search" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
          }`}
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => setFinderMode("suggest")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-black ${
            finderMode === "suggest" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
          }`}
        >
          Suggest
        </button>
      </div>

      {finderMode === "search" ? (
        <SpotSearch onPick={pick} autoFocus={!initialSpot} />
      ) : (
        <SpotSuggest onPick={pick} initial={initialSuggest} onShare={shareSuggest} />
      )}

      {pending ? <AsyncState loading loadingMessage="Finding the water, access, and fish…" /> : null}
      {error && !pending ? <AsyncState error={error} /> : null}

      {detail && !pending ? (
        <>
          <div>
            <h2 className="text-2xl font-black tracking-tight">{detail.name}</h2>
            {detail.water ? (
              <p className="mt-1 text-sm text-slate-600">
                {detail.water.officialName}
                {detail.water.municipality ? ` · ${detail.water.municipality}` : ""}
                {" · "}
                {detail.water.fmz.replace("fmz-", "FMZ ")}
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-600">
                No official waterbody record sits on this pin. Fish details below may be empty.
              </p>
            )}
          </div>

          <SpotMap
            spot={{ latitude: detail.latitude, longitude: detail.longitude }}
            spotName={detail.name}
            accessPoints={accessPoints}
            selectedAccessId={selectedAccessId}
            onSelectAccess={setSelectedAccessId}
          />

          <GettingThere
            spot={{ latitude: detail.latitude, longitude: detail.longitude }}
            spotName={detail.name}
          />

          <AccessSection
            points={accessPoints}
            selectedId={selectedAccessId}
            onSelect={setSelectedAccessId}
          />

          <FishSection
            species={detail.species}
            stocking={detail.stocking}
            fmz={detail.water?.fmz}
            baitZone={detail.water?.baitManagementZone}
          />

          <SectionCard title="Conditions and rules">
            <WeatherPanel coordinates={coordinates} />
            <div className="mt-4 flex flex-wrap gap-2">
              <ButtonLink
                href={detail.water ? `/rules?fmz=${detail.water.fmz}` : "/rules"}
                variant="primary"
              >
                Check the rules
              </ButtonLink>
              {detail.water ? (
                <ButtonLink href={detail.water.fmzRegulationUrl} external variant="secondary">
                  Official zone summary
                </ButtonLink>
              ) : null}
            </div>
          </SectionCard>

          <SaveSpotTrip spot={detail} />

          {detail.unavailable.length > 0 ? (
            <Callout tone="amber">
              Some Ontario services did not answer: {detail.unavailable.join(", ")}. Reload to try
              again.
            </Callout>
          ) : null}

          <p className="text-xs text-slate-500">
            Confirm seasons, limits, and access against the{" "}
            <TextLink
              href="https://www.ontario.ca/document/ontario-fishing-regulations-summary"
              external
              size="xs"
            >
              Ontario Fishing Regulations Summary
            </TextLink>{" "}
            before you fish.
          </p>
        </>
      ) : null}

      {!detail && !pending && !error ? (
        <p className="text-sm leading-6 text-slate-600">
          Try <strong>Port Dalhousie</strong>, <strong>Port Hope</strong>, or{" "}
          <strong>Lake Simcoe</strong>. You will get the map, driving directions, official access
          points, and the fish on record.
        </p>
      ) : null}
    </div>
  );
}
