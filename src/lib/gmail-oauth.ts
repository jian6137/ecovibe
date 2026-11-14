import { VolunteerEvent } from "@/types/ecovibe";
import {
  clearCachedGmailAccessToken,
  ensureGoogleGmailOAuthToken,
} from "@/lib/firebase/auth";

export interface SendParticipantsEmailParams {
  event: VolunteerEvent;
  senderEmail: string;
  senderName: string;
  bccEmails: string[];
  subject: string;
  body: string;
}

export interface SendParticipantsEmailOutcome {
  sent: boolean;
  mode: "gmail-api" | "nodemailer";
  messageId?: string;
  toEmail: string;
  bccCount: number;
  message: string;
}

function encodeUtf8Base64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function encodeMimeHeaderUtf8(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `=?UTF-8?B?${btoa(binary)}?=`;
}

async function tryNodemailerDirectFallback(
  params: SendParticipantsEmailParams,
  selfEmail: string,
  finalBcc: string[]
): Promise<SendParticipantsEmailOutcome | null> {
  try {
    const apiRes = await fetch("/api/events/email-participants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: params.event,
        senderEmail: selfEmail,
        senderName: params.senderName,
        bccEmails: finalBcc,
        subject: params.subject,
        body: params.body,
      }),
    });
    const data = await apiRes.json();
    if (data.sent) {
      return {
        sent: true,
        mode: "nodemailer",
        toEmail: data.toEmail || selfEmail,
        bccCount: data.bccCount ?? finalBcc.length,
        message:
          data.message ||
          `Sent directly to ${data.toEmail || selfEmail} with ${
            finalBcc.length
          } participant email(s) attached in BCC.`,
      };
    }
  } catch {
    // ignore fallback error
  }
  return null;
}

/**
 * Directly sends an email using the signed-in user's Google OAuth 2.0 access token
 * via the Gmail REST API (`POST https://gmail.googleapis.com/gmail/v1/users/me/messages/send`).
 *
 * - Addresses the email to the current Gmail account itself (`To: senderEmail`)
 * - ALWAYS attaches all participant email addresses in `Bcc:`
 * - Does NOT redirect to Gmail web compose
 */
export async function sendParticipantsEmailWithCurrentGmail(
  params: SendParticipantsEmailParams
): Promise<SendParticipantsEmailOutcome> {
  const selfEmail = params.senderEmail.trim();
  const uniqueBcc = Array.from(
    new Set(
      params.bccEmails
        .map((e) => e.trim())
        .filter((e) => e.includes("@"))
    )
  );
  const finalBcc =
    uniqueBcc.length > 0 ? uniqueBcc : selfEmail ? [selfEmail] : [];

  if (!selfEmail) {
    return {
      sent: false,
      mode: "gmail-api",
      toEmail: "",
      bccCount: finalBcc.length,
      message:
        "No signed-in Gmail address found. Please sign in with your Google account first.",
    };
  }

  // 1. Request the current user's OAuth 2.0 access token with `https://www.googleapis.com/auth/gmail.send`
  const { token: oauthToken, error: oauthError } =
    await ensureGoogleGmailOAuthToken();

  if (!oauthToken) {
    // If `.env` Nodemailer is configured, send directly on the server
    const smtpSent = await tryNodemailerDirectFallback(
      params,
      selfEmail,
      finalBcc
    );
    if (smtpSent) {
      return smtpSent;
    }

    return {
      sent: false,
      mode: "gmail-api",
      toEmail: selfEmail,
      bccCount: finalBcc.length,
      message: `Google OAuth automatically closed the popup because "gmail.send" is a Restricted Google scope. To allow your account (${selfEmail}) to grant "gmail.send": open Google Cloud Console → APIs & Services → OAuth consent screen → Audience / Test users, add ${selfEmail} as a Test user, and enable Gmail API in APIs & Services → Library (or configure EMAIL_USER and EMAIL_APP_PASSWORD in .env). ${
        oauthError ? `Details: ${oauthError}` : ""
      }`.trim(),
    };
  }

  const sanitizedSenderName = params.senderName.replace(/["\r\n]/g, "").trim();
  const fromHeader = sanitizedSenderName
    ? `"${sanitizedSenderName}" <${selfEmail}>`
    : selfEmail;

  const rfc2822Lines = [
    `From: ${fromHeader}`,
    `To: ${selfEmail}`,
    `Bcc: ${finalBcc.join(", ")}`,
    `Subject: ${encodeMimeHeaderUtf8(params.subject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    params.body,
  ];

  const raw = encodeUtf8Base64Url(rfc2822Lines.join("\r\n"));

  try {
    const response = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${oauthToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw }),
      }
    );

    if (response.status === 401 || response.status === 403) {
      clearCachedGmailAccessToken();
      const errJson = await response.json().catch(() => null);
      const apiMsg: string =
        errJson?.error?.message ||
        `Gmail API returned status ${response.status}.`;

      const smtpSent = await tryNodemailerDirectFallback(
        params,
        selfEmail,
        finalBcc
      );
      if (smtpSent) {
        return smtpSent;
      }

      if (
        apiMsg.includes("has not been used in project") ||
        apiMsg.includes("is disabled")
      ) {
        return {
          sent: false,
          mode: "gmail-api",
          toEmail: selfEmail,
          bccCount: finalBcc.length,
          message: `Gmail API is not enabled on your Google Cloud project yet. Enable "Gmail API" in Google Cloud Console (APIs & Services → Library) and click Send again. (${apiMsg})`,
        };
      }

      return {
        sent: false,
        mode: "gmail-api",
        toEmail: selfEmail,
        bccCount: finalBcc.length,
        message: `Gmail API error: ${apiMsg}`,
      };
    }

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      const apiMsg: string =
        errJson?.error?.message ||
        `Gmail API returned status ${response.status}.`;
      return {
        sent: false,
        mode: "gmail-api",
        toEmail: selfEmail,
        bccCount: finalBcc.length,
        message: `Failed to send via Gmail API: ${apiMsg}`,
      };
    }

    const data = (await response.json()) as {
      id?: string;
      threadId?: string;
    };

    return {
      sent: true,
      mode: "gmail-api",
      messageId: data.id,
      toEmail: selfEmail,
      bccCount: finalBcc.length,
      message: `Sent directly via Gmail API from ${selfEmail} to itself with ${
        finalBcc.length
      } participant email${
        finalBcc.length === 1 ? "" : "s"
      } attached in BCC${data.id ? ` (Message ID: ${data.id})` : ""}.`,
    };
  } catch (err) {
    const errMsg =
      err instanceof Error
        ? err.message
        : "Network error while calling Gmail API.";
    return {
      sent: false,
      mode: "gmail-api",
      toEmail: selfEmail,
      bccCount: finalBcc.length,
      message: `Failed to reach Gmail API: ${errMsg}`,
    };
  }
}
