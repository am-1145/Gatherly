import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftElement,
  rightElement,
  className = '',
  id,
  ...props
}) => {
  const fallbackId = React.useId();
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : fallbackId);
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-subtle flex items-center">
        {leftElement && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal-400">
            {leftElement}
          </div>
        )}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || props['aria-describedby']}
          aria-errormessage={errorId}
          className={`block w-full rounded-lg text-sm bg-white dark:bg-charcoal-900 border ${
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-ivory-200 dark:border-charcoal-700 focus:border-sage-500 focus:ring-sage-500'
          } text-charcoal-900 dark:text-ivory-100 placeholder-charcoal-400 py-2.5 ${
            leftElement ? 'pl-9' : 'pl-3.5'
          } ${rightElement ? 'pr-9' : 'pr-3.5'} transition-all focus:outline-none focus:ring-1 ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-charcoal-400">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p id={errorId} role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
      {hint && !error && <p id={hintId} className="mt-1 text-xs text-charcoal-500 dark:text-charcoal-400">{hint}</p>}
    </div>
  );
};

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  hint,
  className = '',
  id,
  ...props
}) => {
  const fallbackId = React.useId();
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : fallbackId);
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300 mb-1.5"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || props['aria-describedby']}
        aria-errormessage={errorId}
        className={`block w-full rounded-lg text-sm bg-white dark:bg-charcoal-900 border ${
          error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-ivory-200 dark:border-charcoal-700 focus:border-sage-500 focus:ring-sage-500'
        } text-charcoal-900 dark:text-ivory-100 placeholder-charcoal-400 p-3 transition-all focus:outline-none focus:ring-1 ${className}`}
        {...props}
      />
      {error && <p id={errorId} role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
      {hint && !error && <p id={hintId} className="mt-1 text-xs text-charcoal-500 dark:text-charcoal-400">{hint}</p>}
    </div>
  );
};

