"use client";

import React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  MessageSquare,
  Mail,
  Loader2,
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

export interface EventJoinNotification {
  eventId: string;
  eventTitle: string;
  message: string;
  emailSent: boolean;
}

interface VolunteerEventsSectionProps {
  events: VolunteerEvent[];
  joinedEventIds: string[];
  joiningEventId?: string | null;
  joinNotification?: EventJoinNotification | null;
  onDismissNotification?: () => void;
  onToggleJoinEvent: (event: VolunteerEvent) => void;
  onAskGemmaAboutEvent: (prompt: string) => void;
}

export function VolunteerEventsSection({
  events,
  joinedEventIds,
  joiningEventId,
  joinNotification,
  onDismissNotification,
  onToggleJoinEvent,
  onAskGemmaAboutEvent,
}: VolunteerEventsSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="volunteer-events"
      aria-labelledby="volunteer-heading"
      className="py-14 bg-m3-surface-container-lowest transition-colors"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2
              id="volunteer-heading"
              className="text-2xl sm:text-3xl font-semibold tracking-tight text-m3-on-surface"
            >
              Upcoming volunteer events in Iligan City
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm sm:text-base text-m3-on-surface-variant">
              Join neighbors and student volunteers for weekend clean-up drives
              and tree planting across Iligan City.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              onAskGemmaAboutEvent("Unsay volunteer events karong Sabado?")
            }
          >
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            <span>Ask about events</span>
          </Button>
        </div>

        {/* Email Confirmation Status Banner */}
        <AnimatePresence>
          {joinNotification && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              role="status"
              aria-live="polite"
              className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-m3-md border border-m3-outline-variant bg-m3-primary-container px-4 py-3.5 text-sm text-m3-on-primary-container"
            >
              <div className="flex items-start sm:items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
                <div>
                  <p className="font-medium">
                    Registered for {joinNotification.eventTitle}
                  </p>
                  <p className="text-xs opacity-90">
                    {joinNotification.message}
                  </p>
                </div>
              </div>
              {onDismissNotification && (
                <button
                  type="button"
                  onClick={onDismissNotification}
                  className="self-end sm:self-auto shrink-0 rounded-m3-full bg-m3-primary px-3 py-1 text-xs font-medium text-m3-on-primary hover:brightness-105"
                >
                  Dismiss
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {events.map((evt, idx) => {
            const isJoined = joinedEventIds.includes(evt.id);
            const isJoining = joiningEventId === evt.id;
            const currentParticipants =
              evt.participantsCount + (isJoined ? 1 : 0);

            return (
              <motion.div
                key={evt.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.06 }}
              >
                <Card className="flex h-full flex-col justify-between">
                  <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="secondary">{evt.category}</Badge>
                      <span className="text-xs font-medium text-m3-on-surface-variant">
                        {evt.date}
                      </span>
                    </div>
                    <CardTitle className="text-base leading-snug pt-1">
                      {evt.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Hosted by {evt.organizer}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-xs text-m3-on-surface-variant leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="space-y-1.5 rounded-m3-sm bg-m3-surface p-3 text-xs text-m3-on-surface border border-m3-outline-variant">
                      <div className="flex items-center gap-2">
                        <Clock
                          className="h-3.5 w-3.5 text-m3-primary-text shrink-0"
                          aria-hidden="true"
                        />
                        <span>
                          {evt.date} • {evt.timeRange}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin
                          className="h-3.5 w-3.5 text-m3-primary-text shrink-0"
                          aria-hidden="true"
                        />
                        <span>{evt.locationName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users
                          className="h-3.5 w-3.5 text-m3-primary-text shrink-0"
                          aria-hidden="true"
                        />
                        <span>
                          {currentParticipants} / {evt.maxParticipants}{" "}
                          volunteers going
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-2">
                    <Button
                      type="button"
                      variant={isJoined ? "secondary" : "default"}
                      disabled={isJoining}
                      onClick={() => onToggleJoinEvent(evt)}
                      aria-pressed={isJoined}
                      className="w-full"
                    >
                      {isJoining ? (
                        <>
                          <Loader2
                            className="h-4 w-4 animate-spin"
                            aria-hidden="true"
                          />
                          <span>Joining & sending email...</span>
                        </>
                      ) : isJoined ? (
                        <>
                          <CheckCircle2
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                          <span>Going (Click to cancel)</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="h-4 w-4" aria-hidden="true" />
                          <span>Join event</span>
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
    </section>
  );
}
