import React from 'react';
import { formatINR, formatNumberIN } from '../../utils/formatters';

interface NetReturnBreakdownProps {
  offeredQuantity: number;
  unit: string;
  offerPricePerUnit: number;
  totalOfferAmount: number;
  transportCost: number;
  packagingCost: number;
  otherCosts: number;
  estimatedNetReturn: number;
  compact?: boolean;
}

export const NetReturnBreakdown: React.FC<NetReturnBreakdownProps> = ({
  offeredQuantity,
  unit,
  offerPricePerUnit,
  totalOfferAmount,
  transportCost,
  packagingCost,
  otherCosts,
  estimatedNetReturn,
  compact = false,
}) => {
  const totalDeductions = transportCost + packagingCost + otherCosts;

  if (compact) {
    return (
      <div className="bg-stone-50/80 rounded-md p-3 border border-stone-200 text-xs font-mono space-y-1">
        <div className="flex justify-between text-stone-700">
          <span>Gross amount ({formatNumberIN(offeredQuantity)} {unit} × {formatINR(offerPricePerUnit)}/{unit}):</span>
          <span className="font-medium text-stone-900">{formatINR(totalOfferAmount)}</span>
        </div>
        <div className="flex justify-between text-stone-500">
          <span>− Transport cost:</span>
          <span>−{formatINR(transportCost)}</span>
        </div>
        <div className="flex justify-between text-stone-500">
          <span>− Packaging cost:</span>
          <span>−{formatINR(packagingCost)}</span>
        </div>
        {otherCosts > 0 && (
          <div className="flex justify-between text-stone-500">
            <span>− Other selling costs:</span>
            <span>−{formatINR(otherCosts)}</span>
          </div>
        )}
        <div className="pt-1.5 mt-1 border-t border-stone-300 flex justify-between font-sans text-sm font-semibold text-emerald-900">
          <span>= Estimated net return:</span>
          <span className="text-base text-emerald-800">{formatINR(estimatedNetReturn)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
      <div className="text-xs uppercase font-semibold tracking-wider text-stone-500 mb-2">
        Net-return breakdown
      </div>
      
      {/* Gross calculation line */}
      <div className="flex items-center justify-between py-1.5 border-b border-stone-200 text-sm">
        <div>
          <span className="font-medium text-stone-800">Total gross amount</span>
          <span className="text-xs text-stone-500 ml-2">
            ({formatNumberIN(offeredQuantity)} {unit} × {formatINR(offerPricePerUnit)}/{unit})
          </span>
        </div>
        <span className="font-semibold text-stone-900">{formatINR(totalOfferAmount)}</span>
      </div>

      {/* Selling cost deductions */}
      <div className="space-y-1.5 py-2.5 text-xs text-stone-600 border-b border-stone-200">
        <div className="flex justify-between">
          <span>− Transport cost (estimated)</span>
          <span className="text-rose-700">−{formatINR(transportCost)}</span>
        </div>
        <div className="flex justify-between">
          <span>− Packaging cost (estimated)</span>
          <span className="text-rose-700">−{formatINR(packagingCost)}</span>
        </div>
        <div className="flex justify-between">
          <span>− Other selling costs (handling/loading)</span>
          <span className="text-rose-700">−{formatINR(otherCosts)}</span>
        </div>
        <div className="flex justify-between font-medium text-stone-700 pt-1">
          <span>Total estimated selling deductions</span>
          <span className="text-rose-700 font-semibold">−{formatINR(totalDeductions)}</span>
        </div>
      </div>

      {/* Final estimated take home */}
      <div className="pt-2.5 flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-emerald-950">Estimated net return</div>
          <div className="text-xs text-stone-500">Take-home return based on entered costs</div>
        </div>
        <div className="text-right">
          <div className="text-lg sm:text-xl font-bold text-emerald-800">
            {formatINR(estimatedNetReturn)}
          </div>
          <div className="text-xs text-stone-500">
            (~{formatINR(offeredQuantity > 0 ? Math.round(estimatedNetReturn / offeredQuantity) : 0)}/{unit} net)
          </div>
        </div>
      </div>
    </div>
  );
};
