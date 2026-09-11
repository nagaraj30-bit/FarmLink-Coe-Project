import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDemoUser } from '../hooks/useDemoUser';
import { getListingById, getProfileById, getOffersForListing } from '../data/dataAccess';
import { getUrgency } from '../utils/calculations';
import { formatINR, formatNumberIN, formatDate, getDeadlineLabel } from '../utils/formatters';
import { UrgencyBadge, StatusBadge } from '../components/common/Badge';
import { DisclaimerNotice } from '../components/common/DisclaimerNotice';

export const ProduceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentProfile, dataRevision } = useDemoUser();

  const listing = useMemo(() => {
    if (!id) return undefined;
    return getListingById(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, dataRevision]);

  const farmer = useMemo(() => {
    if (!listing) return undefined;
    return getProfileById(listing.farmerId);
  }, [listing]);

  const offers = useMemo(() => {
    if (!listing) return [];
    return getOffersForListing(listing.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing, dataRevision]);

  // Invalid ID handling
  if (!listing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-500 mx-auto flex items-center justify-center font-bold">
          ?
        </div>
        <h1 className="text-xl font-bold text-stone-900">Produce listing not found</h1>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          The requested produce listing ID does not exist or may have been removed.
        </p>
        <div className="pt-2">
          <Link
            to="/marketplace"
            className="inline-flex items-center px-4 py-2 bg-emerald-800 text-white rounded-md text-xs font-semibold hover:bg-emerald-900"
          >
            Back to marketplace
          </Link>
        </div>
      </div>
    );
  }

  const urgency = getUrgency(listing.sellWithinDays);
  const isOwner = currentProfile.id === listing.farmerId;
  const isAvailable = listing.status === 'active';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="text-xs text-stone-500">
        <Link to="/marketplace" className="hover:underline">Marketplace</Link> &gt; <span>{listing.produceName}</span>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6">
        {/* Title header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-stone-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                {listing.category}
              </span>
              <StatusBadge status={listing.status} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              {listing.produceName}
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Grown by {farmer?.fullName || 'Registered Farmer'} • {listing.location}
            </p>
          </div>

          <div className="sm:text-right">
            <div className="text-xs text-stone-500">Target price</div>
            <div className="text-2xl font-bold text-emerald-900">
              {formatINR(listing.expectedPrice)} <span className="text-sm font-normal text-stone-500">/ {listing.unit}</span>
            </div>
          </div>
        </div>

        {/* Urgency & Selling Deadline callout */}
        <div className="bg-stone-50 rounded-lg p-4 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs font-bold text-stone-900">
              Farmer stated selling deadline: {getDeadlineLabel(listing.sellWithinDays)}
            </div>
            <p className="text-[11px] text-stone-500">
              Urgency level reflects the farmer&apos;s scheduling deadline ({listing.sellWithinDays} {listing.sellWithinDays === 1 ? 'day' : 'days'}). Not an AI spoilage prediction.
            </p>
          </div>
          <UrgencyBadge urgency={urgency} sellWithinDays={listing.sellWithinDays} />
        </div>

        {/* Specifications grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 border-y border-stone-100 text-xs">
          <div>
            <span className="text-stone-500 block">Available lot:</span>
            <span className="font-semibold text-stone-900 text-sm">
              {formatNumberIN(listing.quantity)} {listing.unit}
            </span>
          </div>
          <div>
            <span className="text-stone-500 block">Quality grade:</span>
            <span className="font-semibold text-stone-900 text-sm">{listing.quality}</span>
          </div>
          <div>
            <span className="text-stone-500 block">Harvest date:</span>
            <span className="font-semibold text-stone-900 text-sm">{formatDate(listing.harvestDate)}</span>
          </div>
          <div>
            <span className="text-stone-500 block">Total offers received:</span>
            <span className="font-semibold text-stone-900 text-sm">{offers.length}</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
            Farmer notes & logistics
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed bg-stone-50/60 p-3 rounded border border-stone-200">
            {listing.description || 'Harvested produce ready for pickup and transport from farm gate.'}
          </p>
        </div>

        {/* Farmer info */}
        <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
            Producer Information
          </h3>
          <div className="text-xs text-stone-600 space-y-1">
            <div><strong>Farmer:</strong> {farmer?.fullName || 'Farmer'}</div>
            <div><strong>Location:</strong> {listing.location}</div>
            {farmer?.phone && <div><strong>Contact:</strong> {farmer.phone}</div>}
          </div>
        </div>

        <DisclaimerNotice />

        {/* Action footer */}
        <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            to="/marketplace"
            className="text-xs font-semibold text-stone-600 hover:text-stone-900"
          >
            ← Back to marketplace
          </Link>

          <div className="flex items-center gap-3">
            {isOwner && (
              <Link
                to={`/farmer/listings/${listing.id}/offers`}
                className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors"
              >
                Compare offers ({offers.length})
              </Link>
            )}

            {isAvailable ? (
              <Link
                to={`/listing/${listing.id}/offer`}
                className="px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors"
              >
                Make offer
              </Link>
            ) : (
              <div className="text-xs font-medium text-stone-500 bg-stone-100 px-3 py-2 rounded">
                This listing is marked as {listing.status}. New offers are closed.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
