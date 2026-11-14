"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Camera,
  MessageSquare,
  MapPin,
  CheckCircle2,
  Calendar,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommunityIssue, VolunteerEvent } from "@/types/ecovibe";
import { formatCoordinates, formatRelativeTime } from "@/lib/utils";

interface HeroSectionProps {
  onReportIssueClick: () => void;
  onCommunityChatClick: () => void;
  totalIssues: number;
  resolvedCount: number;
  activeVolunteers: number;
  latestIssue: CommunityIssue | null;
  nextEvent: VolunteerEvent | null;
  nextEventParticipantCount: number;
}

export function HeroSection({
  onReportIssueClick,
  onCommunityChatClick,
  totalIssues,
  resolvedCount,
  activeVolunteers,
  latestIssue,
  nextEvent,
  nextEventParticipantCount,
}: HeroSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="border-b border-m3-outline-variant bg-m3-surface py-12 md:py-20 transition-colors"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Column: Mission & Primary Call-to-Actions */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-m3-full bg-m3-surface-container px-3.5 py-1.5 text-xs font-medium text-m3-on-surface-variant">
              <MapPin className="h-3.5 w-3.5 text-m3-primary-text" aria-hidden="true" />
              <span>Iligan City Community Action</span>
            </div>

            <h1
              id="hero-heading"
              tabIndex={-1}
              className="text-4xl font-semibold tracking-tight text-m3-on-surface sm:text-5xl leading-[1.15]"
            >
              Help keep Iligan City clean, safe, and thriving.
            </h1>

            <p className="max-w-2xl text-base sm:text-lg text-m3-on-surface-variant leading-relaxed">
              Spot uncollected trash, a pothole, a clogged drain, or a broken
              waiting shed in your barangay? Snap a photo to report it in
              seconds, track updates on the city map, or join neighbors for a
              weekend clean-up drive.
            </p>

            {/* Primary Call-To-Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                type="button"
                size="lg"
                onClick={onReportIssueClick}
              >
                <Camera className="h-4 w-4" aria-hidden="true" />
                <span>Report an Issue</span>
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={onCommunityChatClick}
              >
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                <span>Community Chat</span>
              </Button>
            </div>

            {/* Clean Summary Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-4 sm:gap-4 max-w-lg">
              <div className="rounded-m3-md bg-m3-surface-container-low p-4 border border-m3-outline-variant">
                <p className="text-2xl font-semibold text-m3-on-surface">
                  {totalIssues}
                </p>
                <p className="mt-0.5 text-xs text-m3-on-surface-variant">
                  Open reports
                </p>
              </div>
              <div className="rounded-m3-md bg-m3-surface-container-low p-4 border border-m3-outline-variant">
                <p className="text-2xl font-semibold text-m3-primary-text">
                  {resolvedCount}
                </p>
                <p className="mt-0.5 text-xs text-m3-on-surface-variant">
                  Resolved reports
                </p>
              </div>
              <div className="rounded-m3-md bg-m3-surface-container-low p-4 border border-m3-outline-variant">
                <p className="text-2xl font-semibold text-m3-on-surface">
                  {activeVolunteers}
                </p>
                <p className="mt-0.5 text-xs text-m3-on-surface-variant">
                  Registered volunteers
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Live Community Activity Card */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
            className="lg:col-span-5"
          >
            <div className="rounded-m3-xl border border-m3-outline-variant bg-m3-surface-container-low p-5 sm:p-6 space-y-5">
              {latestIssue ? (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-m3-on-surface-variant">
                        Latest community report
                      </p>
                      <h2 className="truncate text-base font-medium text-m3-on-surface mt-0.5">
                        {latestIssue.coordinates.district ||
                          latestIssue.coordinates.addressLabel ||
                          "Iligan City"}
                      </h2>
                    </div>
                    <Badge variant="default" className="shrink-0">
                      {latestIssue.category}
                    </Badge>
                  </div>

                  <div className="overflow-hidden rounded-m3-md border border-m3-outline-variant bg-m3-surface-container-lowest">
                    {latestIssue.photoUrl && (
                      <img
                        src={latestIssue.photoUrl}
                        alt={latestIssue.title}
                        className="h-44 w-full object-cover"
                      />
                    )}
                    <div className="p-3.5 space-y-1 bg-m3-surface-container">
                      <p className="text-sm font-medium text-m3-on-surface">
                        {latestIssue.title}
                      </p>
                      <p className="text-xs text-m3-on-surface-variant flex items-center gap-1.5">
                        <MapPin
                          className="h-3.5 w-3.5 text-m3-primary-text shrink-0"
                          aria-hidden="true"
                        />
                        <span className="truncate">
                          {latestIssue.coordinates.addressLabel ||
                            formatCoordinates(
                              latestIssue.coordinates.lat,
                              latestIssue.coordinates.lng
                            )}{" "}
                          • {formatRelativeTime(latestIssue.createdAt)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Live Status Steps */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2 rounded-m3-sm bg-m3-surface-container px-3.5 py-2.5">
                      <span className="flex items-center gap-2 text-m3-on-surface">
                        <CheckCircle2
                          className="h-4 w-4 text-m3-primary-text shrink-0"
                          aria-hidden="true"
                        />
                        Status: {latestIssue.status}
                      </span>
                      <span className="font-medium text-m3-on-surface-variant shrink-0">
                        {latestIssue.category} • {latestIssue.severity} priority
                      </span>
                    </div>

                    {latestIssue.recommendedAgency && (
                      <div className="flex items-center justify-between gap-2 rounded-m3-sm bg-m3-surface-container px-3.5 py-2.5">
                        <span className="flex items-center gap-2 text-m3-on-surface shrink-0">
                          <CheckCircle2
                            className="h-4 w-4 text-m3-primary-text shrink-0"
                            aria-hidden="true"
                          />
                          Assigned office
                        </span>
                        <span className="truncate font-medium text-m3-on-surface-variant">
                          {latestIssue.recommendedAgency}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-3 py-4 text-center">
                  <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-m3-surface-container text-m3-primary-text">
                    <Camera className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-base font-medium text-m3-on-surface">
                      No open reports right now
                    </h2>
                    <p className="text-xs text-m3-on-surface-variant">
                      Spot an issue in your barangay? Upload a photo below to
                      pin the first report on the Iligan City map.
                    </p>
                  </div>
                </div>
              )}

              {/* Live Upcoming Event Banner */}
              {nextEvent && (
                <a
                  href="#volunteer-events"
                  className="flex items-center justify-between gap-3 rounded-m3-md bg-m3-primary-container px-4 py-3 text-xs text-m3-on-primary-container transition-all hover:brightness-95"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {nextEvent.date}: {nextEvent.title}
                      </p>
                      <p className="opacity-85 truncate">
                        {nextEvent.locationName} • {nextEvent.timeRange}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 font-medium shrink-0">
                    <Users className="h-3.5 w-3.5" aria-hidden="true" />
                    {nextEventParticipantCount} going
                  </span>
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
