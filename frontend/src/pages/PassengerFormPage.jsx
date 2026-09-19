import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, ArrowRight, ChevronLeft, Plane, CheckCircle2 } from 'lucide-react';
import { useBooking } from '../context/BookingContext.jsx';

export default function PassengerFormPage() {
  const navigate = useNavigate();
  const { selectedOffer, passengers, setPassengers } = useBooking();

  // If user visits without selecting an offer, redirect to search
  if (!selectedOffer) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <Plane className="w-10 h-10 text-sky-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">No Flight Selected</h2>
          <p className="text-xs text-slate-500 mt-2">Please select a flight offer from search results first.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold"
          >
            Search Flights
          </button>
        </div>
      </div>
    );
  }

  const [formData, setFormData] = useState(
    passengers[0] || {
      firstName: 'Tech',
      lastName: 'Titans',
      dateOfBirth: '2004-05-14',
      gender: 'male',
      email: 'techtitans@example.com',
      phone: '+91 9876543210',
    }
  );

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleFillDemo = () => {
    setFormData({
      firstName: 'Tech',
      lastName: 'Titans',
      dateOfBirth: '2004-05-14',
      gender: 'male',
      email: 'techtitans@example.com',
      phone: '+91 9876543210',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required.';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required.';
    if (!formData.email.trim() || !formData.email.includes('@')) newErrors.email = 'Valid email is required.';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setPassengers([formData]);
    const isInternational = Boolean(selectedOffer?.transitInfo || selectedOffer?.destination === 'YYZ' || selectedOffer?.origin === 'YYZ');
    if (isInternational) {
      navigate('/international-verification');
    } else {
      navigate('/seat-selection');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-1.5 text-xs text-slate-600 hover:text-slate-900 mb-6 font-medium transition"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to flight details</span>
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-700">Step 2 of 5 • Passenger Details</span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Traveler Information
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Enter details as shown on your government ID / Passport.</p>
        </div>

        <button
          type="button"
          onClick={handleFillDemo}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-300 transition"
        >
          <span>Fill Demo Details</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Passenger Form (7 cols) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center">
                <User className="w-4 h-4 text-sky-600 mr-2" />
                Primary Passenger (Adult)
              </h2>
              <span className="text-[11px] text-slate-400">Government ID matching</span>
            </div>

            {/* Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  First / Given Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="e.g. Rahul"
                  className={`w-full bg-slate-50 border ${
                    errors.firstName ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                  } rounded-xl px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-sky-600 focus:bg-white`}
                />
                {errors.firstName && <p className="text-[11px] text-rose-600 mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Last / Family Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="e.g. Sharma"
                  className={`w-full bg-slate-50 border ${
                    errors.lastName ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                  } rounded-xl px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-sky-600 focus:bg-white`}
                />
                {errors.lastName && <p className="text-[11px] text-rose-600 mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Date of Birth and Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className={`w-full bg-slate-50 border ${
                    errors.dateOfBirth ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                  } rounded-xl px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-sky-600 focus:bg-white`}
                />
                {errors.dateOfBirth && <p className="text-[11px] text-rose-600 mt-1">{errors.dateOfBirth}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-sky-600 focus:bg-white cursor-pointer"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address * (For E-Ticket)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="traveler@example.com"
                    className={`w-full bg-slate-50 border ${
                      errors.email ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                    } rounded-xl pl-9 pr-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-sky-600 focus:bg-white`}
                  />
                </div>
                {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+91 9876543210"
                    className={`w-full bg-slate-50 border ${
                      errors.phone ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                    } rounded-xl pl-9 pr-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-sky-600 focus:bg-white`}
                  />
                </div>
                {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 transition shadow-sm active:scale-[0.99]"
              >
                <span>Save & Choose Seats</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Right: Selected Flight Summary Card */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 pb-3 border-b border-slate-100">
              Itinerary Overview
            </h3>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
                <Plane className="w-5 h-5 text-sky-600 transform -rotate-45" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{selectedOffer.airline}</h4>
                <p className="text-xs text-slate-500">{selectedOffer.flightNumber} • {selectedOffer.cabinClass?.toUpperCase() || 'ECONOMY'}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs mb-4 space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Route:</span>
                <span className="font-bold text-slate-900">{selectedOffer.origin} ➔ {selectedOffer.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Departure Date:</span>
                <span className="font-medium text-slate-800">{selectedOffer.departureDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Flight Timing:</span>
                <span className="font-medium text-slate-800">{selectedOffer.departure} - {selectedOffer.arrival} ({selectedOffer.duration})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Baggage:</span>
                <span className="font-medium text-slate-800">{selectedOffer.baggage || '15kg Checked'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="text-xs text-slate-500">Flight Base Fare</span>
              <span className="text-2xl font-bold text-slate-900">₹{selectedOffer.price?.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 text-right">Seat & baggage add-ons chosen on next step</p>
          </div>
        </div>
      </div>
    </div>
  );
}
