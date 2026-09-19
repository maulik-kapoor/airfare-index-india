import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Plane, ExternalLink, ShieldCheck, ArrowRight, Globe, Info } from 'lucide-react';
import { PREDEFINED_TRANSIT_DATA } from '../services/transitService.js';
import TransitRequirementsModal from './TransitRequirementsModal.jsx';

export default function TransitSection({ id = 'transit-section' }) {
  const navigate = useNavigate();
  const [selectedTransitInfo, setSelectedTransitInfo] = useState(null);

  const route1 = PREDEFINED_TRANSIT_DATA['DEL-AMS-MSP-YYZ'];
  const route2 = PREDEFINED_TRANSIT_DATA['DEL-CDG-AMS-YYZ'];

  return (
    <section id={id} className="py-2">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Predefined Multi-Stop Itineraries</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Transit & Visa Requirement Advisory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Predefined international transit routes with multi-jurisdiction immigration guidance
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Official Authority Verification Available</span>
        </div>
      </div>

      {/* Mandatory Official Notice Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-950 flex items-start space-x-3">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold uppercase tracking-wider text-[11px] text-amber-900">Official Requirement Notice</p>
          <p className="font-medium leading-relaxed">
            "Transit requirements should be verified with the relevant official immigration authority before travel."
          </p>
        </div>
      </div>

      {/* Route Cards Grid (Strictly for the 2 Predefined Routes) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROUTE 1 CARD */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-amber-300 hover:shadow-md transition flex flex-col justify-between">
          <div>
            {/* Badge & Stops */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>⚠ TRANSIT INFORMATION</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                ROUTE 1 • 2 Stops
              </span>
            </div>

            {/* Flight Path Graphic */}
            <div className="mb-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Route:</div>
              <div className="text-base font-bold text-slate-900 flex items-center flex-wrap gap-1.5">
                <span>Delhi</span>
                <span className="text-slate-400">→</span>
                <span className="text-sky-700">Amsterdam</span>
                <span className="text-slate-400">→</span>
                <span className="text-sky-700">Minneapolis</span>
                <span className="text-slate-400">→</span>
                <span className="text-slate-900">Toronto</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">DEL → AMS → MSP → YYZ</p>
            </div>

            {/* Stops */}
            <div className="mb-4 text-xs">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] block mb-1">Stops:</span>
              <span className="font-semibold text-slate-800 text-sm">2</span>
            </div>

            {/* Transit Countries */}
            <div className="mb-4 text-xs">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] block mb-1.5">Transit:</span>
              <div className="space-y-1.5">
                {route1.transits.map((t, idx) => (
                  <div key={idx} className="flex items-center font-semibold text-slate-800 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    <span className="mr-2 text-base">{t.flag}</span>
                    <span>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 mb-5 text-xs text-slate-700 leading-relaxed">
              "{route1.message}"
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedTransitInfo(route1)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition shadow-2xs flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Check Transit Requirements</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/flights/predefined_del_ams_msp_yyz')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition active:scale-98 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Book Flight</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ROUTE 2 CARD */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-amber-300 hover:shadow-md transition flex flex-col justify-between">
          <div>
            {/* Badge & Stops */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>⚠ TRANSIT INFORMATION</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                ROUTE 2 • 2 Stops
              </span>
            </div>

            {/* Flight Path Graphic */}
            <div className="mb-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Route:</div>
              <div className="text-base font-bold text-slate-900 flex items-center flex-wrap gap-1.5">
                <span>Delhi</span>
                <span className="text-slate-400">→</span>
                <span className="text-sky-700">Paris</span>
                <span className="text-slate-400">→</span>
                <span className="text-sky-700">Amsterdam</span>
                <span className="text-slate-400">→</span>
                <span className="text-slate-900">Toronto</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">DEL → CDG → AMS → YYZ</p>
            </div>

            {/* Stops */}
            <div className="mb-4 text-xs">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] block mb-1">Stops:</span>
              <span className="font-semibold text-slate-800 text-sm">2</span>
            </div>

            {/* Transit Countries */}
            <div className="mb-4 text-xs">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] block mb-1.5">Transit:</span>
              <div className="space-y-1.5">
                {route2.transits.map((t, idx) => (
                  <div key={idx} className="flex items-center font-semibold text-slate-800 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    <span className="mr-2 text-base">{t.flag}</span>
                    <span>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 mb-5 text-xs text-slate-700 leading-relaxed">
              "{route2.message}"
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedTransitInfo(route2)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition shadow-2xs flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Check Transit Requirements</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/flights/predefined_del_cdg_ams_yyz')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition active:scale-98 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Book Flight</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Official Advisory Modal */}
      {selectedTransitInfo && (
        <TransitRequirementsModal
          isOpen={Boolean(selectedTransitInfo)}
          onClose={() => setSelectedTransitInfo(null)}
          transitInfo={selectedTransitInfo}
        />
      )}
    </section>
  );
}
