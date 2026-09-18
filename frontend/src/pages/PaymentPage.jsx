import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck, Lock, CheckCircle2, AlertCircle, Loader2, Smartphone, Building, ChevronLeft } from 'lucide-react';
import { useBooking } from '../context/BookingContext.jsx';
import api from '../services/api.js';

export default function PaymentPage() {
  const navigate = useNavigate();
  const { selectedOffer, passengers, selectedSeats, selectedAddons, setConfirmedBooking } = useBooking();

  const [paymentOrder, setPaymentOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('upi'); // upi, card, netbanking

  const seatFee = selectedSeats[0]?.fee || 0;
  const baggageFee = selectedAddons?.baggageFee || 0;
  const totalAmount = (selectedOffer?.price || 0) + seatFee + baggageFee;

  useEffect(() => {
    async function initPayment() {
      if (!selectedOffer) {
        navigate('/');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await api.post('/payments/create-order', {
          offerId: selectedOffer.offerId || selectedOffer.id,
        });

        if (res.success && res.order) {
          setPaymentOrder(res.order);
        } else {
          setError('Failed to initiate payment gateway order.');
        }
      } catch (err) {
        setError(err.message || 'Payment initiation failed.');
      } finally {
        setLoading(false);
      }
    }

    initPayment();
  }, [selectedOffer]);

  const finalizeBooking = async (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    try {
      const verifyRes = await api.post('/payments/verify', {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        amount: totalAmount,
      });

      if (!verifyRes.success || !verifyRes.verified) {
        throw new Error('Payment signature verification failed.');
      }

      const bookingRes = await api.post('/bookings', {
        offerId: selectedOffer.offerId || selectedOffer.id,
        passengers,
        paymentDetails: {
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
        },
        userEmail: passengers[0]?.email,
      });

      if (bookingRes.success && bookingRes.booking) {
        setConfirmedBooking(bookingRes.booking);
        navigate('/confirmation');
      } else {
        throw new Error(bookingRes.message || 'Failed to create airline booking.');
      }
    } catch (err) {
      console.error('Payment verification / booking error:', err);
      setError(err.message || 'Payment verification failed.');
      setProcessing(false);
    }
  };

  const handlePayNow = () => {
    if (!paymentOrder) return;
    setProcessing(true);
    setError(null);

    if (typeof window !== 'undefined' && window.Razorpay && paymentOrder.keyId) {
      try {
        const options = {
          key: paymentOrder.keyId,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency || 'INR',
          name: 'AeroIndex Flight Booking',
          description: `${selectedOffer.airline} ${selectedOffer.flightNumber} (${selectedOffer.origin} ➔ ${selectedOffer.destination})`,
          order_id: paymentOrder.orderId,
          prefill: {
            name: `${passengers[0]?.firstName || 'Traveler'} ${passengers[0]?.lastName || ''}`.trim(),
            email: passengers[0]?.email || 'traveler@example.com',
            contact: passengers[0]?.phone || '9876543210',
          },
          theme: {
            color: '#0284c7',
          },
          modal: {
            ondismiss: function () {
              setProcessing(false);
            },
          },
          handler: function (response) {
            finalizeBooking(
              response.razorpay_order_id || paymentOrder.orderId,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          setError(`Payment failed: ${response.error.description || 'Transaction declined.'}`);
          setProcessing(false);
        });
        rzp.open();
        return;
      } catch (sdkError) {
        console.warn('Razorpay modal open notice:', sdkError.message);
      }
    }

    // Direct sandbox fallback
    const paymentId = `pay_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    const signature = 'mock_signature';
    finalizeBooking(paymentOrder.orderId, paymentId, signature);
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <Loader2 className="w-10 h-10 text-sky-600 animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-bold text-slate-900">Connecting to Razorpay Gateway...</h2>
        <p className="text-xs text-slate-500 mt-1">Generating encrypted server order for ₹{totalAmount.toLocaleString('en-IN')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-1.5 text-xs text-slate-600 hover:text-slate-900 mb-6 font-medium transition"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to booking review</span>
      </button>

      <div className="text-center mb-8">
        <span className="text-xs font-semibold uppercase tracking-wider text-sky-700">Step 5 of 5 • Payment Gateway</span>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Complete Your Payment</h1>
        <p className="text-xs text-slate-500 mt-1">Secure Razorpay Sandbox with Instant Duffel Airline Order Confirmation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Payment Methods (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center justify-between">
              <span>Select Payment Method</span>
              <span className="text-emerald-700 text-[11px] font-semibold flex items-center">
                <Lock className="w-3 h-3 mr-1" /> 256-bit Encrypted
              </span>
            </h3>

            <div className="space-y-3">
              {/* UPI Option */}
              <div
                onClick={() => setSelectedMethod('upi')}
                className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  selectedMethod === 'upi'
                    ? 'border-sky-600 bg-sky-50 text-slate-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">UPI / QR Code</h4>
                    <p className="text-xs text-slate-500">Google Pay, PhonePe, Paytm, BHIM</p>
                  </div>
                </div>
                <input type="radio" checked={selectedMethod === 'upi'} readOnly className="text-sky-600" />
              </div>

              {/* Card Option */}
              <div
                onClick={() => setSelectedMethod('card')}
                className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  selectedMethod === 'card'
                    ? 'border-sky-600 bg-sky-50 text-slate-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Credit / Debit Card</h4>
                    <p className="text-xs text-slate-500">Visa, MasterCard, RuPay, Amex</p>
                  </div>
                </div>
                <input type="radio" checked={selectedMethod === 'card'} readOnly className="text-sky-600" />
              </div>

              {/* NetBanking Option */}
              <div
                onClick={() => setSelectedMethod('netbanking')}
                className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  selectedMethod === 'netbanking'
                    ? 'border-sky-600 bg-sky-50 text-slate-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Net Banking</h4>
                    <p className="text-xs text-slate-500">HDFC, ICICI, SBI, Axis, Kotak</p>
                  </div>
                </div>
                <input type="radio" checked={selectedMethod === 'netbanking'} readOnly className="text-sky-600" />
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              disabled={processing}
              onClick={handlePayNow}
              className="mt-6 w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-sm transition active:scale-[0.98] disabled:opacity-60"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Confirming Order with Duffel...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Pay ₹{totalAmount.toLocaleString('en-IN')} & Issue Ticket</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Payment Summary Card (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4 pb-3 border-b border-slate-100">
              Payment Summary
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Ref:</span>
                <span className="font-mono text-slate-800">{paymentOrder?.orderId || 'order_init'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Route:</span>
                <span className="font-bold text-slate-900">{selectedOffer.origin} ➔ {selectedOffer.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Flight:</span>
                <span className="font-medium text-slate-800">{selectedOffer.airline} ({selectedOffer.flightNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Class:</span>
                <span className="font-medium text-slate-800 uppercase">{selectedOffer.cabinClass || 'ECONOMY'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Seat:</span>
                <span className="font-bold text-sky-700">{selectedSeats[0]?.number || '12A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Passenger:</span>
                <span className="font-medium text-slate-800">{passengers[0]?.firstName} {passengers[0]?.lastName}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-xs text-slate-500">Total Payable:</span>
                <span className="text-2xl font-bold text-emerald-700">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <p>• Verified directly against Duffel live inventory</p>
              <p>• Instant PNR & airline ticket generation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
