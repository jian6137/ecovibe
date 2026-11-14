"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor, Check, ChevronDown } from "lucide-react";
import {
  ColorSchemePreference,
  ResolvedColorScheme,
} from "@/hooks/use-color-scheme";

interface ThemeToggleProps {
  preference: ColorSchemePreference;
  resolvedScheme: ResolvedColorScheme;
  systemScheme: ResolvedColorScheme;
  onToggle: () => void;
  onSelectScheme: (scheme: ColorSchemePreference) => void;
}

const THEME_OPTIONS: Array<{
  value: ColorSchemePreference;
  label: string;
  icon: typeof Sun;
}> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Auto", icon: Monitor },
];

export function ThemeToggle({
  preference,
  resolvedScheme,
  onSelectScheme,
}: ThemeToggleProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const ActiveIcon =
    preference === "system"
      ? Monitor
      : resolvedScheme === "dark"
      ? Moon
      : Sun;

  const activeLabel =
    preference === "system"
      ? "Auto"
      : preference === "dark"
      ? "Dark"
      : "Light";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Theme: ${activeLabel}. Click to change theme`}
        className="inline-flex h-9 items-center gap-1.5 rounded-m3-full border border-m3-outline-variant bg-m3-surface px-3 text-xs font-medium text-m3-on-surface-variant transition-colors hover:bg-m3-surface-container-high hover:text-m3-on-surface"
      >
        <ActiveIcon className="h-4 w-4 text-m3-primary-text" aria-hidden="true" />
        <span className="hidden sm:inline">{activeLabel}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 opacity-70 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Theme options"
          className="absolute right-0 mt-2 w-36 overflow-hidden rounded-2xl border border-m3-outline-variant bg-m3-surface-container p-1.5 shadow-m3-3 z-50"
        >
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = preference === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => {
                  onSelectScheme(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-m3-secondary-container text-m3-on-secondary-container"
                    : "text-m3-on-surface hover:bg-m3-surface-container-high"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{opt.label}</span>
                </span>
                {isSelected && (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
