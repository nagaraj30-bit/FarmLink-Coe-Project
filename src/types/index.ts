export interface Profile {
  id: string;
  fullName: string;
  role: 'farmer' | 'buyer';
  location: string;
  phone?: string;
}

export interface ProduceListing {
  id: string;
  farmerId: string;
  produceName: string;
  category: string;
  quantity: number;
  unit: string;
  quality: string;
  location: string;
  harvestDate: string;
  sellWithinDays: number;
  expectedPrice: number;
  description?: string;
  status: 'active' | 'sold' | 'expired';
  createdAt: string;
}

export interface Offer {
  id: string;
  listingId: string;
  buyerId: string;
  offeredQuantity: number;
  offerPricePerUnit: number;
  totalOfferAmount: number;
  transportCost: number;
  packagingCost: number;
  otherCosts: number;
  estimatedNetReturn: number;
  pickupPreference: 'pickup' | 'delivery';
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export type UrgencyLevel = 'high' | 'medium' | 'normal';

export interface NetReturnCalculation {
  totalOfferAmount: number;
  estimatedNetReturn: number;
  totalCosts: number;
}

export interface OfferWithBuyer extends Offer {
  buyer?: Profile;
  isBestReturn?: boolean;
  isTied?: boolean;
}
