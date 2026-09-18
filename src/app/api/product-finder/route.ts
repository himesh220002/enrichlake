import { NextRequest, NextResponse } from 'next/server';
import { findProductsWithGeoRadius } from '@/lib/scraper/productFinder';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productQuery,
      centerLocation = 'Malda, WB, India',
      rangeKm = 500,
      category = '',
      maxResults = 15,
    } = body;

    if (!productQuery || typeof productQuery !== 'string') {
      return NextResponse.json(
        { error: 'Product query is required (e.g. bulk rice 50kg, bulk steel rods, wholesale electronics)' },
        { status: 400 }
      );
    }

    const records = await findProductsWithGeoRadius({
      productQuery,
      centerLocation,
      rangeKm: Number(rangeKm) || 0,
      category,
      maxResults: Number(maxResults) || 15,
    });

    return NextResponse.json({
      success: true,
      query: {
        productQuery,
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
