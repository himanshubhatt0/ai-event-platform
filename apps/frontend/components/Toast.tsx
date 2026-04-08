type ToastProps = {
  message?: string | null;
  type?: 'success' | 'error';
  onClose?: () => void;
};

export function Toast({ message, type = 'success', onClose }: ToastProps) {
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
