import React from 'react';
import type { UrgencyLevel } from '../../types';

interface UrgencyBadgeProps {
  urgency: UrgencyLevel;
  sellWithinDays?: number;
  showDays?: boolean;
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ urgency, sellWithinDays, showDays = true }) => {
  const config = {
    high: {
      bg: 'bg-red-50 text-red-950 border-red-300 font-semibold',
      dot: 'bg-red-600',
      label: 'High urgency',
      subtext: '1 day or less',
    },
    medium: {
      bg: 'bg-amber-50 text-amber-950 border-amber-300 font-semibold',
      dot: 'bg-amber-600',
      label: 'Medium urgency',
      subtext: '2–3 days',
    },
    normal: {
      bg: 'bg-emerald-50 text-emerald-950 border-emerald-300 font-semibold',
      dot: 'bg-emerald-600',
      label: 'Normal urgency',
      subtext: '> 3 days',
    },
  }[urgency];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${config.bg}`}
      title="Urgency is derived strictly from the farmer's stated selling deadline. Not an AI spoilage prediction."
    >
      <span className={`w-2 h-2 rounded-full ${config.dot} shrink-0`} aria-hidden="true" />
      <span>{config.label}</span>
      {showDays && sellWithinDays !== undefined && (
        <span className="opacity-80 font-normal">
          ({sellWithinDays === 1 ? '1 day left' : `${sellWithinDays} days left`})
        </span>
      )}
    </span>
  );
};

interface StatusBadgeProps {
  status: 'active' | 'sold' | 'expired' | 'pending' | 'accepted' | 'rejected';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = {
    active: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold',
    sold: 'bg-stone-100 text-stone-800 border-stone-300 font-medium',
    expired: 'bg-rose-50 text-rose-900 border-rose-300 font-medium',
    pending: 'bg-amber-50 text-amber-900 border-amber-300 font-semibold',
    accepted: 'bg-emerald-100 text-emerald-950 border-emerald-400 font-bold',
    rejected: 'bg-stone-100 text-stone-600 border-stone-300 line-through',
  }[status];

  const labels = {
    active: 'Active',
    sold: 'Sold',
    expired: 'Expired',
    pending: 'Pending review',
    accepted: 'Accepted',
    rejected: 'Declined',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${config}`}>
      {labels[status]}
    </span>
  );
};

export const BestReturnBadge: React.FC<{ isTied?: boolean }> = ({ isTied }) => {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-800 text-white shadow-md border border-emerald-600 ring-2 ring-emerald-600/30">
      <svg className="w-3.5 h-3.5 fill-current text-emerald-200 shrink-0" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span>{isTied ? 'Tied for best return' : 'Best estimated return'}</span>
    </span>
  );
};
