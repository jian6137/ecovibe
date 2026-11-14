"use client";

import { useState, useEffect, useCallback } from "react";

export type ColorSchemePreference = "system" | "light" | "dark";
export type ResolvedColorScheme = "light" | "dark";

const STORAGE_KEY = "color-scheme";

function updateMetaColorScheme(content: "light dark" | "light" | "dark") {
  if (typeof document === "undefined") return;
  let meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "color-scheme";
    document.head.prepend(meta);
  }
  meta.content = content;
}

export function useColorScheme() {
  const [preference, setPreference] = useState<ColorSchemePreference>("system");
  const [systemScheme, setSystemScheme] = useState<ResolvedColorScheme>("dark");

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemScheme(mql.matches ? "dark" : "light");

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        setPreference(stored);
        updateMetaColorScheme(stored);
      } else {
        setPreference("system");
        updateMetaColorScheme("light dark");
      }
    } catch {
      updateMetaColorScheme("light dark");
    }

    // Track OS changes to display current resolved state without ever deleting stored override
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setSystemScheme(e.matches ? "dark" : "light");
    };

    // Sync across browser tabs when localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      if (e.newValue === "light" || e.newValue === "dark") {
        setPreference(e.newValue);
        updateMetaColorScheme(e.newValue);
      } else {
        setPreference("system");
        updateMetaColorScheme("light dark");
      }
    };

    mql.addEventListener("change", handleMediaChange);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      mql.removeEventListener("change", handleMediaChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const resolvedScheme: ResolvedColorScheme =
    preference === "system" ? systemScheme : preference;

  /**
   * Two-state toggle logic per `dark-mode-toggle` guidance:
   * 1. Target = opposite of currently rendered scheme.
   * 2. If target differs from current system preference, store it literally.
   * 3. If target matches current system preference, remove stored value and restore `light dark`.
   */
  const toggleColorScheme = useCallback(() => {
    const currentRendered: ResolvedColorScheme =
      preference === "system" ? systemScheme : preference;
    const target: ResolvedColorScheme =
      currentRendered === "dark" ? "light" : "dark";

    if (target === systemScheme) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore storage errors
      }
      setPreference("system");
      updateMetaColorScheme("light dark");
    } else {
      try {
        window.localStorage.setItem(STORAGE_KEY, target);
      } catch {
        // ignore storage errors
      }
      setPreference(target);
      updateMetaColorScheme(target);
    }
  }, [preference, systemScheme]);

  /**
   * Explicit tri-state setter ("light", "dark", "system")
   */
  const selectColorScheme = useCallback((next: ColorSchemePreference) => {
    if (next === "system") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore storage errors
      }
      setPreference("system");
      updateMetaColorScheme("light dark");
    } else {
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore storage errors
      }
      setPreference(next);
      updateMetaColorScheme(next);
    }
  }, []);

  return {
    preference,
    systemScheme,
    resolvedScheme,
    toggleColorScheme,
    selectColorScheme,
  };
}
