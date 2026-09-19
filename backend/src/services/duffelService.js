import { Duffel } from '@duffel/api';
import { config } from '../config/config.js';
import { enrichOfferWithIndex, getRouteBaseline } from './airfareIndexService.js';

let duffelClient = null;
if (config.duffelAccessToken) {
  try {
    duffelClient = new Duffel({ token: config.duffelAccessToken });
    console.log('✈️  Duffel API Client initialized with access token.');
  } catch (err) {
    console.warn('⚠️  Could not initialize Duffel client:', err.message);
  }
}

// In-memory cache of offers for instant retrieval and price validation during booking flow
const offerCache = new Map();

/**
 * High-fidelity realistic flight generator for testing/sandbox
 */
function generateRealisticOffers({ origin, destination, departureDate, passengers = 1, cabinClass = 'economy' }) {
  const baseline = getRouteBaseline(origin, destination);
  const basePrice = baseline.historicalMedian;

  const airlinesConfig = [
    {
      airline: 'IndiGo',
      iata: '6E',
      logoUrl: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=100&auto=format&fit=crop&q=60',
      flightNumber: '6E 5021',
      departure: '06:00 AM',
      arrival: '08:15 AM',
      departureTime: '06:00',
      arrivalTime: '08:15',
      duration: '2h 15m',
      stops: 0,
      baseMultiplier: 0.87, // ~ ₹5,050 for DEL-BOM (Great deal)
      baggage: '7kg Cabin + 15kg Check-in',
      aircraft: 'Airbus A321neo',
    },
    {
      airline: 'Air India',
      iata: 'AI',
      logoUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=100&auto=format&fit=crop&q=60',
      flightNumber: 'AI 805',
      departure: '08:30 AM',
      arrival: '10:45 AM',
      departureTime: '08:30',
      arrivalTime: '10:45',
      duration: '2h 15m',
      stops: 0,
      baseMultiplier: 0.93, // ~ ₹5,400 (Good value)
      baggage: '7kg Cabin + 25kg Check-in (Complimentary Meal)',
      aircraft: 'Boeing 787 Dreamliner',
    },
    {
      airline: 'Vistara',
      iata: 'UK',
      logoUrl: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=100&auto=format&fit=crop&q=60',
      flightNumber: 'UK 995',
      departure: '10:20 AM',
      arrival: '12:35 PM',
      departureTime: '10:20',
      arrivalTime: '12:35',
      duration: '2h 15m',
      stops: 0,
      baseMultiplier: 1.05, // ~ ₹6,100 (Premium full service)
      baggage: '7kg Cabin + 15kg Check-in (Meal Included)',
      aircraft: 'Airbus A321neo',
    },
    {
      airline: 'Akasa Air',
      iata: 'QP',
      logoUrl: 'https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?w=100&auto=format&fit=crop&q=60',
      flightNumber: 'QP 1102',
      departure: '02:45 PM',
      arrival: '05:00 PM',
      departureTime: '14:45',
      arrivalTime: '17:00',
      duration: '2h 15m',
      stops: 0,
      baseMultiplier: 0.89, // ~ ₹5,160
      baggage: '7kg Cabin + 15kg Check-in',
      aircraft: 'Boeing 737 MAX',
    },
    {
      airline: 'IndiGo (1 Stop)',
      iata: '6E',
      logoUrl: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=100&auto=format&fit=crop&q=60',
      flightNumber: '6E 214',
      departure: '04:10 PM',
      arrival: '09:25 PM',
      departureTime: '16:10',
      arrivalTime: '21:25',
      duration: '5h 15m',
      stops: 1,
      stopover: 'Jaipur (JAI) 1h 20m',
      baseMultiplier: 0.81, // ~ ₹4,700
      baggage: '7kg Cabin + 15kg Check-in',
      aircraft: 'Airbus A320neo',
    },
    {
      airline: 'Air India Express (Surge)',
      iata: 'IX',
      logoUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=100&auto=format&fit=crop&q=60',
      flightNumber: 'IX 349',
      departure: '08:00 PM',
      arrival: '10:15 PM',
      departureTime: '20:00',
      arrivalTime: '22:15',
      duration: '2h 15m',
      stops: 0,
      baseMultiplier: 1.68, // ~ ₹9,800 Anomaly test case!
      baggage: '7kg Cabin + 15kg Check-in',
      aircraft: 'Boeing 737-800',
    },
  ];

  return airlinesConfig.map((item, idx) => {
    const cabinMultipliers = {
      economy: 1.0,
      premium_economy: 1.45,
      business: 2.35,
      first: 3.8,
    };
    const classMultiplier = cabinMultipliers[cabinClass] || 1.0;

    const cabinBaggage = {
      economy: item.baggage || '7kg Cabin + 15kg Checked',
      premium_economy: '10kg Cabin + 25kg Checked (Extra Legroom & Priority)',
      business: '12kg Cabin + 35kg Checked (Lounge Access & Priority Boarding)',
      first: '15kg Cabin + 45kg Checked (Private Suite, Fine Dining & Fast Track)',
    };

    const rawPrice = Math.round((basePrice * item.baseMultiplier * classMultiplier * passengers) / 10) * 10;
    const taxes = Math.round(rawPrice * 0.14);
    const fees = 100 * passengers;
    const baseFare = rawPrice - taxes - fees;
    const offerId = `mock_off_${origin.toLowerCase()}${destination.toLowerCase()}_${Date.now().toString(36)}_${idx}`;

    const offer = {
      id: offerId,
      offerId,
      isMock: true,
      airline: item.airline,
      airlineCode: item.iata,
      logoUrl: item.logoUrl,
      flightNumber: item.flightNumber,
      aircraft: item.aircraft,
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departureDate,
      departure: item.departure,
      arrival: item.arrival,
      departureTime: item.departureTime,
      arrivalTime: item.arrivalTime,
      duration: item.duration,
      stops: item.stops,
      stopover: item.stopover || null,
      baggage: cabinClass === 'economy' ? item.baggage : cabinBaggage[cabinClass],
      cabinClass,
      passengersCount: passengers,
      price: rawPrice,
      currency: 'INR',
      fareBreakdown: {
        baseFare,
        taxes,
        fees,
        total: rawPrice,
      },
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes validity
      createdAt: new Date().toISOString(),
    };

    // Cache the generated offer
    offerCache.set(offerId, offer);

    // Enrich with the Airfare Index layer!
    return enrichOfferWithIndex(offer, origin, destination, departureDate);
  });
}

/**
 * Predefined routes with Transit & Visa Requirements
 * ROUTE 1: DEL -> AMS -> MSP -> YYZ (Amsterdam & Minneapolis transits)
 * ROUTE 2: DEL -> CDG -> AMS -> YYZ (Paris & Amsterdam transits)
 */
export const PREDEFINED_TRANSIT_ROUTES = {
  'DEL-AMS-MSP-YYZ': {
    routeKey: 'DEL-AMS-MSP-YYZ',
    routeDisplay: 'Delhi → Amsterdam → Minneapolis → Toronto',
    stops: 2,
    stopover: 'Amsterdam (AMS) & Minneapolis (MSP)',
    transits: [
      { flag: '🇳🇱', label: 'Amsterdam, Netherlands', code: 'AMS', country: 'Netherlands' },
      { flag: '🇺🇸', label: 'Minneapolis, United States', code: 'MSP', country: 'United States' },
    ],
    finalDestination: 'Toronto, Canada',
    destinationCode: 'YYZ',
    originCode: 'DEL',
    message: "This itinerary includes transit through the Netherlands and the United States. Transit and immigration requirements may depend on the passenger's nationality, passport, visa/residence status and itinerary conditions.",
    authorityAdvisory: 'Transit requirements should be verified with the relevant official immigration authority before travel.',
  },
  'DEL-CDG-AMS-YYZ': {
    routeKey: 'DEL-CDG-AMS-YYZ',
    routeDisplay: 'Delhi → Paris → Amsterdam → Toronto',
    stops: 2,
    stopover: 'Paris (CDG) & Amsterdam (AMS)',
    transits: [
      { flag: '🇫🇷', label: 'Paris, France', code: 'CDG', country: 'France' },
      { flag: '🇳🇱', label: 'Amsterdam, Netherlands', code: 'AMS', country: 'Netherlands' },
    ],
    finalDestination: 'Toronto, Canada',
    destinationCode: 'YYZ',
    originCode: 'DEL',
    message: "This itinerary includes transit through France and the Netherlands. Transit and immigration requirements may depend on the passenger's nationality, passport, visa/residence status and itinerary conditions.",
    authorityAdvisory: 'Transit requirements should be verified with the relevant official immigration authority before travel.',
  },
};

export function generatePredefinedTransitOffers({
  origin = 'DEL',
  destination = 'YYZ',
  departureDate = '2026-10-15',
  passengers = 1,
  cabinClass = 'economy',
}) {
  const cabinMultipliers = {
    economy: 1.0,
    premium_economy: 1.45,
    business: 2.35,
    first: 3.8,
  };
  const classMultiplier = cabinMultipliers[cabinClass] || 1.0;
  const cabinBaggage = {
    economy: '2 x 23kg Checked + 7kg Cabin',
    premium_economy: '2 x 23kg Checked + 10kg Cabin (Priority Boarding)',
    business: '2 x 32kg Checked + 14kg Cabin (Lounge Access)',
    first: '3 x 32kg Checked + 18kg Cabin (Private Suite)',
  };

  const rawRoute1Price = Math.round(64500 * classMultiplier * passengers);
  const taxes1 = Math.round(rawRoute1Price * 0.15);
  const fees1 = 100 * passengers;
  const baseFare1 = rawRoute1Price - taxes1 - fees1;

  const offer1Id = 'predefined_del_ams_msp_yyz';
  const offer1 = {
    id: offer1Id,
    offerId: offer1Id,
    routeCode: 'DEL-AMS-MSP-YYZ',
    airline: 'KLM / Delta Air Lines',
    airlineCode: 'KL',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/KL.svg',
    flightNumber: 'KL 872 / DL 142',
    aircraft: 'Boeing 777-300ER / Airbus A330',
    origin: 'DEL',
    destination: 'YYZ',
    departureDate,
    departure: '03:15 AM',
    arrival: '06:45 PM',
    departureTime: '03:15',
    arrivalTime: '18:45',
    duration: '24h 00m',
    stops: 2,
    stopover: 'Amsterdam (AMS) & Minneapolis (MSP)',
    baggage: cabinBaggage[cabinClass] || '2 x 23kg Checked + 7kg Cabin',
    cabinClass,
    passengersCount: passengers,
    price: rawRoute1Price,
    currency: 'INR',
    fareBreakdown: {
      baseFare: baseFare1,
      taxes: taxes1,
      fees: fees1,
      total: rawRoute1Price,
    },
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    airfareIndex: {
      priceIndex: 94,
      dealRating: 'GREAT_DEAL',
      dealLabel: 'Good Value',
      historicalMedian: 68500,
    },
    transitInfo: PREDEFINED_TRANSIT_ROUTES['DEL-AMS-MSP-YYZ'],
  };

  const rawRoute2Price = Math.round(62800 * classMultiplier * passengers);
  const taxes2 = Math.round(rawRoute2Price * 0.15);
  const fees2 = 100 * passengers;
  const baseFare2 = rawRoute2Price - taxes2 - fees2;

  const offer2Id = 'predefined_del_cdg_ams_yyz';
  const offer2 = {
    id: offer2Id,
    offerId: offer2Id,
    routeCode: 'DEL-CDG-AMS-YYZ',
    airline: 'Air France / KLM',
    airlineCode: 'AF',
    logoUrl: 'https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/AF.svg',
    flightNumber: 'AF 225 / KL 1234',
    aircraft: 'Airbus A350-900 / Boeing 787',
    origin: 'DEL',
    destination: 'YYZ',
    departureDate,
    departure: '01:40 AM',
    arrival: '04:30 PM',
    departureTime: '01:40',
    arrivalTime: '16:30',
    duration: '23h 20m',
    stops: 2,
    stopover: 'Paris (CDG) & Amsterdam (AMS)',
    baggage: cabinBaggage[cabinClass] || '2 x 23kg Checked + 7kg Cabin',
    cabinClass,
    passengersCount: passengers,
    price: rawRoute2Price,
    currency: 'INR',
    fareBreakdown: {
      baseFare: baseFare2,
      taxes: taxes2,
      fees: fees2,
      total: rawRoute2Price,
    },
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    airfareIndex: {
      priceIndex: 92,
      dealRating: 'GREAT_DEAL',
      dealLabel: 'Great Deal',
      historicalMedian: 68500,
    },
    transitInfo: PREDEFINED_TRANSIT_ROUTES['DEL-CDG-AMS-YYZ'],
  };

  offerCache.set(offer1Id, offer1);
  offerCache.set(offer2Id, offer2);

  return [offer1, offer2];
}

/**
 * Search Flights via Duffel API (with sandbox/mock fallback)
 */
export async function searchFlights({
  origin,
  destination,
  departureDate,
  returnDate = null,
  passengers = 1,
  cabinClass = 'economy',
}) {
  const normOrigin = origin.trim().toUpperCase();
  const normDest = destination.trim().toUpperCase();

  // Return the two predefined transit routes for DEL -> YYZ
  if (normOrigin === 'DEL' && normDest === 'YYZ') {
    return generatePredefinedTransitOffers({
      origin: normOrigin,
      destination: normDest,
      departureDate,
      passengers: Number(passengers) || 1,
      cabinClass,
    });
  }

  // Try live Duffel API if client initialized
  if (duffelClient) {
    try {
      console.log(`📡 Querying Duffel API for ${normOrigin} ➔ ${normDest} on ${departureDate}...`);
      const slices = [
        {
          origin: normOrigin,
          destination: normDest,
          departure_date: departureDate,
        },
      ];

      if (returnDate) {
        slices.push({
          origin: normDest,
          destination: normOrigin,
          departure_date: returnDate,
        });
      }

      const passengerArray = Array.from({ length: Number(passengers) || 1 }).map(() => ({
        type: 'adult',
      }));

      const offerRequest = await duffelClient.offerRequests.create({
        slices,
        passengers: passengerArray,
        cabin_class: cabinClass || 'economy',
        return_offers: true,
      });

      if (offerRequest.data && offerRequest.data.offers && offerRequest.data.offers.length > 0) {
        console.log(`✅ Received ${offerRequest.data.offers.length} live offers from Duffel!`);
        
        return offerRequest.data.offers.map((rawOffer) => {
          const slice = rawOffer.slices[0];
          const segment = slice.segments[0];
          
          // Duffel sandbox prices are often returned in USD/EUR/GBP.
          // Standardize display & domestic pricing to INR while preserving Duffel's raw currency/amount for order fulfillment.
          const exchangeRate = rawOffer.total_currency === 'USD' ? 85 : (rawOffer.total_currency === 'EUR' ? 92 : (rawOffer.total_currency === 'GBP' ? 108 : 1));
          const price = Math.round(Number(rawOffer.total_amount) * exchangeRate);
          const taxes = Math.round(Number(rawOffer.tax_amount ? Number(rawOffer.tax_amount) * exchangeRate : price * 0.15));
          const baseFare = price - taxes;

          const offer = {
            id: rawOffer.id,
            offerId: rawOffer.id,
            airline: rawOffer.owner.name,
            airlineCode: rawOffer.owner.iata_code,
            logoUrl: rawOffer.owner.logo_symbol_url || '',
            flightNumber: `${segment.marketing_carrier.iata_code} ${segment.marketing_carrier_flight_number}`,
            aircraft: segment.aircraft?.name || 'Commercial Jet',
            origin: normOrigin,
            destination: normDest,
            departureDate,
            departure: new Date(segment.departing_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            arrival: new Date(segment.arriving_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            departureTime: segment.departing_at.substring(11, 16),
            arrivalTime: segment.arriving_at.substring(11, 16),
            duration: slice.duration ? slice.duration.replace('PT', '').toLowerCase() : '2h 15m',
            stops: slice.segments.length - 1,
            baggage: '7kg Cabin + 15kg Checked',
            cabinClass,
            passengersCount: passengers,
            price,
            currency: 'INR',
            duffelTotalAmount: rawOffer.total_amount,
            duffelCurrency: rawOffer.total_currency,
            duffelPassengers: rawOffer.passengers,
            fareBreakdown: {
              baseFare,
              taxes,
              fees: 100,
              total: price,
            },
            expiresAt: rawOffer.expires_at,
            createdAt: rawOffer.created_at,
            isDuffel: true,
          };

          offerCache.set(offer.id, offer);
          return enrichOfferWithIndex(offer, normOrigin, normDest, departureDate);
        });
      }
    } catch (apiError) {
      console.warn(`⚠️  Duffel API request failed (${apiError.message}). Falling back to realistic sandbox flights.`);
    }
  }

  // Realistic sandbox flight search engine
  return generateRealisticOffers({
    origin: normOrigin,
    destination: normDest,
    departureDate,
    passengers: Number(passengers) || 1,
    cabinClass,
  });
}

/**
 * Retrieve latest offer details and validate price
 * (Duffel best practice: always fetch the latest offer before booking)
 */
export async function getOfferDetails(offerId) {
  if (offerId.startsWith('predefined_del_')) {
    if (!offerCache.has(offerId)) {
      generatePredefinedTransitOffers({});
    }
    const cached = offerCache.get(offerId);
    if (cached) return cached;
  }

  const isMock = offerId.startsWith('mock_');
  if (duffelClient && !isMock) {
    try {
      const response = await duffelClient.offers.get(offerId);
      if (response.data) {
        const rawOffer = response.data;
        const slice = rawOffer.slices[0];
        const segment = slice.segments[0];
        const exchangeRate = rawOffer.total_currency === 'USD' ? 85 : (rawOffer.total_currency === 'EUR' ? 92 : (rawOffer.total_currency === 'GBP' ? 108 : 1));
        const price = Math.round(Number(rawOffer.total_amount) * exchangeRate);
        const taxes = Math.round(Number(rawOffer.tax_amount ? Number(rawOffer.tax_amount) * exchangeRate : price * 0.15));

        const offer = {
          id: rawOffer.id,
          offerId: rawOffer.id,
          airline: rawOffer.owner.name,
          airlineCode: rawOffer.owner.iata_code,
          logoUrl: rawOffer.owner.logo_symbol_url || '',
          flightNumber: `${segment.marketing_carrier.iata_code} ${segment.marketing_carrier_flight_number}`,
          aircraft: segment.aircraft?.name || 'Commercial Jet',
          origin: slice.origin.iata_code,
          destination: slice.destination.iata_code,
          departureDate: segment.departing_at.substring(0, 10),
          departure: new Date(segment.departing_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          arrival: new Date(segment.arriving_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: slice.duration || '2h 15m',
          stops: slice.segments.length - 1,
          baggage: '7kg Cabin + 15kg Checked',
          price,
          currency: 'INR',
          duffelTotalAmount: rawOffer.total_amount,
          duffelCurrency: rawOffer.total_currency,
          duffelPassengers: rawOffer.passengers,
          fareBreakdown: {
            baseFare: price - taxes,
            taxes,
            fees: 100,
            total: price,
          },
          expiresAt: rawOffer.expires_at,
          isDuffel: true,
        };
        offerCache.set(offer.id, offer);
        return enrichOfferWithIndex(offer, offer.origin, offer.destination, offer.departureDate);
      }
    } catch (error) {
      console.warn('⚠️ Duffel offer retrieval failed:', error.message);
    }
  }

  // Check in-memory offer cache
  if (offerCache.has(offerId)) {
    const cached = offerCache.get(offerId);
    return enrichOfferWithIndex(cached, cached.origin, cached.destination, cached.departureDate);
  }

  // If not found in cache, synthesize from standard route
  const fallback = generateRealisticOffers({ origin: 'DEL', destination: 'BOM', departureDate: '2026-10-15' })[0];
  fallback.id = offerId;
  fallback.offerId = offerId;
  return fallback;
}

/**
 * Confirm Duffel Airline Order / Booking Creation
 */
export async function createDuffelOrder({ offerId, passengers, paymentInfo }) {
  const isMock = offerId.startsWith('mock_');
  if (duffelClient && !isMock) {
    try {
      let offerData = offerCache.get(offerId);
      let freshOffer = null;
      if (!offerData || !offerData.duffelPassengers) {
        freshOffer = await duffelClient.offers.get(offerId);
        if (freshOffer?.data) {
          offerData = {
            duffelPassengers: freshOffer.data.passengers,
            duffelTotalAmount: freshOffer.data.total_amount,
            duffelCurrency: freshOffer.data.total_currency,
          };
        }
      }

      const duffelPassengers = offerData?.duffelPassengers || freshOffer?.data?.passengers || [];

      const formattedPassengers = passengers.map((p, idx) => {
        const duffelPassengerId = duffelPassengers[idx]?.id;
        const passengerObj = {
          title: p.gender === 'female' ? 'ms' : 'mr',
          given_name: p.firstName || 'Traveler',
          family_name: p.lastName || 'Passenger',
          gender: p.gender === 'female' ? 'f' : 'm',
          born_on: p.dateOfBirth && /^\d{4}-\d{2}-\d{2}$/.test(p.dateOfBirth) ? p.dateOfBirth : '1995-05-15',
          email: p.email || 'traveler@example.com',
          phone_number: p.phone && p.phone.startsWith('+') ? p.phone : `+91${(p.phone || '9876543210').replace(/\D/g, '').slice(-10)}`,
        };
        if (duffelPassengerId) {
          passengerObj.id = duffelPassengerId;
        }
        return passengerObj;
      });

      const orderCurrency = offerData?.duffelCurrency || freshOffer?.data?.total_currency || 'USD';
      const orderAmount = offerData?.duffelTotalAmount || freshOffer?.data?.total_amount || String(paymentInfo.amount);

      console.log(`✈️  Creating verified Duffel airline order for offer ${offerId}...`);
      const orderResponse = await duffelClient.orders.create({
        selected_offers: [offerId],
        passengers: formattedPassengers,
        payments: [
          {
            type: 'balance',
            currency: orderCurrency,
            amount: orderAmount,
          },
        ],
        type: 'instant',
      });

      console.log(`🎉 Duffel Airline Order Confirmed! Order ID: ${orderResponse.data.id}, PNR: ${orderResponse.data.booking_reference}`);
      return {
        duffelOrderId: orderResponse.data.id,
        bookingReference: orderResponse.data.booking_reference,
        status: 'confirmed',
        isLiveDuffelOrder: true,
      };
    } catch (orderError) {
      console.warn('⚠️  Duffel Order creation failed on sandbox:', orderError.message, orderError.errors);
    }
  }

  // Generate realistic PNR & Order confirmation
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const numbers = '23456789';
  let pnr = '';
  for (let i = 0; i < 6; i++) {
    pnr += i < 3 ? letters.charAt(Math.floor(Math.random() * letters.length)) : numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  return {
    duffelOrderId: `ord_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    bookingReference: pnr,
    status: 'confirmed',
    isLiveDuffelOrder: false,
  };
}
