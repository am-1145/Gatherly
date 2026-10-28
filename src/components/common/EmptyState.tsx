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
