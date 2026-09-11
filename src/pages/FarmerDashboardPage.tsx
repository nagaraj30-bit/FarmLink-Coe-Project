import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDemoUser } from '../hooks/useDemoUser';
import { getListings, getOffersForListing } from '../data/dataAccess';
import { getUrgency } from '../utils/calculations';
import { formatINR, formatNumberIN, getDeadlineLabel } from '../utils/formatters';
import { UrgencyBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { DisclaimerNotice } from '../components/common/DisclaimerNotice';

export const FarmerDashboardPage: React.FC = () => {
  const { currentProfile, isFarmer, switchRole, dataRevision } = useDemoUser();

  // Load only listings owned by this active farmer
  const myListings = useMemo(() => {
    return getListings({ farmerId: currentProfile.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProfile.id, dataRevision]);

  // Aggregate offers for all listings owned by this farmer
  const { pendingOffers, urgentListings, totalPotentialNetReturn } = useMemo(() => {
    let pending = 0;
    let urgent = 0;
    let totalNet = 0;

    myListings.forEach(l => {
      const urgency = getUrgency(l.sellWithinDays);
      if (l.status === 'active' && (urgency === 'high' || urgency === 'medium')) {
        urgent++;
      }
      const offers = getOffersForListing(l.id);
      const pendingForThis = offers.filter(o => o.status === 'pending');
      pending += pendingForThis.length;
      pendingForThis.forEach(o => {
        totalNet += o.estimatedNetReturn;
      });
    });

    return {
      pendingOffers: pending,
      urgentListings: urgent,
      totalPotentialNetReturn: totalNet,
    };
  }, [myListings]);

  if (!isFarmer) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center space-y-3">
          <h2 className="text-lg font-bold text-amber-900">You are currently in Buyer view</h2>
          <p className="text-xs text-amber-700 max-w-md mx-auto">
            The Farmer Dashboard is tailored for agricultural producers to manage crops and compare net offers.
          </p>
          <button
            onClick={() => switchRole('farmer')}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-md shadow-xs cursor-pointer"
          >
            Switch to farmer mode
          </button>
        </div>
      </div>
    );
  }

  const activeListings = myListings.filter(l => l.status === 'active');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Farmer Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            Welcome, {currentProfile.fullName}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Location: {currentProfile.location} • Filtering by your farm holdings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/farmer/add-produce"
            className="inline-flex items-center gap-1 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors"
          >
            <span>+</span> Add produce
          </Link>
          <Link
            to="/farmer/listings"
            className="inline-flex items-center px-4 py-2.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 text-sm font-semibold rounded-lg transition-colors"
          >
            View all listings
          </Link>
        </div>
      </div>

      {/* Metric summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="text-xs font-semibold uppercase text-stone-500">Active produce</div>
          <div className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            {activeListings.length}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            {myListings.length} total listed to date
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="text-xs font-semibold uppercase text-amber-700">Deadline priority</div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-800 mt-1">
            {urgentListings}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Stated deadline ≤ 3 days
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="text-xs font-semibold uppercase text-emerald-800">Pending offers</div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-900 mt-1">
            {pendingOffers}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Awaiting your net return review
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="text-xs font-semibold uppercase text-stone-500">Potential net value</div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-800 mt-1">
            {formatINR(totalPotentialNetReturn)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Estimated take-home across pending offers
          </div>
        </div>
      </div>

      <DisclaimerNotice compact />

      {/* Active Listings with Offer Comparison links */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Your active produce & offers</h2>
            <p className="text-xs text-stone-500">
              Ranked by your stated selling deadline. Compare offers based on take-home return.
            </p>
          </div>
          <Link to="/farmer/listings" className="text-xs font-semibold text-emerald-800 hover:underline">
            Manage all ({myListings.length}) →
          </Link>
        </div>

        {activeListings.length === 0 ? (
          <EmptyState
            title="No active produce listings"
            description="You do not have any active produce listed for sale under this profile."
            actionText="Add produce"
            onAction={() => window.location.assign('/farmer/add-produce')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeListings.map(listing => {
              const urgency = getUrgency(listing.sellWithinDays);
              const offers = getOffersForListing(listing.id);
              const pendingOffersForListing = offers.filter(o => o.status === 'pending');

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
                      <UrgencyBadge urgency={urgency} sellWithinDays={listing.sellWithinDays} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-stone-100">
                      <div>
                        <span className="text-stone-500 block">Available qty:</span>
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

                    {/* Offers received highlight */}
                    <div className="bg-stone-50 rounded-lg p-3 text-xs flex items-center justify-between border border-stone-200">
                      <div>
                        <span className="font-semibold text-stone-900 block">
                          {offers.length} {offers.length === 1 ? 'offer' : 'offers'} received
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {pendingOffersForListing.length} pending your review
                        </span>
                      </div>
                      <span className="text-emerald-800 font-bold text-sm">
                        {offers.length > 0 ? '✓ Ready to compare' : 'Awaiting offers'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/listing/${listing.id}`}
                      className="text-xs font-semibold text-stone-600 hover:text-stone-900"
                    >
                      View details
                    </Link>
                    <Link
                      to={`/farmer/listings/${listing.id}/offers`}
                      className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
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
    </div>
  );
};
