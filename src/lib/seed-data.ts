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

export const ILIGAN_CITY_CENTER = {
  lat: 8.232,
  lng: 124.244,
};

export const SAMPLE_ISSUE_PRESETS: SampleIssuePreset[] = [
  {
    id: "preset-waste",
    label: "Uncollected roadside trash",
    subtitle: "Pala-o Public Market perimeter",
    photoUrl:
      "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=900&q=80",
    expectedCategory: "Waste",
    expectedSeverity: "High",
    suggestedTitle: "Uncollected waste bags along Pala-o Market perimeter road",
    suggestedDescription:
      "Overflowing waste bins and scattered plastic bags blocking the pedestrian sidewalk near the Pala-o Public Market entrance.",
    detectedObjects: ["Overflowing bins", "Plastic bags", "Sidewalk obstruction"],
    recommendedAgency: "Iligan City Environment & Management Office (ICEMO)",
    confidence: 0.97,
    coordinates: {
      lat: 8.2256,
      lng: 124.2492,
      accuracyMeters: 8,
      addressLabel: "Pala-o Public Market Perimeter Rd, Brgy. Pala-o",
      district: "Brgy. Pala-o, Iligan City",
    },
  },
  {
    id: "preset-road",
    label: "Deep road pothole",
    subtitle: "Andres Bonifacio Ave, Tibanga",
    photoUrl:
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=900&q=80",
    expectedCategory: "Road Hazard",
    expectedSeverity: "Critical",
    suggestedTitle: "Deep pothole on outer lane near MSU-IIT pedestrian gate",
    suggestedDescription:
      "Wide asphalt pothole with standing water along the southbound lane of Andres Bonifacio Avenue, creating a hazard for motorcycles and jeepneys.",
    detectedObjects: ["Pothole", "Damaged asphalt", "Standing water"],
    recommendedAgency: "Iligan City Engineer's Office",
    confidence: 0.95,
    coordinates: {
      lat: 8.2414,
      lng: 124.2439,
      accuracyMeters: 6,
      addressLabel: "Andres Bonifacio Ave (near MSU-IIT), Brgy. Tibanga",
      district: "Brgy. Tibanga, Iligan City",
    },
  },
  {
    id: "preset-facility",
    label: "Damaged waiting shed",
    subtitle: "Quezon Ave, Poblacion",
    photoUrl:
      "https://images.unsplash.com/photo-1541888946425-d09bb18086f6?auto=format&fit=crop&w=900&q=80",
    expectedCategory: "Broken Facility",
    expectedSeverity: "Medium",
    suggestedTitle: "Damaged commuter waiting shed roof on Quezon Avenue",
    suggestedDescription:
      "Public jeepney waiting shed near Plaza Publica has loose roof panels and a broken bench support that needs repair.",
    detectedObjects: ["Damaged roof", "Public bench", "Waiting shed"],
    recommendedAgency: "City General Services Office",
    confidence: 0.93,
    coordinates: {
      lat: 8.2285,
      lng: 124.2398,
      accuracyMeters: 10,
      addressLabel: "Quezon Ave near Plaza Publica, Brgy. Poblacion",
      district: "Brgy. Poblacion, Iligan City",
    },
  },
  {
    id: "preset-drainage",
    label: "Clogged storm drain",
    subtitle: "Roxas Ave, Mahayahay",
    photoUrl:
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=900&q=80",
    expectedCategory: "Flooding & Drainage",
    expectedSeverity: "High",
    suggestedTitle: "Blocked drainage grate causing street flooding on Roxas Ave",
    suggestedDescription:
      "Storm drain catch basin is clogged with silt and plastic litter, causing water to pool across the pedestrian lane during afternoon rain.",
    detectedObjects: ["Blocked drain grate", "Street ponding", "Debris"],
    recommendedAgency: "City Drainage & Flood Control Task Force",
    confidence: 0.94,
    coordinates: {
      lat: 8.2218,
      lng: 124.2445,
      accuracyMeters: 9,
      addressLabel: "Roxas Ave corner Zamora St, Brgy. Mahayahay",
      district: "Brgy. Mahayahay, Iligan City",
    },
  },
];

export const INITIAL_COMMUNITY_ISSUES: CommunityIssue[] = [
  {
    id: "ILG-101",
    title: "Uncollected waste bags along Pala-o Market perimeter road",
    description:
      "Overflowing waste bins and scattered plastic bags blocking the pedestrian sidewalk near the Pala-o Public Market entrance.",
    category: "Waste",
    severity: "High",
    status: "Verified",
    photoUrl:
      "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=900&q=80",
    storagePath: "issues/citizen-01/palao_waste.jpg",
    coordinates: {
      lat: 8.2256,
      lng: 124.2492,
      accuracyMeters: 8,
      addressLabel: "Pala-o Public Market Perimeter Rd, Brgy. Pala-o",
      district: "Brgy. Pala-o, Iligan City",
    },
    createdAt: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
    reporterName: "Katrina M.",
    reporterUid: "uid-katrina-882",
    upvotes: 42,
    aiConfidence: 0.97,
    recommendedAgency: "Iligan City Environment & Management Office (ICEMO)",
    sheetsRowRef: "Row 14",
  },
  {
    id: "ILG-102",
    title: "Deep pothole on outer lane near MSU-IIT pedestrian gate",
    description:
      "Wide asphalt pothole with standing water along the southbound lane of Andres Bonifacio Avenue, posing a hazard to cyclists and motorcycles.",
    category: "Road Hazard",
    severity: "Critical",
    status: "Dispatched",
    photoUrl:
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=900&q=80",
    storagePath: "issues/citizen-02/tibanga_pothole.jpg",
    coordinates: {
      lat: 8.2414,
      lng: 124.2439,
      accuracyMeters: 6,
      addressLabel: "Andres Bonifacio Ave (near MSU-IIT), Brgy. Tibanga",
      district: "Brgy. Tibanga, Iligan City",
    },
    createdAt: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
    reporterName: "Marco V.",
    reporterUid: "uid-marco-319",
    upvotes: 68,
    aiConfidence: 0.95,
    recommendedAgency: "Iligan City Engineer's Office",
    sheetsRowRef: "Row 15",
  },
  {
    id: "ILG-103",
    title: "Damaged commuter waiting shed roof on Quezon Avenue",
    description:
      "Public jeepney waiting shelter near Plaza Publica has loose roof sheets and a non-working solar lamp.",
    category: "Broken Facility",
    severity: "Medium",
    status: "In Progress",
    photoUrl:
      "https://images.unsplash.com/photo-1541888946425-d09bb18086f6?auto=format&fit=crop&w=900&q=80",
    storagePath: "issues/citizen-03/poblacion_shed.jpg",
    coordinates: {
      lat: 8.2285,
      lng: 124.2398,
      accuracyMeters: 10,
      addressLabel: "Quezon Ave near Plaza Publica, Brgy. Poblacion",
      district: "Brgy. Poblacion, Iligan City",
    },
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    reporterName: "Jessa D.",
    reporterUid: "uid-jessa-404",
    upvotes: 29,
    aiConfidence: 0.93,
    recommendedAgency: "City General Services Office",
    sheetsRowRef: "Row 16",
  },
  {
    id: "ILG-104",
    title: "Blocked drainage grate causing street flooding on Roxas Ave",
    description:
      "Catch basin along the intersection is clogged with silt and plastic bottles, backing up rainwater onto the pedestrian crossing.",
    category: "Flooding & Drainage",
    severity: "High",
    status: "Reported",
    photoUrl:
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=900&q=80",
    storagePath: "issues/citizen-04/mahayahay_drain.jpg",
    coordinates: {
      lat: 8.2218,
      lng: 124.2445,
      accuracyMeters: 9,
      addressLabel: "Roxas Ave corner Zamora St, Brgy. Mahayahay",
      district: "Brgy. Mahayahay, Iligan City",
    },
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    reporterName: "Carlo R.",
    reporterUid: "uid-carlo-511",
    upvotes: 51,
    aiConfidence: 0.94,
    recommendedAgency: "City Drainage & Flood Control Task Force",
    sheetsRowRef: "Row 17",
  },
  {
    id: "ILG-105",
    title: "Three consecutive streetlights out along Tambo Baywalk road",
    description:
      "Three streetlamp posts are unlit along the coastal jogging and bike lane near Centennial Park.",
    category: "Streetlight Outage",
    severity: "Medium",
    status: "Dispatched",
    photoUrl:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=80",
    storagePath: "issues/citizen-05/baywalk_lights.jpg",
    coordinates: {
      lat: 8.2485,
      lng: 124.2405,
      accuracyMeters: 7,
      addressLabel: "Tambo Baywalk Road, Brgy. Hinaplanon",
      district: "Brgy. Hinaplanon, Iligan City",
    },
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    reporterName: "Bea L.",
    reporterUid: "uid-bea-909",
    upvotes: 35,
    aiConfidence: 0.91,
    recommendedAgency: "City Electrical Maintenance Division",
    sheetsRowRef: "Row 18",
  },
];

export const UPCOMING_VOLUNTEER_EVENTS: VolunteerEvent[] = [
  {
    id: "EVT-ILG-01",
    title: "Tambo Baywalk & Coastal Clean-Up Drive",
    organizer: "Iligan EcoYouth & Brgy. Santiago Council",
    date: "Saturday, Nov 21",
    timeRange: "6:30 AM – 10:00 AM",
    locationName: "Centennial Park & Baywalk, Brgy. Santiago, Iligan City",
    coordinates: {
      lat: 8.2468,
      lng: 124.2395,
      addressLabel: "Centennial Park & Baywalk, Brgy. Santiago",
      district: "Brgy. Santiago, Iligan City",
    },
    category: "Community Clean-Up",
    participantsCount: 84,
    maxParticipants: 120,
    description:
      "Join fellow Iliganons for a morning coastal clean-up and waste sorting drive along Tambo Baywalk. Gloves and sorting sacks are provided.",
    dialectTags: ["Bisaya", "Tagalog", "English"],
    pointsReward: 50,
  },
  {
    id: "EVT-ILG-02",
    title: "Tibanga Drainage & Sidewalk Clear-Up",
    organizer: "MSU-IIT Student Volunteers & Brgy. Tibanga",
    date: "Sunday, Nov 22",
    timeRange: "7:00 AM – 11:00 AM",
    locationName: "Andres Bonifacio Ave, Brgy. Tibanga, Iligan City",
    coordinates: {
      lat: 8.2422,
      lng: 124.2444,
      addressLabel: "Andres Bonifacio Ave, Brgy. Tibanga",
      district: "Brgy. Tibanga, Iligan City",
    },
    category: "Flooding & Drainage",
    participantsCount: 47,
    maxParticipants: 60,
    description:
      "Community drive to clear street catch basins ahead of heavy rains and repaint pedestrian crosswalks near the university belt.",
    dialectTags: ["Bisaya", "English"],
    pointsReward: 60,
  },
  {
    id: "EVT-ILG-03",
    title: "Mandulog River Mangrove & Tree Planting",
    organizer: "Save Mandulog Coalition & ICEMO",
    date: "Saturday, Nov 28",
    timeRange: "6:00 AM – 10:30 AM",
    locationName: "Mandulog River Esplanade, Brgy. Hinaplanon, Iligan City",
    coordinates: {
      lat: 8.259,
      lng: 124.251,
      addressLabel: "Mandulog River Esplanade, Brgy. Hinaplanon",
      district: "Brgy. Hinaplanon, Iligan City",
    },
    category: "Tree Planting",
    participantsCount: 38,
    maxParticipants: 80,
    description:
      "Help plant native riverbank seedlings and mangrove propagules along the Mandulog River buffer zone to reduce flood erosion.",
    dialectTags: ["Bisaya", "Tagalog", "English"],
    pointsReward: 75,
  },
];
