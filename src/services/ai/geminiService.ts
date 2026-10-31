import { EventModel, ActionProposal, ChatMessage } from '../../types';
import { formatDate } from '../../utils/formatters';

export interface GeminiAnalysisResult {
  content: string;
  actionProposal?: ActionProposal;
  suggestedFollowUps: string[];
  intentTag: string;
}

/**
 * Retrieves the currently active Gemini API key from environment variables or browser LocalStorage.
 *
 * @returns Trimmed API key string if present, or empty string if not configured.
 */
export function getActiveGeminiApiKey(): string {
  try {
    const envKey = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_GEMINI_API_KEY || '';
    if (envKey && envKey.trim().length > 5) {
      return envKey.trim();
    }
    const localKey = localStorage.getItem('gatherly_app_settings_v1_gemini_key') || '';
    return localKey.trim();
  } catch {
    return '';
  }
}

/**
 * Retrieves the preferred Gemini model name configured for AI completions.
 *
 * @returns Configured model identifier string (e.g. "gemini-1.5-flash").
 */
export function getActiveGeminiModel(): string {
  try {
    const envModel = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_GEMINI_MODEL || '';
    return envModel || 'gemini-3.6-flash';
  } catch {
    return 'gemini-3.6-flash';
  }
}

/**
 * Sends conversational prompt and live workspace state to Google Gemini API.
 * Formulates strategic guidance and parses embedded action proposals into structured mutations.
 *
 * @param prompt - Natural language question, command, or request from user.
 * @param event - The current live EventModel state for real-time contextual awareness.
 * @param apiKey - Valid Google Gemini API authentication key.
 * @param history - Array of recent chat messages for conversational continuity.
 * @returns Object containing assistant textual content, optional ActionProposal, follow-up prompts, and intent tag.
 */
export async function queryGeminiCopilot(
  prompt: string,
  event: EventModel,
  apiKey: string,
  history: ChatMessage[] = []
): Promise<GeminiAnalysisResult> {
  const model = getActiveGeminiModel();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const currency = event.budget.currency;
  const totalBudget = event.budget.total;
  const allocated = event.budget.categories.reduce((s, c) => s + (c.allocatedAmount || 0), 0);
  const paid = event.budget.expenses.reduce(
    (s, e) => s + (e.isPaid ? e.actualAmount || e.estimatedAmount : 0),
    0
  );

  const pendingTasks = event.tasks.filter((t) => t.status !== 'completed');
  const urgentTasks = pendingTasks.filter((t) => t.priority === 'urgent' || t.priority === 'high');

  const systemInstructions = `You are Gatherly AI, an elite event planner and financial strategist.
You are currently co-planning an event with the user.
Here is the LIVE FRONTEND EVENT STATE:
- Event Title: "${event.title}"
- Occasion: ${event.occasion}
- Date: ${event.date} (${formatDate(event.date)})
- Location / City: ${event.city}
- Venue: ${event.venueName || event.venueStatus}
- Expected Guest Count: ${event.guestCount} (${event.guests.filter((g) => g.status === 'confirmed').length} confirmed)
- Budget: Total ${currency} ${totalBudget.toLocaleString()}, Allocated ${currency} ${allocated.toLocaleString()}, Paid ${currency} ${paid.toLocaleString()}, Remaining ${currency} ${(totalBudget - paid).toLocaleString()}
- Categories: ${event.budget.categories.map((c) => `${c.name}: ${currency} ${c.allocatedAmount}`).join(', ')}
- Pending Tasks (${pendingTasks.length}, ${urgentTasks.length} urgent): ${pendingTasks.slice(0, 5).map((t) => `"${t.title}" (Due: ${t.dueDate})`).join(', ')}
- Vendors: ${event.vendors.map((v) => `${v.name} (${v.category}, Quoted: ${currency} ${v.quotation.price}, Status: ${v.status})`).join('; ')}
- Theme/Style: ${event.preferences.theme || 'None'}
- Food Preferences: ${event.preferences.foodPreferences || 'None'}

GUIDELINES FOR YOUR RESPONSE:
1. Provide intelligent, highly personalized, and concrete advice based on the actual numbers and location above.
2. If the user asks about reducing costs, analyze the actual categories and propose specific percentage cuts or trade-offs.
3. If appropriate to take an action, propose a single concrete frontend action at the very end of your response inside a fenced \`\`\`action JSON block.
Supported action types:
- "add_task" with payload { "title": string, "category": string, "priority": "urgent"|"high"|"medium"|"low", "dueDate": "YYYY-MM-DD", "assignee": string, "notes": string }
- "reallocate_category" with payload { "categoryKey": string, "amount": number }
- "add_expense" with payload { "categoryKey": string, "name": string, "estimatedAmount": number, "actualAmount": number, "isPaid": boolean, "notes": string }
- "save_idea" with payload { "title": string, "category": string, "description": string, "estimatedCost": number, "tags": string[] }

Example action block format:
\`\`\`action
{
  "type": "add_task",
  "title": "Lock audio-visual vendor contract",
  "description": "Adds urgent task due 10 days before event to prevent equipment surcharges.",
  "payload": {
    "title": "Finalize AV & Sound console contract",
    "category": "Bookings",
    "priority": "urgent",
    "dueDate": "${event.date}",
    "assignee": "Host",
    "notes": "Verify wireless mics and outdoor sound curfew."
  }
}
\`\`\`
Only output the action block if a tangible modification to the event workspace makes sense.`;

  // Build Gemini contents payload
  const contents = [
    {
      role: 'user',
      parts: [{ text: systemInstructions }],
    },
    ...history.slice(-4).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ];

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API returned status ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  if (!rawText) {
    throw new Error('Gemini returned an empty candidate response.');
  }

  // Parse out the ```action ... ``` block if present
  let cleanContent = rawText;
  let actionProposal: ActionProposal | undefined = undefined;

  const actionMatch = rawText.match(/```action\s*([\s\S]*?)\s*```/);
  if (actionMatch) {
    try {
      const parsedAction = JSON.parse(actionMatch[1]);
      if (parsedAction && parsedAction.type && parsedAction.title) {
        actionProposal = {
          id: `prop-gemini-${Date.now()}`,
          type: parsedAction.type,
          title: parsedAction.title,
          description: parsedAction.description || 'Action proposed by Gemini AI',
          status: 'pending',
          payload: parsedAction.payload || {},
        };
        // Clean out the action code block from the user-facing text
        cleanContent = rawText.replace(/```action[\s\S]*?```/, '').trim();
      }
    } catch (e) {
      console.warn('Failed to parse Gemini action block as JSON:', e);
    }
  }

  return {
    content: cleanContent,
    actionProposal,
    suggestedFollowUps: [
      'What should I prioritize next?',
      'How can I optimize my food & beverage budget?',
      'Suggest a unique interactive activity',
    ],
    intentTag: 'gemini_real_ai',
  };
}

/**
 * Generates an end-to-end structured event plan directly from raw vision text using Google Gemini JSON mode.
 *
 * @param prompt - Natural language description of celebration vision, budget, and guest requirements.
 * @param apiKey - Valid Google Gemini API authentication key.
 * @returns Fully formed EventModel matching the workspace schema, or null if generation fails.
 */
export async function generateEventWithGemini(
  prompt: string,
  apiKey: string
): Promise<EventModel | null> {
  const model = getActiveGeminiModel();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const jsonPrompt = `You are Gatherly AI. The user gave this event planning vision:
"${prompt}"

Analyze and extract all parameters. Generate a complete, realistic event plan JSON adhering strictly to this schema:
{
  "title": string,
  "occasion": "wedding" | "birthday" | "anniversary" | "corporate" | "community" | "custom",
  "city": string (extract the exact city/location if specified, otherwise return "Location TBD"),
  "date": string (ISO YYYY-MM-DD, assume 45 days from now if not specified),
  "guestCount": number,
  "budget": {
    "total": number,
    "currency": "INR" | "USD" | "EUR" | "GBP",
    "categories": [
      { "key": "Venue", "name": "Venue & Spaces", "allocatedAmount": number },
      { "key": "Catering", "name": "Food & Beverages", "allocatedAmount": number },
      { "key": "Decoration", "name": "Decor & Lighting", "allocatedAmount": number },
      { "key": "Photography", "name": "Photo & Video", "allocatedAmount": number },
      { "key": "Entertainment", "name": "Music & Activities", "allocatedAmount": number },
      { "key": "Miscellaneous", "name": "Contingency & Gifts", "allocatedAmount": number }
    ],
    "expenses": [
      {
        "id": "exp-1",
        "categoryKey": "Venue",
        "name": string,
        "estimatedAmount": number,
        "actualAmount": 0,
        "isPaid": false
      }
    ]
  },
  "preferences": {
    "theme": string,
    "style": string,
    "foodPreferences": string,
    "entertainment": string,
    "specialRequirements": string
  },
  "tasks": [
    {
      "id": "task-1",
      "title": string,
      "category": "Planning" | "Bookings" | "Invitations" | "Preparations" | "Event Day",
      "priority": "urgent" | "high" | "medium" | "low",
      "status": "pending",
      "dueDate": "YYYY-MM-DD",
      "assignee": string,
      "notes": string
    }
  ],
  "vendors": [
    {
      "id": "ven-1",
      "name": string,
      "category": string,
      "status": "shortlisted",
      "contactName": string,
      "phone": string,
      "email": string,
      "rating": number,
      "quotation": {
        "price": number,
        "includedServices": [string],
        "exclusions": [string],
        "paymentTerms": string
      }
    }
  ],
  "ideas": [
    {
      "id": "idea-1",
      "title": string,
      "category": "theme" | "decor" | "food" | "entertainment" | "sustainable",
      "description": string,
      "estimatedCost": number,
      "tags": [string],
      "isFavorite": true
    }
  ],
  "runbook": [
    {
      "id": "rb-1",
      "time": "04:00 PM",
      "durationMinutes": 60,
      "title": string,
      "responsible": string,
      "location": string,
      "status": "pending"
    }
  ],
  "recommendations": [
    {
      "id": "rec-1",
      "title": string,
      "description": string,
      "impact": "high" | "medium",
      "category": "budget" | "vendor" | "timeline"
    }
  ]
}

DO NOT wrap with extra conversational text. Return ONLY the valid JSON object.`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: jsonPrompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      }),
    });

    if (!res.ok) {
      console.warn('Gemini generateEvent failed, status:', res.status);
      return null;
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const parsed = JSON.parse(text);
    return {
      ...parsed,
      id: `event-${Date.now()}`,
      venueStatus: 'searching',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      guests: parsed.guests || [
        {
          id: 'g-1',
          name: 'Primary Guest / Family Head',
          group: 'Family',
          status: 'confirmed',
          diet: 'Standard',
          plusOnes: 1,
        },
      ],
    };
  } catch (err) {
    console.error('Gemini generateEvent error:', err);
    return null;
  }
}

