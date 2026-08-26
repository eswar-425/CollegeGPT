import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    logger.info('MongoDB is already connected.');
    return;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 6000,
      dbName: 'collegegpt',
    });
    isConnected = true;
    logger.success(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.warn(`MongoDB Connection Failed (${error.message}). Running with in-memory fallback store.`);
    isConnected = false;
  }
};

export const getDbStatus = () => ({
  connected: isConnected,
  host: isConnected ? mongoose.connection.host : 'Memory/Fallback Store',
  uri: env.MONGODB_URI ? env.MONGODB_URI.replace(/\/\/.*@/, '//***@') : 'None'
});
