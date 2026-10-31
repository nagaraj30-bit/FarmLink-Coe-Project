import React from 'react';
import { NetReturnCalculation } from '../../types';
import { formatINR } from '../../utils/formatters';
import { useLanguage } from '../../context/LanguageContext';
import { DisclaimerNotice } from '../common/DisclaimerNotice';
import { Calculator, ArrowRight, TrendingUp, Minus } from 'lucide-react';

interface NetReturnBreakdownProps {
  calculation: NetReturnCalculation;
  highlightBest?: boolean;
  className?: string;
}

export const NetReturnBreakdown: React.FC<NetReturnBreakdownProps> = ({
  calculation,
  highlightBest = false,
  className = '',
}) => {
  const { language, t } = useLanguage();

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        highlightBest
          ? 'bg-emerald-50/70 border-emerald-400 shadow-sm ring-1 ring-emerald-300'
          : 'bg-white border-slate-200 shadow-2xs'
      } ${className}`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Calculator className={`w-4 h-4 ${highlightBest ? 'text-emerald-700' : 'text-slate-600'}`} />
          <span className="text-sm font-semibold text-slate-900">
            {language === 'ta' ? 'வருவாய் கணக்கீட்டு விவரம்' : 'Net-Return Calculation Breakdown'}
          </span>
        </div>
        <span className="text-xs font-medium text-slate-500">
          {calculation.quantity} {calculation.unit} @ {formatINR(calculation.offeredPricePerUnit)}/{calculation.unit}
        </span>
      </div>

      {/* Math steps */}
      <div className="py-3 space-y-2 text-sm">
        {/* Step 1: Gross Total */}
        <div className="flex justify-between items-center text-slate-700">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            {t('term.grossTotal', 'Gross Offer Amount')}
            <span className="text-xs text-slate-400">
              ({calculation.quantity} × {formatINR(calculation.offeredPricePerUnit)})
            </span>
          </span>
          <span className="font-semibold text-slate-900">{formatINR(calculation.grossTotal)}</span>
        </div>

        {/* Deductions block */}
        <div className="pl-3 py-1 space-y-1.5 border-l-2 border-rose-200 text-xs text-slate-600 bg-rose-50/40 rounded-r-md">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-rose-700">
              <Minus className="w-3 h-3 text-rose-500" />
              {t('term.transportCost', 'Transportation Cost')}
            </span>
            <span className="font-medium text-rose-700">−{formatINR(calculation.transportCost)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-rose-700">
              <Minus className="w-3 h-3 text-rose-500" />
              {t('term.packagingCost', 'Packaging Cost')}
            </span>
            <span className="font-medium text-rose-700">−{formatINR(calculation.packagingCost)}</span>
          </div>

          {calculation.otherCosts > 0 && (
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1 text-rose-700">
                <Minus className="w-3 h-3 text-rose-500" />
                {t('term.otherCosts', 'Other Selling Costs')}
              </span>
              <span className="font-medium text-rose-700">−{formatINR(calculation.otherCosts)}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-1 border-t border-rose-100 font-medium text-rose-900">
            <span>{t('term.totalCosts', 'Total Deductions')}</span>
            <span>−{formatINR(calculation.totalSellingCosts)}</span>
          </div>
        </div>

        {/* Step 3: Estimated Net Return */}
        <div
          className={`mt-3 p-3 rounded-lg flex items-center justify-between ${
            highlightBest
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-900 text-white'
          }`}
        >
          <div>
            <div className="text-xs font-medium uppercase tracking-wider opacity-90 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {t('term.netReturn', 'Estimated Net Return')}
            </div>
            <div className="text-xs opacity-75 mt-0.5">
              ≈ {formatINR(calculation.netReturnPerUnit)} / {calculation.unit} {language === 'ta' ? 'நிகர மதிப்பு' : 'effective take-home'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl md:text-2xl font-black tracking-tight">
              {formatINR(calculation.estimatedNetReturn)}
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="mt-2.5">
        <DisclaimerNotice compact />
      </div>
    </div>
  );
};
