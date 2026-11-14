import { NextRequest, NextResponse } from "next/server";
import { UPCOMING_VOLUNTEER_EVENTS } from "@/lib/seed-data";
import { DialectCode } from "@/types/ecovibe";

interface ChatRequest {
  message: string;
  preferredDialect?: DialectCode;
}

export async function POST(request: NextRequest) {
  try {
    const { message = "", preferredDialect = "auto" } = (await request.json()) as ChatRequest;
    const q = message.toLowerCase();

    const hasBisayaCue =
      preferredDialect === "ceb" ||
      /\b(unsa|unsay|asa|kanus-a|karong|sabado|domingo|tabang|basura|dalan|guba|apil|maayong|kumusta|daghang|salamat|baha|iligan|tibanga|palao|tambo)\b/i.test(
        q
      );
    const hasTagalogCue =
      preferredDialect === "tl" ||
      /\b(saan|kailan|paano|tulong|linis|sumali|magandang|salamat|baha|kalsada|basurahan)\b/i.test(q);

    const detectedDialect = hasBisayaCue
      ? "Bisaya"
      : hasTagalogCue
      ? "Tagalog"
      : "English";

    if (
      q.includes("event") ||
      q.includes("volunteer") ||
      q.includes("clean") ||
      q.includes("sabado") ||
      q.includes("weekend") ||
      q.includes("apil") ||
      q.includes("sumali") ||
      q.includes("unsay") ||
      q.includes("coastal") ||
      q.includes("tambo") ||
      q.includes("tibanga") ||
      q.includes("mandulog")
    ) {
      if (hasBisayaCue) {
        return NextResponse.json({
          reply:
            "Maayong adlaw! Mao kini ang umaabot nga mga volunteer events diri sa Iligan City:\n\n" +
            "• Tambo Baywalk & Coastal Clean-Up Drive — Sabado, Nov 21 (6:30 AM sa Centennial Park & Baywalk, Brgy. Santiago)\n" +
            "• Tibanga Drainage & Sidewalk Clear-Up — Domingo, Nov 22 (7:00 AM sa Andres Bonifacio Ave duol sa MSU-IIT)\n" +
            "• Mandulog River Mangrove & Tree Planting — Sabado, Nov 28 (6:00 AM sa Mandulog River Esplanade, Brgy. Hinaplanon)\n\n" +
            "I-klik lang ang Join event sa ubos aron magparehistro!",
          detectedDialect,
          relatedEvents: UPCOMING_VOLUNTEER_EVENTS,
        });
      }

      if (hasTagalogCue) {
        return NextResponse.json({
          reply:
            "Magandang araw! Narito ang mga susunod na volunteer events sa Iligan City:\n\n" +
            "• Tambo Baywalk & Coastal Clean-Up Drive — Sabado, Nov 21 (6:30 AM sa Centennial Park & Baywalk, Brgy. Santiago)\n" +
            "• Tibanga Drainage & Sidewalk Clear-Up — Linggo, Nov 22 (7:00 AM sa Andres Bonifacio Ave, Brgy. Tibanga)\n\n" +
            "Pindutin ang Join event sa ibaba para makasali!",
          detectedDialect,
          relatedEvents: UPCOMING_VOLUNTEER_EVENTS.slice(0, 2),
        });
      }

      return NextResponse.json({
        reply:
          "Here are the upcoming community volunteer events in Iligan City:\n\n" +
          "• Tambo Baywalk & Coastal Clean-Up Drive — Sat, Nov 21 (6:30 AM) at Centennial Park & Baywalk, Brgy. Santiago\n" +
          "• Tibanga Drainage & Sidewalk Clear-Up — Sun, Nov 22 (7:00 AM) along Andres Bonifacio Ave, Brgy. Tibanga\n" +
          "• Mandulog River Mangrove & Tree Planting — Sat, Nov 28 (6:00 AM) at Mandulog River Esplanade, Brgy. Hinaplanon\n\n" +
          "You can sign up directly on any card below.",
        detectedDialect,
        relatedEvents: UPCOMING_VOLUNTEER_EVENTS,
      });
    }

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
            "Sayon ra ang pag-report og isyu sa inyong barangay:\n\n" +
            "1. I-upload ang litrato sa isyu (sama sa basura sa Pala-o o libaong sa dalan).\n" +
            "2. Awtomatikong mapili ang Category (Waste, Road Hazard, Broken Facility, o Flooding & Drainage).\n" +
            "3. I-klik ang Use my location ug i-submit aron makita dayon sa mapa sa Iligan City.",
          detectedDialect,
          relatedEvents: [UPCOMING_VOLUNTEER_EVENTS[1]],
        });
      }

      return NextResponse.json({
        reply:
          "You can report a neighborhood issue in three quick steps:\n\n" +
          "1. Upload a photo of the issue in the Report an issue section.\n" +
          "2. We'll automatically suggest the right Category (such as Waste, Road Hazard, or Broken Facility).\n" +
          "3. Tap Use my location to tag the spot in Iligan City and submit.",
        detectedDialect,
        relatedEvents: [UPCOMING_VOLUNTEER_EVENTS[0]],
      });
    }

    if (hasBisayaCue) {
      return NextResponse.json({
        reply:
          "Kumusta! Pwede ka mangutana sa Bisaya, Tagalog, o English bahin sa:\n" +
          "• Mga clean-up ug tree planting events sa Tambo Baywalk, Tibanga, ug Mandulog River\n" +
          "• Unsaon pag-report og basura, baha, o guba nga pasilidad sa Iligan City.",
        detectedDialect,
        relatedEvents: UPCOMING_VOLUNTEER_EVENTS.slice(0, 2),
      });
    }

    return NextResponse.json({
      reply:
        "Hello! I can help you in Bisaya, Tagalog, or English. Ask me about upcoming clean-up drives in Iligan City (Tambo Baywalk, Tibanga, or Mandulog River) or how to report an issue in your barangay.",
      detectedDialect,
      relatedEvents: UPCOMING_VOLUNTEER_EVENTS.slice(0, 2),
    });
  } catch {
    return NextResponse.json(
      {
        reply:
          "Ask me about upcoming volunteer events in Iligan City in Bisaya, Tagalog, or English.",
        detectedDialect: "Bisaya / English",
        relatedEvents: UPCOMING_VOLUNTEER_EVENTS.slice(0, 1),
      },
      { status: 200 }
    );
  }
}
