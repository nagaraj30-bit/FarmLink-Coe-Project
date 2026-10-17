import React from 'react';
import { UrgencyLevel, ListingStatus, OfferStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { AlertCircle, Clock, CheckCircle2, XCircle, Award } from 'lucide-react';

interface UrgencyBadgeProps {
  level: UrgencyLevel;
  daysRemaining?: number;
  className?: string;
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ level, daysRemaining, className = '' }) => {
  const { language } = useLanguage();

  if (level === 'high') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 ${className}`}
      >
        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
        <span>
          {language === 'ta'
            ? `அதிக அவசரம் (${daysRemaining ?? 1} நாள்)`
            : `High Urgency (${daysRemaining ?? 1}d left)`}
        </span>
      </span>
    );
  }

  if (level === 'medium') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 ${className}`}
      >
        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>
          {language === 'ta'
            ? `நடுத்தர அவசரம் (${daysRemaining ?? 2} நாட்கள்)`
            : `Medium Urgency (${daysRemaining ?? 2}d left)`}
        </span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200 ${className}`}
    >
      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
      <span>
        {language === 'ta'
          ? `இயல்பானது (${daysRemaining ?? 4} நாட்கள்)`
          : `Normal (${daysRemaining ?? 4}d left)`}
      </span>
    </span>
  );
};

export const StatusBadge: React.FC<{ status: ListingStatus | OfferStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const { language } = useLanguage();

  const labels: Record<string, { en: string; ta: string; style: string }> = {
    active: {
      en: 'Active',
      ta: 'செயலில்',
      style: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    negotiating: {
      en: 'Offers Received',
      ta: 'வாய்ப்புகள் வந்துள்ளன',
      style: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    sold: {
      en: 'Sold',
      ta: 'விற்கப்பட்டது',
      style: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    pending: {
      en: 'Pending Review',
      ta: 'பரிசீலனையில்',
      style: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    accepted: {
      en: 'Accepted',
      ta: 'ஏற்றுக்கொள்ளப்பட்டது',
      style: 'bg-emerald-100/80 text-emerald-900 border-emerald-300 font-semibold',
    },
    declined: {
      en: 'Declined',
      ta: 'நிராகரிக்கப்பட்டது',
      style: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    expired: {
      en: 'Expired',
      ta: 'காலாவதியானது',
      style: 'bg-slate-100 text-slate-600 border-slate-200',
    },
  };

  const item = labels[status] || {
    en: status,
    ta: status,
    style: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${item.style} ${className}`}
    >
      {status === 'accepted' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
      {status === 'declined' && <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
      <span>{language === 'ta' ? item.ta : item.en}</span>
    </span>
  );
};

export const BestReturnBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language } = useLanguage();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-amber-500 text-slate-950 shadow-xs border border-amber-600/20 ${className}`}
    >
      <Award className="w-3.5 h-3.5 text-slate-950 shrink-0" />
      <span>{language === 'ta' ? 'சிறந்த நிகர வருவாய்' : 'Best Estimated Return'}</span>
    </span>
  );
};
