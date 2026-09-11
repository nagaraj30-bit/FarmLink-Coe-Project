import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDemoUser } from '../../hooks/useDemoUser';

export const MobileTopBar: React.FC = () => {
  const { currentProfile, allProfiles, switchProfile, resetDemoData, isFarmer } = useDemoUser();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  return (
    <header className="md:hidden sticky top-0 z-30 bg-stone-900 border-b border-stone-800 px-4 py-2 text-stone-100">
      <div className="flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-emerald-500 rounded outline-hidden">
          <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-sm">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight text-white leading-none">
              FarmLink
            </div>
            <div className="text-[9px] text-stone-400 leading-tight">
              Prototype mode
            </div>
          </div>
        </Link>

        {/* Profile button */}
        <div className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-800 border border-stone-700 text-left text-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 outline-hidden"
          >
            <span
              className={`w-2 h-2 rounded-full ${isFarmer ? 'bg-emerald-400' : 'bg-amber-400'}`}
              aria-hidden="true"
            />
            <span className="font-semibold text-white max-w-[110px] truncate text-[11px]">
              {currentProfile.fullName.split(' ')[0]}
            </span>
            <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-stone-700 text-stone-300">
              {currentProfile.role}
            </span>
            <svg className="w-3 h-3 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {profileDropdownOpen && (
            <div
              className="absolute right-0 top-10 w-64 bg-white rounded-lg shadow-xl border border-stone-200 py-2 z-50 text-stone-900"
              onMouseLeave={() => setProfileDropdownOpen(false)}
            >
              <div className="px-3 py-1.5 border-b border-stone-100 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
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
                    className={`w-full text-left px-3 py-2 text-xs flex items-start gap-2 hover:bg-stone-50 transition-colors cursor-pointer ${
                      p.id === currentProfile.id ? 'bg-emerald-50 text-emerald-950 font-medium' : ''
                    }`}
                  >
                    <span
                      className={`mt-1 w-2 h-2 rounded-full shrink-0 ${p.role === 'farmer' ? 'bg-emerald-600' : 'bg-amber-600'}`}
                      aria-hidden="true"
                    />
                    <div>
                      <div className="font-medium text-stone-900 flex items-center gap-1.5 text-xs">
                        {p.fullName}
                        <span className="text-[10px] font-normal px-1 rounded bg-stone-100 text-stone-600">
                          {p.role}
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-500">{p.location}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="border-t border-stone-100 pt-1.5 px-3 flex items-center justify-between text-xs">
                <Link
                  to="/roles"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="text-emerald-800 font-semibold py-1"
                >
                  All profiles →
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    setResetModalOpen(true);
                  }}
                  className="text-stone-500 underline py-1"
                >
                  Reset data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reset confirmation modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-5 max-w-xs w-full text-stone-900 shadow-xl" role="dialog" aria-modal="true">
            <h4 className="text-sm font-bold text-stone-900">Reset prototype data?</h4>
            <p className="text-xs text-stone-600 mt-1">
              Restores initial seed listings and offers.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="px-3 py-1.5 text-xs text-stone-700 rounded hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetDemoData();
                  setResetModalOpen(false);
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-800 text-white rounded hover:bg-emerald-900"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
