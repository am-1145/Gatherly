import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
}

/**
 * User action confirmation prompt modal with danger or primary styling.
 *
 * @param props - Dialog configurations
 * @param props.isOpen - Whether the confirmation modal is open
 * @param props.onClose - Dismiss callback invoked when cancelled
 * @param props.onConfirm - Callback invoked when the user confirms the action
 * @param props.title - Modal title heading
 * @param props.message - Descriptive warning message explaining consequence
 * @param props.confirmLabel - Label for confirmation button (defaults to "Confirm")
 * @param props.cancelLabel - Label for dismissal button (defaults to "Cancel")
 * @param props.variant - Button style variant ('danger' | 'primary')
 * @returns JSX.Element confirmation dialog modal
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" showCloseButton={false} aria-label={title}>
      <div className="text-center pt-2 pb-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-charcoal-900 dark:text-ivory-100 mb-1.5">
          {title}
        </h4>
        <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mb-6 leading-relaxed">
          {message}
        </p>
        <div className="flex gap-2.5 justify-center">
          <Button variant="outline" size="sm" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

