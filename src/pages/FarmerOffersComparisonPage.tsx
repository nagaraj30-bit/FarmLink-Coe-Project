import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDemoUser } from '../hooks/useDemoUser';
import { getListingById, getOffersForListing, getProfileById, acceptOffer, updateOfferStatus } from '../data/dataAccess';
import { rankOffersByNetReturn, getUrgency } from '../utils/calculations';
import { formatINR, formatNumberIN, formatDate, getDeadlineLabel } from '../utils/formatters';
import { UrgencyBadge, StatusBadge, BestReturnBadge } from '../components/common/Badge';
import { NetReturnBreakdown } from '../components/comparison/NetReturnBreakdown';
import { EmptyState } from '../components/common/EmptyState';
import { DisclaimerNotice } from '../components/common/DisclaimerNotice';

export const FarmerOffersComparisonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentProfile, switchProfile, dataRevision } = useDemoUser();

  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // Load listing
  const listing = useMemo(() => {
    if (!id) return undefined;
    return getListingById(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, dataRevision, actionNotice]);

  const ownerFarmer = useMemo(() => {
    if (!listing) return undefined;
    return getProfileById(listing.farmerId);
  }, [listing]);

  // Load and rank offers for this listing
  const rankedOffers = useMemo(() => {
    if (!listing) return [];
    const rawOffers = getOffersForListing(listing.id);
    // Rank using underlying numeric estimatedNetReturn
    const ranked = rankOffersByNetReturn(rawOffers);
    // Attach buyer profiles
    return ranked.map(o => ({
      ...o,
      buyer: getProfileById(o.buyerId),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing, dataRevision, actionNotice]);

  // Invalid ID check
  if (!listing) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-xl font-bold text-stone-900">Produce listing not found</h1>
        <p className="text-xs text-stone-500">The listing you are trying to view does not exist.</p>
        <Link to="/farmer/listings" className="text-xs font-semibold text-emerald-800 underline">
          Back to my listings
        </Link>
      </div>
    );
  }

  const isOwner = currentProfile.id === listing.farmerId;

  // Ownership verification check
  if (!isOwner) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center space-y-4 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto font-bold text-base">
            🔒
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Produce belongs to another producer</h2>
            <p className="text-xs text-stone-600 mt-1 max-w-md mx-auto">
              This produce listing (<em>{listing.produceName}</em>) belongs to{' '}
              <strong>{ownerFarmer?.fullName || 'another farmer'}</strong> ({listing.location}). You are currently signed in as{' '}
              <strong>{currentProfile.fullName}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {ownerFarmer && (
              <button
                type="button"
                onClick={() => switchProfile(ownerFarmer.id)}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Switch to {ownerFarmer.fullName}
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate(currentProfile.role === 'farmer' ? '/farmer/listings' : '/marketplace')}
              className="px-4 py-2 bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 rounded text-xs font-semibold transition-colors cursor-pointer"
            >
              {currentProfile.role === 'farmer' ? 'View my own listings' : 'Back to marketplace'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const urgency = getUrgency(listing.sellWithinDays);
  const isListingSold = listing.status === 'sold';

  // Handle Accept Offer action
  const handleAccept = (offerId: string) => {
    const res = acceptOffer(offerId);
    if (res.success) {
      setActionNotice({
        type: 'success',
        message: 'Offer accepted. Parent listing is now marked as sold, and other pending offers have been closed.',
      });
    } else {
      setActionNotice({
        type: 'error',
        message: res.error || 'Failed to accept offer.',
      });
    }
  };

  // Handle Reject Offer action
  const handleReject = (offerId: string) => {
    const res = updateOfferStatus(offerId, 'rejected');
    if (res) {
      setActionNotice({
        type: 'info',
        message: 'Offer rejected.',
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="text-xs text-stone-500 flex items-center gap-1">
        <Link to="/farmer" className="hover:underline">Dashboard</Link> &gt;{' '}
        <Link to="/farmer/listings" className="hover:underline">My listings</Link> &gt;{' '}
        <span>Offers comparison</span>
      </div>

      {/* Listing summary banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                {listing.category}
              </span>
              <StatusBadge status={listing.status} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Compare offers: {listing.produceName}
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              {listing.location} • Listed on {formatDate(listing.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:self-start">
            <UrgencyBadge urgency={urgency} sellWithinDays={listing.sellWithinDays} />
          </div>
        </div>

        {/* Listing spec summary bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs">
          <div>
            <span className="text-stone-500 block">Total quantity:</span>
            <span className="font-semibold text-stone-900">
              {formatNumberIN(listing.quantity)} {listing.unit}
            </span>
          </div>
          <div>
            <span className="text-stone-500 block">Target price:</span>
            <span className="font-semibold text-stone-900">
              {formatINR(listing.expectedPrice)} / {listing.unit}
            </span>
          </div>
          <div>
            <span className="text-stone-500 block">Stated deadline:</span>
            <span className="font-semibold text-stone-900">
              {getDeadlineLabel(listing.sellWithinDays)}
            </span>
          </div>
          <div>
            <span className="text-stone-500 block">Offers received:</span>
            <span className="font-semibold text-stone-900">
              {rankedOffers.length} ({rankedOffers.filter(o => o.status === 'pending').length} pending)
            </span>
          </div>
        </div>
      </div>

      {/* Action Notice Alert */}
      {actionNotice && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-medium'
              : actionNotice.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-300'
              : 'bg-stone-100 text-stone-800 border-stone-300'
          }`}
        >
          <span>{actionNotice.message}</span>
          <button
            onClick={() => setActionNotice(null)}
            className="text-stone-400 hover:text-stone-700 ml-4 font-bold cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Comparison Explainer Notice */}
      <div className="bg-emerald-950 text-stone-100 rounded-xl p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">
            Net-return ranking active
          </h2>
        </div>
        <p className="text-xs text-stone-300 leading-relaxed">
          Offers are ranked by <strong className="text-white">estimated take-home net return</strong> (Total Gross − Transport − Packaging − Other Costs) rather than price per unit alone. An offer with a lower gross price per unit can produce a higher estimated net return if selling costs are lower.
        </p>
      </div>

      <DisclaimerNotice />

      {/* Offers Comparison Cards */}
      {rankedOffers.length === 0 ? (
        <EmptyState
          title="No buyer offers received yet"
          description="Buyers have not submitted offers for this produce listing yet. Check back soon or view the listing details."
          actionText="View produce listing"
          onAction={() => window.location.assign(`/listing/${listing.id}`)}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900">
              Buyer offers ({rankedOffers.length})
            </h2>
            <span className="text-xs text-stone-500">
              Ranked from highest estimated take-home return to lowest
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {rankedOffers.map((offer, index) => {
              const isBest = offer.isBestReturn;
              const isTied = offer.isTied;
              const isPending = offer.status === 'pending';
              const isAccepted = offer.status === 'accepted';
              const isRejected = offer.status === 'rejected';

              return (
                <div
                  key={offer.id}
                  className={`bg-white rounded-xl border p-6 flex flex-col justify-between transition-all relative ${
                    isAccepted
                      ? 'border-2 border-emerald-600 ring-2 ring-emerald-600/20 bg-emerald-50/30 shadow-xs'
                      : isBest
                      ? 'border-2 border-emerald-700 ring-4 ring-emerald-700/15 bg-emerald-50/40 shadow-md'
                      : 'border-stone-200 shadow-xs'
                  }`}
                >
                  {/* Highlight Ribbon */}
                  {isBest && (
                    <div className="absolute -top-3 right-6">
                      <BestReturnBadge isTied={isTied} />
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Buyer Header */}
                    <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-stone-500">
                            Rank #{index + 1}
                          </span>
                          <StatusBadge status={offer.status} />
                        </div>
                        <h3 className="text-base font-bold text-stone-900 mt-1">
                          {offer.buyer?.fullName || 'Wholesale Buyer'}
                        </h3>
                        <div className="text-xs text-stone-500">
                          {offer.buyer?.location || 'Tamil Nadu'}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg sm:text-xl font-extrabold text-stone-900">
                          {formatINR(offer.offerPricePerUnit)}{' '}
                          <span className="text-xs font-normal text-stone-500">/ {listing.unit}</span>
                        </div>
                        <div className="text-[11px] text-stone-500">
                          for {formatNumberIN(offer.offeredQuantity)} {listing.unit}
                        </div>
                      </div>
                    </div>

                    {/* Logistics and Terms */}
                    <div className="grid grid-cols-2 gap-2 text-xs py-1">
                      <div>
                        <span className="text-stone-500 block">Pickup preference:</span>
                        <span className="font-semibold text-stone-800 capitalize">
                          {offer.pickupPreference === 'pickup'
                            ? 'Farmgate pickup (Buyer)'
                            : 'Farmer delivery (Hub)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-500 block">Offer submitted:</span>
                        <span className="text-stone-700">{formatDate(offer.createdAt)}</span>
                      </div>
                    </div>

                    {offer.message && (
                      <div className="bg-stone-50 p-2.5 rounded text-xs text-stone-600 border border-stone-200">
                        <span className="font-semibold text-stone-700 block">Buyer note:</span>
                        {offer.message}
                      </div>
                    )}

                    {/* Full Transparent Gross-to-Net Breakdown */}
                    <NetReturnBreakdown
                      offeredQuantity={offer.offeredQuantity}
                      unit={listing.unit}
                      offerPricePerUnit={offer.offerPricePerUnit}
                      totalOfferAmount={offer.totalOfferAmount}
                      transportCost={offer.transportCost}
                      packagingCost={offer.packagingCost}
                      otherCosts={offer.otherCosts}
                      estimatedNetReturn={offer.estimatedNetReturn}
                    />
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                    <div className="text-xs text-stone-500">
                      {isAccepted && (
                        <span className="font-bold text-emerald-800">
                          ✓ Offer accepted • Lot sold
                        </span>
                      )}
                      {isRejected && (
                        <span className="text-stone-400">
                          Offer declined
                        </span>
                      )}
                      {isPending && isListingSold && (
                        <span className="text-stone-400 text-[11px]">
                          Produce sold to another buyer
                        </span>
                      )}
                    </div>

                    {/* Accept / Reject Buttons */}
                    {isPending && !isListingSold && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleReject(offer.id)}
                          className="px-3 py-1.5 border border-stone-300 text-stone-700 hover:bg-stone-100 rounded text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Reject offer
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAccept(offer.id)}
                          className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          Accept offer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
