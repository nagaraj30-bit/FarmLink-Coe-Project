import { ProduceListing, Offer, UserProfile, OfferStatus, ListingStatus } from '../types';
import { SEED_PROFILES, SEED_LISTINGS, SEED_OFFERS } from './mockData';

const STORAGE_KEYS = {
  PROFILES: 'farmlink_profiles_v1',
  LISTINGS: 'farmlink_listings_v1',
  OFFERS: 'farmlink_offers_v1',
  ACTIVE_USER_ID: 'farmlink_active_user_id',
};

// Internal helpers to safely read/write localStorage
function readStorage<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultVal;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

// Initialize seed data if not present
export function initializeStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
    writeStorage(STORAGE_KEYS.PROFILES, SEED_PROFILES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.LISTINGS)) {
    writeStorage(STORAGE_KEYS.LISTINGS, SEED_LISTINGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.OFFERS)) {
    writeStorage(STORAGE_KEYS.OFFERS, SEED_OFFERS);
  }
}

// Reset data to initial mock seed
export function resetDemoData(): void {
  writeStorage(STORAGE_KEYS.PROFILES, SEED_PROFILES);
  writeStorage(STORAGE_KEYS.LISTINGS, SEED_LISTINGS);
  writeStorage(STORAGE_KEYS.OFFERS, SEED_OFFERS);
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, 'farmer-1');
}

// Profile queries
export function getProfiles(): UserProfile[] {
  initializeStorage();
  return readStorage<UserProfile[]>(STORAGE_KEYS.PROFILES, SEED_PROFILES);
}

export function getProfileById(id: string): UserProfile | undefined {
  const profiles = getProfiles();
  return profiles.find((p) => p.id === id);
}

export function getActiveUserId(): string | null {
  initializeStorage();
  const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
  if (activeId === 'guest') return null;
  return activeId || 'farmer-1';
}

export function setActiveUserId(id: string | null): void {
  if (id === null || id === 'guest') {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, 'guest');
  } else {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, id);
  }
}

export function clearActiveUserId(): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, 'guest');
}

export function createProfile(data: Omit<UserProfile, 'id'>): UserProfile {
  initializeStorage();
  const current = getProfiles();
  const newProfile: UserProfile = {
    ...data,
    id: `${data.role}-${Date.now()}`,
  };
  writeStorage(STORAGE_KEYS.PROFILES, [...current, newProfile]);
  setActiveUserId(newProfile.id);
  return newProfile;
}

export function updateProfile(
  id: string,
  updates: Partial<UserProfile>
): UserProfile | undefined {
  initializeStorage();
  const current = getProfiles();
  const index = current.findIndex((p) => p.id === id);
  if (index === -1) return undefined;

  const updated: UserProfile = {
    ...current[index],
    ...updates,
  };
  current[index] = updated;
  writeStorage(STORAGE_KEYS.PROFILES, current);
  return updated;
}

// Produce Listing operations
export function getListings(filters?: {
  farmerId?: string;
  district?: string;
  status?: ListingStatus;
  category?: string;
}): ProduceListing[] {
  initializeStorage();
  let listings = readStorage<ProduceListing[]>(STORAGE_KEYS.LISTINGS, SEED_LISTINGS);

  if (filters) {
    if (filters.farmerId) {
      listings = listings.filter((l) => l.farmerId === filters.farmerId);
    }
    if (filters.district && filters.district !== 'all') {
      listings = listings.filter((l) => l.district.toLowerCase() === filters.district!.toLowerCase());
    }
    if (filters.status) {
      listings = listings.filter((l) => l.status === filters.status);
    }
    if (filters.category && filters.category !== 'all') {
      listings = listings.filter((l) => l.category.toLowerCase() === filters.category!.toLowerCase());
    }
  }

  return listings;
}

export function getListingById(id: string): ProduceListing | undefined {
  const listings = getListings();
  return listings.find((l) => l.id === id);
}

export function createListing(
  data: Omit<ProduceListing, 'id' | 'listedDate'>
): ProduceListing {
  initializeStorage();
  const current = readStorage<ProduceListing[]>(STORAGE_KEYS.LISTINGS, SEED_LISTINGS);
  const newListing: ProduceListing = {
    ...data,
    id: `list-${Date.now()}`,
    listedDate: new Date().toISOString().split('T')[0],
  };

  writeStorage(STORAGE_KEYS.LISTINGS, [newListing, ...current]);
  return newListing;
}

export function updateListing(
  id: string,
  updates: Partial<ProduceListing>
): ProduceListing | undefined {
  initializeStorage();
  const current = readStorage<ProduceListing[]>(STORAGE_KEYS.LISTINGS, SEED_LISTINGS);
  const index = current.findIndex((l) => l.id === id);
  if (index === -1) return undefined;

  const updated = { ...current[index], ...updates };
  current[index] = updated;
  writeStorage(STORAGE_KEYS.LISTINGS, current);
  return updated;
}

export function updateListingStatus(id: string, status: ListingStatus): boolean {
  const updated = updateListing(id, { status });
  return !!updated;
}

// Offer operations
export function getOffers(): Offer[] {
  initializeStorage();
  return readStorage<Offer[]>(STORAGE_KEYS.OFFERS, SEED_OFFERS);
}

export function getOffersForListing(listingId: string): Offer[] {
  const offers = getOffers();
  return offers.filter((o) => o.listingId === listingId);
}

export function getOffersByBuyer(buyerId: string): Offer[] {
  const offers = getOffers();
  return offers.filter((o) => o.buyerId === buyerId);
}

export function createOffer(
  data: Omit<Offer, 'id' | 'createdAt' | 'status'>
): Offer {
  initializeStorage();
  const current = getOffers();
  const newOffer: Offer = {
    ...data,
    id: `offer-${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  writeStorage(STORAGE_KEYS.OFFERS, [newOffer, ...current]);

  // Update listing status to 'negotiating' if currently 'active'
  const listing = getListingById(data.listingId);
  if (listing && listing.status === 'active') {
    updateListingStatus(data.listingId, 'negotiating');
  }

  return newOffer;
}

export function updateOfferStatus(offerId: string, status: OfferStatus): Offer | undefined {
  initializeStorage();
  const current = getOffers();
  const index = current.findIndex((o) => o.id === offerId);
  if (index === -1) return undefined;

  current[index].status = status;
  writeStorage(STORAGE_KEYS.OFFERS, current);
  return current[index];
}

/**
 * When a farmer accepts an offer:
 * 1. That offer becomes 'accepted'
 * 2. The listing becomes 'sold'
 * 3. All other pending offers on this listing become 'declined'
 */
export function acceptOffer(
  offerId: string
): { acceptedOffer: Offer; updatedListing: ProduceListing } | undefined {
  initializeStorage();
  const allOffers = getOffers();
  const targetOfferIndex = allOffers.findIndex((o) => o.id === offerId);
  if (targetOfferIndex === -1) return undefined;

  const targetOffer = allOffers[targetOfferIndex];
  const listingId = targetOffer.listingId;

  // Accept target offer
  targetOffer.status = 'accepted';

  // Decline all other pending offers for this listing
  allOffers.forEach((o) => {
    if (o.listingId === listingId && o.id !== offerId && o.status === 'pending') {
      o.status = 'declined';
    }
  });
  writeStorage(STORAGE_KEYS.OFFERS, allOffers);

  // Mark listing as 'sold'
  const updatedListing = updateListing(listingId, { status: 'sold' });
  if (!updatedListing) return undefined;

  return {
    acceptedOffer: targetOffer,
    updatedListing,
  };
}

// ====================================================================================
// DUAL-MODE ASYNC DATA ACCESS (SUPABASE REMOTE WITH DEMO LOCALSTORAGE ISOLATION)
// ====================================================================================
import { isSupabaseConfigured } from '../lib/supabase';
import * as remote from './supabaseDataAccess';

/**
 * Fetch produce listings asynchronously.
 * Queries Supabase `produce_listings_public` view when real authentication is active,
 * or retrieves from localStorage in demo mode. Never silently falls back if a real query fails.
 */
export async function fetchListingsAsync(
  filters?: {
    farmerId?: string;
    district?: string;
    status?: ListingStatus;
    category?: string;
  },
  isRealAuth: boolean = false
): Promise<ProduceListing[]> {
  if (isRealAuth) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase client is not configured.');
    }
    return await remote.fetchListingsRemote(filters);
  }
  return getListings(filters);
}

/**
 * Fetch single produce listing by ID.
 * Queries Supabase `produce_listings_public` view when real auth is active.
 */
export async function fetchListingByIdAsync(
  id: string,
  isRealAuth: boolean = false
): Promise<ProduceListing | undefined> {
  if (isRealAuth && !id.startsWith('list-')) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase client is not configured.');
    }
    const data = await remote.fetchListingByIdRemote(id);
    return data || undefined;
  }
  return getListingById(id);
}

/**
 * Create produce listing with remote persistence for real accounts.
 */
export async function createListingAsync(
  data: Omit<ProduceListing, 'id' | 'listedDate'>,
  isRealAuth: boolean = false
): Promise<ProduceListing> {
  if (isRealAuth) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase client is not configured.');
    }
    return await remote.createListingRemote(data);
  }
  return createListing(data);
}

/**
 * Update produce listing parameters (price, floor, deadline).
 */
export async function updateListingAsync(
  id: string,
  updates: Partial<ProduceListing>,
  isRealAuth: boolean = false
): Promise<ProduceListing | undefined> {
  if (isRealAuth && !id.startsWith('list-')) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase client is not configured.');
    }
    return await remote.updateListingRemote(id, updates);
  }
  return updateListing(id, updates);
}

/**
 * Fetch offers for a specific listing.
 */
export async function fetchOffersForListingAsync(
  listingId: string,
  isRealAuth: boolean = false
): Promise<Offer[]> {
  if (isRealAuth && !listingId.startsWith('list-')) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase client is not configured.');
    }
    return await remote.fetchOffersForListingRemote(listingId);
  }
  return getOffersForListing(listingId);
}

/**
 * Fetch offers submitted by a specific buyer.
 */
export async function fetchOffersByBuyerAsync(
  buyerId: string,
  isRealAuth: boolean = false
): Promise<Offer[]> {
  if (isRealAuth && !buyerId.startsWith('buyer-')) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase client is not configured.');
    }
    return await remote.fetchOffersByBuyerRemote(buyerId);
  }
  return getOffersByBuyer(buyerId);
}

/**
 * Create a new offer on a listing with remote persistence.
 */
export async function createOfferAsync(
  data: Omit<Offer, 'id' | 'createdAt' | 'status'>,
  isRealAuth: boolean = false
): Promise<Offer> {
  if (isRealAuth && !data.listingId.startsWith('list-')) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase client is not configured.');
    }
    return await remote.createOfferRemote(data);
  }
  return createOffer(data);
}

/**
 * Decline an offer.
 */
export async function declineOfferAsync(
  offerId: string,
  listingId: string,
  isRealAuth: boolean = false
): Promise<Offer | undefined> {
  if (isRealAuth && !offerId.startsWith('offer-')) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase client is not configured.');
    }
    return await remote.declineOfferRemote(offerId);
  }
  return updateOfferStatus(offerId, 'declined');
}

/**
 * Accept offer using transactional atomic row-locking RPC on Supabase or localStorage in demo mode.
 */
export async function acceptOfferAsync(
  offerId: string,
  listingId: string,
  isRealAuth: boolean = false
): Promise<{ acceptedOffer: Offer; updatedListing: ProduceListing } | undefined> {
  if (isRealAuth && !offerId.startsWith('offer-')) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase client is not configured.');
    }
    const rpcResult = await remote.acceptOfferRemote(offerId);
    const updatedListing = await remote.fetchListingByIdRemote(listingId);
    const allOffers = await remote.fetchOffersForListingRemote(listingId);
    const acceptedOffer = allOffers.find((o) => o.id === offerId);
    if (acceptedOffer && updatedListing) {
      return { acceptedOffer, updatedListing };
    }
    if (updatedListing) {
      const fallbackOffer: Offer = {
        id: rpcResult.offerId,
        listingId: rpcResult.listingId,
        buyerId: rpcResult.buyerId,
        buyerName: rpcResult.buyerName,
        buyerNameTa: rpcResult.buyerName,
        buyerType: 'Wholesale Buyer',
        buyerTypeTa: 'மொத்த வியாபாரி',
        buyerPhone: '',
        quantity: updatedListing.quantity,
        unit: updatedListing.unit,
        offeredPricePerUnit: updatedListing.expectedPricePerUnit,
        transportCost: 0,
        packagingCost: 0,
        otherCosts: 0,
        paymentTerms: 'Immediate',
        paymentTermsTa: 'உடனடி',
        pickupLocation: updatedListing.district,
        pickupLocationTa: updatedListing.districtTa,
        notes: '',
        notesTa: '',
        status: 'accepted',
        createdAt: new Date().toISOString(),
      };
      return { acceptedOffer: fallbackOffer, updatedListing };
    }
    throw new Error('Offer acceptance RPC succeeded, but could not re-fetch updated listing.');
  }
  return acceptOffer(offerId);
}

