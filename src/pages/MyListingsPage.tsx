import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useDemoUser } from '../hooks/useDemoUser';
import { fetchListingsAsync, fetchOffersForListingAsync } from '../data/dataAccess';
import { ProduceListing, ListingStatus, Offer } from '../types';
import { formatINR, formatDateIN } from '../utils/formatters';
import { getSellingUrgency } from '../utils/calculations';
import { UrgencyBadge, StatusBadge } from '../components/common/Badge';
import { DisclaimerNotice } from '../components/common/DisclaimerNotice';
import { EmptyState } from '../components/common/EmptyState';
import { UnsoldProduceModal } from '../components/guidance/UnsoldProduceModal';
import { EditListingModal } from '../components/listings/EditListingModal';
import {
  Sprout,
  PlusCircle,
  HelpCircle,
  ChevronRight,
  CheckCircle2,
  Edit3,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export const MyListingsPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { currentUser, isRealAuth } = useDemoUser();

  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | ListingStatus>('all');
  const [selectedCropForGuidance, setSelectedCropForGuidance] = useState<ProduceListing | null>(null);
  const [guidanceOpen, setGuidanceOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<ProduceListing | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
        console.error('Failed to load listings:', err);
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

  const filteredListings = listings.filter((item) => {
    if (activeTab === 'all') return true;
    return item.status === activeTab;
  });

  const tabCounts = {
    all: listings.length,
    active: listings.filter((l) => l.status === 'active').length,
    negotiating: listings.filter((l) => l.status === 'negotiating').length,
    sold: listings.filter((l) => l.status === 'sold').length,
  };

  const handleSaveListing = (updated: ProduceListing) => {
    loadListings();
    setSuccessMessage(
      language === 'ta'
        ? `${updated.cropNameTa || updated.cropName} விவரங்கள் வெற்றிகரமாக புதுப்பிக்கப்பட்டன!`
        : `Listing for ${updated.cropName} (${updated.variety}) updated successfully!`
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider font-mono">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>{language === 'ta' ? 'விவசாயி மேலாண்மை' : 'Produce Inventory & Pipeline'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            {language === 'ta' ? 'எனது விளைபொருட்கள் (My Listings)' : 'My Produce Listings'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ta'
              ? 'உங்கள் விளைபொருட்களின் விற்பனை நிலை, விலை அளவுருக்கள் மற்றும் பெறப்பட்ட வாய்ப்புகளை நிர்வகிக்கவும்.'
              : 'Review your harvest catalogue, edit pricing thresholds, and compare net-return bids.'}
          </p>
        </div>

        <Link
          to="/add-produce"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{language === 'ta' ? 'விளைபொருள் சேர்க்க' : 'Add New Produce'}</span>
        </Link>
      </div>

      {/* Success Notification */}
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'all'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>{language === 'ta' ? 'அனைத்தும்' : 'All Listings'}</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'all' ? 'bg-emerald-950 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {tabCounts.all}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('negotiating')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'negotiating'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>{language === 'ta' ? 'வாய்ப்புகள் வந்தவை' : 'Offers Received'}</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'negotiating' ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {tabCounts.negotiating}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'active'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>{language === 'ta' ? 'செயலில் உள்ளவை' : 'Active (No bids)'}</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'active' ? 'bg-emerald-900 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {tabCounts.active}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sold')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'sold'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>{language === 'ta' ? 'விற்கப்பட்டவை' : 'Sold'}</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'sold' ? 'bg-slate-950 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {tabCounts.sold}
          </span>
        </button>
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

      {/* Grid of Listings */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">
            {language === 'ta' ? 'விளைபொருட்கள் ஏற்றப்படுகின்றன...' : 'Loading your produce listings...'}
          </p>
        </div>
      ) : filteredListings.length === 0 ? (
        <EmptyState
          title={language === 'ta' ? 'பட்டியலில் விவரங்கள் இல்லை' : 'No listings in this view'}
          description={
            language === 'ta'
              ? 'தேர்ந்தெடுக்கப்பட்ட பிரிவில் விளைபொருட்கள் எதுவும் இல்லை.'
              : 'No produce listings match the selected status filter.'
          }
          actionLabel={language === 'ta' ? 'புதிய விளைபொருள் சேர்க்க' : 'Add New Produce'}
          actionLink="/add-produce"
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {filteredListings.map((item) => {
            const urgency = getSellingUrgency(item.sellWithinDays);
            const offers = offersMap[item.id] || [];
            const pendingOffers = offers.filter((o) => o.status === 'pending');
            const acceptedOffer = offers.find((o) => o.status === 'accepted');

            // Ownership check: must be farmer role and own this listing (or match demo id)
            const isOwner = Boolean(
              currentUser &&
              currentUser.role === 'farmer' &&
              item.farmerId &&
              item.farmerId === currentUser.id
            );
            const isSold = item.status === 'sold';
            const canEdit = isOwner && !isSold;

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

                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 text-xs">
                  <div>
                    <span className="text-slate-400 block">{t('term.expectedPrice', 'Target Price')}:</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {formatINR(item.expectedPricePerUnit)} / {item.unit}
                    </span>
                    {item.minAcceptablePricePerUnit > 0 && (
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {language === 'ta' ? 'குறைந்தபட்சம்:' : 'Floor:'} {formatINR(item.minAcceptablePricePerUnit)}/{item.unit}
                      </span>
                    )}
                  </div>

                  {item.mandiBenchmarkPrice && (
                    <div>
                      <span className="text-slate-400 block">{t('term.mandiBenchmark', 'Mandi Benchmark')}:</span>
                      <span className="font-bold text-emerald-800">
                        {formatINR(item.mandiBenchmarkPrice)} / {item.unit}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('term.harvestDate', 'Harvest Date')}:</span>
                    <span>{formatDateIN(item.harvestingDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('term.deadline', 'Deadline')}:</span>
                    <span className="font-semibold text-rose-700">
                      {item.sellWithinDays} {language === 'ta' ? 'நாட்கள் உள்ளன' : 'days left'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-xs">
                    {item.status === 'sold' && acceptedOffer ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{acceptedOffer.buyerName}</span>
                      </span>
                    ) : (
                      <span>
                        <strong className="text-slate-900 font-bold">{offers.length}</strong>{' '}
                        {language === 'ta' ? 'வாய்ப்புகள்' : 'offer(s)'}
                        {pendingOffers.length > 0 && (
                          <span className="ml-1 px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                            {pendingOffers.length} {language === 'ta' ? 'புதியது' : 'pending'}
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Unsold produce guidance */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCropForGuidance(item);
                        setGuidanceOpen(true);
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold"
                      title={language === 'ta' ? 'விற்கப்படாத விளைபொருள் வழிகாட்டல்' : 'Unsold Produce Options'}
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>

                    {/* Edit button: eligible unsold active listings owned by farmer */}
                    {canEdit && (
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

                    {/* Compare offers */}
                    <Link
                      to={`/offers/${item.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white transition-colors shadow-2xs"
                    >
                      <span>{language === 'ta' ? 'ஒப்பீடு' : 'Compare Offers'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DisclaimerNotice />

      {/* Edit Listing Modal */}
      <EditListingModal
        listing={editingListing}
        isOpen={Boolean(editingListing)}
        onClose={() => setEditingListing(null)}
        onSave={handleSaveListing}
      />

      {/* Unsold Guidance Modal */}
      {selectedCropForGuidance && (
        <UnsoldProduceModal
          isOpen={guidanceOpen}
          onClose={() => setGuidanceOpen(false)}
          cropName={language === 'ta' ? selectedCropForGuidance.cropNameTa : selectedCropForGuidance.cropName}
          urgencyLevel={getSellingUrgency(selectedCropForGuidance.sellWithinDays).level}
        />
      )}
    </div>
  );
};
