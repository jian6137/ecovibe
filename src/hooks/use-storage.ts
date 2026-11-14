"use client";

import { useState, useCallback } from "react";
import { StorageUploadResult, uploadIssuePhotoToStorage } from "@/lib/firebase/storage";

export function useStorage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastUploadResult, setLastUploadResult] = useState<StorageUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadPhoto = useCallback(
    async (file: File, reporterUid: string): Promise<StorageUploadResult> => {
      setIsUploading(true);
      setUploadProgress(5);
      setError(null);
      try {
        const result = await uploadIssuePhotoToStorage(file, reporterUid, (pct) => {
          setUploadProgress(pct);
        });
        setLastUploadResult(result);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Photo upload failed";
        setError(msg);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const resetUpload = useCallback(() => {
    setUploadProgress(0);
    setLastUploadResult(null);
    setError(null);
  }, []);

  return {
    uploadPhoto,
    resetUpload,
    isUploading,
    uploadProgress,
    lastUploadResult,
    error,
  };
}
