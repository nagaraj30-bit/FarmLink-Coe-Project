import type { NetReturnCalculation, Offer, UrgencyLevel } from '../types';

/**
 * Calculates total offer amount and estimated take-home net return.
 * 
 * Formula:
 * Total Offer Amount = Offered Quantity × Offer Price Per Unit
 * Estimated Net Return = Total Offer Amount − Transport Cost − Packaging Cost − Other Selling Costs
 */
export function calculateNetReturn(
  offeredQuantity: number,
  offerPricePerUnit: number,
  transportCost: number,
  packagingCost: number,
  otherCosts: number
): NetReturnCalculation {
  const safeQty = Math.max(0, Number(offeredQuantity) || 0);
  const safePrice = Math.max(0, Number(offerPricePerUnit) || 0);
  const safeTransport = Math.max(0, Number(transportCost) || 0);
  const safePackaging = Math.max(0, Number(packagingCost) || 0);
  const safeOther = Math.max(0, Number(otherCosts) || 0);

  const totalOfferAmount = safeQty * safePrice;
  const totalCosts = safeTransport + safePackaging + safeOther;
  const estimatedNetReturn = totalOfferAmount - totalCosts;

  return {
    totalOfferAmount,
    estimatedNetReturn,
    totalCosts,
  };
}

/**
 * Derives urgency based strictly on the farmer's stated selling deadline (sellWithinDays).
 * This is a deadline-based indicator, not an AI or predictive spoilage estimation.
 */
export function getUrgency(sellWithinDays: number): UrgencyLevel {
  const days = Number(sellWithinDays);
  if (days <= 1) {
    return 'high';
  }
  if (days <= 3) {
    return 'medium';
  }
  return 'normal';
}

/**
 * Compares offers using underlying NUMERIC estimatedNetReturn values.
 * Identifies the best estimated return offer(s) among active/accepted candidates and handles exact numeric ties cleanly.
 * Never compares formatted currency strings.
 */
export function rankOffersByNetReturn<T extends Offer>(offers: T[]): (T & { isBestReturn: boolean; isTied: boolean })[] {
  if (!offers || offers.length === 0) return [];

  // Partition into eligible (pending or accepted) and declined/rejected
  const eligible = offers.filter(o => o.status !== 'rejected');
  const rejected = offers.filter(o => o.status === 'rejected');

  // Sort eligible descending by numeric estimatedNetReturn
  eligible.sort((a, b) => b.estimatedNetReturn - a.estimatedNetReturn);
  // Sort rejected descending by numeric estimatedNetReturn as well
  rejected.sort((a, b) => b.estimatedNetReturn - a.estimatedNetReturn);

  let highestReturn: number | null = null;
  let isTied = false;

  if (eligible.length > 0) {
    highestReturn = eligible[0].estimatedNetReturn;
    const topCount = eligible.filter(o => Math.abs(o.estimatedNetReturn - highestReturn!) < 0.001).length;
    isTied = topCount > 1;
  }

  const processedEligible = eligible.map(offer => {
    const isBest = highestReturn !== null && Math.abs(offer.estimatedNetReturn - highestReturn) < 0.001;
    return {
      ...offer,
      isBestReturn: isBest,
      isTied: isBest && isTied,
    };
  });

  const processedRejected = rejected.map(offer => ({
    ...offer,
    isBestReturn: false,
    isTied: false,
  }));

  return [...processedEligible, ...processedRejected];
}
