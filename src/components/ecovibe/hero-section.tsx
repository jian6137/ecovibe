"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Camera,
  MessageSquareHeart,
  Sparkles,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  ArrowUpRight,
  Cpu,
  FileSpreadsheet,
  Flame,
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
      className="relative overflow-hidden border-b border-purple-400/20 pt-8 pb-16 md:py-20"
    >
      {/* Material 3 Deep Purple (#5101be) & Red (#A8002D) Ambient Surface Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-28 left-1/4 h-96 w-96 rounded-full bg-[#5101be]/45 blur-[130px]" />
        <div className="absolute top-20 right-10 h-80 w-80 rounded-full bg-[#A8002D]/35 blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#AB1E2C]/25 blur-[110px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Column: Mission, Value Proposition & Primary CTAs */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[#ff4d73]/40 bg-[#5101be]/40 px-4 py-1.5 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-[#ff4d73] eco-pulse-ring" />
              <span className="text-xs font-bold uppercase tracking-wider text-purple-100">
                EcoVibe Civic Action & AI Telemetry
              </span>
              <Badge variant="default" className="text-[11px] py-0.5 px-2">
                Gemini Vision + Gemma Dialect AI
              </Badge>
            </div>

            <h1
              id="hero-heading"
              tabIndex={-1}
              className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]"
            >
              Turn Neighborhood{" "}
              <span className="bg-gradient-to-r from-[#ff859d] via-[#ff4d73] to-[#AB1E2C] bg-clip-text text-transparent">
                Infrastructure Issues
              </span>{" "}
              Into Rapid Community Action.
            </h1>

            <p className="max-w-2xl text-base sm:text-lg text-purple-100/90 leading-relaxed">
              Snap a photo of{" "}
              <strong className="font-semibold text-white">
                uncollected trash, deep road hazards, clogged storm drains, or broken public facilities
              </strong>
              . EcoVibe uses multimodal AI to classify the issue, captures your exact GPS coordinates,
              logs dispatches directly to Google Sheets, and mobilizes local volunteers in their native dialect.
            </p>

            {/* Primary Call-To-Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Button
                type="button"
                size="lg"
                onClick={onReportIssueClick}
                className="group relative overflow-hidden bg-[#A8002D] hover:bg-[#AB1E2C] text-white font-bold text-base px-8 py-4 shadow-glow-red"
              >
                <Camera className="h-5 w-5 transition-transform group-hover:scale-110" aria-hidden="true" />
                <span>Report an Issue</span>
                <ArrowUpRight className="h-4 w-4 opacity-80 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={onCommunityChatClick}
                className="bg-[#5101be] hover:bg-[#6412d4] border-2 border-[#AB1E2C]/70 text-white font-bold text-base px-8 py-4 shadow-glow-purple"
              >
                <MessageSquareHeart className="h-5 w-5 text-[#ff859d]" aria-hidden="true" />
                <span>Community Chat</span>
                <span className="ml-1 rounded-full bg-[#A8002D] px-2 py-0.5 text-[11px] font-semibold text-white">
                  Gemma AI
                </span>
              </Button>
            </div>

            {/* Live Platform Impact Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-4 sm:gap-5">
              <div className="rounded-m3-lg border border-purple-400/30 bg-[#1b0240]/85 p-4 shadow-m3-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-white">
                  {totalIssues}
                </p>
                <p className="mt-1 text-xs font-medium text-purple-200/85 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-[#ff4d73]" aria-hidden="true" />
                  Geo-Pinned Reports
                </p>
              </div>
              <div className="rounded-m3-lg border border-purple-400/30 bg-[#1b0240]/85 p-4 shadow-m3-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-[#ff859d]">
                  96.4%
                </p>
                <p className="mt-1 text-xs font-medium text-purple-200/85 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-[#ff4d73]" aria-hidden="true" />
                  AI Auto-Triage Rate
                </p>
              </div>
              <div className="rounded-m3-lg border border-purple-400/30 bg-[#1b0240]/85 p-4 shadow-m3-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-white">
                  {activeVolunteers + resolvedCount}
                </p>
                <p className="mt-1 text-xs font-medium text-purple-200/85 flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-[#ff4d73]" aria-hidden="true" />
                  Active Volunteers
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive Architecture & AI Telemetry Preview Card */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-5"
          >
            <div className="relative rounded-m3-xl border-2 border-purple-400/35 bg-gradient-to-b from-[#2b0466]/95 via-[#1b0240]/95 to-[#12002b]/95 p-6 shadow-glow-purple">
              <div className="flex items-center justify-between border-b border-purple-400/25 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-m3-md bg-[#A8002D] text-white">
                    <Cpu className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">
                      End-to-End Civic Pipeline
                    </h2>
                    <p className="text-xs text-purple-200/80">
                      Real-time AI Vision → Geo Pin → Sheets Dispatch
                    </p>
                  </div>
                </div>
                <Badge variant="alert" className="uppercase tracking-wider text-[10px]">
                  Live Ready
                </Badge>
              </div>

              {/* Simulated Live Issue Card Inside Hero */}
              <div className="mt-5 space-y-4">
                <div className="relative overflow-hidden rounded-m3-lg border border-purple-300/30 bg-[#12002b]">
                  <img
                    src="https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80"
                    alt="Uncollected roadside municipal waste bags detected by EcoVibe AI"
                    className="h-44 w-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12002b] via-[#12002b]/30 to-transparent" />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#A8002D] px-3 py-1 text-xs font-bold text-white shadow-md">
                      <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                      Category: Waste (97% AI Match)
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-purple-100">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-[#ff4d73]" aria-hidden="true" />
                      8.4772° N, 124.6459° E • District 2
                    </span>
                    <span className="rounded bg-[#5101be]/90 px-2 py-0.5 font-mono text-[11px] text-purple-100">
                      #ECO-2026-101
                    </span>
                  </div>
                </div>

                {/* 3-Step Pipeline Status Pills */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between rounded-m3-md border border-purple-400/25 bg-[#20034d]/90 px-3.5 py-2.5">
                    <span className="flex items-center gap-2 font-medium text-purple-100">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden="true" />
                      1. Gemini Vision Auto-Classification
                    </span>
                    <span className="font-mono text-[11px] text-emerald-300">
                      Waste • High Severity
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-m3-md border border-purple-400/25 bg-[#20034d]/90 px-3.5 py-2.5">
                    <span className="flex items-center gap-2 font-medium text-purple-100">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden="true" />
                      2. Firebase Auth & Cloud Storage Bucket
                    </span>
                    <span className="font-mono text-[11px] text-purple-200">
                      issues/uid/photo.jpg
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-m3-md border border-[#AB1E2C]/50 bg-[#A8002D]/20 px-3.5 py-2.5">
                    <span className="flex items-center gap-2 font-medium text-white">
                      <FileSpreadsheet className="h-4 w-4 text-[#ff859d] shrink-0" aria-hidden="true" />
                      3. Google Workspace / Sheets API Sync
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[#ff859d]">
                      Issues_Log!A14:J14
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
