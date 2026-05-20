import mongoose from "mongoose";

let isConnected = false;
let isUsingFallback = false;

export async function connectDB() {
  if (isConnected) {
    console.log("Database is already connected");
    return;
  }

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not defined in environment variables.");
    throw new Error("DATABASE_URL is not defined in environment variables.");
  }

  try {
    const options = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // Reduced timeout for faster fallback
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 5,
    };

    let connectionString = process.env.DATABASE_URL;

    const dbName = process.env.DB_NAME || 'tech-saksham';

    if (!connectionString.includes(`/${dbName}`)) {
      if (connectionString.includes('?')) {
        const [base, query] = connectionString.split('?');
        const cleanBase = base.replace(/\/$/, '');
        connectionString = `${cleanBase}/${dbName}?${query}`;
      } else {
        const cleanBase = connectionString.replace(/\/$/, '');
        connectionString = `${cleanBase}/${dbName}`;
      }
    }

    const db = await mongoose.connect(connectionString, options);

    isConnected = db.connections[0].readyState === 1;
    console.log("Database Connected Successfully");
    return db;

  } catch (error) {
    console.error("=> Database connection error:", error);
    isConnected = false;

    // Enable fallback mode for development
    if (process.env.NODE_ENV === 'development') {
      console.warn("⚠️  Database unavailable. Running in fallback mode with mock data.");
      isUsingFallback = true;
      return null; // Return null to indicate fallback mode
    }

    // Provide more user-friendly error message
    if (error instanceof Error) {
      if (error.message.includes('ETIMEOUT') || error.message.includes('timeout')) {
        throw new Error('Database connection timeout. Please check your internet connection and try again.');
      } else if (error.message.includes('ENOTFOUND') || error.message.includes('querySrv')) {
        throw new Error('Database server not found. Please check your DATABASE_URL configuration.');
      } else if (error.message.includes('ECONNREFUSED')) {
        throw new Error('Database connection refused. Please ensure MongoDB is running and accessible.');
      }
    }

    throw error;
  }
}

export function isUsingFallbackMode() {
  return isUsingFallback;
}