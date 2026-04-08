import { useEffect } from 'react';

type ToastProps = {
  message?: string | null;
  type?: 'success' | 'error';
  onClose?: () => void;
  autoDismiss?: boolean;
  duration?: number;
};

export function Toast({ message, type = 'success', onClose, autoDismiss = true, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (message && autoDismiss && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, autoDismiss, onClose, duration]);

  if (!message) return null;

  return (
    <div className="toast-container">
      <div className={`toast ${type === 'success' ? 'toast-success' : 'toast-error'}`}>
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm leading-6">{message}</p>
          {onClose && (
            <button type="button" className="toast-close" onClick={onClose}>
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
