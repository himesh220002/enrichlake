import { NextRequest, NextResponse } from 'next/server';
import { scrapeGoogleMapsPlacesEnterprise } from '@/lib/scraper/googleMapsPlaceExtractor';
import { scrapeGoogleMapsByKeywords } from '@/lib/scraper/googleMapsScraper';
import { refineKeywordScrapedData } from '@/lib/scraper/dataRefiner';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      mode,
      searchQuery,
      keywordsInput,
      location = 'New York',
      radiusKm = 10,
      maxResults = 25,
      enrichWebsites = true,
      scrapePlaceDetailPage = false,
      minMatchScore = 50,
      requirePhoneOrEmail = false,
    } = body;

    // Mode 1: Enterprise Google Maps Place Scraper (In-House 35+ fields & grid tiling)
    if (mode === 'enterprise_places' || (searchQuery && typeof searchQuery === 'string')) {
      const query = (searchQuery || keywordsInput || 'Restaurants').trim();
      if (!query) {
        return NextResponse.json({ error: 'Search query or category is required' }, { status: 400 });
      }

      const report = await scrapeGoogleMapsPlacesEnterprise({
        searchQuery: query,
        location,
        radiusKm: Number(radiusKm) || 10,
        maxResults: Math.min(Number(maxResults) || 25, 100),
        scrapePlaceDetailPage: Boolean(scrapePlaceDetailPage),
        enrichWebsites: Boolean(enrichWebsites),
      });

      return NextResponse.json({
        success: report.success,
        mode: 'enterprise_places',
        query: report.query,
        report: report.stats,
        places: report.places,
      });
    }

    // Mode 2: Legacy Product / Hardware Keyword Scraper
    if (!keywordsInput || typeof keywordsInput !== 'string') {
      return NextResponse.json(
        { error: 'Provide a searchQuery (e.g. "Italian Restaurants") or comma-separated keywords' },
        { status: 400 }
      );
    }

    const parsedKeywords = keywordsInput
      .split(',')
      .map((k: string) => k.trim())
      .filter(Boolean);

    if (parsedKeywords.length === 0) {
      return NextResponse.json({ error: 'At least one keyword is required' }, { status: 400 });
    }

    const rawItems = await scrapeGoogleMapsByKeywords({
      keywords: parsedKeywords,
      location,
      maxResults: Math.min(Number(maxResults) || 10, 30),
      enrichWebsites,
    });

    const refinedReport = refineKeywordScrapedData(rawItems, {
      minMatchScore,
      requirePhoneOrEmail,
    });

    return NextResponse.json({
      success: true,
      mode: 'keyword_matcher',
      query: {
        keywords: parsedKeywords,
        location,
      },
      report: {
        originalCount: refinedReport.originalCount,
        refinedCount: refinedReport.refinedCount,
        duplicatesRemoved: refinedReport.duplicatesRemoved,
        cleanedContactsCount: refinedReport.cleanedContactsCount,
      },
      items: refinedReport.items,
    });
  } catch (error: any) {
    console.error('[API /api/maps-scrape] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process Google Maps scraping' },
      { status: 500 }
    );
  }
}
