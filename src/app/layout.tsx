import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EcoVibe | Community Issue Reporting & Volunteer Event Platform",
  description:
    "Report localized infrastructure issues like uncollected trash, road hazards, and broken facilities with Gemini AI auto-classification, live Google Maps pinning, Google Sheets dispatch logging, and Gemma local-dialect volunteer chat.",
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: "#5101be",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        {/* MANDATORY per dark-mode guidance: Declare supported schemes early to prevent FOUC */}
        <meta name="color-scheme" content="dark light" />
      </head>
      <body className="min-h-dvh bg-[#12002b] text-[#f5eeff] antialiased selection:bg-[#A8002D] selection:text-white">
        {children}
      </body>
    </html>
  );
}
