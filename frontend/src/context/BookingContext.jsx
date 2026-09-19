import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState({
    origin: 'DEL',
    destination: 'BOM',
    departureDate: '2026-10-15',
    returnDate: null,
    passengers: 1,
    cabinClass: 'economy',
  });

  const [selectedOffer, setSelectedOffer] = useState(null);
  const [passengers, setPassengers] = useState([
    {
      firstName: 'Tech',
      lastName: 'Titans',
      dateOfBirth: '2004-05-14',
      gender: 'male',
      email: 'techtitans@example.com',
      phone: '+91 9876543210',
      seat: '12A',
      meal: 'Complimentary Veg Meal',
    },
  ]);

  const [selectedSeats, setSelectedSeats] = useState({
    0: { number: '12A', type: 'Window', category: 'Standard', fee: 0 },
  });

  const [selectedAddons, setSelectedAddons] = useState({
    meal: 'Complimentary Veg Meal',
    baggageFee: 0,
    baggageLabel: 'Standard Allowance Included',
  });

  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const updateSearchQuery = (updates) => {
    setSearchQuery((prev) => ({ ...prev, ...updates }));
  };

  const selectFlight = (offer) => {
    setSelectedOffer(offer);
  };

  const clearBookingFlow = () => {
    setSelectedOffer(null);
    setConfirmedBooking(null);
    setSelectedSeats({});
  };

  return (
    <BookingContext.Provider
      value={{
        searchQuery,
        updateSearchQuery,
        selectedOffer,
        setSelectedOffer,
        selectFlight,
        passengers,
        setPassengers,
        selectedSeats,
        setSelectedSeats,
        selectedAddons,
        setSelectedAddons,
        confirmedBooking,
        setConfirmedBooking,
        clearBookingFlow,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
