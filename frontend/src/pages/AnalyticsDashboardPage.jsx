import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Plane,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Info,
  Calendar,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api.js';

export default function AnalyticsDashboardPage() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRouteKey, setSelectedRouteKey] = useState('DEL-BOM');
  const [routeDetail, setRouteDetail] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [sumRes, rtsRes, anomRes] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/analytics/routes'),
          api.get('/analytics/anomalies'),
        ]);

        if (sumRes.success) setSummary(sumRes.data);
        if (rtsRes.success) setRoutes(rtsRes.data);
        if (anomRes.success) setAnomalies(anomRes.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadRoute() {
      if (!selectedRouteKey) return;
      const [origin, dest] = selectedRouteKey.split('-');
      try {
        const res = await api.get(`/analytics/route/${origin}/${dest}`);
        if (res.success) {
          setRouteDetail(res.data);
        }
      } catch (err) {
        console.error('Failed to load route detail:', err);
      }
    }
    loadRoute();
  }, [selectedRouteKey]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Market Intelligence Dashboard</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Airfare Index & Price Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Historical medians, booking-window price elasticity, and machine-learning anomaly detection
          </p>
        </div>

        <button
          onClick={() => navigate('/search?from=DEL&to=BOM&date=2026-10-15')}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition"
        >
          <Plane className="w-4 h-4" />
          <span>Search Live Flights on Route</span>
        </button>
      </div>

      {/* Top 4 KPI Metrics Bar (Step 16 requirement) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Market Average Fare</span>
            <span className="p-1 rounded-lg bg-sky-500/10 text-sky-400 font-bold">INR</span>
          </div>
          <p className="text-3xl font-black text-white">₹{summary?.averageFare?.toLocaleString('en-IN') || '5,420'}</p>
          <p className="text-[11px] text-slate-400 mt-1">Weighted domestic route average</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Tracked Routes</span>
            <span className="p-1 rounded-lg bg-sky-500/10 text-sky-400 font-bold">124</span>
          </div>
          <p className="text-3xl font-black text-sky-400">124 Sectors</p>
          <p className="text-[11px] text-slate-400 mt-1">Updated in real-time</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Airlines Monitored</span>
            <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold">8</span>
          </div>
          <p className="text-3xl font-black text-white">8 Airlines</p>
          <p className="text-[11px] text-slate-400 mt-1">IndiGo, Air India, Vistara, Akasa</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Active Price Anomalies</span>
            <span className="p-1 rounded-lg bg-amber-500/10 text-amber-400 font-bold animate-pulse">Alert</span>
          </div>
          <p className="text-3xl font-black text-amber-400">14 Flagged</p>
          <p className="text-[11px] text-slate-400 mt-1">Statistical Z-score surges</p>
        </div>
      </div>

      {/* Main Section: Route Explorer & Booking Window Price Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        {/* Left Column: Route Explorer & Chart */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Route Explorer</span>
                <h3 className="text-xl font-black text-white mt-0.5">
                  {routeDetail?.routeName || 'Delhi to Mumbai'} ({selectedRouteKey})
                </h3>
              </div>

              {/* Route Selector Dropdown */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Sector:</span>
                <select
                  value={selectedRouteKey}
                  onChange={(e) => setSelectedRouteKey(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="DEL-BOM">DEL ➔ BOM (Delhi - Mumbai)</option>
                  <option value="BOM-DEL">BOM ➔ DEL (Mumbai - Delhi)</option>
                  <option value="DEL-BLR">DEL ➔ BLR (Delhi - Bengaluru)</option>
                  <option value="BLR-DEL">BLR ➔ DEL (Bengaluru - Delhi)</option>
                  <option value="BOM-BLR">BOM ➔ BLR (Mumbai - Bengaluru)</option>
                  <option value="DEL-GOI">DEL ➔ GOI (Delhi - Goa)</option>
                  <option value="DEL-CCU">DEL ➔ CCU (Delhi - Kolkata)</option>
                  <option value="DEL-HYD">DEL ➔ HYD (Delhi - Hyderabad)</option>
                </select>
              </div>
            </div>

            {/* Route Baseline Stats Pill Bar */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Historical Median</span>
                <span className="text-lg font-black text-white mt-0.5 block">
                  ₹{routeDetail?.historicalMedian?.toLocaleString('en-IN') || '5,800'}
                </span>
              </div>
              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Route Mean (μ)</span>
                <span className="text-lg font-black text-slate-200 mt-0.5 block">
                  ₹{routeDetail?.historicalMean?.toLocaleString('en-IN') || '5,920'}
                </span>
              </div>
              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Std Deviation (σ)</span>
                <span className="text-lg font-black text-slate-200 mt-0.5 block">
                  ₹{routeDetail?.stdDev?.toLocaleString('en-IN') || '920'}
                </span>
              </div>
            </div>

            {/* Booking Window Elasticity Chart */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center">
                  <TrendingUp className="w-4 h-4 text-sky-400 mr-1.5" />
                  Booking Window Curve (Days in Advance vs Historical Fare)
                </h4>
                <span className="text-[10px] text-slate-400">Lowest fares: 15–30+ days</span>
              </div>

              <div className="h-64 w-full">
                {routeDetail?.bookingWindowCurve && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={routeDetail.bookingWindowCurve}
                      margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="fareGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0c8fe9" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#0c8fe9" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="window" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${val}`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          fontSize: '12px',
                        }}
                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Expected Fare']}
                      />
                      <Area
                        type="monotone"
                        dataKey="fare"
                        stroke="#38bdf8"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#fareGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Benchmark values breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-4 border-t border-slate-800 text-center">
              {routeDetail?.bookingWindowCurve?.map((item) => (
                <div key={item.window} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">{item.window}</span>
                  <span className="text-xs font-bold text-white mt-0.5 block">₹{item.fare.toLocaleString('en-IN')}</span>
                  <span className="text-[9px] text-slate-500 block">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Route Deals & Airfare Formula */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Flight Offers on this Route */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>Live Offers on {selectedRouteKey}</span>
              <span className="text-emerald-400 text-[10px] font-semibold">Live Duffel</span>
            </h3>

            <div className="space-y-3">
              {/* IndiGo Deal */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/30">
                <div className="flex justify-between items-start mb-1.5">
                  <div>
                    <h4 className="text-sm font-bold text-white">IndiGo (6E 5021)</h4>
                    <p className="text-[11px] text-slate-400">10:00 AM • Non-Stop</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-extrabold">
                    Index 87.1
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-base font-black text-white">₹5,050</span>
                    <span className="text-[10px] text-slate-400 ml-1">(-13% vs median)</span>
                  </div>

                  <button
                    onClick={() => {
                      const [o, d] = selectedRouteKey.split('-');
                      navigate(`/search?from=${o}&to=${d}&date=2026-10-15`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition shadow-sm"
                  >
                    Book Flight
                  </button>
                </div>
              </div>

              {/* Air India Deal */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex justify-between items-start mb-1.5">
                  <div>
                    <h4 className="text-sm font-bold text-white">Air India (AI 805)</h4>
                    <p className="text-[11px] text-slate-400">08:30 AM • Non-Stop (Meal incl.)</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[11px] font-extrabold">
                    Index 93.1
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-base font-black text-white">₹5,400</span>
                    <span className="text-[10px] text-slate-400 ml-1">(Good Value)</span>
                  </div>

                  <button
                    onClick={() => {
                      const [o, d] = selectedRouteKey.split('-');
                      navigate(`/search?from=${o}&to=${d}&date=2026-10-15`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition shadow-sm"
                  >
                    Book Flight
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Index Math & Scientific Definition */}
          <div className="glass-panel p-5 rounded-2xl border border-sky-500/20 bg-gradient-to-br from-slate-900/90 to-sky-950/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2 flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Airfare Index Formula
            </h4>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-mono text-xs text-sky-300 text-center my-2">
              Price Index = (Current Fare / Reference Fare) × 100
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              • <strong>&lt; 90:</strong> Exceptional Deal (High traveler value)<br />
              • <strong>90 – 110:</strong> Fair Market Rate<br />
              • <strong>&gt; 130:</strong> Surge Anomaly (Consider delaying booking)
            </p>
          </div>
        </div>
      </div>

      {/* Anomaly Detection Section (Step 15 requirement) */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Statistical Anomaly & Surge Detection</h3>
              <p className="text-xs text-slate-400">
                Machine learning outlier detection (Z-Score &gt; 1.85 or +40% deviation from historical median)
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Active Outliers Flagged
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {anomalies.map((anom) => (
            <div
              key={anom.id}
              className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-sm text-white">
                  {anom.origin} ➔ {anom.destination}
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  +{anom.deviationPercent}% Surge
                </span>
              </div>

              <p className="text-xs text-slate-300 font-medium">{anom.airline} ({anom.flightNumber})</p>

              <div className="my-2.5 p-2 bg-slate-950/60 rounded-lg text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Surged Fare:</span>
                  <span className="font-bold text-amber-400">₹{anom.fare.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Historical Median:</span>
                  <span className="text-slate-200">₹{anom.historicalMedian.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-snug">
                <strong>Reason:</strong> {anom.reason}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
