import { createPaymentOrder, verifyPaymentSignature } from '../services/razorpayService.js';
import { getOfferDetails } from '../services/duffelService.js';
import { Payment } from '../models/Payment.js';
import { getDbStatus } from '../config/db.js';

/**
 * @route POST /api/payments/create-order
 * @desc Create Razorpay Order from server-validated flight offer
 */
export async function handleCreatePaymentOrder(req, res) {
  try {
    const { offerId } = req.body;

    if (!offerId) {
      return res.status(400).json({
        success: false,
        message: 'offerId is required to generate payment order.',
      });
    }

    // Always re-fetch the latest offer to prevent client-side price tampering
    const offer = await getOfferDetails(offerId);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Flight offer is no longer available.',
      });
    }

    const validatedAmount = offer.price;

    const paymentOrder = await createPaymentOrder({
      amount: validatedAmount,
      currency: offer.currency || 'INR',
      receipt: `rcpt_${offerId.substring(0, 15)}_${Date.now()}`,
    });

    return res.status(200).json({
      success: true,
      order: paymentOrder,
      offerSummary: {
        airline: offer.airline,
        flightNumber: offer.flightNumber,
        route: `${offer.origin} ➔ ${offer.destination}`,
        totalAmount: validatedAmount,
        currency: offer.currency,
      },
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to initiate payment.',
      error: error.message,
    });
  }
}

/**
 * @route POST /api/payments/verify
 * @desc Verify Razorpay payment signature
 */
export async function handleVerifyPayment(req, res) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId, amount } = req.body;

    const isValid = verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Payment verification failed.',
      });
    }

    // Record payment if MongoDB is connected
    if (getDbStatus()) {
      await Payment.create({
        bookingId: bookingId || null,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        amount: amount || 0,
        currency: 'INR',
        status: 'captured',
      }).catch((err) => console.warn('Payment record log:', err.message));
    }

    return res.status(200).json({
      success: true,
      verified: true,
      message: 'Payment verified successfully.',
      paymentId: razorpayPaymentId,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Payment verification failed.',
      error: error.message,
    });
  }
}
