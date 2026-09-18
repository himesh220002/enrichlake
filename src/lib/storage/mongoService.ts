import { MongoClient, Db, Collection } from 'mongodb';
import { EnrichedProfileRecord } from './profileStorage';

const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME = process.env.MONGODB_DB || 'enricher_db';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getMongoDb(): Promise<Db | null> {
  if (!MONGODB_URI) {
    return null;
  }

  if (cachedDb) {
    return cachedDb;
  }

  try {
    const client = new MongoClient(MONGODB_URI, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
    cachedClient = client;
    cachedDb = client.db(DB_NAME);

    // Initialize indexes
    const collection = cachedDb.collection<EnrichedProfileRecord>('profiles');
    await collection.createIndex({ domain: 1 }, { unique: true });
    await collection.createIndex({ companyName: 'text', remarks: 'text', tags: 'text' });

    console.log('[MongoDB Connected] Initialized enricher_db profiles collection');
    return cachedDb;
  } catch (err: any) {
    console.warn('[MongoDB Warning] Could not connect to MONGODB_URI:', err.message);
    return null;
  }
}

export async function getProfilesFromDb(): Promise<EnrichedProfileRecord[]> {
  const db = await getMongoDb();
  if (!db) return [];
  const collection = db.collection<EnrichedProfileRecord>('profiles');
  return await collection.find({}).sort({ updatedAt: -1 }).toArray();
}

export async function upsertProfileToDb(profile: EnrichedProfileRecord): Promise<boolean> {
  const db = await getMongoDb();
  if (!db) return false;
  const collection = db.collection<EnrichedProfileRecord>('profiles');
  await collection.updateOne(
    { domain: profile.domain },
    { $set: profile },
    { upsert: true }
  );
  return true;
}

export async function deleteProfileFromDb(id: string): Promise<boolean> {
  const db = await getMongoDb();
  if (!db) return false;
  const collection = db.collection<EnrichedProfileRecord>('profiles');
  const res = await collection.deleteOne({ id });
  return res.deletedCount > 0;
}
