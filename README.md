# AeroIndex — Airfare Intelligence & Flight Booking Platform
### Smart India Hackathon (SIH 2026) | Problem Statement: Airfare Price Index & Monitoring for India

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)](https://vitejs.dev/)
[![API: Duffel](https://img.shields.io/badge/Flights%20API-Duffel%20Live-orange.svg)](https://duffel.com/)
[![Payments: Razorpay](https://img.shields.io/badge/Payments-Razorpay%20Sandbox-blue.svg)](https://razorpay.com/)

---

## 📌 Executive Summary

**AeroIndex** is an end-to-end Airfare Price Intelligence, Anomaly Detection, and Airline Booking Platform built for the Indian domestic aviation market. 

Unlike traditional travel portals that prioritize opaque commission markups, AeroIndex provides **transparent airfare benchmarking** using statistical modeling (Interquartile Range & Z-score surge detection), historical route baselines, and advance booking elasticity analysis. Additionally, it integrates a full **commercial flight reservation flow** with interactive aircraft cabin seat selection across all four travel classes (**Economy, Premium Economy, Business, and First Class**), verified against live GDS flight inventories via the Duffel API.

---

## ✈️ Key Features

### 1. Human-Centric Airline Portal Design (Clean Corporate UI)
- Professional, distraction-free light theme tailored for enterprise evaluation.
- Responsive layout with clear airline tags, transparent fee breakdowns, and real-time deal badges (*Great Deal*, *Fair Price*, *Surge Fare*).

### 2. Comprehensive Multi-Class Flight Search
- Search real-time flight inventory across all four cabin classes:
  - **Economy**
  - **Premium Economy**
  - **Business Class**
  - **First Class**
- Live multi-carrier inventory aggregation powered by Duffel API with automatic USD-to-INR normalization.

### 3. Interactive Aircraft Cabin Seat Selection (`/seat-selection`)
- **Realistic Aircraft Fuselage Layout**: Aerodynamic cockpit nose, emergency exits, and row markers.
- **Configurable Seating Configurations**:
  - Rows 1–3: **Business Class (2–2 layout)** with wide recliner legroom.
  - Rows 4–16: **Economy Class (3–3 layout)** with Window, Middle, and Aisle indicators and Exit-row space.
- **In-Flight Services**: Complimentary dining preferences (Vegetarian, Non-Vegetarian, Jain, Low-Calorie Diabetic) and extra baggage add-ons (+5kg, +10kg).
- **Dynamic Boarding Pass Preview**: Instant updates displaying assigned seat numbers and travel details prior to checkout.

### 4. Airfare Index & Pricing Intelligence Engine
- **Advance Booking Elasticity**: Simple, jury-explainable curve demonstrating price changes based on days prior to departure (e.g. 15–30 day advance booking sweet spot).
- **Airline Fee Decomposition**: Stacked analysis dissecting Base Fare, Mandatory Government Taxes (UDF/ADF + GST), and Airline Ancillary Fees.
- **Price Anomaly & Outlier Surveillance**: Flags abnormal fare spikes or flash price drops using Statistical IQR and Z-Scores ($Z > 2.5$).
- **Round-Trip vs 2x One-Way Arbitrage**: Direct sector-by-sector savings comparison evaluating bundled ticket benefits.

### 5. Secure Payment & Booking Fulfillment
- **Razorpay Sandbox Integration**: Seamless, test-mode payment gateway integration.
- **Instant PNR & E-Ticket Generation**: Issues unique 6-character PNR booking references with Duffel order synchronization.
- **Booking Management (`/my-bookings`)**: Trip itinerary dashboard showing upcoming reservations, assigned seat numbers, and meal requests.

---

## 🏛️ System Architecture

```
                       ┌───────────────────────────────────────┐
                       │       React 18 + Vite Frontend        │
                       │   (Tailwind CSS, Recharts, Lucide)    │
                       └──────────────────┬────────────────────┘
                                          │ HTTP / REST
                                          ▼
                       ┌───────────────────────────────────────┐
                       │       Node.js + Express Backend       │
                       │          (Port 5000 / API)            │
                       └─────┬───────────────────────────┬─────┘
                             │                           │
              ┌──────────────┴──────────┐     ┌──────────┴──────────────┐
              ▼                         ▼     ▼                         ▼
   ┌────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
   │  Duffel Flights    │   │  Razorpay Gateway   │   │  Airfare Analytics  │
   │  Live GDS API      │   │  (Payment Sandbox)  │   │  DB & Outlier Model │
   └────────────────────┘   └─────────────────────┘   └─────────────────────┘
```

---

## 📁 Repository Directory Structure

```
final 2k26/
├── frontend/                     # React + Vite Client Application
│   ├── src/
│   │   ├── components/           # Navbar, Footer, SearchBar, FlightCard
│   │   ├── pages/                # Clean Light Theme Application Pages
│   │   │   ├── HomePage.jsx               # Airfare Index overview & search
│   │   │   ├── BookFlightsPage.jsx        # Multi-class reservation portal
│   │   │   ├── SearchResultsPage.jsx      # Aggregated flight results
│   │   │   ├── SeatSelectionPage.jsx      # Interactive aircraft seat map
│   │   │   ├── PassengerFormPage.jsx      # Traveler details collection
│   │   │   ├── ReviewBookingPage.jsx      # Pre-payment boarding pass preview
│   │   │   ├── PaymentPage.jsx            # Razorpay checkout execution
│   │   │   ├── ConfirmationPage.jsx       # Issued PNR & printable boarding pass
│   │   │   ├── MyBookingsPage.jsx         # Reservation history & assigned seats
│   │   │   ├── RouteExplorerPage.jsx      # Sector dossiers & volatility metrics
│   │   │   ├── BookingWindowPage.jsx      # Days-in-advance price curve
│   │   │   ├── AirlineOtaAnalyticsPage.jsx# Fee decomposition & OTA comparison
│   │   │   ├── AnomaliesPage.jsx          # IQR / Z-Score surge surveillance
│   │   │   └── RoundTripPage.jsx          # Round-trip vs 2x one-way analysis
│   │   ├── context/              # AuthContext & BookingContext
│   │   ├── services/api.js       # Axios API client
│   │   └── index.css             # Light airline styling & typography
│   └── package.json
│
├── backend/                      # Node.js + Express REST API Server
│   ├── src/
│   │   ├── controllers/          # Booking, Flight, Payment & Analytics handlers
│   │   ├── models/               # Booking, FlightSearch, User, Payment schemas
│   │   ├── routes/               # Modular Express API endpoints
│   │   ├── services/
│   │   │   ├── duffelService.js      # Duffel GDS API integration & offer mapping
│   │   │   ├── razorpayService.js    # Razorpay order generation & signature verify
│   │   │   └── airfareIndexService.js# Statistical median, IQR, & volatility logic
│   │   └── server.js             # Express app bootstrap & route registration
│   ├── .env.example              # Environment variables template
│   └── package.json
│
├── analytics/                    # Python Data Pipeline & ML Models
│   ├── data/                     # Historical flight observations database (JSON)
│   ├── pipeline.py               # Data normalization & metric computation
│   └── generate_raw_data.py      # Airline and OTA observation generator
│
├── .gitignore                    # Prevents node_modules & private API keys upload
├── README.md                     # Project documentation & presentation guide
└── package.json                  # Root runner script
```

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or later
- **npm**: v9.0.0 or later
- **Git** installed on your system

### 1. Clone the Repository
```bash
git clone https://github.com/maulik-kapoor/airfare-index-india.git
cd airfare-index-india
```

### 2. Configure Backend Environment
Navigate to `backend/` and verify the `.env` configuration:
```bash
cd backend
cp .env.example .env
```
Ensure `.env` contains valid credentials:
```ini
PORT=5000
NODE_ENV=development
DUFFEL_ACCESS_TOKEN=duffel_test_...
RAZORPAY_KEY_ID=rzp_test_airfare2026mock
RAZORPAY_KEY_SECRET=mock_secret_key_12345
CLIENT_URL=http://localhost:5173
```

### 3. Install Dependencies & Launch

**Terminal 1 — Backend Server:**
```bash
cd backend
npm install
npm run dev
# Backend starts on http://localhost:5000
```

**Terminal 2 — Frontend Application:**
```bash
cd frontend
npm install
npm run dev
# Frontend accessible at http://localhost:5173
```

---

## 🧪 Evaluator & Jury Presentation Guide

To conduct a seamless 3-minute jury walkthrough:

1. **Airfare Intelligence Dashboard (`/`)**:
   - Highlight the **Median Price Benchmarks** across primary domestic trunk sectors (Delhi ➔ Mumbai, Bangalore, etc.).
   - Demonstrate the **"Best Time to Book" chart**: show why booking 15–30 days ahead minimizes traveler expenditure compared to last-minute spikes.

2. **Flight Search with Cabin Classes (`/book-flights`)**:
   - Select Origin: `DEL` and Destination: `BOM`.
   - Switch between **Economy**, **Premium Economy**, and **Business Class**.
   - Click **Search Flights** to retrieve live flight records with baggage allowances and deal ratings.

3. **Passenger Info & Interactive Seat Map (`/seat-selection`)**:
   - Enter passenger details and proceed to the aircraft cabin.
   - Click to assign a seat (e.g. `2A Business Window` or `12A Economy Window`).
   - Select in-flight meal options (e.g. `Vegetarian Meal`) and note the real-time boarding pass update.

4. **Review, Payment & Instant Confirmation (`/review-booking` & `/confirmation`)**:
   - Verify the transparent itemized fare decomposition.
   - Execute test payment with Razorpay.
   - View the generated **PNR / Booking Reference** and official printable boarding pass.
   - Check **My Bookings** in the navbar to confirm persistence.

---

## 🛡️ License
This project is developed for educational and hackathon evaluation purposes under the **MIT License**.
