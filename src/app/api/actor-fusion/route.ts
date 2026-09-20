import { NextRequest, NextResponse } from 'next/server';
import { sweepOmnichannel360 } from '@/lib/scraper/omnichannelFusion';

export const maxDuration = 60; // 60s timeout allowance for multi-channel parallel sweeps

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const { target } = body;

    if (!target || !target.trim()) {
      return NextResponse.json(
        { error: 'Target brand name, domain, or company URL is required for 360° Omnichannel Fusion.' },
        { status: 400 }
      );
    }

    const dossier = await sweepOmnichannel360(target.trim());
    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: dossier,
      telemetry: {
        durationMs,
        channelsSwept: dossier.channelsDetected,
        digitalPresenceScore: dossier.digitalPresenceScore,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[API /api/actor-fusion] Error:', error.message);
    const durationMs = Date.now() - startTime;
    return NextResponse.json(
      {
        error: error.message || 'Failed to complete 360° omnichannel lead fusion sweep.',
        telemetry: {
          durationMs,
          failedAt: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
