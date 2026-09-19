import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  User,
  CreditCard,
  Plane,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  FileCheck,
  Sparkles,
  AlertCircle,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { useBooking } from '../context/BookingContext.jsx';
import api from '../services/api.js';
import { getOfferTransitInfo } from '../services/transitService.js';

export default function InternationalVerificationPage() {
  const navigate = useNavigate();
  const { selectedOffer, selectFlight, passengers, setPassengers } = useBooking();

  // Redirect if no offer is selected
  useEffect(() => {
    if (!selectedOffer) {
      navigate('/book-flights');
    }
  }, [selectedOffer, navigate]);

  // PNR Booking Hold state
  const [holdPnr, setHoldPnr] = useState('HOLD-' + Math.random().toString(36).substring(2, 8).toUpperCase());
  const [holdSeconds, setHoldSeconds] = useState(1200); // 20 minutes

  // Countdown timer for PNR Hold
  useEffect(() => {
    const timer = setInterval(() => {
      setHoldSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const transitInfo = selectedOffer ? getOfferTransitInfo(selectedOffer) : null;
  const isRoute1 = transitInfo?.routeKey === 'DEL-AMS-MSP-YYZ' || selectedOffer?.stopover?.includes('Minneapolis');
  const isRoute2 = transitInfo?.routeKey === 'DEL-CDG-AMS-YYZ' || selectedOffer?.stopover?.includes('Paris');

  // Form states
  const [passengerDetails, setPassengerDetails] = useState(
    passengers[0] || {
      firstName: 'Tech',
      lastName: 'Titans',
      dateOfBirth: '1998-07-20',
      gender: 'male',
      email: 'techtitans@example.com',
      phone: '+91 9876543210',
    }
  );

  const [passportDetails, setPassportDetails] = useState({
    nationality: 'India',
    passportNumber: 'Z5839201',
    expiryDate: '2031-08-15',
  });

  const [transitDocuments, setTransitDocuments] = useState({
    destinationVisa: 'canadian_visa', // canadian_visa, canadian_eta, canadian_citizen, none
    transit1: isRoute1 ? 'international_transit' : 'atv_visa', // Netherlands AMS or France CDG
    transit2: isRoute1 ? 'none' : 'none', // Minneapolis US or Amsterdam Schengen
  });

  // Verification Results
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null); // null, 'APPROVED', 'NOT_SUITABLE'
  const [verificationReasons, setVerificationReasons] = useState([]);
  const [recommendedRoutes, setRecommendedRoutes] = useState([]);

  if (!selectedOffer) return null;

  const handleRunVerification = async () => {
    setIsVerifying(true);
    setVerificationResult(null);
    setVerificationReasons([]);

    try {
      // Call backend verification API
      const res = await api.post('/flights/verify-transit', {
        offerId: selectedOffer.offerId || selectedOffer.id,
        passenger: passengerDetails,
        passport: passportDetails,
        transitDocuments,
      });

      if (res.success) {
        setVerificationResult(res.status);
        setVerificationReasons(res.reasons || []);
        setRecommendedRoutes(res.recommendedRoutes || []);
      } else {
        // Fallback local verification logic
        runLocalVerification();
      }
    } catch (err) {
      // Fallback local verification logic
      runLocalVerification();
    } finally {
      setIsVerifying(false);
    }
  };

  const runLocalVerification = () => {
    const reasons = [];
    let approved = true;

    // Check Canada destination
    const hasCanadaEntry = ['canadian_visa', 'canadian_eta', 'canadian_citizen'].includes(transitDocuments.destinationVisa);
    if (!hasCanadaEntry) {
      approved = false;
      reasons.push('Destination Clearance: A valid Canadian Visitor Visa or Electronic Travel Authorization (eTA) is required for entry into Canada.');
    }

    // Route 1 (DEL -> AMS -> MSP -> YYZ) requires US transit
    if (isRoute1) {
      const hasUs = ['us_visa', 'esta', 'us_citizen'].includes(transitDocuments.transit2);
      if (!hasUs) {
        approved = false;
        reasons.push('US Transit Clearance: Transit through Minneapolis-Saint Paul (MSP) requires an approved ESTA or valid US Transit Visa (C-1) / US Visitor Visa. The United States does not permit transit without visa (TWOV).');
      }
    }

    // Route 2 (DEL -> CDG -> AMS -> YYZ) has dual Schengen transit
    if (isRoute2) {
      const hasSchengen = ['schengen_visa', 'eu_citizen'].includes(transitDocuments.transit2) || ['schengen_visa', 'eu_citizen'].includes(transitDocuments.transit1);
      if (!hasSchengen) {
        approved = false;
        reasons.push('Schengen Entry Clearance: Traveling between Paris (CDG) and Amsterdam (AMS) is an internal Schengen flight, requiring Schengen immigration entry and a valid Schengen Short-Stay Visa.');
      }
    }

    setVerificationResult(approved ? 'APPROVED' : 'NOT_SUITABLE');
    setVerificationReasons(reasons);

    if (!approved) {
      setRecommendedRoutes([
        {
          id: 'predefined_del_yyz_direct',
          offerId: 'predefined_del_yyz_direct',
          airline: 'Air India',
          flightNumber: 'AI 187 (Non-Stop)',
          origin: 'DEL',
          destination: 'YYZ',
          duration: '14h 45m',
          stops: 0,
          price: 72500,
          currency: 'INR',
          badge: 'Recommended Direct Safe Route',
          reason: 'Zero intermediate transit stops. No US or Schengen transit visas needed.',
        },
        {
          id: 'alt_del_yyz_doh',
          offerId: 'alt_del_yyz_doh',
          airline: 'Qatar Airways',
          flightNumber: 'QR 571 / QR 767',
          origin: 'DEL',
          destination: 'YYZ',
          duration: '18h 30m',
          stops: 1,
          stopover: 'Doha (DOH)',
          price: 66800,
          currency: 'INR',
          badge: 'Single-Transit Alternative',
          reason: 'Single international transit in Doha. No transit visa required for baggage checked through.',
        },
      ]);
    }
  };

  const handleContinueBooking = () => {
    // Save updated passenger details to BookingContext
    setPassengers([
      {
        ...passengerDetails,
        passport: passportDetails,
        holdPnr,
        transitVerification: 'APPROVED',
      },
    ]);
    navigate('/review-booking');
  };

  const handleSwitchToDirectRoute = (route) => {
    const directOffer = {
      id: route.id || 'predefined_del_yyz_direct',
      offerId: route.offerId || 'predefined_del_yyz_direct',
      airline: route.airline || 'Air India',
      flightNumber: route.flightNumber || 'AI 187',
      origin: 'DEL',
      destination: 'YYZ',
      departureDate: selectedOffer.departureDate || '2026-10-15',
      departure: '02:45 AM',
      arrival: '07:30 AM',
      departureTime: '02:45',
      arrivalTime: '07:30',
      duration: route.duration || '14h 45m',
      stops: 0,
      stopover: null,
      price: route.price || 72500,
      currency: 'INR',
      fareBreakdown: {
        baseFare: 61500,
        taxes: 10900,
        fees: 100,
        total: route.price || 72500,
      },
      baggage: '2 x 23kg Checked + 7kg Cabin',
      cabinClass: selectedOffer.cabinClass || 'economy',
      passengersCount: selectedOffer.passengersCount || 1,
      airfareIndex: {
        priceIndex: 98,
        dealRating: 'FAIR_VALUE',
        dealLabel: 'Direct Safe Route',
      },
      transitInfo: null, // Direct flight: No transit info needed!
    };

    selectFlight(directOffer);
    setPassengers([
      {
        ...passengerDetails,
        passport: passportDetails,
      },
    ]);
    navigate('/review-booking');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium transition cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to flight overview</span>
      </button>

      {/* Header & Flow Indicator */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-2">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Mandatory International Verification Gate</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          International Booking Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Travel eligibility verification for multi-stop international itinerary: {selectedOffer.origin} ➔ {selectedOffer.destination}
        </p>
      </div>

      {/* STEP 1: PNR / BOOKING HOLD CARD */}
      <div className="bg-white rounded-2xl border-2 border-amber-300 p-6 shadow-sm overflow-hidden relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  PNR / BOOKING HOLD ACTIVE
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-lg font-mono font-bold text-slate-900 tracking-wider mt-0.5">
                {holdPnr}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200">
            <span className="text-[10px] uppercase font-bold text-amber-800 block">Fare Lock Timer</span>
            <span className="text-base font-mono font-bold text-amber-900">{formatTimer(holdSeconds)}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Selected Airline</span>
            <span className="font-bold text-slate-800">{selectedOffer.airline} ({selectedOffer.flightNumber})</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Itinerary & Stops</span>
            <span className="font-bold text-slate-800">{transitInfo?.routeDisplay || `${selectedOffer.origin} ➔ ${selectedOffer.destination}`}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Locked Fare</span>
            <span className="font-bold text-sky-700 text-sm">₹{selectedOffer.price?.toLocaleString('en-IN')} (Taxes incl.)</span>
          </div>
        </div>
      </div>

      {/* VERIFICATION FORM: STEPS 2, 3, 4 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
        {/* STEP 2: Passenger Details */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100 flex items-center">
            <User className="w-4 h-4 text-sky-600 mr-2" />
            1. Passenger Personal Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">First & Middle Name</label>
              <input
                type="text"
                value={passengerDetails.firstName}
                onChange={(e) => setPassengerDetails({ ...passengerDetails, firstName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Last Name / Surname</label>
              <input
                type="text"
                value={passengerDetails.lastName}
                onChange={(e) => setPassengerDetails({ ...passengerDetails, lastName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Date of Birth</label>
              <input
                type="date"
                value={passengerDetails.dateOfBirth}
                onChange={(e) => setPassengerDetails({ ...passengerDetails, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Gender</label>
              <select
                value={passengerDetails.gender}
                onChange={(e) => setPassengerDetails({ ...passengerDetails, gender: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none bg-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={passengerDetails.email}
                onChange={(e) => setPassengerDetails({ ...passengerDetails, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Contact Phone</label>
              <input
                type="tel"
                value={passengerDetails.phone}
                onChange={(e) => setPassengerDetails({ ...passengerDetails, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* STEP 3: Passport Details */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100 flex items-center">
            <FileCheck className="w-4 h-4 text-sky-600 mr-2" />
            2. Passport & Nationality Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Passport Issuing Country / Nationality</label>
              <select
                value={passportDetails.nationality}
                onChange={(e) => setPassportDetails({ ...passportDetails, nationality: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none bg-white font-medium"
              >
                <option value="India">India (Indian Passport)</option>
                <option value="United States">United States (US Passport)</option>
                <option value="Canada">Canada (Canadian Passport)</option>
                <option value="United Kingdom">United Kingdom (British Passport)</option>
                <option value="France">France (EU Passport)</option>
                <option value="Netherlands">Netherlands (EU Passport)</option>
                <option value="Other">Other Nationality</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Passport Number</label>
              <input
                type="text"
                value={passportDetails.passportNumber}
                onChange={(e) => setPassportDetails({ ...passportDetails, passportNumber: e.target.value })}
                placeholder="e.g. Z1234567"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Passport Expiry Date</label>
              <input
                type="date"
                value={passportDetails.expiryDate}
                onChange={(e) => setPassportDetails({ ...passportDetails, expiryDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* STEP 4: Visa / Transit Details */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100 flex items-center">
            <Plane className="w-4 h-4 text-sky-600 mr-2" />
            3. Visa & Transit Clearance Documentation
          </h2>

          <div className="space-y-4 mt-4">
            {/* Final Destination Document (Canada) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-900 flex items-center">
                  <span className="mr-1.5 text-base">🇨🇦</span> Final Destination Clearance: Toronto, Canada (YYZ)
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Mandatory Entry
                </span>
              </div>
              <label className="block text-slate-600 mb-1">Held Canadian Entry Authorization:</label>
              <select
                value={transitDocuments.destinationVisa}
                onChange={(e) => setTransitDocuments({ ...transitDocuments, destinationVisa: e.target.value })}
                className="w-full sm:w-80 px-3 py-2 rounded-lg border border-slate-300 focus:border-sky-500 focus:outline-none bg-white font-medium text-xs"
              >
                <option value="canadian_visa">Valid Canadian Visitor Visa (V-1)</option>
                <option value="canadian_eta">Approved Electronic Travel Authorization (eTA)</option>
                <option value="canadian_citizen">Canadian Citizen / Permanent Resident (PR)</option>
                <option value="none">No Canadian Visa / eTA held</option>
              </select>
            </div>

            {/* Route 1: Netherlands AMS + US MSP */}
            {isRoute1 && (
              <>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 flex items-center">
                      <span className="mr-1.5 text-base">🇳🇱</span> Transit 1 Clearance: Amsterdam Schiphol (AMS)
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                      Transit Stop 1
                    </span>
                  </div>
                  <label className="block text-slate-600 mb-1">Netherlands Airport Transit Status:</label>
                  <select
                    value={transitDocuments.transit1}
                    onChange={(e) => setTransitDocuments({ ...transitDocuments, transit1: e.target.value })}
                    className="w-full sm:w-80 px-3 py-2 rounded-lg border border-slate-300 focus:border-sky-500 focus:outline-none bg-white font-medium text-xs"
                  >
                    <option value="international_transit">International Airside Transit (Stay in transit area)</option>
                    <option value="schengen_visa">Valid Schengen Short-Stay Visa</option>
                    <option value="eu_residence">EU / US / Canada Residence Permit Holder</option>
                    <option value="none">Unsure / No Visa</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 flex items-center">
                      <span className="mr-1.5 text-base">🇺🇸</span> Transit 2 Clearance: Minneapolis-Saint Paul (MSP)
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-200 px-2 py-0.5 rounded">
                      US CBP Clearance Required
                    </span>
                  </div>
                  <label className="block text-slate-700 mb-1 font-semibold">Held United States Travel Document:</label>
                  <select
                    value={transitDocuments.transit2}
                    onChange={(e) => setTransitDocuments({ ...transitDocuments, transit2: e.target.value })}
                    className="w-full sm:w-80 px-3 py-2 rounded-lg border border-slate-300 focus:border-sky-500 focus:outline-none bg-white font-semibold text-xs"
                  >
                    <option value="none">None (No US Visa / No ESTA)</option>
                    <option value="us_visa">Valid US Visa (B1/B2 Visitor or C-1 Transit)</option>
                    <option value="esta">Approved ESTA (Visa Waiver Program National)</option>
                    <option value="us_citizen">U.S. Citizen / Lawful Permanent Resident</option>
                  </select>
                  <p className="text-[11px] text-amber-800 mt-2">
                    Notice: The United States does NOT allow international transit without a visa (TWOV). Passengers transiting through Minneapolis must hold a valid US Visa or ESTA.
                  </p>
                </div>
              </>
            )}

            {/* Route 2: France CDG + Netherlands AMS */}
            {isRoute2 && (
              <>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 flex items-center">
                      <span className="mr-1.5 text-base">🇫🇷</span> Transit 1 Clearance: Paris Charles de Gaulle (CDG)
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                      Transit Stop 1
                    </span>
                  </div>
                  <label className="block text-slate-600 mb-1">France Airport Transit Status:</label>
                  <select
                    value={transitDocuments.transit1}
                    onChange={(e) => setTransitDocuments({ ...transitDocuments, transit1: e.target.value })}
                    className="w-full sm:w-80 px-3 py-2 rounded-lg border border-slate-300 focus:border-sky-500 focus:outline-none bg-white font-medium text-xs"
                  >
                    <option value="atv_visa">Airport Transit Visa (ATV) / Exemption</option>
                    <option value="schengen_visa">Valid Schengen Short-Stay Visa</option>
                    <option value="eu_citizen">EU / Schengen Citizen</option>
                    <option value="none">No Visa</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 flex items-center">
                      <span className="mr-1.5 text-base">🇳🇱</span> Transit 2 Clearance: Amsterdam Schiphol (AMS)
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-200 px-2 py-0.5 rounded">
                      Intra-Schengen Domestic Flight
                    </span>
                  </div>
                  <label className="block text-slate-700 mb-1 font-semibold">Held Schengen Entry Visa for Dual European Stop:</label>
                  <select
                    value={transitDocuments.transit2}
                    onChange={(e) => setTransitDocuments({ ...transitDocuments, transit2: e.target.value })}
                    className="w-full sm:w-80 px-3 py-2 rounded-lg border border-slate-300 focus:border-sky-500 focus:outline-none bg-white font-semibold text-xs"
                  >
                    <option value="none">None (No Schengen Visa)</option>
                    <option value="schengen_visa">Valid Schengen Short-Stay Visa (Type C)</option>
                    <option value="eu_citizen">EU / EEA / Schengen Citizen</option>
                  </select>
                  <p className="text-[11px] text-amber-800 mt-2">
                    Notice: Transferring from Paris (CDG) to Amsterdam (AMS) requires an intra-Schengen internal flight. Non-exempt passengers must enter the Schengen Area with a valid Schengen visa.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* STEP 5: RUN TRANSIT ELIGIBILITY CHECK */}
        <div className="pt-2">
          <button
            type="button"
            disabled={isVerifying}
            onClick={handleRunVerification}
            className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition active:scale-98 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Validating Immigration Authorities & Transit Rules...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Run Transit Eligibility Check</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* STEP 6: VERIFICATION RESULT */}
      {verificationResult === 'APPROVED' && (
        <div className="bg-white rounded-2xl border-2 border-emerald-500 p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in duration-300">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 mb-1">
                <span>Verification Gate Result: APPROVED</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Travel Eligibility Confirmed
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Passenger <strong>{passengerDetails.firstName} {passengerDetails.lastName}</strong> ({passportDetails.nationality} Passport) satisfies the mandatory transit documentation requirements for this multi-stop itinerary.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-700">
              <span>Confirmed Booking Hold Reference:</span>
              <span className="font-mono font-bold text-slate-900">{holdPnr}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>Transit Clearances Verified:</span>
              <span className="font-semibold text-emerald-700">All intermediate stops authorized</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>Destination Clearance:</span>
              <span className="font-semibold text-emerald-700">Canada entry document valid</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={handleContinueBooking}
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition active:scale-98 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Continue Booking & Proceed to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {verificationResult === 'NOT_SUITABLE' && (
        <div className="bg-white rounded-2xl border-2 border-rose-400 p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in duration-300">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <XCircle className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200 mb-1">
                <span>Verification Gate Result: NOT SUITABLE</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Itinerary Not Suitable for Current Travel Documents
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Based on your submitted documentation, boarding this multi-stop itinerary would likely result in airline boarding denial or border clearance issues.
              </p>
            </div>
          </div>

          {/* Detailed Ineligibility Reasons */}
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2">
            <span className="font-bold block uppercase tracking-wider text-[10px] text-rose-800">Clearance Deficiencies Identified:</span>
            <ul className="list-disc pl-4 space-y-1">
              {verificationReasons.map((reason, idx) => (
                <li key={idx} className="leading-relaxed font-medium">{reason}</li>
              ))}
            </ul>
          </div>

          {/* RECOMMENDED DIRECT / SAFER ROUTES */}
          <div className="pt-2 space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recommended Direct / Safer Alternative Routes
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendedRoutes.map((route) => (
                <div
                  key={route.id}
                  className="bg-slate-50 border-2 border-sky-300 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-200">
                        {route.badge}
                      </span>
                      <span className="text-xs font-bold text-slate-900">₹{route.price.toLocaleString('en-IN')}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{route.airline} • {route.flightNumber}</h4>
                    <p className="text-xs text-slate-600 font-medium mt-1">
                      {route.origin} ➔ {route.destination} ({route.duration})
                    </p>
                    <p className="text-xs text-emerald-700 font-semibold mt-2">
                      ✓ {route.reason}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSwitchToDirectRoute(route)}
                    className="mt-4 w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition active:scale-98 flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Switch to this Safer Route & Book</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setVerificationResult(null)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline cursor-pointer"
              >
                Modify passport or visa document selections to retry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
