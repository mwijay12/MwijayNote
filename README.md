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

<div align="center">
  <i>"Your digital brain, crafted with elegance."</i>
</div>
