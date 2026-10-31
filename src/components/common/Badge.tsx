import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'sage' | 'terracotta' | 'amber' | 'blue' | 'red' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

/**
 * Status indicator and tag badge with multiple color themes and optional status dot.
 *
 * @param props - Badge properties
 * @param props.children - Label or content inside the badge
 * @param props.variant - Color scheme ('neutral', 'sage', 'terracotta', 'amber', 'blue', 'red', 'purple')
 * @param props.size - Dimension padding style ('sm' | 'md')
 * @param props.className - Additional utility classes
 * @param props.dot - Whether to display an inline colored status indicator dot
 * @returns JSX.Element span element representing the styled badge
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
  dot = false,
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  const variantStyles = {
    neutral:
      'bg-charcoal-100 dark:bg-charcoal-800 text-charcoal-700 dark:text-charcoal-300 border border-charcoal-200 dark:border-charcoal-700',
    sage:
      'bg-sage-50 dark:bg-sage-950/50 text-sage-700 dark:text-sage-300 border border-sage-200 dark:border-sage-800',
    terracotta:
      'bg-terracotta-50 dark:bg-terracotta-950/50 text-terracotta-700 dark:text-terracotta-300 border border-terracotta-200 dark:border-terracotta-800',
    amber:
      'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    blue:
      'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    red:
      'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800',
    purple:
      'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
  };

  const dotColors = {
    neutral: 'bg-charcoal-400',
    sage: 'bg-sage-500',
    terracotta: 'bg-terracotta-500',
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};

