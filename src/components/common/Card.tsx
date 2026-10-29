import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'flat' | 'elevated' | 'glass';
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  padding = 'md',
  ...props
}) => {
  const baseStyles = 'rounded-xl transition-all duration-150';

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  };

  const variantStyles = {
    default:
      'bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-800 shadow-card text-charcoal-900 dark:text-charcoal-100',
    flat: 'bg-ivory-50 dark:bg-charcoal-900/60 border border-ivory-200 dark:border-charcoal-800 text-charcoal-900 dark:text-charcoal-100',
    elevated:
      'bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-800 shadow-elevated text-charcoal-900 dark:text-charcoal-100',
    glass:
      'glass-panel border border-white/40 dark:border-charcoal-700/40 shadow-elevated text-charcoal-900 dark:text-charcoal-100',
  };

  return (
    <div
      className={`${baseStyles} ${paddingStyles[padding]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

