"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Calendar,
  Camera,
  LogIn,
  LogOut,
  MapPin,
  MessageSquare,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { isAdminRole, UserProfile } from "@/types/ecovibe";
import {
  ColorSchemePreference,
  ResolvedColorScheme,
} from "@/hooks/use-color-scheme";
import { ThemeToggle } from "./theme-toggle";

interface NavbarProps {
  user: UserProfile;
  isAuthLoading: boolean;
  authError?: string | null;
  onClearAuthError?: () => void;
  onSignInGoogle: () => void;
  onSignInAnon: () => void;
  onSignOut: () => void;
  onOpenReport: () => void;
  onOpenChat: () => void;
  totalIssuesCount: number;
  schemePreference: ColorSchemePreference;
  resolvedScheme: ResolvedColorScheme;
  systemScheme: ResolvedColorScheme;
  onToggleScheme: () => void;
  onSelectScheme: (scheme: ColorSchemePreference) => void;
}

export function Navbar({
  user,
  isAuthLoading,
  authError,
  onClearAuthError,
  onSignInGoogle,
  onSignOut,
  onOpenChat,
  schemePreference,
  resolvedScheme,
  systemScheme,
  onToggleScheme,
  onSelectScheme,
}: NavbarProps) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const userInitial = (user.displayName || "U").charAt(0).toUpperCase();
  const isAdmin = !user.isAnonymous && isAdminRole(user.role);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-m3-outline-variant bg-m3-surface backdrop-blur-md transition-colors">
      <a
        href="#main-content"
        className="visually-hidden fixed left-4 top-4 z-50 rounded-m3-md bg-m3-primary px-4 py-2 text-sm font-medium text-m3-on-primary shadow-m3-2"
      >
        Skip to main content
      </a>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand Logo: public/ecovibe.svg colored with primary + "Ecovibe" in Quicksand */}
        <a
          href="#top"
          className="flex items-center gap-2.5 shrink-0 rounded-m3-sm focus-visible:outline-none"
        >
          <span
            aria-hidden="true"
            className="ecovibe-logo-mask inline-block h-8 w-8 shrink-0"
          />
          <span className="font-quicksand text-2xl font-bold tracking-tight text-m3-on-surface">
            Ecovibe
          </span>
        </a>

        {/* Simple, Uncluttered Navigation Menu */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-1">
          <a
            href="#report-issue"
            className="whitespace-nowrap rounded-m3-full px-4 py-2 text-sm font-medium text-m3-on-surface-variant transition-colors hover:bg-m3-surface-container-high hover:text-m3-on-surface"
          >
            Report Issue
          </a>
          <a
            href="#map-dashboard"
            className="whitespace-nowrap rounded-m3-full px-4 py-2 text-sm font-medium text-m3-on-surface-variant transition-colors hover:bg-m3-surface-container-high hover:text-m3-on-surface"
          >
            Map
          </a>
          <a
            href="#volunteer-events"
            className="whitespace-nowrap rounded-m3-full px-4 py-2 text-sm font-medium text-m3-on-surface-variant transition-colors hover:bg-m3-surface-container-high hover:text-m3-on-surface"
          >
            Events
          </a>
          <button
            type="button"
            onClick={onOpenChat}
            className="whitespace-nowrap rounded-m3-full px-4 py-2 text-sm font-medium text-m3-on-surface-variant transition-colors hover:bg-m3-surface-container-high hover:text-m3-on-surface"
          >
            Community Chat
          </button>

          {isAdmin && (
            <Link
              href="/dashboard/admin"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-m3-full bg-m3-primary-container px-4 py-1.5 text-sm font-medium text-m3-on-primary-container transition-colors hover:brightness-95"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* Right Controls: Mobile Icon Nav + Theme Dropdown + Sign In / 1:1 Profile Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile Icon-Only Quick Navigation (< md) */}
          <div className="flex md:hidden items-center gap-1">
            <a
              href="#report-issue"
              aria-label="Report Issue"
              title="Report Issue"
              className="inline-flex h-9 w-9 shrink-0 aspect-square items-center justify-center rounded-full text-m3-on-surface-variant transition-colors hover:bg-m3-surface-container-high hover:text-m3-on-surface"
            >
              <Camera className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="#map-dashboard"
              aria-label="Community Map"
              title="Community Map"
              className="inline-flex h-9 w-9 shrink-0 aspect-square items-center justify-center rounded-full text-m3-on-surface-variant transition-colors hover:bg-m3-surface-container-high hover:text-m3-on-surface"
            >
              <MapPin className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="#volunteer-events"
              aria-label="Volunteer Events"
              title="Volunteer Events"
              className="inline-flex h-9 w-9 shrink-0 aspect-square items-center justify-center rounded-full text-m3-on-surface-variant transition-colors hover:bg-m3-surface-container-high hover:text-m3-on-surface"
            >
              <Calendar className="h-4 w-4" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={onOpenChat}
              aria-label="Community Chat"
              title="Community Chat"
              className="inline-flex h-9 w-9 shrink-0 aspect-square items-center justify-center rounded-full text-m3-on-surface-variant transition-colors hover:bg-m3-surface-container-high hover:text-m3-on-surface"
            >
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
            </button>
            {isAdmin && (
              <Link
                href="/dashboard/admin"
                aria-label="Admin Dashboard"
                title="Admin Dashboard"
                className="inline-flex h-9 w-9 shrink-0 aspect-square items-center justify-center rounded-full bg-m3-primary-container text-m3-on-primary-container transition-colors hover:brightness-95"
              >
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </div>

          <ThemeToggle
            preference={schemePreference}
            resolvedScheme={resolvedScheme}
            systemScheme={systemScheme}
            onToggle={onToggleScheme}
            onSelectScheme={onSelectScheme}
          />

          {user.isAnonymous ? (
            <Button
              type="button"
              size="sm"
              disabled={isAuthLoading}
              onClick={onSignInGoogle}
              aria-label="Sign in with Google"
              title="Sign in with Google"
              className="h-9 w-9 shrink-0 aspect-square p-0 sm:aspect-auto sm:w-auto sm:px-5 font-medium"
            >
              <LogIn className="h-4 w-4 shrink-0 sm:hidden" aria-hidden="true" />
              <span className="hidden sm:inline">Sign in</span>
            </Button>
          ) : (
            <div ref={accountMenuRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setAccountMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={accountMenuOpen}
                aria-label={`Account menu for ${user.displayName}`}
                className="flex h-9 w-9 min-h-9 max-h-9 min-w-9 max-w-9 shrink-0 aspect-square items-center justify-center overflow-hidden rounded-full p-0 ring-2 ring-m3-outline-variant transition-all hover:ring-m3-primary focus-visible:outline-none"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="h-full w-full aspect-square object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full aspect-square items-center justify-center bg-m3-primary text-sm font-semibold text-m3-on-primary">
                    {userInitial}
                  </span>
                )}
              </button>

              {accountMenuOpen && (
                <div
                  role="menu"
                  aria-label="Account"
                  className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-m3-outline-variant bg-m3-surface-container p-4 shadow-m3-3 z-50"
                >
                  <div className="flex items-center gap-3 pb-3 border-b border-m3-outline-variant">
                    <div className="h-11 w-11 min-h-11 max-h-11 min-w-11 max-w-11 shrink-0 aspect-square overflow-hidden rounded-full bg-m3-primary text-m3-on-primary flex items-center justify-center font-semibold">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName}
                          className="h-full w-full aspect-square object-cover"
                        />
                      ) : (
                        userInitial
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-medium text-m3-on-surface">
                          {user.displayName}
                        </p>
                        {isAdmin && (
                          <span className="rounded-m3-full bg-m3-primary-container px-2 py-0.5 text-[10px] font-semibold text-m3-on-primary-container">
                            Admin
                          </span>
                        )}
                      </div>
                      {user.email && (
                        <p className="truncate text-xs text-m3-on-surface-variant">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 space-y-2">
                    {isAdmin && (
                      <Link
                        href="/dashboard/admin"
                        role="menuitem"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex w-full items-center justify-center gap-2 rounded-m3-full bg-m3-primary-container px-4 py-2 text-xs font-medium text-m3-on-primary-container transition-colors hover:brightness-95"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Open Admin Dashboard</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      role="menuitem"
                      disabled={isAuthLoading}
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onSignOut();
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-m3-full border border-m3-outline-variant bg-m3-surface px-4 py-2 text-xs font-medium text-m3-on-surface transition-colors hover:bg-m3-surface-container-high"
                    >
                      <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Authentication Error Banner (No Placeholder Account Fallback) */}
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
            {onClearAuthError && (
              <button
                type="button"
                onClick={onClearAuthError}
                aria-label="Dismiss sign-in error"
                className="inline-flex h-7 w-7 shrink-0 aspect-square items-center justify-center rounded-full hover:bg-black/10 transition-colors"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
