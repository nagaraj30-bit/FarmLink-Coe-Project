import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDemoUser } from '../hooks/useDemoUser';
import { DisclaimerNotice } from '../components/common/DisclaimerNotice';
import { formatINR } from '../utils/formatters';

export const LandingPage: React.FC = () => {
  const { switchRole } = useDemoUser();
  const navigate = useNavigate();

  const handleContinueFarmer = () => {
    switchRole('farmer');
    navigate('/farmer');
  };

  const handleContinueBuyer = () => {
    switchRole('buyer');
    navigate('/marketplace');
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="bg-[#1b4332] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-[#143628] shadow-xs">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#143628] border border-emerald-600/50 text-emerald-100 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
            Digital agricultural marketplace
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Sell smarter. Earn better.
          </h1>

          <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            FarmLink helps small farmers compare buyer offers using <strong className="text-white font-bold">estimated take-home income</strong> after selling costs, rather than ranking offers only by gross price.
          </p>

          {/* Core role CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={handleContinueFarmer}
              className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md cursor-pointer focus-visible:ring-2 focus-visible:ring-white outline-hidden"
            >
              Continue as farmer
            </button>
            <button
              onClick={handleContinueBuyer}
              className="px-6 py-3 rounded-lg bg-[#143628] hover:bg-[#0f291e] text-white font-semibold text-sm border border-emerald-700/80 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-white outline-hidden"
            >
              Continue as buyer
            </button>
            <Link
              to="/marketplace"
              className="px-5 py-3 rounded-lg text-emerald-100 hover:text-white text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-white outline-hidden"
            >
              Browse marketplace →
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Core Innovation Showcase */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            Why gross price can be misleading
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            A higher price per unit does not always leave the farmer with more take-home income once transport, packaging, and handling are deducted.
          </p>
        </div>

        {/* Side by side comparison cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Offer A Card */}
          <div className="bg-white rounded-xl p-6 border-2 border-emerald-600 shadow-sm relative flex flex-col justify-between">
            <div className="absolute -top-3 right-6 bg-emerald-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
              <span>★</span> Best estimated return
            </div>

            <div>
              <div className="flex items-start justify-between pb-3 border-b border-stone-100">
                <div>
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Offer A</span>
                  <h3 className="text-lg font-bold text-stone-900">Local farmgate buyer</h3>
                  <div className="text-xs text-stone-500">Buyer brings mini-truck to farm gate</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-emerald-900">₹40 / kg</div>
                  <div className="text-xs text-stone-500">for 1,000 kg</div>
                </div>
              </div>

              {/* Math breakdown */}
              <div className="mt-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-stone-700 py-1 border-b border-stone-100">
                  <span>Gross offer (1,000 kg × ₹40):</span>
                  <span className="font-semibold text-stone-900">₹40,000</span>
                </div>
                <div className="space-y-1 text-stone-500 pl-2">
                  <div className="flex justify-between">
                    <span>− Transport cost:</span>
                    <span className="text-rose-700">−₹2,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>− Packaging cost:</span>
                    <span className="text-rose-700">−₹1,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>− Other selling costs:</span>
                    <span className="text-rose-700">−₹500</span>
                  </div>
                  <div className="flex justify-between font-semibold text-stone-700 pt-1">
                    <span>Total selling costs:</span>
                    <span className="text-rose-700">−₹3,500</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200 bg-emerald-50/60 -mx-6 -mb-6 p-6 rounded-b-xl">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs font-semibold text-emerald-950 uppercase">Estimated net return</div>
                  <div className="text-[11px] text-stone-500">₹40,000 − ₹3,500 costs</div>
                </div>
                <div className="text-2xl font-extrabold text-emerald-800">
                  {formatINR(36500)}
                </div>
              </div>
              <div className="text-xs text-emerald-800 font-medium mt-2 bg-emerald-100/70 p-2 rounded text-center">
                Net take-home: ~₹36.50 / kg
              </div>
            </div>
          </div>

          {/* Offer B Card */}
          <div className="bg-white rounded-xl p-6 border border-stone-300 shadow-sm relative flex flex-col justify-between opacity-95">
            <div>
              <div className="flex items-start justify-between pb-3 border-b border-stone-100">
                <div>
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Offer B</span>
                  <h3 className="text-lg font-bold text-stone-900">Distant city wholesaler</h3>
                  <div className="text-xs text-stone-500">Requires long-distance transport & crates</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-stone-700 line-through decoration-rose-400">
                    ₹45 / kg
                  </div>
                  <div className="text-xs text-stone-500">for 1,000 kg</div>
                </div>
              </div>

              {/* Math breakdown */}
              <div className="mt-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-stone-700 py-1 border-b border-stone-100">
                  <span>Gross offer (1,000 kg × ₹45):</span>
                  <span className="font-semibold text-stone-900">₹45,000</span>
                </div>
                <div className="space-y-1 text-stone-500 pl-2">
                  <div className="flex justify-between">
                    <span>− Transport cost:</span>
                    <span className="text-rose-700">−₹8,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>− Packaging cost:</span>
                    <span className="text-rose-700">−₹2,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span>− Other selling costs:</span>
                    <span className="text-rose-700">−₹1,000</span>
                  </div>
                  <div className="flex justify-between font-semibold text-stone-700 pt-1">
                    <span>Total selling costs:</span>
                    <span className="text-rose-700">−₹11,500</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200 bg-stone-50 -mx-6 -mb-6 p-6 rounded-b-xl">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs font-semibold text-stone-700 uppercase">Estimated net return</div>
                  <div className="text-[11px] text-stone-500">₹45,000 − ₹11,500 costs</div>
                </div>
                <div className="text-2xl font-bold text-stone-700">
                  {formatINR(33500)}
                </div>
              </div>
              <div className="text-xs text-stone-600 mt-2 bg-stone-200/60 p-2 rounded text-center">
                Net take-home: ~₹33.50 / kg (<span className="text-rose-700 font-semibold">₹3,000 lower</span> than Offer A)
              </div>
            </div>
          </div>
        </div>

        {/* Explanation callout */}
        <div className="mt-6 bg-amber-50/70 border border-amber-200 rounded-lg p-4 text-xs sm:text-sm text-stone-700">
          <p className="font-semibold text-amber-900">
            The Takeaway:
          </p>
          <p className="mt-1 leading-relaxed">
            Even though Offer B offers a higher gross price of ₹45/kg (₹5/kg higher than Offer A), its heavy transport and packaging deductions leave the farmer with <strong className="text-stone-900">₹33,500</strong>. Offer A, at ₹40/kg, nets <strong className="text-emerald-900">₹36,500</strong>—providing an extra <strong className="text-emerald-900">₹3,000 in estimated take-home income</strong>.
          </p>
        </div>

        <div className="mt-4">
          <DisclaimerNotice />
        </div>
      </section>

      {/* Two Pillars Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl border border-stone-200">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-4">
              ₹
            </div>
            <h3 className="text-lg font-bold text-stone-900">Net-return comparison</h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
              Every buyer offer is calculated as:
            </p>
            <div className="bg-stone-50 p-2.5 rounded border border-stone-200 text-xs font-mono text-stone-800 my-3">
              Estimated Net Return = Total Offer Amount − Transport Cost − Packaging Cost − Other Costs
            </div>
            <p className="text-xs text-stone-500">
              Never hide deductions. Transparent math allows small farmers to evaluate buyers objectively.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-stone-200">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold mb-4">
              ⏱
            </div>
            <h3 className="text-lg font-bold text-stone-900">Selling deadline prioritization</h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
              Produce is prioritized according to the farmer&apos;s stated selling deadline:
            </p>
            <ul className="text-xs text-stone-600 space-y-1.5 my-3 list-disc pl-5">
              <li><strong>High urgency:</strong> 1 day or less remaining</li>
              <li><strong>Medium urgency:</strong> 2 to 3 days remaining</li>
              <li><strong>Normal urgency:</strong> More than 3 days remaining</li>
            </ul>
            <p className="text-xs text-stone-500">
              Urgency reflects the farmer&apos;s scheduling needs. It is not an automated prediction of crop spoilage.
            </p>
          </div>
        </div>
      </section>

      {/* Getting Started Call to Action */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-stone-100 rounded-xl p-8 border border-stone-200">
        <h3 className="text-xl font-bold text-stone-900">Explore the prototype</h3>
        <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-md mx-auto">
          Switch between farmer and buyer profiles to test adding produce, placing buyer offers, and comparing take-home returns.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/roles"
            className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold rounded-md shadow-xs transition-colors"
          >
            Select demo profile
          </Link>
          <Link
            to="/marketplace"
            className="px-5 py-2.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 text-sm font-semibold rounded-md transition-colors"
          >
            Browse produce listings
          </Link>
        </div>
      </section>
    </div>
  );
};
