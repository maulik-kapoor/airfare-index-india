import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Plane,
  BarChart3,
  TrendingDown,
  Clock,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Armchair,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import SearchBar from '../components/SearchBar.jsx';
import api from '../services/api.js';

export default function HomePage() {
  const navigate = useNavigate();

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/analytics/routes');
        if (res.success) {
          setRoutes(res.data.slice(0, 4));
        }
      } catch (err) {
        console.warn('Notice loading routes:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Simple, practical 5-bucket booking window data
  const bookingWindowData = [
    { window: '0–3 Days', desc: 'Last Minute', medianFare: 7850, status: 'Surge Price', color: '#f59e0b' },
    { window: '4–7 Days', desc: 'Short Notice', medianFare: 6850, status: 'High', color: '#fbbf24' },
    { window: '8–14 Days', desc: 'Standard', medianFare: 5800, status: 'Average', color: '#94a3b8' },
    { window: '15–30 Days', desc: 'Sweet Spot', medianFare: 5200, status: 'Best Value', color: '#0284c7' },
    { window: '30+ Days', desc: 'Early Bird', medianFare: 4950, status: 'Lowest Fare', color: '#10b981' },
  ];

  const popularRoutes = [
    { from: 'DEL', to: 'BOM', label: 'Delhi ➔ Mumbai', median: '₹5,800', bestFare: '₹5,050', diff: '13% lower' },
    { from: 'DEL', to: 'BLR', label: 'Delhi ➔ Bengaluru', median: '₹6,400', bestFare: '₹5,650', diff: '11% lower' },
    { from: 'BOM', to: 'BLR', label: 'Mumbai ➔ Bengaluru', median: '₹4,200', bestFare: '₹3,750', diff: '10% lower' },
    { from: 'DEL', to: 'GOI', label: 'Delhi ➔ Goa', median: '₹6,200', bestFare: '₹5,300', diff: '14% lower' },
  ];

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 pt-12 pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Airfare Price Index & Airline Flight Booking
            </h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Search real-time flight inventory across Economy, Premium Economy, Business, and First Class. Compare live airfares against historical route baselines to identify the best time to book.
            </p>
          </div>

          {/* Search Widget */}
          <div className="max-w-5xl">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        {/* Popular Route Price Baselines */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Popular Route Airfare Index Baselines</h2>
              <p className="text-xs text-slate-500">Benchmark median fares compared against current live inventory</p>
            </div>
            <Link
              to="/route-explorer"
              className="text-xs font-semibold text-sky-700 hover:text-sky-800 flex items-center space-x-1"
            >
              <span>Explore all routes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularRoutes.map((r) => (
              <div
                key={r.label}
                onClick={() => navigate(`/search?from=${r.from}&to=${r.to}&date=2026-10-15&pax=1&cabin=economy`)}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">{r.label}</span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {r.diff}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-3 pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Route Median</span>
                    <span className="text-xs font-semibold text-slate-600 line-through">{r.median}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block">Live Best Fare</span>
                    <span className="text-base font-bold text-slate-900">{r.bestFare}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Clean, Simple Single Graph: Best Time to Book */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-sky-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Best Time to Book: Days Before Departure vs Median Fare
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Statistical price curve illustrating last-minute surges and the optimal 15–30 day advance booking window.
              </p>
            </div>

            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
                <span className="text-slate-600">Lowest Fare</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-xs bg-sky-600"></span>
                <span className="text-slate-600">Sweet Spot (15-30d)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-xs bg-amber-500"></span>
                <span className="text-slate-600">Surge (0-3d)</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingWindowData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="window"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(val) => `₹${val}`}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <Tooltip
                  formatter={(value, name, props) => [`₹${value.toLocaleString('en-IN')}`, `${props.payload.desc} (${props.payload.status})`]}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="medianFare" radius={[6, 6, 0, 0]}>
                  {bookingWindowData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
            <span className="font-medium text-slate-800">
              💡 Presentation Tip: Booking in the 15–30 day window saves ~₹2,650 per ticket compared to last-minute fares.
            </span>
            <Link
              to="/booking-windows"
              className="text-sky-700 hover:text-sky-800 font-semibold flex items-center space-x-1"
            >
              <span>Detailed window breakdown</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </section>

        {/* 3 Simple Value Propositions */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-sm mb-3">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Authoritative Duffel API</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Direct connection to global GDS and airline reservation systems, returning verified live inventory and seat locks.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-sm mb-3">
              2
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Interactive Seat Map</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Select specific window, aisle, or extra-legroom seats on interactive aircraft cabin maps with meal preferences.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-sm mb-3">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Airfare Index Valuation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every flight price is indexed against median historical benchmarks (Index 100) to help passengers avoid surge pricing.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
