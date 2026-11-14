import {
  CommunityIssue,
  EventParticipantRecord,
  VolunteerEvent,
} from "@/types/ecovibe";
import {
  clearCachedGoogleAccessToken,
  ensureGoogleSheetsOAuthToken,
} from "@/lib/firebase/auth";

export interface CreatedSpreadsheetResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  rowCount: number;
  mode: "google-sheets" | "csv-fallback";
  notice?: string;
}

interface SheetCellData {
  userEnteredValue: {
    stringValue?: string;
    numberValue?: number;
  };
  userEnteredFormat?: Record<string, unknown>;
}

function headerCell(text: string): SheetCellData {
  return {
    userEnteredValue: { stringValue: text },
    userEnteredFormat: {
      backgroundColor: {
        red: 203 / 255,
        green: 0,
        blue: 33 / 255,
      },
      textFormat: {
        bold: true,
        foregroundColor: { red: 1, green: 1, blue: 1 },
      },
    },
  };
}

function stringCell(val: string | number | null | undefined): SheetCellData {
  if (typeof val === "number") {
    return { userEnteredValue: { numberValue: val } };
  }
  return {
    userEnteredValue: { stringValue: val == null ? "" : String(val) },
  };
}

function sanitizeSheetTitle(raw: string, fallback: string): string {
  const cleaned = raw
    .replace(/[:\\/?*\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90);
  return cleaned || fallback;
}

/**
 * Calls Google Sheets REST API v4 using the signed-in user's OAuth 2.0 access token.
 * Never opens a second popup after `await fetch()` (which browsers block and turn into `auth/popup-closed-by-user`).
 */
async function createSpreadsheetWithOAuth(
  requestBody: Record<string, unknown>
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const token = await ensureGoogleSheetsOAuthToken();
  if (!token) {
    throw new Error("OAUTH_TOKEN_UNAVAILABLE");
  }

  const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (response.status === 401 || response.status === 403) {
    // Clear cached token so the next click will request a fresh token with `drive.file` scope
    clearCachedGoogleAccessToken();
    const errJson = await response.json().catch(() => null);
    const apiMessage =
      errJson?.error?.message ||
      `Google Sheets API returned status ${response.status}`;
    throw new Error(apiMessage);
  }

  if (!response.ok) {
    const errJson = await response.json().catch(() => null);
    const apiMessage =
      errJson?.error?.message ||
      `Google Sheets API returned status ${response.status}`;
    throw new Error(apiMessage);
  }

  const data = (await response.json()) as {
    spreadsheetId: string;
    spreadsheetUrl?: string;
  };

  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl:
      data.spreadsheetUrl ||
      `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
  };
}

function buildIssuesSheetDefinition(issues: CommunityIssue[]) {
  const headers = [
    "Issue ID",
    "Title",
    "Category",
    "Priority",
    "Status",
    "Location / Barangay",
    "Latitude",
    "Longitude",
    "Reporter Name",
    "Reporter UID",
    "Helpful Votes",
    "Assigned Office",
    "Photo URL",
    "Created At",
  ];

  const rows = [
    { values: headers.map(headerCell) },
    ...issues.map((issue) => ({
      values: [
        stringCell(issue.id),
        stringCell(issue.title),
        stringCell(issue.category),
        stringCell(issue.severity),
        stringCell(issue.status),
        stringCell(issue.coordinates.addressLabel || "Iligan City"),
        stringCell(issue.coordinates.lat),
        stringCell(issue.coordinates.lng),
        stringCell(issue.reporterName),
        stringCell(issue.reporterUid),
        stringCell(issue.upvotes),
        stringCell(issue.recommendedAgency || ""),
        stringCell(issue.photoUrl),
        stringCell(new Date(issue.createdAt).toLocaleString()),
      ],
    })),
  ];

  return {
    properties: {
      title: "Community Issues",
      gridProperties: {
        frozenRowCount: 1,
      },
    },
    data: [
      {
        startRow: 0,
        startColumn: 0,
        rowData: rows,
      },
    ],
  };
}

function buildEventParticipantsSheetDefinition(
  event: VolunteerEvent,
  participants: EventParticipantRecord[],
  sheetTitle?: string
) {
  const headers = [
    "#",
    "Participant Name",
    "Email",
    "User UID",
    "Joined At",
    "Event Title",
    "Event Date",
    "Time",
    "Location",
    "Organizer",
  ];

  const rows = [
    { values: headers.map(headerCell) },
    ...participants.map((p, index) => ({
      values: [
        stringCell(index + 1),
        stringCell(p.userName),
        stringCell(p.userEmail || "Not provided"),
        stringCell(p.uid),
        stringCell(new Date(p.joinedAt).toLocaleString()),
        stringCell(event.title),
        stringCell(event.date),
        stringCell(event.timeRange),
        stringCell(event.locationName),
        stringCell(event.organizer),
      ],
    })),
  ];

  return {
    properties: {
      title: sanitizeSheetTitle(
        sheetTitle || event.title,
        "Event Participants"
      ),
      gridProperties: {
        frozenRowCount: 1,
      },
    },
    data: [
      {
        startRow: 0,
        startColumn: 0,
        rowData: rows,
      },
    ],
  };
}

/**
 * Create a brand-new Google Spreadsheet in the signed-in admin's Google account containing the selected Community Issues.
 * Automatically falls back to downloading a Google-Sheets-ready `.csv` if Google Sheets API is not yet enabled on the Cloud project.
 */
export async function exportIssuesToUserSpreadsheet(
  issues: CommunityIssue[]
): Promise<CreatedSpreadsheetResult> {
  const dateLabel = new Date().toISOString().slice(0, 10);
  const title = `Ecovibe Iligan - Community Issues (${dateLabel})`;

  try {
    const created = await createSpreadsheetWithOAuth({
      properties: { title },
      sheets: [buildIssuesSheetDefinition(issues)],
    });

    return {
      ...created,
      title,
      rowCount: issues.length,
      mode: "google-sheets",
    };
  } catch (err) {
    downloadIssuesCsv(issues);
    const rawMsg = err instanceof Error ? err.message : "";
    return {
      spreadsheetId: "local-csv",
      spreadsheetUrl: "https://sheets.new",
      title: `${title}.csv`,
      rowCount: issues.length,
      mode: "csv-fallback",
      notice: rawMsg.includes("has not been used in project") || rawMsg.includes("disabled")
        ? "Downloaded CSV spreadsheet (Enable Google Sheets API in Google Cloud Console for direct cloud sheet creation)."
        : "Downloaded spreadsheet (.csv) to your device. You can also open sheets.new to import it directly.",
    };
  }
}

/**
 * Create a brand-new Google Spreadsheet in the signed-in admin's Google account for a single Volunteer Event's participants.
 */
export async function exportEventParticipantsToUserSpreadsheet(
  event: VolunteerEvent,
  participants: EventParticipantRecord[]
): Promise<CreatedSpreadsheetResult> {
  const dateLabel = new Date().toISOString().slice(0, 10);
  const title = `Ecovibe Event Participants - ${event.title} (${dateLabel})`;

  try {
    const created = await createSpreadsheetWithOAuth({
      properties: { title },
      sheets: [
        buildEventParticipantsSheetDefinition(
          event,
          participants,
          "Participants"
        ),
      ],
    });

    return {
      ...created,
      title,
      rowCount: participants.length,
      mode: "google-sheets",
    };
  } catch {
    downloadEventParticipantsCsv(event, participants);
    return {
      spreadsheetId: "local-csv",
      spreadsheetUrl: "https://sheets.new",
      title: `${event.title} - Participants.csv`,
      rowCount: participants.length,
      mode: "csv-fallback",
      notice:
        "Downloaded event participants spreadsheet (.csv) to your device.",
    };
  }
}

/**
 * Create a multi-tab Google Spreadsheet in the signed-in admin's Google account containing:
 * - Sheet 1: Checked Community Issues
 * - Sheet 2..N: Each Volunteer Event with its participant roster
 */
export async function exportAllIssuesAndEventsToUserSpreadsheet(params: {
  issues: CommunityIssue[];
  events: VolunteerEvent[];
  participantsByEvent: Record<string, EventParticipantRecord[]>;
}): Promise<CreatedSpreadsheetResult> {
  const dateLabel = new Date().toISOString().slice(0, 10);
  const title = `Ecovibe Iligan - Issues & Volunteer Events Report (${dateLabel})`;

  const eventSheets = params.events.map((evt, idx) =>
    buildEventParticipantsSheetDefinition(
      evt,
      params.participantsByEvent[evt.id] || [],
      `Event ${idx + 1} - ${evt.title}`
    )
  );

  const totalParticipantRows = Object.values(params.participantsByEvent).reduce(
    (acc, list) => acc + list.length,
    0
  );

  try {
    const created = await createSpreadsheetWithOAuth({
      properties: { title },
      sheets: [buildIssuesSheetDefinition(params.issues), ...eventSheets],
    });

    return {
      ...created,
      title,
      rowCount: params.issues.length + totalParticipantRows,
      mode: "google-sheets",
    };
  } catch {
    downloadFullWorkbookCsv(params);
    return {
      spreadsheetId: "local-csv",
      spreadsheetUrl: "https://sheets.new",
      title: `${title}.csv`,
      rowCount: params.issues.length + totalParticipantRows,
      mode: "csv-fallback",
      notice:
        "Downloaded combined Issues & Events spreadsheet (.csv) to your device.",
    };
  }
}

function escapeCsvCell(val: string | number | null | undefined): string {
  const str = val == null ? "" : String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function triggerCsvDownload(filename: string, csvContent: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadIssuesCsv(issues: CommunityIssue[]) {
  const headers = [
    "Issue ID",
    "Title",
    "Category",
    "Priority",
    "Status",
    "Location / Barangay",
    "Latitude",
    "Longitude",
    "Reporter Name",
    "Reporter UID",
    "Helpful Votes",
    "Assigned Office",
    "Photo URL",
    "Created At",
  ];

  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...issues.map((issue) =>
      [
        issue.id,
        issue.title,
        issue.category,
        issue.severity,
        issue.status,
        issue.coordinates.addressLabel || "Iligan City",
        issue.coordinates.lat,
        issue.coordinates.lng,
        issue.reporterName,
        issue.reporterUid,
        issue.upvotes,
        issue.recommendedAgency || "",
        issue.photoUrl,
        new Date(issue.createdAt).toLocaleString(),
      ]
        .map(escapeCsvCell)
        .join(",")
    ),
  ];

  triggerCsvDownload(
    `ecovibe-iligan-issues-${new Date().toISOString().slice(0, 10)}.csv`,
    lines.join("\n")
  );
}

export function downloadEventParticipantsCsv(
  event: VolunteerEvent,
  participants: EventParticipantRecord[]
) {
  const headers = [
    "#",
    "Participant Name",
    "Email",
    "User UID",
    "Joined At",
    "Event Title",
    "Event Date",
    "Time",
    "Location",
    "Organizer",
  ];

  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...participants.map((p, idx) =>
      [
        idx + 1,
        p.userName,
        p.userEmail || "Not provided",
        p.uid,
        new Date(p.joinedAt).toLocaleString(),
        event.title,
        event.date,
        event.timeRange,
        event.locationName,
        event.organizer,
      ]
        .map(escapeCsvCell)
        .join(",")
    ),
  ];

  const slug = event.id.replace(/[^a-zA-Z0-9_-]/g, "-");
  triggerCsvDownload(`ecovibe-${slug}-participants.csv`, lines.join("\n"));
}

export function downloadFullWorkbookCsv(params: {
  issues: CommunityIssue[];
  events: VolunteerEvent[];
  participantsByEvent: Record<string, EventParticipantRecord[]>;
}) {
  const sections: string[] = [];

  sections.push("=== COMMUNITY ISSUES ===");
  sections.push(
    [
      "Issue ID",
      "Title",
      "Category",
      "Priority",
      "Status",
      "Location / Barangay",
      "Latitude",
      "Longitude",
      "Reporter Name",
      "Reporter UID",
      "Helpful Votes",
      "Assigned Office",
      "Created At",
    ]
      .map(escapeCsvCell)
      .join(",")
  );
  for (const issue of params.issues) {
    sections.push(
      [
        issue.id,
        issue.title,
        issue.category,
        issue.severity,
        issue.status,
        issue.coordinates.addressLabel || "Iligan City",
        issue.coordinates.lat,
        issue.coordinates.lng,
        issue.reporterName,
        issue.reporterUid,
        issue.upvotes,
        issue.recommendedAgency || "",
        new Date(issue.createdAt).toLocaleString(),
      ]
        .map(escapeCsvCell)
        .join(",")
    );
  }

  for (const evt of params.events) {
    const participants = params.participantsByEvent[evt.id] || [];
    sections.push("");
    sections.push(`=== EVENT: ${evt.title} (${evt.date} • ${evt.locationName}) ===`);
    sections.push(
      ["#", "Participant Name", "Email", "User UID", "Joined At"]
        .map(escapeCsvCell)
        .join(",")
    );
    participants.forEach((p, idx) => {
      sections.push(
        [
          idx + 1,
          p.userName,
          p.userEmail || "Not provided",
          p.uid,
          new Date(p.joinedAt).toLocaleString(),
        ]
          .map(escapeCsvCell)
          .join(",")
      );
    });
  }

  triggerCsvDownload(
    `ecovibe-iligan-full-report-${new Date().toISOString().slice(0, 10)}.csv`,
    sections.join("\n")
  );
}
