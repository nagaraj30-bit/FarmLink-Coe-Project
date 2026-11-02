import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useDemoUser } from '../hooks/useDemoUser';
import { fetchListingsAsync, fetchOffersByBuyerAsync } from '../data/dataAccess';
import { ProduceListing } from '../types';
import { formatINR, formatDateIN } from '../utils/formatters';
import { getSellingUrgency } from '../utils/calculations';
import { UrgencyBadge } from '../components/common/Badge';
import { DisclaimerNotice } from '../components/common/DisclaimerNotice';
import { EmptyState } from '../components/common/EmptyState';
import {
  Store,
  MapPin,
  Eye,
  Send,
  Search,
  X,
  RotateCcw,
  ShoppingBag,
  SlidersHorizontal,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export const BuyerMarketplacePage: React.FC = () => {
  const { language, t } = useLanguage();
  const { currentUser, isBuyer, isRealAuth } = useDemoUser();

  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [buyerOffersCount, setBuyerOffersCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadMarketplaceData = () => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    Promise.all([
      fetchListingsAsync(undefined, Boolean(isRealAuth)),
      currentUser?.id
        ? fetchOffersByBuyerAsync(currentUser.id, Boolean(isRealAuth))
        : Promise.resolve([]),
    ])
      .then(([allListings, myOffers]) => {
        if (!isMounted) return;
        setListings(allListings);
        setBuyerOffersCount(myOffers.length);
        setIsLoading(false);
      })
      .catch((err: any) => {
        if (!isMounted) return;
        console.error('Failed to load marketplace listings:', err);
        setError(err?.message || 'Failed to load listings from database.');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  };

  useEffect(() => {
    return loadMarketplaceData();
  }, [currentUser?.id, isRealAuth]);

  // Dynamic lists from available inventory
  const availableDistricts = Array.from(new Set(listings.map((l) => l.district))).filter(Boolean);
  const availableCategories = Array.from(new Set(listings.map((l) => l.category))).filter(Boolean);

  // Combined search and multi-criteria filtering
  const filtered = listings.filter((item) => {
    // 1. Text Search (case-insensitive across crop, variety, farmer, district)
    const query = searchTerm.trim().toLowerCase();
    if (query) {
      const cropEn = (item.cropName || '').toLowerCase();
      const cropTa = (item.cropNameTa || '').toLowerCase();
      const varietyEn = (item.variety || '').toLowerCase();
      const varietyTa = (item.varietyTa || '').toLowerCase();
      const farmerEn = (item.farmerName || '').toLowerCase();
      const farmerTa = (item.farmerNameTa || '').toLowerCase();
      const distEn = (item.district || '').toLowerCase();
      const distTa = (item.districtTa || '').toLowerCase();

      const matchesQuery =
        cropEn.includes(query) ||
        cropTa.includes(query) ||
        varietyEn.includes(query) ||
        varietyTa.includes(query) ||
        farmerEn.includes(query) ||
        farmerTa.includes(query) ||
        distEn.includes(query) ||
        distTa.includes(query);

      if (!matchesQuery) return false;
    }

    // 2. District Filter
    if (districtFilter !== 'all' && item.district.toLowerCase() !== districtFilter.toLowerCase()) {
      return false;
    }

    // 3. Category Filter
    if (categoryFilter !== 'all' && item.category.toLowerCase() !== categoryFilter.toLowerCase()) {
      return false;
    }

    // 4. Urgency Filter
    if (urgencyFilter !== 'all') {
      const urgency = getSellingUrgency(item.sellWithinDays);
      if (urgency.level !== urgencyFilter) {
        return false;
      }
    }

    return true;
  });

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    districtFilter !== 'all' ||
    categoryFilter !== 'all' ||
    urgencyFilter !== 'all';

  const handleResetFilters = () => {
    setSearchTerm('');
    setDistrictFilter('all');
    setCategoryFilter('all');
    setUrgencyFilter('all');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Store className="w-4 h-4" />
            <span>{language === 'ta' ? 'விளைபொருள் கொள்முதல் சந்தை' : 'Direct Produce Procurement Marketplace'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-1 tracking-tight">
            {language === 'ta' ? 'விவசாயிகளிடமிருந்து நேரடி கொள்முதல்' : 'Fresh Produce Catalog'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            {language === 'ta'
              ? 'விவசாயிகளின் இருப்பு, அறுவடை தேதி, விற்பனை காலக்கெடு மற்றும் மண்டி சந்தை விலையை அறிந்து வெளிப்படையாக விலை கோரவும்.'
              : 'Browse authenticated listings with clear harvest dates, deadlines, and benchmark references before submitting structured offers.'}
          </p>
        </div>

        {/* Right side buyer actions & profile badge */}
        <div className="flex flex-col sm:items-end gap-3 shrink-0">
          {isBuyer && currentUser && (
            <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700 text-left sm:text-right w-full sm:w-auto shadow-inner">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                {language === 'ta' ? 'கொள்முதலாளர்' : 'Logged in Buyer'}
              </span>
              <span className="text-xs font-bold text-white block mt-0.5">
                {language === 'ta' ? currentUser.nameTa : currentUser.name}
              </span>
              <span className="text-[11px] text-emerald-400 block">{currentUser.district}</span>
            </div>
          )}

          {isBuyer && (
            <Link
              to="/buyer/my-offers"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t('marketplace.myOffersLink', 'My Submitted Offers')}</span>
              {buyerOffersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-800 text-white text-[10px] font-mono">
                  {buyerOffersCount}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        {/* Search Input */}
        <div>
          <label htmlFor="produce-search" className="sr-only">
            {t('marketplace.searchLabel', 'Search Produce')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="produce-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t(
                'marketplace.searchPlaceholder',
                'Search produce by crop name, variety, farmer, or district...'
              )}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm font-medium placeholder:text-slate-400 bg-slate-50/50 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title={t('marketplace.clearSearch', 'Clear Search')}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Filters and Quick Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t('action.filter', 'Filters')}:</span>
            </div>

            {/* District dropdown */}
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              aria-label="District Filter"
            >
              <option value="all">{language === 'ta' ? 'அனைத்து மாவட்டங்கள்' : 'All Districts'}</option>
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Category dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              aria-label="Category Filter"
            >
              <option value="all">{language === 'ta' ? 'அனைத்து பிரிவுகள்' : 'All Categories'}</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Urgency dropdown */}
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              aria-label="Urgency Filter"
            >
              <option value="all">{language === 'ta' ? 'அனைத்து அவசர நிலைகள்' : 'All Urgency Levels'}</option>
              <option value="high">{t('urgency.high', 'High Urgency (≤ 1 day)')}</option>
              <option value="medium">{t('urgency.medium', 'Medium Urgency (2-3 days)')}</option>
              <option value="normal">{t('urgency.normal', 'Normal (> 3 days)')}</option>
            </select>
          </div>

          {/* Results Count & Reset button */}
          <div className="flex items-center justify-between sm:justify-end gap-3 text-slate-500">
            <span className="font-medium text-[11px]">
              {language === 'ta' ? (
                <>
                  மொத்தம் <strong>{filtered.length}</strong> / {listings.length} பதிவுகள்
                </>
              ) : (
                <>
                  Showing <strong>{filtered.length}</strong> of {listings.length} produce lots
                </>
              )}
            </span>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer bg-rose-50 px-2 py-1 rounded"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t('marketplace.clearAllFilters', 'Clear All')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-rose-950">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <h3 className="font-bold text-xs sm:text-sm">
                {language === 'ta' ? 'விளைபொருள் பதிவுகளை ஏற்றுவதில் பிழை' : 'Database Connection Notice'}
              </h3>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadMarketplaceData}
            className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shrink-0 transition-colors"
          >
            {language === 'ta' ? 'மீண்டும் முயற்சிக்க' : 'Retry'}
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">
            {language === 'ta' ? 'விளைபொருட்கள் ஏற்றப்படுகின்றன...' : 'Loading marketplace produce listings...'}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="w-6 h-6 text-slate-400" />}
          title={t('marketplace.noResultsTitle', 'No produce found matching your search')}
          description={t(
            'marketplace.noResultsDesc',
            'No active produce listings matched your keywords and filter criteria. Try adjusting your query or resetting filters.'
          )}
          actionLabel={t('marketplace.clearAllFilters', 'Clear All Filters')}
          onAction={handleResetFilters}
          className="my-8"
        />
      ) : (
        /* Listings Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => {
            const urgency = getSellingUrgency(item.sellWithinDays);
            const isSold = item.status === 'sold';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between shadow-2xs hover:shadow-sm space-y-4 ${
                  isSold
                    ? 'border-slate-200 bg-slate-50/60 opacity-80'
                    : urgency.level === 'high'
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 leading-tight">
                        {language === 'ta' ? item.cropNameTa : item.cropName}
                      </h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {language === 'ta' ? item.varietyTa : item.variety}
                      </div>
                    </div>
                    <UrgencyBadge level={urgency.level} daysRemaining={item.sellWithinDays} />
                  </div>

                  {/* Farmer metadata */}
                  <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-100">
                    <span className="flex items-center gap-1 font-medium">
                      <span className="text-sm">👨‍🌾</span>
                      <span>{language === 'ta' ? item.farmerNameTa : item.farmerName}</span>
                    </span>
                    <span className="flex items-center gap-1 font-medium text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{item.district}</span>
                    </span>
                  </div>

                  {/* Inventory & Pricing box */}
                  <div className="p-3 rounded-xl bg-slate-50 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">{t('term.quantity', 'Available')}:</span>
                      <span className="font-black text-slate-900 text-sm">
                        {item.quantity} {item.unit}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">{t('term.expectedPrice', 'Target Price')}:</span>
                      <span className="font-bold text-emerald-800 text-sm">
                        {formatINR(item.expectedPricePerUnit)} / {item.unit}
                      </span>
                    </div>

                    {item.mandiBenchmarkPrice && (
                      <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-[11px] text-slate-500">
                        <span>{t('term.mandiBenchmark', 'Mandi Benchmark')}:</span>
                        <span className="font-semibold text-slate-700">
                          {formatINR(item.mandiBenchmarkPrice)} / {item.unit}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Condition Details */}
                  <div className="text-[11px] text-slate-500 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>{t('term.harvestDate', 'Harvested')}:</span>
                      <span>{formatDateIN(item.harvestingDate)}</span>
                    </div>
                    <div className="truncate" title={item.storageCondition}>
                      <span className="text-slate-400">{t('term.storageCondition', 'Storage Condition')}:</span>{' '}
                      <span>{language === 'ta' ? item.storageConditionTa : item.storageCondition}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <Link
                    to={`/produce/${item.id}`}
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs text-center transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t('action.viewDetails', 'Details')}</span>
                  </Link>

                  {!isSold ? (
                    <Link
                      to={`/make-offer/${item.id}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs text-center transition-colors shadow-2xs flex items-center justify-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t('action.makeOffer', 'Make Offer')}</span>
                    </Link>
                  ) : (
                    <span className="flex-1 py-2 px-3 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs text-center cursor-not-allowed">
                      {language === 'ta' ? 'விற்கப்பட்டது' : 'Sold'}
                    </span>
                  )}
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
