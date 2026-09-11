import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDemoUser } from '../../hooks/useDemoUser';
import { Breadcrumbs } from './Breadcrumbs';

export const TopBar: React.FC = () => {
  const { currentProfile, allProfiles, switchProfile, resetDemoData, isFarmer } = useDemoUser();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Dynamic Breadcrumb navigation */}
        <div className="flex items-center gap-3 truncate">
          <Breadcrumbs />
        </div>

        {/* Right: Actions and Profile Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Prototype mode tag */}
          <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
            Prototype Mode
          </span>

          {/* Quick reset action */}
          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="hidden sm:inline-block text-xs text-stone-600 hover:text-stone-900 underline focus-visible:ring-2 focus-visible:ring-emerald-700 outline-hidden rounded px-1 py-0.5"
            title="Restore initial seed mock data"
          >
            Reset data
          </button>

          {/* Profile Switcher dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              aria-haspopup="true"
              aria-expanded={profileDropdownOpen}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200/80 border border-stone-300 text-left transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-700 outline-hidden"
            >
              <span
                className={`w-2 h-2 rounded-full ${isFarmer ? 'bg-emerald-600' : 'bg-amber-600'}`}
                aria-hidden="true"
              />
              <span className="text-xs font-semibold text-stone-900 max-w-[140px] truncate">
                {currentProfile.fullName}
              </span>
              <span className="text-[10px] uppercase px-1 py-0.2 rounded bg-stone-200 text-stone-700 font-medium">
                {currentProfile.role}
              </span>
              <svg className="w-3.5 h-3.5 text-stone-500 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {profileDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-stone-200 py-2 z-50 text-stone-900"
                onMouseLeave={() => setProfileDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-stone-100 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  Select demo profile
                </div>
                <div className="py-1">
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
                <div className="border-t border-stone-100 pt-1.5 px-3 flex items-center justify-between">
                  <Link
                    to="/roles"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="text-xs text-emerald-800 hover:text-emerald-900 font-semibold py-1 focus-visible:ring-2 focus-visible:ring-emerald-700 outline-hidden"
                  >
                    View profile list →
                  </Link>
                  <Link
                    to="/roles"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="text-xs text-stone-500 hover:text-stone-800 py-1 focus-visible:ring-2 focus-visible:ring-emerald-700 outline-hidden"
                  >
                    Exit demo
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reset confirmation modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-stone-900 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="topbar-reset-title">
            <h4 id="topbar-reset-title" className="text-base font-bold text-stone-900">Reset prototype data?</h4>
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
    </header>
  );
};
