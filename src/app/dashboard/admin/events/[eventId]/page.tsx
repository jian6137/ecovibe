"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Loader2,
  MapPin,
  Pencil,
  Search,
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
import { UPCOMING_VOLUNTEER_EVENTS } from "@/lib/seed-data";
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
import { AdminShell } from "@/components/ecovibe/admin-shell";
import {
  EVENT_CATEGORIES,
  ILIGAN_LOCATION_PRESETS,
  LocationPickerMap,
} from "@/components/ecovibe/location-picker-map";

export default function AdminEventDetailPage() {
  const params = useParams<{ eventId: string }>();
  const router = useRouter();
  const eventId = decodeURIComponent(params.eventId || "");

  const [events, setEvents] = useState<VolunteerEvent[]>(
    UPCOMING_VOLUNTEER_EVENTS
  );
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

  // Populate edit form whenever event loads
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
  }, [event, isEditing]);

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
                variant={isEditing ? "secondary" : "outline"}
                size="sm"
                onClick={() => setIsEditing((v) => !v)}
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4" aria-hidden="true" />
                    <span>Close editor</span>
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    <span>Edit event</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDeleteEvent}
                className="text-m3-error hover:text-m3-error"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span>Delete event</span>
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

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={isExporting}
                    onClick={handleExportToGoogleSheet}
                  >
                    {isExporting ? (
                      <>
                        <Loader2
                          className="h-3.5 w-3.5 animate-spin"
                          aria-hidden="true"
                        />
                        <span>Exporting...</span>
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        <span>Export to Google Sheets</span>
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      downloadEventParticipantsCsv(
                        event,
                        participantsByEvent[event.id] || []
                      )
                    }
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Download CSV</span>
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
