import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, ArrowUpDown, Plane, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import SearchBar from '../components/SearchBar.jsx';
import FlightCard from '../components/FlightCard.jsx';
import api from '../services/api.js';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const origin = searchParams.get('from') || 'DEL';
  const destination = searchParams.get('to') || 'BOM';
  const departureDate = searchParams.get('date') || '2026-10-15';
  const passengers = searchParams.get('pax') || 1;
  const cabinClass = searchParams.get('cabin') || 'economy';

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Sorting state
  const [selectedStops, setSelectedStops] = useState('all'); // all, direct, 1stop
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [dealsOnly, setDealsOnly] = useState(false);
  const [sortBy, setSortBy] = useState('best_index'); // best_index, price_asc, price_desc, duration

  const fetchFlights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/flights/search', {
        origin,
        destination,
        departureDate,
        passengers,
        cabinClass,
      });

      if (res.success && res.data) {
        setOffers(res.data);
      } else {
        setError('No flight offers found for this route.');
      }
    } catch (err) {
      setError(err.message || 'Failed to search flights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, [origin, destination, departureDate, passengers, cabinClass]);

  const availableAirlines = Array.from(new Set(offers.map((o) => o.airline)));

  const handleAirlineToggle = (airline) => {
    if (selectedAirlines.includes(airline)) {
      setSelectedAirlines(selectedAirlines.filter((a) => a !== airline));
    } else {
      setSelectedAirlines([...selectedAirlines, airline]);
    }
  };

  const filteredOffers = offers.filter((offer) => {
    if (selectedStops === 'direct' && offer.stops !== 0) return false;
    if (selectedStops === '1stop' && offer.stops !== 1) return false;
    if (selectedAirlines.length > 0 && !selectedAirlines.includes(offer.airline)) return false;
    if (dealsOnly && offer.airfareIndex?.priceIndex > 95) return false;
    return true;
  });

  const sortedOffers = [...filteredOffers].sort((a, b) => {
    if (sortBy === 'best_index') {
      return (a.airfareIndex?.priceIndex || 100) - (b.airfareIndex?.priceIndex || 100);
    }
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'duration') return a.duration.localeCompare(b.duration);
    return 0;
  });

  const referenceMedian = offers[0]?.airfareIndex?.historicalMedian || 5800;
  const lowestFare = offers.length > 0 ? Math.min(...offers.map((o) => o.price)) : 0;
  const bestIndex = offers.length > 0 ? Math.min(...offers.map((o) => o.airfareIndex?.priceIndex || 100)) : 100;
  const cabinDisplay = cabinClass.replace('_', ' ').toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Search Bar */}
      <div className="mb-6">
        <SearchBar compact />
      </div>

      {/* Results Header & Market Intelligence Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {origin} ➔ {destination}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                {departureDate} • {passengers} Pax • {cabinDisplay}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Found {offers.length} live flight offers from Duffel API
            </p>
          </div>

          {/* Quick Route Index Metric */}
          {offers.length > 0 && (
            <div className="flex items-center space-x-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Route Median</span>
                <span className="text-sm font-bold text-slate-900">₹{referenceMedian.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-7 w-[1px] bg-slate-200"></div>
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Best Index</span>
                <span className="text-sm font-bold text-emerald-700">{bestIndex}</span>
              </div>
              <div className="h-7 w-[1px] bg-slate-200"></div>
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Lowest Fare</span>
                <span className="text-sm font-bold text-slate-900">₹{lowestFare.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Sidebar Filters + Flight List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Filters (3 cols) */}
        <aside className="lg:col-span-3 space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center">
                <Filter className="w-3.5 h-3.5 text-sky-600 mr-1.5" />
                Filters
              </h2>
              {(selectedStops !== 'all' || selectedAirlines.length > 0 || dealsOnly) && (
                <button
                  onClick={() => {
                    setSelectedStops('all');
                    setSelectedAirlines([]);
                    setDealsOnly(false);
                  }}
                  className="text-[11px] text-sky-600 hover:underline font-semibold"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Deal Filter */}
            <div className="mb-4 pb-4 border-b border-slate-100">
              <label className="flex items-center space-x-2.5 cursor-pointer bg-slate-50 p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 transition">
                <input
                  type="checkbox"
                  checked={dealsOnly}
                  onChange={(e) => setDealsOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 flex items-center">
                    <Sparkles className="w-3 h-3 text-emerald-600 mr-1" />
                    Great Deals Only
                  </span>
                  <span className="text-[10px] text-slate-500 block">Airfare Index ≤ 95</span>
                </div>
              </label>
            </div>

            {/* Stops Filter */}
            <div className="mb-4 pb-4 border-b border-slate-100">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Stops</h3>
              <div className="space-y-1.5 text-xs text-slate-700">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="stops"
                    value="all"
                    checked={selectedStops === 'all'}
                    onChange={() => setSelectedStops('all')}
                    className="text-sky-600"
                  />
                  <span>All Flights ({offers.length})</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="stops"
                    value="direct"
                    checked={selectedStops === 'direct'}
                    onChange={() => setSelectedStops('direct')}
                    className="text-sky-600"
                  />
                  <span>Direct Only ({offers.filter((o) => o.stops === 0).length})</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="stops"
                    value="1stop"
                    checked={selectedStops === '1stop'}
                    onChange={() => setSelectedStops('1stop')}
                    className="text-sky-600"
                  />
                  <span>1 Stop ({offers.filter((o) => o.stops === 1).length})</span>
                </label>
              </div>
            </div>

            {/* Airlines Filter */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Airlines</h3>
              <div className="space-y-1.5 text-xs text-slate-700">
                {availableAirlines.map((airline) => (
                  <label key={airline} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAirlines.includes(airline)}
                      onChange={() => handleAirlineToggle(airline)}
                      className="w-3.5 h-3.5 rounded text-sky-600"
                    />
                    <span>{airline}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Flight Offers List (9 cols) */}
        <main className="lg:col-span-9 space-y-4">
          {/* Sorting Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-600">
              Showing <strong className="text-slate-900">{sortedOffers.length}</strong> available flights
            </span>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500 flex items-center">
                <ArrowUpDown className="w-3.5 h-3.5 mr-1" /> Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:border-sky-600 cursor-pointer"
              >
                <option value="best_index">Airfare Index (Best Deals)</option>
                <option value="price_asc">Price: Lowest first</option>
                <option value="price_desc">Price: Highest first</option>
                <option value="duration">Fastest duration</option>
              </select>
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse">
                  <div className="h-5 bg-slate-100 rounded w-1/4 mb-4"></div>
                  <div className="h-10 bg-slate-100 rounded mb-3"></div>
                  <div className="h-4 bg-slate-50 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Error searching flights</h4>
                <p className="mt-0.5 text-slate-600">{error}</p>
                <button
                  onClick={fetchFlights}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-700 text-xs font-semibold hover:bg-rose-50 flex items-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry Search
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && sortedOffers.length === 0 && (
            <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center">
              <Plane className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900">No Flights Match Your Filters</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Try loosening your filters or resetting the airline selection to view all available options.
              </p>
              <button
                onClick={() => {
                  setSelectedStops('all');
                  setSelectedAirlines([]);
                  setDealsOnly(false);
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Render Flight Cards */}
          {!loading &&
            !error &&
            sortedOffers.map((offer) => <FlightCard key={offer.id || offer.offerId} offer={offer} />)}
        </main>
      </div>
    </div>
  );
}
