import { NextRequest, NextResponse } from "next/server";
import { VolunteerEvent } from "@/types/ecovibe";
import { sendEventConfirmationEmail } from "@/lib/mailer";

interface JoinEventRequestBody {
  event: VolunteerEvent;
  userEmail: string;
  userName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as JoinEventRequestBody;

    if (!body?.event?.id || !body?.event?.title) {
      return NextResponse.json(
        { error: "Missing volunteer event details." },
        { status: 400 }
      );
    }

    const email = (body.userEmail || "").trim();
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required for confirmation." },
        { status: 400 }
      );
    }

    const result = await sendEventConfirmationEmail({
      recipientEmail: email,
      recipientName: body.userName?.trim() || "Volunteer",
      event: body.event,
    });

    return NextResponse.json({
      success: true,
      emailSent: result.sent,
      recipientEmail: result.recipientEmail,
      message: result.message,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process event registration." },
      { status: 500 }
    );
  }
}
