import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Globe, ShieldCheck, ChevronLeft, ExternalLink, HelpCircle, Plane } from 'lucide-react';
import TransitSection from '../components/TransitSection.jsx';

export default function TransitAdvisoryPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Back Link */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium transition cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to previous page</span>
      </button>

      {/* Hero / Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-3">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Dedicated Section • Predefined Routes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            International Transit & Visa Requirements
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Review detailed transit requirements, intermediate stop jurisdictions, and official immigration authorities for our predefined multi-stop itineraries.
          </p>
        </div>

        <div className="flex flex-col gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/search?from=DEL&to=YYZ&date=2026-10-15')}
            className="px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Plane className="w-4 h-4" />
            <span>Search Predefined DEL ➔ YYZ Flights</span>
          </button>
        </div>
      </div>

      {/* Main Dedicated Transit Section */}
      <TransitSection id="predefined-transit-section" />

      {/* Official Government Portals & Verified Authorities */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center">
            <Globe className="w-4 h-4 mr-2 text-sky-600" />
            Official Immigration Authority Directories
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Always verify your specific nationality and travel documentation directly through official government portals.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <span className="text-xl">🇳🇱</span>
            <h4 className="font-bold text-xs text-slate-900">Netherlands (IND)</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Immigration and Naturalisation Service for Amsterdam Airport Schiphol transfers.
            </p>
            <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200">
              Airport Transit Visa (ATV)
            </span>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <span className="text-xl">🇺🇸</span>
            <h4 className="font-bold text-xs text-slate-900">United States (CBP / ESTA)</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Customs and Border Protection rules for Minneapolis-Saint Paul international transfers.
            </p>
            <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200">
              ESTA / C-1 Transit Visa
            </span>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <span className="text-xl">🇫🇷</span>
            <h4 className="font-bold text-xs text-slate-900">France (France-Visas)</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Ministère de l’Intérieur guidance for Paris Charles de Gaulle international hub transfers.
            </p>
            <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200">
              Airport Transit Visa (ATV)
            </span>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <span className="text-xl">🇨🇦</span>
            <h4 className="font-bold text-xs text-slate-900">Canada (IRCC)</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Immigration, Refugees and Citizenship Canada entry protocols for Toronto Pearson arrival.
            </p>
            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200">
              Canadian Visitor Visa / eTA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
