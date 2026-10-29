import React from 'react';
import { Sparkles } from 'lucide-react';
import { CopilotChat } from '../components/copilot/CopilotChat';
import { Badge } from '../components/common/Badge';
import { useEvent } from '../context/EventContext';

export const CopilotPage: React.FC = () => {
  const { activeEvent } = useEvent();

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col space-y-4 animate-fade-in pb-2">
      {/* Page Title Mini-bar */}
      <div className="flex items-center justify-between shrink-0 px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sage-600 to-sage-500 text-white flex items-center justify-center shadow-subtle">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-charcoal-900 dark:text-ivory-50 tracking-tight">
              Gatherly AI Copilot
            </h1>
            <p className="text-[11px] text-charcoal-500">
              Conversational planning intelligence connected to {activeEvent?.title}
            </p>
          </div>
        </div>

        <Badge variant="sage" size="md">
          Live State Synchronized
        </Badge>
      </div>

      {/* Main Full-Size Copilot Chat */}
      <div className="flex-1 min-h-0">
        <CopilotChat compact={false} />
      </div>
    </div>
  );
};

