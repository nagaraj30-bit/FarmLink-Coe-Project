import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useDemoUser } from '../hooks/useDemoUser';
import {
  User,
  MapPin,
  Phone,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Building,
  Sprout,
  Users,
  Eye,
  Info,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const COMMON_TN_DISTRICTS = [
  'Madurai',
  'Dindigul',
  'Theni',
  'Tiruchirappalli',
  'Coimbatore',
  'Thanjavur',
  'Salem',
  'Erode',
  'Tirunelveli',
  'Virudhunagar',
  'Sivaganga',
  'Karur',
  'Tiruppur',
  'Pudukkottai',
  'Cuddalore',
  'Villupuram',
  'Vellore',
  'Tiruvannamalai',
  'Namakkal',
  'Dharmapuri',
];

const AVATAR_OPTIONS = ['👨‍🌾', '👩‍🌾', '🌾', '🚜', '🌱', '🧑‍🌾'];

export const FarmerProfilePage: React.FC = () => {
  const { language, t } = useLanguage();
  const { currentUser, updateProfile, isGuest } = useDemoUser();
  const navigate = useNavigate();

  // Form states initialized from currentUser
  const [name, setName] = useState(currentUser?.name || '');
  const [nameTa, setNameTa] = useState(currentUser?.nameTa || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '👨‍🌾');
  const [district, setDistrict] = useState(currentUser?.district || 'Madurai');
  const [customDistrict, setCustomDistrict] = useState('');
  const [isCustomDistrict, setIsCustomDistrict] = useState(false);
  const [location, setLocation] = useState(currentUser?.location || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [fpoMember, setFpoMember] = useState(currentUser?.fpoMember || false);
  const [fpoName, setFpoName] = useState(currentUser?.fpoName || '');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Sync state whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setNameTa(currentUser.nameTa || currentUser.name);
      setAvatar(currentUser.avatar || '👨‍🌾');
      
      const inList = COMMON_TN_DISTRICTS.includes(currentUser.district);
      if (inList) {
        setDistrict(currentUser.district);
        setIsCustomDistrict(false);
        setCustomDistrict('');
      } else {
        setDistrict('custom');
        setIsCustomDistrict(true);
        setCustomDistrict(currentUser.district);
      }

      setLocation(currentUser.location || '');
      setPhone(currentUser.phone || '');
      setFpoMember(Boolean(currentUser.fpoMember));
      setFpoName(currentUser.fpoName || '');
      setHasChanges(false);
    }
  }, [currentUser]);

  // Track whether form has unsaved modifications
  const markChanged = () => {
    setHasChanges(true);
    setSavedSuccess(false);
  };

  const handleResetForm = () => {
    if (currentUser) {
      setName(currentUser.name);
      setNameTa(currentUser.nameTa || currentUser.name);
      setAvatar(currentUser.avatar || '👨‍🌾');
      
      const inList = COMMON_TN_DISTRICTS.includes(currentUser.district);
      if (inList) {
        setDistrict(currentUser.district);
        setIsCustomDistrict(false);
        setCustomDistrict('');
      } else {
        setDistrict('custom');
        setIsCustomDistrict(true);
        setCustomDistrict(currentUser.district);
      }

      setLocation(currentUser.location || '');
      setPhone(currentUser.phone || '');
      setFpoMember(Boolean(currentUser.fpoMember));
      setFpoName(currentUser.fpoName || '');
      setErrors({});
      setHasChanges(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const effectiveDistrict = isCustomDistrict ? customDistrict.trim() : district.trim();

    if (!name.trim()) {
      newErrors.name = language === 'ta' ? 'பெயர் தேவை.' : 'Farmer name is required.';
    }

    if (!effectiveDistrict) {
      newErrors.district = language === 'ta' ? 'விவசாய மாவட்டம் தேர்வு செய்ய வேண்டும்.' : 'Agricultural district is required.';
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      newErrors.phone =
        language === 'ta'
          ? 'தயவுசெய்து சரியான 10-இலக்க மொபைல் எண்ணை உள்ளிடவும்.'
          : 'Please enter a valid 10-digit contact mobile number.';
    }

    if (fpoMember && !fpoName.trim()) {
      // Optional, but suggest gentle validation or default
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const formattedPhone =
      cleanPhone.startsWith('91') && cleanPhone.length > 10
        ? `+${cleanPhone}`
        : `+91 ${cleanPhone.slice(-10)}`;

    const effectiveLocation = location.trim() || `${effectiveDistrict} Farm Gate`;

    const updated = updateProfile({
      name: name.trim(),
      nameTa: nameTa.trim() || name.trim(),
      avatar,
      district: effectiveDistrict,
      districtTa: effectiveDistrict,
      location: effectiveLocation,
      locationTa: effectiveLocation,
      phone: formattedPhone,
      fpoMember,
      fpoName: fpoMember ? (fpoName.trim() || `${effectiveDistrict} Farmers Producer Co.`) : undefined,
    });

    if (updated) {
      setSavedSuccess(true);
      setHasChanges(false);
      setTimeout(() => {
        setSavedSuccess(false);
      }, 4000);
    }
  };

  if (isGuest || !currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          {language === 'ta' ? 'உள்நுழைவு தேவை' : 'Sign In Required'}
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {t(
            'auth.guestPrompt',
            'You are currently browsing as Guest. Sign in to access your farmer tools or manage your profile.'
          )}
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors shadow-sm"
          >
            {t('auth.signIn', 'Sign In')}
          </Link>
          <Link
            to="/roles"
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
          >
            {language === 'ta' ? 'டெமோ பாத்திரங்கள்' : 'Demo Personas'}
          </Link>
        </div>
      </div>
    );
  }

  const effectiveDistrict = isCustomDistrict ? (customDistrict || 'District') : district;
  const effectiveLocation = location || `${effectiveDistrict} Farm Shed`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top back navigation and breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/farmer')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('action.back', 'Back to Dashboard')}</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link to="/farmer" className="hover:text-emerald-700">
            {t('nav.farmerDashboard', 'Dashboard')}
          </Link>
          <span>/</span>
          <span className="text-emerald-800 font-semibold">
            {language === 'ta' ? 'சுயவிவர மேலாண்மை' : 'Profile Management'}
          </span>
        </div>
      </div>

      {/* Role Notice if user is signed in as a Buyer */}
      {currentUser.role === 'buyer' && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold">
                {language === 'ta' ? 'வியாபாரி பயன்முறையில் உள்ளீர்கள்:' : 'Buyer Profile Notice:'}{' '}
              </span>
              <span>
                {t(
                  'auth.roleMismatchFarmer',
                  'You are currently logged in as a Buyer. Switch to a Farmer profile to manage farmer details.'
                )}
              </span>
            </div>
          </div>
          <Link
            to="/roles"
            className="px-3.5 py-1.5 rounded-lg bg-amber-700 text-white font-bold text-xs hover:bg-amber-800 transition-colors shrink-0 text-center"
          >
            {language === 'ta' ? 'விவசாயி பாத்திரத்திற்கு மாறுக' : 'Switch to Farmer Profile'}
          </Link>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider font-mono">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>{language === 'ta' ? 'விவசாயி அடையாள மேலாண்மை' : 'Farmer Identity & Region'}</span>
          </div>
          <span className="text-[11px] font-bold font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            {currentUser.id}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t('profile.title', 'Farmer Profile Management')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
          {t(
            'profile.subtitle',
            'Update your agricultural district, contact details, and FPO membership status.'
          )}{' '}
          {language === 'ta'
            ? 'இவை உங்கள் சந்தை பதிவுகளிலும் வாங்குபவர் பார்க்கும் அட்டைகளிலும் உடனடியாகப் பிரதிபலிக்கும்.'
            : 'Changes immediately update your mandi benchmarks, freight estimates, and marketplace listings.'}
        </p>
      </div>

      {/* Success Notification Banner */}
      {savedSuccess && (
        <div className="bg-emerald-600 text-white p-4 rounded-xl flex items-center justify-between shadow-md transition-all">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <div className="text-sm font-bold">
                {t('profile.saveSuccess', 'Profile details updated successfully!')}
              </div>
              <div className="text-xs text-emerald-100">
                {language === 'ta'
                  ? 'உங்கள் மாவட்ட விவரங்கள் மற்றும் தொடர்பு எண் சேமிக்கப்பட்டு புதுப்பிக்கப்பட்டன.'
                  : 'District, contact number, and FPO status are now active in your session.'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setSavedSuccess(false)}
            className="text-emerald-100 hover:text-white text-xs underline cursor-pointer"
          >
            {language === 'ta' ? 'மூடுக' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Main Form & Live Preview Grid */}
      <div className="grid md:grid-cols-12 gap-8 items-start">
        {/* Left: Edit Form (7 cols) */}
        <form
          onSubmit={handleSubmit}
          className="md:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6 text-xs sm:text-sm"
        >
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-700" />
              <span>{language === 'ta' ? 'சுயவிவர விவரங்கள்' : 'Farmer Contact & Regional Info'}</span>
            </h2>
            {hasChanges && (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                {language === 'ta' ? 'சேமிக்கப்படாத மாற்றங்கள்' : 'Unsaved changes'}
              </span>
            )}
          </div>

          {/* Avatar Icon Picker */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              {language === 'ta' ? 'விவசாயி சின்னம் / அவதார்' : 'Profile Avatar'}
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {AVATAR_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => {
                    setAvatar(icon);
                    markChanged();
                  }}
                  className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all cursor-pointer ${
                    avatar === icon
                      ? 'bg-emerald-100 border-2 border-emerald-600 scale-105 shadow-2xs'
                      : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                  }`}
                  title={icon}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Full Name (English & Tamil) */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('auth.fullName', 'Full Name (English)')} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  markChanged();
                }}
                placeholder="e.g. Murugan Raman"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {language === 'ta' ? 'முழு பெயர் (தமிழ்)' : 'Name in Tamil (Optional)'}
              </label>
              <input
                type="text"
                value={nameTa}
                onChange={(e) => {
                  setNameTa(e.target.value);
                  markChanged();
                }}
                placeholder="எ.கா. முருகன் ராமன்"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* District Field with dropdown & custom input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>{t('auth.district', 'Agricultural District')} *</span>
              </label>
              <span className="text-[11px] text-slate-400 font-normal">
                {language === 'ta' ? 'மண்டி விலை மற்றும் சரக்கு' : 'Determines regional mandi benchmarks'}
              </span>
            </div>

            <select
              value={isCustomDistrict ? 'custom' : district}
              onChange={(e) => {
                markChanged();
                if (e.target.value === 'custom') {
                  setIsCustomDistrict(true);
                } else {
                  setIsCustomDistrict(false);
                  setDistrict(e.target.value);
                }
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
            >
              {COMMON_TN_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d} {d === 'Madurai' || d === 'Dindigul' ? '— (Active Market Center)' : ''}
                </option>
              ))}
              <option value="custom">Other / Custom District...</option>
            </select>

            {isCustomDistrict && (
              <div className="pt-1">
                <input
                  type="text"
                  value={customDistrict}
                  onChange={(e) => {
                    setCustomDistrict(e.target.value);
                    markChanged();
                  }}
                  placeholder="Enter custom Tamil Nadu district (e.g. Kanchipuram)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            )}
            {errors.district && <p className="text-xs text-rose-600 mt-1">{errors.district}</p>}
          </div>

          {/* Local Area / Taluk / Farm Location */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t('auth.taluk', 'Local Area / Taluk / Farm Location')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  markChanged();
                }}
                placeholder="e.g. Usilampatti, Madurai District"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {language === 'ta'
                ? 'வாங்குபவர்கள் உங்கள் பண்ணை வாசலுக்கு லாரி அனுப்ப தூரத்தை கணக்கிட உதவுகிறது.'
                : 'Helps buyers estimate transport distance and logistics for farm-gate pickup.'}
            </span>
          </div>

          {/* Contact Mobile */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-700" />
                <span>{t('auth.mobileNumber', 'Contact Phone Number')} *</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                {language === 'ta' ? 'வாங்குபவர் தொடர்பு எண்' : 'For buyer deal negotiation'}
              </span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  markChanged();
                }}
                placeholder="+91 94431 22890"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium font-mono"
              />
            </div>
            {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
          </div>

          {/* FPO Membership Section */}
          <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-700" />
                  <span>{t('auth.fpoMember', 'FPO Member (Farmer Producer Organization)')}</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  {t(
                    'profile.fpoBenefit',
                    'FPO membership links you with regional aggregation groups, reducing freight overhead by up to 60%.'
                  )}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={fpoMember}
                  onChange={(e) => {
                    setFpoMember(e.target.checked);
                    markChanged();
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* If FPO Member is checked, show FPO Organization Name */}
            {fpoMember && (
              <div className="pt-3 border-t border-emerald-200/80 space-y-2">
                <label className="block font-semibold text-emerald-950 text-xs">
                  {language === 'ta' ? 'உழவர் உற்பத்தியாளர் நிறுவனத்தின் பெயர் (FPO Name)' : 'FPO / Cooperative Name'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-700">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={fpoName}
                    onChange={(e) => {
                      setFpoName(e.target.value);
                      markChanged();
                    }}
                    placeholder={`e.g. ${effectiveDistrict} Farmer Producer Company Ltd.`}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-xs sm:text-sm text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-emerald-700">
                  {language === 'ta'
                    ? 'வாங்குபவர் பார்க்கும் போது இந்த சான்றிதழ் விவரம் நம்பகத்தன்மையை அதிகரிக்கும்.'
                    : 'This organization label will appear on your verified produce listings to buyers.'}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'ta' ? 'விவரங்களைச் சேமிக்கவும்' : 'Save Profile Changes'}</span>
            </button>

            {hasChanges && (
              <button
                type="button"
                onClick={handleResetForm}
                className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'ta' ? 'மீட்டமைக்க' : 'Discard Changes'}</span>
              </button>
            )}
          </div>
        </form>

        {/* Right: Live Buyer Preview Card & Quick Guidance (5 cols) */}
        <div className="md:col-span-5 space-y-5">
          {/* Live Preview Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Eye className="w-4 h-4" />
                <span>{t('profile.buyerPreview', 'Farmer Badge Preview for Buyers')}</span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                Live Preview
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              {language === 'ta'
                ? 'நீங்கள் விளைபொருட்களை வெளியிடும் போது மொத்த கொள்முதல் வியாபாரிகள் உங்கள் விவரங்களை இவ்வாறு காண்பார்கள்:'
                : 'This is how wholesale buyers view your credentials when inspecting your produce lots:'}
            </p>

            {/* Simulated Badge Card */}
            <div className="bg-white rounded-xl p-4 text-slate-900 space-y-3 shadow-inner border border-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl bg-emerald-50 rounded-xl p-1.5 border border-emerald-100">{avatar}</span>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-tight">
                      {language === 'ta' ? (nameTa || name || 'விவசாயி பெயர்') : (name || 'Farmer Name')}
                    </h3>
                    <div className="text-xs text-emerald-800 font-semibold flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{effectiveDistrict}</span>
                    </div>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                  {language === 'ta' ? 'சரிபார்க்கப்பட்ட விவசாயி' : 'Verified Farmer'}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">{language === 'ta' ? 'பண்ணை பகுதி:' : 'Farm Location:'}</span>
                  <span className="font-semibold text-slate-800 text-right truncate max-w-[180px]">
                    {effectiveLocation}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">{language === 'ta' ? 'நேரடி தொடர்பு:' : 'Direct Phone:'}</span>
                  <span className="font-mono font-semibold text-slate-800">{phone || '+91 ...'}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                  <span className="text-slate-400">FPO Collective:</span>
                  {fpoMember ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      <Shield className="w-3 h-3 text-emerald-600" />
                      <span>{fpoName ? fpoName.slice(0, 24) : 'FPO Enrolled'}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">Independent Grower</span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-emerald-200/90 pt-1 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
              <span>
                {t(
                  'profile.editNotice',
                  'Changes are saved in your active session and applied to your marketplace listings.'
                )}
              </span>
            </div>
          </div>

          {/* Agricultural Impact Card */}
          <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-200 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-emerald-950 text-sm">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>{language === 'ta' ? 'விவசாயி முடிவு ஆதரவு பயன்கள்' : 'Why District & FPO Data Matter'}</span>
            </div>
            <ul className="space-y-2 text-slate-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">•</span>
                <span>
                  <strong>{language === 'ta' ? 'மண்டி விலை அளவுகோல்:' : 'Mandi Price Benchmarks:'}</strong>{' '}
                  {language === 'ta'
                    ? 'தேர்வு செய்யப்படும் மாவட்டத்தின் அடிப்படையில் அரசு உழவர் சந்தை விலைகள் தானாகப் பொருந்தும்.'
                    : 'Local APMC/Mandi benchmark rates automatically align with your active district.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">•</span>
                <span>
                  <strong>{language === 'ta' ? 'போக்குவரத்து சேமிப்பு:' : 'Logistics Net Return:'}</strong>{' '}
                  {language === 'ta'
                    ? 'FPO குழுவில் இணைந்திருப்பதால் விவசாயிகளுக்கு சரக்கு கட்டணம் குறைந்து நிகர வருவாய் அதிகரிக்கும்.'
                    : 'FPO members benefit from lower group freight deductions, boosting take-home net return.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">•</span>
                <span>
                  <strong>{language === 'ta' ? 'வாங்குபவர் நம்பிக்கை:' : 'Buyer Transparency:'}</strong>{' '}
                  {language === 'ta'
                    ? 'துல்லியமான தொடர்பு மற்றும் பண்ணை இருப்பிட விவரங்கள் வாங்குபவர்கள் விரைவாக சலுகை வழங்க உதவுகிறது.'
                    : 'Accurate farm location helps buyers estimate pickup truck routes from Madurai or Dindigul.'}
                </span>
              </li>
            </ul>

            <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px]">
              <Link to="/farmer" className="text-emerald-800 font-bold hover:underline">
                ← {language === 'ta' ? 'டாஷ்போர்டுக்கு திரும்பு' : 'Return to Dashboard'}
              </Link>
              <Link to="/my-listings" className="text-emerald-800 font-bold hover:underline">
                {language === 'ta' ? 'எனது விளைபொருட்கள்' : 'View My Listings'} →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
