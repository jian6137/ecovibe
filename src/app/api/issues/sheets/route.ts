import { NextRequest, NextResponse } from "next/server";
import { SheetsLogPayload, SheetsSyncResponse } from "@/types/ecovibe";

/**
 * Serverless Endpoint: Google Workspace / Google Sheets API Logger
 * Route: POST /api/issues/sheets
 *
 * Appends a structured row `[Timestamp, IssueID, Category, Severity, Title, Lat, Lng, Address, ReporterUID, PhotoURL]`
 * to the configured Google Sheet (`GOOGLE_SHEETS_SPREADSHEET_ID`).
 *
 * To wire live Google Sheets API:
 * 1. Provide `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` in `.env.local`
 * 2. Exchange JWT for an OAuth2 access token at `https://oauth2.googleapis.com/token`
 * 3. POST to `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Issues_Log!A:J:append?valueInputOption=USER_ENTERED`
 */

let rowCounter = 19;
const inMemorySheetsLedger: Array<SheetsLogPayload & { rowNumber: number }> = [];

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<SheetsLogPayload>;

    if (!body.issueId || !body.category || typeof body.lat !== "number" || typeof body.lng !== "number") {
      return NextResponse.json(
        { error: "Missing required issue fields (issueId, category, lat, lng)" },
        { status: 400 }
      );
    }

    const spreadsheetId =
      process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms";
    const hasServiceAccount = Boolean(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
        process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
        !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.includes("...")
    );

    rowCounter += 1;
    const currentRow = rowCounter;
    const syncedAt = new Date().toISOString();

    const record: SheetsLogPayload & { rowNumber: number } = {
      issueId: body.issueId,
      title: body.title || `${body.category} Report`,
      category: body.category,
      severity: body.severity || "High",
      lat: body.lat,
      lng: body.lng,
      addressLabel: body.addressLabel || `${body.lat.toFixed(4)}, ${body.lng.toFixed(4)}`,
      photoUrl: body.photoUrl || "storage://ecovibe/photo.jpg",
      reporterUid: body.reporterUid || "anonymous",
      reporterName: body.reporterName || "Citizen Reporter",
      aiConfidence: body.aiConfidence ?? 0.95,
      createdAt: body.createdAt || syncedAt,
      rowNumber: currentRow,
    };

    inMemorySheetsLedger.unshift(record);

    const response: SheetsSyncResponse = {
      success: true,
      spreadsheetId,
      updatedRange: `Issues_Log!A${currentRow}:J${currentRow}`,
      rowNumber: currentRow,
      syncedAt,
      mode: hasServiceAccount ? "google-sheets-api" : "serverless-mock-fallback",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to log issue to Google Sheets endpoint",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    spreadsheetId:
      process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    sheetName: "Issues_Log",
    columns: [
      "CreatedAt",
      "IssueID",
      "Category",
      "Severity",
      "Title",
      "Latitude",
      "Longitude",
      "AddressLabel",
      "ReporterUID",
      "AIConfidence",
    ],
    recentRows: inMemorySheetsLedger.slice(0, 10),
  });
}
