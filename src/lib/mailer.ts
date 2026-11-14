import nodemailer from "nodemailer";
import { VolunteerEvent } from "@/types/ecovibe";

export interface EventConfirmationMailInput {
  recipientEmail: string;
  recipientName: string;
  event: VolunteerEvent;
}

export interface EventConfirmationMailResult {
  sent: boolean;
  recipientEmail: string;
  message: string;
}

function getEmailCredentials() {
  const emailUser = (
    process.env.EMAIL_USER ||
    process.env.SMTP_USER ||
    process.env.SMTP_EMAIL ||
    ""
  ).trim();

  // Strip spaces in case a 16-char Google App Password was pasted with spaces (e.g. "abcd efgh ijkl mnop")
  const rawPass =
    process.env.EMAIL_APP_PASSWORD ||
    process.env.SMTP_APP_PASSWORD ||
    process.env.SMTP_PASS ||
    "";
  const emailPass = rawPass.replace(/\s+/g, "");

  const emailFrom =
    process.env.EMAIL_FROM ||
    (emailUser ? `Ecovibe Iligan <${emailUser}>` : "Ecovibe Iligan <no-reply@ecovibe.local>");

  const isConfigured =
    Boolean(emailUser) &&
    Boolean(emailPass) &&
    !emailUser.includes("your-email@") &&
    !emailPass.includes("your-16-character-app-password");

  return {
    emailUser,
    emailPass,
    emailFrom,
    smtpHost: process.env.SMTP_HOST?.trim(),
    smtpPort: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465,
    isConfigured,
  };
}

export async function sendEventConfirmationEmail(
  input: EventConfirmationMailInput
): Promise<EventConfirmationMailResult> {
  const { recipientEmail, recipientName, event } = input;
  const creds = getEmailCredentials();

  if (!creds.isConfigured) {
    return {
      sent: false,
      recipientEmail,
      message:
        "Registration saved. Set EMAIL_USER and EMAIL_APP_PASSWORD in .env to send live confirmation emails.",
    };
  }

  try {
    const transporter = creds.smtpHost
      ? nodemailer.createTransport({
          host: creds.smtpHost,
          port: creds.smtpPort,
          secure: creds.smtpPort === 465,
          auth: {
            user: creds.emailUser,
            pass: creds.emailPass,
          },
        })
      : nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: creds.emailUser,
            pass: creds.emailPass,
          },
        });

    const subject = `You're registered: ${event.title} (${event.date})`;

    const textBody = [
      `Hi ${recipientName},`,
      ``,
      `Thank you for joining an upcoming volunteer event in Iligan City with Ecovibe!`,
      ``,
      `Event Details:`,
      `• Event: ${event.title}`,
      `• Date: ${event.date}`,
      `• Time: ${event.timeRange}`,
      `• Location: ${event.locationName}`,
      `• Hosted by: ${event.organizer}`,
      ``,
      `${event.description}`,
      ``,
      `See you there!`,
      `— Ecovibe Iligan City Community Team`,
    ].join("\n");

    const htmlBody = `
      <div style="font-family: 'Google Sans', Roboto, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background-color: #FFF8F7; color: #201A19; border: 1px solid #D8C2BF; border-radius: 16px;">
        <div style="margin-bottom: 16px;">
          <span style="display: inline-block; background-color: #CB0021; color: #FFFFFF; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 999px;">
            Ecovibe • Iligan City
          </span>
        </div>

        <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #201A19;">
          You're going to ${event.title}!
        </h1>
        <p style="font-size: 14px; line-height: 1.6; color: #534341; margin: 0 0 20px 0;">
          Hi <strong>${recipientName}</strong>, your spot for this volunteer event in Iligan City is confirmed.
        </p>

        <div style="background-color: #FCEAE7; border: 1px solid #D8C2BF; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #201A19;">
            <strong>Date & Time:</strong> ${event.date} • ${event.timeRange}
          </p>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #201A19;">
            <strong>Location:</strong> ${event.locationName}
          </p>
          <p style="margin: 0; font-size: 14px; color: #201A19;">
            <strong>Organizer:</strong> ${event.organizer}
          </p>
        </div>

        <p style="font-size: 13px; line-height: 1.6; color: #534341; margin: 0 0 20px 0;">
          ${event.description}
        </p>

        <hr style="border: none; border-top: 1px solid #D8C2BF; margin: 20px 0;" />
        <p style="font-size: 12px; color: #534341; margin: 0;">
          Thank you for helping keep Iligan City clean, safe, and thriving.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: creds.emailFrom,
      to: recipientEmail,
      subject,
      text: textBody,
      html: htmlBody,
    });

    return {
      sent: true,
      recipientEmail,
      message: `Confirmation email sent to ${recipientEmail}.`,
    };
  } catch (err) {
    const errMsg =
      err instanceof Error ? err.message : "Unable to send confirmation email.";
    return {
      sent: false,
      recipientEmail,
      message: `Registration saved (Email error: ${errMsg})`,
    };
  }
}
