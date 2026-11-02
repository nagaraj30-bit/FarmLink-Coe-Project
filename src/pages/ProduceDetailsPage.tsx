import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useDemoUser } from '../hooks/useDemoUser';
import { fetchListingByIdAsync } from '../data/dataAccess';
import { ProduceListing } from '../types';
import { formatINR, formatDateIN } from '../utils/formatters';
import { getSellingUrgency } from '../utils/calculations';
import { UrgencyBadge, StatusBadge } from '../components/common/Badge';
import { DisclaimerNotice } from '../components/common/DisclaimerNotice';
import {
  ArrowLeft,
  Calendar,
  Scale,
  Send,
  User,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';

export const ProduceDetailsPage: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { isRealAuth } = useDemoUser();

  const [listing, setListing] = useState<ProduceListing | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadListing = () => {
    if (!listingId) return;
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetchListingByIdAsync(listingId, Boolean(isRealAuth))
      .then((l) => {
        if (!isMounted) return;
        if (l) setListing(l);
        else setListing(null);
        setIsLoading(false);
      })
      .catch((err: any) => {
        if (!isMounted) return;
        console.error('Failed to load listing details:', err);
        setError(err?.message || 'Failed to load produce lot details.');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  };

  useEffect(() => {
    return loadListing();
  }, [listingId, isRealAuth]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
        <h2 className="text-base font-bold text-slate-800">
          {language === 'ta' ? 'விளைபொருள் விவரங்கள் ஏற்றப்படுகின்றன...' : 'Loading produce details...'}
        </h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-6">
        <div className="bg-white rounded-3xl border border-rose-200 shadow-sm p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'ta' ? 'தரவுத்தள பிழை' : 'Database Connection Notice'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">{error}</p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={loadListing}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-colors"
            >
              {language === 'ta' ? 'மீண்டும் முயற்சிக்க' : 'Retry'}
            </button>
            <Link
              to="/marketplace"
              className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
            >
              {t('notFound.marketplace', 'Browse Marketplace')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <div className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-700">
              {language === 'ta' ? 'விளைபொருள் கண்டறியப்படவில்லை' : 'Listing Not Found'}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {language === 'ta' ? 'விளைபொருள் விவரம் கிடைக்கவில்லை' : 'Produce Lot Not Found'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {language === 'ta'
                ? `விளைபொருள் அடையாளம் "${listingId}" உள்ளடக்கப்படவில்லை அல்லது நீக்கப்பட்டுள்ளது.`
                : `The requested produce lot with ID "${listingId}" does not exist or has been removed.`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/marketplace"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-colors"
            >
              <span>{t('notFound.marketplace', 'Browse Marketplace')}</span>
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
            >
              <span>{t('notFound.home', 'Home')}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const urgency = getSellingUrgency(listing.sellWithinDays);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('action.back', 'Back')}</span>
      </button>

      {/* Main Detail Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold font-mono text-emerald-700 uppercase tracking-wider">
                {listing.category}
              </span>
              <StatusBadge status={listing.status} />
              <UrgencyBadge level={urgency.level} daysRemaining={listing.sellWithinDays} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {language === 'ta' ? listing.cropNameTa : listing.cropName}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {language === 'ta' ? listing.varietyTa : listing.variety} • {listing.district}
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-right shrink-0">
            <span className="text-xs text-emerald-700 block font-semibold">
              {t('term.quantity', 'Available Volume')}:
            </span>
            <span className="text-2xl font-black text-emerald-950 block">
              {listing.quantity} {listing.unit}
            </span>
            <span className="text-xs text-emerald-800 font-bold block mt-1">
              {formatINR(listing.expectedPricePerUnit)} / {listing.unit}{' '}
              <span className="text-[10px] font-normal text-emerald-600">({t('term.expectedPrice', 'Target')})</span>
            </span>
          </div>
        </div>

        {/* Specification Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>{language === 'ta' ? 'காலவரிசை & அவசரம்' : 'Timeline & Urgency'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('term.harvestDate', 'Harvested Date')}:</span>
              <span className="font-semibold text-slate-800">{formatDateIN(listing.harvestingDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('term.deadline', 'Selling Deadline')}:</span>
              <span className="font-bold text-rose-700">
                {listing.sellWithinDays} {language === 'ta' ? 'நாட்கள் உள்ளன' : 'day(s) left'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('term.storageCondition', 'Storage Condition')}:</span>
              <span className="font-medium text-slate-700">
                {language === 'ta' && listing.storageConditionTa ? listing.storageConditionTa : listing.storageCondition}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600" />
              <span>{language === 'ta' ? 'விவசாயி விவரங்கள்' : 'Farmer & Location'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{language === 'ta' ? 'விவசாயி:' : 'Farmer Name:'}</span>
              <span className="font-semibold text-slate-800">
                {language === 'ta' && listing.farmerNameTa ? listing.farmerNameTa : listing.farmerName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('term.district', 'District')}:</span>
              <span className="font-medium text-slate-700">
                {language === 'ta' && listing.districtTa ? listing.districtTa : listing.district}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">{language === 'ta' ? 'தொடர்பு:' : 'Phone:'}</span>
              {listing.farmerPhone && (listing.farmerPhone.startsWith('Protected') || listing.farmerPhone.includes('*')) ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span>{language === 'ta' ? 'சலுகைக்கு பின் கிடைக்கும்' : 'Protected (Unlock on offer)'}</span>
                </span>
              ) : (
                <span className="font-medium text-slate-700">{listing.farmerPhone}</span>
              )}
            </div>
          </div>
        </div>

        {/* Mandi Benchmark Price Transparency Card */}
        {listing.mandiBenchmarkPrice && (
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-300 text-xs sm:text-sm text-amber-950 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-amber-900 text-[11px]">
              <Scale className="w-4 h-4 text-amber-700" />
              <span>{language === 'ta' ? 'சந்தை குறிப்பு விலை (Mandi Benchmark)' : 'Regional Benchmark Transparency'}</span>
            </div>
            <p className="leading-relaxed">
              <strong>{formatINR(listing.mandiBenchmarkPrice)} / {listing.unit}</strong>{' '}
              {language === 'ta'
                ? `— ஆதாரம்: ${listing.benchmarkSource} (${formatDateIN(listing.benchmarkDate || '')}).`
                : `— Reported by ${listing.benchmarkSource} on ${formatDateIN(listing.benchmarkDate || '')}.`}
            </p>
            <p className="text-[11px] text-amber-800 italic">
              {language === 'ta'
                ? 'இது மண்டியின் உத்தியோகபூர்வ குறிப்பு விலை. பார்ம்லிங்க் உயிரியல் நிலை அல்லது கட்டாய விலையை நிர்ணயிக்காது.'
                : 'Benchmark rates are displayed for farmer and buyer orientation only. FarmLink does not guarantee settlement prices.'}
            </p>
          </div>
        )}

        {/* Description */}
        <div className="space-y-1 text-xs sm:text-sm">
          <h3 className="font-bold text-slate-900">{language === 'ta' ? 'விளக்கம்:' : 'Produce Notes:'}</h3>
          <p className="text-slate-600 leading-relaxed">
            {language === 'ta' ? listing.descriptionTa : listing.description}
          </p>
        </div>

        {/* CTA Bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {language === 'ta' ? 'அலகு மாற்ற முடியாதவாறு பூட்டப்பட்டுள்ளது' : 'Offer unit is locked to listing quantity.'}
          </span>

          {listing.status !== 'sold' ? (
            <Link
              to={`/make-offer/${listing.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>{t('action.makeOffer', 'Submit Structured Offer')}</span>
            </Link>
          ) : (
            <span className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs">
              {language === 'ta' ? 'இந்த விளைபொருள் விற்கப்பட்டுவிட்டது' : 'Produce Already Sold'}
            </span>
          )}
        </div>
      </div>

      <DisclaimerNotice />
    </div>
  );
};
