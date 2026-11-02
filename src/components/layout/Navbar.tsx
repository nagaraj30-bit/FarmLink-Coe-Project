import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useDemoUser } from '../../hooks/useDemoUser';
import { resetDemoData } from '../../data/dataAccess';
import {
  Sprout,
  RotateCcw,
  User,
  UserCheck,
  Menu,
  X,
  PlusCircle,
  Store,
  LayoutDashboard,
  ListOrdered,
  LogIn,
  UserPlus,
  LogOut,
  MapPin,
  Phone,
  Shield,
  ChevronDown,
  ShoppingBag,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { currentUser, isFarmer, isBuyer, isGuest, logout } = useDemoUser();
  const location = useLocation();
  const navigate = useNavigate();

  const [resetMessage, setResetMessage] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleReset = () => {
    resetDemoData();
    setResetMessage(true);
    setTimeout(() => {
      setResetMessage(false);
      window.location.reload();
    }, 800);
  };

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    {
      to: '/farmer',
      label: t('nav.farmerDashboard', 'Farmer Dashboard'),
      icon: <LayoutDashboard className="w-4 h-4" />,
      visible: isFarmer,
    },
    {
      to: '/my-listings',
      label: language === 'ta' ? 'எனது விளைபொருட்கள்' : 'My Listings',
      icon: <ListOrdered className="w-4 h-4" />,
      visible: isFarmer,
    },
    {
      to: '/marketplace',
      label: t('nav.marketplace', 'Buyer Marketplace'),
      icon: <Store className="w-4 h-4" />,
      visible: true,
    },
    {
      to: '/buyer/my-offers',
      label: language === 'ta' ? 'எனது சலுகைகள்' : 'My Offers',
      icon: <ShoppingBag className="w-4 h-4" />,
      visible: isBuyer,
    },
    {
      to: '/add-produce',
      label: t('nav.addProduce', 'Add Produce'),
      icon: <PlusCircle className="w-4 h-4" />,
      visible: isFarmer,
    },
    {
      to: '/roles',
      label: language === 'ta' ? 'டெமோ பாத்திரங்கள்' : 'Demo Personas',
      icon: <UserCheck className="w-4 h-4" />,
      visible: isGuest,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-2xs">
      {/* Prototype context banner */}
      <div className="bg-emerald-950 text-emerald-200 text-xs px-4 py-1.5 flex items-center justify-between font-mono">
        <div className="flex items-center gap-2 truncate">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-white">FarmLink CoE Evaluation Prototype</span>
          <span className="hidden sm:inline text-emerald-300/80">| Decision-Support for Agricultural Sales</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-[11px] bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 px-2 py-0.5 rounded border border-emerald-600 transition-colors cursor-pointer"
            title="Reset data back to initial seed state"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden xs:inline">{t('nav.resetData', 'Reset Demo')}</span>
          </button>
        </div>
      </div>

      {resetMessage && (
        <div className="bg-emerald-600 text-white text-xs py-1 text-center font-medium transition-all">
          {t('nav.resetSuccess', 'Demo data reset to initial state successfully!')}
        </div>
      )}

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-sm group-hover:bg-emerald-800 transition-colors">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-emerald-950 font-sans block leading-none">
                FarmLink
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 tracking-wide block mt-0.5">
                {language === 'ta' ? 'விவசாய முடிவெடுக்கும் தளம்' : 'Agricultural Decision Support'}
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            {navLinks.map(
              (link) =>
                link.visible && (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors ${
                      location.pathname === link.to
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
                        : 'text-slate-600 hover:text-emerald-900 hover:bg-slate-50'
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                )
            )}
          </nav>

          {/* Right controls: Language & Session */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language switch */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  language === 'en'
                    ? 'bg-white text-emerald-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ta')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  language === 'ta'
                    ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                தமிழ்
              </button>
            </div>

            {/* User Session Controls */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="inline-flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-full border border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/50 transition-colors text-xs cursor-pointer shadow-2xs"
                  title="View active profile and options"
                >
                  <span className="text-base">{currentUser.avatar}</span>
                  <div className="text-left">
                    <div className="font-bold text-slate-900 leading-tight">
                      {language === 'ta' ? currentUser.nameTa : currentUser.name}
                    </div>
                    <div className="text-[10px] text-emerald-700 capitalize">
                      {language === 'ta'
                        ? currentUser.role === 'farmer'
                          ? 'விவசாயி'
                          : 'கொள்முதல் வியாபாரி'
                        : currentUser.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                </button>

                {/* Profile dropdown popover */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 text-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{currentUser.avatar}</span>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {language === 'ta' ? currentUser.nameTa : currentUser.name}
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 capitalize">
                            {language === 'ta'
                              ? currentUser.role === 'farmer'
                                ? 'விவசாயி'
                                : 'கொள்முதல் வியாபாரி'
                              : currentUser.role}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setProfileDropdownOpen(false)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1.5 text-slate-600 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{language === 'ta' ? currentUser.locationTa : currentUser.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{currentUser.phone}</span>
                      </div>
                      {currentUser.fpoMember && (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                          <Shield className="w-3 h-3" />
                          <span>FPO Member (உழவர் உற்பத்தியாளர் குழு)</span>
                        </div>
                      )}
                      {currentUser.businessType && (
                        <div className="text-slate-700 font-medium">
                          {language === 'ta' ? currentUser.businessTypeTa : currentUser.businessType}
                        </div>
                      )}
                    </div>

                    <div className="pt-1 space-y-1.5">
                      {currentUser.role === 'farmer' && (
                        <Link
                          to="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors border border-emerald-200"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>{t('profile.manageProfile', 'Manage Profile')}</span>
                        </Link>
                      )}

                      {currentUser.role === 'buyer' && (
                        <Link
                          to="/buyer/my-offers"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors border border-emerald-200"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{language === 'ta' ? 'எனது கொள்முதல் சலுகைகள்' : 'My Submitted Offers'}</span>
                        </Link>
                      )}

                      <Link
                        to="/roles"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{language === 'ta' ? 'பயனர் பாத்திரம் மாற்று' : 'Switch Demo Persona'}</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t('auth.signOut', 'Sign Out')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Guest state controls */
              <div className="flex items-center gap-2 text-xs">
                <Link
                  to="/roles"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 hover:border-emerald-500 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold transition-colors shadow-2xs"
                  title="Select or switch interactive demo persona"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{language === 'ta' ? 'டெமோ பாத்திரங்கள்' : 'Demo Personas'}</span>
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 text-slate-700 font-semibold transition-colors shadow-2xs"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{t('auth.signIn', 'Sign In')}</span>
                </Link>

                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-colors shadow-2xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{t('auth.register', 'Register')}</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-700"
            >
              {language === 'en' ? 'தமிழ்' : 'EN'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-2">
          {navLinks.map(
            (link) =>
              link.visible && (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    location.pathname === link.to
                      ? 'bg-emerald-50 text-emerald-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              )
          )}

          <div className="pt-2 border-t border-slate-100 space-y-2">
            {currentUser ? (
              <>
                <div className="flex items-center justify-between text-xs text-slate-700 px-2 py-1">
                  <span>
                    {language === 'ta' ? 'செயலில் உள்ள பயனர்:' : 'Active User:'}{' '}
                    <strong>{language === 'ta' ? currentUser.nameTa : currentUser.name}</strong>
                  </span>
                  <span className="capitalize text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    {currentUser.role}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {currentUser.role === 'farmer' && (
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>{t('profile.manageProfile', 'Profile')}</span>
                    </Link>
                  )}
                  {currentUser.role === 'buyer' && (
                    <Link
                      to="/buyer/my-offers"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{language === 'ta' ? 'சலுகைகள்' : 'My Offers'}</span>
                    </Link>
                  )}
                  <Link
                    to="/roles"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{language === 'ta' ? 'பயனர் மாற்று' : 'Switch Role'}</span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('auth.signOut', 'Sign Out')}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-300 text-xs font-bold text-slate-800"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t('auth.signIn', 'Sign In')}</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-700 text-white text-xs font-bold"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{t('auth.register', 'Register')}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
