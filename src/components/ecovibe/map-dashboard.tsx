"use client";

import React, { useState, useMemo } from "react";
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  InfoWindow,
  ColorScheme,
} from "@vis.gl/react-google-maps";
import {
  MapPin,
  ThumbsUp,
  AlertOctagon,
  Trash2,
  Wrench,
  CloudRain,
  LightbulbOff,
  Calendar,
  Check,
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
import { ILIGAN_CITY_CENTER } from "@/lib/seed-data";
import { formatCoordinates, formatRelativeTime } from "@/lib/utils";
import { ResolvedColorScheme } from "@/hooks/use-color-scheme";

const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  "AIzaSyB2f963X-c4s5y9E-c4s5y9E-c4s5y9E";

const GOOGLE_MAPS_MAP_ID =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

interface MapDashboardProps {
  issues: CommunityIssue[];
  events: VolunteerEvent[];
  selectedIssueId: string;
  onSelectIssue: (id: string) => void;
  onUpvoteIssue: (id: string) => void;
  resolvedScheme: ResolvedColorScheme;
}

const CATEGORY_FILTER_OPTIONS: Array<"All" | IssueCategory> = [
  "All",
  "Waste",
  "Road Hazard",
  "Broken Facility",
  "Flooding & Drainage",
  "Streetlight Outage",
  "Other",
];

function getCategoryIcon(category: IssueCategory) {
  switch (category) {
    case "Waste":
    case "Illegal Dumping":
      return <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />;
    case "Road Hazard":
      return <AlertOctagon className="h-3.5 w-3.5" aria-hidden="true" />;
    case "Broken Facility":
      return <Wrench className="h-3.5 w-3.5" aria-hidden="true" />;
    case "Flooding & Drainage":
      return <CloudRain className="h-3.5 w-3.5" aria-hidden="true" />;
    case "Streetlight Outage":
      return <LightbulbOff className="h-3.5 w-3.5" aria-hidden="true" />;
    default:
      return <MapPin className="h-3.5 w-3.5" aria-hidden="true" />;
  }
}

export function MapDashboard({
  issues,
  events,
  selectedIssueId,
  onSelectIssue,
  onUpvoteIssue,
  resolvedScheme,
}: MapDashboardProps) {
  const [activeCategory, setActiveCategory] = useState<"All" | IssueCategory>(
    "All"
  );
  const [showEventPins, setShowEventPins] = useState<boolean>(true);
  const [openInfoWindowId, setOpenInfoWindowId] = useState<string | null>(null);

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

  const isDark = resolvedScheme === "dark";

  const handleMarkerClick = (issueId: string) => {
    onSelectIssue(issueId);
    setOpenInfoWindowId(issueId);
  };

  return (
    <section
      id="map-dashboard"
      aria-labelledby="map-dashboard-heading"
      className="py-14 border-b border-m3-outline-variant bg-m3-surface transition-colors"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header & Material 3 Filter Chips */}
        <div className="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h2
              id="map-dashboard-heading"
              className="text-2xl sm:text-3xl font-semibold tracking-tight text-m3-on-surface"
            >
              Iligan City community map
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm sm:text-base text-m3-on-surface-variant">
              Explore reported neighborhood issues and upcoming volunteer
              clean-up locations across Iligan City.
            </p>
          </div>

          {/* Material 3 Filter Chips */}
          <div
            role="group"
            aria-label="Filter map by category"
            className="flex flex-wrap items-center gap-2"
          >
            {CATEGORY_FILTER_OPTIONS.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveCategory(cat)}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-m3-sm px-3 text-xs font-medium transition-colors ${
                    active
                      ? "bg-m3-secondary-container text-m3-on-secondary-container"
                      : "border border-m3-outline-variant bg-m3-surface text-m3-on-surface-variant hover:bg-m3-surface-container"
                  }`}
                >
                  {active && (
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span>{cat}</span>
                </button>
              );
            })}

            <button
              type="button"
              aria-pressed={showEventPins}
              onClick={() => setShowEventPins((v) => !v)}
              className={`inline-flex h-8 items-center gap-1.5 rounded-m3-sm px-3 text-xs font-medium transition-colors ${
                showEventPins
                  ? "bg-m3-primary-container text-m3-on-primary-container"
                  : "border border-m3-outline-variant bg-m3-surface text-m3-on-surface-variant hover:bg-m3-surface-container"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Volunteer events</span>
            </button>
          </div>
        </div>

        {/* Main Map Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Google Map Container (8 cols) */}
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-m3-lg border border-m3-outline-variant bg-m3-surface-container-low">
              {/* Explicit Height Container per Google Maps Platform CF2 */}
              <div className="relative h-[500px] w-full">
                <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                  <GoogleMap
                    defaultCenter={ILIGAN_CITY_CENTER}
                    defaultZoom={14}
                    mapId={GOOGLE_MAPS_MAP_ID}
                    colorScheme={
                      isDark ? ColorScheme.DARK : ColorScheme.LIGHT
                    }
                    gestureHandling="greedy"
                    disableDefaultUI={false}
                    internalUsageAttributionIds={["gmp_git_agentskills_v1"]}
                    style={{ width: "100%", height: "100%" }}
                  >
                    {/* Reported Issue Pins */}
                    {filteredIssues.map((issue) => {
                      const isSelected = selectedIssue?.id === issue.id;
                      const isUrgent =
                        issue.severity === "Critical" ||
                        issue.severity === "High";

                      return (
                        <React.Fragment key={issue.id}>
                          <AdvancedMarker
                            position={{
                              lat: issue.coordinates.lat,
                              lng: issue.coordinates.lng,
                            }}
                            title={`${issue.category}: ${issue.title}`}
                            onClick={() => handleMarkerClick(issue.id)}
                          >
                            <div
                              className={`flex items-center gap-1.5 rounded-m3-full px-2.5 py-1.5 text-xs font-medium shadow-m3-2 transition-transform ${
                                isSelected
                                  ? "scale-110 bg-m3-primary text-m3-on-primary ring-2 ring-white"
                                  : isUrgent
                                  ? "bg-m3-primary text-m3-on-primary"
                                  : "bg-m3-surface text-m3-on-surface border border-m3-outline-variant"
                              }`}
                            >
                              {getCategoryIcon(issue.category)}
                              <span>{issue.category}</span>
                            </div>
                          </AdvancedMarker>

                          {openInfoWindowId === issue.id && (
                            <InfoWindow
                              position={{
                                lat: issue.coordinates.lat,
                                lng: issue.coordinates.lng,
                              }}
                              pixelOffset={[0, -34]}
                              maxWidth={260}
                              onCloseClick={() => setOpenInfoWindowId(null)}
                            >
                              <div className="p-1 text-neutral-900 space-y-1">
                                <p className="text-xs font-semibold">
                                  {issue.title}
                                </p>
                                <p className="text-[11px] text-neutral-600">
                                  {issue.coordinates.addressLabel}
                                </p>
                                <p className="text-[11px] font-medium text-neutral-800">
                                  Status: {issue.status} • {issue.severity}{" "}
                                  priority
                                </p>
                              </div>
                            </InfoWindow>
                          )}
                        </React.Fragment>
                      );
                    })}

                    {/* Volunteer Event Pins */}
                    {showEventPins &&
                      events.map((evt) => (
                        <AdvancedMarker
                          key={evt.id}
                          position={{
                            lat: evt.coordinates.lat,
                            lng: evt.coordinates.lng,
                          }}
                          title={`Volunteer Event: ${evt.title}`}
                        >
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1.5 rounded-m3-full border border-m3-outline-variant bg-m3-secondary-container px-2.5 py-1 text-xs font-medium text-m3-on-secondary-container shadow-m3-1">
                              <Calendar
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                              />
                              <span className="max-w-[140px] truncate">
                                {evt.title}
                              </span>
                            </div>
                            <svg
                              width="14"
                              height="8"
                              viewBox="0 0 14 8"
                              fill="none"
                              aria-hidden="true"
                              className="-mt-[1px]"
                            >
                              <path
                                d="M1.5 0L7 6.5L12.5 0H1.5Z"
                                className="fill-m3-secondary-container stroke-m3-outline-variant"
                                strokeWidth="1.2"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </AdvancedMarker>
                      ))}
                  </GoogleMap>
                </APIProvider>
              </div>

              {/* Clean Map Legend Bar (Zero Hex Codes!) */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-m3-outline-variant bg-m3-surface px-4 py-2.5 text-xs text-m3-on-surface-variant">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-m3-primary" />
                    <span>High or critical issue</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full border border-m3-outline-variant bg-m3-surface-container-highest" />
                    <span>Standard issue</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-m3-secondary-container border border-m3-outline-variant" />
                    <span>Volunteer clean-up event</span>
                  </span>
                </div>
                <span>Click any pin on the map to view details</span>
              </div>
            </div>
          </div>

          {/* Right Column: Selected Issue Details & List (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {selectedIssue && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="default">
                      {getCategoryIcon(selectedIssue.category)}
                      <span>{selectedIssue.category}</span>
                    </Badge>
                    <span className="text-xs text-m3-on-surface-variant">
                      {formatRelativeTime(selectedIssue.createdAt)}
                    </span>
                  </div>
                  <CardTitle className="text-base pt-1">
                    {selectedIssue.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1.5 text-xs">
                    <MapPin
                      className="h-3.5 w-3.5 text-m3-primary-text shrink-0"
                      aria-hidden="true"
                    />
                    <span>
                      {selectedIssue.coordinates.addressLabel ||
                        formatCoordinates(
                          selectedIssue.coordinates.lat,
                          selectedIssue.coordinates.lng
                        )}
                    </span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="h-36 w-full overflow-hidden rounded-m3-sm border border-m3-outline-variant bg-m3-surface-container">
                    <img
                      src={selectedIssue.photoUrl}
                      alt={selectedIssue.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <p className="text-xs text-m3-on-surface-variant leading-relaxed">
                    {selectedIssue.description}
                  </p>

                  <div className="rounded-m3-sm bg-m3-surface p-3 space-y-1.5 text-xs border border-m3-outline-variant">
                    <div className="flex items-center justify-between">
                      <span className="text-m3-on-surface-variant">Status</span>
                      <span className="font-medium text-m3-on-surface">
                        {selectedIssue.status} ({selectedIssue.severity}{" "}
                        priority)
                      </span>
                    </div>
                    {selectedIssue.recommendedAgency && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-m3-on-surface-variant shrink-0">
                          Assigned office
                        </span>
                        <span className="font-medium text-m3-on-surface text-right truncate">
                          {selectedIssue.recommendedAgency}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-xs text-m3-on-surface-variant">
                      Reported by {selectedIssue.reporterName}
                    </span>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => onUpvoteIssue(selectedIssue.id)}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Helpful ({selectedIssue.upvotes})</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Reports List */}
            <div className="rounded-m3-lg border border-m3-outline-variant bg-m3-surface-container-low p-4">
              <h3 className="text-xs font-medium text-m3-on-surface-variant mb-2.5">
                Reported issues in Iligan City ({filteredIssues.length})
              </h3>
              <ul role="list" className="space-y-1.5 max-h-44 overflow-y-auto">
                {filteredIssues.map((item) => {
                  const active = selectedIssue?.id === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => handleMarkerClick(item.id)}
                        className={`w-full flex items-center justify-between gap-2 rounded-m3-sm px-3 py-2 text-left text-xs transition-colors ${
                          active
                            ? "bg-m3-primary-container text-m3-on-primary-container font-medium"
                            : "bg-m3-surface text-m3-on-surface hover:bg-m3-surface-container"
                        }`}
                      >
                        <span className="truncate">{item.title}</span>
                        <span className="shrink-0 text-[11px] opacity-80">
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
