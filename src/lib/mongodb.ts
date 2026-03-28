// lib/mongodb.ts
// Shared MongoDB connection with global cache (prevents reconnecting on hot reload)

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "❌ MONGODB_URI is not defined. Add it to .env.local\n" +
    "   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pharmawallah"
  );
}

// TypeScript declaration for global cache
declare global {
  var _mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

// Reuse cached connection across hot reloads in development
const cached = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
  // Already connected — return immediately
  if (cached.conn) return cached.conn;

  // Connection in progress — wait for it
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,   // don't queue ops while disconnected
    }).then(m => {
      console.log("✅ MongoDB connected");
      return m;
    }).catch(err => {
      cached.promise = null;  // reset so next call retries
      console.error("❌ MongoDB connection failed:", err.message);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}