"use client";

import React, { useState } from "react";
import {
  INITIAL_COMMUNITY_ISSUES,
  UPCOMING_VOLUNTEER_EVENTS,
} from "@/lib/seed-data";
import { CommunityIssue, VolunteerEvent } from "@/types/ecovibe";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/ecovibe/navbar";
import { HeroSection } from "@/components/ecovibe/hero-section";
import { IssueReportingFlow } from "@/components/ecovibe/issue-reporting-flow";
import { MapDashboard } from "@/components/ecovibe/map-dashboard";
import { VolunteerEventsSection } from "@/components/ecovibe/volunteer-events-section";
import { ChatbotWidget } from "@/components/ecovibe/chatbot-widget";
import { Sparkles, HeartHandshake, ExternalLink } from "lucide-react";

export default function EcoVibePage() {
  const {
    user,
    isLoading: isAuthLoading,
    signInWithGoogle,
    signInAnonymously,
    signOut,
    addEcoPoints,
  } = useAuth();

  const [issues, setIssues] = useState<CommunityIssue[]>(
    INITIAL_COMMUNITY_ISSUES
  );
  const [selectedIssueId, setSelectedIssueId] = useState<string>(
    INITIAL_COMMUNITY_ISSUES[0].id
  );
  const [joinedEventIds, setJoinedEventIds] = useState<string[]>([
    UPCOMING_VOLUNTEER_EVENTS[0].id,
  ]);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [externalChatPrompt, setExternalChatPrompt] = useState<string | null>(
    null
  );

  const handleScrollToReport = () => {
    const el = document.getElementById("report-issue");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const handleOpenCommunityChat = () => {
    setIsChatOpen(true);
  };

  const handleIssueCreated = (newIssue: CommunityIssue) => {
    setIssues((prev) => [newIssue, ...prev]);
    setSelectedIssueId(newIssue.id);
    addEcoPoints(50);
  };

  const handleUpvoteIssue = (issueId: string) => {
    setIssues((prev) =>
      prev.map((item) =>
        item.id === issueId ? { ...item, upvotes: item.upvotes + 1 } : item
      )
    );
    addEcoPoints(5);
  };

  const handleToggleJoinEvent = (event: VolunteerEvent) => {
    setJoinedEventIds((prev) => {
      const exists = prev.includes(event.id);
      if (exists) {
        return prev.filter((id) => id !== event.id);
      } else {
        addEcoPoints(event.pointsReward);
        return [...prev, event.id];
      }
    });
  };

  const handleAskGemmaAboutEvent = (prompt: string) => {
    setExternalChatPrompt(prompt);
    setIsChatOpen(true);
  };

  return (
    <div className="relative flex min-h-dvh flex-col bg-[#12002b]">
      {/* Sticky Navigation Header */}
      <Navbar
        user={user}
        isAuthLoading={isAuthLoading}
        onSignInGoogle={signInWithGoogle}
        onSignInAnon={signInAnonymously}
        onSignOut={signOut}
        onOpenReport={handleScrollToReport}
        onOpenChat={handleOpenCommunityChat}
        totalIssuesCount={issues.length}
      />

      {/* Primary Page Landmark */}
      <main id="main-content" className="flex-1">
        {/* 1. Landing Page Hero Section */}
        <HeroSection
          onReportIssueClick={handleScrollToReport}
          onCommunityChatClick={handleOpenCommunityChat}
          totalIssues={issues.length}
          resolvedCount={18}
          activeVolunteers={162 + joinedEventIds.length}
        />

        {/* 2. Issue Reporting Flow (Photo Upload + Gemini AI Scan + Geolocation + Sheets API) */}
        <IssueReportingFlow
          user={user}
          onIssueCreated={handleIssueCreated}
        />

        {/* 3. Map Dashboard (Dark-Mode Google Maps Platform Canvas + Custom Pins) */}
        <MapDashboard
          issues={issues}
          events={UPCOMING_VOLUNTEER_EVENTS}
          selectedIssueId={selectedIssueId}
          onSelectIssue={setSelectedIssueId}
          onUpvoteIssue={handleUpvoteIssue}
        />

        {/* Volunteer Events & Cloud Integration Architecture */}
        <VolunteerEventsSection
          events={UPCOMING_VOLUNTEER_EVENTS}
          joinedEventIds={joinedEventIds}
          onToggleJoinEvent={handleToggleJoinEvent}
          onAskGemmaAboutEvent={handleAskGemmaAboutEvent}
        />
      </main>

      {/* 4. Floating Gemma Local Dialect Chatbot Interface */}
      <ChatbotWidget
        isOpen={isChatOpen}
        onToggleOpen={setIsChatOpen}
        joinedEventIds={joinedEventIds}
        onToggleJoinEvent={handleToggleJoinEvent}
        externalPrompt={externalChatPrompt}
        onClearExternalPrompt={() => setExternalChatPrompt(null)}
      />

      {/* Semantic Footer Landmark */}
      <footer className="border-t border-purple-400/25 bg-[#0c001d] py-10 text-xs text-purple-200/80">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-m3-sm bg-[#5101be] text-white">
              <Sparkles className="h-4 w-4 text-[#ff859d]" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold text-white">
                EcoVibe — Community Issue Reporting & Volunteer Platform
              </p>
              <p className="text-[11px] text-purple-300/80">
                Material 3 Dark Theme (#5101be Deep Purple & #A8002D / #AB1E2C Red Accents)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-purple-200">
            <span className="inline-flex items-center gap-1">
              <HeartHandshake className="h-4 w-4 text-[#ff4d73]" aria-hidden="true" />
              Firebase Auth & Storage Ready
            </span>
            <a
              href="/api/issues/sheets"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[#ff859d] hover:underline"
            >
              <span>Inspect Sheets Ledger JSON</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
