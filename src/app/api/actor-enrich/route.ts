import { NextRequest, NextResponse } from 'next/server';
import { refineWebContentHeuristic, RefinedContentData } from '@/lib/scraper/contentRefiner';
import { executeByokAgent } from '@/lib/ai/byokAgent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { markdown, title, url, headings, wordCount, byokConfig } = body;

    if (!markdown && !title) {
      return NextResponse.json(
        { error: 'Markdown content or title is required for content refinement.' },
        { status: 400 }
      );
    }

    // Step 1: Compute baseline structured refinement using NLP & structural heuristics
    const heuristicData = refineWebContentHeuristic({
      markdown: markdown || '',
      title: title || 'Web Page',
      url: url || '',
      headings: headings || [],
      wordCount: wordCount || 0,
    });

    let finalData: RefinedContentData = heuristicData;

    // Step 2: If user provided active BYOK key, enhance with live LLM synthesis
    if (byokConfig?.apiKey && byokConfig?.provider) {
      try {
        const aiResponse = await executeByokAgent({
          provider: byokConfig.provider,
          model: byokConfig.model || 'default',
          apiKey: byokConfig.apiKey,
          companyData: {
            domain: url || 'website.com',
            companyName: title || 'Website',
            description: (markdown || '').slice(0, 800),
            technologies: heuristicData.technologySignals,
            emails: heuristicData.contacts.emails,
            phones: heuristicData.contacts.phones,
            socialLinks: {},
          },
        });

        if (aiResponse) {
          finalData = {
            ...heuristicData,
            executiveSummary: aiResponse.summary || heuristicData.executiveSummary,
            targetAudience: aiResponse.icpFit || heuristicData.targetAudience,
            keyTakeaways: aiResponse.buyingSignals?.length ? aiResponse.buyingSignals : heuristicData.keyTakeaways,
            refinementSource: 'ai_synthesis',
          };
        }
      } catch (aiErr: any) {
        console.warn('[actor-enrich] BYOK AI optional enhancement notice:', aiErr.message);
        // Graceful fallback to heuristicData
      }
    }

    return NextResponse.json({
      success: true,
      data: finalData,
    });
  } catch (error: any) {
    console.error('[actor-enrich] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to refine web content.' },
      { status: 500 }
    );
  }
}
