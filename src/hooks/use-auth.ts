"use client";

import { useState, useEffect, useCallback } from "react";
import { UserProfile } from "@/types/ecovibe";
import {
  DEFAULT_CITIZEN_USER,
  getPersistedUser,
  signInAnonymouslyAdapter,
  signInWithGoogleAdapter,
  signOutAdapter,
} from "@/lib/firebase/auth";
import { isFirebaseConfigured } from "@/lib/firebase/config";

export function useAuth() {
  const [user, setUser] = useState<UserProfile>(DEFAULT_CITIZEN_USER);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  useEffect(() => {
    setUser(getPersistedUser());
    setIsConfigured(isFirebaseConfigured());
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      const profile = await signInWithGoogleAdapter();
      setUser(profile);
      return profile;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInAnonymously = useCallback(async () => {
    setIsLoading(true);
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
    try {
      await signOutAdapter();
      setUser(ANONYMOUS_FALLBACK);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addEcoPoints = useCallback((points: number) => {
    setUser((prev) => {
      const updated = { ...prev, ecoPoints: prev.ecoPoints + points };
      if (typeof window !== "undefined") {
        window.localStorage.setItem("ecovibe_auth_user_v1", JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  return {
    user,
    isLoading,
    isConfigured,
    signInWithGoogle,
    signInAnonymously,
    signOut,
    addEcoPoints,
  };
}

const ANONYMOUS_FALLBACK: UserProfile = {
  uid: "firebase-anon-guest",
  displayName: "Guest Citizen Reporter",
  email: null,
  photoURL: null,
  isAnonymous: true,
  ecoPoints: 100,
  role: "Citizen Reporter",
};
