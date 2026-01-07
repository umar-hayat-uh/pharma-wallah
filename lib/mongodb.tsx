import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_USER || !process.env.MONGODB_USER_PASSWORD) {
    throw new Error('Missing MongoDB credentials in environment variables');
}

// Properly encode username and password
const encodedUsername = encodeURIComponent(process.env.MONGODB_USER);
const encodedPassword = encodeURIComponent(process.env.MONGODB_USER_PASSWORD);

const uri = `mongodb+srv://${encodedUsername}:${encodedPassword}@cluster0.z4rsu0w.mongodb.net/pharmacopedia?retryWrites=true&w=majority&appName=Cluster0`;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so the client is preserved across module reloads
    const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri, options);
        globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
} else {
    // In production mode, it's best to not use a global variable
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

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