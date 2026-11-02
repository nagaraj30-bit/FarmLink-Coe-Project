import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useDemoUser } from '../../hooks/useDemoUser';
import { fetchUnsoldGuidanceAsync } from '../../data/dataAccess';
import { UNSOLD_GUIDANCE_OPTIONS } from '../../data/mockData';
import { UnsoldGuidance, UrgencyLevel } from '../../types';
import { ShieldAlert, Warehouse, SunMedium, ShoppingBag, Users, X, ChevronRight, PhoneCall, CheckCircle } from 'lucide-react';

interface UnsoldProduceModalProps {
  isOpen: boolean;
  onClose: () => void;
  cropName?: string;
  urgencyLevel?: UrgencyLevel;
}

export const UnsoldProduceModal: React.FC<UnsoldProduceModalProps> = ({
  isOpen,
  onClose,
  cropName,
  urgencyLevel = 'high',
}) => {
  const { language, t } = useLanguage();
  const { isRealAuth } = useDemoUser();
  const [options, setOptions] = useState<UnsoldGuidance[]>(UNSOLD_GUIDANCE_OPTIONS);
  const [selectedId, setSelectedId] = useState<string>(UNSOLD_GUIDANCE_OPTIONS[0].id);

  useEffect(() => {
    let isMounted = true;
    if (isOpen && isRealAuth) {
      fetchUnsoldGuidanceAsync(Boolean(isRealAuth))
        .then((data) => {
          if (!isMounted) return;
          if (data && data.length > 0) {
            setOptions(data);
            setSelectedId((prev) => {
              const stillExists = data.some((opt) => opt.id === prev);
              return stillExists ? prev : data[0].id;
            });
          }
        })
        .catch((err) => {
          console.warn('Could not load unsold guidance from remote database, using offline fallback:', err);
        });
    } else if (isOpen && !isRealAuth) {
      setOptions(UNSOLD_GUIDANCE_OPTIONS);
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, isRealAuth]);

  if (!isOpen) return null;

  const selectedOption = options.find((o) => o.id === selectedId) || options[0] || UNSOLD_GUIDANCE_OPTIONS[0];

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'storage':
        return <Warehouse className="w-5 h-5 text-blue-600" />;
      case 'processing':
        return <SunMedium className="w-5 h-5 text-amber-600" />;
      case 'direct_sale':
        return <ShoppingBag className="w-5 h-5 text-emerald-600" />;
      case 'fpo':
        return <Users className="w-5 h-5 text-purple-600" />;
      default:
        return <ShieldAlert className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold">
                {language === 'ta' ? 'விற்கப்படாத விளைபொருள் முடிவு வழிகாட்டி' : 'Unsold Produce Decision Support'}
              </h2>
              <p className="text-xs md:text-sm text-emerald-200 mt-0.5">
                {cropName
                  ? `${language === 'ta' ? 'பயிருக்கான மாற்று வழிகள்' : 'Next-step options for'}: ${cropName}`
                  : t('unsold.sub', 'Practical next-step avenues when offers are low or deadline is approaching.')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Guidance Principle Banner */}
        <div className="bg-emerald-50 px-5 py-2.5 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-800">
          <span className="font-semibold">
            {language === 'ta' ? 'வழிகாட்டல் தத்துவம்:' : 'Decision Principle:'}{' '}
            <span className="font-normal">
              {language === 'ta'
                ? 'விளக்குதல் → ஒப்பிடுதல் → பரிந்துரைத்தல் → நடவடிக்கை வழிகாட்டல்'
                : 'Inform → Explain → Compare → Suggest → Guide'}
            </span>
          </span>
          <span className="bg-emerald-200/80 px-2 py-0.5 rounded text-[11px] font-bold">
            {language === 'ta' ? 'விவசாயி முடிவு மையம்' : 'Farmer-Empowered'}
          </span>
        </div>

        {/* Content body split */}
        <div className="flex-1 overflow-y-auto grid md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Options tabs on left */}
          <div className="md:col-span-2 p-3 space-y-1.5 bg-slate-50/50">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-2 py-1">
              {language === 'ta' ? 'தேர்வு செய்யக்கூடிய வழிகள்' : 'Available Avenues'}
            </div>
            {options.map((opt) => {
              const isSelected = opt.id === selectedId;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedId(opt.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-white shadow-sm border border-emerald-400 ring-1 ring-emerald-200 text-emerald-950'
                      : 'hover:bg-slate-100/80 text-slate-700'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{getCategoryIcon(opt.category)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold leading-tight truncate">
                      {language === 'ta' ? opt.titleTa : opt.title}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>{opt.estimatedRecoveryPct}</span>
                      {isSelected && <ChevronRight className="w-3 h-3 text-emerald-600" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed plan on right */}
          <div className="md:col-span-3 p-5 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  {selectedOption.estimatedRecoveryPct}
                </span>
                <span className="text-xs text-slate-500">
                  {language === 'ta' ? 'எதிர்பார்க்கப்படும் மதிப்பு மீட்பு' : 'Estimated Value Recovery'}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1.5">
                {language === 'ta' ? selectedOption.titleTa : selectedOption.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {language === 'ta' ? selectedOption.descriptionTa : selectedOption.description}
              </p>
            </div>

            {/* Practical Action Steps */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                {language === 'ta' ? 'செயல்முறை படிகள் (Action Steps):' : 'Immediate Action Steps:'}
              </div>
              <div className="space-y-2">
                {(language === 'ta' ? selectedOption.actionStepsTa : selectedOption.actionSteps).map(
                  (step, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Helpline contact */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5">
              <PhoneCall className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900">
                <div className="font-semibold">{language === 'ta' ? 'அதிகாரப்பூர்வ உதவி மையம்:' : 'Official Liaison Contact:'}</div>
                <div className="mt-0.5 text-blue-800">
                  {language === 'ta' ? selectedOption.contactSupportTa : selectedOption.contactSupport}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 italic">
            {language === 'ta'
              ? 'பார்ம்லிங்க் முடிவுகளை பரிந்துரைக்கிறது; இறுதி முடிவு உங்களுடையதே.'
              : 'FarmLink provides options transparently; final decision rests with the farmer.'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            {language === 'ta' ? 'புரிந்தது / மூடுக' : 'Close Guidance'}
          </button>
        </div>
      </div>
    </div>
  );
};
