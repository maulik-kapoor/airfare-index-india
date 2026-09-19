import mongoose from 'mongoose';
import dns from 'node:dns';
import { config } from './config.js';

// Set public DNS to prevent Windows querySrv ECONNREFUSED on MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // fallback silently
}

let isDbConnected = false;

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isDbConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isDbConnected = false;
    console.warn(`⚠️  MongoDB Connection Warning: ${error.message}`);
    console.log(`ℹ️  Running in resilient Mode: In-memory fallback will handle bookings & sessions until MongoDB Atlas URI is set in backend/.env`);
  }
};

export const getDbStatus = () => isDbConnected;
