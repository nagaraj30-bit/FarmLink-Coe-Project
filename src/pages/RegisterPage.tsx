import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useDemoUser } from '../hooks/useDemoUser';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../lib/supabase';
import { UserRole } from '../types';
import {
  UserPlus,
  Sprout,
  Store,
  Phone,
  MapPin,
  Building,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  Users,
  Mail,
  Lock,
  Loader2,
  Database,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { registerUser } = useDemoUser();
  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Mode: Real Supabase Auth vs Local Prototype Registration
  const [authMode, setAuthMode] = useState<'real' | 'demo'>(isSupabaseConfigured ? 'real' : 'demo');

  const [role, setRole] = useState<UserRole>('farmer');

  // Real Auth Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Farmer specific fields
  const [fullName, setFullName] = useState('');
  const [district, setDistrict] = useState('Madurai');
  const [taluk, setTaluk] = useState('');
  const [phone, setPhone] = useState('');
  const [fpoMember, setFpoMember] = useState(false);

  // Buyer specific fields
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Wholesale Trader');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const newErrors: Record<string, string> = {};

    if (authMode === 'real') {
      if (!email.trim() || !email.includes('@')) {
        newErrors.email = language === 'ta' ? 'சரியான மின்னஞ்சல் தேவை.' : 'Valid email is required.';
      }
      if (!password.trim() || password.length < 6) {
        newErrors.password = language === 'ta' ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்.' : 'Password must be at least 6 characters.';
      }
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      newErrors.phone =
        language === 'ta'
          ? 'தயவுசெய்து சரியான 10-இலக்க கைபேசி எண்ணை உள்ளிடவும்.'
          : 'Please enter a valid 10-digit contact number.';
    }

    if (!district.trim()) {
      newErrors.district = language === 'ta' ? 'மாவட்டம் தேவை.' : 'District is required.';
    }

    if (role === 'farmer') {
      if (!fullName.trim()) {
        newErrors.fullName = language === 'ta' ? 'முழுப் பெயர் தேவை.' : 'Full name is required.';
      }
      if (!taluk.trim()) {
        newErrors.taluk = language === 'ta' ? 'வட்டம்/பகுதி தேவை.' : 'Local area/taluk is required.';
      }
    } else {
      if (!businessName.trim()) {
        newErrors.businessName =
          language === 'ta' ? 'நிறுவனத்தின் பெயர் தேவை.' : 'Business name is required.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // REAL SUPABASE SIGN UP
    if (authMode === 'real') {
      setIsSubmitting(true);
      try {
        const displayName = role === 'farmer' ? fullName.trim() : businessName.trim();
        const displayLocation = role === 'farmer' ? `${taluk.trim()}, ${district.trim()}` : `${district.trim()} Market Area`;

        const { error: signUpError } = await signUp(email.trim(), password, {
          role,
          name: displayName,
          nameTa: displayName,
          phone: `+91 ${cleanPhone.slice(-10)}`,
          district: district.trim(),
          districtTa: district.trim(),
          location: displayLocation,
          locationTa: displayLocation,
          avatar: role === 'farmer' ? '👨‍🌾' : '🏢',
          fpoMember: role === 'farmer' ? fpoMember : false,
          businessType: role === 'buyer' ? businessType : undefined,
          businessTypeTa: role === 'buyer' ? businessType : undefined,
        });

        if (signUpError) {
          setServerError(signUpError.message);
          setIsSubmitting(false);
          return;
        }

        if (role === 'farmer') {
          navigate('/farmer');
        } else {
          navigate('/marketplace');
        }
      } catch (err: any) {
        setServerError(err?.message || 'Registration failed.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // LOCAL DEMO REGISTRATION
    if (role === 'farmer') {
      registerUser({
        name: fullName.trim(),
        nameTa: fullName.trim(),
        role: 'farmer',
        phone: `+91 ${cleanPhone.slice(-10)}`,
        district: district.trim(),
        districtTa: district.trim(),
        location: `${taluk.trim()}, ${district.trim()}`,
        locationTa: `${taluk.trim()}, ${district.trim()}`,
        avatar: '👨‍🌾',
        fpoMember,
      });
      navigate('/farmer');
    } else {
      registerUser({
        name: businessName.trim(),
        nameTa: businessName.trim(),
        role: 'buyer',
        phone: `+91 ${cleanPhone.slice(-10)}`,
        district: district.trim(),
        districtTa: district.trim(),
        location: `${district.trim()} Market Area`,
        locationTa: `${district.trim()} சந்தை பகுதி`,
        avatar: '🏢',
        businessType,
        businessTypeTa: businessType,
      });
      navigate('/marketplace');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
          <UserPlus className="w-3.5 h-3.5" />
          <span>{t('auth.register', 'Register')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t('auth.registerTitle', 'Create FarmLink Account')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          {t('auth.registerSubtitle', 'Join the decision-support marketplace as a Farmer or Agricultural Produce Buyer.')}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
        {/* Mode Selector: Real Cloud Account vs Demo Local */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>{language === 'ta' ? 'பதிவு முறை' : 'Account Type'}</span>
            {isSupabaseConfigured && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                <Database className="w-3 h-3" />
                <span>{language === 'ta' ? 'கிளவுட் ஒத்திசைவு' : 'Cloud Sync Available'}</span>
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setAuthMode('real');
                setErrors({});
                setServerError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                authMode === 'real'
                  ? 'bg-white text-emerald-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-emerald-700" />
              <span>{language === 'ta' ? 'கிளவுட் கணக்கு' : 'Supabase Cloud Account'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('demo');
                setErrors({});
                setServerError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                authMode === 'demo'
                  ? 'bg-white text-emerald-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-700" />
              <span>{language === 'ta' ? 'உள்ளூர் டெமோ' : 'Local Demo Persona'}</span>
            </button>
          </div>
        </div>

        {/* Role Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            {t('auth.selectRole', 'Select Role')}
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setRole('farmer');
                setErrors({});
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                role === 'farmer'
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
                setRole('buyer');
                setErrors({});
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                role === 'buyer'
                  ? 'bg-white text-emerald-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-4 h-4 text-blue-600" />
              <span>{t('auth.buyerRole', 'Produce Buyer')}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Cloud Auth Credentials Fields (When in Real Mode) */}
          {authMode === 'real' && (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
              <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-700" />
                <span>{language === 'ta' ? 'கிளவுட் உள்நுழைவு விவரங்கள்' : 'Supabase Login Credentials'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'ta' ? 'மின்னஞ்சல்' : 'Email Address'} *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@farmlink.org"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
                  />
                  {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'ta' ? 'கடவுச்சொல்' : 'Password'} *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
                  />
                  {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
                </div>
              </div>
            </div>
          )}

          {role === 'farmer' ? (
            /* Farmer Fields */
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('auth.fullName', 'Full Name')} *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramanathan K"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                {errors.fullName && <p className="text-xs text-rose-600 mt-1">{errors.fullName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('auth.district', 'District')} *
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Madurai, Dindigul, Theni"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                  {errors.district && <p className="text-xs text-rose-600 mt-1">{errors.district}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('auth.taluk', 'Local Area / Taluk')} *
                  </label>
                  <input
                    type="text"
                    value={taluk}
                    onChange={(e) => setTaluk(e.target.value)}
                    placeholder="e.g. Usilampatti / Melur"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                  {errors.taluk && <p className="text-xs text-rose-600 mt-1">{errors.taluk}</p>}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('auth.mobileNumber', 'Contact Number')} *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 98421 00000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 text-xs">
                    {t('auth.fpoMember', 'FPO Member')}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {language === 'ta'
                      ? 'நீங்கள் உழவர் உற்பத்தியாளர் நிறுவனத்தில் உறுப்பினரா?'
                      : 'Are you enrolled with a regional Farmer Producer Organization?'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={fpoMember}
                  onChange={(e) => setFpoMember(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </div>
            </>
          ) : (
            /* Buyer Fields */
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('auth.businessName', 'Business / Firm Name')} *
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Meenakshi Agro Traders"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                {errors.businessName && (
                  <p className="text-xs text-rose-600 mt-1">{errors.businessName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('auth.businessClassification', 'Business Classification')} *
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
                  >
                    <option value="Wholesale Trader">Wholesale Trader (மொத்த வியாபாரி)</option>
                    <option value="Food Processor">Food Processor (உணவு பதப்படுத்துதல்)</option>
                    <option value="Retail Agent">Retail Agent (சில்லறை முகவர்)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('auth.district', 'Operating District')} *
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Madurai / Trichy"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                  {errors.district && <p className="text-xs text-rose-600 mt-1">{errors.district}</p>}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('auth.mobileNumber', 'Contact Number')} *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 98940 00000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
              </div>
            </>
          )}

          {serverError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Prototype disclaimer */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {authMode === 'real'
                ? (language === 'ta' ? 'கிளவுட் பதிவு: உங்கள் சுயவிவரம் Supabase PostgreSQL-இல் தானியங்கி பாதுகாப்பு விதிகளுடன் சேமிக்கப்படும்.' : 'Cloud Registration: Your account and profile are securely provisioned via Supabase Auth & PostgreSQL triggers.')
                : t('auth.localRegisterNotice', 'Local Prototype Registration: Your profile is saved in browser storage for this evaluation session.')}
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{language === 'ta' ? 'பதிவு செய்யப்படுகிறது...' : 'Provisioning Account...'}</span>
              </>
            ) : (
              <>
                <span>
                  {authMode === 'real'
                    ? (language === 'ta' ? 'கிளவுட் கணக்கை உருவாக்குக' : 'Register with Supabase Cloud')
                    : (language === 'ta' ? 'கணக்கை உருவாக்கி தொடர்க' : 'Create Profile & Enter Dashboard')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Link back to login */}
        <div className="pt-2 text-center text-xs text-slate-600 border-t border-slate-100">
          <span>{t('auth.alreadyAccount', 'Already have an account?')} </span>
          <Link
            to="/login"
            className="font-bold text-emerald-800 hover:text-emerald-950 underline decoration-emerald-400"
          >
            {t('auth.signIn', 'Sign In with Phone / Demo Persona')}
          </Link>
        </div>
      </div>
    </div>
  );
};
