# FarmLink — Digital Agricultural Marketplace

> **Tagline:** Sell smarter. Understand your returns.

FarmLink is a digital agricultural marketplace prototype that helps small and marginal farmers compare buyer offers using **estimated net return** after selling-related costs, rather than ranking offers only by gross price.

It also highlights listings based on the farmer's stated selling deadline for perishable produce, helping users make more informed selling decisions.

---

## 🎯 Problem Statement

Small and marginal farmers often face difficulties when selling limited quantities of perishable agricultural produce.

When multiple buyers provide offers, farmers may compare only the offered price per kilogram. However, a higher gross price does not always result in a higher take-home amount after considering transportation, packaging, and other selling-related costs.

Farmers may also struggle to identify which produce needs to be sold sooner based on their own selling deadlines.

FarmLink aims to address these challenges by providing:

- A digital marketplace for agricultural produce
- Transparent comparison of buyer offers
- Estimated net-return calculation after selling costs
- Selling-deadline-based urgency indicators
- A simple interface for informed selling decisions

> FarmLink is designed to support better decision-making. The displayed net returns are estimates and are not guaranteed profits.

---

## 🌾 Phase 1 Prototype Scope

This repository contains the **Phase 1 frontend prototype**, representing the first 35% of the planned FarmLink project.

The prototype is built with:

- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS v4**
- **React Router**
- **Standalone data-access layer**
- **Local Storage**
- **Tamil Nadu-inspired agricultural mock data**

### Included in Phase 1

- Landing page
- Demo role selection
- Farmer dashboard
- Add produce listing
- My listings
- Buyer marketplace
- Produce details
- Buyer offer submission
- Offer comparison
- Estimated net-return calculation
- Selling urgency indicator
- Demo profile switching
- Local Storage data persistence
- Accept-offer workflow
- Reset demo data option

### Future Scope — Phases 2–4

According to the project scope, Phase 1 strictly avoids the following features:

- Real Supabase or Firebase backend
- Real password authentication
- Payment gateways
- AI-based price prediction
- AI-based biological spoilage prediction
- Automated market scraping
- Real-time GPS truck tracking
- Delivery-partner integrations
- Multi-farmer aggregation algorithms

These features may be considered in future versions.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

Open the local URL shown in the terminal. It is usually:

```text
http://localhost:5173/
```

### 3. Build and Run Quality Checks

```bash
npm run build
npm run lint
```

---

## 💡 Core Innovations Implemented

### 1. Estimated Net-Return Calculation

FarmLink compares buyer offers using estimated net return instead of considering only the offered price.

### Formula

```text
Estimated Net Return =
Total Offer Amount − Transport Cost − Packaging Cost − Other Selling Costs
```

Where:

```text
Total Offer Amount =
Offered Quantity × Offer Price Per Unit
```

### Example Comparison

#### Offer A

```text
Offered price: ₹40/kg
Quantity: 1,000 kg

Gross amount:
₹40 × 1,000 = ₹40,000

Estimated selling costs:
₹3,500

Estimated net return:
₹40,000 − ₹3,500 = ₹36,500
```

#### Offer B

```text
Offered price: ₹45/kg
Quantity: 1,000 kg

Gross amount:
₹45 × 1,000 = ₹45,000

Estimated selling costs:
₹11,500

Estimated net return:
₹45,000 − ₹11,500 = ₹33,500
```

Although Offer B has a higher offered price, Offer A provides a higher estimated net return in this example.

| Offer | Gross Amount | Estimated Costs | Estimated Net Return |
|---|---:|---:|---:|
| Offer A | ₹40,000 | ₹3,500 | **₹36,500** |
| Offer B | ₹45,000 | ₹11,500 | ₹33,500 |

FarmLink displays the cost breakdown to make the comparison easier to understand.

### Comparison Rules

- Offers are compared using numeric net-return values before formatting.
- The highest estimated net return is highlighted.
- If multiple offers have the same highest net return, they are treated as tied.
- Rejected or unavailable offers are not treated as active best offers.
- The estimated value is not presented as guaranteed profit.

> **Disclaimer:** Estimated net return is based on entered costs and is not a guaranteed profit.

---

### 2. Selling Deadline and Urgency Awareness

Farmers can enter the number of days within which they want to sell their produce.

| Selling Deadline | Urgency Level |
|---|---|
| 1 day or less | High |
| 2–3 days | Medium |
| More than 3 days | Normal |

This is a deadline-based indicator that reflects the farmer's selling schedule.

> It is not an AI-based biological spoilage prediction system.

---

### 3. Strict Unit Inheritance and Validation

The supported produce units in Phase 1 are:

- `kg`
- `quintal`
- `crate`
- `tonne`

Buyer offers inherit and lock the parent listing's unit. Unit conversion is not included in this prototype.

The prototype also validates:

- Non-negative quantities
- Non-negative prices
- Non-negative selling costs
- Offered quantity against available listing quantity
- Valid listing and offer data

---

### 4. Demo Profiles and Data Isolation

The prototype uses demo profiles to demonstrate farmer and buyer workflows.

Example demo roles include:

- Farmer
- Buyer

Data operations are handled through a standalone data-access layer. The user interface does not directly access `localStorage`.

---

## 🏛️ Architecture and Data-Access Layer

The application's data storage and operations are isolated in:

```text
src/data/dataAccess.ts
```

The UI components do not directly access `localStorage`.

### Project Structure

```text
src/
├── assets/
├── types/
│   └── index.ts
├── utils/
│   ├── calculations.ts
│   └── formatters.ts
├── data/
│   ├── mockData.ts
│   └── dataAccess.ts
├── context/
│   ├── DemoUserContextInstance.ts
│   └── DemoUserContext.tsx
├── hooks/
│   └── useDemoUser.ts
├── components/
│   ├── common/
│   │   ├── Badge.tsx
│   │   ├── DisclaimerNotice.tsx
│   │   └── EmptyState.tsx
│   ├── comparison/
│   │   └── NetReturnBreakdown.tsx
│   └── layout/
│       ├── AppLayout.tsx
│       ├── Breadcrumbs.tsx
│       ├── Footer.tsx
│       ├── MobileBottomNav.tsx
│       ├── MobileTopBar.tsx
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       └── TopBar.tsx
└── pages/
    ├── LandingPage.tsx
    ├── RoleSelectionPage.tsx
    ├── FarmerDashboardPage.tsx
    ├── AddProducePage.tsx
    ├── MyListingsPage.tsx
    ├── BuyerMarketplacePage.tsx
    ├── ProduceDetailsPage.tsx
    ├── MakeOfferPage.tsx
    └── FarmerOffersComparisonPage.tsx
```

### Main Data Operations

The data-access layer includes operations such as:

- `getListings()`
- `getListingById()`
- `createListing()`
- `updateListing()`
- `getOffersForListing()`
- `getOffersByBuyer()`
- `createOffer()`
- `updateOfferStatus()`
- `acceptOffer()`
- `resetDemoData()`

---

## 📄 Application Pages

| Page | Route |
|---|---|
| Landing Page | `/` |
| Role Selection | `/roles` |
| Farmer Dashboard | `/farmer` |
| Add Produce | `/farmer/add-produce` |
| My Listings | `/farmer/listings` |
| Buyer Marketplace | `/marketplace` |
| Produce Details | `/listing/:id` |
| Make Offer | `/listing/:id/offer` |
| Offer Comparison | `/farmer/listings/:id/offers` |

---

## 🧪 Testing the Prototype Workflow

### 1. Visit the Landing Page

Open:

```text
/
```

Review the Offer A versus Offer B comparison and observe how a lower gross price can result in a higher estimated net return when selling costs are lower.

### 2. Switch to a Farmer Profile

Open:

```text
/roles
```

Select the farmer demo profile, such as **Murugan Raman**.

Then navigate to:

```text
/farmer
```

Review the farmer dashboard and available produce listings.

### 3. Compare Buyer Offers

Open the **Country Tomatoes** listing and navigate to the offer comparison page.

Verify that:

- Offer 1 has an estimated net return of ₹36,500.
- Offer 2 has an estimated net return of ₹33,500.
- Offer 1 is ranked higher.
- The best estimated return badge is displayed correctly.
- The complete cost breakdown is visible.

### 4. Accept an Offer

Accept the highest-ranked offer.

Verify that:

- The selected offer status changes to `Accepted`.
- The listing status changes to `Sold`.
- Other pending offers are declined or made unavailable.
- New offers cannot be submitted for a sold listing.

### 5. Make an Offer as a Buyer

Switch to a buyer demo profile, such as **Priya Wholesale Traders**.

Navigate to:

```text
/marketplace
```

Select a produce listing such as **Moringa / Drumsticks**.

Then:

1. Open the Make Offer page.
2. Enter the quantity.
3. Confirm that the unit is inherited from the listing.
4. Enter the offer price.
5. Enter estimated transport, packaging, and other selling costs.
6. Review the live estimated net-return preview.
7. Submit the offer.
8. Switch back to the farmer profile.
9. Verify that the submitted offer appears in the farmer's offer list.

### 6. Reset Demo Data

Use the **Reset Demo Data** option to restore the default listings and offers.

Verify that:

- Accepted listings return to their initial state.
- Default offers are restored.
- Newly created demo data is cleared.
- Duplicate records are not created.

---



## 🛠️ Technology Stack

- **Frontend:** React 19
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **Routing:** React Router
- **Data Storage:** Browser Local Storage
- **Code Quality:** Oxlint
- **Development Environment:** VS Code

---

## 🔮 Future Scope

Potential future improvements include:

- Real farmer and buyer authentication
- Cloud database integration
- Tamil-language interface
- Voice-assisted listing creation
- AI-assisted produce condition guidance
- Multi-farmer produce aggregation
- Transport and logistics coordination
- Live market-price integration
- Notifications and messaging
- Production deployment
- Mobile application support

---

## ⚠️ Disclaimer

FarmLink is an educational frontend prototype.

All farmer profiles, produce listings, buyer offers, costs, and net-return values are mock or estimated data. The estimated net return is not a guarantee of actual profit or final payment.

The selling urgency indicator is based on the farmer's stated selling deadline and does not predict biological spoilage.

---

## 📌 Project Status

**Phase 1 frontend prototype completed.**

The current version demonstrates the core concept of transparent buyer-offer comparison using estimated net returns and selling-deadline awareness.
