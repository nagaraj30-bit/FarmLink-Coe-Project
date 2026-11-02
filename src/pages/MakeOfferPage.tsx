import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useDemoUser } from '../hooks/useDemoUser';
import { fetchListingByIdAsync, createOfferAsync } from '../data/dataAccess';
import { ProduceListing } from '../types';
import { formatINR } from '../utils/formatters';
import { calculateNetReturn } from '../utils/calculations';
import { NetReturnBreakdown } from '../components/comparison/NetReturnBreakdown';
import { DisclaimerNotice } from '../components/common/DisclaimerNotice';
import {
  ArrowLeft,
  Send,
  Lock,
  Calculator,
  Info,
  Truck,
  Package,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export const MakeOfferPage: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { currentUser, isRealAuth } = useDemoUser();

  const [listing, setListing] = useState<ProduceListing | null>(null);
  const [isLoadingListing, setIsLoadingListing] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Offer fields
  const [quantity, setQuantity] = useState<number>(0);
  const [offeredPrice, setOfferedPrice] = useState<number>(0);
  const [transportCost, setTransportCost] = useState<number>(1500);
  const [packagingCost, setPackagingCost] = useState<number>(500);
  const [otherCosts, setOtherCosts] = useState<number>(0);
  const [paymentTerms, setPaymentTerms] = useState('Immediate UPI on vehicle loading');
  const [pickupLocation, setPickupLocation] = useState('Farm Gate Pickup (Buyer vehicle)');
  const [notes, setNotes] = useState('We bring crates and vehicle directly to your farm shed.');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const loadListing = () => {
    if (!listingId) return;
    let isMounted = true;
    setIsLoadingListing(true);
    setFetchError(null);

    fetchListingByIdAsync(listingId, Boolean(isRealAuth))
      .then((l) => {
        if (!isMounted) return;
        if (l) {
          setListing(l);
          setQuantity(l.quantity); // Default to full available quantity
          setOfferedPrice(l.expectedPricePerUnit);
          setPickupLocation(`Farm gate pickup in ${l.district}`);
        } else {
          setListing(null);
        }
        setIsLoadingListing(false);
      })
      .catch((err: any) => {
        if (!isMounted) return;
        console.error('Failed to fetch listing:', err);
        setFetchError(err?.message || 'Failed to load produce listing from database.');
        setIsLoadingListing(false);
      });

    return () => {
      isMounted = false;
    };
  };

  useEffect(() => {
    return loadListing();
  }, [listingId, isRealAuth]);

  if (isLoadingListing) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
        <h2 className="text-base font-bold text-slate-800">
          {language === 'ta' ? 'விளைபொருள் விவரம் ஏற்றப்படுகிறது...' : 'Loading produce lot details...'}
        </h2>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-6">
        <div className="bg-white rounded-3xl border border-rose-200 shadow-sm p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'ta' ? 'தரவுத்தள பிழை' : 'Database Connection Notice'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">{fetchError}</p>
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
                : `The requested produce listing with ID "${listingId}" does not exist or has been removed.`}
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

  if (listing.status === 'sold') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
            <Info className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {language === 'ta' ? 'இந்த விளைபொருள் விற்கப்பட்டுவிட்டது' : 'Produce Lot Already Sold'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {language === 'ta'
                ? `${listing.cropNameTa || listing.cropName} (${listing.variety}) தொகுதி ஏற்கனவே விற்கப்பட்டுவிட்டது. இனி புதிய சலுகைகளை ஏற்க முடியாது.`
                : `This produce lot for ${listing.cropName} (${listing.variety}) has already been sold to another buyer and is no longer accepting offers.`}
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-colors"
            >
              <span>{t('notFound.marketplace', 'Browse Active Marketplace Lots')}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Live calculation for preview
  const liveCalculation = calculateNetReturn(
    quantity,
    offeredPrice,
    transportCost,
    packagingCost,
    otherCosts,
    listing.unit
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError(null);
    const newErrors: Record<string, string> = {};

    if (!currentUser) {
      newErrors.auth =
        language === 'ta'
          ? 'விலை வாய்ப்பை சமர்ப்பிக்க தயவுசெய்து உள்நுழையவும் அல்லது வியாபாரி பாத்திரத்தை தேர்வு செய்யவும்.'
          : 'Please sign in or select a buyer profile to submit an offer.';
    } else if (currentUser.role !== 'buyer') {
      newErrors.auth =
        language === 'ta'
          ? 'வாங்குபவர் பாத்திரத்தில் உள்ளவர்கள் மட்டுமே சலுகைகளை சமர்ப்பிக்க முடியும்.'
          : 'Only registered produce buyers can submit purchase offers.';
    } else if (currentUser.id === listing.farmerId) {
      newErrors.auth =
        language === 'ta'
          ? 'விவசாயிகள் தங்கள் சொந்த விளைபொருளுக்கு விலை வாய்ப்பை அளிக்க முடியாது.'
          : 'Farmers cannot submit trade offers on their own produce listings.';
    }

    if (quantity <= 0) {
      newErrors.quantity = language === 'ta' ? 'அளவு பூஜ்ஜியத்தை விட அதிகமாக இருக்க வேண்டும்.' : 'Quantity must be greater than 0.';
    } else if (quantity > listing.quantity) {
      newErrors.quantity = language === 'ta'
        ? `அளவு கிடைக்கக்கூடிய சரக்கு ${listing.quantity} ${listing.unit} ஐ விட அதிகமாக இருக்க முடியாது.`
        : `Quantity cannot exceed available inventory of ${listing.quantity} ${listing.unit}.`;
    }

    if (offeredPrice <= 0) {
      newErrors.offeredPrice = language === 'ta'
        ? 'விலை பூஜ்ஜியத்தை விட அதிகமாக இருக்க வேண்டும்.'
        : 'Offered price must be greater than 0.';
    }

    if (!paymentTerms.trim()) {
      newErrors.paymentTerms = language === 'ta'
        ? 'கட்டண விதிமுறைகள் தேவை.'
        : 'Payment terms are required.';
    }

    if (!pickupLocation.trim()) {
      newErrors.pickupLocation = language === 'ta'
        ? 'ஏற்றிச்செல்லும் இடம் தேவை.'
        : 'Pickup location is required.';
    }

    if (transportCost < 0) {
      newErrors.transportCost = language === 'ta'
        ? 'போக்குவரத்து செலவு எதிர்மறையாக இருக்க முடியாது.'
        : 'Transport cost cannot be negative.';
    }
    if (packagingCost < 0) {
      newErrors.packagingCost = language === 'ta'
        ? 'பேக்கேஜிங் செலவு எதிர்மறையாக இருக்க முடியாது.'
        : 'Packaging cost cannot be negative.';
    }
    if (otherCosts < 0) {
      newErrors.otherCosts = language === 'ta'
        ? 'இதர செலவுகள் எதிர்மறையாக இருக்க முடியாது.'
        : 'Other costs cannot be negative.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      await createOfferAsync(
        {
          listingId: listing.id,
          buyerId: currentUser.id,
          buyerName: currentUser.name,
          buyerNameTa: currentUser.nameTa,
          buyerType: currentUser.businessType || 'Wholesale Buyer',
          buyerTypeTa: currentUser.businessTypeTa || 'மொத்த வியாபாரி',
          buyerPhone: currentUser.phone,
          quantity: Number(quantity),
          unit: listing.unit, // STRICTLY LOCKED & INHERITED!
          offeredPricePerUnit: Number(offeredPrice),
          transportCost: Number(transportCost),
          packagingCost: Number(packagingCost),
          otherCosts: Number(otherCosts),
          paymentTerms: paymentTerms.trim(),
          paymentTermsTa: paymentTerms.trim(),
          pickupLocation: pickupLocation.trim(),
          pickupLocationTa: pickupLocation.trim(),
          notes: notes.trim(),
          notesTa: notes.trim(),
        },
        Boolean(isRealAuth)
      );

      setSubmitted(true);
      setTimeout(() => {
        navigate(`/offers/${listing.id}`);
      }, 1200);
    } catch (err: any) {
      console.error('Failed to create offer:', err);
      setSubmitError(err?.message || 'Failed to submit offer to database. Please check connection and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('action.back', 'Back')}</span>
        </button>
      </div>

      {(!currentUser || currentUser.role === 'farmer') && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-center gap-2.5">
            <Info className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold">
                {!currentUser
                  ? (language === 'ta' ? 'உள்நுழையவில்லை:' : 'Sign In Required:')
                  : (language === 'ta' ? 'பயனர் பாத்திரம்:' : 'Role Notice:')}
              </span>{' '}
              <span>
                {!currentUser
                  ? t('auth.guestPrompt', 'You are currently browsing as Guest. Sign in to submit buyer offers.')
                  : t('auth.roleMismatchBuyer', 'You are currently logged in as a Farmer. Switch to a Buyer profile to submit purchase offers.')}
              </span>
            </div>
          </div>
          <Link
            to={!currentUser ? '/login' : '/roles'}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors shrink-0 text-center"
          >
            {!currentUser ? t('auth.signIn', 'Sign In') : (language === 'ta' ? 'வியாபாரி பாத்திரத்திற்கு மாறுக' : 'Switch to Buyer')}
          </Link>
        </div>
      )}

      {errors.auth && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errors.auth}</span>
        </div>
      )}

      {submitError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-900 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold block">
                {language === 'ta' ? 'சலுகை சமர்ப்பிப்பில் பிழை:' : 'Offer Submission Notice:'}
              </span>
              <span>{submitError}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSubmitError(null)}
            className="text-rose-500 hover:text-rose-700 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
              {language === 'ta' ? 'விலை வாய்ப்பு சமர்ப்பித்தல்' : 'Structured Offer Workflow'}
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              {language === 'ta'
                ? `${listing.cropNameTa} பயிருக்கு விலை சமர்ப்பிக்க`
                : `Submit Offer for ${listing.cropName}`}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'ta' ? 'விவசாயி:' : 'Farmer:'} {listing.farmerName} • {listing.district} •{' '}
              {listing.quantity} {listing.unit} {language === 'ta' ? 'இருப்பு உள்ளது' : 'available'}
            </p>
          </div>

          <div className="text-right bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-400 block">{t('term.expectedPrice', 'Target Price')}:</span>
            <span className="text-base font-black text-slate-900">
              {formatINR(listing.expectedPricePerUnit)} / {listing.unit}
            </span>
          </div>
        </div>
      </div>

      {submitted && (
        <div className="bg-emerald-600 text-white p-4 rounded-xl flex items-center gap-3 shadow-md">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">
            {language === 'ta'
              ? 'உங்கள் விலை வாய்ப்பு வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது! விவசாயி ஒப்பீட்டு பக்கத்திற்கு அழைத்துச் செல்லப்படுகிறது...'
              : 'Offer submitted successfully! Redirecting to farmer comparison view...'}
          </span>
        </div>
      )}

      {/* Main Grid: Form on Left, Live Net Return Calculation Preview on Right */}
      <div className="grid md:grid-cols-5 gap-8">
        {/* Left: Input Form (3 cols) */}
        <form onSubmit={handleSubmit} className="md:col-span-3 space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs text-xs sm:text-sm">
          {/* Quantity & Locked Unit */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>1. {language === 'ta' ? 'அளவு மற்றும் விலை' : 'Quantity & Unit Price'}</span>
              <span className="text-xs font-normal text-slate-500">
                {language === 'ta' ? 'இருப்பு வரம்பிற்குள் இருக்க வேண்டும்' : 'Within inventory limit'}
              </span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('term.quantity', 'Offered Quantity')} *
                </label>
                <input
                  type="number"
                  min="1"
                  max={listing.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
                <span className="text-[11px] text-slate-400 block mt-1">
                  Max: {listing.quantity} {listing.unit}
                </span>
                {errors.quantity && <p className="text-xs text-rose-600 mt-1">{errors.quantity}</p>}
              </div>

              {/* Locked Unit Display */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <span>{t('term.unit', 'Unit')}</span>
                  <Lock className="w-3 h-3 text-slate-400" />
                </label>
                <div className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-bold flex items-center justify-between cursor-not-allowed">
                  <span>{listing.unit}</span>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Locked</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  {language === 'ta' ? 'பட்டியலின் அதே அலகு' : 'Inherited from produce listing'}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('term.offeredPrice', 'Your Offered Price')} (₹ per {listing.unit}) *
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={offeredPrice}
                onChange={(e) => setOfferedPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-base"
              />
              {errors.offeredPrice && <p className="text-xs text-rose-600 mt-1">{errors.offeredPrice}</p>}
            </div>
          </div>

          {/* Logistics and Handling Costs Deductions */}
          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>2. {language === 'ta' ? 'போக்குவரத்து & பேக்கிங் செலவுகள்' : 'Transport & Selling Costs'}</span>
              <span className="text-[11px] font-normal text-emerald-700 font-mono">
                {language === 'ta' ? 'நிகர கணக்கீட்டிற்கு தேவை' : 'Crucial for net-return'}
              </span>
            </h3>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {language === 'ta'
                  ? 'விவசாயிக்கு இந்த செலவுகளை முன்கூட்டியே தெளிவாகக் குறிப்பிடுவது, உங்கள் வாய்ப்பின் உண்மையான நிகர லாபத்தை ஒப்பிட்டு ஏற்க உதவும்.'
                  : 'Entering realistic transport and packaging deductions allows the farmer to evaluate your net return accurately alongside competing bids.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('term.transportCost', 'Transportation Cost')} (₹)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={transportCost}
                  onChange={(e) => setTransportCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('term.packagingCost', 'Packaging Cost')} (₹)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={packagingCost}
                  onChange={(e) => setPackagingCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('term.otherCosts', 'Other Selling Costs / Handling Fees')} (₹)
              </label>
              <input
                type="number"
                min="0"
                value={otherCosts}
                onChange={(e) => setOtherCosts(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Payment & Logistics Terms */}
          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              3. {language === 'ta' ? 'பணம் செலுத்துதல் & வாகன நிபந்தனைகள்' : 'Settlement & Pickup Details'}
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {language === 'ta' ? 'பணம் செலுத்தும் முறை (Payment Terms)' : 'Payment Settlement Terms'}
              </label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. Immediate UPI / Cash on crate loading"
              />
              {errors.paymentTerms && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.paymentTerms}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {language === 'ta' ? 'ஏற்றிச் செல்லும் இடம் (Pickup Location)' : 'Pickup / Dispatch Location'}
              </label>
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. Farm gate pickup or Market yard gate"
              />
              {errors.pickupLocation && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.pickupLocation}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {language === 'ta' ? 'விவசாயிக்கான குறிப்பு (Notes to Farmer)' : 'Notes for Farmer'}
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{language === 'ta' ? 'சமர்ப்பிக்கப்படுகிறது...' : 'Submitting Offer to Database...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t('action.submit', 'Submit Structured Offer to Farmer')}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right: Live Calculation Preview (2 cols) */}
        <div className="md:col-span-2 space-y-4">
          <div className="sticky top-24 space-y-4">
            <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  {language === 'ta' ? 'நேரடி முன்னோட்டம்' : 'Live Farmer Net-Return Preview'}
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  {language === 'ta'
                    ? 'விவசாயி தன் திரையில் பார்க்கும் நிகர வருவாய் கணக்கீடு'
                    : 'This is the exact net-return breakdown the farmer will see.'}
                </p>
              </div>
            </div>

            <NetReturnBreakdown calculation={liveCalculation} highlightBest />

            <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 space-y-2">
              <div className="font-bold text-slate-800">
                {language === 'ta' ? 'விவசாயி முடிவு மாதிரி:' : 'Evaluation Formula Applied:'}
              </div>
              <div className="font-mono text-[11px] bg-slate-50 p-2 rounded text-slate-700">
                Estimated Net Return = (Qty × Unit Price) − Transport − Packaging − Other Costs
              </div>
            </div>
          </div>
        </div>
      </div>

      <DisclaimerNotice />
    </div>
  );
};
