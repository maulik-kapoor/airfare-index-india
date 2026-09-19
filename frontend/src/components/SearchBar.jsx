import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlaneTakeoff, PlaneLanding, Calendar, Users, ArrowRightLeft, Search, Armchair } from 'lucide-react';
import { useBooking } from '../context/BookingContext.jsx';

export const AIRPORTS = [
  { code: 'DEL', city: 'New Delhi', name: 'Indira Gandhi Intl (DEL)', region: 'North' },
  { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj (BOM)', region: 'West' },
  { code: 'BLR', city: 'Bengaluru', name: 'Kempegowda Intl (BLR)', region: 'South' },
  { code: 'CCU', city: 'Kolkata', name: 'Netaji Subhas Chandra Bose (CCU)', region: 'East' },
  { code: 'HYD', city: 'Hyderabad', name: 'Rajiv Gandhi Intl (HYD)', region: 'South' },
  { code: 'MAA', city: 'Chennai', name: 'Chennai Intl (MAA)', region: 'South' },
  { code: 'GOI', city: 'Goa', name: 'Dabolim / Mopa (GOI)', region: 'West' },
  { code: 'PNQ', city: 'Pune', name: 'Pune Airport (PNQ)', region: 'West' },
  { code: 'YYZ', city: 'Toronto', name: 'Toronto Pearson Intl (YYZ)', region: 'International' },
];

export const CABIN_CLASSES = [
  { value: 'economy', label: 'Economy' },
  { value: 'premium_economy', label: 'Premium Economy' },
  { value: 'business', label: 'Business Class' },
  { value: 'first', label: 'First Class' },
];

export default function SearchBar({ compact = false }) {
  const navigate = useNavigate();
  const { searchQuery, updateSearchQuery } = useBooking();

  const [origin, setOrigin] = useState(searchQuery.origin || 'DEL');
  const [destination, setDestination] = useState(searchQuery.destination || 'BOM');
  const [departureDate, setDepartureDate] = useState(searchQuery.departureDate || '2026-10-15');
  const [passengers, setPassengers] = useState(searchQuery.passengers || 1);
  const [cabinClass, setCabinClass] = useState(searchQuery.cabinClass || 'economy');
  const [tripType, setTripType] = useState('one-way');

  const handleSwapAirports = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (origin === destination) {
      alert('Origin and Destination cannot be the same airport.');
      return;
    }

    updateSearchQuery({
      origin,
      destination,
      departureDate,
      passengers,
      cabinClass,
      tripType,
    });

    navigate(`/search?from=${origin}&to=${destination}&date=${departureDate}&pax=${passengers}&cabin=${cabinClass}`);
  };

  const quickRoutes = [
    { from: 'DEL', to: 'BOM', label: 'Delhi ⇄ Mumbai' },
    { from: 'DEL', to: 'BLR', label: 'Delhi ⇄ Bengaluru' },
    { from: 'BOM', to: 'BLR', label: 'Mumbai ⇄ Bengaluru' },
    { from: 'DEL', to: 'GOI', label: 'Delhi ⇄ Goa' },
    { from: 'DEL', to: 'YYZ', label: 'Delhi ⇄ Toronto' },
  ];

  return (
    <div className={`w-full bg-white rounded-2xl ${compact ? 'p-4 border border-slate-200' : 'p-6 border border-slate-200 shadow-sm'}`}>
      {/* Top Options: Trip Type & Popular routes */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setTripType('one-way')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              tripType === 'one-way'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            One Way
          </button>
          <button
            type="button"
            onClick={() => setTripType('round-trip')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              tripType === 'round-trip'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Round Trip
          </button>
        </div>

        {/* Quick Route Shortcuts */}
        <div className="hidden md:flex items-center space-x-2 text-xs text-slate-500">
          <span className="font-medium text-slate-700">Popular:</span>
          {quickRoutes.map((r) => (
            <button
              key={`${r.from}-${r.to}`}
              type="button"
              onClick={() => {
                setOrigin(r.from);
                setDestination(r.to);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition"
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Search Inputs Form */}
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        {/* Origin */}
        <div className="md:col-span-3">
          <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-1 ml-1">
            From (Origin)
          </label>
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-sky-600 focus-within:bg-white transition">
            <PlaneTakeoff className="w-4 h-4 text-sky-600 mr-2 shrink-0" />
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full bg-transparent text-slate-900 font-semibold text-xs focus:outline-none cursor-pointer"
            >
              {AIRPORTS.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.city} ({a.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="hidden md:flex md:col-span-1 justify-center pb-2">
          <button
            type="button"
            onClick={handleSwapAirports}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 hover:text-slate-900 transition active:scale-95"
            title="Swap Origin and Destination"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination */}
        <div className="md:col-span-3">
          <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-1 ml-1">
            To (Destination)
          </label>
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-sky-600 focus-within:bg-white transition">
            <PlaneLanding className="w-4 h-4 text-sky-600 mr-2 shrink-0" />
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-transparent text-slate-900 font-semibold text-xs focus:outline-none cursor-pointer"
            >
              {AIRPORTS.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.city} ({a.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Departure Date */}
        <div className="md:col-span-2">
          <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-1 ml-1">
            Departure Date
          </label>
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-sky-600 focus-within:bg-white transition">
            <Calendar className="w-4 h-4 text-sky-600 mr-2 shrink-0" />
            <input
              type="date"
              value={departureDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full bg-transparent text-slate-900 text-xs font-semibold focus:outline-none cursor-pointer"
            >
            </input>
          </div>
        </div>

        {/* Passengers & Class (2 separate clean dropdowns or compact combo) */}
        <div className="md:col-span-2">
          <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-1 ml-1">
            Travelers & Class
          </label>
          <div className="grid grid-cols-2 gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
            <select
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="bg-transparent text-slate-900 text-xs font-semibold focus:outline-none cursor-pointer px-1 py-1"
              title="Passengers"
            >
              <option value={1}>1 Pax</option>
              <option value={2}>2 Pax</option>
              <option value={3}>3 Pax</option>
              <option value={4}>4 Pax</option>
              <option value={5}>5 Pax</option>
            </select>

            <select
              value={cabinClass}
              onChange={(e) => setCabinClass(e.target.value)}
              className="bg-transparent text-slate-900 text-xs font-semibold focus:outline-none cursor-pointer px-1 py-1 border-l border-slate-200"
              title="Cabin Class"
            >
              <option value="economy">Economy</option>
              <option value="premium_economy">Prem. Eco</option>
              <option value="business">Business</option>
              <option value="first">First</option>
            </select>
          </div>
        </div>

        {/* Search Submit Button */}
        <div className="md:col-span-1">
          <button
            type="submit"
            className="w-full h-10 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl flex items-center justify-center shadow-xs transition active:scale-98"
            title="Search Flights"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
