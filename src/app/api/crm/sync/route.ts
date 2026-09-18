import { NextRequest, NextResponse } from 'next/server';
import { syncProfileToCrm } from '@/lib/crm/crmSync';
import { EnrichedProfileRecord } from '@/lib/storage/profileStorage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, crm, apiKey, shieldExisting } = body;

    if (!profile || !crm) {
      return NextResponse.json({ error: 'Profile and target CRM are required' }, { status: 400 });
    }

    const result = await syncProfileToCrm(profile as EnrichedProfileRecord, crm, {
      apiKey,
      shieldExisting: shieldExisting ?? true,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to sync to CRM' },
      { status: 500 }
    );
  }
}
