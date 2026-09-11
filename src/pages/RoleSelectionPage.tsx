import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemoUser } from '../hooks/useDemoUser';

export const RoleSelectionPage: React.FC = () => {
  const { currentProfile, allProfiles, switchProfile, resetDemoData } = useDemoUser();
  const navigate = useNavigate();

  const farmerProfiles = allProfiles.filter(p => p.role === 'farmer');
  const buyerProfiles = allProfiles.filter(p => p.role === 'buyer');

  const handleSelect = (profileId: string, role: 'farmer' | 'buyer') => {
    switchProfile(profileId);
    if (role === 'farmer') {
      navigate('/farmer');
    } else {
      navigate('/marketplace');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="text-center space-y-2">
        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
          Prototype Mode
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
          Select a demo profile
        </h1>
        <p className="text-sm text-stone-600 max-w-xl mx-auto">
          Phase 1 does not implement real passwords. Switch profiles below to view the application through the eyes of different farmers or buyers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Farmer Profiles */}
        <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <span className="w-3 h-3 rounded-full bg-emerald-600" />
            <h2 className="text-lg font-bold text-stone-900">Farmer profiles</h2>
          </div>
          <p className="text-xs text-stone-500">
            Farmers can create produce listings, view their own active crops, and compare buyer offers side-by-side using estimated net take-home returns.
          </p>

          <div className="space-y-3 pt-2">
            {farmerProfiles.map(p => {
              const isSelected = p.id === currentProfile.id;
              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-emerald-700 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-700'
                      : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-stone-900 flex items-center gap-2">
                        {p.fullName}
                        {isSelected && (
                          <span className="text-[10px] font-bold bg-emerald-800 text-white px-1.5 py-0.2 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-600 mt-0.5">{p.location}</div>
                      <div className="text-[11px] text-stone-400 mt-1">
                        {p.id === 'farmer-1'
                          ? 'Has: 3 listings (Tomatoes, Shallots, Drumsticks) with pending offers.'
                          : 'Has: 2 listings (Robusta Bananas, Coconuts).'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSelect(p.id, 'farmer')}
                      className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-800 text-white hover:bg-emerald-900'
                          : 'bg-stone-100 text-stone-800 hover:bg-stone-200'
                      }`}
                    >
                      {isSelected ? 'Continue to dashboard' : 'Switch to this farmer'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Buyer Profiles */}
        <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <span className="w-3 h-3 rounded-full bg-amber-600" />
            <h2 className="text-lg font-bold text-stone-900">Buyer profiles</h2>
          </div>
          <p className="text-xs text-stone-500">
            Buyers browse the marketplace, filter by stated selling deadline, and submit offers with transparent cost estimates.
          </p>

          <div className="space-y-3 pt-2">
            {buyerProfiles.map(p => {
              const isSelected = p.id === currentProfile.id;
              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-amber-700 bg-amber-50/50 shadow-xs ring-1 ring-amber-700'
                      : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-stone-900 flex items-center gap-2">
                        {p.fullName}
                        {isSelected && (
                          <span className="text-[10px] font-bold bg-amber-800 text-white px-1.5 py-0.2 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-600 mt-0.5">{p.location}</div>
                      <div className="text-[11px] text-stone-400 mt-1">
                        {p.id === 'buyer-1'
                          ? 'Submits farmgate pickup offers with low transport costs.'
                          : 'Submits city hub delivery offers with higher packaging requirements.'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSelect(p.id, 'buyer')}
                      className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer ${
                        isSelected
                          ? 'bg-amber-800 text-white hover:bg-amber-900'
                          : 'bg-stone-100 text-stone-800 hover:bg-stone-200'
                      }`}
                    >
                      {isSelected ? 'Continue to marketplace' : 'Switch to this buyer'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reset Testing Card */}
      <div className="bg-stone-100 rounded-xl p-5 border border-stone-200 text-center max-w-md mx-auto">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">Need to reset demo state?</h3>
        <p className="text-xs text-stone-500 mt-1">
          Restores original seed listings, offers, and recalculations.
        </p>
        <button
          type="button"
          onClick={resetDemoData}
          className="mt-3 px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded transition-colors cursor-pointer"
        >
          Reset all demo data
        </button>
      </div>
    </div>
  );
};
