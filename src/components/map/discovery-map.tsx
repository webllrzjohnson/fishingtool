"use client";

import Map, { Marker, NavigationControl, Popup } from "react-map-gl/maplibre";
import { useState, useSyncExternalStore } from "react";
import type { FishingLocation } from "@/lib/types";

type Props = {
  locations: FishingLocation[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
};

const subscribe = () => () => {};

const openStreetMapStyle = {
  version: 8 as const,
  sources: {
    openstreetmap: {
      type: "raster" as const,
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "openstreetmap",
      type: "raster" as const,
      source: "openstreetmap",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export function DiscoveryMap({ locations, selectedId, onSelect, className = "h-[430px]" }: Props) {
  const [popupId, setPopupId] = useState<string | null>(null);
  const isClient = useSyncExternalStore(subscribe, () => true, () => false);
  const mappable = locations.filter((location) => location.coordinates);
  const popup = mappable.find((location) => location.id === popupId);
  const singleLocation = mappable.length === 1 ? mappable[0] : null;
  const initialViewState = singleLocation?.coordinates
    ? {
        longitude: singleLocation.coordinates.longitude,
        latitude: singleLocation.coordinates.latitude,
        zoom: 13,
      }
    : { longitude: -84.5, latitude: 48.2, zoom: 4.1 };

  if (!isClient) {
    return (
      <div className={`grid ${className} place-items-center rounded-2xl border border-slate-200 bg-sky-50 text-sm text-slate-500`}>
        Loading map…
      </div>
    );
  }

  return (
    <div className={`${className} overflow-hidden rounded-2xl border border-slate-200 bg-sky-50`}>
      <Map
        initialViewState={initialViewState}
        mapStyle={openStreetMapStyle}
        attributionControl={{ compact: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" />
        {mappable.map((location) => (
          <Marker
            key={location.id}
            longitude={location.coordinates!.longitude}
            latitude={location.coordinates!.latitude}
            anchor="bottom"
            onClick={(event) => {
              event.originalEvent.stopPropagation();
              setPopupId(location.id);
              onSelect?.(location.id);
            }}
          >
            <button
              type="button"
              aria-label={`Show ${location.name}`}
              className={`grid size-8 place-items-center rounded-full border-2 border-white text-sm font-black text-white shadow-md ${
                selectedId === location.id ? "bg-amber-600" : "bg-teal-800"
              }`}
            >
              ●
            </button>
          </Marker>
        ))}
        {popup?.coordinates ? (
          <Popup
            longitude={popup.coordinates.longitude}
            latitude={popup.coordinates.latitude}
            anchor="top"
            closeButton
            onClose={() => setPopupId(null)}
          >
            <div className="max-w-52 p-1 text-slate-900">
              <p className="font-bold">{popup.name}</p>
              <p className="text-xs text-slate-600">
                {popup.region} · {popup.fmz.toUpperCase()}
              </p>
              <a className="mt-2 inline-block text-xs font-bold text-teal-800 underline" href={`/locations/${popup.slug ?? popup.id}`}>
                View location
              </a>
            </div>
          </Popup>
        ) : null}
      </Map>
    </div>
  );
}
