import { NextRequest, NextResponse } from 'next/server';
import { refineDomainDossierHeuristic, RefinedDomainDossier } from '@/lib/scraper/domainRefiner';
import { refineDomainDossierLive } from '@/lib/scraper/domainRefinerServer';
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

    // Step 1: Compute authoritative structured executive dossier with live network audit (RDAP, DNS, TLS, ASN)
    let finalData: RefinedDomainDossier;
    try {
      finalData = await refineDomainDossierLive(profile);
    } catch {
      finalData = refineDomainDossierHeuristic(profile);
    }

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
            description: profile.description || finalData.executiveSummary,
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
            ...finalData,
            executiveSummary: aiResponse.summary || finalData.executiveSummary,
            targetAudience: aiResponse.icpFit || finalData.targetAudience,
            buyerIntentScore: aiResponse.buyerIntentScore || finalData.buyerIntentScore,
            icpClassification: aiResponse.icpFit || finalData.icpClassification,
            keyTakeaways: aiResponse.buyingSignals?.length ? aiResponse.buyingSignals : finalData.keyTakeaways,
            refinementSource: 'ai_synthesis',
          };
        }
      } catch (aiErr: any) {
        console.warn('[domain-refine] BYOK AI enhancement notice:', aiErr.message);
        // Fallback to high-quality finalData
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
