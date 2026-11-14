import { CommunityIssue, VolunteerEvent } from "@/types/ecovibe";

export interface SampleIssuePreset {
  id: string;
  label: string;
  subtitle: string;
  photoUrl: string;
  expectedCategory: CommunityIssue["category"];
  expectedSeverity: CommunityIssue["severity"];
  suggestedTitle: string;
  suggestedDescription: string;
  detectedObjects: string[];
  recommendedAgency: string;
  confidence: number;
  coordinates: CommunityIssue["coordinates"];
}

export const SAMPLE_ISSUE_PRESETS: SampleIssuePreset[] = [
  {
    id: "preset-waste",
    label: "Uncollected Roadside Waste",
    subtitle: "Overflowing municipal bins & plastic accumulation",
    photoUrl:
      "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=900&q=80",
    expectedCategory: "Waste",
    expectedSeverity: "High",
    suggestedTitle: "Uncollected Municipal Waste Overflow at Corner Market",
    suggestedDescription:
      "Multiple overflowing waste receptacles and scattered plastic bags obstructing the pedestrian walkway near the public market entrance. Requires immediate solid waste collection truck dispatch.",
    detectedObjects: ["Overflowing Bins", "Plastic Refuse", "Sidewalk Obstruction"],
    recommendedAgency: "City Local Environment & Natural Resources Office (CLENRO)",
    confidence: 0.97,
    coordinates: {
      lat: 8.47721,
      lng: 124.64592,
      accuracyMeters: 8,
      addressLabel: "Cogon Market Perimeter Rd, District 2",
      district: "Poblacion - Cogon",
    },
  },
  {
    id: "preset-road",
    label: "Deep Asphalt Pothole",
    subtitle: "Collapsed road surface & rainwater hazard",
    photoUrl:
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=900&q=80",
    expectedCategory: "Road Hazard",
    expectedSeverity: "Critical",
    suggestedTitle: "Deep Pothole & Fractured Asphalt on Primary Arterial Lane",
    suggestedDescription:
      "Severe 1.2-meter wide road depression with exposed aggregate along the outer commuter lane, posing an immediate hazard to cyclists, motorcycles, and public utility vehicles especially at night.",
    detectedObjects: ["Asphalt Crater", "Standing Water", "Lane Hazard"],
    recommendedAgency: "City Engineers Office / DPWH Maintenance Division",
    confidence: 0.95,
    coordinates: {
      lat: 8.48584,
      lng: 124.65641,
      accuracyMeters: 6,
      addressLabel: "CM Recto Ave Flyover Approach",
      district: "Lapasan",
    },
  },
  {
    id: "preset-facility",
    label: "Broken Park Waiting Shed",
    subtitle: "Damaged public bench, lighting & roof structure",
    photoUrl:
      "https://images.unsplash.com/photo-1541888946425-d09bb18086f6?auto=format&fit=crop&w=900&q=80",
    expectedCategory: "Broken Facility",
    expectedSeverity: "Medium",
    suggestedTitle: "Damaged Commuter Waiting Shed & Exposed Wiring",
    suggestedDescription:
      "Public transit waiting shelter has corroded roof panels, a collapsed concrete bench support, and an unsealed luminaire junction box requiring structural repair.",
    detectedObjects: ["Damaged Shelter Roof", "Exposed Conduit", "Broken Seating"],
    recommendedAgency: "General Services & Public Facilities Task Force",
    confidence: 0.93,
    coordinates: {
      lat: 8.46945,
      lng: 124.63812,
      accuracyMeters: 10,
      addressLabel: "Divisoria Plaza South Transit Stop",
      district: "Divisoria",
    },
  },
  {
    id: "preset-drainage",
    label: "Clogged Storm Drain",
    subtitle: "Silt & debris blocking street catch basin",
    photoUrl:
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=900&q=80",
    expectedCategory: "Flooding & Drainage",
    expectedSeverity: "High",
    suggestedTitle: "Blocked Storm Drainage Grate Causing Street Ponding",
    suggestedDescription:
      "Stormwater catch basin is 90% obstructed by plastic litter and sediment, causing rapid ankle-deep water accumulation during afternoon downpours.",
    detectedObjects: ["Storm Grate Obstruction", "Surface Runoff", "Debris Accumulation"],
    recommendedAgency: "City Drainage & Flood Control Engineering Unit",
    confidence: 0.94,
    coordinates: {
      lat: 8.4912,
      lng: 124.6498,
      accuracyMeters: 9,
      addressLabel: "Kauswagan Highway Junction",
      district: "Kauswagan",
    },
  },
];

export const INITIAL_COMMUNITY_ISSUES: CommunityIssue[] = [
  {
    id: "ECO-2026-101",
    title: "Uncollected Municipal Waste Overflow at Corner Market",
    description:
      "Multiple overflowing waste receptacles and scattered plastic bags obstructing the pedestrian walkway near the public market entrance.",
    category: "Waste",
    severity: "High",
    status: "AI Verified",
    photoUrl:
      "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=900&q=80",
    storagePath: "issues/citizen-01/1794612000_cogon_waste.jpg",
    coordinates: {
      lat: 8.47721,
      lng: 124.64592,
      accuracyMeters: 8,
      addressLabel: "Cogon Market Perimeter Rd, District 2",
      district: "Poblacion - Cogon",
    },
    createdAt: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
    reporterName: "Katrina M.",
    reporterUid: "uid-katrina-882",
    upvotes: 42,
    aiConfidence: 0.97,
    recommendedAgency: "CLENRO Solid Waste Task Force",
    sheetsRowRef: "Issues_Log!A14:J14",
  },
  {
    id: "ECO-2026-102",
    title: "Deep Pothole & Fractured Asphalt on Arterial Lane",
    description:
      "Severe 1.2m wide road depression with exposed aggregate along the outer commuter lane, posing an immediate hazard to cyclists and motorcycles.",
    category: "Road Hazard",
    severity: "Critical",
    status: "Dispatched",
    photoUrl:
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=900&q=80",
    storagePath: "issues/citizen-02/1794608400_recto_pothole.jpg",
    coordinates: {
      lat: 8.48584,
      lng: 124.65641,
      accuracyMeters: 6,
      addressLabel: "CM Recto Ave Flyover Approach",
      district: "Lapasan",
    },
    createdAt: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
    reporterName: "Engr. Marco V.",
    reporterUid: "uid-marco-319",
    upvotes: 68,
    aiConfidence: 0.95,
    recommendedAgency: "City Engineers Office / DPWH",
    sheetsRowRef: "Issues_Log!A15:J15",
  },
  {
    id: "ECO-2026-103",
    title: "Damaged Commuter Waiting Shed & Solar Lamp Outage",
    description:
      "Public transit waiting shelter has corroded roof panels and non-functioning solar LED luminaire leaving evening commuters in the dark.",
    category: "Broken Facility",
    severity: "Medium",
    status: "In Progress",
    photoUrl:
      "https://images.unsplash.com/photo-1541888946425-d09bb18086f6?auto=format&fit=crop&w=900&q=80",
    storagePath: "issues/citizen-03/1794590000_divisoria_shed.jpg",
    coordinates: {
      lat: 8.46945,
      lng: 124.63812,
      accuracyMeters: 10,
      addressLabel: "Divisoria Plaza South Transit Stop",
      district: "Divisoria",
    },
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    reporterName: "Jessa D.",
    reporterUid: "uid-jessa-404",
    upvotes: 29,
    aiConfidence: 0.93,
    recommendedAgency: "General Services & Streetlight Unit",
    sheetsRowRef: "Issues_Log!A16:J16",
  },
  {
    id: "ECO-2026-104",
    title: "Blocked Storm Drainage Grate Causing Flash Ponding",
    description:
      "Catch basin along the highway intersection is obstructed by silt and plastic bottles, backing up rainwater onto the pedestrian crosswalk.",
    category: "Flooding & Drainage",
    severity: "High",
    status: "Reported",
    photoUrl:
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=900&q=80",
    storagePath: "issues/citizen-04/1794579000_kauswagan_drain.jpg",
    coordinates: {
      lat: 8.4912,
      lng: 124.6498,
      accuracyMeters: 9,
      addressLabel: "Kauswagan Highway Junction",
      district: "Kauswagan",
    },
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    reporterName: "Carlo R.",
    reporterUid: "uid-carlo-511",
    upvotes: 51,
    aiConfidence: 0.94,
    recommendedAgency: "City Drainage & Flood Control Unit",
    sheetsRowRef: "Issues_Log!A17:J17",
  },
  {
    id: "ECO-2026-105",
    title: "Three Consecutive LED Streetlights Dark Along River Boulevard",
    description:
      "Three solar-assisted streetlamp posts are flickering or completely off along the jogging & bike lane corridor.",
    category: "Streetlight Outage",
    severity: "Medium",
    status: "Dispatched",
    photoUrl:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=80",
    storagePath: "issues/citizen-05/1794550000_boulevard_lights.jpg",
    coordinates: {
      lat: 8.4741,
      lng: 124.6335,
      accuracyMeters: 7,
      addressLabel: "Rio de Oro Boulevard Section 3",
      district: "Carmen",
    },
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    reporterName: "Bea L.",
    reporterUid: "uid-bea-909",
    upvotes: 35,
    aiConfidence: 0.91,
    recommendedAgency: "City Electrical Maintenance Division",
    sheetsRowRef: "Issues_Log!A18:J18",
  },
];

export const UPCOMING_VOLUNTEER_EVENTS: VolunteerEvent[] = [
  {
    id: "EVT-2026-01",
    title: "Bayanihan Coastal & Riverbank Plastic Audit",
    organizer: "EcoVibe Youth Advocates & CLENRO",
    date: "Saturday, Nov 21, 2026",
    timeRange: "06:30 AM – 10:30 AM",
    locationName: "Macajalar Bay Esplanade & River Mouth",
    coordinates: {
      lat: 8.4965,
      lng: 124.6442,
      addressLabel: "Macajalar Bay Esplanade",
      district: "Bonbon - Macabalan",
    },
    category: "Community Clean-Up",
    participantsCount: 84,
    maxParticipants: 120,
    description:
      "Join 100+ local volunteers to clear coastal plastic drift, log brand waste audits into our Google Sheets open dataset, and restore mangrove buffer zones.",
    dialectTags: ["Bisaya / Cebuano", "Tagalog", "English"],
    pointsReward: 250,
  },
  {
    id: "EVT-2026-02",
    title: "De-Clog & Paint: Urban Drainage & Crosswalk Rehab",
    organizer: "Barangay Civic Engineers & EcoVibe",
    date: "Sunday, Nov 22, 2026",
    timeRange: "07:00 AM – 11:30 AM",
    locationName: "Cogon – Lapasan Corridor",
    coordinates: {
      lat: 8.4815,
      lng: 124.6512,
      addressLabel: "Lapasan Commercial Hub",
      district: "Lapasan",
    },
    category: "Flooding & Drainage",
    participantsCount: 47,
    maxParticipants: 60,
    description:
      "Clearing silt traps ahead of the monsoon trough and repainting high-visibility tactile pedestrian lane markings near schools.",
    dialectTags: ["Bisaya / Cebuano", "English"],
    pointsReward: 300,
  },
  {
    id: "EVT-2026-03",
    title: "Solar Park Lamp & Waiting Shed Repair Sprint",
    organizer: "SolarBayan & Makerspace Volunteers",
    date: "Saturday, Nov 28, 2026",
    timeRange: "08:00 AM – 01:00 PM",
    locationName: "Divisoria & Carmen Transit Hubs",
    coordinates: {
      lat: 8.4718,
      lng: 124.6362,
      addressLabel: "Divisoria Amphitheater",
      district: "Divisoria",
    },
    category: "Broken Facility",
    participantsCount: 31,
    maxParticipants: 45,
    description:
      "Hands-on electrical & carpentry volunteer workshop replacing broken waiting shed panels and retrofitting autonomous solar LED nodes.",
    dialectTags: ["Bisaya / Cebuano", "Tagalog", "English"],
    pointsReward: 350,
  },
];
