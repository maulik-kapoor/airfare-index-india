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
