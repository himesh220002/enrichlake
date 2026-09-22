import { NextRequest, NextResponse } from 'next/server';
import { refineDomainDossierHeuristic, RefinedDomainDossier } from '@/lib/scraper/domainRefiner';
import { executeByokAgent } from '@/lib/ai/byokAgent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, byokConfig } = body;

    if (!profile || (!profile.domain && !profile.companyName)) {
      return NextResponse.json(
        { error: 'Profile with domain or company name is required for domain intelligence refinement.' },
        { status: 400 }
      );
    }

    // Step 1: Compute baseline structured executive dossier & categorical harvest
    const heuristicData = refineDomainDossierHeuristic(profile);
    let finalData: RefinedDomainDossier = heuristicData;

    // Step 2: If user provided active BYOK key, enhance with live LLM synthesis
    if (byokConfig?.apiKey && byokConfig?.provider) {
      try {
        const aiResponse = await executeByokAgent({
          provider: byokConfig.provider,
          model: byokConfig.model || 'default',
          apiKey: byokConfig.apiKey,
          companyData: {
            domain: profile.domain || 'domain.com',
            companyName: profile.companyName || profile.domain,
            description: profile.description || heuristicData.executiveSummary,
            technologies: (profile.technographics?.technologies || []).map((t: any) =>
              typeof t === 'string' ? t : t.name
            ),
            emails: profile.contactInfo?.emails || [],
            phones: profile.contactInfo?.phones || [],
            socialLinks: (profile.contactInfo?.socialLinks as Record<string, string>) || {},
          },
        });

        if (aiResponse) {
          finalData = {
            ...heuristicData,
            executiveSummary: aiResponse.summary || heuristicData.executiveSummary,
            targetAudience: aiResponse.icpFit || heuristicData.targetAudience,
            buyerIntentScore: aiResponse.buyerIntentScore || heuristicData.buyerIntentScore,
            icpClassification: aiResponse.icpFit || heuristicData.icpClassification,
            keyTakeaways: aiResponse.buyingSignals?.length ? aiResponse.buyingSignals : heuristicData.keyTakeaways,
            refinementSource: 'ai_synthesis',
          };
        }
      } catch (aiErr: any) {
        console.warn('[domain-refine] BYOK AI enhancement notice:', aiErr.message);
        // Fallback to high-quality heuristicData
      }
    }

    return NextResponse.json({
      success: true,
      data: finalData,
    });
  } catch (error: any) {
    console.error('[domain-refine] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to refine domain intelligence.' },
      { status: 500 }
    );
  }
}
