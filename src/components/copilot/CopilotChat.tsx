import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Send,
  Sparkles,
  RotateCcw,
  Plus,
  Trash2,
  Bot,
  Info,
  Loader2,
} from 'lucide-react';
import { ChatMessage, ChatSession } from '../../types';
import { useEvent } from '../../context/EventContext';
import { useSettings } from '../../context/SettingsContext';
import { dispatchCopilotMessage } from '../../services/ai/aiDispatcher';
import { getActiveGeminiApiKey, getActiveGeminiModel } from '../../services/ai/geminiService';
import { MessageBubble } from './MessageBubble';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';

interface CopilotChatProps {
  compact?: boolean;
}

export const CopilotChat: React.FC<CopilotChatProps> = ({ compact = false }) => {
  const { activeEvent } = useEvent();
  const { aiMode, geminiApiKey } = useSettings();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Storage key for local conversation sessions
  const storageKey = `gatherly_chat_sessions_${activeEvent?.id || 'default'}`;

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return [
      {
        id: `sess-${Date.now()}`,
        eventId: activeEvent?.id || '',
        title: 'Event Strategy & Budgeting',
        messages: [
          {
            id: 'm-welcome',
            role: 'assistant',
            content: `Hello! I am **Gatherly AI**, your intelligent co-planner for **${activeEvent?.title || 'your event'}**.

I'm loaded with your live event numbers (${formatCurrency(
              activeEvent?.budget.total || 0,
              activeEvent?.budget.currency
            )} budget, ${activeEvent?.guestCount || 0} guests, and ${
              activeEvent?.tasks.length || 0
            } tasks). 

Ask me anything about trimming vendor costs, timeline checklists, or adjusting headcounts. I can also propose actionable updates directly to your workspace!`,
            timestamp: new Date().toISOString(),
            suggestedFollowUps: [
              'How can I reduce my event costs?',
              'What should I complete this week?',
              'Compare my vendor quotations',
              'What happens if I increase my guest count?',
            ],
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(
    () => sessions[0]?.id || ''
  );

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save chat sessions:', e);
    }
  }, [sessions, storageKey]);

  // Current session
  const currentSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = useMemo(() => currentSession?.messages || [], [currentSession]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText || isLoading || !activeEvent) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: new Date().toISOString(),
    };

    // Append user message immediately
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSession.id
          ? {
              ...s,
              messages: [...s.messages, userMsg],
              title: s.messages.length === 1 ? promptText.slice(0, 28) + '...' : s.title,
              updatedAt: new Date().toISOString(),
            }
          : s
      )
    );

    setInput('');
    setIsLoading(true);

    try {
      const response = await dispatchCopilotMessage({
        prompt: promptText,
        event: activeEvent,
        mode: aiMode,
        geminiApiKey,
        chatHistory: currentSession.messages,
      });

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        actionProposal: response.actionProposal,
        suggestedFollowUps: response.suggestedFollowUps,
        intentTag: response.intentTag,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSession.id
            ? {
                ...s,
                messages: [...s.messages, assistantMsg],
                updatedAt: new Date().toISOString(),
              }
            : s
        )
      );
    } catch {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: 'I encountered an unexpected issue formulating a response. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSession.id
            ? { ...s, messages: [...s.messages, errorMsg] }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewChat = () => {
    const newSession: ChatSession = {
      id: `sess-${Date.now()}`,
      eventId: activeEvent?.id || '',
      title: 'New Conversation',
      messages: [
        {
          id: `m-init-${Date.now()}`,
          role: 'assistant',
          content: `New session started for **${activeEvent?.title}**. How can I help you optimize your planning today?`,
          timestamp: new Date().toISOString(),
          suggestedFollowUps: [
            'How can I reduce my event costs?',
            'What should I complete this week?',
            'Suggest a unique birthday theme',
          ],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleClearCurrentChat = () => {
    if (confirm('Clear messages in this conversation?')) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSession.id
            ? {
                ...s,
                messages: [
                  {
                    id: `m-reset-${Date.now()}`,
                    role: 'assistant',
                    content: 'Chat history cleared. What would you like to plan next?',
                    timestamp: new Date().toISOString(),
                    suggestedFollowUps: [
                      'How can I reduce my event costs?',
                      'What should I complete this week?',
                    ],
                  },
                ],
              }
            : s
        )
      );
    }
  };

  const suggestedPills = [
    'How can I reduce my event costs?',
    'What should I complete this week?',
    'What happens if I increase my guest count?',
    'Compare my vendor quotations',
    'Create a seven-day preparation checklist',
    'Suggest a unique birthday theme',
  ];

  return (
    <div className="flex h-full w-full bg-white dark:bg-charcoal-900 rounded-2xl border border-ivory-200 dark:border-charcoal-800 shadow-card overflow-hidden">
      {/* Left Chat History Panel (Desktop full view only) */}
      {!compact && (
        <div className="hidden lg:flex flex-col w-64 border-r border-ivory-200 dark:border-charcoal-800 bg-ivory-50/60 dark:bg-charcoal-950/40 p-3 shrink-0">
          <div className="flex items-center justify-between pb-3 border-b border-ivory-200 dark:border-charcoal-800 mb-2">
            <span className="text-xs font-bold text-charcoal-700 dark:text-ivory-200 uppercase tracking-wider">
              Conversations
            </span>
            <button
              onClick={handleCreateNewChat}
              className="p-1 rounded-md text-charcoal-500 hover:text-charcoal-900 dark:hover:text-white hover:bg-ivory-200 dark:hover:bg-charcoal-800 transition-colors"
              title="New chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">
            {sessions.map((sess) => (
              <button
                key={sess.id}
                onClick={() => setActiveSessionId(sess.id)}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-center justify-between group ${
                  sess.id === currentSession.id
                    ? 'bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-ivory-50 shadow-subtle font-semibold border border-ivory-200 dark:border-charcoal-700'
                    : 'text-charcoal-600 dark:text-charcoal-400 hover:bg-ivory-100 dark:hover:bg-charcoal-850'
                }`}
              >
                <span className="truncate pr-1">{sess.title}</span>
                {sessions.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSessions((prev) => prev.filter((s) => s.id !== sess.id));
                      if (activeSessionId === sess.id) {
                        setActiveSessionId(sessions[0]?.id || '');
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-charcoal-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-ivory-200 dark:border-charcoal-800">
            <div className="p-2 rounded-lg bg-ivory-100 dark:bg-charcoal-800/80 text-[10px] text-charcoal-500 dark:text-charcoal-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sage-600 shrink-0" />
              <span>
                Engine:{' '}
                <strong>
                  {getActiveGeminiApiKey()
                    ? `Google Gemini (${getActiveGeminiModel()})`
                    : 'Local Deterministic'}
                </strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Chat Header */}
        <div className="h-14 px-4 sm:px-6 border-b border-ivory-200 dark:border-charcoal-800 flex items-center justify-between shrink-0 bg-white/70 dark:bg-charcoal-900/70 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-sage-100 dark:bg-sage-900/60 text-sage-700 dark:text-sage-300 flex items-center justify-center font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-charcoal-900 dark:text-ivory-50 flex items-center gap-1.5">
                <span>Gatherly Copilot</span>
                <Badge variant={getActiveGeminiApiKey() ? 'sage' : 'neutral'} size="sm">
                  {getActiveGeminiApiKey() ? 'Gemini 1.5 Active' : 'Offline Demo'}
                </Badge>
              </p>
              <p className="text-[10px] text-charcoal-400 truncate">
                Context: {activeEvent?.title} ({activeEvent?.city})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearCurrentChat}
              className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 dark:hover:text-charcoal-200 hover:bg-ivory-100 dark:hover:bg-charcoal-800 transition-colors"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onSelectFollowUp={(txt) => handleSendMessage(txt)}
            />
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-charcoal-400 italic py-2 animate-pulse">
              <div className="w-6 h-6 rounded-lg bg-sage-50 dark:bg-sage-950 text-sage-600 flex items-center justify-center">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
              <span>Gatherly AI is auditing your event data...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts (visible when few messages) */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2">
            <span className="text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider block mb-1.5">
              Suggested questions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestedPills.map((promptText, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(promptText)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-ivory-100 hover:bg-ivory-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-300 border border-ivory-200 dark:border-charcoal-700 transition-colors text-left"
                >
                  {promptText}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Composer Area */}
        <div className="p-3 sm:p-4 border-t border-ivory-200 dark:border-charcoal-800 bg-ivory-50/40 dark:bg-charcoal-900/40 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative flex items-center rounded-xl border border-ivory-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 shadow-subtle focus-within:ring-2 focus-within:ring-sage-500/20 focus-within:border-sage-500 transition-all"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything or command an action (e.g. 'Add a photo backup task', 'How to save ₹5000?')"
              className="w-full text-xs sm:text-sm bg-transparent px-4 py-3 text-charcoal-900 dark:text-ivory-50 placeholder-charcoal-400 focus:outline-none"
              disabled={isLoading}
            />

            <div className="pr-2 flex items-center">
              <Button
                type="submit"
                variant="sage"
                size="sm"
                disabled={!input.trim() || isLoading}
                isLoading={isLoading}
                className="rounded-lg !px-3 !py-1.5"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </form>

          <p className="text-[10px] text-charcoal-400 text-center mt-2 flex items-center justify-center gap-1">
            <Info className="w-3 h-3 text-charcoal-400" />
            <span>
              Action proposals update your frontend workspace state only after your explicit confirmation.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

