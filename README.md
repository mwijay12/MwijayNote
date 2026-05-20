<div align="center">
  <img src="https://cdn-icons-png.flaticon.com/512/1251/1251671.png" width="120" height="120" alt="Mwijay Note Logo" />
  <h1>Mwijay Note: Prestige OS</h1>
  <p><b>A highly sophisticated, offline-first digital productivity studio & custom hybrid application ecosystem.</b></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-rose.svg)](https://opensource.org/licenses/MIT)
  [![Vite](https://img.shields.io/badge/Vite-v6-blueviolet.svg)](https://vite.dev/)
  [![React](https://img.shields.io/badge/React-v18-blue.svg)](https://react.dev/)
  [![Capacitor](https://img.shields.io/badge/Capacitor-v6-emerald.svg)](https://capacitorjs.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-v5-cyan.svg)](https://www.typescriptlang.org/)
</div>

---

## 📱 Architecture: React (Vite) + Capacitor Bridge
**No, this is not React Native—it is a premium, high-performance Hybrid Web App!**

Mwijay Note compiles HTML5, HSL-tailored CSS styling, and TypeScript logic directly into native Android (`.apk`) and iOS containers via the **Capacitor Bridge**. 
* **Universal Build Output**: The same codebase serves standard web browsers perfectly, while unlocking full access to native mobile hardware APIs (Haptics, secure Filesystem, local push Reminders, and Share interfaces) when installed.

```
                  ┌──────────────────────────────────────────────┐
                  │                 Mwijay Note                  │
                  │             (React + TypeScript)             │
                  └──────┬────────────────────────────────┬──────┘
                         │                                │
                         ▼ (Web Browser)                  ▼ (Capacitor Bridge)
                  ┌──────────────┐                 ┌──────────────┐
                  │ Chrome/Safari│                 │ Android/iOS  │
                  │  Environments│                 │ Mobile Shell │
                  └──────────────┘                 └──────┬───────┘
                                                          │
                                       ┌──────────────────┴──────────────────┐
                                       ▼                                     ▼
                                ┌──────────────┐                      ┌──────────────┐
                                │Native Haptics│                      │Local Reminders│
                                └──────────────┘                      └──────────────┘
```

---

## 🌟 Premium Core Features

### 🧠 1. AI Coach & Intelligent Routing Pool
The application contains a robust system-wide multi-provider AI network configured with self-healing rotation:
* **The Key Chain**: Google Gemini 3 Flash → Groq → Cerebras → OpenRouter. If any API key encounters rate limiting or quota exhaustion, it immediately rotates to the next pool participant in under 100ms.
* **EC2 n8n Master Fallback Webhook**: If all local browser API keys fail or are exhausted, the app triggers an active backup call to the configured cloud active `n8n` webhook (`/webhook/mwijay-master` or `/webhook/mwijay-ai-memory`).
* **Safe Base64 Serialization**: Inputs for network and chart canvas diagrams are processed using custom URL-decoders to completely bypass traditional Unicode `btoa` window object exceptions.

### 🌍 2. High-Fidelity Startup Lab & Offline Database
Startup Labs (Business Model Canvas, SWOT Analysis, Startup Validator, Pitch Deck, and Opportunity Scout) works flawlessly in both online and 100% offline modes:
* **Online Mode**: Calls deep prompt chains using structured JSON schema configurations.
* **Offline Mock Database**: If disconnected or keys fail, a customized offline generator intercepts requests. It dynamically processes input keywords and outputs highly detailed, localized templates customized to **Tanzanian and East African tech ecosystems** (referencing Dar es Salaam, Morogoro, Arusha, Buni Hub, Sahara Ventures, M-Pesa, cellular network limits, and Kiswahili training tracks) so the interface remains loaded and beautiful.

### ⏱️ 3. Pomodoro Focus Timer
An interactive study suite custom-designed with zero external layout overhead:
* **SVG Countdown Ring**: A beautiful circular ring that tracks seconds, shifting color gradients between Rose (Focus) and Emerald (Break).
* **Configurable Study Presets**:
  * **Classic Pomodoro**: 25m Focus / 5m Short Break
  * **Heavy Session**: 50m heavy study / 10m Break
  * **Sprint Booster**: 15m Sprint / 3m Lightning Break
* **Offline Streaks Counter**: Saves completed study rounds to Capacitor secure Preferences storage.
* **Synthesized Melodic Alarm**: Replaces standard, execution-blocking browser `alert()` popups with a customized arpeggio in the key of F# Major using the Web Audio API Synthesizer and triggers haptic vibrations.

### 📬 4. Connect Hub & Mobile Speed Speedway
Polished dashboard that links productivity to communications:
* **WhatsApp Direct Dial**: Enter a mobile number and message to compile waivers directly without saving the contact.
* **Gmail Workspace Draft Compiler**: Type recipients, subjects, and complete drafts to compile and launch native web or mobile email clients.
* **Google Chat Webhook Payloads**: Interactive compiler that formats and lets you copy cardsV2 payloads to post directly to your Slack/Google Chat webhook configurations.
* **Tanzanian Tech & Emergency Speed Dials**: Speed Speedway featuring single-click triggers for Police (`112`), Fire (`115`), Cyber Security Emergency (`190`), Buni Hub COSTECH Incubator, and Sahara Ventures Sandbox.

### 🎵 5. Ambient Music Hub & Equalizer
A complete, integrated entertainment deck:
* **Persistent Playback**: Music continues playing uninterrupted as you browse through different sections of the application.
* **Lock Screen Control (MediaSession)**: Synchronizes track titles, cover images, play, pause, next, and skip commands with the system's lock screen.
* **5-Band Equalizer**: Custom audio node graph allows adjusting frequencies (60Hz, 230Hz, 910Hz, 4kHz, 14kHz) along with presets (Pop, Rock, Bass Booster).
* **Vibrant Visualizers**: HTML5 canvas elements animate rendering frequency waves in real time.

### 💻 6. sandboxes & Sandboxed Training Street
* **Koding Street**: Complete learning courses with sandboxed HTML/CSS/JS script runner execution.
* **SQLite Playground**: Run simulated queries and render results in clean, formatted schemas.
* **Terminal Mode**: Fully featured local command-line interface supporting command histories, help modules, and quick system shortcuts.

---

## 🛠 Tech Stack

* **Core Framework**: React 18 with TypeScript
* **Routing & State**: Context-based routing with local IndexedDB persistent stores (`idb` wrapper) and Firebase sync hooks.
* **Styling**: Tailwind CSS (Sakura Light / Obsidian Pink Cyberdark options).
* **Mobile Shell**: @capacitor/core & @capacitor/cli.
* **AI Core**: `@google/genai` with custom failover routing.
* **Exports**: PDF/Word downloads generated via client-side libraries.

---

## 🚀 Dev Setup & Local Runs

### 📋 Prerequisites
Install [Node.js](https://nodejs.org/) (v18 or higher recommended).

### 1. Install Project Dependencies
```bash
npm install
```

### 2. Launch Local Dev Server
```bash
npm run dev
```
*(This starts a local development server with instant Hot Module Replacement (HMR) at http://localhost:5173).*

### 3. Run Static Type Checking
```bash
npx tsc --noEmit
```

### 4. Build Production Web Bundle
```bash
npm run build
```
*(Vite optimizes, code-splits, and compiles the bundle into the `public` directory).*

### 5. Build & Sync Capacitor Mobile Containers
```bash
npx cap sync android
```
*(This pushes the latest compiled web assets directly into the Android source structures).*

### 6. Launch in Android Studio
```bash
npx cap open android
```
*(Loads the project inside Android Studio where you can debug, run on a physical device, or generate a signed release APK).*

---

## 🔮 Future Growth Roadmap & AI-Prompt Blueprints
To help you expand and evolve **Mwijay Note** into a world-class system, we have structured your core roadmap (Phase 1, 2, and 3) directly into ready-to-run **AI Prompt Blueprints**. Copy and paste these prompts directly into Gemini/Antigravity whenever you want to trigger these integrations:

### 📋 Phase 1: Critical Polishes (Backbone & Experience)

#### 1. Smooth Page Transitions & Micro-Animations
> **AI Prompt Blueprint:**
> ```text
> "I'm building a React + Capacitor app called Mwijay Note. I need you to create 
> a comprehensive animation system using Framer Motion. Include:
> 1. Page transition animations (slide-in from right for forward navigation, slide-in from left for back navigation)
> 2. Staggered list animations for journal entries and flashcards
> 3. A smooth bottom sheet component that slides up with spring physics
> 4. Micro-interactions: button press scale (0.95), card hover lift with shadow, toggle switches with elastic bounce
> 5. A skeleton loading screen component that pulses like iOS/Android native apps
> 6. Pull-to-refresh animation with a custom spinner
> Use CSS variables for timing so themes can control animation speed.
> Make all animations respect 'prefers-reduced-motion' for accessibility.
> Export everything from a single 'animations.ts' utility file."
> ```

#### 2. Offline Sync Engine (IndexedDB + Firestore)
> **AI Prompt Blueprint:**
> ```text
> "Build me a robust offline-first sync engine for a React app using IndexedDB 
> and Firebase Firestore. Requirements:
> 1. Use the 'idb' library for IndexedDB operations
> 2. Every data mutation (create, update, delete) should:
>    - Save to IndexedDB immediately
>    - Add to a 'pendingSync' queue in IndexedDB
> 3. Create a SyncManager class that:
>    - Listens to navigator.onLine events
>    - When online, processes the pendingSync queue in FIFO order
>    - Uses Firestore batch writes for efficiency
>    - Handles conflict resolution with 'last-write-wins' using timestamps
>    - Shows a toast notification: 'Syncing 5 changes...' then 'All synced ✓'
> 4. Create a React hook 'useSync()' that returns:
>    - syncStatus: 'synced' | 'pending' | 'syncing' | 'offline'
>    - pendingCount: number
>    - forceSyncNow: () => Promise<void>
> 5. Add a small sync indicator dot in the header (green=synced, yellow=pending, gray=offline)
> Use TypeScript with proper generics for different data types (journals, flashcards, finances)."
> ```

#### 3. PWA + Service Worker Cache Optimization
> **AI Prompt Blueprint:**
> ```text
> "Create a production-ready service worker (sw.js) for a Vite + React app. 
> Requirements:
> 1. Cache Strategy:
>    - App shell (HTML, CSS, JS): Cache-First
>    - API calls to Firebase: Network-First with cache fallback
>    - Google Fonts: Stale-While-Revalidate
>    - Images from Cloudinary: Cache-First with 30-day expiry
> 2. Background sync for failed API requests
> 3. Show an 'Update Available' toast when a new version is detected, with a 'Refresh' button that calls skipWaiting()
> 4. Cache size management: auto-delete old caches when storage exceeds 50MB
> 5. Include a manifest.json with:
>    - App name: 'Mwijay Note'
>    - Theme color that matches current theme (read from meta tag)
>    - Shortcuts for: 'New Journal', 'Quick Capture', 'Flashcards'
>    - Screenshots for install prompt
> Make it work seamlessly with Vite's build output."
> ```

---

### 📋 Phase 2: Actionable Feature Enhancements

#### 4. AI Daily Brief Morning Dashboard
> **AI Prompt Blueprint:**
> ```text
> "Create a 'Daily Brief' dashboard component for my journaling app. 
> It should appear as the home screen every morning. Using the Gemini API (@google/genai), build:
> 1. A React component 'DailyBrief.tsx' that fetches context from IndexedDB:
>    - Last 3 journal entries (mood + content summary)
>    - Today's pending habits
>    - Financial snapshot (spending this week vs budget)
>    - Upcoming flashcard reviews due today
> 2. Send this context to Gemini with this system prompt:
>    'You are a personal life coach embedded in a digital journal app. Based on the user context provided, generate a brief morning message (max 150 words) that is warm, motivating, and actionable. Mention specific things from their data. End with one clear action item for today.'
> 3. Cache the AI response in IndexedDB with today's date as key (don't re-fetch if already generated today)
> 4. Fallback: If offline or API fails, show a random motivational quote from a local array of 50 quotes
> 5. UI: Card with gradient background matching current theme, typing animation for the AI text, and a 'Refresh Insight' button. Use full TypeScript types."
> ```

#### 5. Smart Rich-Text Journal Editor
> **AI Prompt Blueprint:**
> ```text
> "Build an advanced journal editor component for React with these features:
> 1. Rich text editing using Tiptap: Bold, italic, underline, strike, Headings (H1/H2/H3), bullet lists, quotes, inline code, Cloudinary image upload.
> 2. Mood selector: A horizontal scrollable row of 7 mood emojis (😢😕😐🙂😊😄🤩) that saves with the entry.
> 3. Auto-save: Debounced save to IndexedDB every 2 seconds while typing. Show a subtle 'Saved' indicator.
> 4. AI Features (via Gemini):
>    - 'Beautify' button: Reformats the text with better structure.
>    - 'Generate Title' button: Creates a poetic title from content.
>    - 'Writing Prompt': Suggest a prompt based on time of day and mood history if the entry is empty.
> 5. Word count, estimated read time, and #gratitude #work style tags.
> 6. Export: Share as formatted text, PDF (jsPDF), or image (html2canvas). Toolbar sticks to bottom on mobile."
> ```

#### 6. Flashcard Engine with SM-2 Spaced Repetition
> **AI Prompt Blueprint:**
> ```text
> "Implement a full spaced repetition flashcard system in React + TypeScript. Use the SM-2 algorithm. Requirements:
> 1. Data Model (stored in IndexedDB): id, deckId, front (markdown), back, easeFactor (starts at 2.5), interval (days), repetitions, nextReviewDate, tags.
> 2. Study Session: Show due cards (nextReviewDate <= today), flip animation (3D CSS transform), rating options (Again, Hard, Good, Easy), and streak accuracy summary.
> 3. Deck Management: Create/edit/delete decks, import from CSV, and AI Generate Deck (10 cards on [topic]) via Gemini.
> 4. Statistics Dashboard: GitHub-style contributions calendar heat map, card due forecast, and Capacitor LocalNotifications scheduler."
> ```

#### 7. Finance Tracker & Visual Budgets
> **AI Prompt Blueprint:**
> ```text
> "Build a personal finance tracker module for my React app. Features:
> 1. Transaction Entry: Amount, category, date, note, emoji categories, and monthly recurrence.
> 2. Budget System: Category limits, spent progress bar, warning colors, and budget threshold warnings.
> 3. Dashboard: Expense donut charts (Recharts), 30-day line graphs, top spending categories, and Gemini automated budget advisory insights."
> ```

---

### 📋 Phase 3: Premium Polishes & Onboarding

#### 8. Zustand Multi-Theme Engine Extension
> **AI Prompt Blueprint:**
> ```text
> "Enhance my React app's theme engine. Current setup uses CSS variables with Tailwind CSS v4. I need:
> 1. Theme Store (Zustand): currentTheme, dayTheme, nightTheme, autoSwitch, font, fontSize (persist to IndexedDB).
> 2. 16 Theme definitions (Dark: Midnight, Obsidian, Deep Space, Emerald Night, Crimson Dark, Ocean Abyss, Purple Haze, Charcoal / Light: High Noon, Sakura, Polar, Desert Sand, Mint Fresh, Lavender Dream, Arctic Blue, Warm Paper).
> 3. Auto-switch logic (6PM-6AM night, else day), 300ms transitions, Capacitor StatusBar sync, and a Custom Color Picker theme creator."
> ```

#### 9. Native-Feeling Mobile Gesture Navigation
> **AI Prompt Blueprint:**
> ```text
> "Add native-feeling gesture navigation to my React + Capacitor app:
> 1. Swipe-back gesture: Swipe from left edge to go back (like iOS) with page peeking and 40% threshold.
> 2. Pull-to-refresh: Custom scroll trigger animation with Capacitor Haptics feedback.
> 3. Swipe list items: Swipe left to delete (red bg + trash), swipe right to archive.
> 4. Long-press menus: 300ms hold, haptic vibration, card blur peek, and context popups. Use vanilla touch events."
> ```

#### 10. Swipe Onboarding & Empty States
> **AI Prompt Blueprint:**
> ```text
> "Create a polished onboarding flow and empty state components for my app:
> 1. First Launch Onboarding: 4 swipable screens (Welcome, Feature Highlights, AI Coach Peek, Theme Setup) with dot indices, skip options, and start flags.
> 2. Animated empty states with inline SVGs for Journals, Flashcards, Budgets, and Offline warnings. Use Framer Motion and Tailwind."
> ```

---

### 📊 Priority & Impact Strategy

| Priority | Feature Task | Focus Level | Core Impact |
|:---|:---|:---|:---|
| 🔴 **P0** | **Offline Sync Engine** | Infrastructure | Immediate data persistence & cloud sync |
| 🔴 **P0** | **Service Worker Cache** | Reliability | True offline boot speed & instant loads |
| 🟡 **P1** | **Smart Rich Journal** | Primary Feature | Word processor & beautiful notes |
| 🟡 **P1** | **Theme Store (Zustand)**| UI/UX | High premium customization |
| 🟡 **P1** | **Framer Page Slides** | Aesthetics | iOS/Android native flow transitions |
| 🟢 **P2** | **Flashcards SM-2 Engine**| Study Hub | Spaced repetition academic tool |
| 🟢 **P2** | **Budget Tracker** | Life Tracker | Transaction logs & chart visualizers |
| 🟢 **P2** | **AI Daily Brief** | Coach Hub | Morning AI diagnostic reports |
| 🔵 **P3** | **Swipe Gestures & Menu** | Native Feel | Swipe-back, peeks, and long-press haptics |

---

### ⚡ Quick-Win Helper Blueprints

#### Zustand Toast System
> ```text
> "Create a toast notification system for React using Zustand. Support success (green), error (red), warning (yellow), info (blue). Slide-in from top, stack up to 3 toasts, auto-dismiss, and Tailwind CSS."
> ```

#### Capacitor Haptics Utility
> ```text
> "Create a haptic.ts utility for Capacitor that provides lightTap(), mediumTap(), heavyTap(), successPattern(), and errorPattern(), with graceful no-op fallback on standard web contexts."
> ```

---

<div align="center">
  <i>"Your digital brain, crafted with elegance."</i>
</div>
