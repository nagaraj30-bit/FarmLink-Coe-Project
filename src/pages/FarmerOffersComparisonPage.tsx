import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useDemoUser } from '../hooks/useDemoUser';
import {
  fetchListingByIdAsync,
  fetchOffersForListingAsync,
  acceptOfferAsync,
  declineOfferAsync,
} from '../data/dataAccess';
import { ProduceListing, Offer } from '../types';
import { formatINR, formatDateIN } from '../utils/formatters';
import { rankOffers, RankedOffer, getSellingUrgency } from '../utils/calculations';
import { UrgencyBadge, StatusBadge, BestReturnBadge } from '../components/common/Badge';
import { DisclaimerNotice } from '../components/common/DisclaimerNotice';
import { NetReturnBreakdown } from '../components/comparison/NetReturnBreakdown';
import { UnsoldProduceModal } from '../components/guidance/UnsoldProduceModal';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  Clock,
  MapPin,
  Building,
  Scale,
  Sparkles,
  Info,
  Check,
  X,
  XCircle,
  ShieldAlert,
  Loader2,
} from 'lucide-react';

export const FarmerOffersComparisonPage: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { currentUser, isFarmer, isRealAuth } = useDemoUser();

  const [listing, setListing] = useState<ProduceListing | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [rankedOffers, setRankedOffers] = useState<RankedOffer[]>([]);
  const [guidanceOpen, setGuidanceOpen] = useState(false);
  const [acceptingOfferId, setAcceptingOfferId] = useState<string | null>(null);
  const [decliningOffer, setDecliningOffer] = useState<Offer | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);

  const loadData = () => {
    if (!listingId) return;
    let isMounted = true;
    setIsLoading(true);
    setErrorMessage(null);

    Promise.all([
      fetchListingByIdAsync(listingId, Boolean(isRealAuth)),
      fetchOffersForListingAsync(listingId, Boolean(isRealAuth)),
    ])
      .then(([l, rawOffers]) => {
        if (!isMounted) return;
        if (l) {
          setListing(l);
          setOffers(rawOffers);
          setRankedOffers(rankOffers(rawOffers, l));
        } else {
          setListing(null);
        }
        setIsLoading(false);
      })
      .catch((err: any) => {
        if (!isMounted) return;
        console.error('Failed to load listing or offers:', err);
        setErrorMessage(err?.message || 'Failed to load offers from database.');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  };

  useEffect(() => {
    return loadData();
  }, [listingId, isRealAuth]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
        <h2 className="text-base font-bold text-slate-800">
          {language === 'ta' ? 'விலை வாய்ப்புகள் ஒப்பீடு ஏற்றப்படுகிறது...' : 'Loading offers comparison...'}
        </h2>
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
              to="/farmer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-colors"
            >
              <span>{language === 'ta' ? 'டாஷ்போர்டுக்கு திரும்புக' : 'Return to Farmer Dashboard'}</span>
            </Link>
            <Link
              to="/marketplace"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
            >
              <span>{t('notFound.marketplace', 'Browse Marketplace')}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = Boolean(
    currentUser &&
    currentUser.role === 'farmer' &&
    listing.farmerId &&
    listing.farmerId === currentUser.id
  );

  // Strictly enforce listing ownership before displaying private buyer offers
  if (!isOwner) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {t('guard.ownershipTitle', 'Private Listing Access Restricted')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {t(
                'guard.ownershipDesc',
                'You do not have permission to view or manage offers for another farmer’s produce lot. Only the listing farmer can review private offers.'
              )}
            </p>
            <div className="text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2">
              {language === 'ta'
                ? `இந்த பட்டியல் விவசாயி "${listing.farmerName}" அவர்களுக்கு சொந்தமானது.`
                : `This listing is owned by farmer "${listing.farmerName}".`}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/my-listings"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-colors"
            >
              <span>{language === 'ta' ? 'எனது விளைபொருட்கள்' : 'My Listings'}</span>
            </Link>
            <Link
              to="/farmer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
            >
              <span>{t('notFound.dashboard', 'Farmer Dashboard')}</span>
            </Link>
          </div>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('action.back', 'Go Back')}</span>
          </button>
        </div>
      </div>
    );
  }

  const urgency = getSellingUrgency(listing.sellWithinDays);
  const bestOffer = rankedOffers.find((r) => r.isBestReturn);
  const acceptedOffer = offers.find((o) => o.status === 'accepted');

  const handleConfirmAccept = async (offerId: string) => {
    if (!isOwner) {
      setErrorMessage(t('offer.declineErrorOwner', 'Only the farmer who listed this produce can accept or decline offers.'));
      setAcceptingOfferId(null);
      return;
    }

    setIsProcessingAction(true);
    setErrorMessage(null);
    try {
      const res = await acceptOfferAsync(offerId, listing.id, Boolean(isRealAuth));
      if (res) {
        setSuccessMessage(
          language === 'ta'
            ? `வாங்குபவர் ${res.acceptedOffer.buyerName} அவர்களின் விலை ஏற்கப்பட்டது! விற்பனை நிறைவடைந்தது.`
            : `Offer from ${res.acceptedOffer.buyerName} accepted successfully! Produce marked as Sold.`
        );
        setAcceptingOfferId(null);

        // Refresh data asynchronously
        const [updatedListing, updatedOffers] = await Promise.all([
          fetchListingByIdAsync(listing.id, Boolean(isRealAuth)),
          fetchOffersForListingAsync(listing.id, Boolean(isRealAuth)),
        ]);
        if (updatedListing) setListing(updatedListing);
        setOffers(updatedOffers);
        setRankedOffers(rankOffers(updatedOffers, updatedListing || listing));
      }
    } catch (err: any) {
      console.error('Failed to accept offer:', err);
      setErrorMessage(err?.message || 'Failed to accept offer in database. Please check your permissions and try again.');
      setAcceptingOfferId(null);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleConfirmDecline = async (offerId: string) => {
    if (!isOwner) {
      setErrorMessage(t('offer.declineErrorOwner', 'Only the farmer who listed this produce can accept or decline offers.'));
      setDecliningOffer(null);
      return;
    }

    const targetOffer = offers.find((o) => o.id === offerId);
    if (!targetOffer || targetOffer.status !== 'pending') {
      setErrorMessage(t('offer.declineErrorAlreadyDecided', 'This offer has already been accepted or declined and cannot be changed.'));
      setDecliningOffer(null);
      return;
    }

    setIsProcessingAction(true);
    setErrorMessage(null);
    try {
      const updated = await declineOfferAsync(offerId, listing.id, Boolean(isRealAuth));
      if (updated) {
        setSuccessMessage(
          language === 'ta'
            ? `வாங்குபவர் ${updated.buyerName} அவர்களின் சலுகை நிராகரிக்கப்பட்டது.`
            : `Offer from ${updated.buyerName} was declined.`
        );
        setDecliningOffer(null);

        // Refresh data asynchronously and re-rank offers
        const [updatedListing, updatedOffers] = await Promise.all([
          fetchListingByIdAsync(listing.id, Boolean(isRealAuth)),
          fetchOffersForListingAsync(listing.id, Boolean(isRealAuth)),
        ]);
        if (updatedListing) setListing(updatedListing);
        setOffers(updatedOffers);
        setRankedOffers(rankOffers(updatedOffers, updatedListing || listing));
      } else {
        setErrorMessage('Failed to update offer status.');
        setDecliningOffer(null);
      }
    } catch (err: any) {
      console.error('Failed to decline offer:', err);
      setErrorMessage(err?.message || 'Failed to decline offer in database.');
      setDecliningOffer(null);
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/farmer')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('action.back', 'Back to Dashboard')}</span>
        </button>

        <button
          onClick={() => setGuidanceOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
        >
          <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
          <span>{language === 'ta' ? 'விற்கப்படாத விளைபொருள் வழிகாட்டல்' : 'Unsold Produce Options'}</span>
        </button>
      </div>

      {/* Produce Listing Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold font-mono text-emerald-700 uppercase tracking-wider">
                {language === 'ta' ? 'விளைபொருள் விவரம்' : 'Produce Listing'}
              </span>
              <StatusBadge status={listing.status} />
              <UrgencyBadge level={urgency.level} daysRemaining={listing.sellWithinDays} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              {language === 'ta' ? listing.cropNameTa : listing.cropName}
            </h1>
            <p className="text-xs text-slate-500">
              {language === 'ta' ? listing.varietyTa : listing.variety} • {listing.district} •{' '}
              {language === 'ta' ? 'அறுவடை தேதி:' : 'Harvested:'} {formatDateIN(listing.harvestingDate)}
              {listing.farmerName && (
                <span className="ml-1 text-slate-600">
                  • {language === 'ta' ? 'உரிமையாளர்:' : 'Farmer:'} {listing.farmerName}
                </span>
              )}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-right shrink-0">
            <span className="text-xs text-slate-400 block">{language === 'ta' ? 'விற்பனை இருப்பு' : 'Inventory'}:</span>
            <span className="text-xl font-black text-slate-900">
              {listing.quantity} {listing.unit}
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              {language === 'ta' ? 'எதிர்பார்க்கும் விலை' : 'Expected'}: {formatINR(listing.expectedPricePerUnit)}/{listing.unit}
            </span>
            {listing.minAcceptablePricePerUnit > 0 && (
              <span className="text-[10px] text-slate-400 block">
                {language === 'ta' ? 'குறைந்தபட்ச விலை' : 'Floor'}: {formatINR(listing.minAcceptablePricePerUnit)}/{listing.unit}
              </span>
            )}
          </div>
        </div>

        {/* Mandi Benchmark context */}
        {listing.mandiBenchmarkPrice && (
          <div className="flex items-center justify-between text-xs bg-emerald-50/70 text-emerald-900 px-3.5 py-2 rounded-lg border border-emerald-200">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-700" />
              <span>
                <strong>{t('term.mandiBenchmark', 'Mandi Benchmark')}:</strong>{' '}
                {formatINR(listing.mandiBenchmarkPrice)} / {listing.unit} ({listing.benchmarkSource},{' '}
                {formatDateIN(listing.benchmarkDate || '')})
              </span>
            </div>
            <span className="text-[10px] text-emerald-700 hidden sm:inline">
              {language === 'ta' ? 'குறிப்பு மட்டுமே, உத்தரவாதம் அல்ல' : 'Reference only'}
            </span>
          </div>
        )}

        {/* Ownership Notice if not current owner */}
        {!isOwner && (
          <div className="flex items-center gap-2 text-xs bg-amber-50 text-amber-900 px-3.5 py-2.5 rounded-xl border border-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              {language === 'ta'
                ? `பார்வையாளர் பயன்முறை: நீங்கள் இந்த பட்டியலின் உரிமையாளர் அல்ல. (${listing.farmerName} மட்டுமே சலுகைகளை ஏற்கவோ நிராகரிக்கவோ முடியும்).`
                : `Read-only mode: You are signed in as a different user. Only ${listing.farmerName} can accept or decline offers.`}
            </span>
          </div>
        )}
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="bg-emerald-600 text-white p-4 rounded-xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-100 hover:text-white text-xs font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Notification Banner */}
      {errorMessage && (
        <div className="bg-rose-600 text-white p-4 rounded-xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-100 hover:text-white text-xs font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Educational Comparison Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              {language === 'ta' ? 'வாங்குபவர் வாய்ப்புகள் (நிகர வருவாய் வரிசை)' : 'Buyer Offers Ranked by Estimated Net Return'}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {language === 'ta'
                ? 'அதிக அலகு விலையை விட, போக்குவரத்து மற்றும் பேக்கிங் செலவுகள் போக கையில் கிடைக்கும் நிகர தொகையே முதன்மையானது.'
                : 'Offers are strictly ordered by take-home income after transportation and packaging deductions.'}
            </p>
          </div>
          <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
            {rankedOffers.length} {language === 'ta' ? 'வாய்ப்புகள்' : 'Offer(s)'}
          </span>
        </div>
      </div>

      {/* Ranked Offers Showcase */}
      {rankedOffers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            {language === 'ta' ? 'இன்னும் விலை வாய்ப்புகள் வரவில்லை' : 'No buyer offers received yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {language === 'ta'
              ? 'உங்கள் விளைபொருள் சந்தையில் பட்டியலிடப்பட்டுள்ளது. காலக்கெடு நெருங்கினால் விற்கப்படாத விளைபொருள் வழிகாட்டலைப் பார்க்கவும்.'
              : 'Your produce is listed on the marketplace. If selling urgency rises, explore cold storage and secondary processing.'}
          </p>
          <button
            onClick={() => setGuidanceOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs"
          >
            {language === 'ta' ? 'மாற்று வழிகளை ஆராய்க' : 'View Unsold Produce Options'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {rankedOffers.map(({ offer, calculation, isBestReturn, rank }) => {
            const isAccepted = offer.status === 'accepted';
            const isDeclined = offer.status === 'declined';
            const isPending = offer.status === 'pending';

            return (
              <div
                key={offer.id}
                className={`bg-white rounded-2xl border transition-all p-5 sm:p-6 space-y-4 ${
                  isAccepted
                    ? 'border-emerald-500 ring-2 ring-emerald-300 bg-emerald-50/20'
                    : isDeclined
                    ? 'border-slate-200 bg-slate-50/60 opacity-80'
                    : isBestReturn && listing.status !== 'sold'
                    ? 'border-amber-400 ring-2 ring-amber-200 shadow-md'
                    : 'border-slate-200 shadow-2xs'
                }`}
              >
                {/* Header of offer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                        isDeclined
                          ? 'bg-slate-200 text-slate-500 line-through'
                          : isBestReturn && listing.status !== 'sold'
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      #{rank}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-bold text-base ${isDeclined ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                          {language === 'ta' ? offer.buyerNameTa : offer.buyerName}
                        </h3>
                        <span className="text-xs text-slate-500 font-medium">({offer.buyerType})</span>
                        <StatusBadge status={offer.status} />
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>
                          {language === 'ta' ? offer.pickupLocationTa : offer.pickupLocation} • {offer.buyerPhone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {isBestReturn && listing.status !== 'sold' && !isDeclined && <BestReturnBadge />}
                    {isDeclined && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        <XCircle className="w-3 h-3 text-slate-400" />
                        {language === 'ta' ? 'நிராகரிக்கப்பட்டது' : 'Offer Declined'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Offer terms and breakdown grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left: Notes & Conditions */}
                  <div className="space-y-3 text-xs text-slate-700">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                        {language === 'ta' ? 'வாங்குபவர் நிபந்தனைகள்' : 'Buyer Proposal Terms'}
                      </div>
                      <div>
                        <strong>{t('term.offeredPrice', 'Offered Price')}:</strong>{' '}
                        <span className="font-black text-slate-900 text-sm">
                          {formatINR(offer.offeredPricePerUnit)} / {offer.unit}
                        </span>
                      </div>
                      <div>
                        <strong>{language === 'ta' ? 'பணம் செலுத்தும் முறை:' : 'Payment Terms:'}</strong>{' '}
                        <span>{language === 'ta' ? offer.paymentTermsTa : offer.paymentTerms}</span>
                      </div>
                      <div>
                        <strong>{language === 'ta' ? 'குறிப்புகள்:' : 'Buyer Note:'}</strong>{' '}
                        <span className="italic">"{language === 'ta' && offer.notesTa ? offer.notesTa : offer.notes}"</span>
                      </div>
                    </div>

                    {/* Comparative insight note */}
                    {isBestReturn && listing.status !== 'sold' && !isDeclined && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-2">
                        <Award className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div className="text-[11px] leading-relaxed">
                          <strong>{language === 'ta' ? 'ஏன் இந்த வாய்ப்பு சிறந்தது?' : 'Why is this ranked #1?'}</strong>{' '}
                          {language === 'ta'
                            ? 'குறைந்த போக்குவரத்து மற்றும் பேக்கிங் பிடித்தங்கள் காரணமாக, இது விவசாயியின் கையில் அதிகபட்ச நிகர தொகையை ஒப்படைக்கிறது.'
                            : 'After accounting for logistical freight and packaging requirements, this offer yields the highest net cash take-home.'}
                        </div>
                      </div>
                    )}

                    {isDeclined && (
                      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center gap-2 text-xs">
                        <Info className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>
                          {language === 'ta'
                            ? 'இந்த சலுகை விவசாயியால் நிராகரிக்கப்பட்டது. இது பரிசீலனையில் இல்லை.'
                            : 'This offer was declined by the farmer and is no longer being considered.'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: Step-by-step net return card */}
                  <div>
                    <NetReturnBreakdown calculation={calculation} highlightBest={isBestReturn && listing.status !== 'sold' && !isDeclined} />
                  </div>
                </div>

                {/* Action Row */}
                {listing.status !== 'sold' && (
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500">
                      {isPending
                        ? language === 'ta'
                          ? 'சலுகையை ஏற்கலாம் அல்லது தனிப்பட்ட முறையில் நிராகரிக்கலாம்.'
                          : 'You can accept this offer, or individually decline it if terms are unacceptable.'
                        : isDeclined
                        ? language === 'ta'
                          ? 'நிராகரிக்கப்பட்ட சலுகை. எந்த நடவடிக்கையும் தேவையில்லை.'
                          : 'Declined offer. No further actions permitted.'
                        : language === 'ta'
                        ? 'ஏற்றுக்கொள்ளப்பட்ட சலுகை.'
                        : 'Accepted offer.'}
                    </span>

                    {/* Only show decision buttons if pending */}
                    {isPending ? (
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {/* Decline button */}
                        <button
                          type="button"
                          disabled={!isOwner}
                          onClick={() => setDecliningOffer(offer)}
                          title={!isOwner ? t('offer.declineErrorOwner') : undefined}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition-colors border ${
                            isOwner
                              ? 'border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300'
                              : 'border-slate-200 text-slate-400 cursor-not-allowed bg-slate-50'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>{t('action.declineOffer', 'Decline')}</span>
                        </button>

                        {/* Accept button */}
                        <button
                          type="button"
                          disabled={!isOwner}
                          onClick={() => setAcceptingOfferId(offer.id)}
                          title={!isOwner ? t('offer.declineErrorOwner') : undefined}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-colors shadow-xs ${
                            !isOwner
                              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                              : isBestReturn
                              ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                          <span>{t('action.acceptOffer', 'Accept Offer')}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs font-semibold text-slate-500">
                        {isDeclined ? (
                          <span className="text-rose-600">✕ {language === 'ta' ? 'நிராகரிக்கப்பட்டது' : 'Declined'}</span>
                        ) : isAccepted ? (
                          <span className="text-emerald-700 font-bold">✓ {language === 'ta' ? 'ஏற்றுக்கொள்ளப்பட்டது' : 'Accepted'}</span>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Mandatory Disclaimer footer */}
      <DisclaimerNotice />

      {/* Confirmation Modal for Offer Decline */}
      {decliningOffer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6 text-rose-600" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">
                {t('offer.declineConfirmTitle', 'Decline Buyer Offer?')}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'ta'
                  ? `வாங்குபவர் ${decliningOffer.buyerName} அவர்களின் ${formatINR(decliningOffer.offeredPricePerUnit)}/${decliningOffer.unit} சலுகையை நிராகரிக்க விரும்புகிறீர்களா?`
                  : `Are you sure you want to decline the offer from ${decliningOffer.buyerName} (${formatINR(decliningOffer.offeredPricePerUnit)} / ${decliningOffer.unit})?`}
              </p>
              <p className="text-[11px] text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-100">
                {t(
                  'offer.declineConfirmDesc',
                  'This offer will be marked as declined and will no longer count towards your best net-return recommendations. Other pending offers will remain unaffected.'
                )}
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                disabled={isProcessingAction}
                onClick={() => setDecliningOffer(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 disabled:opacity-50"
              >
                {t('action.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                disabled={isProcessingAction}
                onClick={() => handleConfirmDecline(decliningOffer.id)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isProcessingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{language === 'ta' ? 'ஆம், நிராகரி' : 'Yes, Decline Offer'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Offer Acceptance */}
      {acceptingOfferId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                {language === 'ta' ? 'இந்த வாய்ப்பை ஏற்க விரும்புகிறீர்களா?' : 'Confirm Offer Acceptance'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'ta'
                  ? 'இந்த முடிவை ஏற்றுக்கொண்டால், விளைபொருள் "விற்கப்பட்டது" என மாறும் மற்றும் மற்ற நிலுவை வாய்ப்புகள் தானாக ரத்தாகும்.'
                  : 'Once accepted, the listing status will become "Sold" and remaining pending offers will be declined.'}
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                disabled={isProcessingAction}
                onClick={() => setAcceptingOfferId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 disabled:opacity-50"
              >
                {t('action.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                disabled={isProcessingAction}
                onClick={() => handleConfirmAccept(acceptingOfferId)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isProcessingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{language === 'ta' ? 'ஆம், ஏற்றுக்கொள்' : 'Yes, Accept Offer'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsold Guidance Modal */}
      <UnsoldProduceModal
        isOpen={guidanceOpen}
        onClose={() => setGuidanceOpen(false)}
        cropName={language === 'ta' ? listing.cropNameTa : listing.cropName}
        urgencyLevel={urgency.level}
      />
    </div>
  );
};
