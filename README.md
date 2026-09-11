# FarmLink — Digital Agricultural Marketplace (Phase 1 Prototype)

> **Tagline:** Sell smarter. Earn better.  
> **One-line pitch:** FarmLink is a digital agricultural marketplace that helps small farmers compare buyer offers using **estimated take-home income** after selling costs, rather than ranking offers only by gross price. It also highlights listings based on the farmer's stated selling deadline for perishable produce.

---

## 🌾 Phase 1 Prototype Scope

This codebase represents **Phase 1 (First 35% frontend prototype)** built with:
* **React 19 + TypeScript + Vite 8**
* **Tailwind CSS v4** (Agricultural palette: deep greens, warm sand neutrals, terracotta accents)
* **React Router v7**
* **Standalone Data Access Layer** backed by local storage and realistic Tamil Nadu agricultural mock data.

### Future Scope (Phases 2–4 — Not Included in Phase 1)
As mandated by the master brief, Phase 1 strictly avoids:
- Real Supabase / Firebase backends or password authentication (uses demo profile switching instead)
- Payments / Payment gateways
- AI price prediction, biological spoilage prediction, or automated market scraping
- Real-time GPS truck tracking or delivery-partner integrations
- Multi-farmer aggregation algorithms

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Build & Typecheck
```bash
npm run build
npm run lint
```

---

## 💡 Core Innovations Implemented

### 1. Net-Return Calculation & Transparent Breakdown
Rather than ranking offers solely by top-line gross price, FarmLink calculates:

$$\text{Estimated Net Return} = \text{Total Offer Amount} - \text{Transport Cost} - \text{Packaging Cost} - \text{Other Selling Costs}$$

Where:
$$\text{Total Offer Amount} = \text{Offered Quantity} \times \text{Offer Price Per Unit}$$

- **Landing Page Concrete Showcase:**
  - **Offer A:** ₹40/kg × 1,000 kg = ₹40,000 gross − ₹3,500 costs = **₹36,500 estimated net return** (~₹36.50/kg net).
  - **Offer B:** ₹45/kg × 1,000 kg = ₹45,000 gross − ₹11,500 costs = **₹33,500 estimated net return** (~₹33.50/kg net).
  - *Result:* Offer A delivers **₹3,000 more take-home income** despite offering ₹5/kg lower gross price!
- **Numeric Comparison Engine:** Offers are sorted and evaluated strictly using numeric `estimatedNetReturn` before formatting.
- **Tie Handling:** If two offers produce the identical highest net return, both are awarded the "Best estimated return" badge.
- **Mandatory Disclaimer Displayed Everywhere:**
  > *"Estimated net return, based on entered costs — not a guaranteed profit."*

### 2. Stated Selling Deadline & Urgency
- `sellWithinDays <= 1` → **High urgency**
- `sellWithinDays <= 3` → **Medium urgency**
- `sellWithinDays > 3` → **Normal urgency**
- *Note:* Urgency is a deadline-based indicator reflecting the farmer's scheduling requirements, not an AI biological spoilage prediction.

### 3. Strict Unit Inheritance & Validation
- Buyer offers inherit and lock the parent listing's unit (e.g. `kg`, `quintal`, `nuts`).
- Offered quantities cannot exceed available listing quantity.
- All numbers and costs are validated non-negative before calculating.

---

## 🏛️ Architecture & Data-Access Layer

All data storage and operations are strictly isolated in `src/data/dataAccess.ts`. UI components **never** directly access `localStorage`:

```
src/
├── types/
│   └── index.ts               # Profile, ProduceListing, Offer, Calculation models
├── utils/
│   ├── calculations.ts        # calculateNetReturn(), getUrgency(), rankOffersByNetReturn()
│   └── formatters.ts          # formatINR() with Indian numbering (₹1,00,000), formatNumberIN()
├── data/
│   ├── mockData.ts            # Regional seed profiles, produce listings, and buyer offers
│   └── dataAccess.ts          # getListings, getListingById, createListing, updateListing,
│                              # getOffersForListing, getOffersByBuyer, createOffer,
│                              # updateOfferStatus, acceptOffer(), resetDemoData()
├── context/
│   ├── DemoUserContextInstance.ts
│   └── DemoUserContext.tsx    # Demo mode switcher & profile-based data isolation
├── hooks/
│   └── useDemoUser.ts         # Hook for accessing active demo profile
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx         # Prototype mode indicator, profile switcher, reset button
│   │   └── Footer.tsx         # Disclosures and operating principles
│   ├── common/
│   │   ├── Badge.tsx          # Urgency, Status, and Best Return badges
│   │   ├── DisclaimerNotice.tsx # Mandatory net return disclaimer
│   │   └── EmptyState.tsx     # Reusable empty states with verb-first CTAs
│   └── comparison/
│       └── NetReturnBreakdown.tsx # Gross - Deductions = Estimated Net Return breakdown
└── pages/
    ├── LandingPage.tsx        # 1. Landing page with interactive comparison demonstration
    ├── RoleSelectionPage.tsx  # 2. Role selection (Murugan, Selvam, Priya, Kavitha)
    ├── FarmerDashboardPage.tsx# 3. Farmer dashboard with urgent listings & pending offers
    ├── AddProducePage.tsx     # 4. Add produce form with live urgency preview & validation
    ├── MyListingsPage.tsx     # 5. My listings inventory page with status tabs
    ├── BuyerMarketplacePage.tsx # 6. Buyer marketplace catalog with deadline filters
    ├── ProduceDetailsPage.tsx # 7. Produce specifications & farmer details
    ├── MakeOfferPage.tsx      # 8. Make offer form with locked unit & live preview
    └── FarmerOffersComparisonPage.tsx # 9. Side-by-side net return comparison & acceptance
```

---

## 🧪 Testing the Prototype Workflow

1. **Visit Landing Page (`/`):**
   - Review the Offer A vs Offer B comparison demonstrating why higher gross prices can yield lower net returns.
2. **Switch Profile (`/roles`):**
   - Select **Murugan Raman** (Farmer, Madurai).
   - Go to **Farmer Dashboard** (`/farmer`). Notice the 3 listings and pending offers.
   - Click **Compare offers** on *Country Tomatoes*.
   - Notice Offer 1 (₹40/kg, ₹36,500 net) is ranked above Offer 2 (₹45/kg, ₹33,500 net) and highlighted with the **"Best estimated return"** badge.
3. **Accept Offer:**
   - Click **Accept offer** on Rank #1.
   - Notice: Offer status changes to `Accepted`, listing status changes to `Sold`, and other pending offers are declined.
4. **Make an Offer as Buyer:**
   - Switch profile to **Priya Wholesale Traders** (Buyer).
   - Go to **Marketplace** (`/marketplace`).
   - Click **Make offer** on *Moringa (Drumsticks)*.
   - Enter quantity (inherited `kg`), offer price, and estimated transport/packaging costs.
   - Watch the live net-return preview update in real-time.
   - Submit offer and verify it appears in your "My submitted offers" view.
5. **Reset Demo Data:**
   - Click **Reset demo data** in the top navbar banner anytime to return all listings and offers to their default state.
