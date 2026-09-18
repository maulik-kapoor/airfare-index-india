import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Plane, Ticket, ArrowRight, Printer, User, Utensils, ShieldCheck } from 'lucide-react';
import { useBooking } from '../context/BookingContext.jsx';

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const { confirmedBooking, clearBookingFlow } = useBooking();

  if (!confirmedBooking) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <Ticket className="w-10 h-10 text-sky-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">No Recent Booking</h2>
          <p className="text-xs text-slate-500 mt-2">View your flight reservations in My Bookings.</p>
          <button
            onClick={() => navigate('/my-bookings')}
            className="mt-5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold"
          >
            Go to My Bookings
          </button>
        </div>
      </div>
    );
  }

  const {
    bookingReference,
    duffelOrderId,
    airline,
    origin,
    destination,
    departureDate,
    departureTime,
    arrivalTime,
    duration,
    passengers,
    totalAmount,
    currency,
    paymentDetails,
    cabinClass,
  } = confirmedBooking;

  const handlePrintTicket = () => {
    window.print();
  };

  const cabinDisplay = (cabinClass || 'economy').replace('_', ' ').toUpperCase();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Success Banner */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Booking Confirmed & Issued</span>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
          Have a Great Flight!
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Your e-ticket and airline PNR reference have been confirmed directly via Duffel API.
        </p>
      </div>

      {/* Main Boarding Pass / E-Ticket */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8 print:border-slate-800">
        {/* PNR Header */}
        <div className="bg-slate-900 text-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400">Airline Booking Reference (PNR)</span>
            <div className="text-3xl font-bold tracking-widest text-white mt-0.5 font-mono">
              {bookingReference}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Duffel Order ID: {duffelOrderId || 'ord_live'}</p>
          </div>

          <div className="text-right">
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              ✓ CONFIRMED & TICKETED
            </span>
          </div>
        </div>

        {/* Flight Route Banner */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
              <Plane className="w-5 h-5 text-sky-600 transform -rotate-45" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{airline?.name}</h3>
              <p className="text-xs text-slate-500">{airline?.flightNumber} • {cabinDisplay}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-4 border border-slate-200 text-center items-center">
            <div>
              <span className="text-2xl font-bold text-slate-900">{origin}</span>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">{departureTime || '10:00 AM'}</p>
              <p className="text-[11px] text-slate-400">{departureDate}</p>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[11px] text-slate-500 mb-1">{duration || '2h 15m'}</span>
              <div className="w-full h-[2px] bg-slate-300 relative">
                <Plane className="w-3.5 h-3.5 text-sky-600 absolute left-1/2 -top-[6px] transform -translate-x-1/2 -rotate-45" />
              </div>
              <span className="text-[10px] text-emerald-700 mt-1 font-medium">Direct Flight</span>
            </div>

            <div>
              <span className="text-2xl font-bold text-slate-900">{destination}</span>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">{arrivalTime || '12:15 PM'}</p>
              <p className="text-[11px] text-slate-400">{departureDate}</p>
            </div>
          </div>
        </div>

        {/* Passenger & Assigned Seat */}
        <div className="p-6 border-b border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center">
            <User className="w-4 h-4 text-sky-600 mr-2" />
            Passenger & Assigned Seat
          </h4>

          <div className="space-y-2">
            {passengers?.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 text-sm">
                    {p.firstName} {p.lastName}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{p.email} • {p.phone}</p>
                  <span className="text-[11px] text-slate-600 mt-0.5 block">Meal: {p.meal || 'Complimentary Veg'}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase text-slate-500 block font-semibold">Seat Number</span>
                  <span className="font-mono font-bold text-sky-700 text-base px-2.5 py-0.5 bg-sky-50 border border-sky-200 rounded-lg inline-block">
                    {p.seat || '12A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment & Receipt Details */}
        <div className="p-6 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Total Amount Paid</span>
            <span className="text-2xl font-bold text-slate-900">
              ₹{totalAmount?.toLocaleString('en-IN')} {currency || 'INR'}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Razorpay Ref: {paymentDetails?.razorpayPaymentId || 'pay_confirmed'}
            </p>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto print:hidden">
            <button
              onClick={handlePrintTicket}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold flex items-center justify-center space-x-1.5 border border-slate-300 transition text-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Boarding Pass</span>
            </button>

            <button
              onClick={() => {
                clearBookingFlow();
                navigate('/my-bookings');
              }}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold flex items-center justify-center space-x-1.5 transition text-xs shadow-sm"
            >
              <span>View Bookings</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
