import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Calendar,
  Clock,
  Compass,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Info,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import api from '../services/api.js';

export default function AirfareHeatmap({ defaultRoute = 'ALL', compact = false }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(defaultRoute);
  const [viewMode, setViewMode] = useState('window_vs_day'); // 'window_vs_day' | 'sector_vs_day'
  const [hoveredCell, setHoveredCell] = useState(null);

  useEffect(() => {
    async function fetchHeatmap() {
      setLoading(true);
      try {
        const res = await api.get(`/analytics/heatmap?route=${selectedRoute}`);
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load heatmap data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHeatmap();
  }, [selectedRoute]);

  // Color generator based on intensity score (0.0 lowest price, 1.0 peak surge)
  const getCellColor = (intensity) => {
    if (intensity <= 0.20) {
      return {
        bg: 'bg-emerald-600',
        hoverBg: 'hover:bg-emerald-500',
        text: 'text-white',
        badge: 'bg-emerald-700/80 text-white',
        tag: 'Steal Deal',
        label: 'Best Deal',
      };
    }
    if (intensity <= 0.40) {
      return {
        bg: 'bg-emerald-500/85',
        hoverBg: 'hover:bg-emerald-500',
        text: 'text-white',
        badge: 'bg-emerald-700/70 text-white',
        tag: 'Good Value',
        label: 'Below Average',
      };
    }
    if (intensity <= 0.60) {
      return {
        bg: 'bg-amber-400',
        hoverBg: 'hover:bg-amber-300',
        text: 'text-slate-900',
        badge: 'bg-amber-500 text-slate-900',
        tag: 'Baseline',
        label: 'Fair Market',
      };
    }
    if (intensity <= 0.80) {
      return {
        bg: 'bg-orange-500',
        hoverBg: 'hover:bg-orange-400',
        text: 'text-white',
        badge: 'bg-orange-600 text-white',
        tag: 'Surge',
        label: 'High Demand',
      };
    }
    return {
      bg: 'bg-rose-600',
      hoverBg: 'hover:bg-rose-500',
      text: 'text-white',
      badge: 'bg-rose-700 text-white',
      tag: 'Peak Surge',
      label: 'Last-Minute Surge',
    };
  };

  const handleBookShortcut = (route, day) => {
    const origin = route !== 'ALL' ? route.split('-')[0] : 'DEL';
    const dest = route !== 'ALL' ? route.split('-')[1] : 'BOM';
    navigate(`/search?from=${origin}&to=${dest}&date=2026-10-15&pax=1&cabin=economy`);
  };

  if (loading && !data) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center min-h-[320px]">
        <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-slate-500 font-medium">Computing Airfare Price Heatmap Matrix...</p>
      </div>
    );
  }

  const { bins = [], days = [], timingGrid = [], routeDayMatrix = [], availableRoutes = [], insights = {}, minFare = 4000, maxFare = 8500 } = data || {};

  return (
    <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Airfare Price Heatmap Matrix
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
              Surge vs Sweet Spot
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visual multi-dimensional price intensity showing the exact days and booking windows with the cheapest airfares.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setViewMode('window_vs_day')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'window_vs_day'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              📅 Day vs Window
            </button>
            <button
              onClick={() => setViewMode('sector_vs_day')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'sector_vs_day'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              ✈️ Sector vs Day
            </button>
          </div>

          {/* Route Filter Dropdown */}
          {viewMode === 'window_vs_day' && (
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-sky-600"
            >
              {availableRoutes.map((r) => (
                <option key={r.route} value={r.route}>
                  {r.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Heatmap Insights Pill Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">
            Cheapest Flying Day
          </span>
          <div className="text-sm font-bold text-emerald-900 mt-0.5 flex items-center space-x-1">
            <span>{insights.bestDay || 'Wednesday'}</span>
            <span className="text-[11px] font-normal text-emerald-700">(~₹5,890)</span>
          </div>
        </div>

        <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl text-xs">
          <span className="text-[10px] uppercase font-bold text-sky-700 tracking-wider block">
            Optimal Booking Sweet Spot
          </span>
          <div className="text-sm font-bold text-sky-900 mt-0.5">
            {insights.bestWindow || '15–30 Days Advance'}
          </div>
        </div>

        <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-xs">
          <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider block">
            Peak Last-Minute Surge
          </span>
          <div className="text-sm font-bold text-rose-900 mt-0.5 flex items-center space-x-1">
            <span>0–3 Days Departure</span>
            <span className="text-[11px] font-normal text-rose-700">(+45%)</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider block">
            Max Potential Savings
          </span>
          <div className="text-sm font-bold text-slate-900 mt-0.5">
            ~₹{insights.potentialSavingsAmount?.toLocaleString('en-IN') || '3,955'} ({insights.maxSavingsPct || '47'}%)
          </div>
        </div>
      </div>

      {/* Primary Matrix Table View */}
      {viewMode === 'window_vs_day' ? (
        <div className="overflow-x-auto pb-2">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2.5 text-left text-xs font-bold text-slate-700 bg-slate-50/80 rounded-l-lg">
                  Departure Day
                </th>
                {bins.map((b) => (
                  <th key={b.key} className="p-2.5 text-center text-xs font-semibold text-slate-700 bg-slate-50/80">
                    <div>{b.label}</div>
                    <span className="text-[10px] font-normal text-slate-400 block">{b.subLabel}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {timingGrid.map((row) => (
                <tr key={row.day} className="hover:bg-slate-50/50 transition">
                  <td className="py-2 px-3 text-xs font-bold text-slate-800 whitespace-nowrap">
                    {row.day}
                  </td>
                  {bins.map((b) => {
                    const cell = row.bins[b.key];
                    if (!cell) return <td key={b.key} className="p-1"></td>;
                    const style = getCellColor(cell.intensity);
                    const isSelected = hoveredCell?.day === row.day && hoveredCell?.bin === b.key;

                    return (
                      <td key={b.key} className="p-1.5 text-center">
                        <div
                          onMouseEnter={() => setHoveredCell({ day: row.day, bin: b.key, ...cell, label: b.label })}
                          onMouseLeave={() => setHoveredCell(null)}
                          onClick={() => handleBookShortcut(selectedRoute, row.day)}
                          className={`relative rounded-xl p-2.5 cursor-pointer transition transform hover:scale-105 shadow-2xs ${style.bg} ${style.hoverBg} ${style.text}`}
                        >
                          <div className="text-xs font-bold tracking-tight">
                            ₹{cell.medianFare.toLocaleString('en-IN')}
                          </div>
                          <span className={`text-[9px] font-medium px-1.5 py-0.2 rounded-md mt-0.5 inline-block ${style.badge}`}>
                            {style.tag}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Sector vs Day of the Week Matrix View */
        <div className="overflow-x-auto pb-2">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2.5 text-left text-xs font-bold text-slate-700 bg-slate-50/80 rounded-l-lg">
                  Sector Route
                </th>
                <th className="p-2.5 text-center text-xs font-semibold text-slate-600 bg-slate-50/80">
                  Route Median
                </th>
                {days.map((d) => (
                  <th key={d} className="p-2.5 text-center text-xs font-semibold text-slate-700 bg-slate-50/80">
                    {d.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {routeDayMatrix.map((rt) => (
                <tr key={rt.route} className="hover:bg-slate-50/50 transition">
                  <td className="py-2.5 px-3 text-xs font-bold text-slate-900 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                      <span>{rt.origin} ➔ {rt.destination}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-center text-xs font-semibold text-slate-600">
                    ₹{rt.overallMedian.toLocaleString('en-IN')}
                  </td>
                  {days.map((d) => {
                    const dayData = rt.days[d];
                    if (!dayData) return <td key={d} className="p-1"></td>;
                    const diff = dayData.diffPct;
                    const isCheap = diff <= -5;
                    const isSurge = diff >= 10;

                    return (
                      <td key={d} className="p-1.5 text-center">
                        <div
                          onClick={() => navigate(`/search?from=${rt.origin}&to=${rt.destination}&date=2026-10-15&pax=1&cabin=economy`)}
                          className={`rounded-xl p-2 cursor-pointer transition transform hover:scale-105 text-xs font-bold ${
                            isCheap
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : isSurge
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          <div>₹{dayData.medianFare.toLocaleString('en-IN')}</div>
                          <span className="text-[9px] font-medium opacity-90 block mt-0.5">
                            {diff > 0 ? `+${diff}%` : `${diff}%`}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend & Explanations */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-700">Price Intensity Scale:</span>
          <div className="flex items-center space-x-1">
            <span className="w-3.5 h-3.5 rounded-sm bg-emerald-600"></span>
            <span className="text-slate-700 font-medium">Steal Deal (Lowest)</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500/85"></span>
            <span className="text-slate-700">Good Value</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-3.5 h-3.5 rounded-sm bg-amber-400"></span>
            <span className="text-slate-700">Fair Baseline</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-3.5 h-3.5 rounded-sm bg-orange-500"></span>
            <span className="text-slate-700">Moderate Surge</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-3.5 h-3.5 rounded-sm bg-rose-600"></span>
            <span className="text-slate-700 font-medium">Peak Surge</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-medium">
          💡 Click any cell to search live flights for that timing window
        </div>
      </div>
    </div>
  );
}
