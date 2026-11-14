import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ecovibe — Community Issue Reporting & Volunteer Events",
  description:
    "Report neighborhood issues like uncollected trash, potholes, and damaged facilities in Iligan City, track updates on the community map, and join local volunteer clean-up drives.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try { document.querySelector('meta[name="color-scheme"]').content = localStorage.getItem("color-scheme") ?? "light dark"; } catch (e) {}`,
          }}
        />
      </head>
      <body className="min-h-dvh bg-m3-background text-m3-on-background antialiased selection:bg-m3-primary selection:text-m3-on-primary">
        {children}
      </body>
    </html>
  );
}
