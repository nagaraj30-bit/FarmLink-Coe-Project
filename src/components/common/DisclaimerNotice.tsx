import React from 'react';

interface DisclaimerNoticeProps {
  compact?: boolean;
}

export const DisclaimerNotice: React.FC<DisclaimerNoticeProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="text-xs text-stone-600 bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 flex items-start gap-1.5">
        <span className="font-semibold text-stone-700 select-none">Notice:</span>
        <span>Estimated net return, based on entered costs — not a guaranteed profit.</span>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 border-l-4 border-emerald-700 p-3 rounded-r-md text-xs sm:text-sm text-stone-700">
      <div className="flex items-start gap-2">
        <svg className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <span className="font-medium text-stone-900">Estimated net return, based on entered costs — not a guaranteed profit.</span>
          <p className="mt-0.5 text-stone-500 text-xs">
            Transport, packaging, and other selling costs are estimated figures entered for comparison and are not guaranteed to be paid by any specific party.
          </p>
        </div>
      </div>
    </div>
  );
};
