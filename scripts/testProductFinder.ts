import { findProductsWithGeoRadius } from '../src/lib/scraper/productFinder';

async function main() {
  const query = process.argv[2] || 'bulk rice 50kg';
  const center = process.argv[3] || 'Malda, WB, India';
  const range = parseInt(process.argv[4] || '500', 10);

  console.log(`\n======================================================`);
  console.log(`[Test] Universal Product Finder & Geo-Radius Enricher`);
  console.log(`Product Query: "${query}"`);
  console.log(`Center Location: "${center}" | Range: ${range} km`);
  console.log(`======================================================\n`);

  const results = await findProductsWithGeoRadius({
    productQuery: query,
    centerLocation: center,
    rangeKm: range,
    maxResults: 5,
  });

  console.log(`[Test] Found ${results.length} sellers within ${range} km.`);
  if (results.length > 0) {
    console.log('\n--- SAMPLE EXTRACTED SELLER ---');
    console.log(JSON.stringify(results[0], null, 2));
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
