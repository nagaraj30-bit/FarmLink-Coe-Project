import { NetReturnCalculation, Offer, ProduceListing, ProduceUnit, UrgencyLevel } from '../types';

export const MANDATORY_DISCLAIMER_EN = 'Estimated net return, based on entered costs — not a guaranteed profit.';
export const MANDATORY_DISCLAIMER_TA = 'உள்ளீடு செய்யப்பட்ட செலவுகளின் அடிப்படையில் கணக்கிடப்பட்ட நிகர வருவாய் — உத்தரவாதமான லாபம் அல்ல.';

/**
 * Calculates estimated net return and breakdown strictly numerically.
 */
export function calculateNetReturn(
  quantity: number,
  offeredPricePerUnit: number,
  transportCost: number = 0,
  packagingCost: number = 0,
  otherCosts: number = 0,
  unit: ProduceUnit = 'kg'
): NetReturnCalculation {
  const safeQty = Math.max(0, Number(quantity) || 0);
  const safePrice = Math.max(0, Number(offeredPricePerUnit) || 0);
  const safeTransport = Math.max(0, Number(transportCost) || 0);
  const safePackaging = Math.max(0, Number(packagingCost) || 0);
  const safeOther = Math.max(0, Number(otherCosts) || 0);

  const grossTotal = safeQty * safePrice;
  const totalSellingCosts = safeTransport + safePackaging + safeOther;
  const estimatedNetReturn = grossTotal - totalSellingCosts;
  const netReturnPerUnit = safeQty > 0 ? estimatedNetReturn / safeQty : 0;

  return {
    quantity: safeQty,
    unit,
    offeredPricePerUnit: safePrice,
    grossTotal,
    transportCost: safeTransport,
    packagingCost: safePackaging,
    otherCosts: safeOther,
    totalSellingCosts,
    estimatedNetReturn,
    netReturnPerUnit,
  };
}

/**
 * Derives selling urgency strictly based on farmer-entered sellWithinDays
 * <= 1 day: High urgency
 * 2 to 3 days: Medium urgency
 * > 3 days: Normal urgency
 */
export function getSellingUrgency(sellWithinDays: number): {
  level: UrgencyLevel;
  labelEn: string;
  labelTa: string;
  daysRemaining: number;
} {
  const days = Math.max(0, Math.round(Number(sellWithinDays) || 0));

  if (days <= 1) {
    return {
      level: 'high',
      labelEn: 'High Urgency (Sell within 24h)',
      labelTa: 'அதிக அவசரம் (24 மணி நேரத்திற்குள் விற்கவும்)',
      daysRemaining: days,
    };
  }
  if (days <= 3) {
    return {
      level: 'medium',
      labelEn: `Medium Urgency (${days} days left)`,
      labelTa: `நடுத்தர அவசரம் (${days} நாட்கள் உள்ளன)`,
      daysRemaining: days,
    };
  }
  return {
    level: 'normal',
    labelEn: `Normal Urgency (${days} days left)`,
    labelTa: `இயல்பானது (${days} நாட்கள் உள்ளன)`,
    daysRemaining: days,
  };
}

export interface RankedOffer {
  offer: Offer;
  calculation: NetReturnCalculation;
  isBestReturn: boolean;
  rank: number;
}

/**
 * Ranks offers numerically by estimatedNetReturn descending.
 * Handles ties gracefully by awarding isBestReturn to all offers with max net return.
 */
export function rankOffers(offers: Offer[], listing: ProduceListing): RankedOffer[] {
  if (!offers || offers.length === 0) return [];

  // Calculate net return for each offer
  const calculated = offers.map((offer) => {
    // Quantity cannot exceed listing available quantity logically
    const validQty = Math.min(offer.quantity, listing.quantity);
    const calc = calculateNetReturn(
      validQty,
      offer.offeredPricePerUnit,
      offer.transportCost,
      offer.packagingCost,
      offer.otherCosts,
      listing.unit
    );
    return {
      offer,
      calculation: calc,
    };
  });

  // Sort descending by numeric estimatedNetReturn
  calculated.sort((a, b) => b.calculation.estimatedNetReturn - a.calculation.estimatedNetReturn);

  // Eligible offers for best return must not be declined
  const eligibleOffers = calculated.filter((item) => item.offer.status !== 'declined');
  const highestReturn = eligibleOffers.length > 0 ? eligibleOffers[0].calculation.estimatedNetReturn : 0;

  return calculated.map((item, index) => {
    // Both items get isBestReturn if tied at top among eligible non-declined offers
    const isEligible = item.offer.status !== 'declined';
    const isBest = isEligible && highestReturn > 0 && item.calculation.estimatedNetReturn === highestReturn;
    return {
      offer: item.offer,
      calculation: {
        ...item.calculation,
        isBestReturn: isBest,
        rank: index + 1,
      },
      isBestReturn: isBest,
      rank: index + 1,
    };
  });
}
