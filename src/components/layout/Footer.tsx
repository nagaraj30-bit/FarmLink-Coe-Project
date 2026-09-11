import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                FL
              </div>
              <span className="font-bold text-white text-base">FarmLink</span>
            </div>
            <p className="text-xs text-stone-400 mt-2 font-medium">
              Sell smarter. Earn better.
            </p>
            <p className="text-xs text-stone-400 mt-2 leading-relaxed">
              FarmLink is a digital agricultural marketplace that helps small farmers compare buyer offers using estimated take-home income after selling costs, rather than ranking offers only by gross price.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">
              Prototype navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="text-stone-400 hover:text-white transition-colors">
                  Overview & demonstration
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="text-stone-400 hover:text-white transition-colors">
                  Buyer marketplace
                </Link>
              </li>
              <li>
                <Link to="/farmer" className="text-stone-400 hover:text-white transition-colors">
                  Farmer dashboard
                </Link>
              </li>
              <li>
                <Link to="/roles" className="text-stone-400 hover:text-white transition-colors">
                  Demo profiles & role switcher
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">
              Core operating principles
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              <strong>Stated selling deadline:</strong> Produce urgency is derived solely from the farmer&apos;s entered deadline. It does not predict biological spoilage.
            </p>
            <p className="text-xs text-stone-400 leading-relaxed mt-2">
              <strong>Estimated net return:</strong> Calculated from buyer offer prices minus entered transport, packaging, and handling costs.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3">
          <p>
            FarmLink Prototype — Phase 1 (First 35%).
          </p>
          <div className="bg-stone-800/80 px-3 py-1.5 rounded text-[11px] text-stone-400 border border-stone-700">
            Estimated net return, based on entered costs — not a guaranteed profit.
          </div>
        </div>
      </div>
    </footer>
  );
};
