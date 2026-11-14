"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Send,
  Trash2,
  Users,
  X,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventParticipantRecord, VolunteerEvent } from "@/types/ecovibe";
import { useAuth } from "@/hooks/use-auth";
import {
  subscribeToEvents,
  saveEventToDatabase,
  deleteEventFromDatabase,
  subscribeToAllEventParticipants,
  leaveEventInDatabase,
} from "@/lib/firebase/database";
import {
  CreatedSpreadsheetResult,
  downloadEventParticipantsCsv,
  exportEventParticipantsToUserSpreadsheet,
} from "@/lib/google-sheets-oauth";
import {
  SendParticipantsEmailOutcome,
  sendParticipantsEmailWithCurrentGmail,
} from "@/lib/gmail-oauth";
import { AdminShell } from "@/components/ecovibe/admin-shell";
import {
  EVENT_CATEGORIES,
  ILIGAN_LOCATION_PRESETS,
  LocationPickerMap,
} from "@/components/ecovibe/location-picker-map";

function buildDefaultEventEmailSubject(event: VolunteerEvent): string {
  return `[Ecovibe Iligan] ${event.title} (${event.date}) — Volunteer Update`;
}

function buildDefaultEventEmailBody(event: VolunteerEvent): string {
  return [
    "Maayong adlaw, Volunteers!",
    "",
    `Thank you for registering for "${event.title}" through Ecovibe Iligan City.`,
    "",
    "Here are the details for our upcoming volunteer activity:",
    `• Event: ${event.title}`,
    `• Date: ${event.date}`,
    `• Time: ${event.timeRange}`,
    `• Meeting Point / Location: ${event.locationName}`,
    `• Organizer: ${event.organizer}`,
    "",
    event.description,
    "",
    "Please arrive 15 minutes early and bring a reusable water bottle. Feel free to reply to this email if you have any questions.",
    "",
    "Daghang salamat,",
    event.organizer,
    "Ecovibe Iligan City Community Team",
  ].join("\n");
}

export default function AdminEventDetailPage() {
  const params = useParams<{ eventId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const eventId = decodeURIComponent(params.eventId || "");

  const [events, setEvents] = useState<VolunteerEvent[]>([]);
  const [participantsByEvent, setParticipantsByEvent] = useState<
    Record<string, EventParticipantRecord[]>
  >({});

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Edit form fields
  const [editTitle, setEditTitle] = useState<string>("");
  const [editCategory, setEditCategory] =
    useState<VolunteerEvent["category"]>("Community Clean-Up");
  const [editCustomCategory, setEditCustomCategory] = useState<string>("");
  const [editDate, setEditDate] = useState<string>("");
  const [editTimeRange, setEditTimeRange] = useState<string>("");
  const [editOrganizer, setEditOrganizer] = useState<string>("");
  const [editLocationName, setEditLocationName] = useState<string>("");
  const [editLat, setEditLat] = useState<number>(8.232);
  const [editLng, setEditLng] = useState<number>(124.244);
  const [editMaxParticipants, setEditMaxParticipants] = useState<number>(100);
  const [editDescription, setEditDescription] = useState<string>("");

  const [participantSearch, setParticipantSearch] = useState<string>("");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [createdSheet, setCreatedSheet] =
    useState<CreatedSpreadsheetResult | null>(null);

  // Email Participants composer state
  const [isEmailComposerOpen, setIsEmailComposerOpen] = useState<boolean>(true);
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [emailBody, setEmailBody] = useState<string>("");
  const [hasInitializedEmailTemplate, setHasInitializedEmailTemplate] =
    useState<boolean>(false);
  const [extraBccEmails, setExtraBccEmails] = useState<string[]>([]);
  const [extraBccInput, setExtraBccInput] = useState<string>("");
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailOutcome, setEmailOutcome] =
    useState<SendParticipantsEmailOutcome | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToEvents((liveEvents) => {
      setEvents(liveEvents);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAllEventParticipants((byEvent) => {
      setParticipantsByEvent(byEvent);
    });
    return () => unsubscribe();
  }, []);

  const event = useMemo(() => {
    return events.find((e) => e.id === eventId) || null;
  }, [events, eventId]);

  // Populate edit form and pre-filled Email Subject & Body whenever event loads
  useEffect(() => {
    if (event && !isEditing) {
      setEditTitle(event.title);
      if (EVENT_CATEGORIES.includes(event.category)) {
        setEditCategory(event.category);
        setEditCustomCategory("");
      } else {
        setEditCategory("Other");
        setEditCustomCategory(event.category);
      }
      setEditDate(event.date);
      setEditTimeRange(event.timeRange);
      setEditOrganizer(event.organizer);
      setEditLocationName(event.locationName);
      setEditLat(event.coordinates.lat);
      setEditLng(event.coordinates.lng);
      setEditMaxParticipants(event.maxParticipants);
      setEditDescription(event.description);
    }
    if (event && !hasInitializedEmailTemplate) {
      setEmailSubject(buildDefaultEventEmailSubject(event));
      setEmailBody(buildDefaultEventEmailBody(event));
      setHasInitializedEmailTemplate(true);
    }
  }, [event, isEditing, hasInitializedEmailTemplate]);

  // All registered participant emails (ALWAYS attached as BCC)
  const participantBccEmails = useMemo(() => {
    const list = participantsByEvent[eventId] || [];
    const seen = new Set<string>();
    const result: string[] = [];
    for (const p of list) {
      const raw = (p.userEmail || "").trim();
      if (raw && raw.includes("@")) {
        const lower = raw.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          result.push(raw);
        }
      }
    }
    return result;
  }, [participantsByEvent, eventId]);

  const allBccEmails = useMemo(() => {
    const seen = new Set<string>();
    const merged: string[] = [];
    for (const email of [...participantBccEmails, ...extraBccEmails]) {
      const trimmed = email.trim();
      if (trimmed && trimmed.includes("@")) {
        const lower = trimmed.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          merged.push(trimmed);
        }
      }
    }
    return merged;
  }, [participantBccEmails, extraBccEmails]);

  const participants = useMemo(() => {
    const list = participantsByEvent[eventId] || [];
    const q = participantSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.userName.toLowerCase().includes(q) ||
        (p.userEmail || "").toLowerCase().includes(q) ||
        p.uid.toLowerCase().includes(q)
    );
  }, [participantsByEvent, eventId, participantSearch]);

  const handleSaveChanges = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!event) return;

    setIsSaving(true);
    setSaveNotice(null);

    const resolvedCategory =
      editCategory === "Other" && editCustomCategory.trim()
        ? editCustomCategory.trim()
        : editCategory;

    const updatedEvent: VolunteerEvent = {
      ...event,
      title: editTitle.trim() || event.title,
      category: resolvedCategory,
      date: editDate.trim() || event.date,
      timeRange: editTimeRange.trim() || event.timeRange,
      organizer: editOrganizer.trim() || event.organizer,
      locationName: editLocationName.trim() || event.locationName,
      coordinates: {
        ...event.coordinates,
        lat: Number(editLat) || event.coordinates.lat,
        lng: Number(editLng) || event.coordinates.lng,
        addressLabel: editLocationName.trim() || event.locationName,
      },
      maxParticipants: Math.max(5, Number(editMaxParticipants) || 100),
      description: editDescription.trim() || event.description,
    };

    try {
      await saveEventToDatabase(updatedEvent);
      setIsEditing(false);
      setSaveNotice("Event details updated.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!event) return;
    await deleteEventFromDatabase(event.id);
    router.push("/dashboard/admin");
  };

  const handleRemoveParticipant = async (uid: string) => {
    if (!event) return;
    await leaveEventInDatabase({ uid, eventId: event.id });
  };

  const handleExportToGoogleSheet = async () => {
    if (!event) return;
    setIsExporting(true);
    setCreatedSheet(null);

    try {
      const fullList = participantsByEvent[event.id] || [];
      const result = await exportEventParticipantsToUserSpreadsheet(
        event,
        fullList
      );
      setCreatedSheet(result);
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddExtraBcc = () => {
    const candidate = extraBccInput.trim();
    if (!candidate || !candidate.includes("@")) return;
    setExtraBccEmails((prev) =>
      prev.some((e) => e.toLowerCase() === candidate.toLowerCase())
        ? prev
        : [...prev, candidate]
    );
    setExtraBccInput("");
  };

  const handleRemoveExtraBcc = (emailToRemove: string) => {
    setExtraBccEmails((prev) =>
      prev.filter((e) => e.toLowerCase() !== emailToRemove.toLowerCase())
    );
  };

  const handleResetEmailTemplate = () => {
    if (!event) return;
    setEmailSubject(buildDefaultEventEmailSubject(event));
    setEmailBody(buildDefaultEventEmailBody(event));
  };

  const handleSendParticipantsEmail = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!event || !emailSubject.trim() || !emailBody.trim()) return;

    setIsSendingEmail(true);
    setEmailOutcome(null);

    try {
      const outcome = await sendParticipantsEmailWithCurrentGmail({
        event,
        senderEmail: user.email || "",
        senderName: user.displayName || "Ecovibe Admin",
        bccEmails: allBccEmails,
        subject: emailSubject.trim(),
        body: emailBody.trim(),
      });
      setEmailOutcome(outcome);
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <AdminShell
      backHref="/dashboard/admin"
      backLabel="Back to Admin Dashboard"
    >
      {!event ? (
        <div className="mx-auto max-w-lg py-16">
          <Card>
            <CardHeader>
              <CardTitle>Event not found</CardTitle>
              <CardDescription>
                This volunteer event may have been removed or does not exist.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button type="button" asChild>
                <Link href="/dashboard/admin">Return to Admin Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Event Header & Primary Actions */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{event.category}</Badge>
                <span className="text-xs text-m3-on-surface-variant flex items-center gap-1">
                  <Calendar
                    className="h-3.5 w-3.5 text-m3-primary-text"
                    aria-hidden="true"
                  />
                  {event.date}
                </span>
                <span className="text-xs text-m3-on-surface-variant flex items-center gap-1">
                  <Clock
                    className="h-3.5 w-3.5 text-m3-primary-text"
                    aria-hidden="true"
                  />
                  {event.timeRange}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-m3-on-surface">
                {event.title}
              </h1>

              <p className="text-sm text-m3-on-surface-variant flex items-center gap-1.5">
                <MapPin
                  className="h-4 w-4 text-m3-primary-text shrink-0"
                  aria-hidden="true"
                />
                <span>
                  {event.locationName} • Hosted by {event.organizer}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                type="button"
                variant={isEmailComposerOpen ? "default" : "secondary"}
                size="sm"
                aria-label="Email participants"
                title="Email participants"
                aria-expanded={isEmailComposerOpen}
                aria-controls="email-participants-section"
                onClick={() => {
                  setIsEmailComposerOpen((prev) => {
                    const next = !prev;
                    if (next) {
                      setTimeout(() => {
                        document
                          .getElementById("email-participants-section")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }, 50);
                    }
                    return next;
                  });
                }}
                className="h-9 w-9 shrink-0 aspect-square p-0 sm:aspect-auto sm:w-auto sm:px-4"
              >
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Email participants</span>
              </Button>

              <Button
                type="button"
                variant={isEditing ? "secondary" : "outline"}
                size="sm"
                aria-label={isEditing ? "Close editor" : "Edit event"}
                title={isEditing ? "Close editor" : "Edit event"}
                onClick={() => setIsEditing((v) => !v)}
                className="h-9 w-9 shrink-0 aspect-square p-0 sm:aspect-auto sm:w-auto sm:px-4"
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="hidden sm:inline">Close editor</span>
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="hidden sm:inline">Edit event</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label="Delete event"
                title="Delete event"
                onClick={handleDeleteEvent}
                className="h-9 w-9 shrink-0 aspect-square p-0 sm:aspect-auto sm:w-auto sm:px-4 text-m3-error hover:text-m3-error"
              >
                <Trash2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Delete event</span>
              </Button>
            </div>
          </div>

          {/* Save Notice Banner */}
          {saveNotice && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center justify-between gap-3 rounded-m3-md border border-m3-outline-variant bg-m3-primary-container px-4 py-3 text-sm text-m3-on-primary-container"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{saveNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setSaveNotice(null)}
                className="rounded-m3-full px-3 py-1 text-xs font-medium hover:bg-black/10"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Created Google Sheet Banner */}
          {createdSheet && (
            <div
              role="status"
              aria-live="polite"
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-m3-md border border-m3-outline-variant bg-m3-primary-container px-4 py-3.5 text-sm text-m3-on-primary-container"
            >
              <div className="flex items-start sm:items-center gap-2.5">
                <CheckCircle2
                  className="h-5 w-5 shrink-0 mt-0.5 sm:mt-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-medium">
                    {createdSheet.mode === "google-sheets"
                      ? `Created new Google Sheet: ${createdSheet.title}`
                      : `Exported spreadsheet: ${createdSheet.title}`}
                  </p>
                  <p className="text-xs opacity-90">
                    {createdSheet.notice ||
                      `Exported ${createdSheet.rowCount} participant records to your Google account.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={createdSheet.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-m3-full bg-m3-primary px-4 py-1.5 text-xs font-medium text-m3-on-primary hover:brightness-105"
                >
                  <span>
                    {createdSheet.mode === "google-sheets"
                      ? "Open in Google Sheets"
                      : "Open Google Sheets"}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
                <button
                  type="button"
                  onClick={() => setCreatedSheet(null)}
                  className="rounded-m3-full px-3 py-1.5 text-xs font-medium hover:bg-black/10"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Edit Event Form (when toggled) */}
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Edit event details</CardTitle>
                <CardDescription>
                  Update the event schedule, pin its location on the Iligan City
                  map, or edit its description.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveChanges} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-title">Event title *</Label>
                      <Input
                        id="edit-title"
                        required
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="edit-category">Category</Label>
                      <Select
                        value={editCategory}
                        onValueChange={(val) =>
                          setEditCategory(val as VolunteerEvent["category"])
                        }
                      >
                        <SelectTrigger id="edit-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {editCategory === "Other" && (
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-custom-category">
                        Specify category (optional)
                      </Label>
                      <Input
                        id="edit-custom-category"
                        value={editCustomCategory}
                        onChange={(e) => setEditCustomCategory(e.target.value)}
                        placeholder="e.g., Coastal Mangrove Restoration..."
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-date">Date *</Label>
                      <Input
                        id="edit-date"
                        required
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="edit-time">Time range *</Label>
                      <Input
                        id="edit-time"
                        required
                        value={editTimeRange}
                        onChange={(e) => setEditTimeRange(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="edit-max">Max volunteers *</Label>
                      <Input
                        id="edit-max"
                        type="number"
                        min={5}
                        max={2000}
                        required
                        value={editMaxParticipants}
                        onChange={(e) =>
                          setEditMaxParticipants(Number(e.target.value))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-preset">
                        Quick location preset in Iligan City
                      </Label>
                      <Select
                        value={
                          ILIGAN_LOCATION_PRESETS.some(
                            (p) => p.label === editLocationName
                          )
                            ? editLocationName
                            : ILIGAN_LOCATION_PRESETS[0].label
                        }
                        onValueChange={(val) => {
                          const found = ILIGAN_LOCATION_PRESETS.find(
                            (p) => p.label === val
                          );
                          if (found) {
                            setEditLocationName(found.label);
                            setEditLat(found.lat);
                            setEditLng(found.lng);
                          }
                        }}
                      >
                        <SelectTrigger id="edit-preset">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ILIGAN_LOCATION_PRESETS.map((preset) => (
                            <SelectItem key={preset.label} value={preset.label}>
                              {preset.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="edit-organizer">Organizer *</Label>
                      <Input
                        id="edit-organizer"
                        required
                        value={editOrganizer}
                        onChange={(e) => setEditOrganizer(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-location-name">
                      Location / Barangay address *
                    </Label>
                    <Input
                      id="edit-location-name"
                      required
                      value={editLocationName}
                      onChange={(e) => setEditLocationName(e.target.value)}
                    />
                  </div>

                  {/* Interactive Google Maps Pin Picker */}
                  <div className="space-y-1.5">
                    <Label>Pin event location on Google Maps</Label>
                    <LocationPickerMap
                      lat={editLat}
                      lng={editLng}
                      onChange={(nextLat, nextLng) => {
                        setEditLat(nextLat);
                        setEditLng(nextLng);
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-desc">Description *</Label>
                    <Textarea
                      id="edit-desc"
                      required
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2
                            className="h-4 w-4 animate-spin"
                            aria-hidden="true"
                          />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                          <span>Save changes</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            /* Event Overview Card */
            <Card>
              <CardContent className="p-5 space-y-3">
                <p className="text-sm text-m3-on-surface leading-relaxed">
                  {event.description}
                </p>
                <div className="flex flex-wrap items-center gap-6 pt-1 text-xs text-m3-on-surface-variant">
                  <span>
                    <strong className="text-m3-on-surface">
                      {(participantsByEvent[event.id] || []).length}
                    </strong>{" "}
                    registered participants
                  </span>
                  <span>
                    <strong className="text-m3-on-surface">
                      {event.maxParticipants}
                    </strong>{" "}
                    max capacity
                  </span>
                  <span>
                    Coordinates: {event.coordinates.lat.toFixed(4)}° N,{" "}
                    {event.coordinates.lng.toFixed(4)}° E
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Email Participants Section (Uses Current Gmail to Self + All Participants ALWAYS in BCC) */}
          {isEmailComposerOpen && (
            <Card id="email-participants-section">
              <CardHeader className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle
                    id="email-participants-heading"
                    className="flex items-center gap-2 text-base sm:text-lg"
                  >
                    <Mail
                      className="h-5 w-5 text-m3-primary-text shrink-0"
                      aria-hidden="true"
                    />
                    <span>Email participants</span>
                  </CardTitle>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetEmailTemplate}
                    aria-label="Reset pre-filled subject and body"
                    title="Reset pre-filled subject and body"
                    className="h-8 w-8 shrink-0 aspect-square p-0 sm:aspect-auto sm:w-auto sm:px-3 text-xs"
                  >
                    <RotateCcw className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="hidden sm:inline">Reset template</span>
                  </Button>
                </div>
                <CardDescription>
                  Sends from your current Gmail account ({user.email || "signed-in account"}) addressed to itself, with all participant email addresses always attached in BCC.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {emailOutcome && (
                  <div
                    role={emailOutcome.sent ? "status" : "alert"}
                    aria-live={emailOutcome.sent ? "polite" : "assertive"}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-m3-md border border-m3-outline-variant px-4 py-3.5 text-sm ${
                      emailOutcome.sent
                        ? "bg-m3-primary-container text-m3-on-primary-container"
                        : "bg-m3-error-container text-m3-on-error-container"
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-2.5">
                      {emailOutcome.sent ? (
                        <CheckCircle2
                          className="h-5 w-5 shrink-0 mt-0.5 sm:mt-0"
                          aria-hidden="true"
                        />
                      ) : (
                        <AlertCircle
                          className="h-5 w-5 shrink-0 mt-0.5 sm:mt-0"
                          aria-hidden="true"
                        />
                      )}
                      <div>
                        <p className="font-medium">
                          {emailOutcome.sent
                            ? "Email sent directly via Gmail API"
                            : "Could not send email via Gmail API"}
                        </p>
                        <p className="text-xs opacity-90">
                          {emailOutcome.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEmailOutcome(null)}
                        className="rounded-m3-full px-3 py-1.5 text-xs font-medium hover:bg-black/10"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}

                <form
                  method="POST"
                  aria-labelledby="email-participants-heading"
                  onSubmit={handleSendParticipantsEmail}
                  className="space-y-4"
                >
                  {/* To (Self) & BCC (Always Attached) Summary Box */}
                  <div className="rounded-m3-md border border-m3-outline-variant bg-m3-surface-container-low p-4 space-y-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-m3-outline-variant pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-m3-on-surface">
                          To (Current Gmail):
                        </span>
                        <span className="font-mono text-m3-on-surface-variant">
                          {user.email || "Current signed-in Gmail"}
                        </span>
                      </div>
                      <Badge variant="secondary">Sends to self</Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-m3-on-surface">
                          BCC (All participant emails always attached):
                        </span>
                        <Badge variant="default">
                          {allBccEmails.length} in BCC
                        </Badge>
                      </div>

                      {allBccEmails.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {participantBccEmails.map((email) => (
                            <span
                              key={`part-${email}`}
                              className="inline-flex items-center gap-1.5 rounded-m3-full border border-m3-outline-variant bg-m3-surface px-2.5 py-1 font-mono text-[11px] text-m3-on-surface"
                            >
                              <span>{email}</span>
                            </span>
                          ))}
                          {extraBccEmails.map((email) => (
                            <span
                              key={`extra-${email}`}
                              className="inline-flex items-center gap-1 rounded-m3-full bg-m3-secondary-container px-2.5 py-1 font-mono text-[11px] text-m3-on-secondary-container"
                            >
                              <span>{email}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveExtraBcc(email)}
                                aria-label={`Remove extra BCC ${email}`}
                                className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-black/10"
                              >
                                <X className="h-3 w-3" aria-hidden="true" />
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-m3-on-surface-variant">
                          No participant email addresses registered yet. Any
                          registered participant emails are automatically
                          attached in BCC, or you can add BCC recipients below.
                        </p>
                      )}

                      {/* Optional Extra BCC Email Input */}
                      <div className="pt-1 flex items-center gap-2 max-w-md">
                        <Label
                          htmlFor="extra-bcc-email"
                          className="visually-hidden"
                        >
                          Add additional BCC email address
                        </Label>
                        <Input
                          id="extra-bcc-email"
                          name="extraBccEmail"
                          type="email"
                          autoComplete="email"
                          autoCorrect="off"
                          autoCapitalize="none"
                          spellCheck={false}
                          value={extraBccInput}
                          onChange={(e) => setExtraBccInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddExtraBcc();
                            }
                          }}
                          placeholder="Add extra BCC email (optional)..."
                          className="min-h-[36px] py-1 px-3 text-xs"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={handleAddExtraBcc}
                          aria-label="Add BCC email"
                          title="Add BCC email"
                          className="h-9 w-9 shrink-0 aspect-square p-0 sm:aspect-auto sm:w-auto sm:px-3 text-xs"
                        >
                          <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span className="hidden sm:inline">Add BCC</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Pre-filled Subject Field */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email-subject">
                      Subject{" "}
                      <span aria-hidden="true" className="text-m3-primary-text">
                        *
                      </span>
                    </Label>
                    <span
                      id="email-subject-hint"
                      className="block text-xs text-m3-on-surface-variant"
                    >
                      Pre-filled with the Ecovibe app name, event title, and
                      schedule.
                    </span>
                    <Input
                      id="email-subject"
                      name="subject"
                      type="text"
                      required
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      aria-describedby="email-subject-hint"
                    />
                  </div>

                  {/* Pre-filled Email Body Field */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email-body">
                      Email body{" "}
                      <span aria-hidden="true" className="text-m3-primary-text">
                        *
                      </span>
                    </Label>
                    <span
                      id="email-body-hint"
                      className="block text-xs text-m3-on-surface-variant"
                    >
                      Write or customize the message that will be sent to all
                      event participants in BCC.
                    </span>
                    <Textarea
                      id="email-body"
                      name="body"
                      rows={9}
                      required
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      aria-describedby="email-body-hint"
                      className="min-h-[200px] font-sans text-sm leading-relaxed"
                    />
                  </div>

                  {/* Send Actions */}
                  <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-m3-outline-variant">
                    <Button
                      type="submit"
                      disabled={
                        isSendingEmail ||
                        !emailSubject.trim() ||
                        !emailBody.trim()
                      }
                      aria-label="Send email to participants"
                      title="Send email to participants"
                      className="h-9 w-9 shrink-0 aspect-square p-0 sm:h-10 sm:aspect-auto sm:w-auto sm:px-5"
                    >
                      {isSendingEmail ? (
                        <>
                          <Loader2
                            className="h-4 w-4 animate-spin shrink-0"
                            aria-hidden="true"
                          />
                          <span className="hidden sm:inline">
                            Sending email...
                          </span>
                        </>
                      ) : (
                        <>
                          <Send
                            className="h-4 w-4 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="hidden sm:inline">
                            Send email ({allBccEmails.length} BCC)
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Participants Roster & Export Card */}
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users
                      className="h-5 w-5 text-m3-primary-text"
                      aria-hidden="true"
                    />
                    <span>
                      Registered participants (
                      {(participantsByEvent[event.id] || []).length})
                    </span>
                  </CardTitle>
                  <CardDescription>
                    View volunteer contact details or export this event&apos;s
                    participant roster to Google Sheets or CSV.
                  </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    disabled={isExporting}
                    aria-label="Export to Google Sheets"
                    title="Export to Google Sheets"
                    onClick={handleExportToGoogleSheet}
                    className="h-9 w-9 shrink-0 aspect-square p-0 sm:aspect-auto sm:w-auto sm:px-4"
                  >
                    {isExporting ? (
                      <>
                        <Loader2
                          className="h-4 w-4 animate-spin shrink-0"
                          aria-hidden="true"
                        />
                        <span className="hidden sm:inline">Exporting...</span>
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet
                          className="h-4 w-4 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="hidden sm:inline">
                          Export to Google Sheets
                        </span>
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    aria-label="Download CSV"
                    title="Download CSV"
                    onClick={() =>
                      downloadEventParticipantsCsv(
                        event,
                        participantsByEvent[event.id] || []
                      )
                    }
                    className="h-9 w-9 shrink-0 aspect-square p-0 sm:aspect-auto sm:w-auto sm:px-4"
                  >
                    <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="hidden sm:inline">Download CSV</span>
                  </Button>
                </div>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-m3-on-surface-variant"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  placeholder="Search participants by name or email..."
                  className="min-h-[40px] pl-10 py-1.5 text-sm"
                />
              </div>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto rounded-m3-md border border-m3-outline-variant">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-m3-outline-variant bg-m3-surface-container text-xs font-medium text-m3-on-surface-variant">
                    <tr>
                      <th className="p-3.5 w-12">#</th>
                      <th className="p-3.5">Participant Name</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">User UID</th>
                      <th className="p-3.5">Joined At</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-m3-outline-variant bg-m3-surface">
                    {participants.map((p, index) => (
                      <tr
                        key={`${event.id}-${p.uid}`}
                        className="hover:bg-m3-surface-container-lowest"
                      >
                        <td className="p-3.5 text-m3-on-surface-variant">
                          {index + 1}
                        </td>
                        <td className="p-3.5 font-medium text-m3-on-surface">
                          {p.userName}
                        </td>
                        <td className="p-3.5 text-m3-on-surface-variant">
                          {p.userEmail || "Not provided"}
                        </td>
                        <td className="p-3.5 font-mono text-xs text-m3-on-surface-variant">
                          {p.uid}
                        </td>
                        <td className="p-3.5 text-m3-on-surface-variant">
                          {new Date(p.joinedAt).toLocaleString()}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => void handleRemoveParticipant(p.uid)}
                            aria-label={`Remove ${p.userName}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-m3-on-surface-variant hover:bg-m3-surface-container-high hover:text-m3-error transition-colors"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {participants.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-8 text-center text-xs text-m3-on-surface-variant"
                        >
                          <Users
                            className="mx-auto mb-1.5 h-5 w-5 opacity-60"
                            aria-hidden="true"
                          />
                          No participants found for this event.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminShell>
  );
}
