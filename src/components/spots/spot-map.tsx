"use client";

import Map, { Marker, NavigationControl, ScaleControl } from "react-map-gl/maplibre";
import { useMemo, useSyncExternalStore } from "react";
import { buildViewerStyle, defaultOverlayState, OVERLAYS } from "@/lib/map/ontario-map-layers";
import type { NearbyAccessPoint } from "@/lib/access-points";
import type { Coordinates } from "@/lib/types";

const subscribe = () => () => {};

function viewForMarkers(spot: Coordinates, accessPoints: NearbyAccessPoint[]) {
  const points = [spot, ...accessPoints.map((point) => point.coordinates)];
  const latitudes = points.map((point) => point.latitude);
  const longitudes = points.map((point) => point.longitude);
  const latitude = (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
  const longitude = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;
  const span = Math.max(
    Math.max(...latitudes) - Math.min(...latitudes),
    Math.max(...longitudes) - Math.min(...longitudes),
  );
  const zoom = span < 0.008 ? 14.5 : span < 0.02 ? 13.8 : span < 0.05 ? 12.8 : 11.8;
  return { latitude, longitude, zoom };
}

export function SpotMap({
  spot,
  spotName,
  accessPoints,
  selectedAccessId,
  onSelectAccess,
  className = "h-[26rem] sm:h-[32rem]",
}: {
  spot: Coordinates;
  spotName: string;
  accessPoints: NearbyAccessPoint[];
  selectedAccessId?: string;
  onSelectAccess?: (id: string) => void;
  className?: string;
}) {
  const isClient = useSyncExternalStore(subscribe, () => true, () => false);
  const view = useMemo(() => viewForMarkers(spot, accessPoints), [spot, accessPoints]);
  // Topographic tiles only. Extra overlays made the shoreline look like a second, offset map.
  const mapStyle = useMemo(() => {
    const overlays = defaultOverlayState();
    for (const overlay of OVERLAYS) overlays[overlay.id] = { visible: false, opacity: 1 };
    return buildViewerStyle("topographic", overlays);
  }, []);

  if (!isClient) {
    return (
      <div className={`grid ${className} place-items-center rounded-2xl border border-slate-200 bg-slate-100 text-sm text-slate-500`}>
        Loading map…
      </div>
    );
  }

  return (
    <div className={`${className} overflow-hidden rounded-2xl border border-slate-200`}>
      <Map
        key={`${spot.latitude},${spot.longitude},${accessPoints.length}`}
        initialViewState={view}
        mapStyle={mapStyle}
        attributionControl={{ compact: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" showCompass={false} />
        <ScaleControl position="bottom-left" unit="metric" />

        <Marker longitude={spot.longitude} latitude={spot.latitude} anchor="bottom">
          <span
            aria-label={spotName}
            title={spotName}
            className="block size-5 rounded-full border-[3px] border-white bg-teal-700 shadow-lg ring-2 ring-teal-900/40"
          />
        </Marker>

        {accessPoints.map((point, index) => (
          <Marker
            key={point.id}
            longitude={point.coordinates.longitude}
            latitude={point.coordinates.latitude}
            anchor="center"
            onClick={(event) => {
              event.originalEvent.stopPropagation();
              onSelectAccess?.(point.id);
            }}
          >
            <button
              type="button"
              aria-label={`Access point ${index + 1}: ${point.type}${
                point.evidence?.siteName ? ` ${point.evidence.siteName}` : ""
              }`}
              className={`grid size-6 place-items-center rounded-full border-2 border-white text-[11px] font-black text-white shadow-md ${
                selectedAccessId === point.id ? "bg-amber-600" : "bg-slate-700"
              }`}
            >
              {index + 1}
            </button>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
