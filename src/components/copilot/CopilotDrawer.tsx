import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { CopilotChat } from './CopilotChat';

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-lg h-full bg-white dark:bg-charcoal-900 shadow-elevated border-l border-ivory-200 dark:border-charcoal-800 z-10 flex flex-col animate-slide-up">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-ivory-200 dark:border-charcoal-800 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sage-600" />
            <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50">
              Gatherly Copilot Assistant
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 dark:hover:text-charcoal-200 hover:bg-ivory-100 dark:hover:bg-charcoal-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Embedded Chat */}
        <div className="flex-1 overflow-hidden p-2 sm:p-3">
          <CopilotChat compact />
        </div>
      </div>
    </div>
  );
};

