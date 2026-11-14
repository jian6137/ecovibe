"use client";

import React from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ThemeToggle } from "@/components/ecovibe/theme-toggle";

interface AdminShellProps {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}

export function AdminShell({
  children,
  backHref = "/",
  backLabel = "Back to site",
}: AdminShellProps) {
  const {
    user,
    isAdmin,
    isLoading: isAuthLoading,
    authError,
    clearAuthError,
    signInWithGoogle,
    signOut,
  } = useAuth();

  const {
    preference: schemePreference,
    resolvedScheme,
    systemScheme,
    toggleColorScheme,
    selectColorScheme,
  } = useColorScheme();

  return (
    <div className="min-h-dvh flex flex-col bg-m3-background text-m3-on-background transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-m3-outline-variant bg-m3-surface backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/dashboard/admin"
              className="flex items-center gap-2.5 shrink-0 rounded-m3-sm focus-visible:outline-none"
            >
              <span
                aria-hidden="true"
                className="ecovibe-logo-mask inline-block h-8 w-8 shrink-0"
              />
              <span className="font-quicksand text-2xl font-bold tracking-tight text-m3-on-surface">
                Ecovibe
              </span>
            </Link>
            <Badge variant="default" className="gap-1 shrink-0">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Admin</span>
            </Badge>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href={backHref}
              aria-label={backLabel}
              title={backLabel}
              className="inline-flex h-9 w-9 shrink-0 aspect-square sm:aspect-auto sm:w-auto items-center justify-center gap-1.5 rounded-m3-full border border-m3-outline-variant bg-m3-surface p-0 sm:px-3.5 text-xs font-medium text-m3-on-surface transition-colors hover:bg-m3-surface-container-high"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">{backLabel}</span>
            </Link>

            <ThemeToggle
              preference={schemePreference}
              resolvedScheme={resolvedScheme}
              systemScheme={systemScheme}
              onToggle={toggleColorScheme}
              onSelectScheme={selectColorScheme}
            />

            {!user.isAnonymous && (
              <div className="flex h-9 w-9 min-h-9 max-h-9 min-w-9 max-w-9 shrink-0 aspect-square items-center justify-center overflow-hidden rounded-full ring-2 ring-m3-outline-variant">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="h-full w-full aspect-square object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full aspect-square items-center justify-center bg-m3-primary text-xs font-semibold text-m3-on-primary">
                    {(user.displayName || "A").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Authentication Error Banner */}
        {authError && (
          <div
            role="alert"
            aria-live="assertive"
            className="border-t border-m3-outline-variant bg-m3-error-container px-4 py-2.5 text-xs sm:text-sm text-m3-on-error-container"
          >
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{authError}</span>
              </div>
              <button
                type="button"
                onClick={clearAuthError}
                aria-label="Dismiss sign-in error"
                className="inline-flex h-7 w-7 shrink-0 aspect-square items-center justify-center rounded-full hover:bg-black/10 transition-colors"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {isAuthLoading ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
            <Loader2
              className="h-8 w-8 animate-spin text-m3-primary-text"
              aria-hidden="true"
            />
            <p className="text-sm text-m3-on-surface-variant">
              Checking permissions...
            </p>
          </div>
        ) : user.isAnonymous ? (
          <div className="mx-auto max-w-md py-16">
            <Card>
              <CardHeader>
                <div className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-m3-primary-container text-m3-on-primary-container">
                  <ShieldAlert className="h-5 w-5" aria-hidden="true" />
                </div>
                <CardTitle>Sign in required</CardTitle>
                <CardDescription>
                  Please sign in with an administrator account to continue.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Button type="button" onClick={signInWithGoogle}>
                  Sign in with Google
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/">Return home</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : !isAdmin ? (
          <div className="mx-auto max-w-md py-16">
            <Card>
              <CardHeader>
                <div className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-m3-primary-container text-m3-on-primary-container">
                  <ShieldAlert className="h-5 w-5" aria-hidden="true" />
                </div>
                <CardTitle>Admin access required</CardTitle>
                <CardDescription>
                  Your account ({user.email || user.displayName}) does not have
                  administrator permissions to view this page.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-3">
                <Button type="button" variant="outline" onClick={signOut}>
                  Switch account
                </Button>
                <Button type="button" variant="secondary" asChild>
                  <Link href="/">Return home</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
