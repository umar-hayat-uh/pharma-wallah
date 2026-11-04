import { MongoClient } from 'mongodb';
import { ServiceUnavailableError } from '../src/lib/services';

/*
 * Connects on first use, not when the module loads (2026-11-04). `next build`
 * loads every route module while collecting page data, so this file used to
 * need the MongoDB credentials during the BUILD — and opened a connection from
 * the build machine. A host's build environment then had to hold the password
 * (Netlify scans the build environment's secrets against the output). Callers
 * are unchanged: they `await clientPromise`, which is a lazy awaitable.
 */
let clientPromiseInstance: Promise<MongoClient> | null = null;

function connect(): Promise<MongoClient> {
    if (clientPromiseInstance) return clientPromiseInstance;

    if (!process.env.MONGODB_USER || !process.env.MONGODB_USER_PASSWORD) {
        // No key → the feature is "unavailable at the moment", not a crash.
        return Promise.reject(new ServiceUnavailableError('drugDb'));
    }

    // Properly encode username and password
    const encodedUsername = encodeURIComponent(process.env.MONGODB_USER);
    const encodedPassword = encodeURIComponent(process.env.MONGODB_USER_PASSWORD);

    const uri = `mongodb+srv://${encodedUsername}:${encodedPassword}@cluster0.z4rsu0w.mongodb.net/pharmacopedia?retryWrites=true&w=majority&appName=Cluster0`;
    const options = {};

    if (process.env.NODE_ENV === 'development') {
        // In development mode, use a global variable so the client is preserved across module reloads
        const globalWithMongo = global as typeof globalThis & {
            _mongoClientPromise?: Promise<MongoClient>;
        };

        if (!globalWithMongo._mongoClientPromise) {
            globalWithMongo._mongoClientPromise = new MongoClient(uri, options).connect();
        }
        clientPromiseInstance = globalWithMongo._mongoClientPromise;
    } else {
        // In production mode, it's best to not use a global variable
        clientPromiseInstance = new MongoClient(uri, options).connect();
    }
    // A failed connection is not cached, so the next request retries.
    clientPromiseInstance.catch(() => {
        clientPromiseInstance = null;
    });
    return clientPromiseInstance;
}

const clientPromise: PromiseLike<MongoClient> = {
    then: (onFulfilled, onRejected) => connect().then(onFulfilled, onRejected),
};

export default clientPromise;

// Helper function to get all collections with same data
export async function getAllDrugCollections() {
    const client = await clientPromise;
    const db = client.db();

    return [
        db.collection('drugsdata'),
        db.collection('drugsdata_0'),
        db.collection('drugsdata_1')
    ];
}