"use client";

import React from "react";
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  ColorScheme,
  MapMouseEvent,
} from "@vis.gl/react-google-maps";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VolunteerEvent } from "@/types/ecovibe";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatCoordinates } from "@/lib/utils";

export const EVENT_CATEGORIES: Array<VolunteerEvent["category"]> = [
  "Community Clean-Up",
  "Tree Planting",
  "Waste",
  "Flooding & Drainage",
  "Broken Facility",
  "Road Hazard",
  "Other",
];

export const ILIGAN_LOCATION_PRESETS = [
  {
    label: "Tambo Baywalk, Centennial Park, Brgy. Santiago",
    lat: 8.2392,
    lng: 124.2368,
    district: "Barangay Santiago, Iligan City",
  },
  {
    label: "MSU-IIT Campus Gate 1, Andres Bonifacio Ave, Brgy. Tibanga",
    lat: 8.2414,
    lng: 124.2439,
    district: "Barangay Tibanga, Iligan City",
  },
  {
    label: "Pala-o Public Market Perimeter Rd, Brgy. Pala-o",
    lat: 8.2278,
    lng: 124.2489,
    district: "Barangay Pala-o, Iligan City",
  },
  {
    label: "Plaza Alemania, Quezon Ave, Brgy. Poblacion",
    lat: 8.2284,
    lng: 124.2376,
    district: "Barangay Poblacion, Iligan City",
  },
  {
    label: "Mandulog River Esplanade, Brgy. Hinaplanon",
    lat: 8.2535,
    lng: 124.2542,
    district: "Barangay Hinaplanon, Iligan City",
  },
  {
    label: "Roxas Ave Corner Zamora St, Brgy. Mahayahay",
    lat: 8.2239,
    lng: 124.2431,
    district: "Barangay Mahayahay, Iligan City",
  },
];

const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  "AIzaSyB2f963X-c4s5y9E-c4s5y9E-c4s5y9E";

const GOOGLE_MAPS_MAP_ID =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

export function LocationPickerMap({
  lat,
  lng,
  onChange,
}: LocationPickerMapProps) {
  const { resolvedScheme } = useColorScheme();
  const isDark = resolvedScheme === "dark";

  const handleMapClick = (event: MapMouseEvent) => {
    const pos = event.detail.latLng;
    if (pos) {
      onChange(
        Number(pos.lat.toFixed(6)),
        Number(pos.lng.toFixed(6))
      );
    }
  };

  const handleUseCurrentLocation = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange(
          Number(position.coords.latitude.toFixed(6)),
          Number(position.coords.longitude.toFixed(6))
        );
      },
      () => {
        // Ignore if denied
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  return (
    <div className="overflow-hidden rounded-m3-md border border-m3-outline-variant bg-m3-surface-container-low">
      {/* Top Instruction Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-m3-outline-variant bg-m3-surface px-3.5 py-2.5 text-xs">
        <span className="flex items-center gap-1.5 font-medium text-m3-on-surface">
          <MapPin
            className="h-4 w-4 text-m3-primary-text shrink-0"
            aria-hidden="true"
          />
          <span>Click anywhere on the map or drag the pin to set location</span>
        </span>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleUseCurrentLocation}
          className="h-7 px-3 text-xs"
        >
          <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Use my location</span>
        </Button>
      </div>

      {/* Explicit Height Container per Google Maps Platform CF2 */}
      <div className="relative h-[320px] w-full">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            defaultCenter={{ lat, lng }}
            defaultZoom={15}
            mapId={GOOGLE_MAPS_MAP_ID}
            colorScheme={isDark ? ColorScheme.DARK : ColorScheme.LIGHT}
            gestureHandling="greedy"
            disableDefaultUI={false}
            onClick={handleMapClick}
            internalUsageAttributionIds={["gmp_git_agentskills_v1"]}
            style={{ width: "100%", height: "100%" }}
          >
            <AdvancedMarker
              position={{ lat, lng }}
              draggable={true}
              onDragEnd={(e) => {
                if (e.latLng) {
                  onChange(
                    Number(e.latLng.lat().toFixed(6)),
                    Number(e.latLng.lng().toFixed(6))
                  );
                }
              }}
              title="Pinned event location (Drag to adjust)"
            >
              <div className="flex flex-col items-center cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-1.5 rounded-m3-full bg-m3-primary px-3 py-1.5 text-xs font-medium text-m3-on-primary shadow-m3-2 ring-2 ring-white">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Pinned spot</span>
                </div>
                <svg
                  width="16"
                  height="9"
                  viewBox="0 0 16 9"
                  fill="none"
                  aria-hidden="true"
                  className="-mt-[1px] drop-shadow-xs"
                >
                  <path
                    d="M1.5 0L8 7.5L14.5 0H1.5Z"
                    className="fill-m3-primary stroke-white"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </AdvancedMarker>
          </GoogleMap>
        </APIProvider>
      </div>

      {/* Coordinates Footer Bar */}
      <div className="flex items-center justify-between border-t border-m3-outline-variant bg-m3-surface px-3.5 py-2 text-xs text-m3-on-surface-variant">
        <span>Pinned coordinates:</span>
        <span className="font-mono font-medium text-m3-on-surface">
          {formatCoordinates(lat, lng)}
        </span>
      </div>
    </div>
  );
}
