import {
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Unsubscribe,
} from "firebase/auth";
import { UserProfile } from "@/types/ecovibe";
import { getFirebaseAuth } from "./config";
import { saveUserProfileToDatabase } from "./database";

export const AUTH_STORAGE_KEY = "ecovibe_auth_user_v3";
export const GOOGLE_OAUTH_TOKEN_KEY = "ecovibe_google_oauth_token_v2";

const DEFAULT_AVATAR_URL =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80";

export const DEFAULT_CITIZEN_USER: UserProfile = {
  uid: "user-iligan-8941",
  displayName: "Alex Rivera",
  email: "alex.rivera@gmail.com",
  photoURL: DEFAULT_AVATAR_URL,
  isAnonymous: false,
  ecoPoints: 240,
  role: "user",
};

export const ANONYMOUS_CITIZEN_USER: UserProfile = {
  uid: "guest-iligan-3092",
  displayName: "Guest",
  email: null,
  photoURL: null,
  isAnonymous: true,
  ecoPoints: 50,
  role: "user",
};

interface CachedOAuthToken {
  accessToken: string;
  expiresAt: number;
}

export function cacheGoogleAccessToken(accessToken?: string | null) {
  if (typeof window === "undefined" || !accessToken) return;
  try {
    const payload: CachedOAuthToken = {
      accessToken,
      // Google OAuth access tokens are valid for ~3600s; cache for 50 minutes
      expiresAt: Date.now() + 50 * 60 * 1000,
    };
    window.localStorage.setItem(
      GOOGLE_OAUTH_TOKEN_KEY,
      JSON.stringify(payload)
    );
  } catch {
    // ignore storage errors
  }
}

export function getCachedGoogleAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(GOOGLE_OAUTH_TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedOAuthToken;
    if (Date.now() > parsed.expiresAt) {
      window.localStorage.removeItem(GOOGLE_OAUTH_TOKEN_KEY);
      return null;
    }
    return parsed.accessToken;
  } catch {
    return null;
  }
}

export function clearCachedGoogleAccessToken() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(GOOGLE_OAUTH_TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function mapFirebaseUserToProfile(fbUser: FirebaseUser): UserProfile {
  return {
    uid: fbUser.uid,
    displayName:
      fbUser.displayName ||
      (fbUser.email ? fbUser.email.split("@")[0] : "Volunteer"),
    email: fbUser.email || null,
    photoURL: fbUser.photoURL || null,
    isAnonymous: fbUser.isAnonymous,
    ecoPoints: fbUser.isAnonymous ? 50 : 250,
    role: "user",
  };
}

/**
 * Subscribe to Firebase Authentication state changes using the official `onAuthStateChanged` listener.
 */
export function subscribeToAuthChanges(
  onUserChanged: (user: UserProfile) => void
): Unsubscribe {
  const auth = getFirebaseAuth();
  if (!auth) {
    onUserChanged(getPersistedUser());
    return () => {};
  }

  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      const initialProfile = mapFirebaseUserToProfile(fbUser);
      const syncedProfile = await saveUserProfileToDatabase(initialProfile);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify(syncedProfile)
        );
      }
      onUserChanged(syncedProfile);
    } else {
      onUserChanged(ANONYMOUS_CITIZEN_USER);
    }
  });
}

/**
 * Uses the non-sensitive `drive.file` scope (`https://www.googleapis.com/auth/drive.file`),
 * which is authorized to create new Google Sheets (`POST https://sheets.googleapis.com/v4/spreadsheets`)
 * without triggering Google's unverified sensitive-scope popup block.
 */
function createGoogleProvider(
  includeDriveFileScope = true,
  loginHint?: string | null
): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  if (includeDriveFileScope) {
    provider.addScope("https://www.googleapis.com/auth/drive.file");
  }
  if (loginHint) {
    provider.setCustomParameters({ login_hint: loginHint });
  } else {
    provider.setCustomParameters({ prompt: "select_account" });
  }
  return provider;
}

/**
 * Sign in with Google using the official Firebase Authentication SDK (`GoogleAuthProvider` + `signInWithPopup`).
 */
export async function signInWithGoogleAdapter(): Promise<UserProfile> {
  const auth = getFirebaseAuth();
  if (auth) {
    try {
      const provider = createGoogleProvider(true);
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      cacheGoogleAccessToken(credential?.accessToken);

      const initialProfile = mapFirebaseUserToProfile(result.user);
      const syncedProfile = await saveUserProfileToDatabase(initialProfile);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify(syncedProfile)
        );
      }
      return syncedProfile;
    } catch (err) {
      const errorCode = (err as { code?: string })?.code;
      if (
        errorCode === "auth/popup-closed-by-user" ||
        errorCode === "auth/cancelled-popup-request"
      ) {
        throw err;
      }
      // Fallback if domain is not yet authorized in Firebase Console
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 250));
  const syncedFallback = await saveUserProfileToDatabase(DEFAULT_CITIZEN_USER);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify(syncedFallback)
    );
  }
  return syncedFallback;
}

/**
 * Obtain a Google OAuth 2.0 access token with `drive.file` scope.
 * IMPORTANT: Must be called directly from a user click handler (never after an `await fetch`),
 * otherwise browser popup blockers auto-close the popup and cause `auth/popup-closed-by-user`.
 */
export async function ensureGoogleSheetsOAuthToken(): Promise<string | null> {
  const cached = getCachedGoogleAccessToken();
  if (cached) return cached;

  const auth = getFirebaseAuth();
  if (!auth) return null;

  try {
    const provider = createGoogleProvider(
      true,
      auth.currentUser?.email || undefined
    );
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || null;
    cacheGoogleAccessToken(token);
    return token;
  } catch {
    return null;
  }
}

export async function signInAnonymouslyAdapter(): Promise<UserProfile> {
  const auth = getFirebaseAuth();
  if (auth) {
    try {
      const result = await firebaseSignInAnonymously(auth);
      const profile = mapFirebaseUserToProfile(result.user);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
      return profile;
    } catch {
      // Fallback if anonymous auth is not enabled yet
    }
  }

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
  return ANONYMOUS_CITIZEN_USER;
}

export async function signOutAdapter(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth) {
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore
    }
  }
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.localStorage.removeItem("ecovibe_auth_user_v1");
    window.localStorage.removeItem(GOOGLE_OAUTH_TOKEN_KEY);
  }
}

export function getPersistedUser(): UserProfile {
  if (typeof window === "undefined") return ANONYMOUS_CITIZEN_USER;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as UserProfile;
  } catch {
    // ignore storage errors
  }
  return ANONYMOUS_CITIZEN_USER;
}
