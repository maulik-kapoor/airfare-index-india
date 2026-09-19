import React from 'react';
import { X, AlertTriangle, ExternalLink, ShieldCheck, Globe, Info } from 'lucide-react';

export default function TransitRequirementsModal({ isOpen, onClose, transitInfo }) {
  if (!isOpen || !transitInfo) return null;

  const isRoute1 = transitInfo.routeKey === 'DEL-AMS-MSP-YYZ' || transitInfo.routeDisplay?.includes('Minneapolis');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-amber-500/10 border-b border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Transit & Visa Requirements Advisory
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Official Itinerary Verification
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs text-slate-700">
          {/* Route & Stop Summary */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Itinerary Route</span>
              <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[11px] font-bold border border-sky-200">
                {transitInfo.stops} Intermediate Stops
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900">
              {transitInfo.routeDisplay}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {transitInfo.transits?.map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-1 rounded-md bg-white border border-slate-200 font-medium text-slate-800"
                >
                  <span className="mr-1.5">{t.flag}</span>
                  {t.label}
                </span>
              ))}
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 font-semibold text-emerald-800">
                🇨🇦 Toronto, Canada (Final Destination)
              </span>
            </div>
          </div>

          {/* Primary Mandatory Advisory Box */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-xs">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>OFFICIAL IMMIGRATION ADVISORY</span>
            </div>
            <p className="text-xs font-semibold leading-relaxed">
              "Transit requirements should be verified with the relevant official immigration authority before travel."
            </p>
            <p className="text-[11px] leading-relaxed text-amber-800/90">
              {transitInfo.message}
            </p>
          </div>

          {/* Detailed Transit Jurisdiction Breakdown */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center">
              <Globe className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
              Jurisdiction & Authority Breakdown
            </h3>

            {isRoute1 ? (
              /* Route 1: Netherlands & United States */
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center">
                      <span className="mr-1.5 text-base">🇳🇱</span> Amsterdam Schiphol (AMS) • Netherlands
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Transit 1</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <strong>Authority:</strong> Netherlands Immigration and Naturalisation Service (IND).
                    Transit requirements depend on the traveler's passport nationality, valid residence permits, and whether the traveler remains in the airside international transit zone without entering Schengen territory.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center">
                      <span className="mr-1.5 text-base">🇺🇸</span> Minneapolis-Saint Paul (MSP) • United States
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Transit 2</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <strong>Authority:</strong> U.S. Customs and Border Protection (CBP) / U.S. Department of State.
                    Travelers transiting through any U.S. airport generally must clear immigration and customs. Requirements depend on passport nationality, requiring either an approved ESTA (Visa Waiver Program) or a valid U.S. Transit Visa (C-1) or visitor visa.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center">
                      <span className="mr-1.5 text-base">🇨🇦</span> Toronto Pearson (YYZ) • Canada
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Final Destination</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <strong>Authority:</strong> Immigration, Refugees and Citizenship Canada (IRCC).
                    Travelers must hold a valid Canadian Visitor Visa or Electronic Travel Authorization (eTA) in accordance with Canadian border regulations.
                  </p>
                </div>
              </div>
            ) : (
              /* Route 2: France & Netherlands */
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center">
                      <span className="mr-1.5 text-base">🇫🇷</span> Paris Charles de Gaulle (CDG) • France
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Transit 1</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <strong>Authority:</strong> France-Visas / Ministère de l’Intérieur.
                    Transit conditions depend on passenger nationality, passport, residence status, and whether the traveler remains in the international transit area or transfers baggage.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center">
                      <span className="mr-1.5 text-base">🇳🇱</span> Amsterdam Schiphol (AMS) • Netherlands
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Transit 2</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <strong>Authority:</strong> Netherlands Immigration and Naturalisation Service (IND).
                    Multi-stop European itineraries involving internal European flights may require passing border control. Requirements depend on the traveler's specific nationality, passport, and applicable Schengen agreements.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center">
                      <span className="mr-1.5 text-base">🇨🇦</span> Toronto Pearson (YYZ) • Canada
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Final Destination</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <strong>Authority:</strong> Immigration, Refugees and Citizenship Canada (IRCC).
                    Travelers must hold a valid Canadian Visitor Visa or Electronic Travel Authorization (eTA) based on their citizenship before boarding.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Neutral Guideline Notice */}
          <div className="bg-slate-100 p-3.5 rounded-xl text-[11px] text-slate-600 leading-relaxed">
            <p className="font-semibold text-slate-800 mb-1">Important Passenger Responsibilities:</p>
            <p>
              Transit rules are subject to diplomatic policies and change without notice. Requirements must always be verified directly with the official immigration authority, embassy, or consulate corresponding to your passport and travel documents before booking and departure.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition active:scale-98 cursor-pointer"
          >
            Close Advisory
          </button>
        </div>
      </div>
    </div>
  );
}
