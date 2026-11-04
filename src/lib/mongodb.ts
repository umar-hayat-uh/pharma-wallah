// lib/mongodb.ts
// Shared MongoDB connection with global cache (prevents reconnecting on hot reload)

import mongoose from "mongoose";
import { ServiceUnavailableError } from "@/lib/services";

const DB_NAME = "pharmawallah"; // consistent database name

/*
 * Read when a connection is first needed, not when the module loads
 * (2026-11-04). `next build` loads every route module while collecting page
 * data, so a module-scope check made the BUILD need the database password —
 * and a host's build environment then had to hold it (Netlify scans the build
 * environment's secrets against the output). Now only the running site needs it.
 */
function mongoUri(): string {
  const uri = process.env.MONGODB_URI;
  // No key → the feature is "unavailable at the moment", not a crash.
  if (!uri) throw new ServiceUnavailableError("mongo");
  return uri;
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
    const opts = {
      bufferCommands: false,     // don't queue operations while disconnected
      dbName: DB_NAME,           // explicitly set database name
    };
    cached.promise = mongoose.connect(mongoUri(), opts)
      .then(m => {
        console.log("✅ MongoDB connected to database:", m.connection.name);
        return m;
      })
      .catch(err => {
        cached.promise = null;   // reset so next call retries
        console.error("❌ MongoDB connection failed:", err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Alias for compatibility – some files may import `dbConnect`
export const dbConnect = connectDB;

// Optional: get native MongoDB database instance (if needed later)
export async function getDb() {
  await connectDB();
  return mongoose.connection.db;
}