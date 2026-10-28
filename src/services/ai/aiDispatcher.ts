import { EventModel, ActionProposal, ChatMessage } from '../../types';
import { processLocalCopilotPrompt, LocalEngineResult } from './localEngine';

export interface DispatchAIParams {
  prompt: string;
  event: EventModel;
  mode: 'local_demo' | 'gemini_api';
  geminiApiKey?: string;
  chatHistory: ChatMessage[];
}

export async function dispatchCopilotMessage(
  params: DispatchAIParams
): Promise<LocalEngineResult> {
  const { prompt, event, mode, geminiApiKey, chatHistory } = params;

  // If user configured Gemini API and provided a valid key, try contacting Gemini
  if (mode === 'gemini_api' && geminiApiKey && geminiApiKey.trim().length > 10) {
    try {
      const response = await callGeminiAPI(prompt, event, geminiApiKey.trim(), chatHistory);
      if (response) {
        return response;
      }
    } catch (err) {
      console.warn('Gemini API call failed or timed out. Falling back to local engine.', err);
    }
  }

  // Realistic conversational pacing in demo mode
  await new Promise((resolve) => setTimeout(resolve, 650));

  // Default to intelligent local engine
  return processLocalCopilotPrompt(prompt, event);
}

async function callGeminiAPI(
  prompt: string,
  event: EventModel,
  apiKey: string,
  history: ChatMessage[]
): Promise<LocalEngineResult | null> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const systemContext = `You are Gatherly AI, an elite event planning assistant. 
The current event is:
- Title: "${event.title}"
- Occasion: ${event.occasion}
- Date: ${event.date}
- City: ${event.city}
- Budget: ${event.budget.currency} ${event.budget.total}
- Guest Count: ${event.guestCount}
- Tasks pending: ${event.tasks.filter((t) => t.status !== 'completed').length}
- Completed tasks: ${event.tasks.filter((t) => t.status === 'completed').length}
- Theme: ${event.preferences.theme || 'Classy'}

Provide thoughtful, concrete advice. Do not hallucinate external backend dependencies. Format with clear Markdown headings and bullet points.`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: systemContext }],
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

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
  });

  if (!res.ok) {
    throw new Error(`Gemini API returned status ${res.status}`);
  }

  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) return null;

  return {
    content: rawText,
    suggestedFollowUps: [
      'What should I prioritize this week?',
      'How can I optimize my food & beverage budget?',
      'Suggest a creative guest activity',
    ],
    intentTag: 'gemini_response',
  };
}
