import { NextRequest, NextResponse } from 'next/server';
import { executeByokAgent } from '@/lib/ai/byokAgent';

/**
 * POST /api/ai-analyze
 *
 * On-demand BYOK AI synthesis — only called when the user explicitly
 * clicks "Generate Analysis". The main /api/enrich route no longer
 * triggers the AI automatically, saving tokens on every test run.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { byokConfig, companyData } = body;

    if (!byokConfig?.apiKey || !byokConfig?.provider) {
      return NextResponse.json(
        { error: 'BYOK API key and provider are required' },
        { status: 400 }
      );
    }

    if (!companyData?.domain) {
      return NextResponse.json(
        { error: 'Company data with domain is required' },
        { status: 400 }
      );
    }

    const synthesis = await executeByokAgent({
      provider: byokConfig.provider,
      model: byokConfig.model || 'default',
      apiKey: byokConfig.apiKey,
      companyData,
    });

    return NextResponse.json({ success: true, aiSynthesis: synthesis });
  } catch (error: any) {
    console.error('[AI Analyze] Failed:', error.message);
    return NextResponse.json(
      { error: error?.message || 'AI synthesis failed' },
      { status: 500 }
    );
  }
}
