import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useDemoUser } from '../../hooks/useDemoUser';
import { ProduceListing } from '../../types';
import { updateListingAsync } from '../../data/dataAccess';
import { getSellingUrgency } from '../../utils/calculations';
import { formatINR } from '../../utils/formatters';
import { UrgencyBadge } from '../common/Badge';
import {
  Edit3,
  X,
  AlertCircle,
  Check,
  Clock,
  Info,
  Scale,
} from 'lucide-react';

interface EditListingModalProps {
  listing: ProduceListing | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: ProduceListing) => void;
}

export const EditListingModal: React.FC<EditListingModalProps> = ({
  listing,
  isOpen,
  onClose,
  onSave,
}) => {
  const { language, t } = useLanguage();
  const { isRealAuth, currentUser } = useDemoUser();

  const [expectedPrice, setExpectedPrice] = useState<string>('');
  const [minFloorPrice, setMinFloorPrice] = useState<string>('');
  const [sellWithinDays, setSellWithinDays] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (listing) {
      setExpectedPrice(listing.expectedPricePerUnit.toString());
      setMinFloorPrice((listing.minAcceptablePricePerUnit ?? '').toString());
      setSellWithinDays(listing.sellWithinDays.toString());
      setErrors({});
      setIsSubmitting(false);
    }
  }, [listing]);

  if (!isOpen || !listing) return null;

  const parsedDays = parseInt(sellWithinDays, 10);
  const urgencyPreview = !isNaN(parsedDays) && parsedDays > 0 ? getSellingUrgency(parsedDays) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    const newErrors: Record<string, string> = {};

    if (!currentUser || currentUser.role !== 'farmer' || currentUser.id !== listing.farmerId) {
      setErrors({
        submit:
          language === 'ta'
            ? 'இந்த பட்டியலை திருத்த உங்களுக்கு அனுமதி இல்லை.'
            : 'You are not authorized to edit this listing.',
      });
      return;
    }

    if (listing.status === 'sold') {
      setErrors({
        submit:
          language === 'ta'
            ? 'விற்கப்பட்ட விளைபொருளை திருத்த முடியாது.'
            : 'Sold listings cannot be edited.',
      });
      return;
    }

    const targetNum = parseFloat(expectedPrice);
    const floorNum = parseFloat(minFloorPrice);
    const daysNum = parseInt(sellWithinDays, 10);

    // Validate target expected price
    if (isNaN(targetNum) || targetNum <= 0) {
      newErrors.expectedPrice =
        language === 'ta'
          ? 'எதிர்பார்க்கும் விலை பூஜ்ஜியத்தை விட அதிகமாக இருக்க வேண்டும்.'
          : 'Target expected price must be greater than 0.';
    }

    // Validate minimum floor price
    if (isNaN(floorNum) || floorNum < 0) {
      newErrors.minFloorPrice =
        language === 'ta'
          ? 'குறைந்தபட்ச விலை செல்லுபடியாகும் எண்ணாக இருக்க வேண்டும்.'
          : 'Minimum floor price must be a valid non-negative number.';
    } else if (!isNaN(targetNum) && floorNum > targetNum) {
      newErrors.minFloorPrice =
        language === 'ta'
          ? 'குறைந்தபட்ச விலை எதிர்பார்க்கும் இலக்கு விலையை விட அதிகமாக இருக்க முடியாது.'
          : 'Minimum floor price cannot exceed target expected price.';
    }

    // Validate sellWithinDays deadline
    if (isNaN(daysNum) || daysNum < 1) {
      newErrors.sellWithinDays =
        language === 'ta'
          ? 'விற்பனை காலக்கெடு குறைந்தபட்சம் 1 நாளாக இருக்க வேண்டும்.'
          : 'Selling deadline must be at least 1 day.';
    } else if (daysNum > 90) {
      newErrors.sellWithinDays =
        language === 'ta'
          ? 'விற்பனை காலக்கெடு 90 நாட்களுக்குள் இருக்க வேண்டும்.'
          : 'Selling deadline cannot exceed 90 days.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    updateListingAsync(
      listing.id,
      {
        expectedPricePerUnit: targetNum,
        minAcceptablePricePerUnit: floorNum,
        sellWithinDays: daysNum,
      },
      Boolean(isRealAuth)
    )
      .then((updated) => {
        if (updated) {
          onSave(updated);
          onClose();
        } else {
          setErrors({
            submit:
              language === 'ta'
                ? 'விவரங்களை சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.'
                : 'Failed to update listing. Please try again.',
          });
          setIsSubmitting(false);
        }
      })
      .catch((err: any) => {
        console.error('Failed to update listing:', err);
        setErrors({
          submit: err?.message || 'Failed to update listing in database.',
        });
        setIsSubmitting(false);
      });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                {t('listing.editTitle', 'Edit Produce Listing')}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'ta' ? listing.cropNameTa : listing.cropName} •{' '}
                {language === 'ta' ? listing.varietyTa : listing.variety} ({listing.quantity} {listing.unit})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global error message */}
        {errors.submit && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errors.submit}</span>
          </div>
        )}

        {/* Reference Context Card */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">{language === 'ta' ? 'அறுவடை தொகுதி:' : 'Produce Lot'}:</span>
            <span className="font-bold text-slate-900">
              {listing.quantity} {listing.unit} • {listing.district}
            </span>
          </div>
          {listing.mandiBenchmarkPrice && (
            <div className="flex justify-between items-center text-emerald-800">
              <span className="flex items-center gap-1 font-medium">
                <Scale className="w-3.5 h-3.5" />
                {t('term.mandiBenchmark', 'Mandi Benchmark')}:
              </span>
              <span className="font-bold">
                {formatINR(listing.mandiBenchmarkPrice)} / {listing.unit}
              </span>
            </div>
          )}
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Expected Price */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('listing.targetPrice', 'Target Expected Price')} (₹ / {listing.unit}) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">₹</span>
              <input
                type="number"
                step="0.5"
                min="1"
                value={expectedPrice}
                onChange={(e) => {
                  setExpectedPrice(e.target.value);
                  if (errors.expectedPrice) setErrors((prev) => ({ ...prev, expectedPrice: '' }));
                }}
                className={`w-full pl-8 pr-3 py-2 rounded-xl border text-sm font-semibold transition-all ${
                  errors.expectedPrice
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200'
                }`}
                placeholder="e.g. 45"
              />
            </div>
            {errors.expectedPrice ? (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.expectedPrice}
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 mt-1">
                {language === 'ta'
                  ? 'நீங்கள் பெற விரும்பும் உகந்த அலகு விலை.'
                  : 'Ideal selling price displayed to buyers in the marketplace catalogue.'}
              </p>
            )}
          </div>

          {/* Minimum / Floor Price */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('listing.floorPrice', 'Minimum Acceptable Floor Price')} (₹ / {listing.unit}) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">₹</span>
              <input
                type="number"
                step="0.5"
                min="0"
                value={minFloorPrice}
                onChange={(e) => {
                  setMinFloorPrice(e.target.value);
                  if (errors.minFloorPrice) setErrors((prev) => ({ ...prev, minFloorPrice: '' }));
                }}
                className={`w-full pl-8 pr-3 py-2 rounded-xl border text-sm font-semibold transition-all ${
                  errors.minFloorPrice
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200'
                }`}
                placeholder="e.g. 38"
              />
            </div>
            {errors.minFloorPrice ? (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.minFloorPrice}
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 mt-1">
                {language === 'ta'
                  ? 'இந்த விலைக்கு கீழ் உள்ள சலுகைகளை ஏற்க இயலாது (இலக்கு விலையை விட குறைவாக இருக்க வேண்டும்).'
                  : 'Lowest threshold you would consider before choosing storage or processing alternatives.'}
              </p>
            )}
          </div>

          {/* Selling Deadline (Days) & Live Urgency Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                {t('listing.deadlineDays', 'Selling Deadline (Days Remaining)')} *
              </label>
              {urgencyPreview && (
                <UrgencyBadge level={urgencyPreview.level} daysRemaining={parsedDays} />
              )}
            </div>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="number"
                min="1"
                max="90"
                step="1"
                value={sellWithinDays}
                onChange={(e) => {
                  setSellWithinDays(e.target.value);
                  if (errors.sellWithinDays) setErrors((prev) => ({ ...prev, sellWithinDays: '' }));
                }}
                className={`w-full pl-9 pr-3 py-2 rounded-xl border text-sm font-semibold transition-all ${
                  errors.sellWithinDays
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200'
                }`}
                placeholder="e.g. 3"
              />
            </div>
            {errors.sellWithinDays ? (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.sellWithinDays}
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 mt-1">
                {language === 'ta'
                  ? '≤ 1 நாள் = அதிக அவசரம்; 2-3 நாட்கள் = நடுத்தரம்; > 3 நாட்கள் = இயல்பு.'
                  : '≤ 1 day triggers High Urgency; 2-3 days triggers Medium; > 3 days is Normal.'}
              </p>
            )}
          </div>

          {/* Data Integrity Notice */}
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>{language === 'ta' ? 'தரவு பாதுகாப்பு:' : 'Data Integrity Notice:'}</strong>{' '}
              {t(
                'listing.preserveOffersNotice',
                'Existing buyer offers are preserved with their original agreed rates. Updating your target and floor price refines future bids and marketplace visibility.'
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
            >
              {t('action.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? (language === 'ta' ? 'சேமிக்கப்படுகிறது...' : 'Saving...') : t('action.save', 'Save Changes')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
