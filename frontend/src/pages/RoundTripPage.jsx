import React, { useEffect, useState } from 'react';
import { ArrowRightLeft, TrendingDown, Info, DollarSign, ShieldCheck } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import api from '../services/api.js';

export default function RoundTripPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoundTrip() {
      try {
        const res = await api.get('/analytics/round-trip');
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load round-trip analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRoundTrip();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center space-x-2 text-sky-700 text-xs font-semibold uppercase tracking-wider mb-1">
          <ArrowRightLeft className="w-4 h-4" />
          <span>Fare Comparison</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Round-Trip vs 2x One-Way Tickets
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Direct price comparison evaluating if booking a single round-trip ticket saves money compared to two one-way flights.
        </p>
      </div>

      {/* Formula & Explainer */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div>
          <span className="font-bold text-slate-900 text-sm block">Calculation Formula</span>
          <p className="text-slate-500 mt-0.5">
            Compares identical routes with the same advance booking window.
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-sky-800">
          RT Difference % = [(Round-Trip - 2 × One-Way) / (2 × One-Way)] × 100
        </div>
      </div>

      {/* Chart: Two One-Ways vs Round Trip */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 pb-2 border-b border-slate-100">
          Fare Comparison by Sector (₹)
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="route" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.5rem', fontSize: '12px' }}
                formatter={(val) => [`₹${val?.toLocaleString('en-IN')}`]}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="twoOneWaysCost" fill="#94a3b8" name="2x Separate One-Ways" />
              <Bar dataKey="roundTripMedian" fill="#0284c7" name="Combined Round-Trip" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 pb-2 border-b border-slate-100">
          Savings by Sector
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Sector</th>
                <th className="py-3 px-4 font-semibold">One-Way Median</th>
                <th className="py-3 px-4 font-semibold">2x One-Way Total</th>
                <th className="py-3 px-4 font-semibold">Round-Trip Fare</th>
                <th className="py-3 px-4 font-semibold">Difference (₹)</th>
                <th className="py-3 px-4 font-semibold">Difference %</th>
                <th className="py-3 px-4 font-semibold">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((r) => {
                const isSavings = r.rtDifferenceAmount < 0;
                return (
                  <tr key={r.route} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">{r.route}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">₹{r.oneWayMedian?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-slate-500">₹{r.twoOneWaysCost?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">₹{r.roundTripMedian?.toLocaleString('en-IN')}</td>
                    <td className={`py-3 px-4 font-bold ${isSavings ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {isSavings ? `-₹${Math.abs(r.rtDifferenceAmount)?.toLocaleString('en-IN')}` : `+₹${r.rtDifferenceAmount?.toLocaleString('en-IN')}`}
                    </td>
                    <td className={`py-3 px-4 font-bold ${isSavings ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {r.rtDifferencePct}%
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                        isSavings
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {r.savingsCategory}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
