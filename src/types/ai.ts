import { TaskItem, ExpenseItem, IdeaItem, RunbookItem, BudgetCategory } from './event';

export type ActionProposalType =
  | 'add_task'
  | 'update_budget'
  | 'add_expense'
  | 'save_idea'
  | 'add_runbook_item'
  | 'reallocate_category';

export interface ActionProposal {
  id: string;
  type: ActionProposalType;
  title: string;
  description: string;
  status: 'pending' | 'applied' | 'dismissed';
  payload: any;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  actionProposal?: ActionProposal;
  suggestedFollowUps?: string[];
  intentTag?: string;
}

export interface ChatSession {
  id: string;
  eventId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export type AIProviderMode = 'local_demo' | 'gemini_api';

export interface AISettings {
  mode: AIProviderMode;
  geminiApiKey: string;
  model: string;
  temperature: number;
}

