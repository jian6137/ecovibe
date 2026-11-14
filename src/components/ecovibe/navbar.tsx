"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  MapPin,
  MessageSquareText,
  ShieldCheck,
  UserCheck,
  LogOut,
  PlusCircle,
  CalendarHeart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/types/ecovibe";

interface NavbarProps {
  user: UserProfile;
  isAuthLoading: boolean;
  onSignInGoogle: () => void;
  onSignInAnon: () => void;
  onSignOut: () => void;
  onOpenReport: () => void;
  onOpenChat: () => void;
  totalIssuesCount: number;
}

export function Navbar({
  user,
  isAuthLoading,
  onSignInGoogle,
  onSignInAnon,
  onSignOut,
  onOpenReport,
  onOpenChat,
  totalIssuesCount,
}: NavbarProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-purple-400/25 bg-[#12002b]/85 backdrop-blur-xl">
      {/* Accessible Skip Link per Modern Web Guidance */}
      <a
        href="#main-content"
        className="visually-hidden fixed left-4 top-4 z-50 rounded-m3-md bg-[#A8002D] px-4 py-2 text-sm font-bold text-white shadow-glow-red"
      >
        Skip to main content
      </a>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <motion.a
            href="#top"
            whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
            className="group flex items-center gap-3 rounded-m3-lg focus-visible:outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center rounded-m3-md bg-gradient-to-br from-[#5101be] via-[#380582] to-[#A8002D] shadow-glow-purple border border-purple-300/30">
              <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
              <span
                className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#A8002D] text-[10px] font-bold text-white ring-2 ring-[#12002b]"
                aria-hidden="true"
              >
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-white">
                  Eco<span className="text-[#ff4d73]">Vibe</span>
                </span>
                <Badge
                  variant="secondary"
                  className="hidden sm:inline-flex bg-[#5101be]/90 text-[11px] px-2 py-0.5"
                >
                  M3 Civic AI
                </Badge>
              </div>
              <p className="text-xs text-purple-200/80 hidden sm:block">
                Community Issue & Volunteer Platform
              </p>
            </div>
          </motion.a>
        </div>

        {/* Primary Landmark Navigation */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-1 rounded-full border border-purple-400/25 bg-[#1b0240]/90 px-3 py-1.5"
        >
          <a
            href="#report-issue"
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-purple-100 transition-colors hover:bg-[#5101be] hover:text-white"
          >
            <PlusCircle className="h-3.5 w-3.5 text-[#ff4d73]" aria-hidden="true" />
            Report Flow
          </a>
          <a
            href="#map-dashboard"
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-purple-100 transition-colors hover:bg-[#5101be] hover:text-white"
          >
            <MapPin className="h-3.5 w-3.5 text-[#ff4d73]" aria-hidden="true" />
            Map Dashboard
            <span className="ml-1 rounded-full bg-[#A8002D] px-1.5 py-0.2 text-[10px] font-bold text-white">
              {totalIssuesCount}
            </span>
          </a>
          <a
            href="#volunteer-events"
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-purple-100 transition-colors hover:bg-[#5101be] hover:text-white"
          >
            <CalendarHeart className="h-3.5 w-3.5 text-[#ff4d73]" aria-hidden="true" />
            Volunteer Events
          </a>
          <button
            type="button"
            onClick={onOpenChat}
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-purple-100 transition-colors hover:bg-[#A8002D] hover:text-white"
          >
            <MessageSquareText className="h-3.5 w-3.5 text-[#ff859d]" aria-hidden="true" />
            Gemma Chat
          </button>
        </nav>

        {/* Firebase Auth Session & Quick Actions */}
        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-purple-400/30 bg-[#1b0240] px-3 py-1.5 text-xs">
            <ShieldCheck
              className="h-4 w-4 text-emerald-400 shrink-0"
              aria-hidden="true"
            />
            <div className="leading-tight">
              <p className="font-semibold text-white truncate max-w-[140px]">
                {user.displayName}
              </p>
              <p className="text-[11px] text-purple-200/80">
                <span className="font-bold text-[#ff859d]">{user.ecoPoints}</span> EcoPoints
              </p>
            </div>
            {user.isAnonymous ? (
              <button
                type="button"
                disabled={isAuthLoading}
                onClick={onSignInGoogle}
                className="ml-1 rounded-full bg-[#5101be] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#A8002D] transition-colors"
              >
                Verify Auth
              </button>
            ) : (
              <button
                type="button"
                disabled={isAuthLoading}
                onClick={onSignInAnon}
                aria-label="Switch to anonymous reporter session"
                className="ml-1 rounded-full bg-[#2c0468] p-1.5 text-purple-200 hover:bg-[#A8002D] hover:text-white transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          <Button
            type="button"
            size="sm"
            onClick={onOpenReport}
            className="rounded-full font-bold"
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            <span>Report Issue</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
