---
name: gatherly-event-planner
description: >-
  Operational intelligence and multi-step workflows for Gatherly AI event planning,
  budget allocation, dynamic location extraction, vendor comparison, and Gemini-powered analysis.
---

# Gatherly AI Event Planner Skill

This skill teaches agents how to design, analyze, budget, and execute celebrations and gatherings using the Gatherly AI architecture.

---

## 1. Core Principles

1. **Client-Side Autonomy**: Gatherly AI runs 100% in the user's browser. Do not require external database connections or authentication servers.
2. **Deterministic Financial Math**: Financial summaries, variances, and category distributions must always compute deterministically (`Allocated`, `Estimated`, `Actual Paid`, `Remaining Cash`).
3. **No Hardcoded Location Defaults**: If a user does not specify a location, never force a default city (e.g. Bangalore). Instead, mark the location as `"Location TBD"`, log an assumption, and allow the user or AI to supply the location.
4. **Action Proposal Protocol**: When an AI assistant recommends changes, it must package actionable updates into a structured action proposal:
   ```json
   {
     "type": "add_task" | "reallocate_category" | "add_expense" | "save_idea",
     "title": string,
     "description": string,
     "payload": object
   }
   ```
   State updates only take effect when the user explicitly clicks **Apply to Workspace**.

---

## 2. Event Sizing & Budget Benchmark Percentages

When synthesizing an event budget from a total figure, calibrate proportional allocations according to occasion:

### A. Weddings
- **Venue & Heritage Grounds**: 28%
- **Food, Beverages & Banquets**: 32%
- **Florals, Lighting & Mandap/Stage Decor**: 16%
- **Photography & Cinematic Drone**: 12%
- **Music, Traditional Troupe & Entertainment**: 6%
- **Contingency, Favors & Logistics**: 6%

### B. Milestone Birthdays & Anniversaries
- **Food, Street Tapas & Craft Bar**: 40%
- **Venue / Rooftop Space**: 20%
- **Aesthetic Neon & Floral Decor**: 15%
- **DJ, Sound & Interactive Party Games**: 12%
- **Candid Photography**: 8%
- **Cake, Favors & Contingency**: 5%

### C. Corporate Tech Summits & Offsites
- **Conference Hall & Breakout Rooms**: 40%
- **Barista High Tea & Executive Lunch**: 32%
- **Stage LED Walls, Livestream & AV**: 14%
- **Keynotes & Badging/Mementos**: 8%
- **Contingency**: 6%

---

## 3. Gemini AI Analysis Integration

### Environment Key Resolution
Gatherly AI checks for Google Gemini API credentials in the following order:
1. `import.meta.env.VITE_GEMINI_API_KEY` (from `.env` or `.env.local`)
2. `import.meta.env.GEMINI_API_KEY` (mapped via Vite config)
3. LocalStorage key `gatherly_app_settings_v1_gemini_key`
4. Fallback: Offline deterministic local engine

### Structured Output Generation
When calling Gemini (`gemini-1.5-flash`), pass the live event JSON state and instruct the model to:
1. Cite specific financial numbers and guest headcounts in prose.
2. Emit an optional fenced ```action ``` block at the very end.
3. Keep prose formatted with clean Markdown headings and bullet points.

---

## 4. Runbook Chronology Schema

Every event day milestone must contain:
- `time`: Formatted string (e.g. `04:00 PM`)
- `durationMinutes`: Number
- `title`: Action-oriented milestone description
- `responsible`: Specific person or vendor lead
- `location`: Specific zone (e.g. `Main Hall`, `Dining Terrace`, `Foyer`)
- `status`: `'pending' | 'in_progress' | 'completed' | 'flagged'`
- `notes`: Critical technical alerts (sound curfew, power outlets, dietary separation)

---

## 5. Verification Checklist

Before deploying or finalizing event changes:
- [ ] Are budget categories equal to or within total budget?
- [ ] Are dietary totals (Veg, Vegan, Jain, Gluten-free) calculated for caterers?
- [ ] Do urgent tasks have due dates prior to event date?
- [ ] Does the runbook account for load-in before guest arrivals?

