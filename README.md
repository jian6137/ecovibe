# EcoVibe — Community Issue Reporting & Volunteer Event Platform

EcoVibe is a responsive Next.js, React, TypeScript, and Tailwind CSS web application designed for citizen-driven infrastructure reporting and neighborhood volunteer mobilization.

## Material Design 3 (M3) Tonal System & Light / Dark Mode

- **Primary Seed (`#CB0021`)**: Strict Material 3 tonal hierarchy (`--md-sys-color-primary`, `--md-sys-color-primary-container`, `--md-sys-color-secondary-container`, `--md-sys-color-tertiary-container`, `--md-sys-color-surface-container-lowest` through `highest`, `--md-sys-color-outline`, and `--md-sys-color-outline-variant`).
- **Light / Dark / System Mode**:
  - Uses native CSS `color-scheme: light dark` and `light-dark()` tokens in `src/app/globals.css`, synced with `<meta name="color-scheme">` via `:root:has(> head > meta[name="color-scheme"]...)`.
  - Includes a zero-FOUC inline script in `src/app/layout.tsx` and an interactive **Light / Dark / Auto (System)** M3 segmented switcher in `src/components/ecovibe/theme-toggle.tsx` powered by `src/hooks/use-color-scheme.ts`.

## Core Interfaces

1. **Landing Page (`src/components/ecovibe/hero-section.tsx`)**:
   - Explains EcoVibe's mission (reporting uncollected trash, road hazards, clogged storm drains, and broken facilities).
   - Primary CTAs: **"Report an Issue"** and **"Community Chat"**.
2. **Issue Reporting Flow (`src/components/ecovibe/issue-reporting-flow.tsx`)**:
   - Supports local photo uploads plus 4 one-click field presets.
   - Simulates **Gemini Vision AI** image scanning (`/api/gemini/analyze`) and auto-populates the **Category** dropdown (`Waste`, `Road Hazard`, `Broken Facility`, `Flooding & Drainage`, `Streetlight Outage`, `Illegal Dumping`), urgency level, and description.
   - Includes a **Capture Geolocation** button (`useGeolocation`) and dispatches reports to Firebase Storage and Google Sheets.
3. **Map Dashboard (`src/components/ecovibe/map-dashboard.tsx`)**:
   - Adaptive Light/Dark Material 3 Google Maps Platform placeholder canvas with custom interactive pins, AI severity heatmap toggle, category filters, and a live pin telemetry inspector.
4. **Chatbot Interface (`src/components/ecovibe/chatbot-widget.tsx`)**:
   - Floating **Gemma AI** community chat window (`/api/gemma/chat`) supporting local dialects (**Bisaya / Cebuano**, **Tagalog**, and **English**) with Material 3 `#CB0021` primary and surface container chat bubbles and in-chat event RSVP cards.
