# Gatherly AI — Intelligent Event Planning Assistant

> A premium, fully interactive frontend-only SaaS application for orchestrating weddings, birthdays, anniversaries, corporate summits, and community gatherings.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-5.0-FCC72B?logo=vitest&logoColor=black)](https://vitest.dev/)
[![Deployed on Netlify](https://img.shields.io/badge/Netlify-Ready-00C7B7?logo=netlify&logoColor=white)](https://www.netlify.com/)

---

## 🌟 Executive Overview

**Gatherly AI** turns a simple conversational event description into a comprehensive, structured planning workspace. Built with the aesthetic clarity of Linear, the modular organization of Notion, and Gemini's conversational intelligence, Gatherly AI delivers a production-grade experience running **100% in the client browser with zero backend or database requirements**.

### Natural Language Event Synthesis
Users can describe their event in plain words:
> *"I want to organize a 30th birthday party for 80 guests in Goa with a budget of ₹1,50,000. I want an outdoor sunset vibe, coastal seafood catering, acoustic live band, and fun beachside games."*

Gatherly AI dynamically synthesizes:
- **Intelligent Budget Breakdown** by mathematical industry proportions
- **Timeline & Milestones** anchored to the event date
- **Curated Vendor Quotations** adapted dynamically to the specified city
- **Dietary-Aware Guest Registry** with RSVP tracking and plus-one calculation
- **Hour-by-Hour Event Day Runbook** with staff and vendor assignments
- **Interactive AI Copilot** that proposes actionable plan changes

---

## ✨ Key Features

### 1. Dual-Engine AI Architecture
- **Real Google Gemini API Integration**: Plug in your Gemini API key (via `.env` or in-app Settings) to activate `gemini-3.6-flash`. The model receives real-time event state as injected context and returns actionable JSON-fenced proposals.
- **Offline Deterministic Fallback**: Works 100% offline without any API key or backend. A built-in rules engine processes common event planning intents deterministically.
- **Dynamic Location Extraction**: Never defaults to a predetermined city. Accurately extracts the target location from natural speech or marks as `Location TBD` with actionable assumptions.

### 2. Conversational Copilot with Action Proposals
- Conversational chat powered by Gemini or the local engine.
- Assistant can propose concrete workspace modifications (e.g., reallocating budget, creating critical tasks, trimming expenses).
- **Human-in-the-loop guarantee**: Proposed actions render with live diff previews and require explicit user **Apply** or **Cancel** confirmation before state is mutated.

### 3. Dynamic Budget Allocation & Expense Tracking
- Real-time Indian numbering system formatting (`₹ Lakhs` and `₹ Crores`) and multi-currency support (`USD`, `EUR`, `GBP`).
- Category allocations (Venue, Catering, Decor, Photography, Entertainment, etc.) with deterministic over-allocation math and visual warning alerts.
- Live cost comparison: Budgeted vs. Estimated vs. Actual Paid expenses.

### 4. Interactive Timeline & Task Matrix
- Category and priority filtering (High / Medium / Low).
- Real-time overdue deadline calculation and automated completion percentage tracking.
- Interactive status toggles (`todo`, `in_progress`, `completed`).

### 5. Guests & RSVP Management
- Plus-one headcount calculations and dietary restriction aggregation (Vegan, Vegetarian, Gluten-Free, Halal, Jain).
- Single-click CSV export for external vendor sharing.
- Contextual invitation message generator with customizable tone.

### 6. Event-Day Hour-by-Hour Runbook
- Chronological scheduling with lead assignees and designated vendors.
- Real-time timeline status: upcoming, active, completed, or delayed milestones.

### 7. LocalStorage Persistence & Zero-Data-Leak Privacy
- Full snapshot import/export (JSON backups).
- Seeded with rich, realistic sample events for first-time onboarding.
- Completely client-side — your private event information and API keys never touch any external server.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Core Framework** | React 18, TypeScript 5.7 |
| **Build & Tooling** | Vite 6, PostCSS, Autoprefixer |
| **Styling & UI** | Tailwind CSS 3.4, Lucide Icons, clsx, tailwind-merge |
| **Data Visualization** | Recharts (Responsive Pie, Bar, Area charts) |
| **Delight & Animations** | Canvas Confetti |
| **Routing** | React Router v6 (SPA routing with Netlify 200 redirect) |
| **State & Storage** | React Context API, Browser LocalStorage |
| **AI Integration** | Google Gemini API (`@google/genai` compatible REST payload protocol) |
| **Test Suite** | Vitest 5, JSDOM, React Testing Library |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js **v20+** (recommended) or v18+
- npm / pnpm / yarn

### Installation

```bash
# 1. Clone repository
git clone https://github.com/am-1145/Gatherly.git
cd Gatherly

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional for real Gemini)
cp .env.example .env

# 4. Start local development server
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
# Optional: Google Gemini API Key for real AI copilot and natural language synthesis.
# If omitted, Gatherly operates seamlessly in Offline Deterministic Demo Mode!
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here

# Target Gemini Model (defaults to gemini-3.6-flash)
VITE_GEMINI_MODEL=gemini-3.6-flash
```

> **Note:** The `.env` file is excluded from Git tracking via `.gitignore` to safeguard your keys.

---

## 🧪 Testing Suite

Gatherly AI includes a comprehensive Vitest test suite verifying critical calculation modules, parsers, and services:

```bash
# Run all unit and integration tests
npm test
```

### Verified Test Suites (24 / 24 Passing):
- `naturalLanguageParser.test.ts` — Location extraction, lakh/crore parsing, category distribution math
- `budgetCalculations.test.ts` — Indian rupee notation formatting, currency conversions, over-budget calculations
- `tasksManager.test.ts` — Milestone progress, overdue task filtering, priority classification
- `guestsManager.test.ts` — Headcount tallying, dietary filter matrix, CSV export formatting
- `geminiService.test.ts` — Action proposal parsing, schema validation, fallback mechanisms
- `storage.test.ts` — Snapshot persistence, state restoration, JSON schema validation

---

## 🌐 Deploy to Netlify

Gatherly AI is configured for one-click deployment on Netlify with full SPA route rewriting support.

### Option A: Push to GitHub & Connect Netlify (Recommended)
1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete Gatherly AI"
   git push origin main
   ```
2. Log in to [Netlify](https://app.netlify.com/) → **Add new site** → **Import from Git**.
3. Select your repository. Netlify automatically reads [`netlify.toml`](file:///e:/event%20planner/netlify.toml):
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. In **Site Configuration > Environment Variables**, add:
   - `VITE_GEMINI_API_KEY` = `your_gemini_api_key`
   - `VITE_GEMINI_MODEL` = `gemini-3.6-flash`
5. Click **Deploy Site**!

### Option B: Drag & Drop (Instant)
1. Run local production build:
   ```bash
   npm run build
   ```
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag the created `dist/` folder onto the page.

---

## 📁 Project Structure

```
gatherly-ai/
├── public/                 # Favicon and static assets
├── src/
│   ├── components/
│   │   ├── common/         # Buttons, Cards, Badges, Modals, Inputs
│   │   ├── copilot/        # Chat drawer, bubbles, ActionProposalCards
│   │   ├── layout/         # AppShell, Sidebar, Header, GlobalSearch
│   │   └── wizard/         # Multi-step and Natural Language Event Creator
│   ├── context/            # EventContext (state), SettingsContext
│   ├── pages/              # Overview, Budget, Tasks, Guests, Vendors, Ideas, Runbook, Copilot, Settings
│   ├── services/           # AI Dispatcher, Gemini REST Service, Local Engine
│   ├── tests/              # Vitest test suites
│   ├── types/              # Comprehensive TypeScript domain interfaces
│   ├── utils/              # Parsers, storage helpers, Indian number formatters, demo data
│   ├── App.tsx             # Route configuration
│   └── main.tsx            # Application entrypoint
├── netlify.toml            # Build pipeline & SPA rewrite rules
├── vite.config.ts          # Vite build config, chunk splitting, vitest setup
└── tailwind.config.js      # Custom theme colors and design tokens
```

---

## 🛡️ License

This project is licensed under the **ISC License**. Built with ❤️ for event planners, hosts, and couples everywhere.
