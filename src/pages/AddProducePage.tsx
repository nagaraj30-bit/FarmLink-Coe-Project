import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useDemoUser } from '../hooks/useDemoUser';
import { createListingAsync } from '../data/dataAccess';
import { ProduceUnit, ProduceListing } from '../types';
import { getSellingUrgency } from '../utils/calculations';
import { UrgencyBadge } from '../components/common/Badge';
import { DisclaimerNotice } from '../components/common/DisclaimerNotice';
import { Sprout, ArrowLeft, Save, AlertCircle, Calendar, Loader2 } from 'lucide-react';

export const AddProducePage: React.FC = () => {
  const { language, t } = useLanguage();
  const { currentUser, isRealAuth } = useDemoUser();
  const navigate = useNavigate();

  // Form states
  const [cropName, setCropName] = useState('Country Tomatoes');
  const [variety, setVariety] = useState('Shivam Hybrid');
  const [category, setCategory] = useState<ProduceListing['category']>('Vegetables');
  const [quantity, setQuantity] = useState<number>(1000);
  const [unit, setUnit] = useState<ProduceUnit>('kg');
  const [expectedPrice, setExpectedPrice] = useState<number>(40);
  const [minFloorPrice, setMinFloorPrice] = useState<number>(34);
  const [sellWithinDays, setSellWithinDays] = useState<number>(2);
  const [harvestingDate, setHarvestingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [storageCondition, setStorageCondition] = useState('Farm shed ventilated plastic crates');
  const [district, setDistrict] = useState(currentUser?.district || 'Madurai');
  const [transportEstimate, setTransportEstimate] = useState<number>(2000);
  const [packagingEstimate, setPackagingEstimate] = useState<number>(800);
  const [description, setDescription] = useState('Freshly harvested grade-A produce ready for immediate dispatch.');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Live urgency preview
  const urgencyPreview = getSellingUrgency(sellWithinDays);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError(null);
    const newErrors: Record<string, string> = {};

    if (!currentUser) {
      newErrors.auth =
        language === 'ta'
          ? 'விளைபொருளை வெளியிட தயவுசெய்து உள்நுழையவும்.'
          : 'Please sign in or select a farmer profile to publish produce.';
    } else if (currentUser.role !== 'farmer') {
      newErrors.auth =
        language === 'ta'
          ? 'விவசாயிகள் மட்டுமே புதிய விளைபொருட்களை பட்டியலிட முடியும்.'
          : 'Only farmers are authorized to create produce listings.';
    }

    if (!cropName.trim()) {
      newErrors.cropName = language === 'ta' ? 'பயிர் பெயர் தேவை.' : 'Crop name is required.';
    }
    if (quantity <= 0) {
      newErrors.quantity = language === 'ta' ? 'அளவு பூஜ்ஜியத்தை விட அதிகமாக இருக்க வேண்டும்.' : 'Quantity must be greater than 0.';
    }
    if (expectedPrice <= 0) {
      newErrors.expectedPrice = language === 'ta' ? 'எதிர்பார்க்கும் விலை பூஜ்ஜியத்தை விட அதிகமாக இருக்க வேண்டும்.' : 'Expected price must be greater than 0.';
    }
    if (minFloorPrice < 0) {
      newErrors.minFloorPrice = language === 'ta' ? 'குறைந்தபட்ச விலை எதிர்மறையாக இருக்க முடியாது.' : 'Minimum floor price cannot be negative.';
    } else if (expectedPrice > 0 && minFloorPrice > expectedPrice) {
      newErrors.minFloorPrice = language === 'ta' ? 'குறைந்தபட்ச விலை எதிர்பார்க்கும் இலக்கு விலையை விட அதிகமாக இருக்க முடியாது.' : 'Minimum floor price cannot exceed target expected price.';
    }
    if (sellWithinDays < 0 || sellWithinDays > 90) {
      newErrors.sellWithinDays = language === 'ta' ? 'விற்பனை காலக்கெடு 0 முதல் 90 நாட்களுக்குள் இருக்க வேண்டும்.' : 'Selling deadline must be between 0 and 90 days.';
    }
    if (!district.trim()) {
      newErrors.district = language === 'ta' ? 'மாவட்டம் தேர்ந்தெடுக்கப்பட வேண்டும்.' : 'District is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      await createListingAsync(
        {
          farmerId: currentUser.id,
          farmerName: currentUser.name,
          farmerNameTa: currentUser.nameTa,
          farmerPhone: currentUser.phone,
          cropName: cropName.trim(),
          cropNameTa: cropName.trim(),
          variety: variety.trim(),
          varietyTa: variety.trim(),
          category,
          quantity: Number(quantity),
          unit,
          expectedPricePerUnit: Number(expectedPrice),
          minAcceptablePricePerUnit: Number(minFloorPrice),
          harvestingDate,
          sellWithinDays: Number(sellWithinDays),
          storageCondition: storageCondition.trim(),
          storageConditionTa: storageCondition.trim(),
          district: district.trim(),
          districtTa: district.trim(),
          transportEstimate: Number(transportEstimate),
          packagingEstimate: Number(packagingEstimate),
          status: 'active',
          description: description.trim(),
          descriptionTa: description.trim(),
        },
        Boolean(isRealAuth)
      );

      navigate('/farmer');
    } catch (err: any) {
      console.error('Failed to create produce listing:', err);
      setSubmitError(err?.message || 'Failed to publish produce listing. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/farmer')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('action.back', 'Back to Dashboard')}</span>
        </button>
      </div>

      {(!currentUser || currentUser.role === 'buyer') && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold">
                {!currentUser
                  ? (language === 'ta' ? 'உள்நுழையவில்லை:' : 'Sign In Required:')
                  : (language === 'ta' ? 'பயனர் பாத்திரம்:' : 'Role Notice:')}
              </span>{' '}
              <span>
                {!currentUser
                  ? t('auth.guestPrompt', 'You are currently browsing as Guest. Sign in to publish produce.')
                  : t('auth.roleMismatchFarmer', 'You are currently logged in as a Buyer. Switch to a Farmer profile to manage listings.')}
              </span>
            </div>
          </div>
          <Link
            to={!currentUser ? '/login' : '/roles'}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors shrink-0 text-center"
          >
            {!currentUser ? t('auth.signIn', 'Sign In') : (language === 'ta' ? 'விவசாயி பாத்திரத்திற்கு மாறுக' : 'Switch to Farmer')}
          </Link>
        </div>
      )}

      {errors.auth && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errors.auth}</span>
        </div>
      )}

      {submitError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-900 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold block">
                {language === 'ta' ? 'வெளியிடுவதில் பிழை ஏற்பட்டது:' : 'Submission Error:'}
              </span>
              <span>{submitError}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSubmitError(null)}
            className="text-rose-500 hover:text-rose-700 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider font-mono">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>{language === 'ta' ? 'புதிய விளைபொருள் பதிவு' : 'New Harvest Produce Entry'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            {language === 'ta' ? 'விளைபொருள் விவரங்களை உள்ளிடவும்' : 'Add Produce for Buyer Bidding'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'ta'
              ? 'அளவு, அலகு, விற்பனை காலக்கெடு மற்றும் எதிர்பார்க்கும் விலையை உள்ளிடுங்கள்.'
              : 'Enter quantities, units, deadline, and expected baseline price to begin receiving structured offers.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
          {/* Section 1: Crop and Classification */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {language === 'ta' ? 'பயிர் பெயர் (Crop Name)' : 'Crop Name'} *
              </label>
              <input
                type="text"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. Tomatoes, Drumsticks, Onions"
              />
              {errors.cropName && <p className="text-xs text-rose-600 mt-1">{errors.cropName}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {language === 'ta' ? 'ரகம் (Variety)' : 'Variety / Hybrid'}
              </label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. Country / Hybrid / PKM-1"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {language === 'ta' ? 'பிரிவு (Category)' : 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Vegetables">{language === 'ta' ? 'காய்கறிகள் (Vegetables)' : 'Vegetables'}</option>
                <option value="Fruits">{language === 'ta' ? 'பழங்கள் (Fruits)' : 'Fruits'}</option>
                <option value="Grains">{language === 'ta' ? 'தானியங்கள் (Grains)' : 'Grains'}</option>
                <option value="Spices">{language === 'ta' ? 'மசாலாப் பொருட்கள் (Spices)' : 'Spices'}</option>
                <option value="Oilseeds">{language === 'ta' ? 'எண்ணெய் வித்துக்கள் (Oilseeds)' : 'Oilseeds'}</option>
              </select>
            </div>
          </div>

          {/* Section 2: Quantity and Locked Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('term.quantity', 'Available Quantity')} *
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              {errors.quantity && <p className="text-xs text-rose-600 mt-1">{errors.quantity}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('term.unit', 'Produce Unit')} *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as ProduceUnit)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="kg">{language === 'ta' ? 'கிலோ (kg)' : 'kg (Kilogram)'}</option>
                <option value="quintal">{language === 'ta' ? 'குவிண்டால் (100 கிலோ)' : 'quintal (100 kg)'}</option>
                <option value="box">{language === 'ta' ? 'பெட்டிகள் (box)' : 'box'}</option>
                <option value="bags">{language === 'ta' ? 'மூட்டைகள் (bags)' : 'bags'}</option>
                <option value="nuts">{language === 'ta' ? 'எண்ணிக்கை (nuts)' : 'nuts (Coconut)'}</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                {language === 'ta'
                  ? 'வாங்குபவர் இந்த அலகை மட்டுமே பயன்படுத்தி விலை கேட்பார்.'
                  : 'Buyer offers will strictly inherit this locked unit.'}
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('term.district', 'District')}
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              {errors.district && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.district}</p>}
            </div>
          </div>

          {/* Section 3: Expected Prices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('term.expectedPrice', 'Expected Target Price')} (₹ per {unit}) *
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={expectedPrice}
                onChange={(e) => setExpectedPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.expectedPrice && <p className="text-xs text-rose-600 mt-1">{errors.expectedPrice}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {language === 'ta' ? 'குறைந்தபட்ச ஏற்புடைய விலை (Floor Price)' : 'Minimum Acceptable Price'} (₹ per {unit})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={minFloorPrice}
                onChange={(e) => setMinFloorPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.minFloorPrice && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.minFloorPrice}</p>}
              <p className="text-[11px] text-slate-400 mt-1">
                {language === 'ta' ? 'இதற்குக் கீழ் வரும் வாய்ப்புகளுக்கு மாற்று வழிகள் காட்டப்படும்.' : 'Used for unsold produce advisory triggers.'}
              </p>
            </div>
          </div>

          {/* Section 4: Selling Deadline & Live Urgency Preview (Crucial Requirement!) */}
          <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <Calendar className="w-4 h-4 text-amber-700" />
                <span>{language === 'ta' ? 'விற்பனை காலக்கெடு & அவசர நிலை முன்னோட்டம்' : 'Selling Deadline & Live Urgency Preview'}</span>
              </div>
              <UrgencyBadge level={urgencyPreview.level} daysRemaining={sellWithinDays} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'ta' ? 'எத்தனை நாட்களுக்குள் விற்க வேண்டும்?' : 'Sell Within (Days)'} *
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={sellWithinDays}
                  onChange={(e) => setSellWithinDays(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-bold"
                />
                {errors.sellWithinDays && <p className="text-xs text-rose-600 mt-1">{errors.sellWithinDays}</p>}
              </div>

              <div className="text-xs text-slate-600 space-y-1 bg-white p-3 rounded-xl border border-amber-200">
                <div className="font-semibold text-slate-900">
                  {language === 'ta' ? 'விதிமுறை விளக்கம்:' : 'Business Rule Applied:'}
                </div>
                {language === 'ta' ? (
                  <>
                    <div>• ≤ 1 நாள்: <strong>அதிக அவசரம்</strong> (24 மணி நேரத்திற்குள் நடவடிக்கை தேவை)</div>
                    <div>• 2–3 நாட்கள்: <strong>நடுத்தர அவசரம்</strong> (அவசர விற்பனையைத் தவிர்க்கவும்)</div>
                    <div>• &gt; 3 நாட்கள்: <strong>இயல்பான நிலை</strong> (வழக்கமான பட்டியல்)</div>
                  </>
                ) : (
                  <>
                    <div>• ≤ 1 day: <strong>High urgency</strong> (24h action required)</div>
                    <div>• 2–3 days: <strong>Medium urgency</strong> (Avoid distress sale)</div>
                    <div>• &gt; 3 days: <strong>Normal urgency</strong> (Regular listing)</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Harvest date, Storage condition & logistics baseline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('term.harvestDate', 'Harvesting Date')}
              </label>
              <input
                type="date"
                value={harvestingDate}
                onChange={(e) => setHarvestingDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('term.storageCondition', 'Storage Condition')}
              </label>
              <input
                type="text"
                value={storageCondition}
                onChange={(e) => setStorageCondition(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. Naturally ventilated shed, crates, shade"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {language === 'ta' ? 'கூடுதல் விவரங்கள் (Description)' : 'Additional Notes / Quality Details'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/farmer')}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              {t('action.cancel', 'Cancel')}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-xs shadow-md transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{language === 'ta' ? 'வெளியிடப்படுகிறது...' : 'Publishing...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{language === 'ta' ? 'விளைபொருளை வெளியிடவும்' : 'Publish Produce Listing'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <DisclaimerNotice />
    </div>
  );
};
