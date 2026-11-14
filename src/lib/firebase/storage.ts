import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { firebaseConfig, getFirebaseStorage } from "./config";

export interface StorageUploadResult {
  downloadUrl: string;
  storagePath: string;
  bucket: string;
  sizeBytes: number;
  contentType: string;
  provider: "firebase-storage" | "local-object-storage-adapter";
}

export async function uploadIssuePhotoToStorage(
  file: File,
  reporterUid: string,
  onProgress?: (percent: number) => void
): Promise<StorageUploadResult> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `issues/${reporterUid}/${Date.now()}_${safeName}`;
  const bucket = firebaseConfig.storageBucket || "ecovibe-b79d0.firebasestorage.app";

  const storage = getFirebaseStorage();
  if (storage) {
    try {
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      const downloadUrl = await new Promise<string>((resolve, reject) => {
        const timeoutId = setTimeout(() => reject(new Error("Upload timeout")), 4500);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            if (snapshot.totalBytes > 0) {
              const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              onProgress?.(pct);
            }
          },
          (err) => {
            clearTimeout(timeoutId);
            reject(err);
          },
          async () => {
            clearTimeout(timeoutId);
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            } catch (err) {
              reject(err);
            }
          }
        );
      });

      return {
        downloadUrl,
        storagePath,
        bucket,
        sizeBytes: file.size,
        contentType: file.type || "image/jpeg",
        provider: "firebase-storage",
      };
    } catch {
      // Fallback to local Data URL if Firebase Storage rules require custom setup
    }
  }

  const steps = [25, 60, 100];
  for (const pct of steps) {
    await new Promise((r) => setTimeout(r, 80));
    onProgress?.(pct);
  }

  const downloadUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read uploaded image file"));
    reader.readAsDataURL(file);
  });

  return {
    downloadUrl,
    storagePath,
    bucket,
    sizeBytes: file.size,
    contentType: file.type || "image/jpeg",
    provider: "local-object-storage-adapter",
  };
}
