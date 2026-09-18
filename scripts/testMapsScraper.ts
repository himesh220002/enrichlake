import { scrapeGoogleMapsByKeywords } from '../src/lib/scraper/googleMapsScraper';
import { refineKeywordScrapedData } from '../src/lib/scraper/dataRefiner';

async function main() {
  const keywordsInput = process.argv[2] || '16gb ram, i5, rtx3050, 144hz display, under 1 lakh';
  const location = process.argv[3] || 'Bangalore';

  console.log(`\n======================================================`);
  console.log(`[Test] Google Maps & Keyword Scraper`);
  console.log(`Keywords: ${keywordsInput}`);
  console.log(`Location: ${location}`);
  console.log(`======================================================\n`);

  const keywords = keywordsInput.split(',').map((k) => k.trim()).filter(Boolean);

  const rawResults = await scrapeGoogleMapsByKeywords({
    keywords,
    location,
    maxResults: 5,
    enrichWebsites: false,
  });

  console.log(`[Test] Scraped ${rawResults.length} raw results.`);

  const refined = refineKeywordScrapedData(rawResults);
  console.log('\n--- REFINING REPORT ---');
  console.log(`Original: ${refined.originalCount} | Refined: ${refined.refinedCount} | Duplicates Removed: ${refined.duplicatesRemoved}`);

  console.log('\n--- SAMPLE EXTRACTED ITEM ---');
  if (refined.items.length > 0) {
    console.log(JSON.stringify(refined.items[0], null, 2));
  } else {
    console.log('No items returned.');
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
