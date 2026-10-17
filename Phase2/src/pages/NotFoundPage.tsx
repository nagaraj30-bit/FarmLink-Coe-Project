import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useDemoUser } from '../hooks/useDemoUser';
import { DisclaimerNotice } from '../components/common/DisclaimerNotice';
import {
  Sprout,
  Compass,
  ArrowLeft,
  Home,
  ShoppingBag,
  LayoutDashboard,
  LogIn,
  Search,
} from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { currentUser, isFarmer, isBuyer, isGuest } = useDemoUser();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-10">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center space-y-6">
        {/* Visual Icon Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-24 h-24 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-inner">
            <Compass className="w-12 h-12 stroke-[1.5] animate-pulse" />
          </div>
          <span className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-mono font-black text-xs shadow-xs">
            404
          </span>
        </div>

        {/* Heading & Explanation */}
        <div className="space-y-2 max-w-md mx-auto">
          <div className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-700">
            {language === 'ta' ? 'பக்கம் கண்டறியப்படவில்லை' : 'HTTP 404 — Page Not Found'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('notFound.title', 'Page Not Found')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {t(
              'notFound.subtitle',
              "The page you are looking for doesn't exist, has been removed, or the link may be broken."
            )}
          </p>
        </div>

        {/* Helpful Navigation Links Grid */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-left">
          {/* Home */}
          <Link
            to="/"
            className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/40 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-emerald-100 text-slate-700 group-hover:text-emerald-800 flex items-center justify-center shrink-0 transition-colors">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                {t('notFound.home', 'Home')}
              </div>
              <div className="text-[10px] text-slate-400">
                {language === 'ta' ? 'முகப்பு பக்கம்' : 'Overview & welcome'}
              </div>
            </div>
          </Link>

          {/* Marketplace */}
          <Link
            to="/marketplace"
            className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/40 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-emerald-100 text-slate-700 group-hover:text-emerald-800 flex items-center justify-center shrink-0 transition-colors">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                {t('notFound.marketplace', 'Marketplace')}
              </div>
              <div className="text-[10px] text-slate-400">
                {language === 'ta' ? 'விளைபொருட்கள் பட்டியல்' : 'Browse active lots'}
              </div>
            </div>
          </Link>

          {/* Role-specific link */}
          {isFarmer ? (
            <Link
              to="/farmer"
              className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/40 transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-emerald-100 text-slate-700 group-hover:text-emerald-800 flex items-center justify-center shrink-0 transition-colors">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                  {t('notFound.dashboard', 'Farmer Dashboard')}
                </div>
                <div className="text-[10px] text-slate-400">
                  {language === 'ta' ? 'மேலாண்மை பலகை' : 'Catalogue & bids'}
                </div>
              </div>
            </Link>
          ) : isBuyer ? (
            <Link
              to="/buyer/my-offers"
              className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/40 transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-emerald-100 text-slate-700 group-hover:text-emerald-800 flex items-center justify-center shrink-0 transition-colors">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                  {language === 'ta' ? 'எனது சலுகைகள்' : 'My Offers'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {language === 'ta' ? 'சமர்ப்பித்தவை' : 'Track bids'}
                </div>
              </div>
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/40 transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-emerald-100 text-slate-700 group-hover:text-emerald-800 flex items-center justify-center shrink-0 transition-colors">
                <LogIn className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                  {t('auth.signIn', 'Sign In')}
                </div>
                <div className="text-[10px] text-slate-400">
                  {language === 'ta' ? 'டெமோ கணக்கு' : 'Or demo persona'}
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Action: Go Back */}
        <div className="pt-2">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('action.back', 'Go back to previous page')}</span>
          </button>
        </div>
      </div>

      <DisclaimerNotice />
    </div>
  );
};
