import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getDatabase, Database } from "firebase/database";
import { getStorage, FirebaseStorage } from "firebase/storage";

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";

export const firebaseConfig: FirebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  databaseURL:
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
    (projectId ? `https://${projectId}-default-rtdb.firebaseio.com` : ""),
  projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      !firebaseConfig.apiKey.includes("Placeholder") &&
      firebaseConfig.projectId &&
      firebaseConfig.authDomain
  );
}

let firebaseAppInstance: FirebaseApp | null = null;
let firebaseAuthInstance: Auth | null = null;
let firebaseDbInstance: Database | null = null;
let firebaseStorageInstance: FirebaseStorage | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (firebaseAppInstance) return firebaseAppInstance;
  try {
    firebaseAppInstance =
      getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    return firebaseAppInstance;
  } catch {
    return null;
  }
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  if (!app) return null;
  if (firebaseAuthInstance) return firebaseAuthInstance;
  try {
    firebaseAuthInstance = getAuth(app);
    return firebaseAuthInstance;
  } catch {
    return null;
  }
}

export function getFirebaseDatabase(): Database | null {
  const app = getFirebaseApp();
  if (!app) return null;
  if (firebaseDbInstance) return firebaseDbInstance;
  try {
    firebaseDbInstance = getDatabase(
      app,
      firebaseConfig.databaseURL || undefined
    );
    return firebaseDbInstance;
  } catch {
    return null;
  }
}

export function getFirebaseStorage(): FirebaseStorage | null {
  const app = getFirebaseApp();
  if (!app) return null;
  if (firebaseStorageInstance) return firebaseStorageInstance;
  try {
    firebaseStorageInstance = getStorage(app);
    return firebaseStorageInstance;
  } catch {
    return null;
  }
}
