import { NextRequest, NextResponse } from 'next/server';
import { searchProductsAndSpecs } from '@/lib/scraper/productSpecScraper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, centerLocation = 'India', rangeKm = 500, maxResults = 10 } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const records = await searchProductsAndSpecs({
      query,
      centerLocation,
      rangeKm: Number(rangeKm) || 0,
      maxResults: Number(maxResults) || 10,
    });

    return NextResponse.json({
      success: true,
      query: { query, centerLocation, rangeKm },
      count: records.length,
      records,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to search product specifications' },
      { status: 500 }
    );
  }
}
