import { searchProductsAndSpecs } from '../src/lib/scraper/productSpecScraper';

async function main() {
  const query = process.argv[2] || 'i5, 16gb ram, rtx 3050, 144hz, under 1 lakh';
  const center = process.argv[3] || 'Malda, WB, India';
  const range = parseInt(process.argv[4] || '500', 10);

  console.log(`\n======================================================`);
  console.log(`[Test] Universal Product & Specs Finder`);
  console.log(`Query: "${query}" | Center: "${center}" | Range: ${range} km`);
  console.log(`======================================================\n`);

  const records = await searchProductsAndSpecs({
    query,
    centerLocation: center,
    rangeKm: range,
    maxResults: 5,
  });

  console.log(`[Test] Returned ${records.length} records:`);
  records.forEach((r, idx) => {
    console.log(`\n[${idx + 1}] Product: ${r.product} | Specs: ${r.specs} | Price: ${r.price}`);
    console.log(`    Seller: ${r.sellerBusiness} | Source: ${r.websiteSource} | Location: ${r.location} (${r.distanceKm} km)`);
    console.log(`    Logistics: ${r.logistics} | Status: ${r.statusTag}`);
  });

  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
