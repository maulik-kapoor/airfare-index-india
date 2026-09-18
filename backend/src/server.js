import express from 'express';
import cors from 'cors';
import { config } from './config/config.js';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import flightRoutes from './routes/flightRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

const app = express();

// Database initialization
connectDB();

// Middlewares
app.use(
  cors({
    origin: '*', // Allow all origins for dev/API access
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

// Request logger for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Airfare Index & Flight Booking API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    duffelIntegration: config.duffelAccessToken ? 'live_token_configured' : 'sandbox_mock_mode',
    razorpayIntegration: config.razorpayKeyId ? 'configured' : 'mock_mode',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.url} not found.`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred.',
    error: config.nodeEnv === 'development' ? err.message : undefined,
  });
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Airfare Index Backend running on port ${PORT}`);
  console.log(`✈️  Flight Search API ready at http://localhost:${PORT}/api/flights/search`);
  console.log(`📊 Analytics API ready at http://localhost:${PORT}/api/analytics/summary`);
});
