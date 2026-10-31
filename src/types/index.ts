export type UserRole = 'farmer' | 'buyer';

export type ProduceUnit = 'kg' | 'quintal' | 'box' | 'bags' | 'nuts';

export type UrgencyLevel = 'high' | 'medium' | 'normal';

export type ListingStatus = 'active' | 'negotiating' | 'sold' | 'expired';

export type OfferStatus = 'pending' | 'accepted' | 'declined';

export interface UserProfile {
  id: string;
  name: string;
  nameTa: string;
  role: UserRole;
  phone: string;
  district: string;
  districtTa: string;
  location: string;
  locationTa: string;
  avatar: string;
  fpoMember?: boolean;
  fpoName?: string;
  businessType?: string;
  businessTypeTa?: string;
}

export interface ProduceListing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerNameTa: string;
  farmerPhone: string;
  cropName: string;
  cropNameTa: string;
  variety: string;
  varietyTa: string;
  category: 'Vegetables' | 'Fruits' | 'Grains' | 'Spices' | 'Oilseeds';
  quantity: number;
  unit: ProduceUnit;
  expectedPricePerUnit: number;
  minAcceptablePricePerUnit: number;
  harvestingDate: string;
  listedDate: string;
  sellWithinDays: number;
  storageCondition: string;
  storageConditionTa: string;
  district: string;
  districtTa: string;
  mandiBenchmarkPrice?: number;
  benchmarkSource?: string;
  benchmarkDate?: string;
  transportEstimate: number;
  packagingEstimate: number;
  status: ListingStatus;
  description: string;
  descriptionTa: string;
}

export interface Offer {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName: string;
  buyerNameTa: string;
  buyerType: string;
  buyerTypeTa: string;
  buyerPhone: string;
  quantity: number;
  unit: ProduceUnit; // Inherited & locked from ProduceListing
  offeredPricePerUnit: number;
  transportCost: number;
  packagingCost: number;
  otherCosts: number;
  paymentTerms: string;
  paymentTermsTa: string;
  pickupLocation: string;
  pickupLocationTa: string;
  notes: string;
  notesTa?: string;
  status: OfferStatus;
  createdAt: string;
}

export interface NetReturnCalculation {
  quantity: number;
  unit: ProduceUnit;
  offeredPricePerUnit: number;
  grossTotal: number;
  transportCost: number;
  packagingCost: number;
  otherCosts: number;
  totalSellingCosts: number;
  estimatedNetReturn: number;
  netReturnPerUnit: number;
  isBestReturn?: boolean;
  rank?: number;
}

export interface UnsoldGuidance {
  id: string;
  title: string;
  titleTa: string;
  category: 'storage' | 'processing' | 'direct_sale' | 'fpo' | 'recovery';
  urgencySuitability: UrgencyLevel[];
  description: string;
  descriptionTa: string;
  actionSteps: string[];
  actionStepsTa: string[];
  contactSupport: string;
  contactSupportTa: string;
  estimatedRecoveryPct: string;
}
