import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useDemoUser } from '../hooks/useDemoUser';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../lib/supabase';
import { UserRole } from '../types';
import {
  LogIn,
  Phone,
  KeyRound,
  Mail,
  Lock,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Sprout,
  Store,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  Database,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { allProfiles, login } = useDemoUser();
  const { signIn } = useAuth();
  const navigate = useNavigate();

  // Mode: Real Supabase Auth or Demo Persona Mode
  const [authMode, setAuthMode] = useState<'real' | 'demo'>(isSupabaseConfigured ? 'real' : 'demo');

  // Real auth states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Demo auth states
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoCodeNotice, setDemoCodeNotice] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  // Filter seeded profiles by role for quick access
  const relevantProfiles = allProfiles.filter((p) => p.role === selectedRole);

  const handleRealSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError(language === 'ta' ? 'மின்னஞ்சல் மற்றும் கடவுச்சொல் தேவை.' : 'Email and password are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: signInError } = await signIn(email.trim(), password);
      if (signInError) {
        setError(signInError.message || (language === 'ta' ? 'உள்நுழைவு தோல்வியடைந்தது.' : 'Sign in failed. Check your credentials.'));
        setIsSubmitting(false);
        return;
      }
      navigate('/marketplace');
    } catch (err: any) {
      setError(err?.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError(
        language === 'ta'
          ? 'தயவுசெய்து சரியான 10-இலக்க கைபேசி எண்ணை உள்ளிடவும்.'
          : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    setOtpSent(true);
    setDemoCodeNotice('123456');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp.trim() || otp.length < 4) {
      setError(
        language === 'ta'
          ? 'தயவுசெய்து டெமோ OTP குறியீட்டை உள்ளிடவும் (உதா: 123456).'
          : 'Please enter the 6-digit demo OTP (e.g. 123456).'
      );
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const matched = allProfiles.find(
      (p) => p.role === selectedRole && p.phone.replace(/\D/g, '').includes(cleanPhone)
    );

    const targetProfile = matched || relevantProfiles[0] || allProfiles[0];
    login(targetProfile.id);

    if (targetProfile.role === 'farmer') {
      navigate('/farmer');
    } else {
      navigate('/marketplace');
    }
  };

  const handleQuickLogin = (profileId: string, role: UserRole) => {
    login(profileId);
    if (role === 'farmer') {
      navigate('/farmer');
    } else {
      navigate('/marketplace');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
          <LogIn className="w-3.5 h-3.5" />
          <span>{t('auth.signIn', 'Sign In')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t('auth.loginTitle', 'Sign In to FarmLink')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          {t('auth.loginSubtitle', 'Choose your role and sign in to access your customized dashboard or marketplace.')}
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        {/* Left: Login Form (7 cols) */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
          {/* Mode Switcher: Real Account vs Demo Mode */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>{language === 'ta' ? 'உள்நுழைவு முறை' : 'Authentication Method'}</span>
              {isSupabaseConfigured && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                  <Database className="w-3 h-3" />
                  <span>{language === 'ta' ? 'கிளவுட் இணைக்கப்பட்டுள்ளது' : 'Supabase Connected'}</span>
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('real');
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  authMode === 'real'
                    ? 'bg-white text-emerald-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-emerald-700" />
                <span>{language === 'ta' ? 'உண்மையான கணக்கு' : 'Supabase Email'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('demo');
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  authMode === 'demo'
                    ? 'bg-white text-emerald-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Phone className="w-3.5 h-3.5 text-amber-700" />
                <span>{language === 'ta' ? 'டெமோ OTP பயன்முறை' : 'Demo Phone OTP'}</span>
              </button>
            </div>
          </div>

          {/* REAL SUPABASE EMAIL/PASSWORD FORM */}
          {authMode === 'real' ? (
            <form onSubmit={handleRealSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email Address'} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="farmer@farmlink.org"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'ta' ? 'கடவுச்சொல்' : 'Password'} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-xs sm:text-sm shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{language === 'ta' ? 'சரிபார்க்கிறது...' : 'Signing In...'}</span>
                  </>
                ) : (
                  <>
                    <span>{language === 'ta' ? 'உள்நுழைக' : 'Sign In with Supabase'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* DEMO PHONE & OTP FORM */
            <div className="space-y-4">
              {/* Role selector tab for demo */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {t('auth.selectRole', 'Select Role')}
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('farmer');
                      setOtpSent(false);
                      setDemoCodeNotice(null);
                      setError(null);
                    }}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      selectedRole === 'farmer'
                        ? 'bg-white text-emerald-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sprout className="w-4 h-4 text-emerald-600" />
                    <span>{t('auth.farmerRole', 'Farmer')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('buyer');
                      setOtpSent(false);
                      setDemoCodeNotice(null);
                      setError(null);
                    }}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      selectedRole === 'buyer'
                        ? 'bg-white text-emerald-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Store className="w-4 h-4 text-blue-600" />
                    <span>{t('auth.buyerRole', 'Produce Buyer')}</span>
                  </button>
                </div>
              </div>

              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('auth.mobileNumber', 'Mobile Number')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 94431 22890"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {language === 'ta'
                        ? 'டெமோ சோதனைக்கு ஏதேனும் 10 இலக்க எண்ணை உள்ளிடலாம்.'
                        : 'Enter any 10-digit number for demonstration.'}
                    </span>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{t('auth.sendOtp', 'Get Demo OTP')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">
                        {language === 'ta' ? 'டெமோ OTP குறியீடு உருவாக்கப்பட்டது:' : 'Simulated Demo OTP Generated:'}
                      </div>
                      <div className="text-emerald-700 text-sm font-mono font-black mt-0.5 tracking-widest">
                        {demoCodeNotice}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('auth.otpCode', 'OTP Code')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono font-bold tracking-widest"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="py-2.5 px-3 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                    >
                      {t('action.back', 'Back')}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{t('auth.verifySignIn', 'Verify & Sign In')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Academic Non-misleading Notice */}
          <div className="pt-2 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {t('auth.demoNotice', 'Frontend Demonstration & Evaluation: Live Supabase email sign-in or instant demo personas supported.')}
            </p>
          </div>

          {/* Switch to Register link */}
          <div className="pt-2 text-center text-xs text-slate-600">
            <span>{t('auth.noAccount', "Don't have an account?")} </span>
            <Link
              to="/register"
              className="font-bold text-emerald-800 hover:text-emerald-950 underline decoration-emerald-400"
            >
              {t('auth.register', 'Register as New Farmer / Buyer')}
            </Link>
          </div>
        </div>

        {/* Right: Quick Demo Persona Selector (5 cols) */}
        <div className="md:col-span-5 bg-emerald-900/95 text-white rounded-2xl p-6 shadow-md space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('auth.quickDemoHeader', 'Instant Demo Profile Access')}</span>
            </div>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              {t('auth.quickDemoSub', 'Select a pre-configured verified persona to test the platform instantly:')}
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            {allProfiles.map((p) => {
              const isCurrentRole = p.role === selectedRole;
              return (
                <button
                  key={p.id}
                  onClick={() => handleQuickLogin(p.id, p.role)}
                  className={`w-full text-left p-3 rounded-xl transition-all border flex items-center justify-between gap-3 cursor-pointer ${
                    isCurrentRole
                      ? 'bg-emerald-800/90 border-emerald-400/80 hover:bg-emerald-700 shadow-xs'
                      : 'bg-emerald-950/60 border-emerald-800/60 opacity-80 hover:opacity-100 hover:bg-emerald-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{p.avatar}</span>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{language === 'ta' ? p.nameTa : p.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 capitalize">
                          {p.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-200 mt-0.5">
                        {language === 'ta' ? p.locationTa : p.location}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-300 shrink-0" />
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-emerald-800/60 text-center">
            <Link
              to="/roles"
              className="text-xs font-semibold text-emerald-300 hover:text-white underline"
            >
              {language === 'ta' ? 'அனைத்து பாத்திரங்களையும் ஆராய்க' : 'View Full Role Selection Overview'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
