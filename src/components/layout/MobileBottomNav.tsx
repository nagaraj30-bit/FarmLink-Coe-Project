import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDemoUser } from '../../hooks/useDemoUser';
import { getListings, getOffersForListing } from '../../data/dataAccess';

export const MobileBottomNav: React.FC = () => {
  const { currentProfile, isFarmer, dataRevision } = useDemoUser();
  const location = useLocation();

  // Compute pending offers count using existing data-layer methods if user is farmer
  const pendingCount = useMemo(() => {
    if (!isFarmer) return 0;
    const listings = getListings({ farmerId: currentProfile.id });
    let count = 0;
    listings.forEach(l => {
      const offers = getOffersForListing(l.id);
      count += offers.filter(o => o.status === 'pending').length;
    });
    return count;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProfile.id, isFarmer, dataRevision]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-stone-900 border-t border-stone-800 text-stone-300 shadow-lg safe-area-bottom"
    >
      <div className="grid grid-flow-col auto-cols-fr items-center h-16 px-1">
        {isFarmer ? (
          <>
            {/* Dashboard */}
            <Link
              to="/farmer"
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm outline-hidden ${
                isActive('/farmer') && location.pathname === '/farmer'
                  ? 'text-emerald-400 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-[10px] mt-0.5">Dashboard</span>
            </Link>

            {/* My Listings */}
            <Link
              to="/farmer/listings"
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm outline-hidden ${
                isActive('/farmer/listings')
                  ? 'text-emerald-400 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className="relative">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-amber-500 text-stone-950 font-bold text-[9px] flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">My listings</span>
            </Link>

            {/* Add Produce */}
            <Link
              to="/farmer/add-produce"
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm outline-hidden ${
                isActive('/farmer/add-produce')
                  ? 'text-emerald-400 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center -mt-1 shadow-xs">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-[10px] mt-0.5">Add</span>
            </Link>

            {/* Marketplace */}
            <Link
              to="/marketplace"
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm outline-hidden ${
                isActive('/marketplace') || location.pathname.startsWith('/listing/')
                  ? 'text-emerald-400 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-[10px] mt-0.5">Market</span>
            </Link>

            {/* Switch / Role */}
            <Link
              to="/roles"
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm outline-hidden ${
                isActive('/roles')
                  ? 'text-emerald-400 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-[10px] mt-0.5">Profile</span>
            </Link>
          </>
        ) : (
          <>
            {/* Marketplace */}
            <Link
              to="/marketplace"
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm outline-hidden ${
                isActive('/marketplace') || location.pathname.startsWith('/listing/')
                  ? 'text-emerald-400 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-[10px] mt-0.5">Marketplace</span>
            </Link>

            {/* Farmer View */}
            <Link
              to="/farmer"
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm outline-hidden ${
                isActive('/farmer')
                  ? 'text-emerald-400 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-[10px] mt-0.5">Farmer view</span>
            </Link>

            {/* Overview / Pitch */}
            <Link
              to="/"
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm outline-hidden ${
                location.pathname === '/'
                  ? 'text-emerald-400 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[10px] mt-0.5">Overview</span>
            </Link>

            {/* Switch / Role */}
            <Link
              to="/roles"
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm outline-hidden ${
                isActive('/roles')
                  ? 'text-emerald-400 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-[10px] mt-0.5">Profile</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
