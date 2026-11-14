"use client";

import { useState, useEffect, useCallback } from "react";
import { isAdminRole, UserProfile } from "@/types/ecovibe";
import {
  ANONYMOUS_CITIZEN_USER,
  AUTH_STORAGE_KEY,
  signInAnonymouslyAdapter,
  signInWithGoogleAdapter,
  signOutAdapter,
  subscribeToAuthChanges,
} from "@/lib/firebase/auth";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  subscribeToUserProfile,
  updateUserEcoPointsInDatabase,
} from "@/lib/firebase/database";

export function useAuth() {
  const [user, setUser] = useState<UserProfile>(ANONYMOUS_CITIZEN_USER);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    setIsConfigured(isFirebaseConfigured());
    const unsubscribe = subscribeToAuthChanges((nextUser) => {
      setUser(nextUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe in real time to `users/{uid}` in Firebase Realtime Database so `role = "admin"` updates immediately
  useEffect(() => {
    if (user.isAnonymous || !user.uid || user.uid === "guest") return;
    const unsubscribe = subscribeToUserProfile(user.uid, (dbProfile) => {
      setUser((prev) => {
        const nextRole = dbProfile.role || prev.role;
        const nextPoints =
          typeof dbProfile.ecoPoints === "number"
            ? dbProfile.ecoPoints
            : prev.ecoPoints;
        if (nextRole === prev.role && nextPoints === prev.ecoPoints) {
          return prev;
        }
        const updated: UserProfile = {
          ...prev,
          role: nextRole,
          ecoPoints: nextPoints,
        };
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify(updated)
          );
        }
        return updated;
      });
    });
    return () => unsubscribe();
  }, [user.uid, user.isAnonymous]);

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const profile = await signInWithGoogleAdapter();
      setUser(profile);
      return profile;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to sign in with Google.";
      setAuthError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInAnonymously = useCallback(async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const profile = await signInAnonymouslyAdapter();
      setUser(profile);
      return profile;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await signOutAdapter();
      setUser(ANONYMOUS_CITIZEN_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const addEcoPoints = useCallback((points: number) => {
    setUser((prev) => {
      const updated = { ...prev, ecoPoints: prev.ecoPoints + points };
      if (typeof window !== "undefined" && !updated.isAnonymous) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      }
      if (!updated.isAnonymous && updated.uid && updated.uid !== "guest") {
        void updateUserEcoPointsInDatabase(updated.uid, updated.ecoPoints);
      }
      return updated;
    });
  }, []);

  const isAdmin = !user.isAnonymous && isAdminRole(user.role);

  return {
    user,
    isAdmin,
    isLoading,
    isConfigured,
    authError,
    clearAuthError,
    signInWithGoogle,
    signInAnonymously,
    signOut,
    addEcoPoints,
  };
}
