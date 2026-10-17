import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemoUser } from '../hooks/useDemoUser';
import { useLanguage } from '../context/LanguageContext';
import { UserCheck, ArrowRight, ShieldCheck, MapPin, Phone, Building, RotateCcw, Check } from 'lucide-react';
import { resetDemoData } from '../data/dataAccess';

export const RoleSelectionPage: React.FC = () => {
  const { allProfiles, currentUser, switchUser } = useDemoUser();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const handleSelect = (userId: string, role: string) => {
    switchUser(userId);
    if (role === 'farmer') {
      navigate('/farmer');
    } else {
      navigate('/marketplace');
    }
  };

  const farmers = allProfiles.filter((p) => p.role === 'farmer');
  const buyers = allProfiles.filter((p) => p.role === 'buyer');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
          <UserCheck className="w-3.5 h-3.5" />
          <span>{language === 'ta' ? 'டெமோ பயனர் தேர்வு' : 'Interactive Demo Persona Switcher'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {language === 'ta' ? 'உங்கள் பயனர் பாத்திரத்தைத் தேர்ந்தெடுக்கவும்' : 'Select Your Role & Persona'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          {language === 'ta'
            ? 'விவசாயி அல்லது கொள்முதல் வியாபாரியாக பார்ம்லிங்கை சோதிக்க கீழே உள்ள ஒருவரைத் தேர்ந்தெடுக்கவும்.'
            : 'Switch roles to test the separate farmer dashboard and buyer marketplace workflows.'}
        </p>
      </div>

      {/* Farmers Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
          <span className="text-xl">👨‍🌾</span>
          <h2 className="text-lg font-bold text-slate-900">
            {language === 'ta' ? 'விவசாயி பயனர்கள் (Farmer Profiles)' : 'Farmer Profiles'}
          </h2>
          <span className="text-xs text-slate-500">
            — {language === 'ta' ? 'விளைபொருள் சேர்க்க, வாய்ப்புகளை ஒப்பிட' : 'Add listings & compare net-return offers'}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {farmers.map((profile) => {
            const isActive = currentUser?.id === profile.id;
            return (
              <div
                key={profile.id}
                className={`rounded-2xl p-5 border transition-all ${
                  isActive
                    ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-300 shadow-md'
                    : 'bg-white border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{profile.avatar}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900">
                          {language === 'ta' ? profile.nameTa : profile.name}
                        </h3>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                            {language === 'ta' ? 'தற்போது செயலில்' : 'Active'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-emerald-800 font-medium flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{language === 'ta' ? profile.locationTa : profile.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{profile.phone}</span>
                  </span>
                  {profile.fpoMember && (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                      {language === 'ta' ? 'FPO உறுப்பினர்' : 'FPO Member'}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleSelect(profile.id, 'farmer')}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-2xs transition-colors"
                >
                  <span>{language === 'ta' ? 'விவசாயி டாஷ்போர்டு திறக்கவும்' : 'Launch Farmer Dashboard'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Buyers Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
          <span className="text-xl">🏢</span>
          <h2 className="text-lg font-bold text-slate-900">
            {language === 'ta' ? 'கொள்முதல் வியாபாரிகள் (Produce Buyers)' : 'Produce Buyers'}
          </h2>
          <span className="text-xs text-slate-500">
            — {language === 'ta' ? 'விளைபொருட்களை உலாவ, விலை வாய்ப்பு சமர்ப்பிக்க' : 'Browse listings & submit structured offers'}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {buyers.map((profile) => {
            const isActive = currentUser?.id === profile.id;
            return (
              <div
                key={profile.id}
                className={`rounded-2xl p-5 border transition-all ${
                  isActive
                    ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-300 shadow-md'
                    : 'bg-white border-slate-200 hover:border-blue-300 shadow-2xs hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{profile.avatar}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900">
                          {language === 'ta' ? profile.nameTa : profile.name}
                        </h3>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white">
                            {language === 'ta' ? 'தற்போது செயலில்' : 'Active'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-blue-800 font-medium flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3" />
                        <span>{language === 'ta' ? profile.businessTypeTa : profile.businessType}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{language === 'ta' ? profile.locationTa : profile.location}</span>
                  </span>
                  <span className="text-slate-500">{profile.phone}</span>
                </div>

                <button
                  onClick={() => handleSelect(profile.id, 'buyer')}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-2xs transition-colors"
                >
                  <span>{language === 'ta' ? 'கொள்முதல் சந்தைக்கு செல்ல' : 'Enter Buyer Marketplace'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Demo Reset Utility */}
      <div className="pt-6 border-t border-slate-200 text-center">
        <button
          type="button"
          onClick={() => {
            resetDemoData();
            window.location.reload();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-xs transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{language === 'ta' ? 'டெமோ தரவை மீட்டமைக்கவும் (தொடக்க நிலைக்கு)' : 'Reset Demo Data to Initial Seeds'}</span>
        </button>
      </div>
    </div>
  );
};
