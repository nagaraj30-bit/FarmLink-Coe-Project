import type { Offer, ProduceListing, Profile } from '../types';
import { calculateNetReturn, getUrgency } from '../utils/calculations';
import { INITIAL_LISTINGS, INITIAL_OFFERS, INITIAL_PROFILES } from './mockData';

// Re-export calculation and urgency functions as required by data-access layer specification
export { calculateNetReturn, getUrgency };

const STORAGE_KEYS = {
  PROFILES: 'farmlink_profiles_v1',
  LISTINGS: 'farmlink_listings_v1',
  OFFERS: 'farmlink_offers_v1',
  ACTIVE_PROFILE: 'farmlink_active_profile_id_v1',
};

// Internal localStorage helpers isolated exclusively in this data access layer
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function getStoredItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return deepClone(fallback);
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return deepClone(fallback);
  }
}

function setStoredItem<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

function notifyDataUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('farmlink_data_updated'));
  }
}

// Initialize seed data if not present (only once)
export function initializeStorageIfEmpty(): void {
  try {
    if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
      setStoredItem(STORAGE_KEYS.PROFILES, deepClone(INITIAL_PROFILES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LISTINGS)) {
      setStoredItem(STORAGE_KEYS.LISTINGS, deepClone(INITIAL_LISTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.OFFERS)) {
      setStoredItem(STORAGE_KEYS.OFFERS, deepClone(INITIAL_OFFERS));
    }
  } catch (err) {
    console.error('Error initializing storage:', err);
  }
}

/**
 * Resets local database back to default initial mock data without duplicates.
 */
export function resetDemoData(): void {
  setStoredItem(STORAGE_KEYS.PROFILES, deepClone(INITIAL_PROFILES));
  setStoredItem(STORAGE_KEYS.LISTINGS, deepClone(INITIAL_LISTINGS));
  setStoredItem(STORAGE_KEYS.OFFERS, deepClone(INITIAL_OFFERS));
  setActiveProfileId('farmer-1');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('farmlink_data_reset'));
    notifyDataUpdated();
  }
}

// ---------------- ACTIVE PROFILE PERSISTENCE ---------------- //

export function getActiveProfileId(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE) || 'farmer-1';
  } catch {
    return 'farmer-1';
  }
}

export function setActiveProfileId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, id);
  } catch (err) {
    console.error('Error saving active profile ID:', err);
  }
}

// ---------------- PROFILES ---------------- //

export function getProfiles(): Profile[] {
  initializeStorageIfEmpty();
  return getStoredItem<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
}

export function getProfileById(id: string): Profile | undefined {
  const profiles = getProfiles();
  return profiles.find(p => p.id === id);
}

// ---------------- LISTINGS ---------------- //

export function getListings(filter?: { farmerId?: string; status?: ProduceListing['status'] | 'all' }): ProduceListing[] {
  initializeStorageIfEmpty();
  let listings = getStoredItem<ProduceListing[]>(STORAGE_KEYS.LISTINGS, INITIAL_LISTINGS);

  if (filter?.farmerId) {
    listings = listings.filter(l => l.farmerId === filter.farmerId);
  }

  if (filter?.status && filter.status !== 'all') {
    listings = listings.filter(l => l.status === filter.status);
  }

  // Newest first
  return listings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getListingById(id: string): ProduceListing | undefined {
  const listings = getListings();
  return listings.find(l => l.id === id);
}

export function createListing(data: {
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
}): ProduceListing {
  initializeStorageIfEmpty();
  const listings = getStoredItem<ProduceListing[]>(STORAGE_KEYS.LISTINGS, INITIAL_LISTINGS);

  const newListing: ProduceListing = {
    id: `listing-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    farmerId: data.farmerId,
    produceName: data.produceName.trim(),
    category: data.category.trim(),
    quantity: Math.max(1, Number(data.quantity) || 1),
    unit: data.unit.trim().toLowerCase(),
    quality: data.quality.trim(),
    location: data.location.trim(),
    harvestDate: data.harvestDate,
    sellWithinDays: Math.max(1, Number(data.sellWithinDays) || 1),
    expectedPrice: Math.max(1, Number(data.expectedPrice) || 1),
    description: data.description?.trim(),
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  listings.push(newListing);
  setStoredItem(STORAGE_KEYS.LISTINGS, listings);
  notifyDataUpdated();
  return newListing;
}

export function updateListing(id: string, updates: Partial<ProduceListing>): ProduceListing | undefined {
  initializeStorageIfEmpty();
  const listings = getStoredItem<ProduceListing[]>(STORAGE_KEYS.LISTINGS, INITIAL_LISTINGS);
  const index = listings.findIndex(l => l.id === id);
  if (index === -1) return undefined;

  listings[index] = { ...listings[index], ...updates };
  setStoredItem(STORAGE_KEYS.LISTINGS, listings);
  notifyDataUpdated();
  return listings[index];
}

// ---------------- OFFERS ---------------- //

export function getOffersForListing(listingId: string): Offer[] {
  initializeStorageIfEmpty();
  const offers = getStoredItem<Offer[]>(STORAGE_KEYS.OFFERS, INITIAL_OFFERS);
  return offers
    .filter(o => o.listingId === listingId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getOffersByBuyer(buyerId: string): Offer[] {
  initializeStorageIfEmpty();
  const offers = getStoredItem<Offer[]>(STORAGE_KEYS.OFFERS, INITIAL_OFFERS);
  return offers
    .filter(o => o.buyerId === buyerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getOfferById(id: string): Offer | undefined {
  initializeStorageIfEmpty();
  const offers = getStoredItem<Offer[]>(STORAGE_KEYS.OFFERS, INITIAL_OFFERS);
  return offers.find(o => o.id === id);
}

export function createOffer(data: {
  listingId: string;
  buyerId: string;
  offeredQuantity: number;
  offerPricePerUnit: number;
  transportCost: number;
  packagingCost: number;
  otherCosts: number;
  pickupPreference: 'pickup' | 'delivery';
  message?: string;
}): { success: boolean; error?: string; offer?: Offer } {
  initializeStorageIfEmpty();
  const listing = getListingById(data.listingId);
  if (!listing) {
    return { success: false, error: 'Listing not found.' };
  }

  if (listing.status !== 'active') {
    return { success: false, error: 'This listing is no longer active and cannot accept new offers.' };
  }

  const numQty = Number(data.offeredQuantity);
  const numPrice = Number(data.offerPricePerUnit);
  const numTransport = Number(data.transportCost);
  const numPackaging = Number(data.packagingCost);
  const numOther = Number(data.otherCosts);

  // Business validations
  if (isNaN(numQty) || numQty <= 0) {
    return { success: false, error: 'Offered quantity must be greater than 0.' };
  }

  if (numQty > listing.quantity) {
    return {
      success: false,
      error: `Offered quantity (${numQty} ${listing.unit}) exceeds available listing quantity (${listing.quantity} ${listing.unit}).`,
    };
  }

  if (isNaN(numPrice) || numPrice <= 0) {
    return { success: false, error: 'Offer price per unit must be greater than 0.' };
  }

  if (isNaN(numTransport) || numTransport < 0) {
    return { success: false, error: 'Transport cost cannot be negative.' };
  }

  if (isNaN(numPackaging) || numPackaging < 0) {
    return { success: false, error: 'Packaging cost cannot be negative.' };
  }

  if (isNaN(numOther) || numOther < 0) {
    return { success: false, error: 'Other selling costs cannot be negative.' };
  }

  // Compute calculations automatically - never trust client computed values
  const { totalOfferAmount, estimatedNetReturn } = calculateNetReturn(
    numQty,
    numPrice,
    numTransport,
    numPackaging,
    numOther
  );

  const newOffer: Offer = {
    id: `offer-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    listingId: data.listingId,
    buyerId: data.buyerId,
    offeredQuantity: numQty,
    offerPricePerUnit: numPrice,
    totalOfferAmount,
    transportCost: numTransport,
    packagingCost: numPackaging,
    otherCosts: numOther,
    estimatedNetReturn,
    pickupPreference: data.pickupPreference,
    message: data.message?.trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const offers = getStoredItem<Offer[]>(STORAGE_KEYS.OFFERS, INITIAL_OFFERS);
  offers.push(newOffer);
  setStoredItem(STORAGE_KEYS.OFFERS, offers);
  notifyDataUpdated();

  return { success: true, offer: newOffer };
}

export function updateOfferStatus(offerId: string, status: 'pending' | 'accepted' | 'rejected'): Offer | undefined {
  initializeStorageIfEmpty();
  const offers = getStoredItem<Offer[]>(STORAGE_KEYS.OFFERS, INITIAL_OFFERS);
  const index = offers.findIndex(o => o.id === offerId);
  if (index === -1) return undefined;

  offers[index] = { ...offers[index], status };
  setStoredItem(STORAGE_KEYS.OFFERS, offers);
  notifyDataUpdated();
  return offers[index];
}

/**
 * Executes offer acceptance workflow:
 * - Selected offer status becomes 'accepted'
 * - Parent listing status becomes 'sold'
 * - Other pending offers for this listing become 'rejected'
 * - Sold listings can no longer receive new offers
 */
export function acceptOffer(offerId: string): { success: boolean; error?: string; offer?: Offer } {
  initializeStorageIfEmpty();
  const offers = getStoredItem<Offer[]>(STORAGE_KEYS.OFFERS, INITIAL_OFFERS);
  const offerIndex = offers.findIndex(o => o.id === offerId);

  if (offerIndex === -1) {
    return { success: false, error: 'Offer not found.' };
  }

  const targetOffer = offers[offerIndex];
  const listingId = targetOffer.listingId;
  const listing = getListingById(listingId);

  if (!listing) {
    return { success: false, error: 'Parent listing not found.' };
  }

  if (listing.status === 'sold') {
    return { success: false, error: 'Listing has already been sold.' };
  }

  // 1. Mark target offer accepted
  targetOffer.status = 'accepted';
  offers[offerIndex] = targetOffer;

  // 2. Mark all other pending offers for this listing as rejected
  for (let i = 0; i < offers.length; i++) {
    if (offers[i].listingId === listingId && offers[i].id !== offerId && offers[i].status === 'pending') {
      offers[i].status = 'rejected';
    }
  }

  setStoredItem(STORAGE_KEYS.OFFERS, offers);

  // 3. Update parent listing status to sold
  updateListing(listingId, { status: 'sold' });

  notifyDataUpdated();
  return { success: true, offer: targetOffer };
}
