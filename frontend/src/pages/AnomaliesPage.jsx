import React, { useEffect, useState } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Filter, ShieldAlert, ArrowRight, Clock, Plane } from 'lucide-react';
import api from '../services/api.js';

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedRoute, setSelectedRoute] = useState('ALL');

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

  const filteredAnomalies = anomalies.filter((a) => {
    if (selectedType !== 'ALL' && a.anomalyType !== selectedType) return false;
    if (selectedRoute !== 'ALL' && a.route !== selectedRoute) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center space-x-2 text-amber-600 text-xs font-semibold uppercase tracking-wider mb-1">
          <AlertTriangle className="w-4 h-4" />
          <span>Price Monitoring</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Price Anomalies & Outliers
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Flags sudden surge spikes or unexpected price drops compared against historical sector medians
        </p>
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
                <option key={rt} value={rt}>{rt}</option>
              ))}
            </select>
          </div>

          {(selectedType !== 'ALL' || selectedRoute !== 'ALL') && (
            <button
              onClick={() => {
                setSelectedType('ALL');
                setSelectedRoute('ALL');
              }}
              className="text-[11px] text-sky-600 font-semibold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Anomalies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAnomalies.map((a) => {
          const isSurge = a.anomalyType === 'SURGE_SPIKE';
          return (
            <div
              key={a.id}
              className={`p-5 rounded-2xl border transition bg-white shadow-xs ${
                isSurge ? 'border-amber-200 hover:border-amber-300' : 'border-emerald-200 hover:border-emerald-300'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-bold text-slate-900">{a.route}</span>
                    <span className="text-xs text-slate-500">({a.airline})</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Flight: {a.flightNumber} • via {a.sourceOta}
                  </p>
                </div>

                <span
                  className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${
                    isSurge
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {isSurge ? `+${a.percentChange}% SURGE` : `${a.percentChange}% DROP`}
                </span>
              </div>

              {/* Price Comparison Block */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 mb-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Historical Median:</span>
                  <span className="font-semibold text-slate-700">₹{a.previousMedianFare?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-600 font-semibold">Observed Fare:</span>
                  <span className={`text-xl font-black ${isSurge ? 'text-amber-700' : 'text-emerald-700'}`}>
                    ₹{a.currentFare?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px]">
                  <span className="text-slate-500">Z-Score Deviation:</span>
                  <span className="font-mono font-semibold text-slate-700">{a.zScore}</span>
                </div>
              </div>

              {/* Data-Driven Reason */}
              <div className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Statistical Explanation:
                </span>
                <p className="text-[11px] text-slate-700">{a.reason}</p>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>Window: {a.bookingWindowDays} days prior</span>
                <span>Travel Date: {a.travelDate}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
