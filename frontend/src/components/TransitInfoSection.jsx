import React, { useState } from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import TransitRequirementsModal from './TransitRequirementsModal.jsx';

export default function TransitInfoSection({ transitInfo, compact = false }) {
  const [showModal, setShowModal] = useState(false);

  if (!transitInfo) return null;

  return (
    <>
      <div className={`rounded-xl border border-amber-300 bg-amber-50/70 p-4 text-slate-800 ${compact ? 'text-xs my-3' : 'text-xs my-4'}`}>
        {/* Header Badge */}
        <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs uppercase tracking-wider mb-2.5 pb-2 border-b border-amber-200/80">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>⚠ TRANSIT INFORMATION</span>
        </div>

        {/* Route */}
        <div className="mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Route:</span>
          <span className="text-xs font-bold text-slate-900">{transitInfo.routeDisplay}</span>
        </div>

        {/* Stops */}
        <div className="mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Stops:</span>
          <span className="text-xs font-semibold text-slate-900">{transitInfo.stops}</span>
        </div>

        {/* Transit */}
        <div className="mb-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Transit:</span>
          <div className="space-y-1">
            {transitInfo.transits?.map((t, idx) => (
              <div key={idx} className="text-xs font-semibold text-slate-800 flex items-center">
                <span className="mr-1.5 text-sm">{t.flag}</span>
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="mb-3.5">
          <p className="text-xs text-slate-700 leading-relaxed font-normal">
            "{transitInfo.message}"
          </p>
        </div>

        {/* Button */}
        <div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <span>Check Transit Requirements</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Official Advisory Modal */}
      <TransitRequirementsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        transitInfo={transitInfo}
      />
    </>
  );
}
