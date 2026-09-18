import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Check,
  Utensils,
  Luggage,
  Info,
  Plane,
  Users,
} from 'lucide-react';
import { useBooking } from '../context/BookingContext.jsx';

export default function SeatSelectionPage() {
  const navigate = useNavigate();
  const {
    selectedOffer,
    passengers,
    setPassengers,
    selectedSeats,
    setSelectedSeats,
    selectedAddons,
    setSelectedAddons,
  } = useBooking();

  const [activePassengerIndex, setActivePassengerIndex] = useState(0);

  // If no offer is selected, redirect
  if (!selectedOffer) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <Plane className="w-10 h-10 text-sky-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">No Booking Active</h2>
          <p className="text-xs text-slate-500 mt-2">Please select a flight offer first.</p>
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

  const isBusinessClass = selectedOffer.cabinClass === 'business' || selectedOffer.cabinClass === 'first';

  // Seeded occupied seats so map looks completely authentic
  const occupiedSeats = new Set([
    '1C', '2A', '2D', '4B', '4E', '5C', '6A', '6F', '7B', '8D', '9A', '9E',
    '10B', '11C', '11F', '12D', '14A', '15B', '16E'
  ]);

  // Business class rows (1 to 3) - 2x2 layout (A, C, D, F)
  const businessRows = [1, 2, 3];
  // Economy rows (4 to 16) - 3x3 layout (A, B, C, D, E, F)
  const economyRows = [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16];

  const handleSelectSeat = (seatNumber, position, category, fee) => {
    if (occupiedSeats.has(seatNumber)) return;

    // Check if another passenger already took this seat
    const alreadyTakenBy = Object.entries(selectedSeats).find(
      ([pIdx, s]) => s.number === seatNumber && Number(pIdx) !== activePassengerIndex
    );
    if (alreadyTakenBy) {
      alert(`Seat ${seatNumber} is already selected for Passenger ${Number(alreadyTakenBy[0]) + 1}.`);
      return;
    }

    const updated = {
      ...selectedSeats,
      [activePassengerIndex]: {
        number: seatNumber,
        type: position,
        category,
        fee,
      },
    };
    setSelectedSeats(updated);

    // Also update passenger array with assigned seat
    const updatedPassengers = [...passengers];
    if (updatedPassengers[activePassengerIndex]) {
      updatedPassengers[activePassengerIndex].seat = seatNumber;
      updatedPassengers[activePassengerIndex].seatType = `${category} (${position})`;
      setPassengers(updatedPassengers);
    }
  };

  const handleMealChange = (meal) => {
    setSelectedAddons((prev) => ({ ...prev, meal }));
    const updatedPassengers = [...passengers];
    if (updatedPassengers[activePassengerIndex]) {
      updatedPassengers[activePassengerIndex].meal = meal;
      setPassengers(updatedPassengers);
    }
  };

  const handleBaggageChange = (fee, label) => {
    setSelectedAddons((prev) => ({ ...prev, baggageFee: fee, baggageLabel: label }));
  };

  // Calculate total seat fees
  const totalSeatFees = Object.values(selectedSeats).reduce((acc, curr) => acc + (curr.fee || 0), 0);
  const totalBaggageFees = selectedAddons.baggageFee || 0;
  const currentTotal = selectedOffer.price + totalSeatFees + totalBaggageFees;

  const handleContinue = () => {
    // Ensure all passengers have a seat assigned
    const missingSeats = passengers.some((_, idx) => !selectedSeats[idx]?.number);
    if (missingSeats) {
      // Auto-assign default available seat if any passenger missed
      passengers.forEach((_, idx) => {
        if (!selectedSeats[idx]?.number) {
          selectedSeats[idx] = { number: `${12 + idx}A`, type: 'Window', category: 'Standard', fee: 0 };
        }
      });
    }
    navigate('/review-booking');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-1.5 text-xs text-slate-600 hover:text-slate-900 mb-6 font-medium transition"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to passenger details</span>
      </button>

      {/* Header & Steps */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-sky-700 mb-1">
            <span>Step 3 of 5</span>
            <span>•</span>
            <span>Interactive Seat Selection</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Choose Your Seats & In-Flight Preferences
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Flight {selectedOffer.airline} {selectedOffer.flightNumber} • {selectedOffer.origin} ➔ {selectedOffer.destination} ({selectedOffer.aircraft || 'Airbus A321'})
          </p>
        </div>

        {/* Selected Seat Pill */}
        <div className="flex items-center space-x-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm text-xs font-medium">
          <span className="text-slate-500">Active Passenger:</span>
          <span className="font-semibold text-slate-900">
            {passengers[activePassengerIndex]?.firstName || 'Traveler'} {passengers[activePassengerIndex]?.lastName || ''}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-bold border border-sky-200">
            {selectedSeats[activePassengerIndex]?.number || 'No Seat Selected'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Interactive Airplane Cabin Map (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Aircraft Cabin Seat Map</h2>
                <p className="text-xs text-slate-500">Click any available seat to assign to the active passenger</p>
              </div>

              {/* Passenger Switcher if multi-passenger */}
              {passengers.length > 1 && (
                <div className="flex items-center space-x-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
                  {passengers.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePassengerIndex(idx)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition ${
                        activePassengerIndex === idx
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      P{idx + 1}: {p.firstName} ({selectedSeats[idx]?.number || '—'})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Seat Map Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-6">
              <div className="flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-md bg-white border border-slate-300 shadow-2xs block"></span>
                <span>Available</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-md bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold">
                  <Check className="w-3 h-3" />
                </span>
                <span>Selected</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-400 border border-slate-300 flex items-center justify-center text-[9px] font-bold">
                  ✕
                </span>
                <span>Occupied</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-md bg-emerald-50 border border-emerald-400 block"></span>
                <span>Extra Legroom (+₹350)</span>
              </div>
            </div>

            {/* Aircraft Fuselage Layout */}
            <div className="max-w-md mx-auto bg-slate-50/80 rounded-3xl p-6 border-2 border-slate-200 relative overflow-hidden">
              {/* Airplane Cockpit Nose */}
              <div className="w-24 h-10 mx-auto -mt-6 bg-slate-200 rounded-t-full border border-slate-300 flex items-center justify-center mb-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cockpit</span>
              </div>

              {/* Business Class Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-[11px] font-bold text-sky-800 uppercase tracking-wider bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200 mb-3">
                  <span>Business Class (Rows 1–3)</span>
                  <span className="text-[10px] font-normal text-sky-700">2-2 Lie-flat layout</span>
                </div>

                <div className="space-y-2">
                  {businessRows.map((row) => {
                    const rowSeats = ['A', 'C', 'D', 'F'];
                    return (
                      <div key={row} className="flex items-center justify-between px-2">
                        {/* Left Pair: A, C */}
                        <div className="flex space-x-2">
                          {['A', 'C'].map((col) => {
                            const seatNumber = `${row}${col}`;
                            const isOccupied = occupiedSeats.has(seatNumber);
                            const isSelected = Object.values(selectedSeats).some((s) => s.number === seatNumber);
                            const isCurrentPassenger = selectedSeats[activePassengerIndex]?.number === seatNumber;

                            return (
                              <button
                                key={seatNumber}
                                disabled={isOccupied}
                                onClick={() =>
                                  handleSelectSeat(
                                    seatNumber,
                                    col === 'A' ? 'Window' : 'Aisle',
                                    'Business Lie-flat',
                                    isBusinessClass ? 0 : 1800
                                  )
                                }
                                title={isOccupied ? `Seat ${seatNumber} (Occupied)` : `Seat ${seatNumber} (Business)`}
                                className={`w-9 h-10 rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition border ${
                                  isOccupied
                                    ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                                    : isCurrentPassenger
                                    ? 'bg-sky-600 text-white border-sky-700 shadow-sm'
                                    : isSelected
                                    ? 'bg-sky-100 text-sky-800 border-sky-300'
                                    : 'bg-white hover:bg-sky-50 text-slate-800 border-slate-300 hover:border-sky-400'
                                }`}
                              >
                                <span>{seatNumber}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Aisle */}
                        <div className="w-8 text-center text-[10px] font-bold text-slate-400">
                          {row}
                        </div>

                        {/* Right Pair: D, F */}
                        <div className="flex space-x-2">
                          {['D', 'F'].map((col) => {
                            const seatNumber = `${row}${col}`;
                            const isOccupied = occupiedSeats.has(seatNumber);
                            const isSelected = Object.values(selectedSeats).some((s) => s.number === seatNumber);
                            const isCurrentPassenger = selectedSeats[activePassengerIndex]?.number === seatNumber;

                            return (
                              <button
                                key={seatNumber}
                                disabled={isOccupied}
                                onClick={() =>
                                  handleSelectSeat(
                                    seatNumber,
                                    col === 'F' ? 'Window' : 'Aisle',
                                    'Business Lie-flat',
                                    isBusinessClass ? 0 : 1800
                                  )
                                }
                                title={isOccupied ? `Seat ${seatNumber} (Occupied)` : `Seat ${seatNumber} (Business)`}
                                className={`w-9 h-10 rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition border ${
                                  isOccupied
                                    ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                                    : isCurrentPassenger
                                    ? 'bg-sky-600 text-white border-sky-700 shadow-sm'
                                    : isSelected
                                    ? 'bg-sky-100 text-sky-800 border-sky-300'
                                    : 'bg-white hover:bg-sky-50 text-slate-800 border-slate-300 hover:border-sky-400'
                                }`}
                              >
                                <span>{seatNumber}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Curtain Divider */}
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-dashed border-slate-300"></div>
                <span className="px-2 text-[10px] font-medium text-slate-400 uppercase">Cabin Divider</span>
                <div className="flex-1 border-t border-dashed border-slate-300"></div>
              </div>

              {/* Economy Class Section (3-3 Layout: A B C | D E F) */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 mb-3">
                  <span>Economy Class (Rows 4–16)</span>
                  <span className="text-[10px] font-normal text-slate-500">3-3 Standard layout</span>
                </div>

                <div className="space-y-1.5">
                  {economyRows.map((row) => {
                    const isExtraLegroom = row === 4;
                    return (
                      <div key={row} className="flex items-center justify-between">
                        {/* Left Side: A (Window), B (Middle), C (Aisle) */}
                        <div className="flex space-x-1">
                          {['A', 'B', 'C'].map((col) => {
                            const seatNumber = `${row}${col}`;
                            const isOccupied = occupiedSeats.has(seatNumber);
                            const isSelected = Object.values(selectedSeats).some((s) => s.number === seatNumber);
                            const isCurrentPassenger = selectedSeats[activePassengerIndex]?.number === seatNumber;
                            const position = col === 'A' ? 'Window' : col === 'B' ? 'Middle' : 'Aisle';
                            const fee = isExtraLegroom ? 350 : 0;

                            return (
                              <button
                                key={seatNumber}
                                disabled={isOccupied}
                                onClick={() =>
                                  handleSelectSeat(
                                    seatNumber,
                                    position,
                                    isExtraLegroom ? 'Extra Legroom' : 'Standard Economy',
                                    fee
                                  )
                                }
                                title={
                                  isOccupied
                                    ? `Seat ${seatNumber} (Occupied)`
                                    : `Seat ${seatNumber} (${position}${isExtraLegroom ? ' • Extra Legroom +₹350' : ' • Free'})`
                                }
                                className={`w-8 h-8 rounded-md text-[11px] font-medium flex items-center justify-center transition border ${
                                  isOccupied
                                    ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                                    : isCurrentPassenger
                                    ? 'bg-sky-600 text-white border-sky-700 shadow-xs'
                                    : isSelected
                                    ? 'bg-sky-100 text-sky-800 border-sky-300'
                                    : isExtraLegroom
                                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                {col}
                              </button>
                            );
                          })}
                        </div>

                        {/* Row Number in Aisle */}
                        <div className="w-6 text-center text-[10px] font-semibold text-slate-400">
                          {row}
                        </div>

                        {/* Right Side: D (Aisle), E (Middle), F (Window) */}
                        <div className="flex space-x-1">
                          {['D', 'E', 'F'].map((col) => {
                            const seatNumber = `${row}${col}`;
                            const isOccupied = occupiedSeats.has(seatNumber);
                            const isSelected = Object.values(selectedSeats).some((s) => s.number === seatNumber);
                            const isCurrentPassenger = selectedSeats[activePassengerIndex]?.number === seatNumber;
                            const position = col === 'F' ? 'Window' : col === 'E' ? 'Middle' : 'Aisle';
                            const fee = isExtraLegroom ? 350 : 0;

                            return (
                              <button
                                key={seatNumber}
                                disabled={isOccupied}
                                onClick={() =>
                                  handleSelectSeat(
                                    seatNumber,
                                    position,
                                    isExtraLegroom ? 'Extra Legroom' : 'Standard Economy',
                                    fee
                                  )
                                }
                                title={
                                  isOccupied
                                    ? `Seat ${seatNumber} (Occupied)`
                                    : `Seat ${seatNumber} (${position}${isExtraLegroom ? ' • Extra Legroom +₹350' : ' • Free'})`
                                }
                                className={`w-8 h-8 rounded-md text-[11px] font-medium flex items-center justify-center transition border ${
                                  isOccupied
                                    ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                                    : isCurrentPassenger
                                    ? 'bg-sky-600 text-white border-sky-700 shadow-xs'
                                    : isSelected
                                    ? 'bg-sky-100 text-sky-800 border-sky-300'
                                    : isExtraLegroom
                                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                {col}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Preferences & Add-ons Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Passenger Seat Allocation Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
              <Users className="w-4 h-4 text-sky-600 mr-2" />
              Seat Allocation
            </h3>

            <div className="space-y-3">
              {passengers.map((p, idx) => {
                const assigned = selectedSeats[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => setActivePassengerIndex(idx)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                      activePassengerIndex === idx
                        ? 'border-sky-500 bg-sky-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-slate-900 block">
                        Passenger {idx + 1}: {p.firstName} {p.lastName}
                      </span>
                      <span className="text-slate-500">
                        {assigned?.type ? `${assigned.type} Seat (${assigned.category})` : 'Click to select seat'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-lg bg-sky-600 text-white font-bold block">
                        {assigned?.number || 'Select'}
                      </span>
                      {assigned?.fee > 0 && (
                        <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                          +₹{assigned.fee}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* In-Flight Meal Selection */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
              <Utensils className="w-4 h-4 text-sky-600 mr-2" />
              In-Flight Meal Preference
            </h3>
            <p className="text-xs text-slate-500 mb-3">Complimentary on this route</p>

            <select
              value={selectedAddons.meal}
              onChange={(e) => handleMealChange(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-sky-500"
            >
              <option value="Complimentary Veg Meal">Standard Vegetarian Meal (Complimentary)</option>
              <option value="Non-Vegetarian Meal">Non-Vegetarian Meal (Complimentary)</option>
              <option value="Jain Meal">Jain Meal (No Onion / Garlic)</option>
              <option value="Diabetic Friendly Meal">Diabetic Friendly Light Meal</option>
              <option value="Fruit & Salad Platter">Fresh Fruit & Salad Platter</option>
            </select>
          </div>

          {/* Baggage Addon */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
              <Luggage className="w-4 h-4 text-sky-600 mr-2" />
              Excess Baggage
            </h3>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 cursor-pointer">
                <div className="flex items-center space-x-2.5">
                  <input
                    type="radio"
                    name="baggage"
                    checked={selectedAddons.baggageFee === 0}
                    onChange={() => handleBaggageChange(0, 'Standard Allowance Included')}
                    className="text-sky-600"
                  />
                  <div>
                    <span className="font-semibold text-slate-900 block">Standard Included</span>
                    <span className="text-slate-500">{selectedOffer.baggage || '15kg Check-in'}</span>
                  </div>
                </div>
                <span className="font-semibold text-emerald-600">Free</span>
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 cursor-pointer">
                <div className="flex items-center space-x-2.5">
                  <input
                    type="radio"
                    name="baggage"
                    checked={selectedAddons.baggageFee === 900}
                    onChange={() => handleBaggageChange(900, '+5kg Additional Baggage')}
                    className="text-sky-600"
                  />
                  <div>
                    <span className="font-semibold text-slate-900 block">+5 kg Prepaid Baggage</span>
                    <span className="text-slate-500">Save 40% vs airport counter</span>
                  </div>
                </div>
                <span className="font-semibold text-slate-900">+₹900</span>
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 cursor-pointer">
                <div className="flex items-center space-x-2.5">
                  <input
                    type="radio"
                    name="baggage"
                    checked={selectedAddons.baggageFee === 1750}
                    onChange={() => handleBaggageChange(1750, '+10kg Additional Baggage')}
                    className="text-sky-600"
                  />
                  <div>
                    <span className="font-semibold text-slate-900 block">+10 kg Prepaid Baggage</span>
                    <span className="text-slate-500">Ideal for family / long stay</span>
                  </div>
                </div>
                <span className="font-semibold text-slate-900">+₹1,750</span>
              </label>
            </div>
          </div>

          {/* Pricing Summary & Proceed Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md">
            <div className="flex justify-between items-center text-xs text-slate-300 mb-2">
              <span>Flight Fare ({passengers.length} Passenger{passengers.length > 1 ? 's' : ''}):</span>
              <span className="font-semibold text-white">₹{selectedOffer.price.toLocaleString('en-IN')}</span>
            </div>
            {totalSeatFees > 0 && (
              <div className="flex justify-between items-center text-xs text-slate-300 mb-2">
                <span>Seat Selection Fees:</span>
                <span className="font-semibold text-emerald-400">+₹{totalSeatFees.toLocaleString('en-IN')}</span>
              </div>
            )}
            {totalBaggageFees > 0 && (
              <div className="flex justify-between items-center text-xs text-slate-300 mb-2">
                <span>Extra Baggage:</span>
                <span className="font-semibold text-emerald-400">+₹{totalBaggageFees.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline mb-5">
              <div>
                <span className="text-xs text-slate-400 block">Total Payable</span>
                <span className="text-2xl font-bold text-white">₹{currentTotal.toLocaleString('en-IN')}</span>
              </div>
              <span className="text-xs text-slate-400">INR (All taxes incl.)</span>
            </div>

            <button
              onClick={handleContinue}
              className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 transition shadow-sm active:scale-[0.99]"
            >
              <span>Confirm Seats & Review Booking</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
