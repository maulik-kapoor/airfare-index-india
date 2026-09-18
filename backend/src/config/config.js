import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/airfare_index',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_airfare_jwt_key_2026_dev',
  duffelAccessToken: process.env.DUFFEL_ACCESS_TOKEN || '',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_airfare2026mock',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret_key_12345',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
