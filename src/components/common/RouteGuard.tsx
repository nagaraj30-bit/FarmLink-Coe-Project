import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useDemoUser } from '../../hooks/useDemoUser';
import { UserRole } from '../../types';
import {
  ShieldAlert,
  LogIn,
  Users,
  ArrowLeft,
  Sprout,
  ShoppingBag,
  LayoutDashboard,
  Loader2,
} from 'lucide-react';

interface RouteGuardProps {
  requiredRole?: UserRole | 'authenticated';
  children: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ requiredRole, children }) => {
  const { language, t } = useLanguage();
  const { currentUser, isGuest, isLoading, switchUser } = useDemoUser();
  const navigate = useNavigate();

  // 0. Session verification in-flight: show spinner, do not flash guest or reject prematurely
  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">
          {language === 'ta' ? 'அங்கீகாரம் சரிபார்க்கப்படுகிறது...' : 'Verifying authorized session...'}
        </p>
      </div>
    );
  }

  // 1. Guest checking: guests must sign in or choose a demo persona
  if (isGuest || !currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {t('guard.guestTitle', 'Authentication Required')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {t(
                'guard.guestDesc',
                'Guests must sign in or select a demo persona before accessing this workspace.'
              )}
            </p>
          </div>

          {/* Action options */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>{t('auth.signIn', 'Sign In')}</span>
            </Link>

            <Link
              to="/roles"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>{t('guard.switchPersona', 'Switch Demo Persona')}</span>
            </Link>
          </div>

          {/* Quick 1-click persona activation based on required role */}
          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
            <span className="block mb-2 font-medium">
              {language === 'ta' ? 'அல்லது விரைவான டெமோ பாத்திரத்தைத் தேர்ந்தெடுக்கவும்:' : 'Or immediately activate a demo persona:'}
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {requiredRole !== 'buyer' && (
                <button
                  type="button"
                  onClick={() => switchUser('farmer-1')}
                  className="px-3.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold text-xs hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  🌾 {t('guard.quickFarmer', 'Continue as Demo Farmer (Murugan)')}
                </button>
              )}
              {requiredRole !== 'buyer' && (
                <button
                  type="button"
                  onClick={() => switchUser('fpo-1')}
                  className="px-3.5 py-1.5 rounded-lg border border-teal-300 bg-teal-50 text-teal-800 font-semibold text-xs hover:bg-teal-100 transition-colors cursor-pointer"
                >
                  🚜 {language === 'ta' ? 'FPO குழுவாக தொடரவும் (குமார்)' : 'Continue as Demo FPO (Kumar)'}
                </button>
              )}
              {requiredRole !== 'farmer' && (
                <button
                  type="button"
                  onClick={() => switchUser('buyer-1')}
                  className="px-3.5 py-1.5 rounded-lg border border-blue-300 bg-blue-50 text-blue-800 font-semibold text-xs hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  🏢 {t('guard.quickBuyer', 'Continue as Demo Buyer (Priya Wholesale)')}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('action.back', 'Go Back')}</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. Role mismatch: route requires farmer, but user is buyer
  if (requiredRole === 'farmer' && currentUser.role !== 'farmer') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
            <Sprout className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {t('guard.farmerOnlyTitle', 'Farmer Workspace Only')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {t(
                'guard.farmerOnlyDesc',
                'This section is reserved for farmers managing produce listings and evaluating net-return bids.'
              )}
            </p>
            <div className="text-xs font-medium text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              {language === 'ta'
                ? `நீங்கள் தற்போது "${currentUser.nameTa || currentUser.name}" (வாங்குபவர்) பாத்திரத்தில் உள்ளீர்கள்.`
                : `You are currently signed in as "${currentUser.name}" (Produce Buyer).`}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/roles"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>{language === 'ta' ? 'விவசாயி பாத்திரத்திற்கு மாறுக' : 'Switch to Farmer Persona'}</span>
            </Link>

            <Link
              to="/marketplace"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t('notFound.marketplace', 'Go to Marketplace')}</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => switchUser('farmer-1')}
              className="px-4 py-2 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold text-xs hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              🌾 {t('guard.quickFarmer', 'Continue as Demo Farmer (Murugan)')}
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('action.back', 'Go Back')}</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Role mismatch: route requires buyer, but user is farmer
  if (requiredRole === 'buyer' && currentUser.role !== 'buyer') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto shadow-inner">
            <ShoppingBag className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {t('guard.buyerOnlyTitle', 'Buyer Workspace Only')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {t(
                'guard.buyerOnlyDesc',
                'This section is reserved for wholesale produce buyers submitting and managing purchase offers.'
              )}
            </p>
            <div className="text-xs font-medium text-blue-900 bg-blue-50 p-2.5 rounded-xl border border-blue-200">
              {language === 'ta'
                ? `நீங்கள் தற்போது "${currentUser.nameTa || currentUser.name}" (விவசாயி) பாத்திரத்தில் உள்ளீர்கள்.`
                : `You are currently signed in as "${currentUser.name}" (Farmer).`}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/roles"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>{language === 'ta' ? 'வாங்குபவர் பாத்திரத்திற்கு மாறுக' : 'Switch to Buyer Persona'}</span>
            </Link>

            <Link
              to="/farmer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t('notFound.dashboard', 'Return to Farmer Dashboard')}</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => switchUser('buyer-1')}
              className="px-4 py-2 rounded-lg border border-blue-300 bg-blue-50 text-blue-800 font-semibold text-xs hover:bg-blue-100 transition-colors cursor-pointer"
            >
              🏢 {t('guard.quickBuyer', 'Continue as Demo Buyer (Priya Wholesale)')}
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('action.back', 'Go Back')}</span>
          </button>
        </div>
      </div>
    );
  }

  // Access permitted
  return <>{children}</>;
};
