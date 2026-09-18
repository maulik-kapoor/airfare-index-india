import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  duffelOrderId: {
    type: String,
    default: '',
  },
  bookingReference: {
    type: String,
    required: true,
    uppercase: true,
  },
  offerId: {
    type: String,
    required: true,
  },
  airline: {
    name: String,
    iataCode: String,
    flightNumber: String,
    logoUrl: String,
  },
  origin: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  departureDate: {
    type: String,
    required: true,
  },
  departureTime: String,
  arrivalTime: String,
  duration: String,
  stops: {
    type: Number,
    default: 0,
  },
  passengers: [
    {
      firstName: String,
      lastName: String,
      dateOfBirth: String,
      gender: String,
      email: String,
      phone: String,
      seat: String,
    },
  ],
  fareBreakdown: {
    baseFare: Number,
    taxes: Number,
    fees: Number,
    total: Number,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  bookingStatus: {
    type: String,
    enum: ['confirmed', 'cancelled', 'pending'],
    default: 'confirmed',
  },
  paymentDetails: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    paidAt: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Booking = mongoose.model('Booking', bookingSchema);
