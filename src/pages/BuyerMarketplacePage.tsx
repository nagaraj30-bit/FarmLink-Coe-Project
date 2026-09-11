import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDemoUser } from '../hooks/useDemoUser';
import { getListings, getOffersByBuyer } from '../data/dataAccess';
import { getUrgency } from '../utils/calculations';
import { formatINR, formatNumberIN } from '../utils/formatters';
import { UrgencyBadge, StatusBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { DisclaimerNotice } from '../components/common/DisclaimerNotice';

export const BuyerMarketplacePage: React.FC = () => {
  const { currentProfile, isBuyer, dataRevision } = useDemoUser();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [showMyOffersOnly, setShowMyOffersOnly] = useState(false);

  // Load all active and sold listings
  const allListings = useMemo(() => {
    return getListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataRevision]);

  // Load offers submitted by active buyer if in buyer mode
  const mySubmittedOffers = useMemo(() => {
    if (!isBuyer) return [];
    return getOffersByBuyer(currentProfile.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProfile.id, isBuyer, dataRevision]);

  // Filter listings
  const filteredListings = useMemo(() => {
    return allListings.filter(listing => {
      // Search
      const matchesSearch =
        listing.produceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchQuery.toLowerCase());

      // Category
      const matchesCategory =
        selectedCategory === 'all' || listing.category === selectedCategory;

      // Urgency
      const urgency = getUrgency(listing.sellWithinDays);
      const matchesUrgency =
        selectedUrgency === 'all' || urgency === selectedUrgency;

      return matchesSearch && matchesCategory && matchesUrgency;
    });
  }, [allListings, searchQuery, selectedCategory, selectedUrgency]);

  const categories = ['all', 'Vegetables', 'Fruits', 'Grains & Pulses', 'Plantation'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Marketplace
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            Browse farm produce
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Directly from verified regional growers. Prioritize by the farmer&apos;s stated selling deadline.
          </p>
        </div>

        {/* My submitted offers toggle for buyers */}
        {isBuyer && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMyOffersOnly(!showMyOffersOnly)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                showMyOffersOnly
                  ? 'bg-amber-800 text-white border-amber-900'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
              }`}
            >
              My submitted offers ({mySubmittedOffers.length})
            </button>
          </div>
        )}
      </div>

      <DisclaimerNotice compact />

      {/* Buyer's submitted offers view */}
      {isBuyer && showMyOffersOnly ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900">
              Your submitted offers ({currentProfile.fullName})
            </h2>
            <button
              onClick={() => setShowMyOffersOnly(false)}
              className="text-xs text-emerald-800 hover:underline font-semibold"
            >
              ← Back to marketplace catalog
            </button>
          </div>

          {mySubmittedOffers.length === 0 ? (
            <EmptyState
              title="No offers submitted yet"
              description="You have not submitted any offers on produce listings yet."
              actionText="Browse produce"
              onAction={() => setShowMyOffersOnly(false)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mySubmittedOffers.map(offer => {
                const listing = allListings.find(l => l.id === offer.listingId);
                return (
                  <div key={offer.id} className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-stone-900">
                          {listing ? listing.produceName : 'Produce listing'}
                        </h3>
                        <div className="text-xs text-stone-500">
                          Listing ID: {offer.listingId}
                        </div>
                      </div>
                      <StatusBadge status={offer.status} />
                    </div>

                    <div className="bg-stone-50 p-3 rounded text-xs space-y-1 font-mono border border-stone-200">
                      <div className="flex justify-between text-stone-700">
                        <span>Offered:</span>
                        <span className="font-semibold">
                          {formatNumberIN(offer.offeredQuantity)} {listing?.unit || 'kg'} @ {formatINR(offer.offerPricePerUnit)}/{listing?.unit || 'kg'}
                        </span>
                      </div>
                      <div className="flex justify-between text-stone-500">
                        <span>Gross total:</span>
                        <span>{formatINR(offer.totalOfferAmount)}</span>
                      </div>
                      <div className="flex justify-between text-stone-500">
                        <span>Estimated selling costs:</span>
                        <span>−{formatINR(offer.transportCost + offer.packagingCost + offer.otherCosts)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-emerald-900 border-t border-stone-200 pt-1 font-sans">
                        <span>Farmer estimated net:</span>
                        <span>{formatINR(offer.estimatedNetReturn)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
                      <span>Pickup: {offer.pickupPreference}</span>
                      {listing && (
                        <Link
                          to={`/listing/${listing.id}`}
                          className="font-semibold text-emerald-800 hover:underline"
                        >
                          View produce →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Standard Marketplace Catalog */
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search text */}
              <div className="sm:col-span-1">
                <label htmlFor="searchQuery" className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Search produce or location
                </label>
                <input
                  type="text"
                  id="searchQuery"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="e.g. Tomatoes, Madurai..."
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-stone-300 focus:border-emerald-700 focus:outline-hidden"
                />
              </div>

              {/* Category filter */}
              <div>
                <label htmlFor="categoryFilter" className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Filter by category
                </label>
                <select
                  id="categoryFilter"
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-stone-300 focus:border-emerald-700 bg-white capitalize"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>
                      {c === 'all' ? 'All categories' : c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Urgency filter */}
              <div>
                <label htmlFor="urgencyFilter" className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Filter by stated urgency
                </label>
                <select
                  id="urgencyFilter"
                  value={selectedUrgency}
                  onChange={e => setSelectedUrgency(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-stone-300 focus:border-emerald-700 bg-white"
                >
                  <option value="all">All urgency levels</option>
                  <option value="high">High urgency (≤ 1 day)</option>
                  <option value="medium">Medium urgency (2–3 days)</option>
                  <option value="normal">Normal urgency (&gt; 3 days)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Catalog grid */}
          {filteredListings.length === 0 ? (
            <EmptyState
              title="No produce found"
              description="No produce matched your search filters. Try clearing your filters to see all available produce."
              actionText="Clear filters"
              onAction={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedUrgency('all');
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map(listing => {
                const urgency = getUrgency(listing.sellWithinDays);
                const isAvailable = listing.status === 'active';

                return (
                  <div
                    key={listing.id}
                    className={`bg-white rounded-xl border shadow-xs transition-all flex flex-col justify-between p-5 ${
                      isAvailable ? 'border-stone-200 hover:border-stone-300' : 'border-stone-200 opacity-80'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                            {listing.category}
                          </span>
                          <h3 className="text-base font-bold text-stone-900 leading-snug">
                            {listing.produceName}
                          </h3>
                        </div>
                        <StatusBadge status={listing.status} />
                      </div>

                      <div className="flex items-center gap-2">
                        <UrgencyBadge urgency={urgency} sellWithinDays={listing.sellWithinDays} />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-stone-100">
                        <div>
                          <span className="text-stone-500 block">Available lot:</span>
                          <span className="font-semibold text-stone-800">
                            {formatNumberIN(listing.quantity)} {listing.unit}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-500 block">Target price:</span>
                          <span className="font-semibold text-stone-800">
                            {formatINR(listing.expectedPrice)} / {listing.unit}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-500 block">Location:</span>
                          <span className="text-stone-700">{listing.location}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block">Quality grade:</span>
                          <span className="text-stone-700">{listing.quality}</span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-600 line-clamp-2">
                        {listing.description || 'Harvested produce ready for pickup and transport.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <Link
                        to={`/listing/${listing.id}`}
                        className="text-xs font-semibold text-stone-600 hover:text-stone-900"
                      >
                        View details
                      </Link>

                      {isAvailable ? (
                        <Link
                          to={`/listing/${listing.id}/offer`}
                          className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
                        >
                          Make offer
                        </Link>
                      ) : (
                        <span className="text-xs font-medium text-stone-400">
                          Offers closed ({listing.status})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
