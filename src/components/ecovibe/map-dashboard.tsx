"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  MapPin,
  Layers,
  ZoomIn,
  ZoomOut,
  ThumbsUp,
  Sparkles,
  FileSpreadsheet,
  Filter,
  AlertOctagon,
  Trash2,
  Wrench,
  CloudRain,
  LightbulbOff,
  Compass,
  CalendarHeart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CommunityIssue,
  IssueCategory,
  VolunteerEvent,
} from "@/types/ecovibe";
import { formatCoordinates, formatRelativeTime } from "@/lib/utils";

interface MapDashboardProps {
  issues: CommunityIssue[];
  events: VolunteerEvent[];
  selectedIssueId: string;
  onSelectIssue: (id: string) => void;
  onUpvoteIssue: (id: string) => void;
}

const CATEGORY_FILTER_OPTIONS: Array<"All" | IssueCategory> = [
  "All",
  "Waste",
  "Road Hazard",
  "Broken Facility",
  "Flooding & Drainage",
  "Streetlight Outage",
];

// Normalize lat/lng around the civic center (lat 8.465..8.500, lng 124.630..124.662) into 12%..88% canvas coordinates
function projectToCanvasPosition(lat: number, lng: number, index: number) {
  const minLat = 8.465;
  const maxLat = 8.500;
  const minLng = 124.630;
  const maxLng = 124.662;

  const normY = 1 - (lat - minLat) / (maxLat - minLat);
  const normX = (lng - minLng) / (maxLng - minLng);

  const clampedX = Math.min(86, Math.max(14, Math.round(normX * 74 + 13)));
  const clampedY = Math.min(84, Math.max(16, Math.round(normY * 70 + 15)));

  // Fallback spread if coordinates are outside the default bounding box
  if (Number.isNaN(clampedX) || Number.isNaN(clampedY)) {
    return {
      x: 25 + ((index * 17) % 55),
      y: 25 + ((index * 23) % 55),
    };
  }
  return { x: clampedX, y: clampedY };
}

function getCategoryIcon(category: IssueCategory) {
  switch (category) {
    case "Waste":
    case "Illegal Dumping":
      return <Trash2 className="h-4 w-4" aria-hidden="true" />;
    case "Road Hazard":
      return <AlertOctagon className="h-4 w-4" aria-hidden="true" />;
    case "Broken Facility":
      return <Wrench className="h-4 w-4" aria-hidden="true" />;
    case "Flooding & Drainage":
      return <CloudRain className="h-4 w-4" aria-hidden="true" />;
    case "Streetlight Outage":
      return <LightbulbOff className="h-4 w-4" aria-hidden="true" />;
    default:
      return <MapPin className="h-4 w-4" aria-hidden="true" />;
  }
}

export function MapDashboard({
  issues,
  events,
  selectedIssueId,
  onSelectIssue,
  onUpvoteIssue,
}: MapDashboardProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState<"All" | IssueCategory>("All");
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showEventPins, setShowEventPins] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(14);

  const filteredIssues = useMemo(() => {
    if (activeCategory === "All") return issues;
    return issues.filter((item) => item.category === activeCategory);
  }, [issues, activeCategory]);

  const selectedIssue = useMemo(() => {
    return (
      filteredIssues.find((i) => i.id === selectedIssueId) ||
      filteredIssues[0] ||
      issues[0]
    );
  }, [filteredIssues, issues, selectedIssueId]);

  const zoomScale = 1 + (zoomLevel - 14) * 0.12;

  return (
    <section
      id="map-dashboard"
      aria-labelledby="map-dashboard-heading"
      className="py-16 border-b border-purple-400/20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header & Category Filter Pills */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <Badge variant="secondary" className="mb-3">
              <Compass className="h-3.5 w-3.5 text-[#ff859d]" aria-hidden="true" />
              Google Maps Platform • Dark M3 Styling
            </Badge>
            <h2
              id="map-dashboard-heading"
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white"
            >
              Live Community Issue Map Dashboard
            </h2>
            <p className="mt-2 max-w-2xl text-purple-200/85">
              Explore geo-tagged civic issues and volunteer clean-up hubs in real time.
              Select any custom map pin to inspect AI confidence scores, agency dispatch status,
              and Google Sheets ledger rows.
            </p>
          </div>

          {/* Category Filter Bar */}
          <div
            role="group"
            aria-label="Filter map pins by issue category"
            className="flex flex-wrap items-center gap-2"
          >
            <span className="mr-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-purple-200">
              <Filter className="h-3.5 w-3.5 text-[#ff4d73]" aria-hidden="true" />
              Filter:
            </span>
            {CATEGORY_FILTER_OPTIONS.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                    active
                      ? "bg-[#A8002D] text-white shadow-glow-red border border-[#ff859d]/50"
                      : "bg-[#1b0240] text-purple-200 border border-purple-400/30 hover:bg-[#5101be]/50 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Map Dashboard Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Interactive Dark-Mode Google Maps Platform Canvas (8 cols) */}
          <div className="lg:col-span-8">
            <div className="relative overflow-hidden rounded-m3-xl border-2 border-purple-400/35 bg-[#0b001a] shadow-glow-purple h-[540px] flex flex-col justify-between">
              {/* Top Map HUD Controls */}
              <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 p-4 pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-purple-400/35 bg-[#12002b]/90 px-3.5 py-1.5 backdrop-blur-md">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#A8002D] eco-pulse-ring" />
                  <span className="text-xs font-bold text-white">
                    Google Maps Platform Canvas
                  </span>
                  <span className="hidden sm:inline font-mono text-[11px] text-purple-300">
                    (Map ID: ecovibe_dark_m3 • Z{zoomLevel})
                  </span>
                </div>

                <div className="pointer-events-auto flex items-center gap-2">
                  <button
                    type="button"
                    aria-pressed={showHeatmap}
                    onClick={() => setShowHeatmap((v) => !v)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition-colors ${
                      showHeatmap
                        ? "border-[#AB1E2C] bg-[#A8002D]/85 text-white"
                        : "border-purple-400/35 bg-[#12002b]/90 text-purple-200"
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                    AI Severity Heatmap
                  </button>
                  <button
                    type="button"
                    aria-pressed={showEventPins}
                    onClick={() => setShowEventPins((v) => !v)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition-colors ${
                      showEventPins
                        ? "border-purple-300/60 bg-[#5101be]/90 text-white"
                        : "border-purple-400/35 bg-[#12002b]/90 text-purple-200"
                    }`}
                  >
                    <CalendarHeart className="h-3.5 w-3.5" aria-hidden="true" />
                    Volunteer Hubs
                  </button>
                </div>
              </div>

              {/* Vector Dark-Styled Cartography & Interactive Pin Layer */}
              <div
                className="absolute inset-0 overflow-hidden transition-transform duration-300 ease-out"
                style={{ transform: `scale(${zoomScale})` }}
              >
                {/* Custom Dark-Mode SVG Map Background (Roads, River, Coastal Bay, Urban Blocks) */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 1000 650"
                  preserveAspectRatio="xMidYMid slice"
                  className="h-full w-full select-none"
                >
                  <defs>
                    <radialGradient id="purpleSurfaceGlow" cx="50%" cy="50%" r="65%">
                      <stop offset="0%" stopColor="#26035c" stopOpacity="0.65" />
                      <stop offset="65%" stopColor="#12002b" stopOpacity="0.92" />
                      <stop offset="100%" stopColor="#080014" stopOpacity="1" />
                    </radialGradient>
                    <pattern
                      id="m3MapGrid"
                      width="50"
                      height="50"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 50 0 L 0 0 0 50"
                        fill="none"
                        stroke="#5101be"
                        strokeWidth="0.7"
                        strokeOpacity="0.28"
                      />
                    </pattern>
                  </defs>

                  {/* Base Dark Purple Canvas */}
                  <rect width="1000" height="650" fill="url(#purpleSurfaceGlow)" />
                  <rect width="1000" height="650" fill="url(#m3MapGrid)" />

                  {/* Northern Coastal Bay Water Feature */}
                  <path
                    d="M 0,0 L 1000,0 L 1000,115 Q 760,150 540,95 T 0,130 Z"
                    fill="#0d0428"
                    stroke="#380582"
                    strokeWidth="2"
                  />

                  {/* Winding River Corridor */}
                  <path
                    d="M 380,105 C 410,220 310,330 355,455 C 385,540 340,600 320,650"
                    fill="none"
                    stroke="#190845"
                    strokeWidth="36"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 380,105 C 410,220 310,330 355,455 C 385,540 340,600 320,650"
                    fill="none"
                    stroke="#5101be"
                    strokeWidth="2"
                    strokeDasharray="6 6"
                    strokeOpacity="0.45"
                  />

                  {/* Green/Park Zones in M3 Dark Tones */}
                  <rect
                    x="180"
                    y="380"
                    width="120"
                    height="75"
                    rx="14"
                    fill="#1f054d"
                    stroke="#5101be"
                    strokeOpacity="0.4"
                  />
                  <rect
                    x="590"
                    y="230"
                    width="150"
                    height="95"
                    rx="18"
                    fill="#1f054d"
                    stroke="#5101be"
                    strokeOpacity="0.4"
                  />

                  {/* Secondary Urban Road Network */}
                  <g stroke="#3b098a" strokeWidth="2.5" strokeOpacity="0.55" fill="none">
                    <line x1="120" y1="120" x2="120" y2="620" />
                    <line x1="250" y1="120" x2="250" y2="620" />
                    <line x1="510" y1="110" x2="510" y2="630" />
                    <line x1="680" y1="120" x2="680" y2="630" />
                    <line x1="830" y1="120" x2="830" y2="630" />
                    <line x1="60" y1="220" x2="940" y2="220" />
                    <line x1="60" y1="350" x2="940" y2="350" />
                    <line x1="60" y1="490" x2="940" y2="490" />
                  </g>

                  {/* Primary Arterial Highways */}
                  <path
                    d="M 0,285 Q 450,260 1000,310"
                    fill="none"
                    stroke="#6d28d9"
                    strokeWidth="6"
                    strokeOpacity="0.7"
                  />
                  <path
                    d="M 0,285 Q 450,260 1000,310"
                    fill="none"
                    stroke="#A8002D"
                    strokeWidth="1.8"
                    strokeDasharray="12 8"
                    strokeOpacity="0.85"
                  />
                  <path
                    d="M 450,95 L 620,650"
                    fill="none"
                    stroke="#5b21b6"
                    strokeWidth="5"
                    strokeOpacity="0.65"
                  />

                  {/* Map District Labels */}
                  <g
                    fill="#c4b5fd"
                    fillOpacity="0.55"
                    fontSize="12"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    <text x="55" y="70">MACAJALAR BAY ESPLANADE</text>
                    <text x="145" y="425">DIVISORIA CIVIC PLAZA</text>
                    <text x="530" y="395">POBLACION - COGON HUB</text>
                    <text x="705" y="265">LAPASAN ARTERIAL CORRIDOR</text>
                    <text x="160" y="195">KAUSWAGAN JUNCTION</text>
                  </g>
                </svg>

                {/* Volunteer Event Hub Pins (Deep Purple #5101be Badges) */}
                {showEventPins &&
                  events.map((evt, idx) => {
                    const pos = projectToCanvasPosition(
                      evt.coordinates.lat,
                      evt.coordinates.lng,
                      idx + 10
                    );
                    return (
                      <div
                        key={evt.id}
                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                      >
                        <div className="group relative flex items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-purple-200 bg-[#5101be] text-white shadow-glow-purple">
                            <CalendarHeart className="h-4 w-4" aria-hidden="true" />
                          </div>
                          <span className="ml-1.5 hidden sm:inline-block rounded-full bg-[#12002b]/90 border border-purple-400/40 px-2 py-0.5 text-[10px] font-bold text-purple-100 whitespace-nowrap">
                            Volunteer Hub: {evt.locationName.split("&")[0]}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                {/* Custom Reported Community Issue Pins (#A8002D & #AB1E2C Red Accents) */}
                {filteredIssues.map((issue, idx) => {
                  const pos = projectToCanvasPosition(
                    issue.coordinates.lat,
                    issue.coordinates.lng,
                    idx
                  );
                  const isSelected = selectedIssue?.id === issue.id;
                  const isCriticalOrHigh =
                    issue.severity === "Critical" || issue.severity === "High";

                  return (
                    <div
                      key={issue.id}
                      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 ${
                        isSelected ? "z-30" : "z-20"
                      }`}
                    >
                      {/* Optional AI Severity Heatmap Halo */}
                      {showHeatmap && (
                        <div
                          aria-hidden="true"
                          className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl ${
                            isCriticalOrHigh
                              ? "h-28 w-28 bg-[#A8002D]/45"
                              : "h-20 w-20 bg-[#5101be]/50"
                          }`}
                        />
                      )}

                      <motion.button
                        type="button"
                        whileHover={prefersReducedMotion ? undefined : { scale: 1.12 }}
                        whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                        onClick={() => onSelectIssue(issue.id)}
                        aria-label={`Inspect ${issue.category} issue: ${issue.title} (${issue.severity} priority)`}
                        aria-pressed={isSelected}
                        className="group relative flex flex-col items-center focus-visible:outline-none"
                      >
                        {/* Pulsing Alert Ring for Selected or Critical Pin */}
                        {(isSelected || issue.severity === "Critical") && (
                          <span
                            aria-hidden="true"
                            className="absolute -inset-2 rounded-full bg-[#AB1E2C]/60 eco-pulse-ring"
                          />
                        )}

                        {/* Pin Marker Body */}
                        <div
                          className={`relative flex h-11 w-11 items-center justify-center rounded-2xl border-2 transition-all ${
                            isSelected
                              ? "scale-110 border-white bg-[#A8002D] text-white shadow-glow-red"
                              : isCriticalOrHigh
                              ? "border-[#ff859d] bg-[#AB1E2C] text-white shadow-md hover:bg-[#A8002D]"
                              : "border-purple-300 bg-[#5101be] text-white shadow-md hover:bg-[#A8002D]"
                          }`}
                        >
                          {getCategoryIcon(issue.category)}
                        </div>

                        {/* Pin Label Tag */}
                        <span
                          className={`mt-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold whitespace-nowrap border transition-colors ${
                            isSelected
                              ? "border-white bg-[#A8002D] text-white shadow-md"
                              : "border-purple-400/40 bg-[#12002b]/95 text-purple-100 group-hover:border-[#AB1E2C]"
                          }`}
                        >
                          {issue.category} • {issue.severity}
                        </span>
                      </motion.button>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Map Legend & Zoom Bar */}
              <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-t from-[#090016] via-[#090016]/90 to-transparent p-4">
                <div className="flex flex-wrap items-center gap-3 text-xs text-purple-100">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-[#A8002D] border border-white/60" />
                    Critical / High Issue Pin
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-[#5101be] border border-purple-200" />
                    Medium Issue / Volunteer Hub
                  </span>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1.5 rounded-full border border-purple-400/35 bg-[#12002b]/90 p-1">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(12, z - 1))}
                    aria-label="Zoom out map"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-purple-100 hover:bg-[#5101be] hover:text-white"
                  >
                    <ZoomOut className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="px-2 font-mono text-xs font-bold text-white">
                    {zoomLevel}x
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(17, z + 1))}
                    aria-label="Zoom in map"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-purple-100 hover:bg-[#5101be] hover:text-white"
                  >
                    <ZoomIn className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Selected Pin Inspector & Issue Feed (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <AnimatePresence mode="wait">
              {selectedIssue && (
                <motion.div
                  key={selectedIssue.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-2 border-[#AB1E2C]/70 bg-[#1b0240]/95 shadow-glow-red">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="default">
                          {getCategoryIcon(selectedIssue.category)}
                          <span>{selectedIssue.category}</span>
                        </Badge>
                        <span className="font-mono text-xs text-purple-200">
                          {selectedIssue.id} •{" "}
                          {formatRelativeTime(selectedIssue.createdAt)}
                        </span>
                      </div>
                      <CardTitle className="text-lg pt-1">
                        {selectedIssue.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 text-xs text-[#ff859d] font-medium">
                        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {selectedIssue.coordinates.addressLabel ||
                          formatCoordinates(
                            selectedIssue.coordinates.lat,
                            selectedIssue.coordinates.lng
                          )}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="relative h-36 w-full overflow-hidden rounded-m3-md border border-purple-400/30 bg-[#12002b]">
                        <img
                          src={selectedIssue.photoUrl}
                          alt={selectedIssue.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute top-2 right-2 rounded-full bg-[#12002b]/90 border border-purple-400/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" aria-hidden="true" />
                          {Math.round((selectedIssue.aiConfidence || 0.95) * 100)}% AI
                        </div>
                      </div>

                      <p className="text-xs text-purple-100/90 leading-relaxed">
                        {selectedIssue.description}
                      </p>

                      {/* Metadata & Sheets Sync Row */}
                      <div className="rounded-m3-md border border-purple-400/25 bg-[#12002b]/80 p-3 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-purple-300">Status:</span>
                          <span className="font-bold text-white">
                            {selectedIssue.status} ({selectedIssue.severity})
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-purple-300">Coordinates:</span>
                          <span className="font-mono text-[11px] text-purple-100">
                            {formatCoordinates(
                              selectedIssue.coordinates.lat,
                              selectedIssue.coordinates.lng
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-purple-300 flex items-center gap-1">
                            <FileSpreadsheet
                              className="h-3.5 w-3.5 text-[#ff859d]"
                              aria-hidden="true"
                            />
                            Sheets Row:
                          </span>
                          <span className="font-mono text-[11px] font-bold text-[#ff859d]">
                            {selectedIssue.sheetsRowRef || "Issues_Log!A19:J19"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-xs text-purple-200">
                          Reported by{" "}
                          <strong className="text-white">
                            {selectedIssue.reporterName}
                          </strong>
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onUpvoteIssue(selectedIssue.id)}
                          className="rounded-full"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Corroborate ({selectedIssue.upvotes})</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Scrollable Pin Switcher List */}
            <div className="rounded-m3-xl border border-purple-400/30 bg-[#1b0240]/85 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-200 mb-3">
                Active Pins ({filteredIssues.length}) — Click to Focus
              </h3>
              <ul role="list" className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {filteredIssues.map((item) => {
                  const active = selectedIssue?.id === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onSelectIssue(item.id)}
                        className={`w-full flex items-center justify-between gap-2 rounded-m3-md px-3 py-2 text-left text-xs transition-colors ${
                          active
                            ? "bg-[#A8002D] text-white font-bold"
                            : "bg-[#12002b]/75 text-purple-100 hover:bg-[#5101be]/50"
                        }`}
                      >
                        <span className="truncate">{item.title}</span>
                        <span className="shrink-0 rounded-full bg-black/30 px-2 py-0.5 text-[10px]">
                          {item.category}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
