import { NextRequest, NextResponse } from 'next/server';
import { findProductsWithGeoRadius } from '@/lib/scraper/productFinder';
import { getRegionalCoverageMetadata } from '@/lib/types/scraperTypes';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productQuery = '',
      product = '',
      specs = '',
      structuredSpecs,
      minPrice,
      maxPrice,
      priceRange = '',
      scope = 'radius',
      centerLocation = 'Malda, WB, India',
      rangeKm = 500,
      category = '',
      maxResults = 50,
    } = body;

    if (!productQuery && !product && !specs && !category) {
      return NextResponse.json(
        { error: 'Industry category, product name, criteria, or query is required (e.g. bulk rice 50kg, bulk steel rods, wholesale electronics)' },
        { status: 400 }
      );
    }

    const records = await findProductsWithGeoRadius({
      productQuery,
      product,
      specs,
      structuredSpecs,
      minPrice,
      maxPrice,
      priceRange,
      scope,
      centerLocation,
      rangeKm: Number(rangeKm) || 0,
      category,
      maxResults: Math.min(Math.max(Number(maxResults) || 50, 1), 10000),
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
      query: {
        product,
        specs,
        priceRange,
        minPrice,
        maxPrice,
        scope,
        centerLocation,
        rangeKm,
      },
      count: records.length,
      records,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to execute product finder scrape' },
      { status: 500 }
    );
  }
}
