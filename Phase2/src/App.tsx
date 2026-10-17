import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { DemoUserProvider } from './context/DemoUserContext';
import { AppLayout } from './components/layout/AppLayout';
import { RouteGuard } from './components/common/RouteGuard';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RoleSelectionPage } from './pages/RoleSelectionPage';
import { FarmerDashboardPage } from './pages/FarmerDashboardPage';
import { MyListingsPage } from './pages/MyListingsPage';
import { AddProducePage } from './pages/AddProducePage';
import { FarmerOffersComparisonPage } from './pages/FarmerOffersComparisonPage';
import { BuyerMarketplacePage } from './pages/BuyerMarketplacePage';
import { ProduceDetailsPage } from './pages/ProduceDetailsPage';
import { MakeOfferPage } from './pages/MakeOfferPage';
import { FarmerProfilePage } from './pages/FarmerProfilePage';
import { BuyerOffersPage } from './pages/BuyerOffersPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DemoUserProvider>
          <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              {/* Public & Guest Accessible Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/roles" element={<RoleSelectionPage />} />
              <Route path="/marketplace" element={<BuyerMarketplacePage />} />
              <Route path="/produce/:listingId" element={<ProduceDetailsPage />} />

              {/* Farmer Protected Routes */}
              <Route
                path="/farmer"
                element={
                  <RouteGuard requiredRole="farmer">
                    <FarmerDashboardPage />
                  </RouteGuard>
                }
              />
              <Route
                path="/profile"
                element={
                  <RouteGuard requiredRole="farmer">
                    <FarmerProfilePage />
                  </RouteGuard>
                }
              />
              <Route
                path="/farmer/profile"
                element={
                  <RouteGuard requiredRole="farmer">
                    <FarmerProfilePage />
                  </RouteGuard>
                }
              />
              <Route
                path="/my-listings"
                element={
                  <RouteGuard requiredRole="farmer">
                    <MyListingsPage />
                  </RouteGuard>
                }
              />
              <Route
                path="/farmer/listings"
                element={
                  <RouteGuard requiredRole="farmer">
                    <MyListingsPage />
                  </RouteGuard>
                }
              />
              <Route
                path="/add-produce"
                element={
                  <RouteGuard requiredRole="farmer">
                    <AddProducePage />
                  </RouteGuard>
                }
              />
              <Route
                path="/offers/:listingId"
                element={
                  <RouteGuard requiredRole="farmer">
                    <FarmerOffersComparisonPage />
                  </RouteGuard>
                }
              />

              {/* Buyer Protected Routes */}
              <Route
                path="/buyer/my-offers"
                element={
                  <RouteGuard requiredRole="buyer">
                    <BuyerOffersPage />
                  </RouteGuard>
                }
              />
              <Route
                path="/buyer/offers"
                element={
                  <RouteGuard requiredRole="buyer">
                    <BuyerOffersPage />
                  </RouteGuard>
                }
              />
              <Route
                path="/make-offer/:listingId"
                element={
                  <RouteGuard requiredRole="buyer">
                    <MakeOfferPage />
                  </RouteGuard>
                }
              />

              {/* Dedicated 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DemoUserProvider>
    </AuthProvider>
  </LanguageProvider>
);
}
