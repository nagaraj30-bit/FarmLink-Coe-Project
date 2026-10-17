import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Info } from 'lucide-react';
import { MANDATORY_DISCLAIMER_EN, MANDATORY_DISCLAIMER_TA } from '../../utils/calculations';

interface DisclaimerNoticeProps {
  compact?: boolean;
  className?: string;
}

export const DisclaimerNotice: React.FC<DisclaimerNoticeProps> = ({ compact = false, className = '' }) => {
  const { language } = useLanguage();
  const text = language === 'ta' ? MANDATORY_DISCLAIMER_TA : MANDATORY_DISCLAIMER_EN;

  if (compact) {
    return (
      <div className={`flex items-start gap-1.5 text-xs text-amber-800 bg-amber-50/90 border border-amber-200/80 px-2.5 py-1.5 rounded-md ${className}`}>
        <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
        <span className="italic">{text}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-xs md:text-sm text-amber-900 bg-amber-50 border border-amber-300 px-3.5 py-2.5 rounded-lg shadow-2xs ${className}`}>
      <Info className="w-4 h-4 text-amber-700 shrink-0" />
      <div>
        <span className="font-semibold">{language === 'ta' ? 'கவனிக்க:' : 'Important Notice:'} </span>
        <span className="italic">{text}</span>
      </div>
    </div>
  );
};
