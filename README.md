# Cahoot! - Real-Time Multiplayer Quiz Platform

A high-performance, production-ready Kahoot clone web application built with **Next.js (App Router)**, **React**, **TypeScript**, **Tailwind CSS**, and **Supabase (Realtime Broadcast + PostgreSQL)**, engineered for a **100% Free-Tier architecture** supporting up to 150 concurrent players.

---

## 🌟 Key Features

- **⚡ 150-Player Realtime Architecture**:
  - Ephemeral live game state sync via Supabase Realtime Channels (Broadcast & Presence).
  - Zero disk I/O / DB write bottlenecks during active gameplay.
  - Asynchronous batch persistence to PostgreSQL when a game concludes.
- **🛡️ Anti-Cheat Scoring Engine**:
  - Millisecond-precision server-anchored question timer preventing client clock tampering.
  - Formula: $\text{Score} = \lfloor 1000 \times (1 - (\text{response\_time} / \text{time\_limit}) / 2) \rfloor \times \text{multiplier} + \text{streakBonus}$.
- **📱 Fully Responsive Mobile Experience**:
  - Tactile 4-button player controls (🔺 Red Triangle, 🔷 Blue Diamond, 🟡 Yellow Circle, 🟩 Green Square).
  - PIN entry with numeric keypad and active room validation.
- **🖥️ Host Big-Screen Controller**:
  - 6-digit numeric PIN with integrated QR Code modal for instant mobile joining.
  - Live response counter, countdown timers, response distribution charts, top-5 leaderboards, and 3D stepped podiums with confetti.
- **🎨 Interactive Quiz Creator**:
  - Add, edit, duplicate, and delete questions with customizable time limits (10s–60s) and points multipliers.
  - Image URL support with instant preview.
- **🎵 Zero-Dependency Web Audio Synthesizer**:
  - Synthesized countdown ticks, tension pulses, click feedback, correct/incorrect sound effects, and victory fanfares via Web Audio API.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Setup Database (Supabase)
Run the SQL schema located in `lib/supabase/schema.sql` in your Supabase SQL Editor.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 📦 Deployment (Vercel + Supabase)

1. Push this repository to GitHub.
2. Import project into [Vercel](https://vercel.com).
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel Environment Variables.
4. Click **Deploy**.
