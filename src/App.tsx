import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DemoUserProvider } from './context/DemoUserContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { RoleSelectionPage } from './pages/RoleSelectionPage';
import { FarmerDashboardPage } from './pages/FarmerDashboardPage';
import { AddProducePage } from './pages/AddProducePage';
import { MyListingsPage } from './pages/MyListingsPage';
import { BuyerMarketplacePage } from './pages/BuyerMarketplacePage';
import { ProduceDetailsPage } from './pages/ProduceDetailsPage';
import { MakeOfferPage } from './pages/MakeOfferPage';
import { FarmerOffersComparisonPage } from './pages/FarmerOffersComparisonPage';

export function App() {
  return (
    <DemoUserProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            {/* 1. Landing page */}
            <Route path="/" element={<LandingPage />} />

            {/* 2. Role selection page */}
            <Route path="/roles" element={<RoleSelectionPage />} />

            {/* 3. Farmer dashboard */}
            <Route path="/farmer" element={<FarmerDashboardPage />} />

            {/* 4. Add produce form */}
            <Route path="/farmer/add-produce" element={<AddProducePage />} />
            <Route path="/farmer/add-listing" element={<Navigate to="/farmer/add-produce" replace />} />

            {/* 5. My listings page */}
            <Route path="/farmer/listings" element={<MyListingsPage />} />

            {/* 6. Buyer marketplace page */}
            <Route path="/marketplace" element={<BuyerMarketplacePage />} />
            <Route path="/buyer" element={<Navigate to="/marketplace" replace />} />

            {/* 7. Produce details page */}
            <Route path="/listing/:id" element={<ProduceDetailsPage />} />

            {/* 8. Make offer form */}
            <Route path="/listing/:id/offer" element={<MakeOfferPage />} />

            {/* 9. Farmer offers and net-return comparison page */}
            <Route path="/farmer/listings/:id/offers" element={<FarmerOffersComparisonPage />} />
            <Route path="/farmer/offers/:id" element={<Navigate to="/farmer/listings/:id/offers" replace />} />

            {/* Fallback */}
            <Route
              path="*"
              element={
                <div className="max-w-md mx-auto py-20 text-center space-y-3">
                  <h1 className="text-xl font-bold text-stone-900">Page not found</h1>
                  <p className="text-xs text-stone-500">The page you requested does not exist.</p>
                  <a
                    href="/"
                    className="inline-block px-4 py-2 bg-emerald-800 text-white text-xs font-semibold rounded"
                  >
                    Return home
                  </a>
                </div>
              }
            />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </DemoUserProvider>
  );
}

export default App;
