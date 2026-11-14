"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarHeart,
  MapPin,
  Clock,
  Users,
  Sparkles,
  CheckCircle2,
  MessageSquareHeart,
  Database,
  ShieldCheck,
  FileSpreadsheet,
  HardDriveUpload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VolunteerEvent } from "@/types/ecovibe";

interface VolunteerEventsSectionProps {
  events: VolunteerEvent[];
  joinedEventIds: string[];
  onToggleJoinEvent: (event: VolunteerEvent) => void;
  onAskGemmaAboutEvent: (prompt: string) => void;
}

export function VolunteerEventsSection({
  events,
  joinedEventIds,
  onToggleJoinEvent,
  onAskGemmaAboutEvent,
}: VolunteerEventsSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="volunteer-events"
      aria-labelledby="volunteer-heading"
      className="py-16 border-b border-purple-400/20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Volunteer Events Grid */}
        <div>
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <Badge variant="default" className="mb-3">
                <CalendarHeart className="h-3.5 w-3.5" aria-hidden="true" />
                Community Mobilization & EcoPoints
              </Badge>
              <h2
                id="volunteer-heading"
                className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white"
              >
                Upcoming Volunteer Events & Clean-Up Sprints
              </h2>
              <p className="mt-2 max-w-2xl text-purple-200/85">
                Join local citizen drives to resolve reported infrastructure and environmental issues.
                Need details in Bisaya, Tagalog, or English? Ask the{" "}
                <strong className="text-white">Gemma Community Chatbot</strong> anytime.
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                onAskGemmaAboutEvent("Unsay volunteer events karong Sabado?")
              }
              className="border border-[#AB1E2C]/60"
            >
              <MessageSquareHeart className="h-4 w-4 text-[#ff859d]" aria-hidden="true" />
              <span>Ask Gemma in Local Dialect</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {events.map((evt, idx) => {
              const isJoined = joinedEventIds.includes(evt.id);
              const currentParticipants =
                evt.participantsCount + (isJoined ? 1 : 0);

              return (
                <motion.div
                  key={evt.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.08 }}
                >
                  <Card className="flex h-full flex-col justify-between border-purple-400/35 bg-[#1b0240]/95 hover:border-[#AB1E2C]/80 transition-colors">
                    <CardHeader className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="secondary" className="text-[11px]">
                          {evt.category}
                        </Badge>
                        <span className="rounded-full bg-[#A8002D]/90 px-2.5 py-0.5 text-xs font-extrabold text-white">
                          +{evt.pointsReward} EcoPoints
                        </span>
                      </div>
                      <CardTitle className="text-lg leading-snug">
                        {evt.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-purple-200">
                        Organized by{" "}
                        <strong className="text-white">{evt.organizer}</strong>
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-xs text-purple-100/90 leading-relaxed">
                        {evt.description}
                      </p>

                      <div className="space-y-1.5 rounded-m3-md border border-purple-400/25 bg-[#12002b]/80 p-3 text-xs text-purple-100">
                        <div className="flex items-center gap-2">
                          <Clock
                            className="h-3.5 w-3.5 text-[#ff4d73] shrink-0"
                            aria-hidden="true"
                          />
                          <span>
                            {evt.date} • {evt.timeRange}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin
                            className="h-3.5 w-3.5 text-[#ff4d73] shrink-0"
                            aria-hidden="true"
                          />
                          <span>{evt.locationName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users
                            className="h-3.5 w-3.5 text-emerald-400 shrink-0"
                            aria-hidden="true"
                          />
                          <span>
                            <strong className="text-white">
                              {currentParticipants}
                            </strong>{" "}
                            / {evt.maxParticipants} Volunteers Registered
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {evt.dialectTags.map((d) => (
                          <span
                            key={d}
                            className="rounded-full border border-purple-400/30 bg-[#5101be]/30 px-2.5 py-0.5 text-[10px] font-semibold text-purple-200"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-2 flex gap-2">
                      <Button
                        type="button"
                        variant={isJoined ? "secondary" : "default"}
                        onClick={() => onToggleJoinEvent(evt)}
                        aria-pressed={isJoined}
                        className="w-full font-bold"
                      >
                        {isJoined ? (
                          <>
                            <CheckCircle2
                              className="h-4 w-4 text-emerald-300"
                              aria-hidden="true"
                            />
                            <span>Registered (Click to Cancel)</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" aria-hidden="true" />
                            <span>Join Event (+{evt.pointsReward} pts)</span>
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Cloud & Serverless Integration Architecture Overview */}
        <div
          id="architecture"
          className="rounded-m3-xl border border-purple-400/35 bg-gradient-to-r from-[#1b0240] via-[#20034d] to-[#1b0240] p-6 sm:p-8 shadow-m3-2"
        >
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Database className="h-5 w-5 text-[#ff4d73]" aria-hidden="true" />
                System Architecture & Hook Integration Readiness
              </h3>
              <p className="text-xs sm:text-sm text-purple-200/85 mt-1">
                Decoupled frontend hooks and Next.js App Router serverless endpoints ready for drop-in production credentials.
              </p>
            </div>
            <Badge variant="outline" className="self-start sm:self-center">
              .env.local Ready
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-m3-lg border border-purple-400/30 bg-[#12002b]/85 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-bold text-white">
                  <ShieldCheck
                    className="h-4 w-4 text-emerald-400"
                    aria-hidden="true"
                  />
                  Firebase Authentication
                </span>
                <span className="rounded bg-[#5101be] px-2 py-0.5 font-mono text-[10px] text-purple-100">
                  useAuth()
                </span>
              </div>
              <p className="text-xs text-purple-200/85 leading-relaxed">
                Modularized in <code className="text-[#ff859d]">src/lib/firebase/auth.ts</code>{" "}
                supporting Google OAuth & Anonymous Citizen sessions with EcoPoints persistence.
              </p>
            </div>

            <div className="rounded-m3-lg border border-purple-400/30 bg-[#12002b]/85 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-bold text-white">
                  <HardDriveUpload
                    className="h-4 w-4 text-[#ff4d73]"
                    aria-hidden="true"
                  />
                  Firebase Cloud Storage
                </span>
                <span className="rounded bg-[#5101be] px-2 py-0.5 font-mono text-[10px] text-purple-100">
                  useStorage()
                </span>
              </div>
              <p className="text-xs text-purple-200/85 leading-relaxed">
                Structured in <code className="text-[#ff859d]">src/lib/firebase/storage.ts</code>{" "}
                for resumable bucket uploads (<code className="text-purple-100">issues/&#123;uid&#125;/...</code>) and progress telemetry.
              </p>
            </div>

            <div className="rounded-m3-lg border border-[#AB1E2C]/50 bg-[#12002b]/85 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-bold text-white">
                  <FileSpreadsheet
                    className="h-4 w-4 text-[#ff859d]"
                    aria-hidden="true"
                  />
                  Google Workspace / Sheets API
                </span>
                <span className="rounded bg-[#A8002D] px-2 py-0.5 font-mono text-[10px] text-white">
                  useSheetsSync()
                </span>
              </div>
              <p className="text-xs text-purple-200/85 leading-relaxed">
                Serverless endpoint at{" "}
                <code className="text-[#ff859d]">/api/issues/sheets</code> appends categorized issues
                and GPS coordinates to <code className="text-purple-100">Issues_Log!A:J</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
