import { NextRequest, NextResponse } from 'next/server';
import { enrichDomain } from '@/lib/scraper/enrichDomain';
import { executeByokAgent } from '@/lib/ai/byokAgent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { domain, byokConfig } = body;

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // Run zero-cost stealth scraper
    const profile = await enrichDomain(domain);

    // If BYOK AI is configured, execute the AI agent
    let aiSynthesis = null;
    if (byokConfig && byokConfig.apiKey && byokConfig.provider) {
      try {
        aiSynthesis = await executeByokAgent({
          provider: byokConfig.provider,
          model: byokConfig.model || 'default',
          apiKey: byokConfig.apiKey,
          companyData: {
            domain: profile.domain,
            companyName: profile.companyName,
            description: profile.description,
            technologies: profile.technographics.technologies.map((t) => t.name),
            emails: profile.contactInfo.emails,
            phones: profile.contactInfo.phones,
            socialLinks: profile.contactInfo.socialLinks as Record<string, string>,
          },
        });
      } catch (err: any) {
        console.error('[Enrich API] BYOK Agent failed:', err.message);
      }
    }

    return NextResponse.json({
      success: profile.status === 'success',
      data: profile,
      aiSynthesis,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to process enrichment' },
      { status: 500 }
    );
  }
}
