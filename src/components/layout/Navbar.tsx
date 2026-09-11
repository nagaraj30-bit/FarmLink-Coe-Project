import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDemoUser } from '../../hooks/useDemoUser';

export const Navbar: React.FC = () => {
  const { currentProfile, allProfiles, switchProfile, resetDemoData, isFarmer } = useDemoUser();
  const location = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-40">
      {/* Top prototype banner */}
      <div className="bg-emerald-900/90 text-emerald-100 text-xs px-4 py-1 flex items-center justify-between border-b border-emerald-800">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-700 text-white font-semibold text-[10px] px-1.5 py-0.5 rounded tracking-wide uppercase">
            Prototype mode
          </span>
          <span className="hidden sm:inline">
            Active role filters all views & offers by profile
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="hover:text-white underline text-[11px] cursor-pointer"
            title="Restore default mock listings and offers"
          >
            Reset demo data
          </button>
          <Link to="/roles" className="hover:text-white underline text-[11px]">
            Switch profile
          </Link>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-lg shadow-inner group-hover:bg-emerald-600 transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                  FarmLink
                </div>
                <div className="text-[11px] text-stone-400 -mt-1 hidden sm:block">
                  Sell smarter. Earn better.
                </div>
              </div>
            </Link>

            {/* Nav links */}
            <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
              <Link
                to="/marketplace"
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  isActive('/marketplace')
                    ? 'bg-stone-800 text-white'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                Marketplace
              </Link>

              {isFarmer ? (
                <>
                  <Link
                    to="/farmer"
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      isActive('/farmer')
                        ? 'bg-stone-800 text-white'
                        : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                    }`}
                  >
                    Farmer dashboard
                  </Link>
                  <Link
                    to="/farmer/listings"
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      isActive('/farmer/listings')
                        ? 'bg-stone-800 text-white'
                        : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                    }`}
                  >
                    My listings
                  </Link>
                  <Link
                    to="/farmer/add-produce"
                    className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs"
                  >
                    <span>+</span> Add produce
                  </Link>
                </>
              ) : (
                <Link
                  to="/farmer"
                  className="px-3 py-1.5 rounded-md text-stone-400 hover:text-stone-200 text-xs"
                >
                  (Switch to farmer view)
                </Link>
              )}
            </nav>
          </div>

          {/* Profile Switcher dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-left transition-colors cursor-pointer"
            >
              <div className={`w-2.5 h-2.5 rounded-full ${isFarmer ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <div className="text-left">
                <div className="text-xs font-semibold text-white flex items-center gap-1">
                  <span>{currentProfile.fullName}</span>
                  <span className="text-[10px] uppercase font-normal px-1 rounded bg-stone-700 text-stone-300">
                    {currentProfile.role}
                  </span>
                </div>
                <div className="text-[10px] text-stone-400">{currentProfile.location}</div>
              </div>
              <svg className="w-4 h-4 text-stone-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {profileDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-stone-200 py-2 z-50 text-stone-900"
                onMouseLeave={() => setProfileDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-stone-100 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Select demo profile
                </div>
                <div className="py-1">
                  {allProfiles.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        switchProfile(p.id);
                        setProfileDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-start gap-2 hover:bg-stone-50 transition-colors ${
                        p.id === currentProfile.id ? 'bg-emerald-50 text-emerald-950 font-medium' : ''
                      }`}
                    >
                      <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${p.role === 'farmer' ? 'bg-emerald-600' : 'bg-amber-600'}`} />
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
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-medium block py-1"
                  >
                    View role details & switcher →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile secondary nav */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-stone-800 text-xs">
          <div className="flex gap-3">
            <Link to="/marketplace" className="text-stone-300 hover:text-white py-1">
              Marketplace
            </Link>
            {isFarmer && (
              <>
                <Link to="/farmer" className="text-stone-300 hover:text-white py-1">
                  Dashboard
                </Link>
                <Link to="/farmer/listings" className="text-stone-300 hover:text-white py-1">
                  My listings
                </Link>
              </>
            )}
          </div>
          {isFarmer && (
            <Link
              to="/farmer/add-produce"
              className="px-2 py-1 rounded bg-emerald-700 text-white font-medium"
            >
              + Add produce
            </Link>
          )}
        </div>
      </div>

      {/* Reset confirmation modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-stone-900 shadow-xl">
            <h4 className="text-base font-bold text-stone-900">Reset prototype data?</h4>
            <p className="text-xs text-stone-600 mt-2">
              This will restore the original demo listings, buyer offers, and reset back to farmer Murugan Raman.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetDemoData();
                  setResetConfirmOpen(false);
                }}
                className="px-3 py-1.5 text-xs font-medium bg-emerald-800 hover:bg-emerald-900 text-white rounded-md"
              >
                Reset data
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
