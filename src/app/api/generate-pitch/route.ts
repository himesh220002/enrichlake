import { NextRequest, NextResponse } from 'next/server';
import { generateOutreachPitch, PitchTone } from '@/lib/ai/pitchGenerator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyName,
      domain,
      valueProposition,
      industry,
      coreOfferings,
      activeAdsCount,
      topAdHeadline,
      techStack,
      tone = 'direct',
      contactName,
    } = body;

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required to generate outreach pitch.' },
        { status: 400 }
      );
    }

    const pitch = generateOutreachPitch({
      companyName,
      domain,
      valueProposition,
      industry,
      coreOfferings,
      activeAdsCount,
      topAdHeadline,
      techStack,
      tone: tone as PitchTone,
      contactName,
    });

    return NextResponse.json({
      success: true,
      data: pitch,
    });
  } catch (error: any) {
    console.error('[API /api/generate-pitch] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to generate outreach pitch.' },
      { status: 500 }
    );
  }
}
