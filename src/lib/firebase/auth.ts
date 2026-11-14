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

export const AUTH_STORAGE_KEY = "ecovibe_auth_user_v4";
export const GOOGLE_OAUTH_TOKEN_KEY = "ecovibe_google_oauth_token_v2";

export const ANONYMOUS_CITIZEN_USER: UserProfile = {
  uid: "guest",
  displayName: "Guest",
  email: null,
  photoURL: null,
  isAnonymous: true,
  ecoPoints: 0,
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
    ecoPoints: fbUser.isAnonymous ? 0 : 100,
    role: "user",
  };
}

/**
 * Subscribe to Firebase Authentication state changes using the official `onAuthStateChanged` listener.
 */
export function subscribeToAuthChanges(
  onUserChanged: (user: UserProfile) => void
): Unsubscribe {
  if (typeof window !== "undefined") {
    // Clean up any legacy placeholder storage keys
    window.localStorage.removeItem("ecovibe_auth_user_v1");
    window.localStorage.removeItem("ecovibe_auth_user_v3");
  }

  const auth = getFirebaseAuth();
  if (!auth) {
    onUserChanged(ANONYMOUS_CITIZEN_USER);
    return () => {};
  }

  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser && !fbUser.isAnonymous) {
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
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
      onUserChanged(ANONYMOUS_CITIZEN_USER);
    }
  });
}

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

function formatFirebaseAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code || "";
  const message = (err as { message?: string })?.message || "";

  if (
    code === "auth/popup-closed-by-user" ||
    code === "auth/cancelled-popup-request"
  ) {
    return "Sign-in popup was closed before completing Google login.";
  }
  if (code === "auth/popup-blocked") {
    return "Sign-in popup was blocked by your browser. Please allow popups for this site.";
  }
  if (code === "auth/unauthorized-domain") {
    return "This domain is not yet authorized in Firebase Authentication settings.";
  }
  if (
    code === "auth/configuration-not-found" ||
    message.includes("CONFIGURATION_NOT_FOUND")
  ) {
    return "Google Sign-In is not enabled in Firebase Authentication yet.";
  }
  if (code === "auth/network-request-failed") {
    return "Network error while connecting to Google Sign-In.";
  }
  return message || "Failed to sign in with Google.";
}

/**
 * Sign in with Google using the official Firebase Authentication SDK (`GoogleAuthProvider` + `signInWithPopup`).
 * Never logs in a placeholder account; throws a descriptive error if authentication fails.
 */
export async function signInWithGoogleAdapter(): Promise<UserProfile> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error(
      "Firebase Authentication is not configured. Please check your environment variables."
    );
  }

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
    throw new Error(formatFirebaseAuthError(err));
  }
}

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
      return mapFirebaseUserToProfile(result.user);
    } catch {
      // ignore
    }
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
    window.localStorage.removeItem("ecovibe_auth_user_v3");
    window.localStorage.removeItem(GOOGLE_OAUTH_TOKEN_KEY);
  }
}
