import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useDemoUser } from '../hooks/useDemoUser';
import { fetchOffersByBuyerAsync, fetchListingByIdAsync } from '../data/dataAccess';
import { Offer, ProduceListing, OfferStatus } from '../types';
import { formatINR, formatDateIN } from '../utils/formatters';
import { calculateNetReturn } from '../utils/calculations';
import { StatusBadge } from '../components/common/Badge';
import { DisclaimerNotice } from '../components/common/DisclaimerNotice';
import { EmptyState } from '../components/common/EmptyState';
import {
  ShoppingBag,
  Store,
  MapPin,
  Clock,
  ArrowRight,
  Truck,
  Package,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Loader2,
} from 'lucide-react';

export const BuyerOffersPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { currentUser, isBuyer, isGuest, switchUser, isRealAuth } = useDemoUser();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | OfferStatus>('all');
  const [listingsMap, setListingsMap] = useState<Record<string, ProduceListing>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadBuyerOffers = () => {
    if (!currentUser?.id || !isBuyer) {
      setOffers([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetchOffersByBuyerAsync(currentUser.id, Boolean(isRealAuth))
      .then(async (myOffers) => {
        if (!isMounted) return;
        setOffers(myOffers);

        // Fetch listing details for each unique listing in parallel
        const uniqueListingIds = Array.from(new Set(myOffers.map((o) => o.listingId)));
        const newMap: Record<string, ProduceListing> = {};
        await Promise.all(
          uniqueListingIds.map(async (lid) => {
            try {
              const l = await fetchListingByIdAsync(lid, Boolean(isRealAuth));
              if (l) newMap[lid] = l;
            } catch (err) {
              console.warn(`Could not load listing ${lid} for buyer offer:`, err);
            }
          })
        );

        if (!isMounted) return;
        setListingsMap(newMap);
        setIsLoading(false);
      })
      .catch((err: any) => {
        if (!isMounted) return;
        console.error('Failed to load buyer offers:', err);
        setError(err?.message || 'Failed to load offers from database.');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  };

  useEffect(() => {
    return loadBuyerOffers();
  }, [currentUser?.id, isBuyer, isRealAuth]);

  // Handle guest state
  if (isGuest || !currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          {language === 'ta' ? 'கொள்முதல் சலுகைகளைக் காண உள்நுழையவும்' : 'Sign In to View Submitted Offers'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          {language === 'ta'
            ? 'நீங்கள் விருந்தினராக உள்ளீர்கள். நீங்கள் சமர்ப்பித்த கொள்முதல் வாய்ப்புகள் மற்றும் நிலைகளை அறிய வியாபாரி கணக்கில் நுழையவும்.'
            : 'Track your structured price bids, freight deductions, and seller acceptance by logging in as a buyer or choosing a verified demo persona.'}
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors shadow-sm"
          >
            {t('auth.signIn', 'Sign In')}
          </Link>
          <button
            onClick={() => {
              switchUser('buyer-1');
            }}
            className="px-5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 font-bold text-xs hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            {language === 'ta' ? 'பிரியா ஹோல்சேல் (டெமோ)' : 'Quick Demo: Priya Wholesale'}
          </button>
        </div>
      </div>
    );
  }

  // Handle Farmer Role Mismatch
  if (currentUser.role === 'farmer') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h2 className="font-bold text-amber-950 text-base">
                {language === 'ta' ? 'விவசாயி பயன்முறை அறிவிப்பு' : 'Buyer Profile Required'}
              </h2>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                {t(
                  'buyerOffers.roleMismatchNotice',
                  'You are currently in Farmer mode. This page tracks purchase offers submitted by wholesale produce buyers.'
                )}
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-amber-200">
            <span className="text-xs text-amber-800 font-medium">
              {language === 'ta' ? 'கொள்முதல் வியாபாரி பாத்திரத்திற்கு மாறவும்:' : 'Switch to demo buyer persona:'}
            </span>
            <button
              onClick={() => {
                switchUser('buyer-1');
              }}
              className="px-4 py-2 rounded-xl bg-amber-700 text-white font-bold text-xs hover:bg-amber-800 transition-colors cursor-pointer"
            >
              Priya Wholesale Traders (Madurai)
            </button>
            <button
              onClick={() => {
                switchUser('buyer-2');
              }}
              className="px-4 py-2 rounded-xl bg-amber-800 text-white font-bold text-xs hover:bg-amber-900 transition-colors cursor-pointer"
            >
              Kavitha Agro Foods (Trichy)
            </button>
            <Link
              to="/roles"
              className="px-4 py-2 rounded-xl border border-amber-400 text-amber-900 font-semibold text-xs hover:bg-amber-100 transition-colors"
            >
              {language === 'ta' ? 'அனைத்து பாத்திரங்கள்' : 'All Personas'}
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/farmer"
            className="text-xs font-semibold text-emerald-800 hover:underline"
          >
            ← {language === 'ta' ? 'விவசாயி டாஷ்போர்டுக்கு திரும்பவும்' : 'Return to Farmer Dashboard'}
          </Link>
        </div>
      </div>
    );
  }

  // Filter offers by status
  const filteredOffers = offers.filter((o) => {
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  const counts = {
    all: offers.length,
    pending: offers.filter((o) => o.status === 'pending').length,
    accepted: offers.filter((o) => o.status === 'accepted').length,
    declined: offers.filter((o) => o.status === 'declined').length,
  };

  const totalCommittedValue = offers.reduce(
    (sum, o) => sum + o.quantity * o.offeredPricePerUnit,
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <ShoppingBag className="w-4 h-4" />
            <span>{t('buyerOffers.badge', 'Procurement Pipeline')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-1 tracking-tight">
            {t('buyerOffers.title', 'My Submitted Purchase Offers')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            {t(
              'buyerOffers.subtitle',
              'Track your structured price bids, freight deductions, and review status from farmers.'
            )}
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-3 shrink-0">
          <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700 text-left sm:text-right shadow-inner">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
              {language === 'ta' ? 'செயலில் உள்ள வாங்குபவர்' : 'Active Buyer Profile'}
            </span>
            <span className="text-xs font-bold text-white block mt-0.5">
              {language === 'ta' ? currentUser.nameTa : currentUser.name}
            </span>
            <span className="text-[11px] text-emerald-400 block">
              {currentUser.businessType || 'Wholesale Buyer'} • {currentUser.district}
            </span>
          </div>

          <Link
            to="/marketplace"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm"
          >
            <Store className="w-4 h-4" />
            <span>{t('buyerOffers.browseMarketplace', 'Browse Marketplace')}</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-slate-500 text-xs font-semibold flex items-center justify-between">
            <span>{t('buyerOffers.filterAll', 'Total Submitted')}</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{counts.all}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {formatINR(totalCommittedValue)} {language === 'ta' ? 'மதிப்பு' : 'gross bids'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-amber-800 text-xs font-semibold flex items-center justify-between">
            <span>{t('buyerOffers.filterPending', 'Under Review')}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">{counts.pending}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {language === 'ta' ? 'விவசாயி பரிசீலனையில்' : 'Awaiting farmer response'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <span>{t('buyerOffers.filterAccepted', 'Accepted Deals')}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">{counts.accepted}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            {language === 'ta' ? 'வெற்றி பெற்ற கொள்முதல்' : 'Ready for pickup'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-slate-500 text-xs font-semibold flex items-center justify-between">
            <span>{t('buyerOffers.filterDeclined', 'Declined')}</span>
            <XCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-600 mt-2">{counts.declined}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {language === 'ta' ? 'விற்கப்பட்டது / நிராகரிக்கப்பட்டது' : 'Listing closed or other offer picked'}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-emerald-700 text-white font-bold shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {t('buyerOffers.filterAll', 'All Offers')} ({counts.all})
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
            statusFilter === 'pending'
              ? 'bg-amber-600 text-white font-bold shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {t('buyerOffers.filterPending', 'Pending')} ({counts.pending})
        </button>

        <button
          onClick={() => setStatusFilter('accepted')}
          className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
            statusFilter === 'accepted'
              ? 'bg-emerald-700 text-white font-bold shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {t('buyerOffers.filterAccepted', 'Accepted')} ({counts.accepted})
        </button>

        <button
          onClick={() => setStatusFilter('declined')}
          className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
            statusFilter === 'declined'
              ? 'bg-slate-700 text-white font-bold shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {t('buyerOffers.filterDeclined', 'Declined')} ({counts.declined})
        </button>
      </div>

      {/* Database Error Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-rose-950">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <h3 className="font-bold text-xs sm:text-sm">
                {language === 'ta' ? 'சலுகைகளை ஏற்றுவதில் பிழை' : 'Database Connection Notice'}
              </h3>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadBuyerOffers}
            className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shrink-0 transition-colors"
          >
            {language === 'ta' ? 'மீண்டும் முயற்சிக்க' : 'Retry'}
          </button>
        </div>
      )}

      {/* Offers List */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">
            {language === 'ta' ? 'சலுகைகள் ஏற்றப்படுகின்றன...' : 'Loading your submitted purchase offers...'}
          </p>
        </div>
      ) : filteredOffers.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8 text-slate-400" />}
          title={
            statusFilter === 'all'
              ? t('buyerOffers.emptyTitle', 'No Offers Submitted Yet')
              : `${t('buyerOffers.emptyTitle', 'No Offers Found')} (${statusFilter})`
          }
          description={
            statusFilter === 'all'
              ? t(
                  'buyerOffers.emptyDesc',
                  "You haven't placed any purchase offers on available produce lots. Browse the active marketplace to find fresh lots and submit competitive bids."
                )
              : `You do not have any offers currently in '${statusFilter}' status.`
          }
          actionLabel={t('buyerOffers.browseMarketplace', 'Browse Marketplace Catalog')}
          actionLink="/marketplace"
          className="my-8"
        />
      ) : (
        <div className="space-y-6">
          {filteredOffers.map((offer) => {
            const listing = listingsMap[offer.listingId];
            const netCalc = calculateNetReturn(
              offer.quantity,
              offer.offeredPricePerUnit,
              offer.transportCost,
              offer.packagingCost,
              offer.otherCosts,
              offer.unit
            );

            return (
              <div
                key={offer.id}
                className={`bg-white rounded-2xl border transition-all p-6 sm:p-7 shadow-2xs space-y-6 ${
                  offer.status === 'accepted'
                    ? 'border-emerald-300 ring-2 ring-emerald-100 bg-emerald-50/20'
                    : offer.status === 'declined'
                    ? 'border-slate-200 bg-slate-50/50 opacity-90'
                    : 'border-slate-200 hover:border-emerald-200'
                }`}
              >
                {/* Header: Status and Produce Link */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3 flex-wrap">
                    <StatusBadge status={offer.status} />
                    <span className="text-xs text-slate-400 font-mono">
                      ID: {offer.id}
                    </span>
                    <span className="text-xs text-slate-500">
                      • {language === 'ta' ? 'சமர்ப்பிக்கப்பட்டது:' : 'Submitted:'}{' '}
                      <strong>{formatDateIN(offer.createdAt)}</strong>
                    </span>
                  </div>

                  <Link
                    to={`/produce/${offer.listingId}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors"
                  >
                    <span>{t('buyerOffers.viewProduce', 'View Produce Listing')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Accepted Banner Notice */}
                {offer.status === 'accepted' && (
                  <div className="p-4 bg-emerald-600 text-white rounded-xl flex items-start gap-3 shadow-sm">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 text-xs">
                      <div className="font-bold text-sm">
                        {language === 'ta'
                          ? 'வாழ்த்துக்கள்! உங்கள் சலுகையை விவசாயி ஏற்றுக்கொண்டார்.'
                          : 'Deal Accepted by Farmer!'}
                      </div>
                      <div className="text-emerald-100 leading-relaxed">
                        {t(
                          'buyerOffers.listingSoldNotice',
                          'Deal Finalized: Produce accepted! Contact farmer to finalize pickup and dispatch.'
                        )}{' '}
                        {listing && listing.farmerPhone && !listing.farmerPhone.startsWith('Protected') ? (
                          <span className="font-bold underline ml-1">
                            {listing.farmerPhone}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}

                {/* Produce & Economics Grid */}
                <div className="grid md:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Crop specs & Farmer info (5 cols) */}
                  <div className="md:col-span-5 space-y-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        {language === 'ta' ? 'விளைபொருள் விவரம்' : 'Target Produce'}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 leading-tight">
                        {listing
                          ? language === 'ta'
                            ? listing.cropNameTa
                            : listing.cropName
                          : `Lot #${offer.listingId}`}
                      </h3>
                      {listing && (
                        <p className="text-xs text-slate-500">
                          {language === 'ta' ? listing.varietyTa : listing.variety} •{' '}
                          <span className="font-medium">{listing.category}</span>
                        </p>
                      )}
                    </div>

                    {/* Farmer Identity */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">{language === 'ta' ? 'விவசாயி:' : 'Farmer:'}</span>
                        <span className="font-bold text-slate-800">
                          {listing
                            ? language === 'ta'
                              ? listing.farmerNameTa
                              : listing.farmerName
                            : 'Farmer'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">{language === 'ta' ? 'மாவட்டம்:' : 'District:'}</span>
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{listing?.district || 'Tamil Nadu'}</span>
                        </span>
                      </div>
                      {listing?.mandiBenchmarkPrice && (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 text-[11px]">
                          <span className="text-slate-500">Mandi Benchmark:</span>
                          <span className="font-semibold text-slate-700">
                            {formatINR(listing.mandiBenchmarkPrice)} / {listing.unit}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Economics & Net Return Breakdown (7 cols) */}
                  <div className="md:col-span-7 bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {language === 'ta' ? 'வழங்கப்பட்ட அளவு & விலை' : 'Offer Terms'}
                        </span>
                        <div className="text-base font-black text-slate-900">
                          {offer.quantity} {offer.unit} @ {formatINR(offer.offeredPricePerUnit)} / {offer.unit}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {t('buyerOffers.grossTotal', 'Gross Value')}
                        </span>
                        <div className="text-base font-black text-slate-900">
                          {formatINR(netCalc.grossTotal)}
                        </div>
                      </div>
                    </div>

                    {/* Breakdown row: deductions */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Truck className="w-3 h-3 text-slate-400" />
                          <span>{t('term.transportCost', 'Transportation')}</span>
                        </div>
                        <div className="font-bold text-slate-800 mt-1">
                          {formatINR(offer.transportCost)}
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Package className="w-3 h-3 text-slate-400" />
                          <span>{t('term.packagingCost', 'Packaging')}</span>
                        </div>
                        <div className="font-bold text-slate-800 mt-1">
                          {formatINR(offer.packagingCost)}
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                        <div className="text-[10px] text-slate-400">{t('term.otherCosts', 'Other Costs')}</div>
                        <div className="font-bold text-slate-800 mt-1">
                          {formatINR(offer.otherCosts)}
                        </div>
                      </div>
                    </div>

                    {/* Estimated Net Return to Farmer */}
                    <div className="bg-emerald-900 text-white p-4 rounded-xl flex items-center justify-between shadow-sm">
                      <div>
                        <span className="text-[10px] text-emerald-300 uppercase font-mono font-bold tracking-wider block">
                          {t('buyerOffers.estNetReturn', 'Est. Net Return to Farmer')}
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-emerald-300">
                          {formatINR(netCalc.estimatedNetReturn)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-emerald-200 block">
                          {language === 'ta' ? 'யூனிட் ஒன்றுக்கு நிகர:' : 'Net per unit:'}
                        </span>
                        <span className="text-sm font-bold text-white font-mono">
                          {formatINR(netCalc.netReturnPerUnit)} / {offer.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logistics & Payment Specifications */}
                <div className="pt-3 border-t border-slate-100 grid sm:grid-cols-3 gap-4 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 font-semibold block mb-0.5">
                      📍 {t('buyerOffers.pickupAt', 'Pickup Location')}
                    </span>
                    <span className="font-medium text-slate-800">
                      {language === 'ta' && offer.pickupLocationTa ? offer.pickupLocationTa : offer.pickupLocation}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block mb-0.5">
                      💳 {t('buyerOffers.paymentTerms', 'Payment Terms')}
                    </span>
                    <span className="font-medium text-slate-800">
                      {language === 'ta' && offer.paymentTermsTa ? offer.paymentTermsTa : offer.paymentTerms}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block mb-0.5">
                      📝 {t('buyerOffers.notes', 'Notes')}
                    </span>
                    <span className="font-medium text-slate-800 italic">
                      "{language === 'ta' && offer.notesTa ? offer.notesTa : (offer.notes || (language === 'ta' ? 'குறிப்புகள் இல்லை' : 'None'))}"
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DisclaimerNotice />
    </div>
  );
};
