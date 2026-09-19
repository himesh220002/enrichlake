import { NextRequest, NextResponse } from 'next/server';
import { searchProductsAndSpecs } from '@/lib/scraper/productSpecScraper';
import { getRegionalCoverageMetadata } from '@/lib/types/scraperTypes';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      query = '',
      category = '',
      product = '',
      specs = '',
      structuredSpecs,
      minPrice,
      maxPrice,
      priceRange = '',
      scope = 'radius',
      centerLocation = 'India',
      rangeKm = 500,
      maxResults = 50,
    } = body;

    if (!query && !product && !specs && !category) {
      return NextResponse.json(
        { error: 'At least an industry category, product name, specifications, or search query is required' },
        { status: 400 }
      );
    }

    const records = await searchProductsAndSpecs({
      query,
      category,
      product,
      specs,
      structuredSpecs,
      minPrice,
      maxPrice,
      priceRange,
      scope,
      centerLocation,
      rangeKm: Number(rangeKm) || 0,
      maxResults: Math.min(Math.max(Number(maxResults) || 50, 1), 50),
    });

    const coverage = getRegionalCoverageMetadata(
      centerLocation,
      scope as any,
      Number(rangeKm) || 0,
      records.length
    );

    return NextResponse.json({
      success: true,
      coverage,
      query: { product, specs, priceRange, minPrice, maxPrice, scope, centerLocation, rangeKm },
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
