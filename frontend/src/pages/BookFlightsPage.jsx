import React from 'react';
import { Plane, ShieldCheck, Sparkles, CheckCircle2, Armchair } from 'lucide-react';
import SearchBar from '../components/SearchBar.jsx';

export default function BookFlightsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold mb-3">
          <Plane className="w-3.5 h-3.5" />
          <span>Flight Reservation Module</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Book Airline Flights
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Search live airline inventory across Economy, Business, and First Class with interactive seat selection.
        </p>
      </div>

      {/* Embedded Search Form */}
      <div className="max-w-4xl mx-auto">
        <SearchBar />
      </div>

      {/* Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center mb-3">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">All Cabin Classes</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Choose from Economy, Premium Economy, Business, and First Class with dedicated luggage allowances and lounge perks.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center mb-3">
            <Armchair className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Interactive Seat Selection</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Pick your preferred Window or Aisle seat on our interactive aircraft cabin layout with complimentary meal options.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Instant Duffel PNR & E-Ticket</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Instant airline booking reference and printable boarding pass generated directly upon secure Razorpay payment.
          </p>
        </div>
      </div>
    </div>
  );
}
