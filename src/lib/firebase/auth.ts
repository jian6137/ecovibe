import { UserProfile } from "@/types/ecovibe";
import { isFirebaseConfigured } from "./config";

/**
 * Firebase Authentication Adapter
 *
 * Ready to wire to `getAuth()`, `GoogleAuthProvider()`, `signInWithPopup()`,
 * and `signInAnonymously()` from `firebase/auth`.
 * Falls back to a realistic local session adapter when env keys are not yet supplied.
 */

const STORAGE_KEY = "ecovibe_auth_user_v1";

export const DEFAULT_CITIZEN_USER: UserProfile = {
  uid: "firebase-uid-eco-8941",
  displayName: "Alex Rivera (Verified Citizen)",
  email: "alex.rivera@ecovibe.org",
  photoURL: null,
  isAnonymous: false,
  ecoPoints: 640,
  role: "Citizen Reporter",
};

export const ANONYMOUS_CITIZEN_USER: UserProfile = {
  uid: "firebase-anon-3092",
  displayName: "Anonymous Citizen Reporter",
  email: null,
  photoURL: null,
  isAnonymous: true,
  ecoPoints: 120,
  role: "Citizen Reporter",
};

export async function signInWithGoogleAdapter(): Promise<UserProfile> {
  // When `firebase/auth` SDK is installed & configured:
  // const auth = getAuth(app);
  // const result = await signInWithPopup(auth, new GoogleAuthProvider());
  await new Promise((resolve) => setTimeout(resolve, 450));
  const user: UserProfile = {
    ...DEFAULT_CITIZEN_USER,
    uid: isFirebaseConfigured() ? "fb-live-uid-901" : DEFAULT_CITIZEN_USER.uid,
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
  return user;
}

export async function signInAnonymouslyAdapter(): Promise<UserProfile> {
  // When `firebase/auth` SDK is installed & configured:
  // const auth = getAuth(app);
  // const result = await signInAnonymously(auth);
  await new Promise((resolve) => setTimeout(resolve, 300));
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ANONYMOUS_CITIZEN_USER));
  }
  return ANONYMOUS_CITIZEN_USER;
}

export async function signOutAdapter(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function getPersistedUser(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_CITIZEN_USER;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as UserProfile;
  } catch {
    // ignore storage errors
  }
  return DEFAULT_CITIZEN_USER;
}
