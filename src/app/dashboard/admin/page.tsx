"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  FileSpreadsheet,
  LayoutGrid,
  List as ListIcon,
  Loader2,
  MapPin,
  Plus,
  Search,
  Trash2,
  Users,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CommunityIssue,
  EventParticipantRecord,
  IssueCategory,
  IssueStatus,
  VolunteerEvent,
} from "@/types/ecovibe";
import {
  INITIAL_COMMUNITY_ISSUES,
  UPCOMING_VOLUNTEER_EVENTS,
} from "@/lib/seed-data";
import {
  subscribeToIssues,
  updateIssueStatusInDatabase,
  deleteIssueFromDatabase,
  subscribeToEvents,
  subscribeToAllEventParticipants,
} from "@/lib/firebase/database";
import {
  CreatedSpreadsheetResult,
  downloadIssuesCsv,
  exportIssuesToUserSpreadsheet,
} from "@/lib/google-sheets-oauth";
import { AdminShell } from "@/components/ecovibe/admin-shell";
import { formatCoordinates } from "@/lib/utils";

const STATUS_OPTIONS: IssueStatus[] = [
  "Reported",
  "Verified",
  "Dispatched",
  "In Progress",
  "Resolved",
];

const CATEGORY_FILTERS: Array<"All" | IssueCategory> = [
  "All",
  "Waste",
  "Road Hazard",
  "Broken Facility",
  "Flooding & Drainage",
  "Streetlight Outage",
  "Illegal Dumping",
  "Other",
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"issues" | "events">("issues");
  const [eventsViewMode, setEventsViewMode] = useState<"grid" | "list">("grid");

  const [issues, setIssues] = useState<CommunityIssue[]>(
    INITIAL_COMMUNITY_ISSUES
  );
  const [events, setEvents] = useState<VolunteerEvent[]>(
    UPCOMING_VOLUNTEER_EVENTS
  );
  const [selectedIssueIds, setSelectedIssueIds] = useState<string[]>(
    INITIAL_COMMUNITY_ISSUES.map((i) => i.id)
  );
  const [hasInitializedSelection, setHasInitializedSelection] =
    useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<"All" | IssueCategory>(
    "All"
  );

  const [participantsByEvent, setParticipantsByEvent] = useState<
    Record<string, EventParticipantRecord[]>
  >({});

  const [isExportingIssues, setIsExportingIssues] = useState<boolean>(false);
  const [createdSheet, setCreatedSheet] =
    useState<CreatedSpreadsheetResult | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToIssues((liveIssues) => {
      setIssues(liveIssues);
      if (!hasInitializedSelection) {
        setSelectedIssueIds(liveIssues.map((item) => item.id));
        setHasInitializedSelection(true);
      }
    });
    return () => unsubscribe();
  }, [hasInitializedSelection]);

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

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesCat =
        categoryFilter === "All" || issue.category === categoryFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        issue.title.toLowerCase().includes(q) ||
        issue.id.toLowerCase().includes(q) ||
        issue.reporterName.toLowerCase().includes(q) ||
        (issue.coordinates.addressLabel || "").toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [issues, categoryFilter, searchQuery]);

  const selectedIssuesList = useMemo(() => {
    const idSet = new Set(selectedIssueIds);
    return issues.filter((item) => idSet.has(item.id));
  }, [issues, selectedIssueIds]);

  const allFilteredChecked =
    filteredIssues.length > 0 &&
    filteredIssues.every((item) => selectedIssueIds.includes(item.id));

  const handleToggleSelectAllFiltered = () => {
    if (allFilteredChecked) {
      const filteredSet = new Set(filteredIssues.map((i) => i.id));
      setSelectedIssueIds((prev) => prev.filter((id) => !filteredSet.has(id)));
    } else {
      const merged = new Set([
        ...selectedIssueIds,
        ...filteredIssues.map((i) => i.id),
      ]);
      setSelectedIssueIds(Array.from(merged));
    }
  };

  const handleToggleIssueCheckbox = (issueId: string) => {
    setSelectedIssueIds((prev) =>
      prev.includes(issueId)
        ? prev.filter((id) => id !== issueId)
        : [...prev, issueId]
    );
  };

  const handleStatusChange = async (
    issueId: string,
    nextStatus: IssueStatus
  ) => {
    setIssues((prev) =>
      prev.map((item) =>
        item.id === issueId ? { ...item, status: nextStatus } : item
      )
    );
    await updateIssueStatusInDatabase(issueId, nextStatus);
  };

  const handleDeleteIssue = async (issueId: string) => {
    setIssues((prev) => prev.filter((item) => item.id !== issueId));
    setSelectedIssueIds((prev) => prev.filter((id) => id !== issueId));
    await deleteIssueFromDatabase(issueId);
  };

  const handleExportCheckedIssuesToGoogleSheet = async () => {
    const targetIssues =
      selectedIssuesList.length > 0 ? selectedIssuesList : filteredIssues;
    if (targetIssues.length === 0) return;

    setIsExportingIssues(true);
    setCreatedSheet(null);

    try {
      const result = await exportIssuesToUserSpreadsheet(targetIssues);
      setCreatedSheet(result);
    } finally {
      setIsExportingIssues(false);
    }
  };

  const totalRegisteredParticipants = useMemo(() => {
    return Object.values(participantsByEvent).reduce(
      (sum, list) => sum + list.length,
      0
    );
  }, [participantsByEvent]);

  return (
    <AdminShell backHref="/" backLabel="Back to site">
      <div className="space-y-6">
        {/* Page Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-m3-on-surface">
              Iligan City Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-m3-on-surface-variant">
              Review reported community issues and manage volunteer events across
              Iligan City.
            </p>
          </div>

          <Button type="button" asChild>
            <Link href="/dashboard/admin/events/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Create new event</span>
            </Link>
          </Button>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-m3-on-surface-variant">
                Total issues in database
              </p>
              <p className="mt-1 text-2xl font-semibold text-m3-on-surface">
                {issues.length}
              </p>
              <p className="mt-1 text-xs text-m3-primary-text">
                {selectedIssuesList.length} checked for export
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-m3-on-surface-variant">
                Active volunteer events
              </p>
              <p className="mt-1 text-2xl font-semibold text-m3-on-surface">
                {events.length}
              </p>
              <p className="mt-1 text-xs text-m3-on-surface-variant">
                Click any event to manage or export participants
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-m3-on-surface-variant">
                Registered event participants
              </p>
              <p className="mt-1 text-2xl font-semibold text-m3-on-surface">
                {totalRegisteredParticipants}
              </p>
              <p className="mt-1 text-xs text-m3-on-surface-variant">
                Across all Iligan City events
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-m3-outline-variant pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("issues")}
              className={`inline-flex items-center gap-2 rounded-m3-full px-5 py-2 text-sm font-medium transition-colors ${
                activeTab === "issues"
                  ? "bg-m3-primary text-m3-on-primary"
                  : "bg-m3-surface-container-low text-m3-on-surface-variant hover:bg-m3-surface-container"
              }`}
            >
              <span>Community Issues ({issues.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("events")}
              className={`inline-flex items-center gap-2 rounded-m3-full px-5 py-2 text-sm font-medium transition-colors ${
                activeTab === "events"
                  ? "bg-m3-primary text-m3-on-primary"
                  : "bg-m3-surface-container-low text-m3-on-surface-variant hover:bg-m3-surface-container"
              }`}
            >
              <span>Volunteer Events ({events.length})</span>
            </button>
          </div>

          {activeTab === "events" && (
            <div className="flex items-center gap-2">
              <div
                role="group"
                aria-label="Events layout mode"
                className="inline-flex items-center rounded-m3-full border border-m3-outline-variant bg-m3-surface p-1"
              >
                <button
                  type="button"
                  onClick={() => setEventsViewMode("grid")}
                  aria-pressed={eventsViewMode === "grid"}
                  className={`inline-flex items-center gap-1.5 rounded-m3-full px-3 py-1 text-xs font-medium transition-colors ${
                    eventsViewMode === "grid"
                      ? "bg-m3-secondary-container text-m3-on-secondary-container"
                      : "text-m3-on-surface-variant hover:text-m3-on-surface"
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEventsViewMode("list")}
                  aria-pressed={eventsViewMode === "list"}
                  className={`inline-flex items-center gap-1.5 rounded-m3-full px-3 py-1 text-xs font-medium transition-colors ${
                    eventsViewMode === "list"
                      ? "bg-m3-secondary-container text-m3-on-secondary-container"
                      : "text-m3-on-surface-variant hover:text-m3-on-surface"
                  }`}
                >
                  <ListIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>List</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* TAB 1: COMMUNITY ISSUES */}
        {activeTab === "issues" && (
          <div className="space-y-4">
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
                        `Exported ${createdSheet.rowCount} issue rows to your Google account.`}
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

            <Card>
              <CardHeader className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Community issues</CardTitle>
                    <CardDescription>
                      Check the issues you want to include and export them to a
                      new Google Sheet in your account.
                    </CardDescription>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      disabled={
                        isExportingIssues ||
                        (selectedIssuesList.length === 0 &&
                          filteredIssues.length === 0)
                      }
                      onClick={handleExportCheckedIssuesToGoogleSheet}
                    >
                      {isExportingIssues ? (
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
                          <span>
                            Export selected to Google Sheet (
                            {selectedIssuesList.length})
                          </span>
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        downloadIssuesCsv(
                          selectedIssuesList.length > 0
                            ? selectedIssuesList
                            : filteredIssues
                        )
                      }
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Download CSV</span>
                    </Button>
                  </div>
                </div>

                {/* Search & Category Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="relative w-full sm:max-w-xs">
                    <Search
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-m3-on-surface-variant"
                      aria-hidden="true"
                    />
                    <Input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by ID, title, barangay, or reporter..."
                      className="min-h-[40px] pl-10 py-1.5 text-sm"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {CATEGORY_FILTERS.map((cat) => {
                      const active = categoryFilter === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategoryFilter(cat)}
                          className={`rounded-m3-sm px-3 py-1.5 text-xs font-medium transition-colors ${
                            active
                              ? "bg-m3-secondary-container text-m3-on-secondary-container"
                              : "border border-m3-outline-variant bg-m3-surface text-m3-on-surface-variant hover:bg-m3-surface-container"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto rounded-m3-md border border-m3-outline-variant">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="border-b border-m3-outline-variant bg-m3-surface-container text-xs font-medium text-m3-on-surface-variant">
                      <tr>
                        <th className="p-3.5 w-10">
                          <input
                            type="checkbox"
                            checked={allFilteredChecked}
                            onChange={handleToggleSelectAllFiltered}
                            aria-label="Select all issues"
                            className="h-4 w-4 rounded accent-m3-primary cursor-pointer"
                          />
                        </th>
                        <th className="p-3.5">Issue</th>
                        <th className="p-3.5">Category & Priority</th>
                        <th className="p-3.5">Location (Iligan City)</th>
                        <th className="p-3.5">Reporter</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-m3-outline-variant bg-m3-surface">
                      {filteredIssues.map((issue) => {
                        const isChecked = selectedIssueIds.includes(issue.id);
                        return (
                          <tr
                            key={issue.id}
                            className={`transition-colors ${
                              isChecked
                                ? "bg-m3-surface-container-low"
                                : "hover:bg-m3-surface-container-lowest"
                            }`}
                          >
                            <td className="p-3.5 align-middle">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() =>
                                  handleToggleIssueCheckbox(issue.id)
                                }
                                aria-label={`Select issue ${issue.id}`}
                                className="h-4 w-4 rounded accent-m3-primary cursor-pointer"
                              />
                            </td>
                            <td className="p-3.5 align-middle">
                              <div className="flex items-center gap-3">
                                <img
                                  src={issue.photoUrl}
                                  alt={issue.title}
                                  className="h-10 w-14 shrink-0 rounded-m3-xs object-cover border border-m3-outline-variant"
                                />
                                <div className="min-w-0 max-w-xs">
                                  <p className="font-medium text-m3-on-surface truncate">
                                    {issue.title}
                                  </p>
                                  <p className="text-[11px] text-m3-on-surface-variant">
                                    {issue.id} •{" "}
                                    {new Date(
                                      issue.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5 align-middle">
                              <div className="flex flex-col items-start gap-1">
                                <Badge variant="default">
                                  {issue.category}
                                </Badge>
                                <span className="text-[11px] text-m3-on-surface-variant">
                                  {issue.severity} priority
                                </span>
                              </div>
                            </td>
                            <td className="p-3.5 align-middle">
                              <p className="text-xs font-medium text-m3-on-surface flex items-center gap-1">
                                <MapPin
                                  className="h-3.5 w-3.5 text-m3-primary-text shrink-0"
                                  aria-hidden="true"
                                />
                                <span className="truncate max-w-[180px]">
                                  {issue.coordinates.addressLabel ||
                                    "Iligan City"}
                                </span>
                              </p>
                              <p className="text-[11px] text-m3-on-surface-variant pl-4">
                                {formatCoordinates(
                                  issue.coordinates.lat,
                                  issue.coordinates.lng
                                )}
                              </p>
                            </td>
                            <td className="p-3.5 align-middle">
                              <p className="text-xs font-medium text-m3-on-surface">
                                {issue.reporterName}
                              </p>
                              <p className="text-[11px] text-m3-on-surface-variant">
                                {issue.upvotes} helpful votes
                              </p>
                            </td>
                            <td className="p-3.5 align-middle w-40">
                              <Select
                                value={issue.status}
                                onValueChange={(val) =>
                                  void handleStatusChange(
                                    issue.id,
                                    val as IssueStatus
                                  )
                                }
                              >
                                <SelectTrigger className="min-h-[36px] py-1 px-3 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {STATUS_OPTIONS.map((st) => (
                                    <SelectItem key={st} value={st}>
                                      {st}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-3.5 align-middle text-right">
                              <button
                                type="button"
                                onClick={() => void handleDeleteIssue(issue.id)}
                                aria-label={`Delete issue ${issue.id}`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-m3-on-surface-variant hover:bg-m3-surface-container-high hover:text-m3-error transition-colors"
                              >
                                <Trash2
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {filteredIssues.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="p-8 text-center text-sm text-m3-on-surface-variant"
                          >
                            No issues match your current filter.
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

        {/* TAB 2: VOLUNTEER EVENTS (GRID OR LIST MODE -> CLICK TO OPEN DYNAMIC EVENT PAGE) */}
        {activeTab === "events" && (
          <div>
            {eventsViewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {events.map((evt) => {
                  const participantCount = (participantsByEvent[evt.id] || [])
                    .length;

                  return (
                    <Link
                      key={evt.id}
                      href={`/dashboard/admin/events/${evt.id}`}
                      className="group block h-full rounded-m3-lg focus-visible:outline-none"
                    >
                      <Card className="flex h-full flex-col justify-between transition-all group-hover:border-m3-primary group-hover:shadow-m3-1">
                        <CardHeader className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant="secondary">{evt.category}</Badge>
                            <span className="text-xs font-medium text-m3-on-surface-variant">
                              {evt.date}
                            </span>
                          </div>
                          <CardTitle className="text-base leading-snug pt-1 group-hover:text-m3-primary-text transition-colors">
                            {evt.title}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Hosted by {evt.organizer}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          <p className="text-xs text-m3-on-surface-variant line-clamp-2 leading-relaxed">
                            {evt.description}
                          </p>

                          <div className="space-y-1.5 rounded-m3-sm border border-m3-outline-variant bg-m3-surface p-3 text-xs text-m3-on-surface">
                            <div className="flex items-center gap-2">
                              <Clock
                                className="h-3.5 w-3.5 text-m3-primary-text shrink-0"
                                aria-hidden="true"
                              />
                              <span className="truncate">{evt.timeRange}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin
                                className="h-3.5 w-3.5 text-m3-primary-text shrink-0"
                                aria-hidden="true"
                              />
                              <span className="truncate">
                                {evt.locationName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users
                                className="h-3.5 w-3.5 text-m3-primary-text shrink-0"
                                aria-hidden="true"
                              />
                              <span>
                                {participantCount} registered participants
                              </span>
                            </div>
                          </div>
                        </CardContent>

                        <CardFooter className="pt-2">
                          <span className="inline-flex w-full items-center justify-between rounded-m3-full bg-m3-surface-container px-4 py-2 text-xs font-medium text-m3-on-surface group-hover:bg-m3-primary group-hover:text-m3-on-primary transition-colors">
                            <span>Manage event & participants</span>
                            <ChevronRight
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          </span>
                        </CardFooter>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            ) : (
              /* List Mode */
              <div className="overflow-hidden rounded-m3-lg border border-m3-outline-variant bg-m3-surface divide-y divide-m3-outline-variant">
                {events.map((evt) => {
                  const participantCount = (participantsByEvent[evt.id] || [])
                    .length;

                  return (
                    <Link
                      key={evt.id}
                      href={`/dashboard/admin/events/${evt.id}`}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:px-6 transition-colors hover:bg-m3-surface-container-low"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">{evt.category}</Badge>
                          <span className="text-xs text-m3-on-surface-variant flex items-center gap-1">
                            <Calendar
                              className="h-3.5 w-3.5 text-m3-primary-text"
                              aria-hidden="true"
                            />
                            {evt.date} • {evt.timeRange}
                          </span>
                        </div>
                        <p className="text-base font-medium text-m3-on-surface truncate">
                          {evt.title}
                        </p>
                        <p className="text-xs text-m3-on-surface-variant flex items-center gap-1.5">
                          <MapPin
                            className="h-3.5 w-3.5 text-m3-primary-text shrink-0"
                            aria-hidden="true"
                          />
                          <span className="truncate">
                            {evt.locationName} • {evt.organizer}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-m3-on-surface">
                            {participantCount}
                          </p>
                          <p className="text-[11px] text-m3-on-surface-variant">
                            Participants
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-m3-full border border-m3-outline-variant bg-m3-surface-container-low px-3.5 py-1.5 text-xs font-medium text-m3-on-surface">
                          <span>Manage</span>
                          <ChevronRight
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
