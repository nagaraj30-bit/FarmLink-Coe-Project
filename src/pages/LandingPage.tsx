import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useDemoUser } from '../hooks/useDemoUser';
import { formatINR } from '../utils/formatters';
import { calculateNetReturn } from '../utils/calculations';
import { DisclaimerNotice } from '../components/common/DisclaimerNotice';
import {
  Sprout,
  ArrowRight,
  Calculator,
  ShieldCheck,
  Clock,
  TrendingUp,
  Scale,
  Award,
  ChevronRight,
  Layers,
  HelpCircle,
  Truck,
  Package,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { switchUser } = useDemoUser();

  // Interactive Live Comparison Simulation State (Farmer selling 100 kg tomatoes demo from brief)
  const [demoQty, setDemoQty] = useState(100);

  // Buyer A: Lower unit price, low costs
  const [buyerAPrice, setBuyerAPrice] = useState(20);
  const [buyerATransport, setBuyerATransport] = useState(300);
  const [buyerAPackaging, setBuyerAPackaging] = useState(100);

  // Buyer B: Higher unit price, high costs
  const [buyerBPrice, setBuyerBPrice] = useState(19);
  const [buyerBTransport, setBuyerBTransport] = useState(100);
  const [buyerBPackaging, setBuyerBPackaging] = useState(50);

  const calcA = calculateNetReturn(demoQty, buyerAPrice, buyerATransport, buyerAPackaging, 0, 'kg');
  const calcB = calculateNetReturn(demoQty, buyerBPrice, buyerBTransport, buyerBPackaging, 0, 'kg');

  const winner = calcB.estimatedNetReturn > calcA.estimatedNetReturn ? 'B' : calcA.estimatedNetReturn > calcB.estimatedNetReturn ? 'A' : 'TIE';
  const diff = Math.abs(calcB.estimatedNetReturn - calcA.estimatedNetReturn);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-950 to-slate-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-600/50 text-emerald-200 text-xs font-semibold">
            <Scale className="w-3.5 h-3.5 text-emerald-300" />
            <span>{language === 'ta' ? 'விவசாயிகளுக்கான முடிவு ஆதரவு தளம்' : 'Agricultural Decision Support Platform'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            {language === 'ta' ? (
              <>
                விவேகமாக விற்கவும். <br />
                <span className="text-emerald-400">உண்மையான நிகர வருவாய்</span> ஈட்டவும்.
              </>
            ) : (
              <>
                Sell Smarter. <br />
                <span className="text-emerald-400">Earn More Net Income.</span>
              </>
            )}
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-emerald-100/90 leading-relaxed">
            {language === 'ta'
              ? 'அதிக விலையைக் காட்டும் வாங்குபவர் எப்பொழுதும் சிறந்த வருவாயைத் தருவதில்லை. போக்குவரத்து மற்றும் பேக்கிங் செலவுகளைக் கழித்து, உங்கள் கையில் கிடைக்கும் உண்மையான தொகையை ஒப்பிட்டுப் பாருங்கள்.'
              : 'The highest unit price offer does not always provide the best take-home return. FarmLink helps farmers compare offers using actual selling deductions before making a decision.'}
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              to="/farmer"
              onClick={() => switchUser('farmer-1')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg hover:shadow-emerald-500/20 transition-all"
            >
              <Sprout className="w-4 h-4" />
              <span>{language === 'ta' ? 'விவசாயியாக தொடரவும் (முருகன்)' : 'Explore as Farmer (Murugan)'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/marketplace"
              onClick={() => switchUser('buyer-1')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all"
            >
              <span>{language === 'ta' ? 'கொள்முதல் சந்தை பார்க்க (பிரியா)' : 'Browse as Buyer (Priya)'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Problem Showcase: The Core Value Illustration */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden">
          <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Calculator className="w-4 h-4" />
                <span>{language === 'ta' ? 'மையப் பிரச்சனை விளக்கம்' : 'The Central FarmLink Problem Showcase'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1">
                {language === 'ta'
                  ? 'ஏன் வெறும் அலகு விலையை மட்டும் பார்க்கக் கூடாது?'
                  : 'Why Unit Price Alone Is Misleading'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                {language === 'ta'
                  ? 'உதாரணமாக 100 கிலோ தக்காளி விற்பனையை பாருங்கள். வாங்குபவர் B குறைந்த விலை தந்தாலும், குறைந்த செலவினால் விவசாயிக்கு அதிக நிகர வருவாய் தருகிறார்.'
                  : 'Consider a farmer selling 100 kg tomatoes. Even with a lower price per kg, Buyer B delivers higher net return due to lower selling expenses.'}
              </p>
            </div>

            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3 shrink-0 text-right">
              <span className="text-xs text-slate-400 block">{language === 'ta' ? 'விளைபொருள் அளவு' : 'Demo Quantity'}:</span>
              <div className="flex items-center gap-1.5 mt-0.5 justify-end">
                <input
                  type="number"
                  min="10"
                  max="5000"
                  step="10"
                  value={demoQty}
                  onChange={(e) => setDemoQty(Number(e.target.value) || 0)}
                  className="w-20 px-2 py-1 text-sm bg-slate-950 border border-slate-600 rounded text-right font-bold text-emerald-300 focus:outline-none"
                />
                <span className="text-xs font-bold text-slate-300">kg</span>
              </div>
            </div>
          </div>

          {/* Side by side comparison cards */}
          <div className="p-6 sm:p-8 grid md:grid-cols-2 gap-6 bg-slate-50/50">
            {/* Buyer A */}
            <div
              className={`rounded-xl border p-5 transition-all ${
                winner === 'A'
                  ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t('showcase.optionA', 'Option A')}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {t('showcase.buyerA', 'Buyer A (Higher Unit Price)')}
                  </h3>
                </div>
                {winner === 'A' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white">
                    {language === 'ta' ? 'சிறந்த வருவாய்' : 'Best Return'}
                  </span>
                )}
              </div>

              <div className="space-y-3 py-4 text-xs sm:text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">{t('term.offeredPrice', 'Offered Unit Price')}:</span>
                  <span className="font-bold text-slate-900 text-base">{formatINR(buyerAPrice)} / kg</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>
                    {language === 'ta' ? `மொத்த மதிப்பு (${demoQty} கிலோ):` : `Gross Total (${demoQty} kg):`}
                  </span>
                  <span className="font-semibold text-slate-800">{formatINR(calcA.grossTotal)}</span>
                </div>

                <div className="bg-rose-50/60 p-3 rounded-lg space-y-1.5 border border-rose-100 text-xs text-rose-900">
                  <div className="flex justify-between">
                    <span>{t('term.transportCost', 'Transportation Cost')}:</span>
                    <span className="font-semibold">−{formatINR(buyerATransport)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('term.packagingCost', 'Packaging Cost')}:</span>
                    <span className="font-semibold">−{formatINR(buyerAPackaging)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-rose-200 font-bold">
                    <span>{t('term.totalCosts', 'Total Selling Costs')}:</span>
                    <span>−{formatINR(calcA.totalSellingCosts)}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 text-white flex justify-between items-center">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-300">
                      {t('term.netReturn', 'Estimated Net Return')}
                    </div>
                    <div className="text-xs text-emerald-400">
                      ≈ {formatINR(calcA.netReturnPerUnit)}/kg {t('showcase.takeHome', 'take-home')}
                    </div>
                  </div>
                  <div className="text-xl font-black text-white">{formatINR(calcA.estimatedNetReturn)}</div>
                </div>
              </div>
            </div>

            {/* Buyer B */}
            <div
              className={`rounded-xl border p-5 transition-all ${
                winner === 'B'
                  ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t('showcase.optionB', 'Option B')}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {t('showcase.buyerB', 'Buyer B (Lower Unit Price, Low Costs)')}
                  </h3>
                </div>
                {winner === 'B' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    {language === 'ta' ? 'சிறந்த வருவாய்' : 'Best Return'}
                  </span>
                )}
              </div>

              <div className="space-y-3 py-4 text-xs sm:text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">{t('term.offeredPrice', 'Offered Unit Price')}:</span>
                  <span className="font-bold text-slate-900 text-base">{formatINR(buyerBPrice)} / kg</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>
                    {language === 'ta' ? `மொத்த மதிப்பு (${demoQty} கிலோ):` : `Gross Total (${demoQty} kg):`}
                  </span>
                  <span className="font-semibold text-slate-800">{formatINR(calcB.grossTotal)}</span>
                </div>

                <div className="bg-emerald-50/60 p-3 rounded-lg space-y-1.5 border border-emerald-100 text-xs text-emerald-950">
                  <div className="flex justify-between">
                    <span>{t('term.transportCost', 'Transportation Cost')}:</span>
                    <span className="font-semibold">−{formatINR(buyerBTransport)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('term.packagingCost', 'Packaging Cost')}:</span>
                    <span className="font-semibold">−{formatINR(buyerBPackaging)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-emerald-200 font-bold">
                    <span>{t('term.totalCosts', 'Total Selling Costs')}:</span>
                    <span>−{formatINR(calcB.totalSellingCosts)}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-800 text-white flex justify-between items-center">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-emerald-200">
                      {t('term.netReturn', 'Estimated Net Return')}
                    </div>
                    <div className="text-xs text-emerald-300">
                      ≈ {formatINR(calcB.netReturnPerUnit)}/kg {t('showcase.takeHome', 'take-home')}
                    </div>
                  </div>
                  <div className="text-xl font-black text-white">{formatINR(calcB.estimatedNetReturn)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Outcome Explanation Banner */}
          <div className="bg-emerald-100/60 border-t border-emerald-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs md:text-sm text-emerald-950">
            <div className="flex items-start gap-2.5">
              <Award className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong>
                  {language === 'ta'
                    ? `முடிவு: வாங்குபவர் ${winner} ₹${diff} அதிக நிகர வருவாய் தருகிறார்!`
                    : `Analysis: Buyer ${winner} delivers ₹${diff} more estimated net return to the farmer!`}
                </strong>
                <p className="text-xs text-emerald-800 mt-0.5">
                  {language === 'ta'
                    ? 'வாங்குபவர் A அதிக விலை (₹20/kg) தந்தாலும், அதிக போக்குவரத்து மற்றும் பேக்கிங் செலவுகளால் நிகர வருவாய் குறைகிறது.'
                    : 'Even though Buyer A has a higher unit price, their heavy transport & packaging deductions make Buyer B the superior choice for real income.'}
                </p>
              </div>
            </div>
          </div>

          {/* Mandatory Disclaimer */}
          <div className="p-4 bg-white border-t border-slate-100">
            <DisclaimerNotice />
          </div>
        </div>
      </section>

      {/* The 7-Step Guiding Principle: Inform -> Explain -> Compare -> Suggest -> Alert -> Guide -> Connect */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider font-mono">
            {language === 'ta' ? 'அணுகுமுறை கோட்பாடு' : 'Core Operating Architecture'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {language === 'ta' ? 'பார்ம்லிங்க் எவ்வாறு வழிகாட்டுகிறது?' : 'How FarmLink Empowers Decisions'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            {language === 'ta'
              ? 'பார்ம்லிங்க் தன்னிச்சையாக முடிவு எடுக்காது; தெளிவான தகவல்களை வழங்கி விவசாயி சுயமாக முடிவெடுக்க உதவுகிறது.'
              : 'Inform → Explain → Compare → Suggest → Alert → Guide → Connect. We make the next step understandable without deciding on the user’s behalf.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: '1. Inform & Explain',
              stepTa: '1. தகவல் & விளக்கம்',
              desc: 'Presents verified produce listings, benchmark mandi prices, quantities, and realistic logistics deductions in simple language.',
              descTa: 'விளைபொருள் விவரங்கள், மண்டி சந்தை விலை, மற்றும் போக்குவரத்து செலவுகளை எளிய தமிழில் வழங்குகிறது.',
              icon: <Calculator className="w-5 h-5 text-emerald-600" />,
            },
            {
              step: '2. Compare & Suggest',
              stepTa: '2. ஒப்பீடு & பரிந்துரை',
              desc: 'Ranks buyer offers strictly by numeric take-home net return, highlighting genuine value beyond displayed unit bids.',
              descTa: 'விலை வாய்ப்புகளை கழிவுகள் போக கையில் கிடைக்கும் நிகர தொகையை கணக்கிட்டு வரிசைப்படுத்துகிறது.',
              icon: <Scale className="w-5 h-5 text-blue-600" />,
            },
            {
              step: '3. Alert Urgency',
              stepTa: '3. அவசர காலக்கெடு எச்சரிக்கை',
              desc: 'Categorizes selling deadlines into High (≤1 day), Medium (2-3 days), and Normal (>3 days) based on farmer targets.',
              descTa: 'விவசாயி உள்ளிட்ட விற்பனை காலக்கெடுவை அடிப்படையாக கொண்டு 1 நாள், 2-3 நாட்கள் என எச்சரிக்கிறது.',
              icon: <Clock className="w-5 h-5 text-rose-600" />,
            },
            {
              step: '4. Guide & Connect',
              stepTa: '4. வழிகாட்டல் & தொடர்பு',
              desc: 'Provides practical cold storage, processing, and shandy alternatives if produce remains unsold or offers are low.',
              descTa: 'விளைபொருள் விற்கப்படாவிட்டால் குளிர்சாதன கிடங்கு, மதிப்புக்கூட்டுதல் போன்ற மாற்று வழிகளை காட்டுகிறது.',
              icon: <Layers className="w-5 h-5 text-purple-600" />,
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs space-y-2">
              <div className="p-2 w-fit rounded-lg bg-slate-50 border border-slate-100">{item.icon}</div>
              <h3 className="font-bold text-sm text-slate-900">{language === 'ta' ? item.stepTa : item.step}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{language === 'ta' ? item.descTa : item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Role Personas Quick Launch */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-900 rounded-2xl p-6 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl sm:text-2xl font-black">
              {language === 'ta' ? 'டெமோ பயணத்தை இப்போதே தொடங்கவும்' : 'Ready to evaluate the prototype?'}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed">
              {language === 'ta'
                ? 'விவசாயி முருகன் (தக்காளி) அல்லது மொத்த வியாபாரி பிரியா ஆகியோரின் உண்மையான பணிச்சூழலில் பார்ம்லிங்கை சோதிக்கவும்.'
                : 'Experience the complete workflow as Farmer Murugan Raman (Madurai) or Wholesale Buyer Priya. Compare offers, accept bids, or submit new produce.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/login"
              className="px-5 py-3 rounded-xl bg-white text-emerald-950 font-bold text-xs sm:text-sm hover:bg-emerald-50 transition-colors text-center shadow-md"
            >
              {language === 'ta' ? 'உள்நுழைக / பதிவு செய்க' : 'Sign In / Register'}
            </Link>
            <Link
              to="/roles"
              className="px-5 py-3 rounded-xl bg-emerald-800 text-emerald-100 font-bold text-xs sm:text-sm hover:bg-emerald-700 transition-colors text-center border border-emerald-600"
            >
              {language === 'ta' ? 'டெமோ பாத்திரங்கள்' : 'Demo Personas'}
            </Link>
            <Link
              to="/farmer"
              onClick={() => switchUser('farmer-1')}
              className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm hover:bg-emerald-500 transition-colors text-center"
            >
              {language === 'ta' ? 'விவசாயி டாஷ்போர்டு' : 'Farmer Dashboard'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
