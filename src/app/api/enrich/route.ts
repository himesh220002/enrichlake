import { NextRequest, NextResponse } from 'next/server';
import { enrichDomain } from '@/lib/scraper/enrichDomain';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { domain, byokConfig } = body;

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // Run stealth scraper — AI synthesis is now on-demand via /api/ai-analyze
    const profile = await enrichDomain(domain, byokConfig);

    return NextResponse.json({
      success: profile.status === 'success',
      data: profile,
      // aiSynthesis intentionally omitted — use /api/ai-analyze on demand
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to process enrichment' },
      { status: 500 }
    );
  }
}

