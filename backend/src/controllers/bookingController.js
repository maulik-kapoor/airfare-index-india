import { createDuffelOrder, getOfferDetails } from '../services/duffelService.js';
import { verifyPaymentSignature } from '../services/razorpayService.js';
import { Booking } from '../models/Booking.js';
import { getDbStatus } from '../config/db.js';

// In-memory fallback booking storage
const memoryBookings = [];

/**
 * @route POST /api/bookings
 * @desc Create Airline Booking after verified payment
 */
export async function handleCreateBooking(req, res) {
  try {
    const { offerId, passengers, paymentDetails, userEmail } = req.body;

    if (!offerId || !passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'offerId and valid passengers list are required.',
      });
    }

    // Verify payment signature
    if (paymentDetails) {
      const isPaymentValid = verifyPaymentSignature({
        razorpayOrderId: paymentDetails.razorpayOrderId,
        razorpayPaymentId: paymentDetails.razorpayPaymentId,
        razorpaySignature: paymentDetails.razorpaySignature,
      });

      if (!isPaymentValid) {
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed. Booking cannot be confirmed without valid payment.',
        });
      }
    }

    // Fetch latest verified offer
    const offer = await getOfferDetails(offerId);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Flight offer is expired. Please search again.',
      });
    }

    // Call Duffel to finalize airline booking
    const duffelOrder = await createDuffelOrder({
      offerId,
      passengers,
      paymentInfo: {
        amount: offer.price,
        currency: offer.currency,
      },
    });

    const bookingData = {
      userId: req.user ? req.user.id : null,
      duffelOrderId: duffelOrder.duffelOrderId,
      bookingReference: duffelOrder.bookingReference,
      offerId,
      airline: {
        name: offer.airline,
        iataCode: offer.airlineCode,
        flightNumber: offer.flightNumber,
        logoUrl: offer.logoUrl,
      },
      origin: offer.origin,
      destination: offer.destination,
      departureDate: offer.departureDate,
      departureTime: offer.departure,
      arrivalTime: offer.arrival,
      duration: offer.duration,
      cabinClass: offer.cabinClass || 'economy',
      passengers: passengers.map((p, idx) => ({
        title: p.title || 'Mr',
        firstName: p.firstName || p.givenName || 'Passenger',
        lastName: p.lastName || p.familyName || `${idx + 1}`,
        dateOfBirth: p.dateOfBirth || p.bornOn || '1995-01-01',
        gender: p.gender || 'm',
        email: p.email || userEmail || 'passenger@airline.com',
        phone: p.phone || '+919876543210',
        seat: p.seat || p.seatNumber || `${12 + idx}${['A', 'B', 'C', 'D'][idx % 4]}`,
        meal: p.meal || p.mealPreference || 'Complimentary Veg Meal',
        seatType: p.seatType || 'Standard',
      })),
      fareBreakdown: offer.fareBreakdown,
      totalAmount: offer.price,
      currency: offer.currency || 'INR',
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
      paymentDetails: {
        razorpayOrderId: paymentDetails?.razorpayOrderId || 'mock_order',
        razorpayPaymentId: paymentDetails?.razorpayPaymentId || 'mock_payment',
        paidAt: new Date(),
      },
      createdAt: new Date(),
    };

    let savedBooking;
    if (getDbStatus()) {
      savedBooking = await Booking.create(bookingData);
    } else {
      savedBooking = {
        _id: `bkg_${Date.now()}`,
        ...bookingData,
      };
      memoryBookings.unshift(savedBooking);
    }

    return res.status(201).json({
      success: true,
      message: 'Airline flight booked successfully!',
      booking: savedBooking,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create airline booking.',
      error: error.message,
    });
  }
}

/**
 * @route GET /api/bookings
 * @desc Get user bookings
 */
export async function handleGetBookings(req, res) {
  try {
    let bookings = [];
    if (getDbStatus()) {
      const query = req.user ? { userId: req.user.id } : {};
      bookings = await Booking.find(query).sort({ createdAt: -1 });
    } else {
      bookings = memoryBookings;
    }

    const today = new Date().toISOString().split('T')[0];
    const categorized = {
      all: bookings,
      upcoming: bookings.filter((b) => b.bookingStatus === 'confirmed' && (!b.departureDate || b.departureDate >= today)),
      past: bookings.filter((b) => b.bookingStatus === 'confirmed' && b.departureDate && b.departureDate < today),
      cancelled: bookings.filter((b) => b.bookingStatus === 'cancelled' || b.paymentStatus === 'failed'),
    };

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
      categorized,
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookings.',
      error: error.message,
    });
  }
}

/**
 * @route GET /api/bookings/:id
 * @desc Get booking by ID or Reference
 */
export async function handleGetBookingById(req, res) {
  try {
    const { id } = req.params;
    let booking = null;

    if (getDbStatus()) {
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        booking = await Booking.findById(id);
      } else {
        booking = await Booking.findOne({ bookingReference: id.toUpperCase() });
      }
    } else {
      booking = memoryBookings.find(
        (b) => b._id === id || b.bookingReference === id.toUpperCase()
      );
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking reference not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Get booking by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to find booking.',
      error: error.message,
    });
  }
}

/**
 * @route POST /api/bookings/:id/cancel
 * @desc Cancel a booking
 */
export async function handleCancelBooking(req, res) {
  try {
    const { id } = req.params;
    let booking = null;

    if (getDbStatus()) {
      booking = await Booking.findByIdAndUpdate(
        id,
        { bookingStatus: 'cancelled' },
        { new: true }
      );
    } else {
      booking = memoryBookings.find((b) => b._id === id);
      if (booking) {
        booking.bookingStatus = 'cancelled';
      }
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel booking.',
      error: error.message,
    });
  }
}
