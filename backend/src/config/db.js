import mongoose from 'mongoose';
import { config } from './config.js';

let isDbConnected = false;

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 2500, // Quick timeout if Mongo isn't running locally
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
