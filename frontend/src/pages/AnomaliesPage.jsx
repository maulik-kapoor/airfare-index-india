import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Filter,
  ShieldAlert,
  ArrowRight,
  Clock,
  Plane,
  Info,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

export default function AnomaliesPage() {
  const navigate = useNavigate();
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedRoute, setSelectedRoute] = useState('ALL');
  const [selectedCause, setSelectedCause] = useState('ALL');

  useEffect(() => {
    async function loadAnomalies() {
      try {
        const res = await api.get('/analytics/anomalies');
        if (res.success) {
          setAnomalies(res.data);
        }
      } catch (err) {
        console.error('Failed to load anomalies:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnomalies();
  }, []);

  const availableRoutes = Array.from(new Set(anomalies.map((a) => a.route)));
  const availableCauses = Array.from(
    new Set(anomalies.map((a) => a.primaryCause).filter(Boolean))
  );

  const filteredAnomalies = anomalies.filter((a) => {
    if (selectedType !== 'ALL' && a.anomalyType !== selectedType) return false;
    if (selectedRoute !== 'ALL' && a.route !== selectedRoute) return false;
    if (selectedCause !== 'ALL' && a.primaryCause !== selectedCause) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center space-x-2 text-amber-600 text-xs font-semibold uppercase tracking-wider mb-1">
          <AlertTriangle className="w-4 h-4" />
          <span>Price Monitoring & Root-Cause Surveillance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Airfare Price Anomalies & Surge Analysis
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          Statistical anomaly detection flagging unusual price hikes and sudden fare drops, paired with real-world aviation market drivers explaining exactly why each price movement occurred.
        </p>
      </div>

      {/* Root Cause Education / Market Drivers Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs shadow-2xs">
          <div className="flex items-center space-x-2 font-bold text-amber-900 mb-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Last-Minute Yield Curves</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Airlines close low-cost RBD buckets (X, O, Q) 0–5 days out. Only full-fare Economy (Y-class) or Business seats remain, causing spikes up to <strong>+120%</strong>.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs shadow-2xs">
          <div className="flex items-center space-x-2 font-bold text-rose-900 mb-1.5">
            <Plane className="w-4 h-4 text-rose-600" />
            <span>Weekend & Tourist Surges</span>
          </div>
          <p className="text-[11px] text-rose-800 leading-relaxed">
            Friday evening and Sunday flights collide with leisure holiday getaways (e.g. Goa, Jaipur), driving sustained non-elastic demand spikes.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 text-xs shadow-2xs">
          <div className="flex items-center space-x-2 font-bold text-sky-900 mb-1.5">
            <ShieldAlert className="w-4 h-4 text-sky-600" />
            <span>Route Capacity Bottlenecks</span>
          </div>
          <p className="text-[11px] text-sky-800 leading-relaxed">
            Tier-2 sectors with limited non-stop flight slots (like PNQ-DEL, CCU-DEL) reach &gt;85% load factor quickly, triggering automated revenue step-ups.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs shadow-2xs">
          <div className="flex items-center space-x-2 font-bold text-emerald-900 mb-1.5">
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            <span>Early Bird Flash Drops</span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            Airlines release discounted promotional seat quotas 60+ days in advance to build guaranteed base load factors and stimulate cash flow.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs text-slate-700 font-semibold">
          <Filter className="w-4 h-4 text-sky-600" />
          <span>Filter Alerts:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div>
            <span className="text-slate-500 mr-1.5 font-medium">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500 cursor-pointer font-medium"
            >
              <option value="ALL">All Alerts ({anomalies.length})</option>
              <option value="SURGE_SPIKE">Surge Spikes Only</option>
              <option value="FLASH_PRICE_DROP">Price Drops Only</option>
            </select>
          </div>

          <div>
            <span className="text-slate-500 mr-1.5 font-medium">Route:</span>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500 cursor-pointer font-medium"
            >
              <option value="ALL">All Routes</option>
              {availableRoutes.map((rt) => (
                <option key={rt} value={rt}>
                  {rt}
                </option>
              ))}
            </select>
          </div>

          {availableCauses.length > 0 && (
            <div>
              <span className="text-slate-500 mr-1.5 font-medium">Root Cause:</span>
              <select
                value={selectedCause}
                onChange={(e) => setSelectedCause(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500 cursor-pointer font-medium"
              >
                <option value="ALL">All Causes</option>
                {availableCauses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(selectedType !== 'ALL' || selectedRoute !== 'ALL' || selectedCause !== 'ALL') && (
            <button
              onClick={() => {
                setSelectedType('ALL');
                setSelectedRoute('ALL');
                setSelectedCause('ALL');
              }}
              className="text-[11px] text-sky-600 font-semibold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Anomalies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAnomalies.map((a) => {
          const isSurge = a.anomalyType === 'SURGE_SPIKE';
          const origin = a.route?.split('-')[0] || 'DEL';
          const destination = a.route?.split('-')[1] || 'BOM';

          return (
            <div
              key={a.id}
              className={`p-5 rounded-2xl border transition bg-white shadow-xs flex flex-col justify-between ${
                isSurge
                  ? 'border-amber-200 hover:border-amber-400 hover:shadow-md'
                  : 'border-emerald-200 hover:border-emerald-400 hover:shadow-md'
              }`}
            >
              <div>
                {/* Card Top: Route, Carrier, and Anomaly Badge */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-bold text-slate-900">{a.route}</span>
                      <span className="text-xs font-semibold text-slate-600">({a.airline})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Flight: {a.flightNumber} • via <span className="font-medium text-slate-700">{a.sourceOta}</span>
                    </p>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${
                      isSurge
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {isSurge ? `+${a.percentChange}% SURGE` : `${a.percentChange}% DROP`}
                  </span>
                </div>

                {/* Root Cause Badge */}
                <div className="mb-3">
                  <span
                    className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                      isSurge
                        ? 'bg-amber-50 text-amber-900 border-amber-300'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    }`}
                  >
                    {a.causeBadge || (isSurge ? '⚡ Dynamic Yield Spike' : '🎁 Promotional Allocation')}
                  </span>
                </div>

                {/* Price Comparison Block */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 mb-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Historical Sector Median:</span>
                    <span className="font-semibold text-slate-700">
                      ₹{a.previousMedianFare?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-700 font-semibold">Observed Live Fare:</span>
                    <span className={`text-xl font-black ${isSurge ? 'text-rose-600' : 'text-emerald-700'}`}>
                      ₹{a.currentFare?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200 flex justify-between text-[11px]">
                    <span className="text-slate-500">Statistical Z-Score:</span>
                    <span className="font-mono font-semibold text-slate-700">
                      {a.zScore > 0 ? `+${a.zScore}` : a.zScore}
                    </span>
                  </div>
                </div>

                {/* WHY THIS HIKE / DROP OCCURRED (Root-Cause Driver Breakdown) */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 mb-4">
                  <div className="flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-2">
                    <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
                    <span>{isSurge ? 'Why This Price Hike Occurred:' : 'Why This Price Drop Occurred:'}</span>
                  </div>

                  <div className="space-y-2">
                    {a.drivers && a.drivers.length > 0 ? (
                      a.drivers.map((d, i) => (
                        <div key={i} className="text-[11px] leading-relaxed">
                          <span className="font-bold text-slate-800">• {d.title}: </span>
                          <span className="text-slate-600">{d.desc}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-600 leading-relaxed">{a.reason}</p>
                    )}
                  </div>
                </div>

                {/* Actionable Passenger Advice */}
                <div
                  className={`p-3 rounded-xl border text-[11px] leading-relaxed mb-4 flex items-start space-x-2 ${
                    isSurge
                      ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                      : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <span className="font-bold block mb-0.5">
                      {isSurge ? 'Avoidance Strategy' : 'Buying Recommendation'}
                    </span>
                    <p>{a.recommendation || (isSurge ? 'Shift travel by 1–2 days to avoid surge pricing.' : 'Lock in this fare before allocation closes.')}</p>
                  </div>
                </div>
              </div>

              {/* Card Footer: Metadata & Quick Search */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <div>
                  <span className="block font-semibold text-slate-700">
                    {a.bookingWindowDays} days prior • {a.dayOfWeek || 'Departure'}
                  </span>
                  <span className="text-[10px] text-slate-400">Date: {a.travelDate}</span>
                </div>

                <button
                  onClick={() =>
                    navigate(
                      `/search?from=${origin}&to=${destination}&date=${a.travelDate || '2026-10-15'}&pax=1&cabin=economy`
                    )
                  }
                  className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-xs transition flex items-center space-x-1"
                >
                  <span>Search Route</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
