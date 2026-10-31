-- ====================================================================================
-- FARMLINK PHASE 2 DATABASE MIGRATION SCRIPT
-- ====================================================================================
-- Description: Core database migration for FarmLink agricultural marketplace.
-- Tables: profiles, produce_listings, offers, unsold_guidance
-- Views: produce_listings_public (privacy-preserving)
-- Functions/RPC: accept_offer (concurrency-safe row-locking), handle_new_user
-- Security: Strict RLS policies, role locks, bid privacy, search_path hardening
-- ====================================================================================

-- Wrap migration in a single transaction block
BEGIN;

-- ====================================================================================
-- 1. EXTENSIONS & CUSTOM ENUMS
-- ====================================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('farmer', 'buyer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.produce_unit AS ENUM ('kg', 'quintal', 'box', 'bags', 'nuts');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.crop_category AS ENUM ('Vegetables', 'Fruits', 'Grains', 'Spices', 'Oilseeds');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.listing_status AS ENUM ('active', 'negotiating', 'sold', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.offer_status AS ENUM ('pending', 'accepted', 'declined');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.guidance_category AS ENUM ('storage', 'processing', 'direct_sale', 'fpo', 'recovery');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ====================================================================================
-- 2. TABLE DEFINITIONS
-- ====================================================================================

-- ------------------------------------------------------------------------------------
-- A. PROFILES TABLE (1:1 with auth.users)
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL,
  name TEXT NOT NULL CHECK (char_length(trim(name)) >= 2),
  name_ta TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL CHECK (char_length(trim(phone)) >= 10),
  district TEXT NOT NULL CHECK (char_length(trim(district)) >= 2),
  district_ta TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL CHECK (char_length(trim(location)) >= 2),
  location_ta TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT '👨‍🌾',
  fpo_member BOOLEAN NOT NULL DEFAULT false,
  fpo_name TEXT,
  business_type TEXT,
  business_type_ta TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------------
-- B. PRODUCE LISTINGS TABLE
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.produce_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  farmer_name TEXT NOT NULL,
  farmer_name_ta TEXT NOT NULL DEFAULT '',
  farmer_phone TEXT NOT NULL CHECK (char_length(trim(farmer_phone)) >= 10),
  crop_name TEXT NOT NULL CHECK (char_length(trim(crop_name)) > 0),
  crop_name_ta TEXT NOT NULL DEFAULT '',
  variety TEXT NOT NULL DEFAULT '',
  variety_ta TEXT NOT NULL DEFAULT '',
  category public.crop_category NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  unit public.produce_unit NOT NULL,
  expected_price_per_unit NUMERIC(12, 2) NOT NULL CHECK (expected_price_per_unit > 0),
  min_acceptable_price_per_unit NUMERIC(12, 2) NOT NULL DEFAULT 0 
    CHECK (min_acceptable_price_per_unit >= 0 AND min_acceptable_price_per_unit <= expected_price_per_unit),
  harvesting_date DATE NOT NULL,
  listed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sell_within_days INTEGER NOT NULL CHECK (sell_within_days >= 0 AND sell_within_days <= 90),
  storage_condition TEXT NOT NULL DEFAULT '',
  storage_condition_ta TEXT NOT NULL DEFAULT '',
  district TEXT NOT NULL CHECK (char_length(trim(district)) >= 2),
  district_ta TEXT NOT NULL DEFAULT '',
  mandi_benchmark_price NUMERIC(12, 2) CHECK (mandi_benchmark_price IS NULL OR mandi_benchmark_price >= 0),
  benchmark_source TEXT,
  benchmark_date DATE,
  transport_estimate NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (transport_estimate >= 0),
  packaging_estimate NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (packaging_estimate >= 0),
  status public.listing_status NOT NULL DEFAULT 'active',
  description TEXT NOT NULL DEFAULT '',
  description_ta TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------------
-- C. OFFERS TABLE (Buyer Bids)
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.produce_listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  buyer_name_ta TEXT NOT NULL DEFAULT '',
  buyer_type TEXT NOT NULL DEFAULT 'Wholesale Buyer',
  buyer_type_ta TEXT NOT NULL DEFAULT '',
  buyer_phone TEXT NOT NULL CHECK (char_length(trim(buyer_phone)) >= 10),
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  unit public.produce_unit NOT NULL, -- Locked to listing.unit via trigger
  offered_price_per_unit NUMERIC(12, 2) NOT NULL CHECK (offered_price_per_unit > 0),
  transport_cost NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (transport_cost >= 0),
  packaging_cost NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (packaging_cost >= 0),
  other_costs NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (other_costs >= 0),
  payment_terms TEXT NOT NULL CHECK (char_length(trim(payment_terms)) > 0),
  payment_terms_ta TEXT NOT NULL DEFAULT '',
  pickup_location TEXT NOT NULL CHECK (char_length(trim(pickup_location)) > 0),
  pickup_location_ta TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  notes_ta TEXT,
  status public.offer_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------------
-- D. UNSOLD GUIDANCE REFERENCE TABLE
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.unsold_guidance (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  title_ta TEXT NOT NULL,
  category public.guidance_category NOT NULL,
  urgency_suitability TEXT[] NOT NULL,
  description TEXT NOT NULL,
  description_ta TEXT NOT NULL,
  action_steps TEXT[] NOT NULL,
  action_steps_ta TEXT[] NOT NULL,
  contact_support TEXT NOT NULL,
  contact_support_ta TEXT NOT NULL,
  estimated_recovery_pct TEXT NOT NULL
);

-- Seed static reference options if empty
INSERT INTO public.unsold_guidance (id, title, title_ta, category, urgency_suitability, description, description_ta, action_steps, action_steps_ta, contact_support, contact_support_ta, estimated_recovery_pct)
VALUES 
(
  'guidance-1', 
  'Short-Term Cold Storage & Regulated Warehousing', 
  'குளிர்சாதன கிடங்கு மற்றும் ஒழுங்குமுறை சேமிப்பு', 
  'storage', 
  ARRAY['high', 'medium'], 
  'Store produce in nearest state-subsidized cold storage for 3–7 days until market supply eases.', 
  'விலை மிகவும் குறைவாக இருந்தால், தமிழ்நாடு அரசு குளிர்சாதன கிடங்கில் 3 முதல் 7 நாட்கள் சேமித்து வைக்கலாம்.', 
  ARRAY['Locate nearest TN Agri Marketing Board Cold Storage.', 'Average rent: ₹1.20 - ₹1.80 per kg per week.', 'Obtain warehouse receipt (e-NWR) for credit.'], 
  ARRAY['அருகிலுள்ள அரசு குளிர்சாதன கிடங்கை அணுகவும்.', 'வாரம் ஒரு கிலோவுக்கு ₹1.20 - ₹1.80 வாடகை.', 'கிடங்கு ரசீது மூலம் கடன் பெறலாம்.'], 
  'TN Agri Marketing Department Helpline: 1800-425-3535', 
  'வேளாண் வணிகத்துறை உதவி எண்: 1800-425-3535', 
  '85% – 95% of target market value'
),
(
  'guidance-2', 
  'Secondary Processing & Value Addition (Puree, Solar Drying, Pickle)', 
  'மதிப்புக் கூட்டுதல் மற்றும் பதப்படுத்துதல்', 
  'processing', 
  ARRAY['high', 'medium', 'normal'], 
  'Transform perishable surplus into durable value-added products through local cottage units.', 
  'காய்கறி மற்றும் பழங்களை கூழ், சாஸ் அல்லது உலர்த்தி மதிப்புக்கூட்டி அதிக லாபம் பெறலாம்.', 
  ARRAY['Tie up with local puree or solar dehydration units.', 'Fruit pulp extraction via KVK pilot units.', 'Converts unsold stock into 6-month shelf-life goods.'], 
  ARRAY['உள்ளூர் கூழ் தயாரிப்பாளர்கள் அல்லது சோலார் உலர் கூடங்களை தொடர்பு கொள்ளவும்.', 'KVK பயிற்சி மையங்கள் மூலம் கூழ் தயாரிப்பு.', '6 மாத கால மதிப்புள்ள தயாரிப்பாக மாற்றும்.'], 
  'TNAU Post-Harvest Technology Center, Coimbatore', 
  'தமிழ்நாடு வேளாண்மை பல்கலைக்கழக அறுவடை பின்செய் மையம்', 
  '70% – 120% of distress fresh sale'
),
(
  'guidance-3', 
  'Direct Haat & Uzhavar Sandhai (Farmers Market) Clearance', 
  'உழவர் சந்தை நேரடி விற்பனை', 
  'direct_sale', 
  ARRAY['high'], 
  'Bypass intermediary deductions completely by selling directly to consumers next morning.', 
  'இடைத்தரகர்கள் இன்றி, உழவர் சந்தையில் நேரடியாக நுகர்வோருக்கு விற்கலாம்.', 
  ARRAY['Carry Farmer ID card to nearest Uzhavar Sandhai before 5:30 AM.', 'Zero stall fee and state electronic scales.', 'Direct consumer cash realization with full margins.'], 
  ARRAY['விவசாயி அடையாள அட்டையுடன் அதிகாலை 5:30 மணிக்குள் செல்லவும்.', 'இலவச கடை மற்றும் எடைத்தராசு வசதி.', 'நுகர்வோருக்கு நேரடியாக விற்று முழு லாபம் பெறலாம்.'], 
  'District Uzhavar Sandhai Administrative Officer', 
  'மாவட்ட உழவர் சந்தை நிர்வாக அலுவலர்', 
  '90% – 105% of fair market value'
),
(
  'guidance-4', 
  'Farmer Producer Organization (FPO) Bulk Aggregation', 
  'உழவர் உற்பத்தியாளர் நிறுவனம் (FPO) மூலமாக மொத்த விற்பனை', 
  'fpo', 
  ARRAY['medium', 'normal'], 
  'Pool unsold produce with neighboring farmers to form multi-ton institutional lots.', 
  'தனி நபராக விற்காமல், உழவர் உற்பத்தியாளர் குழுவுடன் இணைந்து மொத்தமாக விற்கலாம்.', 
  ARRAY['Inform local FPO procurement coordinator.', 'Combines smaller lots into 5-ton truckloads, cutting freight by up to 60%.', 'Collective bargaining eliminates panic distress sales.'], 
  ARRAY['FPO ஒருங்கிணைப்பாளரிடம் இருப்பு விவரத்தை தெரிவிக்கவும்.', 'பொருட்களை ஒன்று சேர்த்து அனுப்புவதால் லாரி வாடகை 60% குறையும்.', 'குழுவாக விற்பதால் நியாயமான விலை கிடைக்கும்.'], 
  'Tamil Nadu Small Farmers Agri-Business Consortium (TNSFAC)', 
  'தமிழ்நாடு சிறு விவசாயிகள் வேளாண் வணிக கூட்டமைப்பு', 
  '80% – 90% of wholesale benchmark'
)
ON CONFLICT (id) DO NOTHING;

-- ====================================================================================
-- 3. PERFORMANCE INDEXES
-- ====================================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_district ON public.profiles(district);

CREATE INDEX IF NOT EXISTS idx_listings_farmer_id ON public.produce_listings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.produce_listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_district ON public.produce_listings(district);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.produce_listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_harvesting_date ON public.produce_listings(harvesting_date);
CREATE INDEX IF NOT EXISTS idx_listings_sell_within_days ON public.produce_listings(sell_within_days);

CREATE INDEX IF NOT EXISTS idx_offers_listing_id ON public.offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer_id ON public.offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_listing_status ON public.offers(listing_id, status);

-- ====================================================================================
-- 4. INTEGRITY FUNCTIONS & TRIGGERS (HARDENED SEARCH_PATH)
-- ====================================================================================

-- ------------------------------------------------------------------------------------
-- A. ROLE TAMPERING PREVENTION TRIGGER
-- ------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_immutability()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Prevent role escalation or alteration after registration
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    RAISE EXCEPTION 'User role cannot be altered once assigned.';
  END IF;

  -- Prevent primary key re-assignment
  IF OLD.id IS DISTINCT FROM NEW.id THEN
    RAISE EXCEPTION 'Profile ID is immutable.';
  END IF;

  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_immutability ON public.profiles;
CREATE TRIGGER trg_protect_profile_immutability
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_immutability();

-- ------------------------------------------------------------------------------------
-- B. OFFER SUBMISSION VALIDATION TRIGGER
-- ------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_offer_submission()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_listing public.produce_listings%ROWTYPE;
  v_buyer_role public.user_role;
BEGIN
  -- Verify buyer profile role
  SELECT role INTO v_buyer_role FROM public.profiles WHERE id = NEW.buyer_id;
  IF v_buyer_role IS NULL OR v_buyer_role != 'buyer' THEN
    RAISE EXCEPTION 'Only verified produce buyers can submit offers.';
  END IF;

  -- Fetch parent produce listing
  SELECT * INTO v_listing FROM public.produce_listings WHERE id = NEW.listing_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Target produce listing % not found.', NEW.listing_id;
  END IF;

  -- Block self-bidding (farmer bidding on own crop)
  IF v_listing.farmer_id = NEW.buyer_id THEN
    RAISE EXCEPTION 'Farmers cannot place offers on their own produce listings.';
  END IF;

  -- Verify listing is open for bidding
  IF v_listing.status NOT IN ('active', 'negotiating') THEN
    RAISE EXCEPTION 'Produce lot % is not open for bidding (status: %).', v_listing.id, v_listing.status;
  END IF;

  -- Enforce locked unit matching
  IF NEW.unit != v_listing.unit THEN
    RAISE EXCEPTION 'Offer unit (%) must match listing unit (%).', NEW.unit, v_listing.unit;
  END IF;

  -- Enforce quantity within available catalogue limit
  IF NEW.quantity > v_listing.quantity THEN
    RAISE EXCEPTION 'Offer quantity (%) exceeds available produce volume (%).', NEW.quantity, v_listing.quantity;
  END IF;

  NEW.status = 'pending';
  NEW.created_at = timezone('utc'::text, now());
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_offer_submission ON public.offers;
CREATE TRIGGER trg_validate_offer_submission
BEFORE INSERT ON public.offers
FOR EACH ROW EXECUTE FUNCTION public.validate_offer_submission();

-- ------------------------------------------------------------------------------------
-- C. AUTO-SET LISTING STATUS TO 'negotiating' TRIGGER
-- ------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.auto_transition_listing_to_negotiating()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.produce_listings
  SET status = 'negotiating', updated_at = timezone('utc'::text, now())
  WHERE id = NEW.listing_id AND status = 'active';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_transition_listing_to_negotiating ON public.offers;
CREATE TRIGGER trg_auto_transition_listing_to_negotiating
AFTER INSERT ON public.offers
FOR EACH ROW EXECUTE FUNCTION public.auto_transition_listing_to_negotiating();

-- ------------------------------------------------------------------------------------
-- D. STATUS TRANSITION GUARD TRIGGER
-- ------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_listing_status_transitions()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Terminal status 'sold' cannot be reverted or altered
  IF OLD.status = 'sold' AND NEW.status != 'sold' THEN
    RAISE EXCEPTION 'Sold produce listings are terminal and cannot be reopened.';
  END IF;
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_listing_status_transitions ON public.produce_listings;
CREATE TRIGGER trg_enforce_listing_status_transitions
BEFORE UPDATE OF status ON public.produce_listings
FOR EACH ROW EXECUTE FUNCTION public.enforce_listing_status_transitions();

-- ------------------------------------------------------------------------------------
-- E. LISTING ACCESS & OWNERSHIP HELPER FUNCTIONS (SECURITY DEFINER)
-- ------------------------------------------------------------------------------------
-- Check whether a buyer has placed an active offer on a listing (for phone unmasking)
CREATE OR REPLACE FUNCTION public.has_user_offered_on_listing(p_listing_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.offers 
    WHERE listing_id = p_listing_id AND buyer_id = p_user_id
  );
$$;

REVOKE ALL ON FUNCTION public.has_user_offered_on_listing(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_user_offered_on_listing(UUID, UUID) TO authenticated;

-- Check whether a user is the owner of a listing without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_listing_owner(p_listing_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.produce_listings 
    WHERE id = p_listing_id AND farmer_id = p_user_id
  );
$$;

REVOKE ALL ON FUNCTION public.is_listing_owner(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_listing_owner(UUID, UUID) TO authenticated;

-- ------------------------------------------------------------------------------------
-- F. AUTH USER CREATION TRIGGER (HANDLE_NEW_USER)
-- ------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_role_text TEXT;
  v_role public.user_role;
  v_name TEXT;
  v_phone TEXT;
  v_district TEXT;
  v_location TEXT;
  v_avatar TEXT;
  v_fpo_member BOOLEAN;
  v_fpo_name TEXT;
  v_business_type TEXT;
BEGIN
  -- 1. Strictly validate role (permitted: 'farmer' or 'buyer' only)
  v_role_text := lower(trim(COALESCE(NEW.raw_user_meta_data->>'role', '')));
  IF v_role_text = 'farmer' THEN
    v_role := 'farmer'::public.user_role;
  ELSIF v_role_text = 'buyer' THEN
    v_role := 'buyer'::public.user_role;
  ELSE
    RAISE EXCEPTION 'Registration failed: invalid user role "%". Must be "farmer" or "buyer".', v_role_text;
  END IF;

  -- 2. Validate required string fields and character bounds
  v_name := trim(COALESCE(NEW.raw_user_meta_data->>'name', ''));
  IF char_length(v_name) < 2 THEN
    RAISE EXCEPTION 'Registration failed: Name must be at least 2 characters long.';
  END IF;

  v_phone := trim(COALESCE(NEW.raw_user_meta_data->>'phone', ''));
  IF char_length(v_phone) < 10 THEN
    RAISE EXCEPTION 'Registration failed: Valid phone number (min 10 digits) required.';
  END IF;

  v_district := trim(COALESCE(NEW.raw_user_meta_data->>'district', ''));
  IF char_length(v_district) < 2 THEN
    RAISE EXCEPTION 'Registration failed: District must be at least 2 characters long.';
  END IF;

  v_location := trim(COALESCE(NEW.raw_user_meta_data->>'location', ''));
  IF char_length(v_location) < 2 THEN
    RAISE EXCEPTION 'Registration failed: Location must be at least 2 characters long.';
  END IF;

  -- 3. Optional metadata fields with fallback defaults
  v_avatar := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'avatar'), ''),
                       CASE WHEN v_role = 'farmer' THEN '👨‍🌾' ELSE '🏢' END);
  v_fpo_member := COALESCE((NEW.raw_user_meta_data->>'fpo_member')::BOOLEAN, false);
  v_fpo_name := NULLIF(trim(NEW.raw_user_meta_data->>'fpo_name'), '');
  v_business_type := NULLIF(trim(NEW.raw_user_meta_data->>'business_type'), '');

  -- 4. Derive ID strictly from auth.users (NEW.id), never user-supplied ID
  INSERT INTO public.profiles (
    id,
    role,
    name,
    name_ta,
    phone,
    district,
    district_ta,
    location,
    location_ta,
    avatar,
    fpo_member,
    fpo_name,
    business_type,
    business_type_ta,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    v_role,
    v_name,
    COALESCE(NEW.raw_user_meta_data->>'name_ta', ''),
    v_phone,
    v_district,
    COALESCE(NEW.raw_user_meta_data->>'district_ta', ''),
    v_location,
    COALESCE(NEW.raw_user_meta_data->>'location_ta', ''),
    v_avatar,
    v_fpo_member,
    v_fpo_name,
    v_business_type,
    COALESCE(NEW.raw_user_meta_data->>'business_type_ta', ''),
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO NOTHING; -- Prevents overwriting existing profiles or role tampering

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================================
-- 5. TRANSACTIONAL OFFER ACCEPTANCE RPC (LOCK PARENT FIRST)
-- ====================================================================================
CREATE OR REPLACE FUNCTION public.accept_offer(p_offer_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_offer RECORD;
  v_listing RECORD;
  v_parent_listing_id UUID;
BEGIN
  -- Step 0: Identify parent listing ID without locking
  SELECT listing_id INTO v_parent_listing_id
  FROM public.offers
  WHERE id = p_offer_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Offer % does not exist.', p_offer_id;
  END IF;

  -- Step 1: EXCLUSIVELY LOCK PARENT LISTING FIRST
  -- This guarantees strict lock hierarchy order across concurrent transactions
  SELECT * INTO v_listing
  FROM public.produce_listings
  WHERE id = v_parent_listing_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Parent produce listing % does not exist.', v_parent_listing_id;
  END IF;

  -- Validate farmer ownership
  IF v_listing.farmer_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Only the listing farmer can accept offers.';
  END IF;

  -- Validate listing status
  IF v_listing.status = 'sold' THEN
    RAISE EXCEPTION 'This produce lot is already sold.';
  END IF;

  IF v_listing.status = 'expired' THEN
    RAISE EXCEPTION 'Cannot accept offers on an expired produce listing.';
  END IF;

  -- Step 2: RE-READ AND LOCK TARGET OFFER
  SELECT * INTO v_offer
  FROM public.offers
  WHERE id = p_offer_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Offer % was removed during transaction.', p_offer_id;
  END IF;

  -- Validate offer status
  IF v_offer.status != 'pending' THEN
    RAISE EXCEPTION 'Offer % is already % and cannot be accepted.', p_offer_id, v_offer.status;
  END IF;

  -- Validate relationship consistency
  IF v_offer.listing_id != v_listing.id THEN
    RAISE EXCEPTION 'Offer % does not belong to listing %.', p_offer_id, v_listing.id;
  END IF;

  -- Step 3: ATOMIC MUTATIONS
  -- A. Mark chosen offer as accepted
  UPDATE public.offers
  SET status = 'accepted', updated_at = timezone('utc'::text, now())
  WHERE id = p_offer_id;

  -- B. Decline all other competing pending offers on this listing
  UPDATE public.offers
  SET status = 'declined', updated_at = timezone('utc'::text, now())
  WHERE listing_id = v_listing.id 
    AND id != p_offer_id 
    AND status = 'pending';

  -- C. Mark parent listing as sold
  UPDATE public.produce_listings
  SET status = 'sold', updated_at = timezone('utc'::text, now())
  WHERE id = v_listing.id;

  RETURN jsonb_build_object(
    'success', true,
    'offerId', p_offer_id,
    'listingId', v_listing.id,
    'buyerId', v_offer.buyer_id,
    'buyerName', v_offer.buyer_name,
    'status', 'sold'
  );
END;
$$;

-- Grant least-privilege execution rights to authenticated users only
REVOKE ALL ON FUNCTION public.accept_offer(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_offer(UUID) TO authenticated;

-- ====================================================================================
-- 6. PUBLIC-SAFE LISTING VIEW (MASK PRIVATE PHONE DATA)
-- ====================================================================================
CREATE OR REPLACE VIEW public.produce_listings_public
WITH (security_invoker = false)
AS
SELECT
  l.id,
  l.farmer_id,
  l.farmer_name,
  l.farmer_name_ta,
  CASE
    -- Unmask phone ONLY to:
    -- 1. The listing owner themselves, OR
    -- 2. An authenticated buyer who has submitted an offer on this listing
    WHEN auth.uid() IS NOT NULL AND (
      auth.uid() = l.farmer_id 
      OR public.has_user_offered_on_listing(l.id, auth.uid())
    ) THEN l.farmer_phone
    ELSE 'Protected (Sign in & submit offer to view)'
  END AS farmer_phone,
  l.crop_name,
  l.crop_name_ta,
  l.variety,
  l.variety_ta,
  l.category,
  l.quantity,
  l.unit,
  l.expected_price_per_unit,
  l.min_acceptable_price_per_unit,
  l.harvesting_date,
  l.listed_date,
  l.sell_within_days,
  l.storage_condition,
  l.storage_condition_ta,
  l.district,
  l.district_ta,
  l.mandi_benchmark_price,
  l.benchmark_source,
  l.benchmark_date,
  l.transport_estimate,
  l.packaging_estimate,
  l.status,
  l.description,
  l.description_ta,
  l.created_at,
  l.updated_at
FROM public.produce_listings l;

-- Grant least-privilege view read permissions
REVOKE ALL ON public.produce_listings_public FROM PUBLIC;
GRANT SELECT ON public.produce_listings_public TO anon, authenticated;

-- ====================================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produce_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unsold_guidance ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------------
-- A. PROFILES RLS
-- ------------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles are readable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are readable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------------
-- B. PRODUCE LISTINGS RLS & DIRECT TABLE PRIVILEGES
-- ------------------------------------------------------------------------------------
-- Revoke direct base table access from anon so public clients cannot bypass masked view
REVOKE ALL ON public.produce_listings FROM anon;

-- Grant CRUD to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.produce_listings TO authenticated;

-- Restrict direct base table SELECT to the farmer owner or buyers who placed an offer
DROP POLICY IF EXISTS "Produce listings are readable by all" ON public.produce_listings;
DROP POLICY IF EXISTS "Base produce listings readable by owner or offer participant" ON public.produce_listings;
CREATE POLICY "Base produce listings readable by owner or offer participant"
ON public.produce_listings FOR SELECT
TO authenticated
USING (
  auth.uid() = farmer_id 
  OR public.has_user_offered_on_listing(id, auth.uid())
);

DROP POLICY IF EXISTS "Farmers can create listings" ON public.produce_listings;
CREATE POLICY "Farmers can create listings"
ON public.produce_listings FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = farmer_id 
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'farmer')
);

DROP POLICY IF EXISTS "Farmers can update own unsold listings" ON public.produce_listings;
CREATE POLICY "Farmers can update own unsold listings"
ON public.produce_listings FOR UPDATE
TO authenticated
USING (
  auth.uid() = farmer_id 
  AND status != 'sold'
)
WITH CHECK (
  auth.uid() = farmer_id
);

-- ------------------------------------------------------------------------------------
-- C. OFFERS RLS (STRICT BID PRIVACY)
-- ------------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Offers visible only to submitting buyer and listing farmer" ON public.offers;
CREATE POLICY "Offers visible only to submitting buyer and listing farmer"
ON public.offers FOR SELECT
TO authenticated
USING (
  auth.uid() = buyer_id 
  OR 
  public.is_listing_owner(offers.listing_id, auth.uid())
);

DROP POLICY IF EXISTS "Buyers can create offers on open listings" ON public.offers;
CREATE POLICY "Buyers can create offers on open listings"
ON public.offers FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = buyer_id
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'buyer')
);

DROP POLICY IF EXISTS "Farmers can decline pending offers" ON public.offers;
CREATE POLICY "Farmers can decline pending offers"
ON public.offers FOR UPDATE
TO authenticated
USING (
  public.is_listing_owner(offers.listing_id, auth.uid())
  AND status = 'pending'
)
WITH CHECK (
  status = 'declined'
);

-- ------------------------------------------------------------------------------------
-- D. UNSOLD GUIDANCE RLS
-- ------------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Unsold guidance readable by all" ON public.unsold_guidance;
CREATE POLICY "Unsold guidance readable by all"
ON public.unsold_guidance FOR SELECT
TO anon, authenticated
USING (true);

-- Commit transaction
COMMIT;

-- ====================================================================================
-- 8. NON-DESTRUCTIVE STATIC VERIFICATION DIAGNOSTICS & ROLLBACK PLAN
-- ====================================================================================
-- The queries below are diagnostic checks to run AFTER executing the migration above.
-- None of these queries mutate application data.

/*
---------------------------------------------------------------------------------------
-- VERIFICATION CHECK 1: Confirm RLS is enabled on all FarmLink tables
---------------------------------------------------------------------------------------
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'produce_listings', 'offers', 'unsold_guidance');
-- Expected: rowsecurity = true for all 4 tables.

---------------------------------------------------------------------------------------
-- VERIFICATION CHECK 2: Confirm View Security Invoker is FALSE (Runs as Definer)
---------------------------------------------------------------------------------------
SELECT relname, reloptions 
FROM pg_class 
WHERE relnamespace = 'public'::regnamespace 
  AND relname = 'produce_listings_public';
-- Expected: reloptions is NULL or contains 'security_invoker=false'.

---------------------------------------------------------------------------------------
-- VERIFICATION CHECK 3: Confirm Table and View Permissions
---------------------------------------------------------------------------------------
SELECT grantee, table_name, privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
  AND table_name IN ('produce_listings', 'produce_listings_public', 'offers', 'profiles')
ORDER BY table_name, grantee, privilege_type;
-- Expected:
-- - produce_listings_public has SELECT for anon and authenticated.
-- - produce_listings has NO SELECT for anon (only authenticated).
-- - offers has NO privileges for anon.

---------------------------------------------------------------------------------------
-- VERIFICATION CHECK 4: Confirm Functions have SECURITY DEFINER and Search Path
---------------------------------------------------------------------------------------
SELECT proname, prosecdef, proconfig
FROM pg_proc
JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
WHERE nspname = 'public'
  AND proname IN (
    'accept_offer', 
    'handle_new_user', 
    'protect_profile_immutability', 
    'validate_offer_submission', 
    'auto_transition_listing_to_negotiating', 
    'enforce_listing_status_transitions',
    'has_user_offered_on_listing',
    'is_listing_owner'
  );
-- Expected: prosecdef = true and proconfig = {'search_path=public, pg_temp'} for all.

---------------------------------------------------------------------------------------
-- VERIFICATION PROCEDURE 1: Phone Masking Test (Anonymous & Non-Offering Buyers)
---------------------------------------------------------------------------------------
-- Step A: Set role to anon and query view:
-- SET ROLE anon;
-- SELECT id, crop_name, farmer_phone FROM public.produce_listings_public LIMIT 3;
-- Expected: farmer_phone = 'Protected (Sign in & submit offer to view)'
--
-- Step B: Attempt direct base table read as anon:
-- SELECT id, farmer_phone FROM public.produce_listings LIMIT 3;
-- Expected: ERROR: permission denied for table produce_listings (or 0 rows returned).
-- RESET ROLE;

---------------------------------------------------------------------------------------
-- VERIFICATION PROCEDURE 2: Competing Buyer Isolation Test
---------------------------------------------------------------------------------------
-- Connect as Buyer 2 (e.g. set request.jwt.claim.sub = '<buyer-2-uuid>'):
-- SELECT * FROM public.offers WHERE buyer_id = '<buyer-1-uuid>';
-- Expected: 0 rows returned (RLS isolates offers strictly to owner & listing farmer).

---------------------------------------------------------------------------------------
-- VERIFICATION PROCEDURE 3: Self-Bidding Prevention Test
---------------------------------------------------------------------------------------
-- Attempt to insert an offer where buyer_id matches the listing's farmer_id:
-- INSERT INTO public.offers (listing_id, buyer_id, buyer_name, buyer_phone, offered_price_per_unit, quantity, unit)
-- VALUES ('<listing-id>', '<farmer-id>', 'Farmer Test', '9876543210', 50, 10, 'kg');
-- Expected: ERROR: 'Farmers cannot place offers on their own produce listings.'

---------------------------------------------------------------------------------------
-- VERIFICATION PROCEDURE 4: Concurrency Verification Procedure (accept_offer)
---------------------------------------------------------------------------------------
-- Note: Concurrency cannot be validated by static queries alone. To verify:
-- 1. Create a listing with two competing pending offers (Offer A and Offer B).
-- 2. Open two concurrent psql sessions or run concurrent asynchronous calls:
--    Worker 1: SELECT public.accept_offer('<offer-A-uuid>');
--    Worker 2: SELECT public.accept_offer('<offer-B-uuid>');
-- 3. Worker 1 will acquire FOR UPDATE on produce_listings and succeed (status: sold, Offer A accepted, Offer B declined).
-- 4. Worker 2 will wait on the parent lock, then re-check listing status and raise:
--    ERROR: 'This produce lot is already sold.'
-- 5. Neither transaction deadlocks; exactly one offer is accepted.

---------------------------------------------------------------------------------------
-- SCOPED ROLLBACK SCRIPT (DESTRUCTIVE TO FARMLINK OBJECTS ONLY)
---------------------------------------------------------------------------------------
-- WARNING: Running the statements below will permanently drop all FarmLink Phase 2 
-- database tables, views, triggers, functions, and types. Unrelated objects in the 
-- database will NOT be affected.
--
-- BEGIN;
--   -- Drop Auth trigger and function
--   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
--   DROP FUNCTION IF EXISTS public.handle_new_user();
--
--   -- Drop View
--   DROP VIEW IF EXISTS public.produce_listings_public;
--
--   -- Drop Tables (in reverse dependency order)
--   DROP TABLE IF EXISTS public.unsold_guidance CASCADE;
--   DROP TABLE IF EXISTS public.offers CASCADE;
--   DROP TABLE IF EXISTS public.produce_listings CASCADE;
--   DROP TABLE IF EXISTS public.profiles CASCADE;
--
--   -- Drop Functions
--   DROP FUNCTION IF EXISTS public.accept_offer(UUID);
--   DROP FUNCTION IF EXISTS public.enforce_listing_status_transitions();
--   DROP FUNCTION IF EXISTS public.auto_transition_listing_to_negotiating();
--   DROP FUNCTION IF EXISTS public.validate_offer_submission();
--   DROP FUNCTION IF EXISTS public.protect_profile_immutability();
--   DROP FUNCTION IF EXISTS public.has_user_offered_on_listing(UUID, UUID);
--   DROP FUNCTION IF EXISTS public.is_listing_owner(UUID, UUID);
--
--   -- Drop Custom Types
--   DROP TYPE IF EXISTS public.guidance_category;
--   DROP TYPE IF EXISTS public.offer_status;
--   DROP TYPE IF EXISTS public.listing_status;
--   DROP TYPE IF EXISTS public.crop_category;
--   DROP TYPE IF EXISTS public.produce_unit;
--   DROP TYPE IF EXISTS public.user_role;
-- COMMIT;
*/

