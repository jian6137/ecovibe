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

interface HeroSectionProps {
  onReportIssueClick: () => void;
  onCommunityChatClick: () => void;
  totalIssues: number;
  resolvedCount: number;
  activeVolunteers: number;
}

export function HeroSection({
  onReportIssueClick,
  onCommunityChatClick,
  totalIssues,
  resolvedCount,
  activeVolunteers,
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
                  Resolved this month
                </p>
              </div>
              <div className="rounded-m3-md bg-m3-surface-container-low p-4 border border-m3-outline-variant">
                <p className="text-2xl font-semibold text-m3-on-surface">
                  {activeVolunteers}
                </p>
                <p className="mt-0.5 text-xs text-m3-on-surface-variant">
                  Local volunteers
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Clean Google-Style Community Activity Preview Card */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
            className="lg:col-span-5"
          >
            <div className="rounded-m3-xl border border-m3-outline-variant bg-m3-surface-container-low p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-m3-on-surface-variant">
                    Recent community report
                  </p>
                  <h2 className="text-base font-medium text-m3-on-surface mt-0.5">
                    Brgy. Pala-o, Iligan City
                  </h2>
                </div>
                <Badge variant="default">Waste</Badge>
              </div>

              <div className="overflow-hidden rounded-m3-md border border-m3-outline-variant bg-m3-surface-container-lowest">
                <img
                  src="https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80"
                  alt="Uncollected roadside waste bags along Pala-o Public Market perimeter road"
                  className="h-44 w-full object-cover"
                />
                <div className="p-3.5 space-y-1 bg-m3-surface-container">
                  <p className="text-sm font-medium text-m3-on-surface">
                    Uncollected waste bags along Pala-o Market perimeter road
                  </p>
                  <p className="text-xs text-m3-on-surface-variant flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-m3-primary-text shrink-0" aria-hidden="true" />
                    <span>Pala-o Public Market Perimeter Rd • Reported 38 mins ago</span>
                  </p>
                </div>
              </div>

              {/* Simple Human-Friendly Status Steps */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-m3-sm bg-m3-surface-container px-3.5 py-2.5">
                  <span className="flex items-center gap-2 text-m3-on-surface">
                    <CheckCircle2
                      className="h-4 w-4 text-m3-primary-text shrink-0"
                      aria-hidden="true"
                    />
                    Photo analyzed & categorized
                  </span>
                  <span className="font-medium text-m3-on-surface-variant">
                    Waste • High priority
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-m3-sm bg-m3-surface-container px-3.5 py-2.5">
                  <span className="flex items-center gap-2 text-m3-on-surface">
                    <CheckCircle2
                      className="h-4 w-4 text-m3-primary-text shrink-0"
                      aria-hidden="true"
                    />
                    Forwarded to city office
                  </span>
                  <span className="font-medium text-m3-on-surface-variant">
                    ICEMO Solid Waste
                  </span>
                </div>
              </div>

              {/* Upcoming Weekend Clean-Up Banner */}
              <div className="flex items-center justify-between gap-3 rounded-m3-md bg-m3-primary-container px-4 py-3 text-xs text-m3-on-primary-container">
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-medium">
                      This Saturday: Tambo Baywalk Clean-Up
                    </p>
                    <p className="opacity-85">
                      Centennial Park, Brgy. Santiago • 6:30 AM
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 font-medium shrink-0">
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  84 going
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
