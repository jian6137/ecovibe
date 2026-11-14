"use client";

import React, { useState, useEffect } from "react";
import {
  INITIAL_COMMUNITY_ISSUES,
  UPCOMING_VOLUNTEER_EVENTS,
} from "@/lib/seed-data";
import { CommunityIssue, VolunteerEvent } from "@/types/ecovibe";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  subscribeToIssues,
  saveIssueToDatabase,
  upvoteIssueInDatabase,
  subscribeToEvents,
  subscribeToUserJoinedEvents,
  joinEventInDatabase,
  leaveEventInDatabase,
} from "@/lib/firebase/database";
import { Navbar } from "@/components/ecovibe/navbar";
import { HeroSection } from "@/components/ecovibe/hero-section";
import { IssueReportingFlow } from "@/components/ecovibe/issue-reporting-flow";
import { MapDashboard } from "@/components/ecovibe/map-dashboard";
import {
  VolunteerEventsSection,
  EventJoinNotification,
} from "@/components/ecovibe/volunteer-events-section";
import { ChatbotWidget } from "@/components/ecovibe/chatbot-widget";

export default function EcoVibePage() {
  const {
    user,
    isLoading: isAuthLoading,
    signInWithGoogle,
    signInAnonymously,
    signOut,
    addEcoPoints,
  } = useAuth();

  const {
    preference: schemePreference,
    resolvedScheme,
    systemScheme,
    toggleColorScheme,
    selectColorScheme,
  } = useColorScheme();

  const [issues, setIssues] = useState<CommunityIssue[]>(
    INITIAL_COMMUNITY_ISSUES
  );
  const [events, setEvents] = useState<VolunteerEvent[]>(
    UPCOMING_VOLUNTEER_EVENTS
  );
  const [selectedIssueId, setSelectedIssueId] = useState<string>(
    INITIAL_COMMUNITY_ISSUES[0].id
  );
  const [joinedEventIds, setJoinedEventIds] = useState<string[]>([]);
  const [joiningEventId, setJoiningEventId] = useState<string | null>(null);
  const [joinNotification, setJoinNotification] =
    useState<EventJoinNotification | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [externalChatPrompt, setExternalChatPrompt] = useState<string | null>(
    null
  );

  // Subscribe to Community Issues in Firebase Realtime Database
  useEffect(() => {
    const unsubscribe = subscribeToIssues((liveIssues) => {
      setIssues(liveIssues);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Volunteer Events in Firebase Realtime Database
  useEffect(() => {
    const unsubscribe = subscribeToEvents((liveEvents) => {
      setEvents(liveEvents);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to the signed-in user's joined volunteer events in Firebase Realtime Database
  useEffect(() => {
    if (user.isAnonymous || !user.uid) {
      return;
    }
    const unsubscribe = subscribeToUserJoinedEvents(user.uid, (eventIds) => {
      setJoinedEventIds(eventIds);
    });
    return () => unsubscribe();
  }, [user.uid, user.isAnonymous]);

  const handleScrollToReport = () => {
    const el = document.getElementById("report-issue");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const handleOpenCommunityChat = () => {
    setIsChatOpen(true);
  };

  const handleIssueCreated = (newIssue: CommunityIssue) => {
    setIssues((prev) => {
      const exists = prev.some((item) => item.id === newIssue.id);
      return exists ? prev : [newIssue, ...prev];
    });
    setSelectedIssueId(newIssue.id);
    addEcoPoints(50);
    void saveIssueToDatabase(newIssue);
  };

  const handleUpvoteIssue = (issueId: string) => {
    let nextUpvotes = 1;
    setIssues((prev) =>
      prev.map((item) => {
        if (item.id === issueId) {
          nextUpvotes = item.upvotes + 1;
          return { ...item, upvotes: nextUpvotes };
        }
        return item;
      })
    );
    addEcoPoints(5);
    void upvoteIssueInDatabase(issueId, nextUpvotes);
  };

  const handleToggleJoinEvent = async (event: VolunteerEvent) => {
    const isAlreadyJoined = joinedEventIds.includes(event.id);

    // If cancelling registration
    if (isAlreadyJoined) {
      setJoinedEventIds((prev) => prev.filter((id) => id !== event.id));
      setJoinNotification(null);
      if (!user.isAnonymous && user.uid) {
        await leaveEventInDatabase({ uid: user.uid, eventId: event.id });
      }
      return;
    }

    // Joining event: Ensure user is signed in with Google so we have their email & UID
    setJoiningEventId(event.id);
    try {
      let activeUser = user;
      if (activeUser.isAnonymous || !activeUser.email) {
        const signedInProfile = await signInWithGoogle();
        if (!signedInProfile) {
          setJoiningEventId(null);
          return;
        }
        activeUser = signedInProfile;
      }

      setJoinedEventIds((prev) =>
        prev.includes(event.id) ? prev : [...prev, event.id]
      );
      addEcoPoints(event.pointsReward);

      // 1. Save registration to Firebase Realtime Database
      await joinEventInDatabase({
        uid: activeUser.uid,
        userName: activeUser.displayName,
        userEmail: activeUser.email,
        event,
      });

      // 2. Send confirmation email via Nodemailer API route
      if (activeUser.email) {
        const res = await fetch("/api/events/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event,
            userEmail: activeUser.email,
            userName: activeUser.displayName,
          }),
        });
        const data = await res.json();
        setJoinNotification({
          eventId: event.id,
          eventTitle: event.title,
          emailSent: Boolean(data.emailSent),
          message:
            data.message ||
            `Confirmation email sent to ${activeUser.email}.`,
        });
      }
    } catch {
      setJoinNotification({
        eventId: event.id,
        eventTitle: event.title,
        emailSent: false,
        message: "Your spot is saved.",
      });
    } finally {
      setJoiningEventId(null);
    }
  };

  const handleAskAboutEvent = (prompt: string) => {
    setExternalChatPrompt(prompt);
    setIsChatOpen(true);
  };

  return (
    <div className="relative flex min-h-dvh flex-col bg-m3-background text-m3-on-background transition-colors">
      <Navbar
        user={user}
        isAuthLoading={isAuthLoading}
        onSignInGoogle={signInWithGoogle}
        onSignInAnon={signInAnonymously}
        onSignOut={signOut}
        onOpenReport={handleScrollToReport}
        onOpenChat={handleOpenCommunityChat}
        totalIssuesCount={issues.length}
        schemePreference={schemePreference}
        resolvedScheme={resolvedScheme}
        systemScheme={systemScheme}
        onToggleScheme={toggleColorScheme}
        onSelectScheme={selectColorScheme}
      />

      <main id="main-content" className="flex-1">
        {/* 1. Landing Page Hero Section */}
        <HeroSection
          onReportIssueClick={handleScrollToReport}
          onCommunityChatClick={handleOpenCommunityChat}
          totalIssues={issues.length}
          resolvedCount={18}
          activeVolunteers={169 + joinedEventIds.length}
        />

        {/* 2. Issue Reporting Flow */}
        <IssueReportingFlow
          user={user}
          onIssueCreated={handleIssueCreated}
        />

        {/* 3. Map Dashboard (Google Maps Platform) */}
        <MapDashboard
          issues={issues}
          events={events}
          selectedIssueId={selectedIssueId}
          onSelectIssue={setSelectedIssueId}
          onUpvoteIssue={handleUpvoteIssue}
          resolvedScheme={resolvedScheme}
        />

        {/* Volunteer Events in Iligan City */}
        <VolunteerEventsSection
          events={events}
          joinedEventIds={joinedEventIds}
          joiningEventId={joiningEventId}
          joinNotification={joinNotification}
          onDismissNotification={() => setJoinNotification(null)}
          onToggleJoinEvent={handleToggleJoinEvent}
          onAskGemmaAboutEvent={handleAskAboutEvent}
        />
      </main>

      {/* 4. Floating Community Chatbot Interface */}
      <ChatbotWidget
        isOpen={isChatOpen}
        onToggleOpen={setIsChatOpen}
        joinedEventIds={joinedEventIds}
        onToggleJoinEvent={handleToggleJoinEvent}
        externalPrompt={externalChatPrompt}
        onClearExternalPrompt={() => setExternalChatPrompt(null)}
      />

      {/* Clean Footer */}
      <footer className="border-t border-m3-outline-variant bg-m3-surface py-8 text-xs text-m3-on-surface-variant transition-colors">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="ecovibe-logo-mask inline-block h-6 w-6 shrink-0"
            />
            <span className="font-quicksand text-lg font-bold tracking-tight text-m3-on-surface">
              Ecovibe
            </span>
          </div>

          <p className="text-m3-on-surface-variant">
            Community Issue Reporting & Volunteer Events • Iligan City
          </p>
        </div>
      </footer>
    </div>
  );
}
