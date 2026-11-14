import {
  ref,
  onValue,
  get,
  set,
  update,
  remove,
  Unsubscribe,
} from "firebase/database";
import {
  CommunityIssue,
  EventParticipantRecord,
  IssueStatus,
  UserProfile,
  UserRole,
  VolunteerEvent,
} from "@/types/ecovibe";
import {
  INITIAL_COMMUNITY_ISSUES,
  UPCOMING_VOLUNTEER_EVENTS,
} from "@/lib/seed-data";
import { getFirebaseDatabase } from "./config";

const INITIAL_EVENT_PARTICIPANTS: Record<
  string,
  Record<string, EventParticipantRecord>
> = {
  [UPCOMING_VOLUNTEER_EVENTS[0].id]: {
    "vol-iligan-101": {
      uid: "vol-iligan-101",
      userName: "Marco Villanueva",
      userEmail: "marco.villanueva@msuiit.edu.ph",
      eventId: UPCOMING_VOLUNTEER_EVENTS[0].id,
      eventTitle: UPCOMING_VOLUNTEER_EVENTS[0].title,
      eventDate: UPCOMING_VOLUNTEER_EVENTS[0].date,
      timeRange: UPCOMING_VOLUNTEER_EVENTS[0].timeRange,
      locationName: UPCOMING_VOLUNTEER_EVENTS[0].locationName,
      organizer: UPCOMING_VOLUNTEER_EVENTS[0].organizer,
      joinedAt: new Date(Date.now() - 86_400_000 * 2).toISOString(),
    },
    "vol-iligan-102": {
      uid: "vol-iligan-102",
      userName: "Hannah Macapagal",
      userEmail: "hannah.macapagal@gmail.com",
      eventId: UPCOMING_VOLUNTEER_EVENTS[0].id,
      eventTitle: UPCOMING_VOLUNTEER_EVENTS[0].title,
      eventDate: UPCOMING_VOLUNTEER_EVENTS[0].date,
      timeRange: UPCOMING_VOLUNTEER_EVENTS[0].timeRange,
      locationName: UPCOMING_VOLUNTEER_EVENTS[0].locationName,
      organizer: UPCOMING_VOLUNTEER_EVENTS[0].organizer,
      joinedAt: new Date(Date.now() - 86_400_000).toISOString(),
    },
  },
  [UPCOMING_VOLUNTEER_EVENTS[1].id]: {
    "vol-iligan-201": {
      uid: "vol-iligan-201",
      userName: "Jomar Ledesma",
      userEmail: "jomar.ledesma@msuiit.edu.ph",
      eventId: UPCOMING_VOLUNTEER_EVENTS[1].id,
      eventTitle: UPCOMING_VOLUNTEER_EVENTS[1].title,
      eventDate: UPCOMING_VOLUNTEER_EVENTS[1].date,
      timeRange: UPCOMING_VOLUNTEER_EVENTS[1].timeRange,
      locationName: UPCOMING_VOLUNTEER_EVENTS[1].locationName,
      organizer: UPCOMING_VOLUNTEER_EVENTS[1].organizer,
      joinedAt: new Date(Date.now() - 43_200_000).toISOString(),
    },
  },
  [UPCOMING_VOLUNTEER_EVENTS[2].id]: {
    "vol-iligan-301": {
      uid: "vol-iligan-301",
      userName: "Katrina Alonto",
      userEmail: "katrina.alonto@gmail.com",
      eventId: UPCOMING_VOLUNTEER_EVENTS[2].id,
      eventTitle: UPCOMING_VOLUNTEER_EVENTS[2].title,
      eventDate: UPCOMING_VOLUNTEER_EVENTS[2].date,
      timeRange: UPCOMING_VOLUNTEER_EVENTS[2].timeRange,
      locationName: UPCOMING_VOLUNTEER_EVENTS[2].locationName,
      organizer: UPCOMING_VOLUNTEER_EVENTS[2].organizer,
      joinedAt: new Date(Date.now() - 21_600_000).toISOString(),
    },
  },
};

/**
 * Save or update an authenticated user's profile in Firebase Realtime Database (`users/{uid}`).
 * Preserves existing `role` (e.g. `"admin"`) and `ecoPoints` if the user already exists in the database.
 */
export async function saveUserProfileToDatabase(
  profile: UserProfile
): Promise<UserProfile> {
  const db = getFirebaseDatabase();
  if (!db || !profile.uid) return profile;

  try {
    const userRef = ref(db, `users/${profile.uid}`);
    const existingSnap = await get(userRef);

    let resolvedRole: UserRole = profile.role || "user";
    let resolvedPoints = profile.ecoPoints;

    if (existingSnap.exists()) {
      const existingData = existingSnap.val() as Partial<UserProfile>;
      if (existingData.role) {
        resolvedRole = existingData.role;
      }
      if (typeof existingData.ecoPoints === "number") {
        resolvedPoints = existingData.ecoPoints;
      }
    }

    const updatedProfile: UserProfile = {
      ...profile,
      role: resolvedRole,
      ecoPoints: resolvedPoints,
    };

    await update(userRef, {
      uid: updatedProfile.uid,
      displayName: updatedProfile.displayName,
      email: updatedProfile.email,
      photoURL: updatedProfile.photoURL,
      isAnonymous: updatedProfile.isAnonymous,
      ecoPoints: updatedProfile.ecoPoints,
      role: updatedProfile.role,
      lastSeenAt: new Date().toISOString(),
    });

    return updatedProfile;
  } catch {
    return profile;
  }
}

/**
 * Subscribe to a user's record in Firebase Realtime Database (`users/{uid}`) so changes to `role`
 * (such as setting `role: "admin"` in the Firebase Console) take effect in real time.
 */
export function subscribeToUserProfile(
  uid: string,
  onProfileChange: (data: Partial<UserProfile>) => void
): Unsubscribe {
  const db = getFirebaseDatabase();
  if (!db || !uid) return () => {};

  const userRef = ref(db, `users/${uid}`);
  return onValue(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onProfileChange(snapshot.val() as Partial<UserProfile>);
      }
    },
    () => {}
  );
}

/**
 * Update a user's EcoPoints balance in Firebase Realtime Database (`users/{uid}`).
 */
export async function updateUserEcoPointsInDatabase(
  uid: string,
  ecoPoints: number
): Promise<boolean> {
  const db = getFirebaseDatabase();
  if (!db || !uid) return false;

  try {
    const userRef = ref(db, `users/${uid}`);
    await update(userRef, {
      ecoPoints,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Subscribe to real-time updates of community issues (`issues` node in Firebase Realtime Database).
 * Automatically seeds initial Iligan City issues if the node does not exist yet.
 */
export function subscribeToIssues(
  onIssuesChange: (issues: CommunityIssue[]) => void
): Unsubscribe {
  const db = getFirebaseDatabase();
  if (!db) {
    onIssuesChange(INITIAL_COMMUNITY_ISSUES);
    return () => {};
  }

  const issuesRef = ref(db, "issues");
  return onValue(
    issuesRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        const seedRecord: Record<string, CommunityIssue> = {};
        for (const item of INITIAL_COMMUNITY_ISSUES) {
          seedRecord[item.id] = item;
        }
        update(issuesRef, seedRecord).catch(() => {});
        onIssuesChange(INITIAL_COMMUNITY_ISSUES);
        return;
      }

      const data = snapshot.val() as Record<string, CommunityIssue>;
      const issuesList = Object.values(data).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      onIssuesChange(
        issuesList.length > 0 ? issuesList : INITIAL_COMMUNITY_ISSUES
      );
    },
    () => {
      onIssuesChange(INITIAL_COMMUNITY_ISSUES);
    }
  );
}

/**
 * Save a newly reported community issue to Firebase Realtime Database (`issues/{issueId}`).
 */
export async function saveIssueToDatabase(
  issue: CommunityIssue
): Promise<boolean> {
  const db = getFirebaseDatabase();
  if (!db) return false;

  try {
    const issueRef = ref(db, `issues/${issue.id}`);
    await set(issueRef, {
      ...issue,
      recommendedAgency: issue.recommendedAgency ?? null,
      sheetsRowRef: issue.sheetsRowRef ?? null,
      storagePath: issue.storagePath ?? null,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Update an issue's status in Firebase Realtime Database (`issues/{issueId}/status`).
 */
export async function updateIssueStatusInDatabase(
  issueId: string,
  status: IssueStatus
): Promise<boolean> {
  const db = getFirebaseDatabase();
  if (!db) return false;

  try {
    const issueRef = ref(db, `issues/${issueId}`);
    await update(issueRef, { status });
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete a community issue from Firebase Realtime Database (`issues/{issueId}`).
 */
export async function deleteIssueFromDatabase(
  issueId: string
): Promise<boolean> {
  const db = getFirebaseDatabase();
  if (!db) return false;

  try {
    const issueRef = ref(db, `issues/${issueId}`);
    await remove(issueRef);
    return true;
  } catch {
    return false;
  }
}

/**
 * Increment an issue's helpful vote count in Firebase Realtime Database (`issues/{issueId}`).
 */
export async function upvoteIssueInDatabase(
  issueId: string,
  nextUpvotes: number
): Promise<boolean> {
  const db = getFirebaseDatabase();
  if (!db) return false;

  try {
    const issueRef = ref(db, `issues/${issueId}`);
    await update(issueRef, {
      upvotes: nextUpvotes,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Subscribe to real-time updates of volunteer events (`events` node in Firebase Realtime Database).
 * Automatically seeds initial Iligan City volunteer events if the node does not exist yet.
 */
export function subscribeToEvents(
  onEventsChange: (events: VolunteerEvent[]) => void
): Unsubscribe {
  const db = getFirebaseDatabase();
  if (!db) {
    onEventsChange(UPCOMING_VOLUNTEER_EVENTS);
    return () => {};
  }

  const eventsRef = ref(db, "events");
  return onValue(
    eventsRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        const seedRecord: Record<string, VolunteerEvent> = {};
        for (const evt of UPCOMING_VOLUNTEER_EVENTS) {
          seedRecord[evt.id] = evt;
        }
        update(eventsRef, seedRecord).catch(() => {});
        onEventsChange(UPCOMING_VOLUNTEER_EVENTS);
        return;
      }

      const data = snapshot.val() as Record<string, VolunteerEvent>;
      const eventsList = Object.values(data);
      onEventsChange(
        eventsList.length > 0 ? eventsList : UPCOMING_VOLUNTEER_EVENTS
      );
    },
    () => {
      onEventsChange(UPCOMING_VOLUNTEER_EVENTS);
    }
  );
}

/**
 * Save a new or updated volunteer event to Firebase Realtime Database (`events/{eventId}`).
 */
export async function saveEventToDatabase(
  event: VolunteerEvent
): Promise<boolean> {
  const db = getFirebaseDatabase();
  if (!db) return false;

  try {
    const eventRef = ref(db, `events/${event.id}`);
    await set(eventRef, event);
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete a volunteer event from Firebase Realtime Database (`events/{eventId}`).
 */
export async function deleteEventFromDatabase(
  eventId: string
): Promise<boolean> {
  const db = getFirebaseDatabase();
  if (!db) return false;

  try {
    const eventRef = ref(db, `events/${eventId}`);
    await remove(eventRef);
    return true;
  } catch {
    return false;
  }
}

/**
 * Subscribe to a user's joined volunteer events in Firebase Realtime Database (`eventRegistrations/{uid}`).
 */
export function subscribeToUserJoinedEvents(
  uid: string,
  onJoinedIdsChange: (eventIds: string[]) => void
): Unsubscribe {
  const db = getFirebaseDatabase();
  if (!db || !uid) {
    return () => {};
  }

  const userEventsRef = ref(db, `eventRegistrations/${uid}`);
  return onValue(
    userEventsRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onJoinedIdsChange([]);
        return;
      }
      const data = snapshot.val() as Record<string, unknown>;
      onJoinedIdsChange(Object.keys(data));
    },
    () => {}
  );
}

/**
 * Subscribe to all event participants grouped by `eventId` (`eventParticipants/{eventId}/{uid}`)
 * for the Admin Dashboard.
 */
export function subscribeToAllEventParticipants(
  onParticipantsChange: (
    byEventId: Record<string, EventParticipantRecord[]>
  ) => void
): Unsubscribe {
  const formatParticipantsMap = (
    raw: Record<string, Record<string, EventParticipantRecord>>
  ): Record<string, EventParticipantRecord[]> => {
    const result: Record<string, EventParticipantRecord[]> = {};
    for (const [eventId, usersMap] of Object.entries(raw)) {
      result[eventId] = Object.values(usersMap || {}).sort(
        (a, b) =>
          new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
      );
    }
    return result;
  };

  const db = getFirebaseDatabase();
  if (!db) {
    onParticipantsChange(formatParticipantsMap(INITIAL_EVENT_PARTICIPANTS));
    return () => {};
  }

  const allParticipantsRef = ref(db, "eventParticipants");
  return onValue(
    allParticipantsRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        update(allParticipantsRef, INITIAL_EVENT_PARTICIPANTS).catch(() => {});
        onParticipantsChange(formatParticipantsMap(INITIAL_EVENT_PARTICIPANTS));
        return;
      }

      const raw = snapshot.val() as Record<
        string,
        Record<string, EventParticipantRecord>
      >;
      onParticipantsChange(formatParticipantsMap(raw));
    },
    () => {
      onParticipantsChange(formatParticipantsMap(INITIAL_EVENT_PARTICIPANTS));
    }
  );
}

/**
 * Save a user's registration for a volunteer event in Firebase Realtime Database.
 */
export async function joinEventInDatabase(params: {
  uid: string;
  userName: string;
  userEmail: string | null;
  event: VolunteerEvent;
}): Promise<boolean> {
  const db = getFirebaseDatabase();
  if (!db || !params.uid) return false;

  const joinedAt = new Date().toISOString();
  const payload: EventParticipantRecord = {
    eventId: params.event.id,
    eventTitle: params.event.title,
    eventDate: params.event.date,
    timeRange: params.event.timeRange,
    locationName: params.event.locationName,
    organizer: params.event.organizer,
    uid: params.uid,
    userName: params.userName,
    userEmail: params.userEmail,
    joinedAt,
  };

  try {
    await Promise.all([
      set(
        ref(db, `eventRegistrations/${params.uid}/${params.event.id}`),
        payload
      ),
      set(
        ref(db, `eventParticipants/${params.event.id}/${params.uid}`),
        payload
      ),
    ]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove a user's registration for a volunteer event in Firebase Realtime Database.
 */
export async function leaveEventInDatabase(params: {
  uid: string;
  eventId: string;
}): Promise<boolean> {
  const db = getFirebaseDatabase();
  if (!db || !params.uid) return false;

  try {
    await Promise.all([
      remove(ref(db, `eventRegistrations/${params.uid}/${params.eventId}`)),
      remove(ref(db, `eventParticipants/${params.eventId}/${params.uid}`)),
    ]);
    return true;
  } catch {
    return false;
  }
}
