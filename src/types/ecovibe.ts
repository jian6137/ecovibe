export type IssueCategory =
  | "Waste"
  | "Road Hazard"
  | "Broken Facility"
  | "Flooding & Drainage"
  | "Streetlight Outage"
  | "Illegal Dumping";

export type IssueSeverity = "Low" | "Medium" | "High" | "Critical";

export type IssueStatus = "Reported" | "AI Verified" | "Dispatched" | "In Progress" | "Resolved";

export interface GeoCoordinates {
  lat: number;
  lng: number;
  accuracyMeters?: number;
  addressLabel?: string;
  district?: string;
}

export interface GeminiAnalysisResult {
  category: IssueCategory;
  confidence: number; // 0.0 - 1.0
  severity: IssueSeverity;
  suggestedTitle: string;
  suggestedDescription: string;
  detectedObjects: string[];
  recommendedAgency: string;
  analysisLatencyMs: number;
  modelVersion: string;
}

export interface CommunityIssue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  photoUrl: string;
  storagePath?: string;
  coordinates: GeoCoordinates;
  createdAt: string;
  reporterName: string;
  reporterUid: string;
  upvotes: number;
  aiConfidence?: number;
  recommendedAgency?: string;
  sheetsRowRef?: string;
}

export interface VolunteerEvent {
  id: string;
  title: string;
  organizer: string;
  date: string;
  timeRange: string;
  locationName: string;
  coordinates: GeoCoordinates;
  category: IssueCategory | "Community Clean-Up" | "Tree Planting";
  participantsCount: number;
  maxParticipants: number;
  description: string;
  dialectTags: string[];
  pointsReward: number;
}

export type DialectCode = "auto" | "ceb" | "tl" | "en";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  detectedDialect?: string;
  relatedEvents?: VolunteerEvent[];
  modelBadge?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  ecoPoints: number;
  role: "Citizen Reporter" | "Neighborhood Coordinator";
}

export interface SheetsLogPayload {
  issueId: string;
  title: string;
  category: IssueCategory;
  severity: IssueSeverity;
  lat: number;
  lng: number;
  addressLabel: string;
  photoUrl: string;
  reporterUid: string;
  reporterName: string;
  aiConfidence?: number;
  createdAt: string;
}

export interface SheetsSyncResponse {
  success: boolean;
  spreadsheetId: string;
  updatedRange: string;
  rowNumber: number;
  syncedAt: string;
  mode: "google-sheets-api" | "serverless-mock-fallback";
}
