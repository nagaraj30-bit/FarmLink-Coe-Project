import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDemoUser } from '../../hooks/useDemoUser';
import { getListings, getOffersForListing } from '../../data/dataAccess';

export const Sidebar: React.FC = () => {
  const { currentProfile, isFarmer, allProfiles, switchProfile, resetDemoData, dataRevision } = useDemoUser();
  const location = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

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
    <aside
      aria-label="Sidebar Navigation"
      className="hidden md:flex flex-col w-64 bg-stone-900 text-stone-300 border-r border-stone-800 shrink-0 h-screen sticky top-0 z-30"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-stone-800">
        <Link
          to="/"
          className="flex items-center gap-2.5 group focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md outline-hidden p-0.5"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold shadow-inner group-hover:bg-emerald-600 transition-colors">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-white leading-tight">
              FarmLink
            </div>
            <div className="text-[10px] text-stone-400 font-medium">
              Sell smarter. Earn better.
            </div>
          </div>
        </Link>
      </div>

      {/* Role Indicator Banner */}
      <div className="px-5 py-2.5 bg-stone-950/60 border-b border-stone-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${isFarmer ? 'bg-emerald-400' : 'bg-amber-400'}`}
            aria-hidden="true"
          />
          <span className="font-medium text-stone-200 capitalize">
            {currentProfile.role} Mode
          </span>
        </div>
        <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60">
          Prototype
        </span>
      </div>

      {/* Navigation Links (Grouped Sections) */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {isFarmer ? (
          <>
            {/* Farmer Overview */}
            <div className="space-y-1">
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Overview
              </div>
              <Link
                to="/farmer"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 outline-hidden ${
                  isActive('/farmer') && location.pathname === '/farmer'
                    ? 'bg-emerald-800 text-white'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Dashboard</span>
              </Link>
            </div>

            {/* Farmer Produce */}
            <div className="space-y-1">
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Produce
              </div>
              <Link
                to="/farmer/listings"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 outline-hidden ${
                  isActive('/farmer/listings')
                    ? 'bg-emerald-800 text-white'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>My listings</span>
                </div>
                {pendingCount > 0 && (
                  <span
                    className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-stone-950"
                    title={`${pendingCount} pending offers`}
                  >
                    {pendingCount}
                  </span>
                )}
              </Link>

              <Link
                to="/farmer/add-produce"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 outline-hidden ${
                  isActive('/farmer/add-produce')
                    ? 'bg-emerald-800 text-white'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add produce</span>
              </Link>
            </div>

            {/* Marketplace */}
            <div className="space-y-1">
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Marketplace
              </div>
              <Link
                to="/marketplace"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 outline-hidden ${
                  isActive('/marketplace') || location.pathname.startsWith('/listing/')
                    ? 'bg-emerald-800 text-white'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Browse marketplace</span>
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Buyer Marketplace */}
            <div className="space-y-1">
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Marketplace
              </div>
              <Link
                to="/marketplace"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 outline-hidden ${
                  isActive('/marketplace') || location.pathname.startsWith('/listing/')
                    ? 'bg-emerald-800 text-white'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Browse produce</span>
              </Link>
            </div>

            {/* Buyer Switch View */}
            <div className="space-y-1">
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Farmer View
              </div>
              <Link
                to="/farmer"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 outline-hidden ${
                  isActive('/farmer')
                    ? 'bg-emerald-800 text-white'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Farmer dashboard</span>
              </Link>
            </div>
          </>
        )}

        {/* General Demo Section */}
        <div className="space-y-1 pt-2 border-t border-stone-800/60">
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-stone-500">
            Demo & Sessions
          </div>
          <Link
            to="/roles"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 outline-hidden ${
              isActive('/roles')
                ? 'bg-emerald-800 text-white'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Switch demo profile</span>
          </Link>

          <Link
            to="/"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 outline-hidden ${
              location.pathname === '/'
                ? 'bg-emerald-800 text-white'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Overview & pitch</span>
          </Link>
        </div>
      </nav>

      {/* Footer / Profile Switcher Card */}
      <div className="p-3 border-t border-stone-800 bg-stone-950/40 relative">
        <button
          type="button"
          onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          aria-haspopup="true"
          aria-expanded={profileDropdownOpen}
          className="w-full flex items-center justify-between p-2 rounded-lg bg-stone-800/80 hover:bg-stone-800 border border-stone-700/80 text-left transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 outline-hidden"
        >
          <div className="flex items-center gap-2.5 truncate">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${isFarmer ? 'bg-emerald-400' : 'bg-amber-400'}`}
              aria-hidden="true"
            />
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">
                {currentProfile.fullName}
              </div>
              <div className="text-[10px] text-stone-400 truncate">
                {currentProfile.location}
              </div>
            </div>
          </div>
          <svg className="w-4 h-4 text-stone-400 shrink-0 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </button>

        {/* Dropdown popup */}
        {profileDropdownOpen && (
          <div
            className="absolute bottom-16 left-3 right-3 bg-white rounded-lg shadow-xl border border-stone-200 py-2 z-50 text-stone-900"
            onMouseLeave={() => setProfileDropdownOpen(false)}
          >
            <div className="px-3 py-1.5 border-b border-stone-100 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              Switch demo profile
            </div>
            <div className="py-1 max-h-60 overflow-y-auto">
              {allProfiles.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    switchProfile(p.id);
                    setProfileDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-start gap-2 hover:bg-stone-50 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-700 outline-hidden ${
                    p.id === currentProfile.id ? 'bg-emerald-50 text-emerald-950 font-medium' : ''
                  }`}
                >
                  <span
                    className={`mt-1 w-2 h-2 rounded-full shrink-0 ${p.role === 'farmer' ? 'bg-emerald-600' : 'bg-amber-600'}`}
                    aria-hidden="true"
                  />
                  <div>
                    <div className="font-medium text-stone-900 flex items-center gap-1.5">
                      {p.fullName}
                      <span className="text-[10px] font-normal px-1 py-0.2 rounded bg-stone-100 text-stone-600">
                        {p.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500">{p.location}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="border-t border-stone-100 pt-1.5 px-3">
              <Link
                to="/roles"
                onClick={() => setProfileDropdownOpen(false)}
                className="text-xs text-emerald-800 hover:text-emerald-900 font-semibold block py-1 focus-visible:ring-2 focus-visible:ring-emerald-700 outline-hidden"
              >
                All profile options →
              </Link>
            </div>
          </div>
        )}

        <div className="mt-2 pt-2 border-t border-stone-800/60 flex items-center justify-between text-[11px] text-stone-400">
          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="hover:text-white underline cursor-pointer focus-visible:ring-1 focus-visible:ring-emerald-500 rounded outline-hidden"
          >
            Reset demo data
          </button>
          <Link
            to="/roles"
            className="hover:text-white underline cursor-pointer focus-visible:ring-1 focus-visible:ring-emerald-500 rounded outline-hidden"
          >
            Exit demo
          </Link>
        </div>
      </div>

      {/* Reset confirmation modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-stone-900 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="reset-title">
            <h4 id="reset-title" className="text-base font-bold text-stone-900">Reset prototype data?</h4>
            <p className="text-xs text-stone-600 mt-2">
              This will restore the original demo listings, buyer offers, and reset back to farmer Murugan Raman.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-md focus-visible:ring-2 focus-visible:ring-stone-400 outline-hidden"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetDemoData();
                  setResetModalOpen(false);
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-md focus-visible:ring-2 focus-visible:ring-emerald-600 outline-hidden"
              >
                Reset data
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
