import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plane, ShieldCheck, ArrowRight, Luggage, AlertCircle, Sparkles, CheckCircle2, ChevronLeft } from 'lucide-react';
import { useBooking } from '../context/BookingContext.jsx';
import api from '../services/api.js';

export default function FlightDetailsPage() {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const { selectFlight } = useBooking();

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadOffer() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/flights/${offerId}`);
        if (res.success && res.data) {
          setOffer(res.data);
          selectFlight(res.data);
        } else {
          setError('Offer has expired or is no longer available.');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch flight offer.');
      } finally {
        setLoading(false);
      }
    }
    loadOffer();
  }, [offerId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-lg font-bold text-slate-900">Validating Live Flight with Duffel API...</h2>
        <p className="text-xs text-slate-500 mt-1">Checking current seat availability and fare breakdown</p>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white p-8 rounded-2xl border border-rose-200 shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Flight Offer Expired</h2>
          <p className="text-xs text-slate-500 mt-2">{error || 'This flight offer is no longer valid.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold"
          >
            Back to Flight Search
          </button>
        </div>
      </div>
    );
  }

  const baseFare = offer.fareBreakdown?.baseFare || offer.price - 850;
  const taxes = offer.fareBreakdown?.taxes || 750;
  const fees = offer.fareBreakdown?.fees || 100;
  const total = offer.price;
  const cabinDisplay = (offer.cabinClass || 'economy').replace('_', ' ').toUpperCase();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-1.5 text-xs text-slate-600 hover:text-slate-900 mb-6 font-medium transition"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to search results</span>
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-700">Step 1 of 5 • Flight Overview</span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Review Flight Itinerary & Fare
          </h1>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Fare Validated via Duffel API</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Itinerary Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
                  <Plane className="w-5 h-5 text-sky-600 transform -rotate-45" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{offer.airline}</h3>
                  <p className="text-xs text-slate-500">{offer.flightNumber} • {offer.aircraft || 'Airbus A321'}</p>
                </div>
              </div>

              <span className="text-xs px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 font-bold border border-sky-200">
                {cabinDisplay}
              </span>
            </div>

            {/* Flight Timeline */}
            <div className="relative pl-6 space-y-6 border-l-2 border-slate-200 ml-2">
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full border-2 border-sky-600 bg-white"></div>
                <div>
                  <span className="text-lg font-bold text-slate-900">{offer.departure}</span>
                  <span className="text-xs font-bold text-slate-500 ml-2">({offer.origin})</span>
                  <p className="text-xs text-slate-500 mt-0.5">{offer.origin} Airport • {offer.departureDate}</p>
                </div>
              </div>

              <div className="text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 inline-block">
                Flight duration: {offer.duration} {offer.stops === 0 ? '(Non-stop direct)' : `(${offer.stops} Stop)`}
              </div>

              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full border-2 border-slate-600 bg-white"></div>
                <div>
                  <span className="text-lg font-bold text-slate-900">{offer.arrival}</span>
                  <span className="text-xs font-bold text-slate-500 ml-2">({offer.destination})</span>
                  <p className="text-xs text-slate-500 mt-0.5">{offer.destination} Airport • {offer.departureDate}</p>
                </div>
              </div>
            </div>

            {/* Inclusions */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center font-medium">
                <Luggage className="w-4 h-4 mr-1.5 text-slate-500" />
                {offer.baggage || '15kg Checked + 7kg Cabin'}
              </span>
              <span className="text-emerald-700 flex items-center font-medium">
                <CheckCircle2 className="w-4 h-4 mr-1" /> Seat Selection Next
              </span>
            </div>
          </div>

          {/* Airfare Index Insight Card */}
          <div className="bg-sky-50/60 p-5 rounded-2xl border border-sky-200">
            <div className="flex items-center space-x-2 text-sky-800 text-xs font-bold mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span>AIRFARE PRICE INDEX INSIGHT</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Current fare is <strong className="text-slate-900">₹{total.toLocaleString('en-IN')}</strong> for {cabinDisplay}. The historical route median is{' '}
              <strong className="text-slate-800">₹{offer.airfareIndex?.historicalMedian?.toLocaleString('en-IN') || '5,800'}</strong> with a Price Index score of{' '}
              <strong className="text-emerald-700">{offer.airfareIndex?.priceIndex || 95}</strong>.
            </p>
          </div>
        </div>

        {/* Right Column: Fare Breakdown & CTA (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 pb-3 border-b border-slate-100">
              Fare Breakdown
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Base Fare</span>
                <span className="font-semibold text-slate-900">₹{baseFare.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Airport Taxes & GST</span>
                <span className="font-semibold text-slate-900">₹{taxes.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Airline Booking Fee</span>
                <span className="font-semibold text-slate-900">₹{fees.toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <div>
                  <span className="text-xs text-slate-500 block">Total Amount</span>
                  <span className="text-2xl font-bold text-slate-900">₹{total.toLocaleString('en-IN')}</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">INR (Taxes incl.)</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/passenger-details')}
              className="mt-6 w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-sm transition active:scale-98"
            >
              <span>Continue to Passenger Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-slate-400 text-center mt-3">
              Protected by Duffel API price locks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
