import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  color?: 'sage' | 'terracotta' | 'amber' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

/**
 * Visual progress bar indicator with clamping, multiple color accents, and optional percentage readout.
 *
 * @param props - Progress bar configuration
 * @param props.value - Numeric progress percentage between 0 and 100
 * @param props.color - Theme color variant ('sage' | 'terracotta' | 'amber' | 'blue')
 * @param props.size - Height bar scale ('sm' | 'md' | 'lg')
 * @param props.showLabel - Whether to display a header showing label and clamped percentage
 * @returns JSX.Element progress bar container
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = 'sage',
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorStyles = {
    sage: 'bg-sage-600 dark:bg-sage-500',
    terracotta: 'bg-terracotta-500 dark:bg-terracotta-400',
    amber: 'bg-amber-500 dark:bg-amber-400',
    blue: 'bg-blue-600 dark:bg-blue-500',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-medium text-charcoal-600 dark:text-charcoal-400 mb-1.5">
          <span>Progress</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-ivory-200 dark:bg-charcoal-800 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`h-full transition-all duration-500 rounded-full ${colorStyles[color]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

