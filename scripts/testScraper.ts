import { enrichDomain } from '../src/lib/scraper/enrichDomain';

async function main() {
  const targetDomain = process.argv[2] || 'example.com';
  console.log(`\n========================================`);
  console.log(`[Test] Running Zero-Cost Scraper on: ${targetDomain}`);
  console.log(`========================================\n`);

  const result = await enrichDomain(targetDomain);

  console.log('--- ENRICHMENT RESULT ---');
  console.log(JSON.stringify(result, null, 2));
  console.log('\n[Test] Finished in', result.executionTimeMs, 'ms');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error during test:', err);
  process.exit(1);
});
