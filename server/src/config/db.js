import mongoose from 'mongoose';
import { env } from './env.js';

let mongoMemoryServerInstance = null;

export const connectDB = async () => {
  try {
    let uri = env.MONGODB_URI;

    if (!uri) {
      console.log('⚡ No MONGODB_URI provided in environment. Initializing local embedded MongoDB...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServerInstance = await MongoMemoryServer.create();
      uri = mongoMemoryServerInstance.getUri();
      console.log('✅ Embedded MongoDB instance active at:', uri);
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ Primary MongoDB connection failed (${error.message}). Attempting fallback to memory server...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServerInstance = await MongoMemoryServer.create();
      const fallbackUri = mongoMemoryServerInstance.getUri();
      const conn = await mongoose.connect(fallbackUri);
      console.log(`✅ Embedded Fallback MongoDB Connected at: ${fallbackUri}`);
      return conn;
    } catch (fallbackError) {
      console.error(`❌ Fatal: MongoDB connection error: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongoMemoryServerInstance) {
      await mongoMemoryServerInstance.stop();
    }
    console.log('MongoDB connection closed gracefully.');
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
  }
};
