# Gatherly AI — Intelligent Event Planning Assistant

> A premium, fully interactive frontend-only SaaS application for orchestrating weddings, birthdays, anniversaries, corporate summits, and community gatherings.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

---

## 🌟 Executive Overview

**Gatherly AI** turns a simple conversational event description into a structured, executable planning workspace. Inspired by the clarity of Linear, the modular organization of Notion, and Gemini's conversational AI paradigms, Gatherly AI delivers a production-grade user experience running **100% in the client browser with zero backend or database dependencies**.

### Example Natural-Language Input:
> *"I want to organize a birthday party for 80 people in Bangalore with a budget of ₹40,000. I want a classy theme, good food, music, and some fun activities."*

The application parses the prompt, derives budget allocations across categories, schedules high-priority timeline milestones, lists sample vendor quotations, generates dietary-aware guest registries, and creates a chronological day-of runbook.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Core Framework** | React 18, TypeScript (Strict Mode), Vite 6 |
| **Styling & Design System** | Tailwind CSS (Warm Ivory, Charcoal, Sage-Green, Terracotta palette) |
| **Icons** | Lucide React |
| **Data Visualizations** | Recharts (Responsive Pie & Bar Charts) |
| **Routing** | React Router v6 |
| **State & Persistence** | React Context + LocalStorage with automated schema validation |
| **AI Intelligence** | Dual Provider Abstraction: Deterministic Contextual Local Engine (Offline) + Configurable Google Gemini 1.5 Client |
| **Celebrations** | Canvas Confetti |

---

## ✨ Key Features & Application Modules

### 1. Landing & Onboarding
- **Hero Prompt Composer**: Paste plain-English event ideas to trigger instant natural-language parsing.
- **Sample Presets**: One-click preview buttons for a Bangalore 80-pax Rooftop Birthday (₹40,000), a Jaipur Royal Palace Wedding (₹18 Lakh), and a Tech Leadership Summit (₹3.5 Lakh).
- **Direct App Entry**: Instant access without requiring account creation or server authentication.

### 2. Multi-Step & Natural-Language Creation Wizard
- **Step 1: Occasion**: Wedding, Birthday, Anniversary, Corporate, Community, or Custom.
- **Step 2: Event Details**: Name, Date, City, Venue Booking Status, Expected Guests.
- **Step 3: Budget**: Total budget ceiling, currency selection (₹ INR, $ USD, € EUR, £ GBP), and calculated per-head averages.
- **Step 4: Preferences**: Theme, Aesthetic Style, Food & Beverage needs, Entertainment.
- **Step 5: Review & Assumptions**: Transparent audit of assumptions made by the parser, with full inline editing before generating the workspace.

### 3. Event Overview Dashboard
- **Countdown Banner**: Live days-to-go calculations with milestone labels.
- **Metric Cards**: Total Budget, Actual Paid Out, Guest Headcount (including plus-ones), Task Completion Rate, and Vendor Booking status.
- **AI Recommendations**: Prioritized action items assessing vendor lead times and budget buffers.
- **Category Spending Preview**: Quick visual breakdown of allocated funds.

### 4. Gemini-Style AI Copilot
- **Live State Awareness**: Reads current budget numbers, actual pending tasks, guest headcount, days remaining, and vendor quotes.
- **Interactive Action Proposals**: The assistant can propose actions (e.g. *Reduce Catering Allocation*, *Add Emergency Kit Task*, *Save Theme Idea*). Every proposal features an interactive preview card with **Apply** and **Dismiss** buttons that mutate the frontend state only upon user confirmation.
- **Conversation Sessions**: Supports creating multiple chat sessions, resetting messages, and copying answers.
- **Dual Engine**: High-speed, deterministic offline mode by default, with an optional configurable Google Gemini 1.5 Flash endpoint in Settings.

### 5. Interactive Budget Planner
- **Deterministic Math**: Dynamic updates to remaining balances, allocations, and expenditures.
- **Visual Analytics**: Interactive Recharts Pie Chart (proportional category distribution) and Bar Chart (Allocated vs Paid Out).
- **Over-allocation Alerts**: Immediate warning banners detailing exact variances when category ceilings exceed the total budget.
- **Itemized Tracking**: Add/edit/delete expense records with a single click to toggle settled/paid status.

### 6. Timeline & Task Manager
- **Dual Views**: Seamless toggle between a categorized **List View** and an agile **Kanban Stage Board** (To Do, In Progress, Completed).
- **Filters & Search**: Filter by Category (*Planning, Bookings, Invitations, Preparations, Event Day, Follow-up*), Priority (*Urgent, High, Medium, Low*), or Status.
- **Overdue Detection**: Automatically flags tasks past their due date relative to today's date.

### 7. Guests & RSVPs Workspace
- **Attendance Accounting**: Tracks confirmed, tentative, declined, and pending RSVPs, calculating exact headcounts including plus-ones.
- **Dietary Breakdown**: Automatically tallies Vegetarian, Vegan, Jain, Gluten-Free, and Standard meal requirements for the caterer.
- **Digital Invitation Generator**: Generates formatted WhatsApp/digital messages with simulated RSVP confirmation links and a one-click copy button.
- **CSV Export**: Direct in-browser export of guest registries with all contact info, household groups, and table notes.

### 8. Vendor Management & Quotation Matrix
- **Benchmark Sample Data**: Pre-populated with realistic local vendor profiles (venues, caterers, photographers, decors) labeled as sample data.
- **Quotation Comparison Matrix**: Side-by-side modal comparing Price, Included Services, Exclusions, and Payment Milestones across multiple vendors.
- **Custom Vendor Entry**: Record custom vendors and toggle booking confirmations.

### 9. Ideas & Inspiration Gallery
- **Categorized Galleries**: Themes, Decorations, Food & Menus, Entertainment, Return Gifts, and Sustainable Celebrations.
- **Direct Workspace Integration**: Convert any curated idea into an actionable **Timeline Task** or add its estimated cost directly into your **Budget Expenses**.

### 10. Event-Day Runbook
- **Chronological Master Schedule**: Minute-by-minute execution timeline from morning vendor load-in to evening sendoff.
- **Issue Flagging**: Coordinators can flag delays or missing items with high-visibility red badges.
- **Live Execution Mode**: Mobile-optimized touch interface designed for coordinators running on-site.

### 11. Settings & Data Management
- **Theming**: Instant toggle between Warm Ivory Day Theme and Charcoal Midnight Dark Theme.
- **Currency & Date Standards**: Configure formatting across INR (lakhs format), USD, EUR, or GBP.
- **Backup & Restore**: Export complete workspace state as JSON or import backup files.
- **Demo Reset**: One-click restoration of pristine starter events.

---

## 🔒 Frontend Architecture & Security Limitations

1. **Browser-Local Persistence**: All event state, conversation histories, and settings are preserved in browser `LocalStorage`. Clearing browser cache will erase local workspaces. Use the **Export JSON** feature in Settings to backup critical plans.
2. **AI Provider Note**: In demo mode, Gatherly AI operates deterministically without sending any data over the network. If an optional Google Gemini API key is configured, calls are made directly from the client browser. In production multi-tenant environments, API keys should be proxied through an authenticated server to protect secrets.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher; tested on v22.19.0)
- npm (v9.0.0 or higher)

### 1. Installation
Clone or navigate to the project directory and install dependencies:
```bash
npm install
```

### 2. Run Development Server
Start Vite's fast local development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 3. Build for Production
To typecheck and bundle minified production assets into the `dist/` folder:
```bash
npm run build
```

### 4. Preview Production Build
To preview the optimized production build locally:
```bash
npm run preview
```

---

## 📁 Project Structure

```
event-planner/
├── index.html                   # HTML entry point with Plus Jakarta Sans & Newsreader fonts
├── package.json                 # Project dependencies & build scripts
├── postcss.config.js            # PostCSS configuration for Tailwind
├── tailwind.config.js           # Custom design tokens (Ivory, Charcoal, Sage, Terracotta)
├── tsconfig.json                # TypeScript strict configuration & path aliases
├── vite.config.ts               # Vite configuration with chunk splitting
├── src/
│   ├── App.tsx                  # React Router configuration
│   ├── main.tsx                 # Root React entry point
│   ├── index.css                # Tailwind directives & glass/scrollbar utilities
│   ├── types/                   # TypeScript interfaces (Event, Task, Budget, Vendor, Guest, AI)
│   ├── utils/
│   │   ├── formatters.ts        # Currency (₹/$/€/£), date, and countdown formatters
│   │   ├── demoData.ts          # Rich realistic starter events (Bangalore Birthday, Jaipur Wedding)
│   │   ├── naturalLanguageParser.ts # Rule-based event intent & entity extractor
│   │   └── storage.ts           # LocalStorage wrapper, backup import/export
│   ├── services/
│   │   └── ai/
│   │       ├── localEngine.ts   # Deterministic contextual AI response engine
│   │       └── aiDispatcher.ts  # Dual AI router (Local engine + Gemini API client)
│   ├── context/
│   │   ├── EventContext.tsx     # Active event state, mutators, and derived metrics
│   │   └── SettingsContext.tsx  # Theme, currency, date format, and AI configuration
│   ├── components/
│   │   ├── common/              # Button, Card, Badge, Input, Modal, ProgressBar, EmptyState
│   │   ├── layout/              # AppShell, Sidebar, Header, Notifications, GlobalSearch
│   │   ├── wizard/              # Multi-step & Natural-Language Event Creation Wizard
│   │   └── copilot/             # CopilotChat, MessageBubble, ActionProposalCard, CopilotDrawer
│   └── pages/
│       ├── LandingPage.tsx      # Public landing page with prompt hero & feature showcase
│       ├── OverviewPage.tsx     # Event dashboard overview with countdown & AI priorities
│       ├── EventsPage.tsx       # Event portfolio, duplicate, switch, and delete
│       ├── CopilotPage.tsx      # Dedicated full-screen AI Copilot interface
│       ├── BudgetPage.tsx       # Interactive budget planner & expense tracking
│       ├── TasksPage.tsx        # Timeline & task manager (List & Kanban board)
│       ├── GuestsPage.tsx       # Guest list, RSVP tracker, and invitation generator
│       ├── VendorsPage.tsx      # Vendor quotations & side-by-side comparison matrix
│       ├── IdeasPage.tsx        # Aesthetic idea library with task/budget conversion
│       ├── RunbookPage.tsx      # Chronological event-day schedule & live execution mode
│       └── SettingsPage.tsx     # Themes, currency settings, JSON backups, and demo reset
```

---

## 📄 License
This project is open-source and available under the [ISC License](LICENSE).
