"use client";

import { useState, useCallback } from "react";
import { SheetsLogPayload, SheetsSyncResponse } from "@/types/ecovibe";

export function useSheetsSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncReceipt, setLastSyncReceipt] = useState<SheetsSyncResponse | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const logIssueToSheets = useCallback(
    async (payload: SheetsLogPayload): Promise<SheetsSyncResponse> => {
      setIsSyncing(true);
      setSyncError(null);
      try {
        const response = await fetch("/api/issues/sheets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          throw new Error(`Sheets API returned status ${response.status}`);
        }
        const data = (await response.json()) as SheetsSyncResponse;
        setLastSyncReceipt(data);
        return data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to sync with Google Sheets";
        setSyncError(msg);
        throw err;
      } finally {
        setIsSyncing(false);
      }
    },
    []
  );

  return {
    logIssueToSheets,
    isSyncing,
    lastSyncReceipt,
    syncError,
  };
}
