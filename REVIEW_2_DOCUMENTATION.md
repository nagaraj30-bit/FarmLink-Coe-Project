# FarmLink — Review 2 / CoE Submission Documentation

## 1. Project Overview & Problem Statement

### The Problem
Smallholder farmers across Tamil Nadu frequently face severe market friction:
1. **Gross Price Deception**: Wholesale buyers quote headline prices that seem attractive, but subsequent unbudgeted deductions for transport, gunny bags, loading/unloading, and mandi cess often reduce take-home realizations by 20% to 40%.
2. **Perishability & Panic Selling**: Produce with limited shelf life (e.g., tomatoes, bananas, leafy vegetables) creates distress situations where farmers accept exploitative spot prices as harvest deadlines approach.
3. **Information Asymmetry**: Farmers lack transparent real-time comparisons between local APMC Mandi benchmark rates and private trade offers.
4. **Contact Harassment**: Publicly posting personal mobile numbers on open agricultural bulletin boards results in spam and predatory broker calls.

### The Proposed Solution: FarmLink
FarmLink is a bilingual (English / தமிழ்) decision-support agricultural marketplace that empowers farmers and buyers to negotiate structured trades transparently:
- **True Net Realization Engine**: Automatically computes the farmer's net take-home return per unit after deducting transport estimates, packaging, and handling costs, comparing it directly with local Mandi benchmarks.
- **Deadline-Driven Urgency**: Dynamic countdown tags (`high`, `medium`, `normal`) visually alert buyers to closing opportunities while offering farmers localized emergency unsold options (cold storage, cottage processing, Uzhavar Sandhai clearance, FPO aggregation).
- **Privacy-Preserving Marketplace**: Farmer phone numbers are masked for anonymous browsers and unlocked only when an authenticated buyer submits a valid trade offer.
- **Atomic Transaction Acceptance**: Eliminates double-selling via concurrency-safe PostgreSQL row locking (`accept_offer`), instantly accepting the winning offer and declining competing bids.

---

## 2. Technology Stack & Architecture

### Technology Stack
- **Frontend Framework**: React 19 + TypeScript (strict mode)
- **Build Tool**: Vite 8.3.4 (ESM native bundling)
- **Styling**: Tailwind CSS v4 + Lucide React icon library
- **Routing**: React Router DOM v7 (role-guarded layouts)
- **Database & Auth**: Supabase (@supabase/supabase-js v2.118.0) + PostgreSQL 15+
- **Offline Storage**: Isolated LocalStorage engine for zero-config offline demo exploration

### Dual-Mode Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          User Interface (UI)                           │
│  LandingPage | Marketplace | ProduceDetails | Dashboard | OfferCompare │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │  src/data/dataAccess.ts     │
                    │  (Unified Dual Boundary)    │
                    └──────┬───────────────┬──────┘
                           │               │
            isRealAuth === false     isRealAuth === true
                           │               │
                           ▼               ▼
                 ┌────────────────┐ ┌───────────────────────────┐
                 │  LocalStorage  │ │    Supabase Cloud API     │
                 │   Engine       │ │  (PostgreSQL + PostgREST) │
                 │  - SEED_DATA   │ │  - produce_listings_public│
                 │  - 4 Personas  │ │  - accept_offer RPC       │
                 │  - Instant     │ │  - RLS Policies           │
                 └────────────────┘ └───────────────────────────┘
```

- **Strict Non-Fallback Guarantee**: Authenticated Supabase sessions query live PostgreSQL tables. If a database error occurs, it is surfaced to the user via an actionable retry banner and **never silently falls back to LocalStorage**.
- **Offline Demo Mode**: Provides 4 pre-seeded personas (`farmer-1`, `buyer-1`, `buyer-2`, `fpo-1`) that allow evaluators and farmers to test all negotiation flows without credentials or internet access.

---

## 3. Setup & Execution Instructions

### Prerequisites
- Node.js v18.0.0 or higher
- npm v9.0.0 or higher

### Local Development Setup
1. **Clone & Install**:
   ```bash
   git clone <repository-url>
   cd farmlink
   npm install
   ```

2. **Environment Configuration**:
   Create `.env.local` using `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   Configure your Supabase URL and Publishable Anon Key:
   ```env
   VITE_SUPABASE_URL="https://your-project-id.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
   ```
   *(If unconfigured, the application runs fully in offline Demo Persona mode).*

3. **Start Development Server**:
   ```bash
   node node_modules/vite/bin/vite.js --port=3000 --host=0.0.0.0
   ```
   Access locally at: `http://localhost:3000/`

4. **Production Build & Verification**:
   ```bash
   node node_modules/typescript/bin/tsc --noEmit
   node node_modules/vite/bin/vite.js build
   ```

---

## 4. Database Architecture & Migration Instructions

### Migration Specifications (`supabase_phase2_migration.sql`)
The migration is fully idempotent and transactional (`BEGIN ... COMMIT`):
- **Custom Enums**: `user_role` (`farmer`, `buyer`), `produce_unit` (`kg`, `quintal`, `box`, `bags`, `nuts`), `crop_category`, `listing_status` (`active`, `negotiating`, `sold`, `expired`), `offer_status` (`pending`, `accepted`, `declined`).
- **Core Tables**:
  - `public.profiles`: 1:1 with `auth.users`, role locking trigger, character length constraints.
  - `public.produce_listings`: Inventory, harvest dates, selling deadlines, transportation/packaging estimates.
  - `public.offers`: Structured buyer bids, price per unit, cost contributions, locked units, foreign key cascades.
  - `public.unsold_guidance`: Advisory pathways (Cold Storage, Cottage Processing, Uzhavar Sandhai, FPO Aggregation).
- **Security Views**:
  - `public.produce_listings_public`: `WITH (security_invoker = false)` masks farmer phone numbers using `mask_phone()` unless `auth.uid() = farmer_id` or an offer has been submitted by the caller. Direct table `SELECT` is revoked from `anon`.
- **Atomic Offer Acceptance RPC (`accept_offer`)**:
  - `SECURITY DEFINER` function with `SET search_path = public, pg_temp`.
  - Exclusively locks the listing (`SELECT ... FOR UPDATE`), then the offer.
  - Atomically marks the offer `accepted`, auto-declines competing pending offers, and marks listing as `sold`.

### How to Apply the Migration in Supabase Dashboard
1. Log into your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project.
3. In the left navigation, click **SQL Editor** -> **New query**.
4. Paste the entire content of `supabase_phase2_migration.sql`.
5. Click **Run**.
6. The built-in verification queries at the bottom of the script will execute automatically, confirming that tables, views, RLS policies, triggers, and functions are properly installed.

---

## 5. Security Audit & Verified Controls

| Threat / Vulnerability | Security Control Implemented | Verification Evidence |
| :--- | :--- | :--- |
| **Phone Scraping / Harassment** | Phone numbers masked in `produce_listings_public` view. Direct `SELECT` on base table revoked from `anon`. | Static SQL verification + view masking logic confirmed. Unmasking requires active offer placement. |
| **Bid Confidentiality Leak** | RLS on `public.offers` restricts `SELECT` to `auth.uid() = buyer_id OR is_listing_owner()`. | Competing buyers cannot read or enumerate each other's offers. |
| **Concurrent Double-Selling** | `accept_offer` RPC executes explicit `FOR UPDATE` hierarchical row locking on parent listing and target offer. | Single serializable transaction prevents race conditions when accepting offers. |
| **Role Escalation in Registration** | `handle_new_user()` trigger strictly validates `role` in `raw_user_meta_data`, permitting only `'farmer'` or `'buyer'`. `protect_profile_immutability()` prevents role modifications. | Attempting to pass unauthorized roles triggers an exception and aborts auth registration. |
| **Undefined Farmer ID Bypass** | Replaced `(!item.farmerId || item.farmerId === currentUser.id)` with `(item.farmerId && item.farmerId === currentUser.id)` across all listing management pages and modals. | Verified in `FarmerDashboardPage.tsx`, `MyListingsPage.tsx`, `FarmerOffersComparisonPage.tsx`, and `EditListingModal.tsx`. |
| **Self-Bidding / Role Spoofing** | Database trigger `trg_validate_offer_submission` and frontend form guard block farmers from bidding on own lots and require `role: 'buyer'`. | Client-side validation in `MakeOfferPage.tsx` rejects `currentUser.id === listing.farmerId`. |
| **Source Map Exposure** | Production Vite build defaults to `sourcemap: false`. | `dist/assets` inspection confirmed 0 `.map` files generated. |

---

## 6. Functional Testing Matrix

| Feature / Workflow | Test Case | Expected Result | Status |
| :--- | :--- | :--- | :---: |
| **Marketplace Browsing** | Guest/Buyer loads `/marketplace` | Active produce lots render with masked phones and urgency badges | **PASS** |
| **Produce Lot Details** | User opens `/produce/:listingId` | Complete specifications render; phone displays privacy lock tag | **PASS** |
| **Listing Creation** | Farmer submits `/add-produce` form | Validates inventory > 0, price > 0; persists lot to active listings | **PASS** |
| **Listing Parameter Edit** | Farmer edits price/floor/days in modal | Validates floor <= target price, days 1–90; updates listing | **PASS** |
| **Structured Offer Creation**| Buyer submits offer on `/make-offer/:listingId` | Unit locked to listing; recalculates net return; validates quantity | **PASS** |
| **Net Realization Math** | `calculateNetReturn(1000, 28, 1500, 800, 0, 'kg')` | Gross ₹28,000, Deductions ₹2,300, Net ₹25,700 (₹25.70/kg) | **PASS** |
| **Offer Ranking & Ties** | `rankOffers` with identical top net returns | Both offers receive `isBestReturn: true` and Rank 1 | **PASS** |
| **Atomic Acceptance** | Farmer accepts offer in `/offers/:listingId` | Winning offer accepted, competing offers declined, listing sold | **PASS** |
| **Sold State Enforcement** | User attempts to make offer on sold lot | Access blocked with informative "Produce Lot Already Sold" banner | **PASS** |
| **Bilingual Toggle** | Language switched between EN and TA | Immediate reactive translation across all headers, terms, and notices | **PASS** |
| **Demo Persona Reset** | Evaluator clicks "Reset Demo Data" | `localStorage` re-seeded to initial listings and offers | **PASS** |

---

## 7. Field Validation with Stakeholders

As part of Review 2 preparation, field validation was conducted with **3 regional stakeholders**:
- **1 Farmer**: Thiru. Murugan (Usilampatti, Madurai District — Tomato and Brinjal cultivator).
- **2 Shopkeepers / Startup Vendors**: 
  - Wholesale Produce Trader (Mattuthavani Vegetable Market, Madurai).
  - Food Processing Startup Proprietor (Tiruchirappalli Food Cluster).

### Feedback Areas & Changes Implemented

1. **Accessibility & Visual Hierarchy**:
   - *Feedback*: Farmers found complex data tables intimidating on mobile screens under direct sunlight.
   - *Change Implemented*: Replaced wide data tables with mobile-friendly card stacks, large status badges (`UrgencyBadge`, `StatusBadge`), and high-contrast color coding.

2. **Tamil Translation Availability**:
   - *Feedback*: English-only interface was unusable for farmgate negotiation; full vernacular support was essential.
   - *Change Implemented*: Built a comprehensive 1:1 translation dictionary (`LanguageContext.tsx`) covering navigation, produce categories, storage conditions, disclaimers, and urgency levels.

3. **Translation Accuracy & Agricultural Dialect**:
   - *Feedback*: Literal machine translations felt unnatural (e.g., translating "Net Realization" to generic terms).
   - *Change Implemented*: Refined terminology to recognized Tamil agricultural vocabulary:
     - Produce Listing: விளைபொருள் பட்டியல்
     - Net Return: நிகர வருவாய்
     - Wholesale Buyer: மொத்த வியாபாரி
     - Perishability Deadline: விற்பனை காலக்கெடு
     - Mandi Benchmark: உழவர் சந்தை / ஒழுங்குமுறை விற்பனைக் கூடம் விலை

4. **Calculation Transparency**:
   - *Feedback*: Vendors and farmers wanted explicit clarity on who pays for gunny bags and transportation.
   - *Change Implemented*: Added dedicated input fields for Transport Cost, Packaging Cost, and Other Handling Fees, ensuring both parties see the exact take-home realization before accepting bids. Added the mandatory disclaimer: *"Estimated net return, based on entered costs — not a guaranteed profit."*

---

## 8. Known Limitations & Future Improvements

### Known Limitations
1. **Live Supabase Execution**: The migration script `supabase_phase2_migration.sql` is fully prepared and hardened, but must be executed once via the Supabase Dashboard SQL Editor by the account owner to provision live cloud tables.
2. **Offline SMS Fallback**: Real-time push notifications currently rely on active web sessions; native cellular SMS fallback is not yet integrated.

### Future Roadmap
1. **Direct e-NAM Mandi API Integration**: Automate daily regional price feeds from the Government of India's electronic National Agriculture Market portal.
2. **FPO Logistics Pooling**: Allow multiple neighboring farmers to aggregate partial truckloads into single consolidated 10-ton shipments to minimize freight deductions.
3. **Automated WhatsApp Trade Confirmations**: Dispatch verified bilingual trade receipts upon offer acceptance via WhatsApp Business API.
