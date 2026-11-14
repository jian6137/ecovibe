import { NextRequest, NextResponse } from "next/server";
import { sendBulkParticipantEmail } from "@/lib/mailer";
import { VolunteerEvent } from "@/types/ecovibe";

interface EmailParticipantsPayload {
  event: VolunteerEvent;
  senderEmail?: string;
  senderName?: string;
  bccEmails: string[];
  subject: string;
  body: string;
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as EmailParticipantsPayload;

    if (!payload.event || !payload.subject?.trim() || !payload.body?.trim()) {
      return NextResponse.json(
        {
          sent: false,
          configured: false,
          message: "Missing required event, subject, or email body.",
        },
        { status: 400 }
      );
    }

    const result = await sendBulkParticipantEmail({
      senderEmail: payload.senderEmail,
      senderName: payload.senderName,
      bccEmails: Array.isArray(payload.bccEmails) ? payload.bccEmails : [],
      subject: payload.subject.trim(),
      body: payload.body.trim(),
      event: payload.event,
    });

    return NextResponse.json(result);
  } catch (err) {
    const errMsg =
      err instanceof Error ? err.message : "Failed to process participant email.";
    return NextResponse.json(
      {
        sent: false,
        configured: false,
        message: errMsg,
      },
      { status: 500 }
    );
  }
}
