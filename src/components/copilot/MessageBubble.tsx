import React, { useState } from 'react';
import { Copy, Check, Sparkles, User } from 'lucide-react';
import { ChatMessage } from '../../types';
import { ActionProposalCard } from './ActionProposalCard';

interface MessageBubbleProps {
  message: ChatMessage;
  onSelectFollowUp?: (text: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onSelectFollowUp }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple clean markdown text formatter
  const renderFormattedContent = (content: string) => {
    // Split into paragraphs / lines
    const lines = content.split('\n');

    return lines.map((line, idx) => {
      // Heading 3
      if (line.startsWith('### ')) {
        return (
          <h4
            key={idx}
            className="text-xs font-bold text-charcoal-900 dark:text-ivory-50 mt-3 mb-1 uppercase tracking-wider"
          >
            {line.replace('### ', '')}
          </h4>
        );
      }
      // Heading 2
      if (line.startsWith('## ')) {
        return (
          <h3
            key={idx}
            className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 mt-3 mb-1.5"
          >
            {line.replace('## ', '')}
          </h3>
        );
      }
      // Bullet list item
      if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
        const text = line.substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-xs my-0.5 leading-relaxed">
            {renderInlineMarkdown(text)}
          </li>
        );
      }
      // Numbered list item
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={idx} className="ml-4 list-decimal text-xs my-1 leading-relaxed">
            {renderInlineMarkdown(line.replace(/^\d+\.\s/, ''))}
          </li>
        );
      }
      // Empty line spacer
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      // Normal paragraph
      return (
        <p key={idx} className="text-xs leading-relaxed my-0.5">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  };

  // Helper for bold and italic markdown tags
  const renderInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-charcoal-900 dark:text-ivory-50">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 animate-fade-in">
        <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm bg-charcoal-900 text-ivory-50 dark:bg-charcoal-800 dark:text-ivory-100 px-4 py-2.5 shadow-subtle text-xs leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 mb-5 animate-fade-in group text-left">
      {/* Assistant Avatar */}
      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sage-600 to-sage-500 text-white flex items-center justify-center shrink-0 shadow-subtle mt-0.5">
        <Sparkles className="w-3.5 h-3.5" />
      </div>

      <div className="flex-1 min-w-0 max-w-[90%] sm:max-w-[85%]">
        {/* Assistant Bubble Card */}
        <div className="relative rounded-2xl rounded-tl-sm bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-800 p-4 shadow-subtle text-charcoal-800 dark:text-charcoal-200">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="absolute top-2.5 right-2.5 p-1 rounded-md text-charcoal-400 hover:text-charcoal-700 dark:hover:text-charcoal-200 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Copy response"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-sage-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Formatted Content */}
          <div className="space-y-1">{renderFormattedContent(message.content)}</div>

          {/* Action Proposal Preview Card if present */}
          {message.actionProposal && <ActionProposalCard proposal={message.actionProposal} />}
        </div>

        {/* Suggested Follow-up chips */}
        {message.suggestedFollowUps && message.suggestedFollowUps.length > 0 && onSelectFollowUp && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {message.suggestedFollowUps.map((promptText, i) => (
              <button
                key={i}
                onClick={() => onSelectFollowUp(promptText)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-ivory-100 hover:bg-ivory-200 dark:bg-charcoal-800/80 dark:hover:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-300 border border-ivory-200 dark:border-charcoal-700/60 transition-colors text-left flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-sage-600 shrink-0" />
                <span>{promptText}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
