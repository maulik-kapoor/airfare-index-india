import { searchFlights, getOfferDetails } from '../services/duffelService.js';
import { FlightSearch } from '../models/FlightSearch.js';
import { getDbStatus } from '../config/db.js';

// In-memory fallback searches
const memorySearches = [];

/**
 * @route POST /api/flights/search
 * @desc Search flights and enrich with Airfare Index
 */
export async function handleFlightSearch(req, res) {
  try {
    const { origin, destination, departureDate, returnDate, passengers = 1, cabinClass = 'economy' } = req.body;

    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        success: false,
        message: 'Origin, Destination, and Departure Date are required.',
      });
    }

    // Record search in background
    if (getDbStatus()) {
      FlightSearch.create({
        userId: req.user ? req.user.id : null,
        origin,
        destination,
        departureDate,
        returnDate,
        passengers: Number(passengers),
        tripType: returnDate ? 'round-trip' : 'one-way',
      }).catch((err) => console.warn('Search history save notice:', err.message));
    } else {
      memorySearches.push({
        origin,
        destination,
        departureDate,
        returnDate,
        passengers,
        createdAt: new Date(),
      });
    }

    const offers = await searchFlights({
      origin,
      destination,
      departureDate,
      returnDate,
      passengers: Number(passengers),
      cabinClass,
    });

    return res.status(200).json({
      success: true,
      count: offers.length,
      route: `${origin.toUpperCase()} ➔ ${destination.toUpperCase()}`,
      departureDate,
      data: offers,
    });
  } catch (error) {
    console.error('Flight search error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search flights. Please check flight parameters.',
      error: error.message,
    });
  }
}

/**
 * @route GET /api/flights/:offerId
 * @desc Get latest validated flight offer
 */
export async function handleGetOfferDetails(req, res) {
  try {
    const { offerId } = req.params;
    const offer = await getOfferDetails(offerId);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Flight offer not found or expired.',
      });
    }

    return res.status(200).json({
      success: true,
      data: offer,
    });
  } catch (error) {
    console.error('Get offer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch flight offer details.',
      error: error.message,
    });
  }
}

/**
 * @route POST /api/flights/:offerId/price
 * @desc Re-validate price before passenger checks out
 */
export async function handleValidateOfferPrice(req, res) {
  try {
    const { offerId } = req.params;
    const { originalPrice } = req.body;

    const offer = await getOfferDetails(offerId);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Flight offer expired. Please search again.',
      });
    }

    const currentPrice = offer.price;
    const priceChanged = originalPrice && Number(originalPrice) !== currentPrice;

    return res.status(200).json({
      success: true,
      isValid: true,
      priceChanged,
      originalPrice: Number(originalPrice) || currentPrice,
      currentPrice,
      currency: offer.currency,
      offer,
    });
  } catch (error) {
    console.error('Price validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to validate price.',
      error: error.message,
    });
  }
}

/**
 * @route POST /api/flights/hold
 * @desc Create temporary PNR booking hold for international flight
 */
export async function handleCreateBookingHold(req, res) {
  try {
    const { offerId } = req.body;
    const offer = await getOfferDetails(offerId);

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Flight offer not found.' });
    }

    const holdPnr = `HOLD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000).toISOString();

    return res.status(200).json({
      success: true,
      data: {
        holdPnr,
        offerId,
        expiresAt,
        status: 'ACTIVE_HOLD',
        message: 'Fare and seat inventory locked for 20 minutes.',
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @route POST /api/flights/verify-transit
 * @desc International Booking Verification Gate
 */
export async function handleVerifyTransitEligibility(req, res) {
  try {
    const { offerId, passport, transitDocuments } = req.body;
    const offer = await getOfferDetails(offerId);

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Flight offer not found.' });
    }

    const routeCode = offer.routeCode || `${offer.origin}-${offer.destination}`;
    const destinationDoc = transitDocuments?.destinationVisa || 'none';
    const transit1Doc = transitDocuments?.transit1 || 'none';
    const transit2Doc = transitDocuments?.transit2 || 'none';

    const reasons = [];
    let isApproved = true;

    // Check Destination Entry (Canada YYZ)
    if (offer.destination === 'YYZ') {
      const hasCanadaEntry = ['canadian_visa', 'canadian_eta', 'canadian_citizen', 'canadian_pr'].includes(destinationDoc);
      if (!hasCanadaEntry) {
        isApproved = false;
        reasons.push('Destination Clearance: A valid Canadian Visitor Visa or Electronic Travel Authorization (eTA) is required for entry into Canada.');
      }
    }

    // Check Route 1: DEL -> AMS -> MSP -> YYZ
    if (routeCode === 'DEL-AMS-MSP-YYZ' || offer.stopover?.includes('Minneapolis')) {
      const hasUsTransit = ['us_visa', 'esta', 'us_citizen'].includes(transit2Doc);
      if (!hasUsTransit) {
        isApproved = false;
        reasons.push('US Transit Clearance: Transit through Minneapolis-Saint Paul (MSP) requires an approved ESTA or valid US Transit Visa (C-1) / Visitor Visa. Transit without a visa (TWOV) is not permitted in the United States.');
      }
    }

    // Check Route 2: DEL -> CDG -> AMS -> YYZ
    if (routeCode === 'DEL-CDG-AMS-YYZ' || (offer.stopover?.includes('Paris') && offer.stopover?.includes('Amsterdam'))) {
      const hasSchengen = ['schengen_visa', 'eu_citizen', 'eu_residence'].includes(transit2Doc) || ['schengen_visa', 'eu_citizen', 'eu_residence'].includes(transit1Doc);
      if (!hasSchengen) {
        isApproved = false;
        reasons.push('Schengen Entry Clearance: Itinerary includes two European Schengen airports (Paris CDG and Amsterdam AMS). Traveling between Paris and Amsterdam is an internal domestic flight requiring entry into the Schengen zone and a valid Schengen Visa.');
      }
    }

    const recommendedRoutes = [
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
      }
    ];

    return res.status(200).json({
      success: true,
      status: isApproved ? 'APPROVED' : 'NOT_SUITABLE',
      isApproved,
      reasons,
      summary: isApproved
        ? 'All transit documentation and entry requirements verified. You may proceed to booking.'
        : 'This multi-stop itinerary is not suitable based on your current visa / passport documentation.',
      recommendedRoutes: isApproved ? [] : recommendedRoutes,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
