# EcoVibe — Community Issue Reporting & Volunteer Event Platform

EcoVibe is a responsive Next.js, React, TypeScript, and Tailwind CSS web application designed for citizen-driven infrastructure reporting and neighborhood volunteer mobilization.

## Visual & Design System (Material 3 Dark Theme)

- **Deep Purple Surfaces (`#5101be`)**: Primary surface containers, elevated Material 3 cards, map cartography, and Gemma AI assistant chat bubbles.
- **Bold Red Accents (`#A8002D` & `#AB1E2C`)**: Primary call-to-action buttons, active filter pills, high/critical map pins, laser scan overlays, and user chat bubbles.
- **Accessible Motion & Forms**: Built with Framer Motion (`useReducedMotion()` aware), Shadcn UI primitives, deferred `:user-invalid` validation, and IME-safe chat input handling.

## Core Interfaces

1. **Landing Page (`src/components/ecovibe/hero-section.tsx`)**:
   - Explains EcoVibe's mission (reporting uncollected trash, road hazards, clogged storm drains, and broken facilities).
   - Primary CTAs: **"Report an Issue"** and **"Community Chat"**.
2. **Issue Reporting Flow (`src/components/ecovibe/issue-reporting-flow.tsx`)**:
   - Supports local photo uploads plus 4 one-click field presets.
   - Simulates **Gemini Vision AI** image scanning (`/api/gemini/analyze`) and auto-populates the **Category** dropdown (`Waste`, `Road Hazard`, `Broken Facility`, `Flooding & Drainage`, `Streetlight Outage`, `Illegal Dumping`), urgency level, and description.
   - Includes a **Capture Geolocation** button (`useGeolocation`) and dispatches reports to Firebase Storage and Google Sheets.
3. **Map Dashboard (`src/components/ecovibe/map-dashboard.tsx`)**:
   - Dark-mode styled Google Maps Platform placeholder canvas (`ecovibe_dark_m3`) with custom interactive pins, AI severity heatmap toggle, category filters, and a live pin telemetry inspector.
4. **Chatbot Interface (`src/components/ecovibe/chatbot-widget.tsx`)**:
   - Floating **Gemma AI** community chat window (`/api/gemma/chat`) supporting local dialects (**Bisaya / Cebuano**, **Tagalog**, and **English**) with deep purple (`#5101be`) and bold red (`#A8002D` / `#AB1E2C`) chat bubbles and in-chat event RSVP cards.

## Wiring Production Services

Copy `.env.example` to `.env.local` and supply your credentials:

- **Firebase Authentication**: `src/lib/firebase/auth.ts` & `src/hooks/use-auth.ts`
- **Firebase Cloud Storage**: `src/lib/firebase/storage.ts` & `src/hooks/use-storage.ts`
- **Google Workspace / Sheets API**: `src/app/api/issues/sheets/route.ts` & `src/hooks/use-sheets-sync.ts`
- **Gemini Vision & Gemma Chat**: `src/app/api/gemini/analyze/route.ts` & `src/app/api/gemma/chat/route.ts`
