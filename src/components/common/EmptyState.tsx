import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="bg-white border border-dashed border-stone-300 rounded-lg p-8 text-center max-w-lg mx-auto my-6">
      {icon ? (
        <div className="mx-auto w-12 h-12 text-stone-400 mb-3 flex items-center justify-center">
          {icon}
        </div>
      ) : (
        <div className="mx-auto w-12 h-12 rounded-full bg-stone-100 text-stone-400 mb-3 flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}
      <h3 className="text-base font-semibold text-stone-800">{title}</h3>
      <p className="mt-1 text-sm text-stone-500">{description}</p>
      {actionText && onAction && (
        <div className="mt-4">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors"
          >
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
};
