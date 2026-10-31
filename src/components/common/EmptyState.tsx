import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * Placeholder component rendered when lists or datasets are empty, offering an optional recovery action.
 *
 * @param props - Empty state parameters
 * @param props.icon - Illustrative or semantic icon element
 * @param props.title - Concise title heading explaining empty state
 * @param props.description - Supportive description explaining what to do next
 * @param props.actionLabel - Optional button label for initiating item creation
 * @param props.onAction - Optional callback handler invoked when action button is clicked
 * @param props.className - Additional utility classes
 * @returns JSX.Element empty state card
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-ivory-300 dark:border-charcoal-700 rounded-2xl bg-ivory-50/50 dark:bg-charcoal-900/30 ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-ivory-200 dark:bg-charcoal-800 text-charcoal-600 dark:text-charcoal-300 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h4 className="text-sm font-semibold text-charcoal-900 dark:text-ivory-100 mb-1">
        {title}
      </h4>
      <p className="text-xs text-charcoal-500 dark:text-charcoal-400 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

