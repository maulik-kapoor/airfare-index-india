import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Plane, Calendar, User, Clock, AlertCircle, X, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

export default function MyBookingsPage() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, past, cancelled, all
  const [activeBookingModal, setActiveBookingModal] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings');
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const categorized = {
    all: bookings,
    upcoming: bookings.filter((b) => b.bookingStatus === 'confirmed' && (!b.departureDate || b.departureDate >= today)),
    past: bookings.filter((b) => b.bookingStatus === 'confirmed' && b.departureDate && b.departureDate < today),
    cancelled: bookings.filter((b) => b.bookingStatus === 'cancelled' || b.paymentStatus === 'failed'),
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Refund will be processed back to original source.')) {
      return;
    }

    try {
      const res = await api.post(`/bookings/${bookingId}/cancel`);
      if (res.success) {
        alert('Booking cancelled successfully.');
        fetchBookings();
        if (activeBookingModal && (activeBookingModal._id === bookingId || activeBookingModal.id === bookingId)) {
          setActiveBookingModal(null);
        }
      }
    } catch (err) {
      alert(err.message || 'Cancellation failed.');
    }
  };

  const displayedList = categorized[activeTab] || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-sky-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Ticket className="w-4 h-4" />
            <span>Reservations & Itineraries</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Flight Bookings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your confirmed airline tickets, Duffel PNR references, and assigned seats
          </p>
        </div>

        <Link
          to="/book-flights"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <Plane className="w-4 h-4" />
          <span>Book New Flight</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 text-xs">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1.5 ${
            activeTab === 'upcoming'
              ? 'bg-sky-50 text-sky-700 border border-sky-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Upcoming Trips</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-[10px]">{categorized.upcoming.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('past')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1.5 ${
            activeTab === 'past'
              ? 'bg-sky-50 text-sky-700 border border-sky-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Past Trips</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-[10px]">{categorized.past.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1.5 ${
            activeTab === 'cancelled'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Cancelled</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-[10px]">{categorized.cancelled.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1.5 ${
            activeTab === 'all'
              ? 'bg-slate-100 text-slate-900 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>All ({categorized.all.length})</span>
        </button>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse">
              <div className="h-5 bg-slate-100 rounded w-1/4 mb-3"></div>
              <div className="h-8 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {!loading && displayedList.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <Ticket className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No {activeTab} bookings found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {activeTab === 'upcoming'
              ? 'You have no active upcoming bookings. Search flights to book your next trip.'
              : 'No records in this trip category.'}
          </p>
          <Link
            to="/book-flights"
            className="mt-5 inline-block px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs"
          >
            Search Flights
          </Link>
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-4">
        {displayedList.map((b) => {
          const isConfirmed = b.bookingStatus === 'confirmed';
          return (
            <div
              key={b._id || b.id || b.bookingReference}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4">
                <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
                  <Plane className="w-5 h-5 text-sky-600 transform -rotate-45" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {b.origin} ➔ {b.destination}
                    </h3>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                        isConfirmed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {b.bookingStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {b.airline?.name || 'Airline'} ({b.airline?.flightNumber || 'Direct'}) • {b.departureDate} • Seat {b.passengers?.[0]?.seat || '12A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end space-x-6 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                <div className="text-left md:text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">
                    Booking PNR
                  </span>
                  <span className="font-mono font-bold text-sky-700 text-sm">{b.bookingReference}</span>
                </div>

                <div className="text-left md:text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">
                    Total Paid
                  </span>
                  <span className="font-bold text-slate-900 text-base">₹{b.totalAmount?.toLocaleString('en-IN')}</span>
                </div>

                <button
                  onClick={() => setActiveBookingModal(b)}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center space-x-1 border border-slate-200 transition"
                >
                  <span>Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Details Modal */}
      {activeBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 p-6 shadow-xl relative">
            <button
              onClick={() => setActiveBookingModal(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-1.5 text-sky-700 text-xs font-semibold mb-1">
              <Ticket className="w-4 h-4" />
              <span>BOOKING DOSSIER</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {activeBookingModal.origin} ➔ {activeBookingModal.destination}
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              PNR: <span className="font-mono font-bold text-sky-700">{activeBookingModal.bookingReference}</span>
            </p>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-slate-700">
                <div>
                  <span className="text-slate-500 block">Flight:</span>
                  <span className="font-bold text-slate-900">
                    {activeBookingModal.airline?.name} ({activeBookingModal.airline?.flightNumber})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Travel Date:</span>
                  <span className="font-bold text-slate-900">{activeBookingModal.departureDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Duffel Order ID:</span>
                  <span className="font-mono text-slate-700">{activeBookingModal.duffelOrderId || 'ord_live'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Status:</span>
                  <span className="font-bold uppercase text-emerald-700">{activeBookingModal.bookingStatus}</span>
                </div>
              </div>

              {/* Passengers */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Passengers & Seats</h4>
                <div className="space-y-1.5">
                  {activeBookingModal.passengers?.map((p, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{p.firstName} {p.lastName}</span>
                        <p className="text-[11px] text-slate-500">{p.email} • {p.phone}</p>
                        <span className="text-[11px] text-slate-600">Meal: {p.meal || 'Veg'}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded border border-sky-200">
                        Seat {p.seat || '12A'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block">Total Amount</span>
                  <span className="text-lg font-bold text-slate-900">₹{activeBookingModal.totalAmount?.toLocaleString('en-IN')}</span>
                </div>

                {activeBookingModal.bookingStatus === 'confirmed' && (
                  <button
                    onClick={() => handleCancelBooking(activeBookingModal._id || activeBookingModal.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
