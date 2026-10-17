import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useDemoUser } from '../hooks/useDemoUser';
import { fetchListingsAsync, fetchOffersForListingAsync } from '../data/dataAccess';
import { ProduceListing, Offer } from '../types';
import { formatINR, formatDateIN } from '../utils/formatters';
import { getSellingUrgency } from '../utils/calculations';
import { UrgencyBadge, StatusBadge } from '../components/common/Badge';
import { DisclaimerNotice } from '../components/common/DisclaimerNotice';
import { UnsoldProduceModal } from '../components/guidance/UnsoldProduceModal';
import { EditListingModal } from '../components/listings/EditListingModal';
import {
  Sprout,
  PlusCircle,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Inbox,
  Clock,
  Sparkles,
  HelpCircle,
  FileSpreadsheet,
  ChevronRight,
  CheckCircle2,
  User,
  Edit3,
  Loader2,
} from 'lucide-react';

export const FarmerDashboardPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { currentUser, isRealAuth } = useDemoUser();

  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [selectedCropForGuidance, setSelectedCropForGuidance] = useState<ProduceListing | null>(null);
  const [guidanceModalOpen, setGuidanceModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<ProduceListing | null>(null);
  const [offersMap, setOffersMap] = useState<Record<string, Offer[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadListings = () => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const farmerFilter = currentUser?.id ? { farmerId: currentUser.id } : undefined;
    fetchListingsAsync(farmerFilter, Boolean(isRealAuth))
      .then(async (data) => {
        if (!isMounted) return;
        setListings(data);

        // Fetch offers for each listing in parallel
        const newOffersMap: Record<string, Offer[]> = {};
        await Promise.all(
          data.map(async (l) => {
            try {
              const offers = await fetchOffersForListingAsync(l.id, Boolean(isRealAuth));
              newOffersMap[l.id] = offers;
            } catch (err) {
              console.warn(`Could not load offers for listing ${l.id}:`, err);
              newOffersMap[l.id] = [];
            }
          })
        );

        if (!isMounted) return;
        setOffersMap(newOffersMap);
        setIsLoading(false);
      })
      .catch((err: any) => {
        if (!isMounted) return;
        console.error('Failed to load farmer dashboard listings:', err);
        setError(err?.message || 'Failed to load listings from database.');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  };

  useEffect(() => {
    return loadListings();
  }, [currentUser?.id, isRealAuth]);

  // Derived metrics
  const activeListings = listings.filter((l) => l.status === 'active' || l.status === 'negotiating');
  const urgentListings = listings.filter((l) => l.sellWithinDays <= 1 && l.status !== 'sold');

  // Count pending offers across farmer listings using pre-fetched offersMap
  const totalOffersCount = listings.reduce((sum, item) => {
    const itemOffers = offersMap[item.id] || [];
    return sum + itemOffers.filter((o) => o.status === 'pending').length;
  }, 0);

  const openGuidance = (listing: ProduceListing) => {
    setSelectedCropForGuidance(listing);
    setGuidanceModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Role Mismatch Banner (if buyer viewing farmer dashboard) */}
      {currentUser && currentUser.role === 'buyer' && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold">
                {language === 'ta' ? 'வியாபாரி பயன்முறையில் உள்ளீர்கள்:' : 'Role Mismatch Notice:'}{' '}
              </span>
              <span>
                {t(
                  'auth.roleMismatchFarmer',
                  'You are currently logged in as a Buyer. Switch to a Farmer profile to manage listings.'
                )}
              </span>
            </div>
          </div>
          <Link
            to="/roles"
            className="px-3 py-1.5 rounded-lg bg-amber-700 text-white font-bold text-xs hover:bg-amber-800 transition-colors shrink-0 text-center"
          >
            {language === 'ta' ? 'விவசாயி பாத்திரத்திற்கு மாறுக' : 'Switch to Farmer'}
          </Link>
        </div>
      )}

      {/* Top Profile & Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl shadow-inner">
            {currentUser?.avatar || '👨‍🌾'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {currentUser ? (language === 'ta' ? currentUser.nameTa : currentUser.name) : (language === 'ta' ? 'விருந்தினர் விவசாயி' : 'Guest Farmer')}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                {currentUser ? (language === 'ta' ? (currentUser.role === 'farmer' ? 'விவசாயி' : 'கொள்முதல் வியாபாரி') : currentUser.role) : (language === 'ta' ? 'விருந்தினர்' : 'Guest')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser ? (
                <>📍 {language === 'ta' ? currentUser.locationTa : currentUser.location} • {currentUser.phone}</>
              ) : (
                <>{language === 'ta' ? 'முழு அணுகலுக்கு உள்நுழையவும் அல்லது டெமோ சுயவிவரத்தைத் தேர்ந்தெடுக்கவும்.' : 'Sign in or select a demo profile for full farmer access.'}</>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!currentUser ? (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-colors"
            >
              <span>{t('auth.signIn', 'Sign In')}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 text-slate-700 font-semibold text-xs shadow-2xs transition-colors"
              >
                <User className="w-4 h-4 text-emerald-700" />
                <span>{language === 'ta' ? 'சுயவிவரம் திருத்த' : 'Manage Profile'}</span>
              </Link>
              <Link
                to="/add-produce"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{language === 'ta' ? 'புதிய விளைபொருள் சேர்க்க' : 'Add New Produce'}</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="text-slate-500 text-xs font-semibold flex items-center justify-between">
            <span>{language === 'ta' ? 'செயலில் உள்ள விளைபொருட்கள்' : 'Active Produce'}</span>
            <Sprout className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{activeListings.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {listings.length} {language === 'ta' ? 'மொத்த பதிவுகள்' : 'total in catalogue'}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="text-slate-500 text-xs font-semibold flex items-center justify-between">
            <span>{language === 'ta' ? 'பரிசீலிக்க வேண்டிய வாய்ப்புகள்' : 'Pending Offers'}</span>
            <Inbox className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalOffersCount}</div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">
            {language === 'ta' ? 'ஒப்பீடு செய்ய தயார்' : 'Ready for net-return review'}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="text-slate-500 text-xs font-semibold flex items-center justify-between">
            <span>{language === 'ta' ? 'அவசர காலக்கெடு எச்சரிக்கை' : 'Urgent Deadlines'}</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">{urgentListings.length}</div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">
            {urgentListings.length > 0 ? (language === 'ta' ? '≤ 1 நாள் மட்டுமே உள்ளது' : '≤ 24h deadline left') : 'None'}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="text-slate-500 text-xs font-semibold flex items-center justify-between">
            <span>{language === 'ta' ? 'முடிவு ஆதரவு முறைமை' : 'Decision Mode'}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-sm font-bold text-emerald-800 mt-2.5">
            {language === 'ta' ? 'நிகர வருவாய் ஒப்பீடு' : 'Net-Return First'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {language === 'ta' ? 'செலவு பிடித்தங்கள் உட்பட்டது' : 'Deductions factored'}
          </div>
        </div>
      </div>

      {/* Urgent Alert Banner (if applicable) */}
      {urgentListings.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-200/80 text-rose-800 shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-rose-950">
                  {language === 'ta'
                    ? `${urgentListings.length} விளைபொருளுக்கு விற்பனை காலக்கெடு 24 மணி நேரத்திற்குள் முடிகிறது!`
                    : `${urgentListings.length} produce item(s) have reached high selling urgency (≤ 1 day)!`}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-rose-600 text-white rounded">
                  {language === 'ta' ? 'கவனம்' : 'Action Required'}
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-0.5">
                {language === 'ta'
                  ? 'வந்திருக்கும் வாய்ப்புகளின் நிகர வருவாயை ஒப்பிட்டு உடனே ஏற்கவும் அல்லது விற்கப்படாத விளைபொருள் வழிகாட்டலைப் பார்க்கவும்.'
                  : 'Compare received buyer offers by take-home net return now, or view unsold produce guidance for cold storage / processing options.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openGuidance(urgentListings[0])}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 text-xs font-bold transition-colors"
            >
              {language === 'ta' ? 'வழிகாட்டல் பார்க்க' : 'View Unsold Options'}
            </button>
            <Link
              to={`/offers/${urgentListings[0].id}`}
              className="px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-colors shadow-2xs"
            >
              {language === 'ta' ? 'வாய்ப்புகளை ஒப்பிடுக' : 'Compare Offers'}
            </Link>
          </div>
        </div>
      )}

      {/* Produce Listings Inventory */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {language === 'ta' ? 'உங்கள் விளைபொருட்கள் & விலை வாய்ப்புகள்' : 'Your Produce Listings & Offers'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'ta'
                ? 'வாங்குபவர் வாய்ப்புகளை கையில் கிடைக்கும் நிகர தொகையுடன் ஒப்பிடுங்கள்'
                : 'Evaluate each listing and compare buyer offers by estimated net take-home return.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/my-listings"
              className="text-xs font-semibold text-slate-600 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>{language === 'ta' ? 'அனைத்து இருப்பு' : 'View All'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/add-produce"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>+ {language === 'ta' ? 'புதிய பதிவு' : 'New Listing'}</span>
            </Link>
          </div>
        </div>

        {/* Database Error Banner */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-rose-950">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <h3 className="font-bold text-xs sm:text-sm">
                  {language === 'ta' ? 'விளைபொருள் விவரங்களை ஏற்றுவதில் பிழை' : 'Database Connection Notice'}
                </h3>
                <p className="text-xs text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={loadListings}
              className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shrink-0 transition-colors"
            >
              {language === 'ta' ? 'மீண்டும் முயற்சிக்க' : 'Retry'}
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">
              {language === 'ta' ? 'விளைபொருட்கள் மற்றும் வாய்ப்புகள் ஏற்றப்படுகின்றன...' : 'Loading farmer listings and offer pipelines...'}
            </p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
            <Sprout className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">
              {language === 'ta' ? 'விளைபொருட்கள் எதுவும் பதிவு செய்யப்படவில்லை' : 'No produce listings found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {language === 'ta'
                ? 'உங்கள் விளைபொருளை பதிவு செய்து வாங்குபவர்களின் விலையை ஒப்பிடத் தொடங்குங்கள்.'
                : 'Add your first harvest listing with expected price and selling deadline.'}
            </p>
            <Link
              to="/add-produce"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{language === 'ta' ? 'விளைபொருள் சேர்க்க' : 'Add Produce'}</span>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {listings.map((item) => {
              const urgency = getSellingUrgency(item.sellWithinDays);
              const offers = offersMap[item.id] || [];
              const pendingOffers = offers.filter((o) => o.status === 'pending');
              const acceptedOffer = offers.find((o) => o.status === 'accepted');

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border p-5 transition-all shadow-2xs hover:shadow-sm space-y-4 ${
                    item.status === 'sold'
                      ? 'border-slate-200 bg-slate-50/50 opacity-90'
                      : urgency.level === 'high'
                      ? 'border-rose-300 ring-1 ring-rose-200'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Top Header of card */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-slate-900">
                          {language === 'ta' ? item.cropNameTa : item.cropName}
                        </h3>
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {language === 'ta' ? item.varietyTa : item.variety} •{' '}
                        <span className="font-semibold text-slate-800">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    </div>
                    <UrgencyBadge level={urgency.level} daysRemaining={item.sellWithinDays} />
                  </div>

                  {/* Pricing and details grid */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 text-xs">
                    <div>
                      <span className="text-slate-400 block">{t('term.expectedPrice', 'Expected Price')}:</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {formatINR(item.expectedPricePerUnit)} / {item.unit}
                      </span>
                    </div>

                    {item.mandiBenchmarkPrice && (
                      <div>
                        <span className="text-slate-400 block">{t('term.mandiBenchmark', 'Mandi Benchmark')}:</span>
                        <span className="font-bold text-emerald-800">
                          {formatINR(item.mandiBenchmarkPrice)} / {item.unit}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate" title={item.benchmarkSource}>
                          {item.benchmarkSource}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Harvest & storage condition transparency */}
                  <div className="text-[11px] text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('term.harvestDate', 'Harvest Date')}:</span>
                      <span>{formatDateIN(item.harvestingDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('term.storageCondition', 'Storage')}:</span>
                      <span className="font-medium text-slate-700 truncate max-w-[200px]" title={item.storageCondition}>
                        {language === 'ta' ? item.storageConditionTa : item.storageCondition}
                      </span>
                    </div>
                  </div>

                  {/* Offers Status & Action Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="text-xs">
                      {item.status === 'sold' && acceptedOffer ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {language === 'ta'
                            ? `விற்கப்பட்டது (${acceptedOffer.buyerName})`
                            : `Sold to ${acceptedOffer.buyerName}`}
                        </span>
                      ) : (
                        <span>
                          <strong className="text-slate-900 font-bold">{offers.length}</strong>{' '}
                          {language === 'ta' ? 'வாய்ப்புகள் வந்துள்ளன' : 'offer(s) received'}
                          {pendingOffers.length > 0 && (
                            <span className="ml-1 px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                              {pendingOffers.length} {language === 'ta' ? 'புதியது' : 'new'}
                            </span>
                          )}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openGuidance(item)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors"
                        title={language === 'ta' ? 'விற்கப்படாத விளைபொருள் வழிகாட்டல்' : 'Unsold Produce Options'}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit button for active unsold lots owned by current farmer */}
                      {item.status !== 'sold' && (item.farmerId && item.farmerId === currentUser?.id) && (
                        <button
                          type="button"
                          onClick={() => setEditingListing(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-300 hover:border-emerald-600 hover:text-emerald-700 text-slate-700 text-xs font-bold transition-colors bg-white shadow-2xs"
                          title={language === 'ta' ? 'விளைபொருள் விவரங்களை திருத்தவும்' : 'Edit Listing Parameters'}
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                          <span>{language === 'ta' ? 'திருத்து' : 'Edit'}</span>
                        </button>
                      )}

                      <Link
                        to={`/offers/${item.id}`}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors shadow-2xs ${
                          pendingOffers.length > 0
                            ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        <span>{language === 'ta' ? 'வாய்ப்புகளை ஒப்பிடுக' : 'Compare Offers'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mandatory Disclaimer footer */}
      <DisclaimerNotice />

      {/* Edit Listing Modal */}
      <EditListingModal
        listing={editingListing}
        isOpen={Boolean(editingListing)}
        onClose={() => setEditingListing(null)}
        onSave={() => loadListings()}
      />

      {/* Unsold Produce Guidance Modal */}
      {selectedCropForGuidance && (
        <UnsoldProduceModal
          isOpen={guidanceModalOpen}
          onClose={() => setGuidanceModalOpen(false)}
          cropName={language === 'ta' ? selectedCropForGuidance.cropNameTa : selectedCropForGuidance.cropName}
          urgencyLevel={getSellingUrgency(selectedCropForGuidance.sellWithinDays).level}
        />
      )}
    </div>
  );
};
