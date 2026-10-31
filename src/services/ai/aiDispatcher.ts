import { EventModel, ChatMessage } from '../../types';
import { processLocalCopilotPrompt, LocalEngineResult } from './localEngine';
import { queryGeminiCopilot, getActiveGeminiApiKey } from './geminiService';

export interface DispatchAIParams {
  prompt: string;
  event: EventModel;
  mode?: 'local_demo' | 'gemini_api';
  geminiApiKey?: string;
  chatHistory: ChatMessage[];
}

export async function dispatchCopilotMessage(
  params: DispatchAIParams
): Promise<LocalEngineResult> {
  const { prompt, event, chatHistory } = params;

  // Check for API key from params, from .env, or from localStorage
  const effectiveKey = (params.geminiApiKey || getActiveGeminiApiKey() || '').trim();

  // If a key is present (e.g. from .env VITE_GEMINI_API_KEY or user settings), use REAL Gemini API!
  if (effectiveKey && effectiveKey.length > 5) {
    try {
      const geminiResult = await queryGeminiCopilot(prompt, event, effectiveKey, chatHistory);
      if (geminiResult && geminiResult.content) {
        return geminiResult;
      }
    } catch (err) {
      console.warn('Real Gemini API call encountered an error. Falling back to local engine.', err);
    }
  }

  // Realistic natural response cadence for local demo engine
  await new Promise((resolve) => setTimeout(resolve, 550));

  // Fallback to intelligent deterministic local engine
  return processLocalCopilotPrompt(prompt, event);
}
