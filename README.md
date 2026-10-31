# FarmLink — Agricultural Marketplace & Decision Support

FarmLink is a bilingual (English / தமிழ்) agricultural marketplace and decision-support web application designed for Tamil Nadu's farming ecosystem. It empowers farmers, Farmer Producer Organizations (FPOs), wholesale buyers, and institutional buyers to discover fair market prices, negotiate structured trade offers with transparent logistics breakdowns, and close farmgate transactions securely.

---

## 🌟 Key Features

1. **True Net Realization Decision Engine**
   - Calculates the net revenue per unit after factoring in transport estimates, packaging costs, and mandi commission fees.
   - Compares buyer counter-offers against local APMC Mandi benchmark prices in real time.

2. **Produce Listings & Lifecycle Management**
   - Detailed crop profiles: category, variety, harvest date, perishability countdown, storage conditions, and quality specifications.
   - Real-time status tracking: `active`, `pending_offer`, `sold`, and `cancelled`.

3. **Structured B2B Negotiation & Offer System**
   - Buyers submit transparent offers with explicit cost contributions (transport, packaging, handling) and payment terms.
   - Side-by-side offer comparison table for farmers ranking offers by Net Realization.

4. **Atomic Concurrency-Safe Transaction Engine**
   - Backend PostgreSQL RPC function `accept_offer` executes a transactional lock (`FOR UPDATE`) on the listing and winning offer.
   - Atomically accepts the winning offer, automatically declines competing pending offers, and marks the listing as `sold`.

5. **Privacy-Preserving Contact Protection**
   - Sensitive farmer contact numbers are masked on public marketplace listings.
   - Unmasked contact information is unlocked only for the listing owner or authenticated buyers with active offers on that specific produce listing.

6. **Dual-Mode Operation (Demo Mode + Real Supabase Mode)**
   - **Demo Mode**: 4 pre-seeded personas operating in isolated `localStorage` for instant zero-config exploration:
     - `farmer-1`: Murugan Raman (Tomato/Brinjal Cultivator, Madurai)
     - `fpo-1`: Vaigai Farmers Collective (Kumar, Melur Aggregation Center)
     - `buyer-1`: Priya Wholesale Traders (Mattuthavani Vegetable Market)
     - `buyer-2`: Kavitha Agro Foods (Food Processing Enterprise, Trichy)
   - **Real Supabase Cloud Mode**: Live email/password authentication, PostgreSQL Row-Level Security (RLS), real-time database queries, and transactional RPCs.

---

## 🏗️ Architecture & Dual-Mode Data Access

FarmLink utilizes an abstracted data-access layer that cleanly routes calls depending on whether the user is logged into Supabase or using local demo personas:

```
src/
├── context/
│   ├── AuthContext.tsx        # Supabase authentication session & live profile state
│   ├── DemoUserContext.tsx    # 4 local demo personas & active persona state
│   └── LanguageContext.tsx    # English / தமிழ் i18n translation context
├── data/
│   ├── dataAccess.ts          # Unified boundary: routes async calls to Supabase or localStorage
│   ├── supabaseDataAccess.ts  # Remote Supabase queries, RPCs, and row mappers
│   ├── storage.ts             # LocalStorage persistence for demo mode
│   └── mockData.ts            # Seed data for demo personas, crops, and mandi benchmarks
├── pages/                     # Responsive marketplace, dashboard, and negotiation pages
└── components/                # Reusable UI widgets, guards, banners, and modals
```

- When **authenticated via Supabase**, all mutations and queries hit PostgreSQL tables (`produce_listings`, `offers`, `profiles`) protected by RLS.
- When in **Demo Mode**, mutations and queries operate entirely inside `localStorage`, preserving full app usability offline.

---

## 🔒 Database & Security Model

The backend schema and access control are defined in `supabase_phase2_migration.sql`:

- **Row-Level Security (RLS)**: Enforced across `profiles`, `produce_listings`, and `offers`.
- **Phone Privacy View (`produce_listings_public`)**: Renders listings with `mask_phone()` unless the requesting user owns the listing or has submitted an offer. Direct unmasked base table queries are restricted to authorized owners.
- **Role Isolation**: Secure role assignment during user registration via `auth.users` trigger (`handle_new_user`).
- **Idempotent Migration**: Safe to test in any Supabase project with automated verification checks.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or later)
- npm (v9.0.0 or later)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd farmlink
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Provide your Supabase URL and anonymous publishable key:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-publishable-key
   ```
   *(If left unconfigured or empty, FarmLink runs smoothly in Demo Mode using localStorage).*

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🗄️ Database Setup (Supabase)

To enable live backend authentication and cloud storage:

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor** in the left sidebar.
3. Open `supabase_phase2_migration.sql` from this repository.
4. Paste the contents into the SQL Editor and click **Run**.
5. The migration will create:
   - Custom enums: `user_role`, `crop_category`, `produce_unit`, `listing_status`, `offer_status`
   - Tables: `profiles`, `produce_listings`, `offers`
   - View: `produce_listings_public`
   - Helper functions: `mask_phone`, `is_authenticated_buyer`, `has_user_offered_on_listing`, `accept_offer`
   - Triggers: `on_auth_user_created` for automatic profile creation
   - Verification suite running automated RLS and constraint tests

---

## 📑 Review 2 / CoE Submission Documentation
For comprehensive architectural specifications, security threat models, field validation results with 3 regional stakeholders, and verification matrices, refer to [REVIEW_2_DOCUMENTATION.md](./REVIEW_2_DOCUMENTATION.md).
