<div align="center">
  <img src="https://cdn-icons-png.flaticon.com/512/1251/1251671.png" width="120" height="120" alt="Mwijay Note Logo" />
  <h1>Mwijay Note: Premium Academic Productivity Studio</h1>
  <p><b>A highly sophisticated, offline-first digital study suite, interactive music player, and startup incubator tailored for college and university students.</b></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-rose.svg)](https://opensource.org/licenses/MIT)
  [![Vite](https://img.shields.io/badge/Vite-v6-blueviolet.svg)](https://vite.dev/)
  [![React](https://img.shields.io/badge/React-v18-blue.svg)](https://react.dev/)
  [![Capacitor](https://img.shields.io/badge/Capacitor-v6-emerald.svg)](https://capacitorjs.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-v5-cyan.svg)](https://www.typescriptlang.org/)
</div>

---

## 📱 Architecture Overview

**Mwijay Note** is a high-performance Hybrid Web & Native Mobile App built with React (Vite), TypeScript, and Capacitor. It is designed to serve college and university students perfectly in both offline campus environments and high-speed web browsers.

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

* **Offline-First Storage**: Powered by a robust local IndexedDB schema (`mwijay_note_db`) to store all study journals, flashcards, budget sheets, and reminders directly on the user's device with zero internet requirements.
* **Capacitor Hardware Bridge**: Unlocks hardware-level integrations when compiled into a native Android APK (including native tactile haptic feedback, background media controls, local push notifications, and native sharing).

---

## 🎓 Ultimate Academic & Campus Core Features

### ⏱️ 1. Pomodoro Focus Timer & Task Mission Control
Boost study productivity and eliminate distractions during exam weeks:
* **Interactive SVG Countdown Ring**: Tracks study seconds in real time, shifting visual colors between active Focus (Rose) and resting Break (Emerald) modes.
* **Focus Presets**:
  * **Classic Pomodoro**: 25m Focus / 5m Break (standard study block).
  * **Heavy Session**: 50m heavy focus / 10m Break (for demanding assignments).
  * **Sprint Booster**: 15m Sprint / 3m Break (for quick reviews).
* **Synthesized Melodic Alarm**: Emits a beautiful arpeggio chord arpeggio in the key of F# Major using the Web Audio API Synthesizer (avoiding intrusive standard browser popups) and triggers a haptic vibration pattern upon completion.
* **Streaks Tracker**: Persists completed rounds to local storage to monitor academic streaks.

### 🎵 2. Studio Sound Engine & Ambient Music Hub
A premium, integrated audio player designed to enhance studying and relaxation:
* **Auto-Scan Device Audio (APK Exclusive)**: Automatically queries native device storage directories (Documents, Downloads, Music) to import and list all local `.mp3` files instantly.
* **Deterministic Cover Art Gradients**: Automatically generates a beautiful, vibrant custom color gradient background for scanned tracks based on a string hash of their title.
* **Advanced Audio Control Panel**:
  * **5-Band Equalizer**: Tweak frequencies (60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz) with optimized presets (Pop, Rock, Bass Booster, Classical).
  * **Sleep Timer**: Schedule audio playback to automatically pause after 15, 30, 45, or 60 minutes.
  * **Playback Speed Selector**: Adjust speed from 0.5x up to 2.0x (perfect for listening to recorded university lectures fast!).
  * **Visualizer Toggle**: Switch the responsive frequency wave visualizer on/off to preserve battery life.
* **System Media Session Integration**: Controls playback directly from the lock screen or system notification panel.

### 💡 3. Deep Offline Wisdom & Motivation Hub
Never feel stuck on campus when the internet drops. The app packs a comprehensive offline resource database:
* **University Study Hacks**: Academic-focused power strategies (Feynman Technique, Hand-writing recall benefits, Mind Palace memory tricks, and essay review tips).
* **Stoicism & Academic Motivation Quotes**: 260+ offline quotes spanning success, coding, stoic philosophy, and focus to inspire continuous studying.
* **Psychology Facts & Science Tips**: Engaging facts about memory retention, brain chemistry, habit formation, and sleep to understand study habits.
* **Tanzanian Life Hacks**: Local advice ranging from bargaining in Kariakoo, saving internet bundle data, to power cut backups (TANESCO).

### 🧠 4. AI Coach & Intelligent Routing Pool
A smart AI companion to guide university careers, business ideas, and coding:
* **Quota-Resilient Rotation**: Built-in multi-key keychain (Google Gemini → Groq → Cerebras → OpenRouter) with self-healing failover.
* **n8n Cloud Fallback**: Automatically fallbacks to a master webhook (`/webhook/mwijay-master`) for WELCOME pipelines and advanced AI processing.
* **BTOA Exceptions Protection**: Inputs for charts and terminal execution bypass traditional Unicode window encoding restrictions, providing a seamless crash-free experience.

### 📬 5. Connect Hub & Mobile Speed Speedway
Links productivity directly to critical campus and tech channels:
* **WhatsApp Waiver Compiler**: Triggers pre-formatted chat dialogues to mobile cellular numbers without adding them as local contacts.
* **Gmail Workspace Drafts**: Quickly outlines subjects and email drafts to import directly into the mobile mail app.
* **Tanzanian Tech & Emergency Speed Dials**: Tap-to-call hotlines for TCRA Cyber Alert (`190`), Police (`112`), Fire (`115`), Buni Hub COSTECH, and Sahara Ventures accelerator hubs.

---

## 🛠 Developer Stack & Setup Guide

### 📂 Directory Architecture
```text
mwijay-note/
├── android/               # Native Android Capacitor Gradle project
├── components/            # React UI Screens (Pomodoro, Music Hub, Connect Hub)
├── data/                  # Offline Knowledge Base (Quotes, Hacks, Methali)
├── hooks/                 # React State Hooks (Global Audio, Spaced Repetition)
├── public/                # Static Web Assets & Manifest Files
├── utils/                 # Utility files (Haptics, DB triggers)
├── App.tsx                # Core Navigation and Layout Wrapper
└── package.json           # Application dependencies and script definitions
```

### 📋 Prerequisites
Install [Node.js](https://nodejs.org/) (v18 or higher recommended).

### 🚀 Getting Started

1. **Install Project Dependencies**:
   ```bash
   npm install
   ```

2. **Launch Local Dev Server**:
   ```bash
   npm run dev
   ```
   *Starts a local development server with instant Hot Module Replacement (HMR) at http://localhost:5173.*

3. **Run Static Type Checking**:
   ```bash
   npx tsc --noEmit
   ```

4. **Build Production Web Bundle**:
   ```bash
   npm run build
   ```
   *Vite compiles and optimizes the bundle into the `public` directory.*

5. **Sync Capacitor Mobile Container**:
   ```bash
   npx cap sync android
   ```
   *Pushes the latest compiled web assets directly into the Android source structure.*

6. **Launch in Android Studio**:
   ```bash
   npx cap open android
   ```
   *Loads the native source code in Android Studio to build, run on an emulator, or export a signed release APK.*

---

<div align="center">
  <i>"Your digital brain, crafted with elegance."</i>
</div>
