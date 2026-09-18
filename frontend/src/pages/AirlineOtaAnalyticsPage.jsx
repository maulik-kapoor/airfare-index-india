import React, { useEffect, useState } from 'react';
import { Building2, Plane, DollarSign, ShieldCheck, Info } from 'lucide-react';
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

export default function AirlineOtaAnalyticsPage() {
  const [airlines, setAirlines] = useState([]);
  const [otas, setOtas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [airRes, otaRes] = await Promise.all([
          api.get('/analytics/airline-intelligence'),
          api.get('/analytics/ota-comparison'),
        ]);

        if (airRes.success) setAirlines(airRes.data);
        if (otaRes.success) setOtas(otaRes.data);
      } catch (err) {
        console.error('Failed to load airline/OTA analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center space-x-2 text-sky-700 text-xs font-semibold uppercase tracking-wider mb-1">
          <Building2 className="w-4 h-4" />
          <span>Industry Comparison</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Airlines & Booking Channels
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Breakdown of airline fee components (Base Fare + Taxes + Fees) and platform convenience charges
        </p>
      </div>

      {/* Section 1: Airline Analytics */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center">
              <Plane className="w-4 h-4 text-sky-600 mr-2" />
              Airline Fare Decomposition
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Average breakdown between Base Fare, Airport Taxes, and Ancillary Fees</p>
          </div>
          <span className="text-xs font-medium px-3 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
            5 Major Domestic Carriers
          </span>
        </div>

        {/* Stacked Bar Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={airlines} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="airline" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.5rem', fontSize: '12px' }}
                formatter={(val) => [`₹${val?.toLocaleString('en-IN')}`]}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="avgBaseFare" stackId="fee" fill="#0284c7" name="Base Fare" />
              <Bar dataKey="avgTaxes" stackId="fee" fill="#38bdf8" name="Airport Taxes & GST" />
              <Bar dataKey="avgFees" stackId="fee" fill="#94a3b8" name="Airline Fees / Addons" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Airline Metric Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Airline</th>
                <th className="py-3 px-4 font-semibold">Market Share</th>
                <th className="py-3 px-4 font-semibold">Median Fare</th>
                <th className="py-3 px-4 font-semibold">Avg Base Fare</th>
                <th className="py-3 px-4 font-semibold">Avg Taxes</th>
                <th className="py-3 px-4 font-semibold">Volatility</th>
                <th className="py-3 px-4 font-semibold">Price Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {airlines.map((a) => (
                <tr key={a.airline} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center space-x-2">
                    <Plane className="w-3.5 h-3.5 text-sky-600" />
                    <span>{a.airline}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{a.marketSharePct}%</td>
                  <td className="py-3 px-4 font-bold text-slate-900">₹{a.medianFare?.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-slate-600">₹{a.avgBaseFare?.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-slate-600">₹{a.avgTaxes?.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-sky-700 font-medium">₹{a.volatility?.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-semibold text-[11px] bg-sky-50 text-sky-700 border border-sky-200">
                      {a.overallPriceIndex}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: OTA Analytics */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center">
              <Building2 className="w-4 h-4 text-sky-600 mr-2" />
              Booking Platform Fees & Net Prices
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparison of convenience fees charged across common travel portals
            </p>
          </div>
          <span className="text-xs font-medium px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            5 Booking Channels
          </span>
        </div>

        {/* OTA Comparison Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {otas.map((o) => {
            const isDirect = o.ota === 'Airline Direct';
            const isZeroFee = o.avgConvenienceFee === 0;
            return (
              <div
                key={o.ota}
                className={`p-4 rounded-xl border ${
                  isDirect
                    ? 'border-sky-300 bg-sky-50/50'
                    : isZeroFee
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-slate-900 block">{o.ota}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    Index {o.priceIndex}
                  </span>
                </div>

                <div className="my-2">
                  <span className="text-lg font-bold text-slate-900 block">₹{o.medianFare?.toLocaleString('en-IN')}</span>
                  <span className="text-[11px] text-slate-500">Median fare</span>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Portal Fee:</span>
                    <span className={`font-semibold ${isZeroFee ? 'text-emerald-700' : 'text-slate-700'}`}>
                      {isZeroFee ? '₹0 Free' : `₹${o.avgConvenienceFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">vs Airline Direct:</span>
                    <span className={`font-semibold ${o.differenceVsDirect > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {o.differenceVsDirect > 0 ? `+₹${o.differenceVsDirect}` : isDirect ? 'Direct' : `-₹${Math.abs(o.differenceVsDirect)}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
