/**
 * Firebase Client Configuration & Environment Detection
 *
 * Designed so Firebase Auth (`firebase/auth`) and Firebase Storage (`firebase/storage`)
 * can be dropped in by setting `NEXT_PUBLIC_FIREBASE_*` environment variables in `.env.local`.
 */

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const firebaseConfig: FirebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

/**
 * Checks if real Firebase credentials have been provided (vs placeholder or empty values).
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      !firebaseConfig.apiKey.includes("Placeholder") &&
      firebaseConfig.projectId &&
      firebaseConfig.storageBucket
  );
}
