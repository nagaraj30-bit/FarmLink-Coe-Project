import { supabase, isSupabaseConfigured, getSupabaseClient } from '../lib/supabase';
import { ProduceListing, Offer, UserProfile, ListingStatus } from '../types';

/**
 * Maps database public.profiles row to frontend UserProfile
 */
export function mapProfileRow(row: any): UserProfile {
  return {
    id: row.id,
    role: row.role,
    name: row.name,
    nameTa: row.name_ta || row.name,
    phone: row.phone,
    district: row.district,
    districtTa: row.district_ta || row.district,
    location: row.location,
    locationTa: row.location_ta || row.location,
    avatar: row.avatar || (row.role === 'farmer' ? '👨‍🌾' : '🏢'),
    fpoMember: Boolean(row.fpo_member),
    fpoName: row.fpo_name || undefined,
    businessType: row.business_type || undefined,
    businessTypeTa: row.business_type_ta || undefined,
  };
}

/**
 * Maps database produce_listings_public view row to frontend ProduceListing
 */
export function mapListingRow(row: any): ProduceListing {
  return {
    id: row.id,
    farmerId: row.farmer_id,
    farmerName: row.farmer_name,
    farmerNameTa: row.farmer_name_ta || row.farmer_name,
    farmerPhone: row.farmer_phone,
    cropName: row.crop_name,
    cropNameTa: row.crop_name_ta || row.crop_name,
    variety: row.variety || '',
    varietyTa: row.variety_ta || row.variety || '',
    category: row.category,
    quantity: Number(row.quantity),
    unit: row.unit,
    expectedPricePerUnit: Number(row.expected_price_per_unit),
    minAcceptablePricePerUnit: Number(row.min_acceptable_price_per_unit || 0),
    harvestingDate: row.harvesting_date,
    listedDate: row.listed_date,
    sellWithinDays: Number(row.sell_within_days),
    storageCondition: row.storage_condition || '',
    storageConditionTa: row.storage_condition_ta || row.storage_condition || '',
    district: row.district,
    districtTa: row.district_ta || row.district,
    mandiBenchmarkPrice: row.mandi_benchmark_price ? Number(row.mandi_benchmark_price) : undefined,
    benchmarkSource: row.benchmark_source || undefined,
    benchmarkDate: row.benchmark_date || undefined,
    transportEstimate: Number(row.transport_estimate || 0),
    packagingEstimate: Number(row.packaging_estimate || 0),
    status: row.status,
    description: row.description || '',
    descriptionTa: row.description_ta || row.description || '',
  };
}

/**
 * Maps database public.offers row to frontend Offer
 */
export function mapOfferRow(row: any): Offer {
  return {
    id: row.id,
    listingId: row.listing_id,
    buyerId: row.buyer_id,
    buyerName: row.buyer_name,
    buyerNameTa: row.buyer_name_ta || row.buyer_name,
    buyerType: row.buyer_type || 'Wholesale Buyer',
    buyerTypeTa: row.buyer_type_ta || 'மொத்த வியாபாரி',
    buyerPhone: row.buyer_phone,
    quantity: Number(row.quantity),
    unit: row.unit,
    offeredPricePerUnit: Number(row.offered_price_per_unit),
    transportCost: Number(row.transport_cost || 0),
    packagingCost: Number(row.packaging_cost || 0),
    otherCosts: Number(row.other_costs || 0),
    paymentTerms: row.payment_terms,
    paymentTermsTa: row.payment_terms_ta || row.payment_terms,
    pickupLocation: row.pickup_location,
    pickupLocationTa: row.pickup_location_ta || row.pickup_location,
    notes: row.notes || '',
    notesTa: row.notes_ta || row.notes || '',
    status: row.status,
    createdAt: row.created_at,
  };
}

// ====================================================================================
// PROFILES API
// ====================================================================================

export async function fetchProfileRemote(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  if (!data) return null;
  return mapProfileRow(data);
}

export async function updateProfileRemote(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  const client = getSupabaseClient();
  const dbPayload: any = {};
  if (updates.name !== undefined) dbPayload.name = updates.name;
  if (updates.nameTa !== undefined) dbPayload.name_ta = updates.nameTa;
  if (updates.phone !== undefined) dbPayload.phone = updates.phone;
  if (updates.district !== undefined) dbPayload.district = updates.district;
  if (updates.districtTa !== undefined) dbPayload.district_ta = updates.districtTa;
  if (updates.location !== undefined) dbPayload.location = updates.location;
  if (updates.locationTa !== undefined) dbPayload.location_ta = updates.locationTa;
  if (updates.avatar !== undefined) dbPayload.avatar = updates.avatar;
  if (updates.fpoMember !== undefined) dbPayload.fpo_member = updates.fpoMember;
  if (updates.fpoName !== undefined) dbPayload.fpo_name = updates.fpoName;
  if (updates.businessType !== undefined) dbPayload.business_type = updates.businessType;
  if (updates.businessTypeTa !== undefined) dbPayload.business_type_ta = updates.businessTypeTa;

  const { data, error } = await client
    .from('profiles')
    .update(dbPayload)
    .eq('id', userId)
    .select()
    .single();

  if (error || !data) throw error;
  return mapProfileRow(data);
}

// ====================================================================================
// PRODUCE LISTINGS API
// ====================================================================================

export async function fetchListingsRemote(filters?: {
  farmerId?: string;
  district?: string;
  status?: ListingStatus;
  category?: string;
}): Promise<ProduceListing[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  let query = supabase.from('produce_listings_public').select('*');

  if (filters) {
    if (filters.farmerId) query = query.eq('farmer_id', filters.farmerId);
    if (filters.district && filters.district !== 'all') query = query.ilike('district', filters.district);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.category && filters.category !== 'all') query = query.eq('category', filters.category);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapListingRow);
}

export async function fetchListingByIdRemote(id: string): Promise<ProduceListing | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from('produce_listings_public')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  if (!data) return null;
  return mapListingRow(data);
}

export async function createListingRemote(
  data: Omit<ProduceListing, 'id' | 'listedDate'>
): Promise<ProduceListing> {
  const client = getSupabaseClient();
  const dbPayload = {
    farmer_id: data.farmerId,
    farmer_name: data.farmerName,
    farmer_name_ta: data.farmerNameTa || '',
    farmer_phone: data.farmerPhone,
    crop_name: data.cropName,
    crop_name_ta: data.cropNameTa || '',
    variety: data.variety || '',
    variety_ta: data.varietyTa || '',
    category: data.category,
    quantity: data.quantity,
    unit: data.unit,
    expected_price_per_unit: data.expectedPricePerUnit,
    min_acceptable_price_per_unit: data.minAcceptablePricePerUnit || 0,
    harvesting_date: data.harvestingDate,
    sell_within_days: data.sellWithinDays,
    storage_condition: data.storageCondition || '',
    storage_condition_ta: data.storageConditionTa || '',
    district: data.district,
    district_ta: data.districtTa || '',
    mandi_benchmark_price: data.mandiBenchmarkPrice || null,
    benchmark_source: data.benchmarkSource || null,
    benchmark_date: data.benchmarkDate || null,
    transport_estimate: data.transportEstimate || 0,
    packaging_estimate: data.packagingEstimate || 0,
    status: data.status || 'active',
    description: data.description || '',
    description_ta: data.descriptionTa || '',
  };

  const { data: inserted, error } = await client
    .from('produce_listings')
    .insert(dbPayload)
    .select()
    .single();

  if (error || !inserted) throw error;
  return mapListingRow(inserted);
}

export async function updateListingRemote(
  id: string,
  updates: Partial<ProduceListing>
): Promise<ProduceListing> {
  const client = getSupabaseClient();
  const dbPayload: any = {};
  if (updates.expectedPricePerUnit !== undefined) dbPayload.expected_price_per_unit = updates.expectedPricePerUnit;
  if (updates.minAcceptablePricePerUnit !== undefined) dbPayload.min_acceptable_price_per_unit = updates.minAcceptablePricePerUnit;
  if (updates.sellWithinDays !== undefined) dbPayload.sell_within_days = updates.sellWithinDays;
  if (updates.status !== undefined) dbPayload.status = updates.status;
  if (updates.storageCondition !== undefined) dbPayload.storage_condition = updates.storageCondition;
  if (updates.storageConditionTa !== undefined) dbPayload.storage_condition_ta = updates.storageConditionTa;
  if (updates.description !== undefined) dbPayload.description = updates.description;
  if (updates.descriptionTa !== undefined) dbPayload.description_ta = updates.descriptionTa;

  const { data, error } = await client
    .from('produce_listings')
    .update(dbPayload)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) throw error;
  return mapListingRow(data);
}

// ====================================================================================
// OFFERS API
// ====================================================================================

export async function fetchOffersForListingRemote(listingId: string): Promise<Offer[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapOfferRow);
}

export async function fetchOffersByBuyerRemote(buyerId: string): Promise<Offer[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapOfferRow);
}

export async function createOfferRemote(
  data: Omit<Offer, 'id' | 'createdAt' | 'status'>
): Promise<Offer> {
  const client = getSupabaseClient();
  const dbPayload = {
    listing_id: data.listingId,
    buyer_id: data.buyerId,
    buyer_name: data.buyerName,
    buyer_name_ta: data.buyerNameTa || '',
    buyer_type: data.buyerType || 'Wholesale Buyer',
    buyer_type_ta: data.buyerTypeTa || '',
    buyer_phone: data.buyerPhone,
    quantity: data.quantity,
    unit: data.unit,
    offered_price_per_unit: data.offeredPricePerUnit,
    transport_cost: data.transportCost || 0,
    packaging_cost: data.packagingCost || 0,
    other_costs: data.otherCosts || 0,
    payment_terms: data.paymentTerms,
    payment_terms_ta: data.paymentTermsTa || '',
    pickup_location: data.pickupLocation,
    pickup_location_ta: data.pickupLocationTa || '',
    notes: data.notes || '',
    notes_ta: data.notesTa || null,
  };

  const { data: inserted, error } = await client
    .from('offers')
    .insert(dbPayload)
    .select()
    .single();

  if (error || !inserted) throw error;
  return mapOfferRow(inserted);
}

export async function declineOfferRemote(offerId: string): Promise<Offer> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('offers')
    .update({ status: 'declined' })
    .eq('id', offerId)
    .select()
    .single();

  if (error || !data) throw error;
  return mapOfferRow(data);
}

export async function acceptOfferRemote(offerId: string): Promise<{
  success: boolean;
  offerId: string;
  listingId: string;
  buyerId: string;
  buyerName: string;
  status: string;
}> {
  const client = getSupabaseClient();
  const { data, error } = await client.rpc('accept_offer', { p_offer_id: offerId });
  if (error) throw error;
  return data;
}
