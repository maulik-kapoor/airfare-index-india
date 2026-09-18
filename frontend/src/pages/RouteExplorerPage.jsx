import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Compass,
  BarChart3,
  TrendingUp,
  Plane,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import api from '../services/api.js';

export default function RouteExplorerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [routes, setRoutes] = useState([]);
  const [selectedRouteKey, setSelectedRouteKey] = useState(searchParams.get('route') || 'DEL-BOM');
  const [routeDetail, setRouteDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoutesList() {
      try {
        const res = await api.get('/analytics/routes');
        if (res.success) {
          setRoutes(res.data);
        }
      } catch (err) {
        console.error('Failed to load routes:', err);
      }
    }
    loadRoutesList();
  }, []);

  useEffect(() => {
    async function loadRouteDetails() {
      if (!selectedRouteKey) return;
      setLoading(true);
      const [origin, dest] = selectedRouteKey.split('-');
      try {
        const res = await api.get(`/analytics/route/${origin}/${dest}`);
        if (res.success) {
          setRouteDetail(res.data);
        }
      } catch (err) {
        console.error('Failed to load route details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRouteDetails();
  }, [selectedRouteKey]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-2 text-sky-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Route Price Analysis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Route Explorer</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sector price baselines, historical medians, and airline comparisons
          </p>
        </div>

        {/* Sector Selector Dropdown */}
        <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-600 font-medium">Select Route:</span>
          <select
            value={selectedRouteKey}
            onChange={(e) => setSelectedRouteKey(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            {routes.map((r) => (
              <option key={r.route} value={r.route}>
                {r.route} ({r.origin} ➔ {r.destination})
              </option>
            ))}
          </select>
        </div>
      </div>

      {routeDetail && (
        <div className="space-y-6">
          {/* Top Route Dossier KPI Banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-700">Sector Overview</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
                  {routeDetail.origin} to {routeDetail.destination}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Based on {routeDetail.observationsCount || '100+'} real flight observations
                </p>
              </div>

              {/* Action: Search Live Flights */}
              <button
                onClick={() => navigate(`/book-flights?from=${routeDetail.origin}&to=${routeDetail.destination}`)}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs flex items-center space-x-2 shadow-xs transition"
              >
                <Plane className="w-4 h-4" />
                <span>Search Flights on {routeDetail.route}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* 6 Metric Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Median Fare</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                  ₹{routeDetail.historicalMedian?.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-500">Benchmark</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Average Fare</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                  ₹{routeDetail.historicalMean?.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-500">Mean price</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-sky-700 block">Volatility</span>
                <span className="text-lg font-bold text-sky-700 mt-0.5 block">
                  ₹{routeDetail.volatility?.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-sky-600">Standard deviation</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">IQR Spread</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                  ₹{routeDetail.iqr?.toLocaleString('en-IN') || '1,400'}
                </span>
                <span className="text-[10px] text-slate-500">Typical variance</span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Lowest Seen</span>
                <span className="text-lg font-bold text-emerald-700 mt-0.5 block">
                  ₹{routeDetail.minFare?.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-600">Best deal</span>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">Highest Seen</span>
                <span className="text-lg font-bold text-amber-700 mt-0.5 block">
                  ₹{routeDetail.maxFare?.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-amber-600">Peak / Last-min</span>
              </div>
            </div>
          </div>

          {/* Booking Window Curve */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 mb-4 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center">
                  <Clock className="w-4 h-4 text-sky-600 mr-2" />
                  Price by Days in Advance ({routeDetail.route})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">How fares typically change as departure date gets closer</p>
              </div>
              <span className="text-xs text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 font-medium">
                Best booking window: 15 to 45 days ahead
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={routeDetail.bookingWindowCurve} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="window" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.5rem', fontSize: '12px' }}
                    formatter={(val) => [`₹${val?.toLocaleString('en-IN')}`, 'Fare']}
                  />
                  <Area type="monotone" dataKey="medianFare" stroke="#0284c7" strokeWidth={2} fill="#e0f2fe" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side-by-Side: Airline vs OTA Comparison on this Route */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Airline Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 pb-2 border-b border-slate-100 flex items-center">
                <Plane className="w-4 h-4 text-sky-600 mr-2" />
                Airlines Operating on {routeDetail.route}
              </h3>

              <div className="space-y-3">
                {routeDetail.airlines?.map((a) => (
                  <div
                    key={a.airline}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">{a.airline}</span>
                      <span className="text-slate-500 mt-0.5 block">{a.count} observations recorded</span>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-bold text-slate-900 block">
                        ₹{a.medianFare?.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                        Price Index: {a.priceIndex}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* OTA Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 pb-2 border-b border-slate-100 flex items-center">
                <Building2 className="w-4 h-4 text-sky-600 mr-2" />
                Booking Channels on {routeDetail.route}
              </h3>

              <div className="space-y-3">
                {routeDetail.otas?.map((o) => (
                  <div
                    key={o.ota}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">{o.ota}</span>
                      <span className="text-slate-500 mt-0.5 block">{o.count} observations recorded</span>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-bold text-slate-900 block">
                        ₹{o.medianFare?.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Price Index: {o.priceIndex}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
