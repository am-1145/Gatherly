import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
  'aria-label'?: string;
}

/**
 * Accessible dialog modal overlay with keyboard Escape handling, body scroll locking,
 * and ARIA labelling / description bindings.
 *
 * @param props - Modal dialog properties
 * @param props.isOpen - Whether the modal dialog is visible
 * @param props.onClose - Callback triggered to dismiss the modal (e.g., backdrop click or Escape)
 * @param props.title - Title header node displayed at the top of the dialog
 * @param props.description - Optional subtitle / description referenced via aria-describedby
 * @param props.children - Modal body content
 * @param props.maxWidth - Horizontal constraint width ('sm', 'md', 'lg', 'xl', '2xl')
 * @param props.showCloseButton - Whether to display top-right dismiss button
 * @returns Accessible dialog modal or null if not open
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  showCloseButton = true,
  'aria-label': ariaLabel,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = React.useId();
  const descId = React.useId();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        aria-label={!title ? (ariaLabel || 'Dialog') : undefined}
        tabIndex={-1}
        className={`relative w-full ${maxWidthStyles[maxWidth]} bg-white dark:bg-charcoal-900 rounded-2xl shadow-elevated border border-ivory-200 dark:border-charcoal-800 p-6 my-8 z-10 animate-slide-up focus:outline-none`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h3 id={titleId} className="text-lg font-semibold text-charcoal-900 dark:text-ivory-50 tracking-tight">
                {title}
              </h3>
            )}
            {description && (
              <p id={descId} className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1">
                {description}
              </p>
            )}
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 dark:hover:text-charcoal-200 hover:bg-ivory-100 dark:hover:bg-charcoal-800 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
};

