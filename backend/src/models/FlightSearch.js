import mongoose from 'mongoose';

const flightSearchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  origin: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  destination: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  departureDate: {
    type: String,
    required: true,
  },
  returnDate: {
    type: String,
    default: null,
  },
  passengers: {
    type: Number,
    default: 1,
  },
  tripType: {
    type: String,
    enum: ['one-way', 'round-trip'],
    default: 'one-way',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const FlightSearch = mongoose.model('FlightSearch', flightSearchSchema);
