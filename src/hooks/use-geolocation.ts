"use client";

import { useState, useCallback } from "react";
import { GeoCoordinates } from "@/types/ecovibe";

const LOCALIZED_HUB_LOCATIONS: GeoCoordinates[] = [
  {
    lat: 8.47721,
    lng: 124.64592,
    accuracyMeters: 6,
    addressLabel: "Cogon Market Perimeter Rd, District 2",
    district: "Poblacion - Cogon",
  },
  {
    lat: 8.4824,
    lng: 124.6472,
    accuracyMeters: 5,
    addressLabel: "Corrales Ave – Ramon Chavez Intersection",
    district: "Downtown Civic Core",
  },
  {
    lat: 8.4718,
    lng: 124.6362,
    accuracyMeters: 7,
    addressLabel: "Divisoria Golden Friendship Park Corridor",
    district: "Divisoria",
  },
  {
    lat: 8.48584,
    lng: 124.65641,
    accuracyMeters: 6,
    addressLabel: "CM Recto Highway Flyover East",
    district: "Lapasan",
  },
];

export function useGeolocation(initialCoords?: GeoCoordinates) {
  const [coordinates, setCoordinates] = useState<GeoCoordinates>(
    initialCoords || LOCALIZED_HUB_LOCATIONS[0]
  );
  const [isLocating, setIsLocating] = useState(false);
  const [geoStatus, setGeoStatus] = useState<string>("Ready to capture GPS");

  const captureGeolocation = useCallback(async (): Promise<GeoCoordinates> => {
    setIsLocating(true);
    setGeoStatus("Acquiring high-accuracy GPS lock...");

    return new Promise((resolve) => {
      if (typeof window !== "undefined" && "geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const captured: GeoCoordinates = {
              lat: Number(pos.coords.latitude.toFixed(5)),
              lng: Number(pos.coords.longitude.toFixed(5)),
              accuracyMeters: Math.round(pos.coords.accuracy || 8),
              addressLabel: "Verified Browser GPS Telemetry Lock",
              district: "Live Field Location",
            };
            setCoordinates(captured);
            setGeoStatus(`GPS locked (±${captured.accuracyMeters}m accuracy)`);
            setIsLocating(false);
            resolve(captured);
          },
          () => {
            // Graceful fallback when browser geolocation permission is denied or sandboxed
            const fallback =
              LOCALIZED_HUB_LOCATIONS[
                Math.floor(Math.random() * LOCALIZED_HUB_LOCATIONS.length)
              ];
            const jittered: GeoCoordinates = {
              ...fallback,
              lat: Number((fallback.lat + (Math.random() - 0.5) * 0.002).toFixed(5)),
              lng: Number((fallback.lng + (Math.random() - 0.5) * 0.002).toFixed(5)),
            };
            setCoordinates(jittered);
            setGeoStatus(`Simulated GPS beacon locked (${jittered.district})`);
            setIsLocating(false);
            resolve(jittered);
          },
          { enableHighAccuracy: true, timeout: 3500 }
        );
      } else {
        setTimeout(() => {
          const fallback = LOCALIZED_HUB_LOCATIONS[1];
          setCoordinates(fallback);
          setGeoStatus(`Simulated GPS beacon locked (${fallback.district})`);
          setIsLocating(false);
          resolve(fallback);
        }, 450);
      }
    });
  }, []);

  return {
    coordinates,
    setCoordinates,
    isLocating,
    geoStatus,
    captureGeolocation,
    presets: LOCALIZED_HUB_LOCATIONS,
  };
}
