import { NextRequest, NextResponse } from 'next/server';
import { scrapeGoogleSearchResults } from '@/lib/scraper/googleSearchExtractor';
import { GoogleSearchQueryOptions } from '@/lib/scraper/googleSearchTypes';

export const maxDuration = 120; // Allow up to 120s for multi-page SERP searches and lead verification

/**
 * POST /api/search-scrape
 * 
 * ENRICHER Core: Google SERP & Search Intelligence Engine
 * Extracts:
 * - Organic results with sitelinks & ranking position
 * - Paid sponsored search ads (PPC competitive analysis)
 * - Google AI Overviews & AI Mode (GEO / Answer Engine Optimization)
 * - People Also Ask (PAA) accordion questions
 * - Related queries & search suggestions
 * - Product shopping ads & pricing
 * - Chained business leads & DNS MX verified corporate emails
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Parse queries: accept array of strings or newline/comma separated string
    let parsedQueries: string[] = [];
    if (Array.isArray(body.queries)) {
      parsedQueries = body.queries.map((q: any) => String(q).trim()).filter(Boolean);
    } else if (typeof body.query === 'string' && body.query.trim()) {
      parsedQueries = [body.query.trim()];
    } else if (typeof body.queries === 'string' && body.queries.trim()) {
      parsedQueries = body.queries
        .split(/[\n,]/)
        .map((q: string) => q.trim())
        .filter(Boolean);
    }

    if (!parsedQueries.length) {
      return NextResponse.json(
        { error: 'At least one valid search query is required' },
        { status: 400 }
      );
    }

    const options: GoogleSearchQueryOptions = {
      queries: parsedQueries,
      countryCode: body.countryCode || 'us',
      languageCode: body.languageCode || 'en',
      locationUule: body.locationUule || undefined,
      maxPagesPerQuery: Math.min(Math.max(Number(body.maxPagesPerQuery) || 1, 1), 5),
      resultsPerPage: Math.min(Math.max(Number(body.resultsPerPage) || 10, 10), 50),
      mobileResults: Boolean(body.mobileResults),
      includePaidAds: body.includePaidAds !== false,
      includeAiOverview: body.includeAiOverview !== false,
      includePeopleAlsoAsk: body.includePeopleAlsoAsk !== false,
      includeRelatedQueries: body.includeRelatedQueries !== false,
      enrichLeads: body.enrichLeads !== false,
      scrapeWebsiteMarkdown: Boolean(body.scrapeWebsiteMarkdown),
    };

    const report = await scrapeGoogleSearchResults(options);

    return NextResponse.json(report, { status: report.success ? 200 : 500 });
  } catch (err: any) {
    console.error('SERP Scrape Route Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal error executing Google Search scraper' },
      { status: 500 }
    );
  }
}
