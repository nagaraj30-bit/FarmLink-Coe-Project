import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDemoUser } from '../hooks/useDemoUser';
import { getListingById, createOffer } from '../data/dataAccess';
import { calculateNetReturn } from '../utils/calculations';
import { formatINR, formatNumberIN } from '../utils/formatters';
import { NetReturnBreakdown } from '../components/comparison/NetReturnBreakdown';
import { DisclaimerNotice } from '../components/common/DisclaimerNotice';

export const MakeOfferPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentProfile, isBuyer, switchRole, dataRevision } = useDemoUser();

  const listing = useMemo(() => {
    if (!id) return undefined;
    return getListingById(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, dataRevision]);

  // Form state
  const [offeredQuantity, setOfferedQuantity] = useState<string>('');
  const [offerPricePerUnit, setOfferPricePerUnit] = useState<string>('');
  const [transportCost, setTransportCost] = useState<string>('0');
  const [packagingCost, setPackagingCost] = useState<string>('0');
  const [otherCosts, setOtherCosts] = useState<string>('0');
  const [pickupPreference, setPickupPreference] = useState<'pickup' | 'delivery'>('pickup');
  const [message, setMessage] = useState<string>('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState<string>('');

  // Auto-fill initial values if available
  React.useEffect(() => {
    if (listing) {
      setOfferedQuantity(String(listing.quantity));
      setOfferPricePerUnit(String(listing.expectedPrice));
    }
  }, [listing]);

  // Calculations
  const calc = useMemo(() => {
    return calculateNetReturn(
      Number(offeredQuantity) || 0,
      Number(offerPricePerUnit) || 0,
      Number(transportCost) || 0,
      Number(packagingCost) || 0,
      Number(otherCosts) || 0
    );
  }, [offeredQuantity, offerPricePerUnit, transportCost, packagingCost, otherCosts]);

  // Invalid ID
  if (!listing) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-xl font-bold text-stone-900">Listing not found</h1>
        <p className="text-xs text-stone-500">The produce listing for this offer does not exist.</p>
        <Link to="/marketplace" className="text-xs font-semibold text-emerald-800 underline">
          Back to marketplace
        </Link>
      </div>
    );
  }

  // Listing is closed
  if (listing.status !== 'active') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="bg-stone-50 border border-stone-200 p-6 rounded-xl space-y-2">
          <h1 className="text-lg font-bold text-stone-900">Offers are closed</h1>
          <p className="text-xs text-stone-600">
            This produce listing is marked as <strong>{listing.status}</strong> and cannot accept new offers.
          </p>
          <div className="pt-2">
            <Link
              to="/marketplace"
              className="inline-flex px-4 py-2 bg-emerald-800 text-white rounded text-xs font-semibold"
            >
              Browse other listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Validation
  const numQty = Number(offeredQuantity);
  const numPrice = Number(offerPricePerUnit);
  const numTransport = Number(transportCost);
  const numPackaging = Number(packagingCost);
  const numOther = Number(otherCosts);

  const errors = {
    offeredQuantity:
      !offeredQuantity || numQty <= 0
        ? 'Quantity must be greater than 0.'
        : numQty > listing.quantity
        ? `Quantity cannot exceed available lot (${formatNumberIN(listing.quantity)} ${listing.unit}).`
        : '',
    offerPricePerUnit:
      !offerPricePerUnit || numPrice <= 0
        ? 'Price per unit must be greater than 0.'
        : '',
    transportCost:
      isNaN(numTransport) || numTransport < 0 ? 'Transport cost cannot be negative.' : '',
    packagingCost:
      isNaN(numPackaging) || numPackaging < 0 ? 'Packaging cost cannot be negative.' : '',
    otherCosts:
      isNaN(numOther) || numOther < 0 ? 'Other costs cannot be negative.' : '',
    netReturn:
      calc.estimatedNetReturn < 0 ? 'Estimated deductions cannot exceed total offer amount.' : '',
  };

  const isValid = !Object.values(errors).some(err => err.length > 0);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const shouldShowError = (field: keyof typeof errors, value: string) => {
    return (touched[field] || (value !== '' && errors[field])) && !!errors[field];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const result = createOffer({
      listingId: listing.id,
      buyerId: currentProfile.id,
      offeredQuantity: numQty,
      offerPricePerUnit: numPrice,
      transportCost: numTransport,
      packagingCost: numPackaging,
      otherCosts: numOther,
      pickupPreference,
      message,
    });

    if (!result.success) {
      setServerError(result.error || 'Failed to submit offer.');
      return;
    }

    // Success navigate back to marketplace
    navigate('/marketplace');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="text-xs text-stone-500">
        <Link to="/marketplace" className="hover:underline">Marketplace</Link> &gt;{' '}
        <Link to={`/listing/${listing.id}`} className="hover:underline">{listing.produceName}</Link> &gt;{' '}
        <span>Make offer</span>
      </div>

      {/* Buyer profile notice if currently viewed as farmer */}
      {!isBuyer && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs flex items-center justify-between text-amber-900">
          <span>You are currently viewing as farmer ({currentProfile.fullName}). Offers are typically submitted by buyers.</span>
          <button
            type="button"
            onClick={() => switchRole('buyer')}
            className="underline font-semibold cursor-pointer"
          >
            Switch to buyer mode
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div>
          <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Make offer
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mt-1">
            Submit offer for {listing.produceName}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Available lot: <strong>{formatNumberIN(listing.quantity)} {listing.unit}</strong> • Target price:{' '}
            <strong>{formatINR(listing.expectedPrice)} / {listing.unit}</strong>
          </p>
        </div>

        {serverError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quantity & Unit (Inherited & Locked) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="offeredQuantity" className="block text-xs font-semibold text-stone-700 mb-1">
                Offered quantity <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="offeredQuantity"
                  name="offeredQuantity"
                  min="1"
                  max={listing.quantity}
                  step="any"
                  value={offeredQuantity}
                  onChange={e => setOfferedQuantity(e.target.value)}
                  onBlur={() => handleBlur('offeredQuantity')}
                  className={`w-full pr-16 pl-3 py-2 text-sm rounded-md border ${
                    shouldShowError('offeredQuantity', offeredQuantity)
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-stone-300 focus:border-emerald-700'
                  } focus:outline-hidden`}
                />
                <span className="absolute right-3 top-2 text-xs font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded select-none">
                  {listing.unit}
                </span>
              </div>
              <p className="text-[10px] text-stone-500 mt-1">
                Unit is locked to parent listing ({listing.unit}). Max available: {formatNumberIN(listing.quantity)} {listing.unit}.
              </p>
              {shouldShowError('offeredQuantity', offeredQuantity) && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.offeredQuantity}</p>
              )}
            </div>

            <div>
              <label htmlFor="offerPricePerUnit" className="block text-xs font-semibold text-stone-700 mb-1">
                Offer price per {listing.unit} (₹) <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-stone-500 text-sm">₹</span>
                <input
                  type="number"
                  id="offerPricePerUnit"
                  name="offerPricePerUnit"
                  min="0.5"
                  step="any"
                  value={offerPricePerUnit}
                  onChange={e => setOfferPricePerUnit(e.target.value)}
                  onBlur={() => handleBlur('offerPricePerUnit')}
                  className={`w-full pl-7 pr-3 py-2 text-sm rounded-md border ${
                    shouldShowError('offerPricePerUnit', offerPricePerUnit)
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-stone-300 focus:border-emerald-700'
                  } focus:outline-hidden`}
                />
              </div>
              {shouldShowError('offerPricePerUnit', offerPricePerUnit) && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.offerPricePerUnit}</p>
              )}
            </div>
          </div>

          {/* Logistics & Cost Estimates */}
          <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                Logistics and estimated selling deductions
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Transport, packaging, and other costs are entered as estimated selling costs for transparent comparison.
              </p>
            </div>

            {/* Pickup preference */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Pickup preference
              </label>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="pickupPreference"
                    value="pickup"
                    checked={pickupPreference === 'pickup'}
                    onChange={() => setPickupPreference('pickup')}
                    className="text-emerald-800 focus:ring-emerald-700"
                  />
                  <span>Farmgate pickup (Buyer arranges transport from farm)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="pickupPreference"
                    value="delivery"
                    checked={pickupPreference === 'delivery'}
                    onChange={() => setPickupPreference('delivery')}
                    className="text-emerald-800 focus:ring-emerald-700"
                  />
                  <span>Farmer delivery (Farmer dispatches to buyer destination)</span>
                </label>
              </div>
            </div>

            {/* Cost breakdown inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="transportCost" className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Estimated transport cost (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-stone-500 text-xs">₹</span>
                  <input
                    type="number"
                    id="transportCost"
                    name="transportCost"
                    min="0"
                    step="any"
                    value={transportCost}
                    onChange={e => setTransportCost(e.target.value)}
                    onBlur={() => handleBlur('transportCost')}
                    className={`w-full pl-6 pr-2 py-1.5 text-xs rounded border bg-white ${
                      shouldShowError('transportCost', transportCost) ? 'border-rose-500 bg-rose-50/20' : 'border-stone-300'
                    }`}
                  />
                </div>
                {shouldShowError('transportCost', transportCost) && (
                  <p className="text-[10px] text-rose-600 mt-1">{errors.transportCost}</p>
                )}
              </div>

              <div>
                <label htmlFor="packagingCost" className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Estimated packaging cost (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-stone-500 text-xs">₹</span>
                  <input
                    type="number"
                    id="packagingCost"
                    name="packagingCost"
                    min="0"
                    step="any"
                    value={packagingCost}
                    onChange={e => setPackagingCost(e.target.value)}
                    onBlur={() => handleBlur('packagingCost')}
                    className={`w-full pl-6 pr-2 py-1.5 text-xs rounded border bg-white ${
                      shouldShowError('packagingCost', packagingCost) ? 'border-rose-500 bg-rose-50/20' : 'border-stone-300'
                    }`}
                  />
                </div>
                {shouldShowError('packagingCost', packagingCost) && (
                  <p className="text-[10px] text-rose-600 mt-1">{errors.packagingCost}</p>
                )}
              </div>

              <div>
                <label htmlFor="otherCosts" className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Other selling deductions (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-stone-500 text-xs">₹</span>
                  <input
                    type="number"
                    id="otherCosts"
                    name="otherCosts"
                    min="0"
                    step="any"
                    value={otherCosts}
                    onChange={e => setOtherCosts(e.target.value)}
                    onBlur={() => handleBlur('otherCosts')}
                    className={`w-full pl-6 pr-2 py-1.5 text-xs rounded border bg-white ${
                      shouldShowError('otherCosts', otherCosts) ? 'border-rose-500 bg-rose-50/20' : 'border-stone-300'
                    }`}
                  />
                </div>
                {shouldShowError('otherCosts', otherCosts) && (
                  <p className="text-[10px] text-rose-600 mt-1">{errors.otherCosts}</p>
                )}
              </div>
            </div>

            {errors.netReturn && (
              <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded">
                {errors.netReturn}
              </div>
            )}
          </div>

          {/* Buyer Message */}
          <div>
            <label htmlFor="message" className="block text-xs font-semibold text-stone-700 mb-1">
              Message or loading terms for farmer (optional)
            </label>
            <textarea
              id="message"
              name="message"
              rows={2}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="e.g. Can load tomorrow morning, payment by RTGS upon loading."
              className="w-full px-3 py-2 text-xs rounded-md border border-stone-300 focus:border-emerald-700 focus:outline-hidden"
            />
          </div>

          {/* Live Net-Return Breakdown Preview */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-stone-800">
              Live calculation preview for farmer
            </h3>
            <NetReturnBreakdown
              offeredQuantity={numQty}
              unit={listing.unit}
              offerPricePerUnit={numPrice}
              totalOfferAmount={calc.totalOfferAmount}
              transportCost={numTransport}
              packagingCost={numPackaging}
              otherCosts={numOther}
              estimatedNetReturn={calc.estimatedNetReturn}
            />
          </div>

          <DisclaimerNotice />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <Link
              to={`/listing/${listing.id}`}
              className="px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-md"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!isValid}
              className={`px-6 py-2.5 text-sm font-semibold text-white rounded-lg shadow-xs transition-all ${
                isValid
                  ? 'bg-emerald-800 hover:bg-emerald-900 cursor-pointer'
                  : 'bg-stone-300 text-stone-500 cursor-not-allowed'
              }`}
            >
              Make offer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
