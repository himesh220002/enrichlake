import { NextRequest, NextResponse } from 'next/server';
import { getProfilesFromDb, upsertProfileToDb, deleteProfileFromDb, getMongoDb } from '@/lib/storage/mongoService';

export async function GET() {
  try {
    const isMongoConnected = (await getMongoDb()) !== null;
    const profiles = await getProfilesFromDb();

    return NextResponse.json({
      storage: isMongoConnected ? 'mongodb' : 'localstorage',
      mongoConnected: isMongoConnected,
      profiles,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const profile = await req.json();
    if (!profile || !profile.domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    const saved = await upsertProfileToDb(profile);
    return NextResponse.json({
      success: true,
      savedToMongo: saved,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
