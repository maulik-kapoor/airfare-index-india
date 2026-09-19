import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { BookingProvider } from './context/BookingContext.jsx';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

import HomePage from './pages/HomePage.jsx';
import RouteExplorerPage from './pages/RouteExplorerPage.jsx';
import BookingWindowPage from './pages/BookingWindowPage.jsx';
import AirlineOtaAnalyticsPage from './pages/AirlineOtaAnalyticsPage.jsx';
import AnomaliesPage from './pages/AnomaliesPage.jsx';
import RoundTripPage from './pages/RoundTripPage.jsx';
import HeatmapPage from './pages/HeatmapPage.jsx';
import BookFlightsPage from './pages/BookFlightsPage.jsx';
import SearchResultsPage from './pages/SearchResultsPage.jsx';
import FlightDetailsPage from './pages/FlightDetailsPage.jsx';
import PassengerFormPage from './pages/PassengerFormPage.jsx';
import SeatSelectionPage from './pages/SeatSelectionPage.jsx';
import ReviewBookingPage from './pages/ReviewBookingPage.jsx';
import PaymentPage from './pages/PaymentPage.jsx';
import ConfirmationPage from './pages/ConfirmationPage.jsx';
import MyBookingsPage from './pages/MyBookingsPage.jsx';
import TransitAdvisoryPage from './pages/TransitAdvisoryPage.jsx';
import InternationalVerificationPage from './pages/InternationalVerificationPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Airfare Intelligence Analytics Layer (Primary Identity) */}
                <Route path="/" element={<HomePage />} />
                <Route path="/analytics" element={<Navigate to="/" replace />} />
                <Route path="/route-explorer" element={<RouteExplorerPage />} />
                <Route path="/booking-windows" element={<BookingWindowPage />} />
                <Route path="/heatmap" element={<HeatmapPage />} />
                <Route path="/airline-ota-analytics" element={<AirlineOtaAnalyticsPage />} />
                <Route path="/anomalies" element={<AnomaliesPage />} />
                <Route path="/roundtrip-analytics" element={<RoundTripPage />} />

                {/* Flight Booking Layer (Secondary Feature) */}
                <Route path="/book-flights" element={<BookFlightsPage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/flights/:offerId" element={<FlightDetailsPage />} />
                <Route path="/passenger-details" element={<PassengerFormPage />} />
                <Route path="/seat-selection" element={<SeatSelectionPage />} />
                <Route path="/review-booking" element={<ReviewBookingPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/confirmation" element={<ConfirmationPage />} />
                <Route path="/my-bookings" element={<MyBookingsPage />} />
                <Route path="/transit-advisory" element={<TransitAdvisoryPage />} />
                <Route path="/international-verification" element={<InternationalVerificationPage />} />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </BookingProvider>
    </AuthProvider>
  );
}
