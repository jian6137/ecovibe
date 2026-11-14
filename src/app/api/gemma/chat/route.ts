import { NextRequest, NextResponse } from "next/server";
import { UPCOMING_VOLUNTEER_EVENTS } from "@/lib/seed-data";
import { DialectCode } from "@/types/ecovibe";

/**
 * Serverless Endpoint: Gemma Local Dialect Community Chatbot (Placeholder)
 * Route: POST /api/gemma/chat
 *
 * Understands English, Bisaya / Cebuano, and Tagalog queries about volunteer events,
 * waste collection schedules, and how to report community infrastructure issues.
 */

interface GemmaChatRequest {
  message: string;
  preferredDialect?: DialectCode;
}

export async function POST(request: NextRequest) {
  try {
    const { message = "", preferredDialect = "auto" } = (await request.json()) as GemmaChatRequest;
    const q = message.toLowerCase();

    // Detect local dialect cues (Bisaya/Cebuano, Tagalog, or English)
    const hasBisayaCue =
      preferredDialect === "ceb" ||
      /\b(unsa|unsay|asa|kanus-a|karong|sabado|domingo|tabang|basura|dalan|guba|apil|maayong|kumusta|daghang|salamat|baha)\b/i.test(
        q
      );
    const hasTagalogCue =
      preferredDialect === "tl" ||
      /\b(saan|kailan|paano|tulong|linis|sumali|magandang|salamat|baha|kalsada|basurahan)\b/i.test(q);

    const detectedDialect = hasBisayaCue
      ? "Bisaya / Cebuano (Gemma-3-27B)"
      : hasTagalogCue
      ? "Tagalog / Filipino (Gemma-3-27B)"
      : "English / Local Mixed (Gemma-3-27B)";

    // Check intent: coastal / clean-up / weekend events
    if (
      q.includes("event") ||
      q.includes("volunteer") ||
      q.includes("clean") ||
      q.includes("sabado") ||
      q.includes("weekend") ||
      q.includes("apil") ||
      q.includes("sumali") ||
      q.includes("unsay") ||
      q.includes("coastal")
    ) {
      if (hasBisayaCue) {
        return NextResponse.json({
          reply:
            "Maayong adlaw! Karong umaabot nga weekend, aduna kitay **3 ka EcoVibe Volunteer Events**:\n\n" +
            "1. **Bayanihan Coastal & Riverbank Plastic Audit** (Sabado, Nov 21 • 6:30 AM sa Macajalar Bay Esplanade) — +250 EcoPoints.\n" +
            "2. **De-Clog & Paint: Urban Drainage & Crosswalk Rehab** (Domingo, Nov 22 • 7:00 AM sa Cogon–Lapasan Corridor) — +300 EcoPoints.\n" +
            "3. **Solar Park Lamp & Waiting Shed Repair Sprint** (Sabado, Nov 28 • 8:00 AM sa Divisoria) — +350 EcoPoints.\n\n" +
            "Pwede ka mo-klik sa **'Join Event'** button sa ubos aron ma-rehistro dayon ang imong slot!",
          detectedDialect,
          relatedEvents: UPCOMING_VOLUNTEER_EVENTS,
          modelBadge: process.env.GEMMA_CHAT_MODEL || "gemma-3-27b-it (Local Dialect Tuned)",
        });
      }

      if (hasTagalogCue) {
        return NextResponse.json({
          reply:
            "Magandang araw! Narito ang mga paparating na **EcoVibe Volunteer Events** ngayong linggo:\n\n" +
            "• **Bayanihan Coastal & Riverbank Plastic Audit** — Sabado, Nov 21 (6:30 AM) sa Macajalar Bay Esplanade (+250 EcoPoints).\n" +
            "• **De-Clog & Paint: Urban Drainage Rehab** — Linggo, Nov 22 (7:00 AM) sa Cogon–Lapasan Corridor (+300 EcoPoints).\n\n" +
            "Pindutin lamang ang **'Join Event'** sa card sa ibaba para makasali!",
          detectedDialect,
          relatedEvents: UPCOMING_VOLUNTEER_EVENTS.slice(0, 2),
          modelBadge: process.env.GEMMA_CHAT_MODEL || "gemma-3-27b-it (Local Dialect Tuned)",
        });
      }

      return NextResponse.json({
        reply:
          "Here are the upcoming **EcoVibe Community Volunteer Events** you can join right now:\n\n" +
          "• **Bayanihan Coastal & Riverbank Plastic Audit** — Sat, Nov 21 (06:30 AM) at Macajalar Bay Esplanade (+250 EcoPoints).\n" +
          "• **De-Clog & Paint: Urban Drainage & Crosswalk Rehab** — Sun, Nov 22 (07:00 AM) at Cogon–Lapasan Corridor (+300 EcoPoints).\n" +
          "• **Solar Park Lamp & Waiting Shed Repair Sprint** — Sat, Nov 28 (08:00 AM) at Divisoria Transit Hub (+350 EcoPoints).\n\n" +
          "You can RSVP directly using the interactive event cards below!",
        detectedDialect,
        relatedEvents: UPCOMING_VOLUNTEER_EVENTS,
        modelBadge: process.env.GEMMA_CHAT_MODEL || "gemma-3-27b-it (Local Dialect Tuned)",
      });
    }

    // Check intent: how to report an issue / broken road / uncollected trash
    if (
      q.includes("report") ||
      q.includes("guba") ||
      q.includes("dalan") ||
      q.includes("basura") ||
      q.includes("trash") ||
      q.includes("pothole") ||
      q.includes("paano") ||
      q.includes("unsaon")
    ) {
      if (hasBisayaCue) {
        return NextResponse.json({
          reply:
            "Sayon ra kaayo ang pag-report sa EcoVibe! Sunda kini nga **3 ka lakang**:\n\n" +
            "1. **Kuhaa o i-upload ang litrato** sa isyu (pananglitan: wala nakolekta nga basura o guba nga dalan) sa **Issue Reporting Flow**.\n" +
            "2. Ang atong **Gemini Vision AI** awtomatikong mo-ila sa Category (`Waste`, `Road Hazard`, `Broken Facility`, o `Flooding & Drainage`).\n" +
            "3. I-klik ang **Capture Geolocation** ug i-submit — ma-log dayon kini sa Google Sheets sa City Task Force ug mo-appear ang pin sa Map Dashboard!",
          detectedDialect,
          relatedEvents: [UPCOMING_VOLUNTEER_EVENTS[1]],
          modelBadge: process.env.GEMMA_CHAT_MODEL || "gemma-3-27b-it (Local Dialect Tuned)",
        });
      }

      return NextResponse.json({
        reply:
          "Reporting a localized infrastructure issue takes less than 30 seconds:\n\n" +
          "1. Go to the **Report an Issue** section and upload a photo (or pick a sample preset).\n" +
          "2. **Gemini Vision AI** automatically analyzes the photo and selects the right **Category** (`Waste`, `Road Hazard`, `Broken Facility`, etc.) and severity.\n" +
          "3. Click **Capture Geolocation** to tag your exact GPS coordinates and submit—your report is saved to Firebase Storage, logged to Google Sheets, and pinned live on the Map Dashboard!",
        detectedDialect,
        relatedEvents: [UPCOMING_VOLUNTEER_EVENTS[0]],
        modelBadge: process.env.GEMMA_CHAT_MODEL || "gemma-3-27b-it (Local Dialect Tuned)",
      });
    }

    // Default helpful multi-dialect response
    if (hasBisayaCue) {
      return NextResponse.json({
        reply:
          "Kumusta! Ako si **EcoVibe Gemma**, ang imong AI Community Coordinator nga makasabot og **Bisaya/Cebuano, Tagalog, ug English**. Pwede ka mangutana bahin sa:\n" +
          "• Mga **Volunteer Clean-up ug Repair Events** karong Sabado ug Domingo\n" +
          "• Unsaon pag-report og **basura, baha, o guba nga pasilidad**\n" +
          "• Unsaon pag-claim sa imong **EcoPoints**!",
        detectedDialect,
        relatedEvents: UPCOMING_VOLUNTEER_EVENTS.slice(0, 2),
        modelBadge: process.env.GEMMA_CHAT_MODEL || "gemma-3-27b-it (Local Dialect Tuned)",
      });
    }

    return NextResponse.json({
      reply:
        "Hello! I'm **EcoVibe Gemma**, your local-dialect AI assistant (supporting **English, Bisaya/Cebuano, and Tagalog**). Ask me about upcoming weekend **volunteer clean-up drives**, **drainage rehab sprints**, or how our **Gemini AI issue reporting** dispatches repair crews!",
      detectedDialect,
      relatedEvents: UPCOMING_VOLUNTEER_EVENTS.slice(0, 2),
      modelBadge: process.env.GEMMA_CHAT_MODEL || "gemma-3-27b-it (Local Dialect Tuned)",
    });
  } catch {
    return NextResponse.json(
      {
        reply:
          "EcoVibe Gemma is ready! Ask me about upcoming volunteer events in English, Bisaya (`Unsay volunteer events karong Sabado?`), or Tagalog.",
        detectedDialect: "Multilingual Fallback",
        relatedEvents: UPCOMING_VOLUNTEER_EVENTS.slice(0, 1),
        modelBadge: "gemma-3-27b-it",
      },
      { status: 200 }
    );
  }
}
