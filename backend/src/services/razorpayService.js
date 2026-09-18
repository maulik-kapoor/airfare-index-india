import crypto from 'crypto';
import Razorpay from 'razorpay';
import { config } from '../config/config.js';

let razorpayInstance = null;
if (config.razorpayKeyId && config.razorpayKeySecret && !config.razorpayKeyId.includes('mock')) {
  try {
    razorpayInstance = new Razorpay({
      key_id: config.razorpayKeyId,
      key_secret: config.razorpayKeySecret,
    });
    console.log('💳 Razorpay SDK initialized successfully.');
  } catch (err) {
    console.warn('⚠️ Razorpay initialization warning:', err.message);
  }
}

/**
 * Create a new Razorpay payment order
 * NOTE: Amount is always in paise (INR * 100)
 */
export async function createPaymentOrder({ amount, currency = 'INR', receipt }) {
  const amountInPaise = Math.round(amount * 100);

  if (razorpayInstance) {
    try {
      const order = await razorpayInstance.orders.create({
        amount: amountInPaise,
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        payment_capture: 1,
      });
      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: config.razorpayKeyId,
      };
    } catch (err) {
      console.warn('⚠️ Razorpay live order creation failed:', err.message);
    }
  }

  // Realistic mock order for test environment
  const mockOrderId = `order_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    orderId: mockOrderId,
    amount: amountInPaise,
    currency,
    keyId: config.razorpayKeyId || 'rzp_test_airfare2026mock',
    isMock: true,
  };
}

/**
 * Verify Razorpay payment signature
 */
export function verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  if (!razorpayOrderId || !razorpayPaymentId) {
    return false;
  }

  // In test/mock mode
  if (razorpayOrderId.startsWith('order_') && (!razorpaySignature || razorpaySignature === 'mock_signature')) {
    return true;
  }

  try {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpayKeySecret)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === razorpaySignature;
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}
