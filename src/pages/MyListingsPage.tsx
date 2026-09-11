import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDemoUser } from '../hooks/useDemoUser';
import { getListings, getOffersForListing } from '../data/dataAccess';
import { getUrgency } from '../utils/calculations';
import { formatINR, formatNumberIN, getDeadlineLabel } from '../utils/formatters';
import { UrgencyBadge, StatusBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { DisclaimerNotice } from '../components/common/DisclaimerNotice';

export const MyListingsPage: React.FC = () => {
  const { currentProfile, isFarmer, switchRole, dataRevision } = useDemoUser();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'sold' | 'expired'>('all');

  const myListings = useMemo(() => {
    return getListings({ farmerId: currentProfile.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProfile.id, dataRevision]);

  const filteredListings = useMemo(() => {
    if (activeTab === 'all') return myListings;
    return myListings.filter(l => l.status === activeTab);
  }, [myListings, activeTab]);

  if (!isFarmer) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-3">
          <h2 className="text-base font-bold text-amber-900">Farmer view required</h2>
          <p className="text-xs text-amber-700">
            Switch to a farmer profile to view and manage your crops.
          </p>
          <button
            onClick={() => switchRole('farmer')}
            className="px-4 py-2 bg-emerald-800 text-white rounded text-xs font-semibold"
          >
            Switch to farmer mode
          </button>
        </div>
      </div>
    );
  }

  const counts = {
    all: myListings.length,
    active: myListings.filter(l => l.status === 'active').length,
    sold: myListings.filter(l => l.status === 'sold').length,
    expired: myListings.filter(l => l.status === 'expired').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Produce inventory
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            My produce listings
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Listing owner: {currentProfile.fullName} ({currentProfile.location})
          </p>
        </div>

        <Link
          to="/farmer/add-produce"
          className="inline-flex items-center gap-1 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <span>+</span> Add produce
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 space-x-6 text-xs sm:text-sm font-medium">
        {(['all', 'active', 'sold', 'expired'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 capitalize transition-colors relative cursor-pointer ${
              activeTab === tab
                ? 'text-emerald-900 font-bold border-b-2 border-emerald-800'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {tab} ({counts[tab]})
          </button>
        ))}
      </div>

      <DisclaimerNotice compact />

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <EmptyState
          title={`No ${activeTab !== 'all' ? activeTab : ''} listings found`}
          description={
            activeTab === 'all'
              ? 'You have not added any produce listings yet. List your harvested produce to start receiving buyer offers.'
              : `You currently have no listings marked as ${activeTab}.`
          }
          actionText={activeTab === 'all' ? 'Add produce' : undefined}
          onAction={activeTab === 'all' ? () => window.location.assign('/farmer/add-produce') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map(listing => {
            const urgency = getUrgency(listing.sellWithinDays);
            const offers = getOffersForListing(listing.id);
            const pendingCount = offers.filter(o => o.status === 'pending').length;

            return (
              <div
                key={listing.id}
                className="bg-white rounded-xl border border-stone-200 shadow-xs hover:border-stone-300 transition-all flex flex-col justify-between p-5"
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
                      <span className="text-stone-500 block">Quantity:</span>
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
                      <span className="text-stone-500 block">Quality:</span>
                      <span className="text-stone-700">{listing.quality}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Deadline:</span>
                      <span className="text-stone-700">{getDeadlineLabel(listing.sellWithinDays)}</span>
                    </div>
                  </div>

                  {/* Offers summary bar */}
                  <div className="bg-stone-50 rounded-lg p-3 text-xs flex items-center justify-between border border-stone-200">
                    <div>
                      <span className="font-semibold text-stone-900 block">
                        {offers.length} {offers.length === 1 ? 'offer' : 'offers'} received
                      </span>
                      <span className="text-[11px] text-stone-500">
                        {pendingCount} pending review
                      </span>
                    </div>
                    {offers.length > 0 && (
                      <span className="text-emerald-800 font-bold text-xs bg-emerald-100/60 px-2 py-1 rounded">
                        Compare net returns
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/listing/${listing.id}`}
                    className="text-xs font-semibold text-stone-600 hover:text-stone-900"
                  >
                    View listing
                  </Link>

                  <Link
                    to={`/farmer/listings/${listing.id}/offers`}
                    className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
                  >
                    Compare offers ({offers.length})
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
