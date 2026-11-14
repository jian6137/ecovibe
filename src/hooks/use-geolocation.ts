"use client";

import { useState, useCallback } from "react";
import { GeoCoordinates } from "@/types/ecovibe";

const ILIGAN_LOCATIONS: GeoCoordinates[] = [
  {
    lat: 8.2256,
    lng: 124.2492,
    accuracyMeters: 6,
    addressLabel: "Pala-o Public Market Perimeter Rd, Brgy. Pala-o",
    district: "Brgy. Pala-o, Iligan City",
  },
  {
    lat: 8.2414,
    lng: 124.2439,
    accuracyMeters: 5,
    addressLabel: "Andres Bonifacio Ave (near MSU-IIT), Brgy. Tibanga",
    district: "Brgy. Tibanga, Iligan City",
  },
  {
    lat: 8.2285,
    lng: 124.2398,
    accuracyMeters: 7,
    addressLabel: "Quezon Ave near Plaza Publica, Brgy. Poblacion",
    district: "Brgy. Poblacion, Iligan City",
  },
  {
    lat: 8.2468,
    lng: 124.2395,
    accuracyMeters: 6,
    addressLabel: "Centennial Park & Baywalk, Brgy. Santiago",
    district: "Brgy. Santiago, Iligan City",
  },
];

export function useGeolocation(initialCoords?: GeoCoordinates) {
  const [coordinates, setCoordinates] = useState<GeoCoordinates>(
    initialCoords || ILIGAN_LOCATIONS[0]
  );
  const [isLocating, setIsLocating] = useState(false);
  const [geoStatus, setGeoStatus] = useState<string>("Iligan City");

  const captureGeolocation = useCallback(async (): Promise<GeoCoordinates> => {
    setIsLocating(true);
    setGeoStatus("Finding your location...");

    return new Promise((resolve) => {
      if (typeof window !== "undefined" && "geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const captured: GeoCoordinates = {
              lat: Number(pos.coords.latitude.toFixed(5)),
              lng: Number(pos.coords.longitude.toFixed(5)),
              accuracyMeters: Math.round(pos.coords.accuracy || 8),
              addressLabel: "Current location in Iligan City",
              district: "Iligan City",
            };
            setCoordinates(captured);
            setGeoStatus(`Current location (±${captured.accuracyMeters}m)`);
            setIsLocating(false);
            resolve(captured);
          },
          () => {
            const fallback =
              ILIGAN_LOCATIONS[
                Math.floor(Math.random() * ILIGAN_LOCATIONS.length)
              ];
            const jittered: GeoCoordinates = {
              ...fallback,
              lat: Number(
                (fallback.lat + (Math.random() - 0.5) * 0.0015).toFixed(5)
              ),
              lng: Number(
                (fallback.lng + (Math.random() - 0.5) * 0.0015).toFixed(5)
              ),
            };
            setCoordinates(jittered);
            setGeoStatus(jittered.district || "Iligan City");
            setIsLocating(false);
            resolve(jittered);
          },
          { enableHighAccuracy: true, timeout: 3500 }
        );
      } else {
        setTimeout(() => {
          const fallback = ILIGAN_LOCATIONS[1];
          setCoordinates(fallback);
          setGeoStatus(fallback.district || "Iligan City");
          setIsLocating(false);
          resolve(fallback);
        }, 400);
      }
    });
  }, []);

  return {
    coordinates,
    setCoordinates,
    isLocating,
    geoStatus,
    captureGeolocation,
    presets: ILIGAN_LOCATIONS,
  };
}
