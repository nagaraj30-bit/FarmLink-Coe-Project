import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Sprout, ShieldCheck, AlertTriangle } from 'lucide-react';
import { MANDATORY_DISCLAIMER_EN, MANDATORY_DISCLAIMER_TA } from '../../utils/calculations';

export const Footer: React.FC = () => {
  const { language } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Col 1: About FarmLink */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Sprout className="w-5 h-5 text-emerald-400" />
              <span>FarmLink</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              {language === 'ta'
                ? 'விவசாயிகள் அதிக லாபம் தரும் வாய்ப்புகளைத் தேர்ந்தெடுக்க நிகர வருவாய் ஒப்பீடு மற்றும் விற்பனை முடிவு ஆதரவு தளம்.'
                : 'A decision-support marketplace helping farmers compare buyer offers by estimated take-home net return after logistics, packaging, and handling costs.'}
            </p>
            <div className="text-[11px] text-emerald-400 font-mono">
              College of Engineering (CoE) Project • Oct 2026
            </div>
          </div>

          {/* Col 2: Business Rule Disclosures */}
          <div className="space-y-2">
            <div className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {language === 'ta' ? 'கணக்கீட்டு விதிமுறைகள்' : 'Calculation Standards'}
            </div>
            <div className="text-slate-400 text-[11px] space-y-1">
              <div>
                • <strong>Net Return Formula:</strong> (Quantity × Unit Price) − Transport − Packaging − Other Costs.
              </div>
              <div>
                • <strong>Urgency Derived From:</strong> Farmer-entered <code className="text-slate-300">sellWithinDays</code>.
              </div>
              <div>
                • <strong>Units:</strong> Strictly inherited & locked to listing inventory.
              </div>
            </div>
          </div>

          {/* Col 3: Explicit Anti-Misrepresentation Disclaimers */}
          <div className="space-y-2">
            <div className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              {language === 'ta' ? 'வெளிப்படைத்தன்மை குறிப்பு' : 'Academic Disclaimers'}
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {language === 'ta'
                ? 'பார்ம்லிங்க் உயிரியல் அழுகல் கணிப்புகளையோ, உத்தரவாதமான லாபத்தையோ கோரவில்லை. இது விவசாயிகள் உள்ளிட்ட செலவுகளின் அடிப்படையிலான முடிவெடுக்கும் மாதிரி.'
                : 'FarmLink does not claim biological spoilage prediction, verified buyers, or guaranteed profits. Urgency reflects farmer schedule targets, not biological deterioration.'}
            </p>
          </div>
        </div>

        {/* Mandatory Bottom Banner */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
          <div className="italic text-amber-300">
            "{language === 'ta' ? MANDATORY_DISCLAIMER_TA : MANDATORY_DISCLAIMER_EN}"
          </div>
          <div className="flex items-center gap-4">
            <span>FarmLink Decision Engine v1.0</span>
            <span>•</span>
            <span>Tamil Nadu Agri Model</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
