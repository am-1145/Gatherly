import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'sage';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-charcoal-900 text-ivory-50 hover:bg-charcoal-800 focus:ring-charcoal-700 dark:bg-ivory-100 dark:text-charcoal-900 dark:hover:bg-white shadow-subtle',
    secondary:
      'bg-ivory-100 text-charcoal-800 hover:bg-ivory-200 focus:ring-charcoal-400 dark:bg-charcoal-800 dark:text-ivory-100 dark:hover:bg-charcoal-700 border border-ivory-200 dark:border-charcoal-700',
    sage:
      'bg-sage-600 text-white hover:bg-sage-700 focus:ring-sage-500 shadow-subtle',
    outline:
      'bg-transparent text-charcoal-700 dark:text-charcoal-200 border border-charcoal-200 dark:border-charcoal-700 hover:bg-ivory-100 dark:hover:bg-charcoal-800 focus:ring-charcoal-400',
    ghost:
      'bg-transparent text-charcoal-600 dark:text-charcoal-300 hover:bg-ivory-100 dark:hover:bg-charcoal-800 focus:ring-charcoal-400',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-subtle',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading ? true : undefined}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};

