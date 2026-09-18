import { NextRequest, NextResponse } from 'next/server';
import { scrapeGoogleMapsByKeywords } from '@/lib/scraper/googleMapsScraper';
import { refineKeywordScrapedData } from '@/lib/scraper/dataRefiner';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      keywordsInput,
      location = '',
      maxResults = 10,
      enrichWebsites = true,
      minMatchScore = 50,
      requirePhoneOrEmail = false,
    } = body;

    if (!keywordsInput || typeof keywordsInput !== 'string') {
      return NextResponse.json(
        { error: 'Provide keywords separated by commas (e.g. 16gb ram, i5, rtx3050, 144hz display, under 1 lakh)' },
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

    // Run stealth Google Maps and multi-site extraction
    const rawItems = await scrapeGoogleMapsByKeywords({
      keywords: parsedKeywords,
      location,
      maxResults: Math.min(maxResults, 20),
      enrichWebsites,
    });

    // Run data cleaning & refinement pipeline
    const refinedReport = refineKeywordScrapedData(rawItems, {
      minMatchScore,
      requirePhoneOrEmail,
    });

    return NextResponse.json({
      success: true,
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
    return NextResponse.json(
      { error: error?.message || 'Failed to process keyword map scraping' },
      { status: 500 }
    );
  }
}
