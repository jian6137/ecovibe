"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, CheckCircle2, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { VolunteerEvent } from "@/types/ecovibe";
import { saveEventToDatabase } from "@/lib/firebase/database";
import { AdminShell } from "@/components/ecovibe/admin-shell";
import {
  EVENT_CATEGORIES,
  ILIGAN_LOCATION_PRESETS,
  LocationPickerMap,
} from "@/components/ecovibe/location-picker-map";

export default function CreateVolunteerEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState<string>("");
  const [category, setCategory] =
    useState<VolunteerEvent["category"]>("Community Clean-Up");
  const [customCategory, setCustomCategory] = useState<string>("");
  const [date, setDate] = useState<string>("Saturday, Mar 28, 2026");
  const [timeRange, setTimeRange] = useState<string>("6:30 AM – 10:00 AM");
  const [organizer, setOrganizer] = useState<string>(
    "Iligan City Environment & Management Office (ICEMO)"
  );
  const [locationName, setLocationName] = useState<string>(
    ILIGAN_LOCATION_PRESETS[0].label
  );
  const [lat, setLat] = useState<number>(ILIGAN_LOCATION_PRESETS[0].lat);
  const [lng, setLng] = useState<number>(ILIGAN_LOCATION_PRESETS[0].lng);
  const [maxParticipants, setMaxParticipants] = useState<number>(100);
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSelectLocationPreset = (presetLabel: string) => {
    const found = ILIGAN_LOCATION_PRESETS.find((p) => p.label === presetLabel);
    if (found) {
      setLocationName(found.label);
      setLat(found.lat);
      setLng(found.lng);
    } else {
      setLocationName(presetLabel);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    const eventId = `evt-iligan-${Date.now()}`;
    const resolvedCategory =
      category === "Other" && customCategory.trim()
        ? customCategory.trim()
        : category;

    const newEvent: VolunteerEvent = {
      id: eventId,
      title: title.trim(),
      organizer:
        organizer.trim() ||
        "Iligan City Environment & Management Office (ICEMO)",
      date: date.trim() || "Upcoming Weekend",
      timeRange: timeRange.trim() || "6:30 AM – 10:00 AM",
      locationName: locationName.trim() || "Iligan City",
      coordinates: {
        lat: Number(lat) || 8.232,
        lng: Number(lng) || 124.244,
        addressLabel: locationName.trim() || "Iligan City",
        district: "Iligan City",
      },
      category: resolvedCategory,
      participantsCount: 1,
      maxParticipants: Math.max(5, Number(maxParticipants) || 100),
      description: description.trim(),
      dialectTags: ["Bisaya", "Tagalog", "English"],
      pointsReward: 100,
    };

    try {
      await saveEventToDatabase(newEvent);
      router.push(`/dashboard/admin/events/${eventId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminShell
      backHref="/dashboard/admin"
      backLabel="Back to Admin Dashboard"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-m3-on-surface">
            Create volunteer event
          </h1>
          <p className="mt-1 text-sm text-m3-on-surface-variant">
            Publish a new community clean-up or tree-planting event in Iligan
            City. Once created, you can manage its details and export
            participant lists on its event page.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar
                className="h-4 w-4 text-m3-primary-text"
                aria-hidden="true"
              />
              <span>Event information</span>
            </CardTitle>
            <CardDescription>
              Fill in the schedule, pin the location on the Iligan City map, and
              provide details for volunteers.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="event-title">Event title *</Label>
                  <Input
                    id="event-title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Hinaplanon Riverbank Clean-Up Drive"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="event-category">Category *</Label>
                  <Select
                    value={category}
                    onValueChange={(val) =>
                      setCategory(val as VolunteerEvent["category"])
                    }
                  >
                    <SelectTrigger id="event-category">
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

              {category === "Other" && (
                <div className="space-y-1.5">
                  <Label htmlFor="event-custom-category">
                    Specify category (optional)
                  </Label>
                  <Input
                    id="event-custom-category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="e.g., Coastal Mangrove Restoration, Recycling Drive..."
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="event-date">Date *</Label>
                  <Input
                    id="event-date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="e.g., Saturday, Mar 28, 2026"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="event-time">Time range *</Label>
                  <Input
                    id="event-time"
                    required
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    placeholder="e.g., 6:30 AM – 10:00 AM"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="event-max">Max volunteers *</Label>
                  <Input
                    id="event-max"
                    type="number"
                    min={5}
                    max={2000}
                    required
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="event-preset">
                    Quick location preset in Iligan City
                  </Label>
                  <Select
                    value={
                      ILIGAN_LOCATION_PRESETS.some(
                        (p) => p.label === locationName
                      )
                        ? locationName
                        : ILIGAN_LOCATION_PRESETS[0].label
                    }
                    onValueChange={handleSelectLocationPreset}
                  >
                    <SelectTrigger id="event-preset">
                      <SelectValue placeholder="Choose Iligan City landmark" />
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
                  <Label htmlFor="event-organizer">Organizer *</Label>
                  <Input
                    id="event-organizer"
                    required
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    placeholder="e.g., MSU-IIT EcoWatch & Barangay Council"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="event-location-label">
                  <MapPin
                    className="mr-1 inline h-3.5 w-3.5 text-m3-primary-text"
                    aria-hidden="true"
                  />
                  Location / Barangay address *
                </Label>
                <Input
                  id="event-location-label"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Enter street, landmark, or barangay in Iligan City"
                />
              </div>

              {/* Interactive Google Maps Pin Picker */}
              <div className="space-y-1.5">
                <Label>Pin event location on Google Maps</Label>
                <LocationPickerMap
                  lat={lat}
                  lng={lng}
                  onChange={(nextLat, nextLng) => {
                    setLat(nextLat);
                    setLng(nextLng);
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="event-description">Event description *</Label>
                <Textarea
                  id="event-description"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what volunteers should bring, meeting point, and activities..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-m3-outline-variant">
                <Button type="button" variant="outline" asChild>
                  <Link href="/dashboard/admin">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      <span>Publishing event...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      <span>Create event</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
