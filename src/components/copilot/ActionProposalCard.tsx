import React, { useState } from 'react';
import { Check, Sparkles, CheckCircle2 } from 'lucide-react';
import { ActionProposal } from '../../types';
import { useEvent } from '../../context/EventContext';
import { Button } from '../common/Button';

interface ActionProposalCardProps {
  proposal: ActionProposal;
}

export const ActionProposalCard: React.FC<ActionProposalCardProps> = ({ proposal }) => {
  const { applyActionProposal } = useEvent();
  const [status, setStatus] = useState<'pending' | 'applied' | 'dismissed'>(
    proposal.status || 'pending'
  );

  const handleApply = () => {
    applyActionProposal(proposal);
    setStatus('applied');
  };

  const handleDismiss = () => {
    setStatus('dismissed');
  };

  if (status === 'dismissed') {
    return (
      <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-ivory-100/60 dark:bg-charcoal-800/40 text-[11px] text-charcoal-400 italic">
        Action proposal was dismissed.
      </div>
    );
  }

  return (
    <div className="mt-3 p-3.5 rounded-xl border border-sage-300 dark:border-sage-800 bg-sage-50/80 dark:bg-sage-950/40 shadow-subtle text-left transition-all">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 text-sage-800 dark:text-sage-200 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-sage-600" />
          <span>Proposed Action</span>
        </div>
        {status === 'applied' && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sage-700 dark:text-sage-300 bg-sage-100 dark:bg-sage-900/60 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Applied
          </span>
        )}
      </div>

      <p className="text-xs font-semibold text-charcoal-900 dark:text-ivory-100 mb-1">
        {proposal.title}
      </p>
      <p className="text-[11px] text-charcoal-600 dark:text-charcoal-400 leading-relaxed mb-3">
        {proposal.description}
      </p>

      {status === 'pending' && (
        <div className="flex items-center gap-2 pt-1 border-t border-sage-200/60 dark:border-sage-900/60">
          <Button
            variant="sage"
            size="sm"
            leftIcon={<Check className="w-3.5 h-3.5" />}
            onClick={handleApply}
          >
            Apply to Workspace
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-charcoal-500 hover:text-charcoal-700"
          >
            Dismiss
          </Button>
        </div>
      )}
    </div>
  );
};

