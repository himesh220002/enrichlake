import { NextRequest, NextResponse } from 'next/server';
import { crawlWebsiteContent } from '@/lib/scraper/webContentCrawler';
import { scrapeInstagramProfile } from '@/lib/scraper/instagramScraper';
import { scrapeLinkedInCompany } from '@/lib/scraper/linkedinScraper';
import { scrapeFacebookPage } from '@/lib/scraper/facebookScraper';
import { scrapeMetaAdLibrary } from '@/lib/scraper/metaAdScraper';

export const maxDuration = 60; // 60s timeout allowance for deep stealth crawls

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const stages: string[] = [];

  try {
    const body = await req.json();
    const { type, target, options = {} } = body;

    if (!type || !target) {
      return NextResponse.json(
        { error: 'Missing required parameters: type and target are required.' },
        { status: 400 }
      );
    }

    stages.push('Request payload validated');

    let resultData: any = null;

    if (type === 'web_content') {
      stages.push('Initializing Web Content Crawler with Cheerio + Stealth Playwright');
      resultData = await crawlWebsiteContent({
        url: target,
        renderJs: options.renderJs !== false,
        timeoutMs: options.timeoutMs || 25000,
        includeLinks: options.includeLinks,
        includeImages: options.includeImages,
      });
      stages.push('Page rendered and clean Markdown hierarchy compiled');
    } else if (type === 'instagram') {
      stages.push('Initializing Instagram Stealth Profile & Post Harvester');
      resultData = await scrapeInstagramProfile(target);
      stages.push('Metrics, verified badge, and recent public posts resolved');
    } else if (type === 'linkedin') {
      stages.push('Initializing LinkedIn Stealth Company & Entity Resolver');
      resultData = await scrapeLinkedInCompany(target);
      stages.push('Company dossier, headcount, HQ, and industry classified');
    } else if (type === 'facebook') {
      stages.push('Initializing Facebook Public Page Harvester');
      resultData = await scrapeFacebookPage(target);
      stages.push('Page likes, followers, contact info, and public posts with views resolved');
    } else if (type === 'meta_ads') {
      stages.push('Initializing Meta Ad Library Crawler (Facebook & Instagram Ads)');
      resultData = await scrapeMetaAdLibrary(target, options.country || 'ALL');
      stages.push('Active ad creatives, platforms, CTA buttons, and impressions telemetry compiled');
    } else {
      return NextResponse.json(
        { error: `Unsupported scraper type: ${type}. Expected 'web_content' | 'instagram' | 'linkedin' | 'facebook' | 'meta_ads'.` },
        { status: 400 }
      );
    }

    const durationMs = Date.now() - startTime;
    stages.push(`Scraping workflow completed in ${(durationMs / 1000).toFixed(2)}s`);

    return NextResponse.json({
      success: true,
      type,
      target,
      data: resultData,
      telemetry: {
        durationMs,
        stagesCompleted: stages,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[API /api/actor-scrape] Error:', error.message);
    const durationMs = Date.now() - startTime;
    return NextResponse.json(
      {
        error: error.message || 'Failed to complete actor scraping job.',
        telemetry: {
          durationMs,
          stagesCompleted: stages,
          failedAt: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
