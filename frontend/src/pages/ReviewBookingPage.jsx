import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, User, CreditCard, ShieldCheck, ChevronLeft, ArrowRight, CheckCircle2, Utensils, Luggage } from 'lucide-react';
import { useBooking } from '../context/BookingContext.jsx';
import TransitInfoSection from '../components/TransitInfoSection.jsx';
import { getOfferTransitInfo } from '../services/transitService.js';

export default function ReviewBookingPage() {
  const navigate = useNavigate();
  const { selectedOffer, passengers, selectedSeats, selectedAddons } = useBooking();

  if (!selectedOffer || passengers.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <Plane className="w-10 h-10 text-sky-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">No Booking Session Active</h2>
          <p className="text-xs text-slate-500 mt-2">Please select a flight first to review your booking.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold"
          >
            Go to Search
          </button>
        </div>
      </div>
    );
  }

  const traveler = passengers[0];
  const seatInfo = selectedSeats[0] || { number: traveler.seat || '12A', type: 'Window', fee: 0 };
  const mealInfo = traveler.meal || selectedAddons.meal || 'Complimentary Veg Meal';
  const baggageFee = selectedAddons.baggageFee || 0;
  const seatFee = seatInfo.fee || 0;

  const baseFare = selectedOffer.fareBreakdown?.baseFare || selectedOffer.price - 850;
  const taxes = selectedOffer.fareBreakdown?.taxes || 750;
  const fees = (selectedOffer.fareBreakdown?.fees || 100) + seatFee + baggageFee;
  const total = selectedOffer.price + seatFee + baggageFee;

  const cabinDisplay = (selectedOffer.cabinClass || 'economy').replace('_', ' ').toUpperCase();
  const transitInfo = getOfferTransitInfo(selectedOffer);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-1.5 text-xs text-slate-600 hover:text-slate-900 mb-6 font-medium transition"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to seat selection</span>
      </button>

      <div className="text-center mb-8">
        <span className="text-xs font-semibold uppercase tracking-wider text-sky-700">Step 4 of 5 • Pre-Flight Review</span>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Review Your Itinerary</h1>
        <p className="text-xs text-slate-500 mt-1">Please verify your flight itinerary, seat allocation, and passenger details before proceeding to payment.</p>
      </div>

      {/* Main Review Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        {/* Route Banner */}
        <div className="p-6 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center shrink-0">
                <Plane className="w-5 h-5 text-sky-400 transform -rotate-45" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase text-sky-400 tracking-wider">
                  {selectedOffer.airline} • {selectedOffer.flightNumber}
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {selectedOffer.origin} ➔ {selectedOffer.destination}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  {selectedOffer.departureDate} • {selectedOffer.departure} - {selectedOffer.arrival} ({selectedOffer.duration})
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Cabin Class</span>
              <span className="inline-block mt-0.5 text-xs font-bold text-sky-300 px-3 py-1 rounded-lg bg-sky-950 border border-sky-800">
                {cabinDisplay}
              </span>
            </div>
          </div>
        </div>

        {/* Transit Information for Predefined Routes */}
        {transitInfo && (
          <div className="p-6 border-b border-slate-100 bg-amber-50/20">
            <TransitInfoSection transitInfo={transitInfo} />
          </div>
        )}

        {/* Passenger & Assigned Seat Summary */}
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center">
            <User className="w-4 h-4 text-sky-600 mr-2" />
            Passenger & Seat Allocation
          </h3>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Passenger Name</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{traveler.firstName} {traveler.lastName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Contact</span>
              <span className="font-medium text-slate-800 mt-0.5 block">{traveler.phone}</span>
              <span className="text-[11px] text-slate-500">{traveler.email}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Assigned Seat</span>
              <span className="font-bold text-sky-700 text-sm mt-0.5 inline-flex items-center space-x-1">
                <span className="px-2 py-0.5 rounded bg-sky-100 border border-sky-200">
                  {seatInfo.number}
                </span>
                <span className="text-xs text-slate-600 font-normal">({seatInfo.type || 'Window'})</span>
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">In-Flight Meal</span>
              <span className="font-medium text-slate-800 mt-0.5 block">{mealInfo}</span>
            </div>
          </div>

          {traveler.holdPnr && (
            <div className="mt-3 bg-sky-50/70 border border-sky-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-slate-600 font-medium">Active Booking Hold:</span>
                <span className="font-mono font-bold text-sky-800 bg-sky-100 border border-sky-300 px-2 py-0.5 rounded text-xs tracking-wider">
                  {traveler.holdPnr}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-emerald-800 font-semibold text-xs bg-emerald-100/80 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Transit Verification: APPROVED</span>
              </div>
            </div>
          )}
        </div>

        {/* Baggage & Inclusions */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-start space-x-3">
              <Luggage className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-slate-800 block">Baggage Allowance</span>
                <span className="text-slate-500">{selectedAddons.baggageLabel || 'Standard 15kg Checked + 7kg Cabin'}</span>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Utensils className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-slate-800 block">Meal Service</span>
                <span className="text-slate-500">{mealInfo} included</span>
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Fare Breakdown */}
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center">
            <CreditCard className="w-4 h-4 text-sky-600 mr-2" />
            Fare Breakdown
          </h3>

          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Base Airfare ({cabinDisplay})</span>
              <span className="font-semibold text-slate-900">₹{baseFare.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Airport Charges, Fuel & GST</span>
              <span className="font-semibold text-slate-900">₹{taxes.toLocaleString('en-IN')}</span>
            </div>
            {seatFee > 0 && (
              <div className="flex justify-between">
                <span>Selected Seat Fee ({seatInfo.number})</span>
                <span className="font-semibold text-slate-900">₹{seatFee.toLocaleString('en-IN')}</span>
              </div>
            )}
            {baggageFee > 0 && (
              <div className="flex justify-between">
                <span>Extra Baggage Addon</span>
                <span className="font-semibold text-slate-900">₹{baggageFee.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Airline Convenience Fee</span>
              <span className="font-semibold text-slate-900">₹100</span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <div>
                <span className="text-xs text-slate-500 block font-medium">Total Amount Payable</span>
                <span className="text-2xl font-bold text-slate-900">₹{total.toLocaleString('en-IN')}</span>
              </div>
              <span className="text-xs text-sky-700 font-semibold bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                Authoritative Duffel Live Fare
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-6 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Secure 256-bit Razorpay payment checkout</span>
          </div>

          <button
            onClick={() => navigate('/payment')}
            className="w-full sm:w-auto px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-sm transition active:scale-[0.98]"
          >
            <span>Proceed to Secure Payment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
