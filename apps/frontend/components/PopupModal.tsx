'use client';

import { ReactNode } from 'react';

type PopupAction = {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
};

type PopupModalProps = {
  isOpen: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  actions: PopupAction[];
};

const actionClassByVariant: Record<NonNullable<PopupAction['variant']>, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

export function PopupModal({ isOpen, title, description, children, actions }: PopupModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/45" />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
      >
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {description && <p className="mt-2 text-sm text-gray-600">{description}</p>}

        {children && <div className="mt-4">{children}</div>}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          {actions.map((action) => {
            const variant = action.variant || 'secondary';
            return (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                disabled={action.disabled}
                className={`rounded-md px-4 cursor-pointer py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${actionClassByVariant[variant]}`}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
