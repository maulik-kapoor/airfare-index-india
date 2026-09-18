import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, ArrowRight, ShieldCheck, Luggage, TrendingDown, AlertTriangle, CheckCircle2, Armchair } from 'lucide-react';
import { useBooking } from '../context/BookingContext.jsx';

export default function FlightCard({ offer }) {
  const navigate = useNavigate();
  const { selectFlight } = useBooking();

  const {
    id,
    offerId,
    airline,
    flightNumber,
    aircraft,
    origin,
    destination,
    departure,
    arrival,
    duration,
    stops,
    stopover,
    baggage,
    cabinClass = 'economy',
    price,
    currency = 'INR',
    airfareIndex,
  } = offer;

  const handleSelect = () => {
    selectFlight(offer);
    navigate(`/flights/${offerId || id}`);
  };

  const isGreatDeal = airfareIndex?.dealRating === 'GREAT_DEAL';
  const isAnomaly = airfareIndex?.isAnomaly;
  const cabinDisplay = (cabinClass || 'economy').replace('_', ' ').toUpperCase();

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md transition relative">
      {/* Top Banner Tag for Deals or Class */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 uppercase tracking-wide">
            {cabinDisplay}
          </span>
          {isGreatDeal && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center">
              <TrendingDown className="w-3 h-3 mr-1" />
              Index: {airfareIndex?.priceIndex} (Below Median)
            </span>
          )}
          {isAnomaly && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Surge Fare (+{airfareIndex?.percentDeviation}%)
            </span>
          )}
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-500 font-medium">{aircraft || 'Commercial Jet'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Col 1: Airline info */}
        <div className="lg:col-span-3 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
            <Plane className="w-5 h-5 text-sky-600 transform -rotate-45" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{airline}</h3>
            <p className="text-xs text-slate-500">{flightNumber}</p>
          </div>
        </div>

        {/* Col 2: Flight Timings & Duration */}
        <div className="lg:col-span-5 flex items-center justify-between px-2">
          {/* Departure */}
          <div className="text-left">
            <span className="text-base font-bold text-slate-900">{departure}</span>
            <p className="text-xs font-semibold text-slate-500 uppercase">{origin}</p>
          </div>

          {/* Duration Line */}
          <div className="flex-1 px-4 flex flex-col items-center">
            <span className="text-[11px] text-slate-500 mb-1">{duration}</span>
            <div className="w-full flex items-center relative">
              <div className="w-2 h-2 rounded-full bg-slate-300"></div>
              <div className="h-[2px] w-full bg-slate-200 relative">
                {stops === 0 ? (
                  <Plane className="w-3 h-3 text-sky-600 absolute left-1/2 -top-[5px] transform -translate-x-1/2 -rotate-45" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-amber-400 absolute left-1/2 -top-[3px] transform -translate-x-1/2"></div>
                )}
              </div>
              <div className="w-2 h-2 rounded-full bg-slate-300"></div>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">
              {stops === 0 ? 'Non-Stop' : `${stops} Stop (${stopover || 'Layover'})`}
            </span>
          </div>

          {/* Arrival */}
          <div className="text-right">
            <span className="text-base font-bold text-slate-900">{arrival}</span>
            <p className="text-xs font-semibold text-slate-500 uppercase">{destination}</p>
          </div>
        </div>

        {/* Col 3: Price & Action */}
        <div className="lg:col-span-4 flex items-center justify-between lg:justify-end lg:space-x-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <div className="text-left lg:text-right">
            <div className="flex items-baseline space-x-1">
              <span className="text-xs text-slate-500 font-medium">₹</span>
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                {price?.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {baggage ? baggage.split('•')[0] : '15kg Checked'}
            </p>
          </div>

          <button
            onClick={handleSelect}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition shadow-xs active:scale-98"
          >
            <span>Select Flight</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
