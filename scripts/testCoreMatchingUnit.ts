import assert from 'assert';
import { parseDetailedSpecs } from '../src/lib/scraper/productSpecScraper';
import { calculateHaversineDistanceKm, resolveLocationHub } from '../src/lib/geo/haversine';
import { buildHubspotPayload, buildSalesforcePayload } from '../src/lib/crm/crmSync';
import { refineKeywordScrapedData } from '../src/lib/scraper/dataRefiner';
import { ProfileStorageService, EnrichedProfileRecord } from '../src/lib/storage/profileStorage';

/**
 * Phase 4: Core Matching, Safe-Sync 0% Overwrite Guarantee & Deduplication Unit Tests
 */
async function runTests() {
  console.log('========================================================');
  console.log('🚀 Running Phase 4 Core Matching & Deduplication Unit Tests');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void) {
    try {
      fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ FAIL: ${name}`);
      console.error(`    Error: ${err.message}`);
      failed++;
    }
  }

  // --- 1. Technical Specs Parser Matching ---
  console.log('\n--- 1. Technical Specs Parser & Extraction ---');

  test('extracts laptop specs (CPU, RAM, GPU, Display) accurately', () => {
    const query = 'i5, 16gb ram, rtx 3050, 144hz display, under 1 lakh';
    const specs = parseDetailedSpecs(query, 'Acer Nitro V15 Gaming Laptop', '144Hz FHD 16GB DDR5 RTX 3050');
    assert.ok(specs.includes('i5-12450H'), 'Should contain i5 processor');
    assert.ok(specs.includes('16GB DDR5'), 'Should contain 16GB DDR5 RAM');
    assert.ok(specs.includes('RTX 3050'), 'Should contain RTX 3050 GPU');
    assert.ok(specs.includes('144Hz'), 'Should contain 144Hz refresh rate');
  });

  test('extracts agricultural rice specs (moisture, grain type, pack size)', () => {
    const query = 'bulk rice 50kg basmati moisture';
    const specs = parseDetailedSpecs(query, 'Premium Basmati Rice', 'Moisture under 12%, 50kg jute bags');
    assert.ok(specs.includes('Long Grain Basmati'), 'Should identify Basmati');
    assert.ok(specs.includes('Moisture: <12%'), 'Should extract moisture spec');
    assert.ok(specs.includes('50kg Bulk Jute Bags'), 'Should extract 50kg pack size');
  });

  test('extracts industrial steel rod specs (grade, diameter, tensile strength)', () => {
    const query = 'bulk steel rods 500d 12mm rebar';
    const specs = parseDetailedSpecs(query, 'Fe 500D TMT Rebar', '12mm diameter high ductility');
    assert.ok(specs.includes('Fe 500D TMT'), 'Should identify Fe 500D');
    assert.ok(specs.includes('12mm Diameter'), 'Should identify 12mm');
    assert.ok(specs.includes('Tensile Strength'), 'Should include tensile strength');
  });

  // --- 2. Haversine Geo-Radius Perimeter Calculation ---
  console.log('\n--- 2. Geo-Radius Haversine Distance & Hub Resolution ---');

  test('resolves known hub coordinates correctly', () => {
    const malda = resolveLocationHub('Malda, WB, India');
    assert.strictEqual(malda.latitude, 25.01);
    assert.strictEqual(malda.longitude, 88.14);

    const bangalore = resolveLocationHub('Bangalore');
    assert.strictEqual(bangalore.latitude, 12.9716);
    assert.strictEqual(bangalore.longitude, 77.5946);
  });

  test('calculates accurate distance between Malda and Kolkata (~275-320 km)', () => {
    const malda = resolveLocationHub('Malda, WB, India');
    const kolkata = resolveLocationHub('Kolkata, WB');
    const distance = calculateHaversineDistanceKm(malda, kolkata);
    assert.ok(distance >= 250 && distance <= 330, `Distance ${distance}km should be within 250-330km`);
  });

  test('identifies whether a merchant is within 500km radius', () => {
    const malda = resolveLocationHub('Malda, WB, India');
    const kolkata = resolveLocationHub('Kolkata, WB');
    const bangalore = resolveLocationHub('Bangalore');

    const distKolkata = calculateHaversineDistanceKm(malda, kolkata);
    const distBangalore = calculateHaversineDistanceKm(malda, bangalore);

    assert.ok(distKolkata <= 500, 'Kolkata should be within 500km of Malda');
    assert.ok(distBangalore > 500, 'Bangalore should be outside 500km of Malda');
  });

  // --- 3. CRM Safe-Sync 0% Overwrite Stale Data Shield Guarantee ---
  console.log('\n--- 3. 0% Overwrite Safe-Sync CRM Data Shield ---');

  const mockProfile: EnrichedProfileRecord = {
    id: 'prof_test_1',
    domain: 'techworldwb.com',
    url: 'https://www.techworldwb.com',
    companyName: 'TechWorld Computers',
    category: 'Electronics Retail',
    description: 'Premier laptop retailer',
    rating: 5,
    mark: 'Qualified',
    remarks: 'Verified seller with GSTIN',
    listName: 'Procurement List',
    tags: ['Active', 'GSTIN Verified'],
    contactInfo: {
      emails: ['info@techworldwb.com'],
      phones: ['+91-9876543210'],
      addresses: ['English Bazar, WB, India'],
      socialLinks: { linkedin: 'https://linkedin.com/company/techworld' },
    },
    technographics: {
      technologies: [{ name: 'Shopify', category: 'E-Commerce', confidence: 95 }],
      rawDetectionsCount: 1,
    },
    aiAgentAnalysis: {
      provider: 'gemini',
      model: 'gemini-3.8-flash',
      buyerIntentScore: 88,
      icpFit: 'Tier 1 - High Fit',
      summary: 'High readiness buyer for computer supplies',
    },
    savedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  test('HubSpot Safe-Sync shields existing CRM fields (0% overwrite)', () => {
    const existingCrmRecord = {
      name: 'TechWorld Existing Corp',
      phone: '+91-1111111111', // Human-entered phone in CRM
    };

    const result = buildHubspotPayload(mockProfile, existingCrmRecord, true);

    // Existing fields must NOT be overwritten
    assert.strictEqual(result.payload.name, undefined, 'Existing name must not be overwritten');
    assert.strictEqual(result.payload.phone, undefined, 'Existing phone must not be overwritten');
    assert.ok(result.fieldsShielded.includes('name'), 'Name should be logged in fieldsShielded');
    assert.ok(result.fieldsShielded.includes('phone'), 'Phone should be logged in fieldsShielded');

    // Missing fields should be safely populated
    assert.strictEqual(result.payload.domain, 'techworldwb.com');
    assert.strictEqual(result.payload.technologies_used, 'Shopify');
    assert.ok(result.fieldsUpdated.includes('domain'));
    assert.ok(result.fieldsUpdated.includes('technologies_used'));
  });

  test('Salesforce Safe-Sync shields existing CRM fields (0% overwrite)', () => {
    const existingCrmRecord = {
      Phone: '+91-2222222222',
      Description: 'Manual sales rep note',
    };

    const result = buildSalesforcePayload(mockProfile, existingCrmRecord, true);

    // Shielded check
    assert.strictEqual(result.payload.Phone, undefined);
    assert.strictEqual(result.payload.Description, undefined);
    assert.ok(result.fieldsShielded.includes('Phone'));
    assert.ok(result.fieldsShielded.includes('Description'));

    // Updated check
    assert.strictEqual(result.payload.Name, 'TechWorld Computers');
    assert.strictEqual(result.payload.Tech_Stack__c, 'Shopify');
    assert.ok(result.fieldsUpdated.includes('Name'));
  });

  // --- 4. Data Refinement & Contact Normalization ---
  console.log('\n--- 4. Data Refinement, Normalization & Deduplication ---');

  test('normalizes 10-digit phone numbers and removes duplicate listings', () => {
    const rawItems: any[] = [
      {
        name: 'TechWorld Computers',
        phone: '9876543210',
        siteName: 'techworldwb.com',
        matchScore: 90,
        rating: 4.8,
        latitude: 25.0,
        longitude: 88.0,
      },
      {
        name: 'TechWorld Computers', // Duplicate by name & phone
        phone: '9876543210',
        siteName: 'techworldwb.com',
        matchScore: 85,
        rating: 4.8,
        latitude: 25.0,
        longitude: 88.0,
      },
      {
        name: 'AgroMart WB',
        phone: '+18005551234',
        siteName: 'agromartwb.in',
        matchScore: 75,
        rating: 4.5,
        latitude: 25.1,
        longitude: 88.1,
      },
    ];

    const report = refineKeywordScrapedData(rawItems);
    assert.strictEqual(report.originalCount, 3);
    assert.strictEqual(report.duplicatesRemoved, 1, 'Should detect and remove 1 duplicate');
    assert.strictEqual(report.refinedCount, 2, 'Should leave 2 unique items');
    assert.strictEqual(report.items[0].phone, '(987) 654-3210', 'Should format 10-digit phone number');
  });

  // --- 5. In-Memory Scraper Cache & Fallback Resilience ---
  console.log('\n--- 5. In-Memory Scraper Cache & Fallback Resilience ---');

  const { scraperCache } = await import('../src/lib/cache/scraperCache');

  test('scraperCache correctly caches and retrieves items within TTL', () => {
    const key = scraperCache.generateKey('test_key', { query: 'Laptop', location: 'Malda' });
    assert.strictEqual(scraperCache.get(key), null, 'Initial cache must be empty');

    const mockData = [{ id: 'test_1', name: 'Acer Nitro V15' }];
    scraperCache.set(key, mockData, 5000);

    const cached = scraperCache.get<typeof mockData>(key);
    assert.ok(cached !== null, 'Cache must return stored item');
    assert.strictEqual(cached?.length, 1);
    assert.strictEqual(cached?.[0].name, 'Acer Nitro V15');
  });

  test('scraperCache generates identical deterministic keys regardless of param order', () => {
    const keyA = scraperCache.generateKey('spec', { a: '1', b: '2', c: '3' });
    const keyB = scraperCache.generateKey('spec', { c: '3', a: '1', b: '2' });
    assert.strictEqual(keyA, keyB, 'Keys with same params in different order must be equal');
  });

  test('3-tier pricing computes launched MRP, deal price and instant card offer accurately', async () => {
    const { computeThreeTierPricing, extractCleanPriceNumber } = await import('../src/lib/scraper/productSpecScraper');

    const pricing = computeThreeTierPricing('₹75,000 - ₹85,000');
    assert.strictEqual(extractCleanPriceNumber(pricing.sellingPrice), 80000, 'Selling price must average range');
    assert.strictEqual(extractCleanPriceNumber(pricing.mrp), 96000, 'MRP must reflect 20% markup');
    assert.strictEqual(extractCleanPriceNumber(pricing.offerPrice), 75600, 'Card offer must reflect ~5.5% discount');
    assert.ok(pricing.discountPercent >= 16 && pricing.discountPercent <= 18, 'Discount % must be ~17%');
  });

  console.log('\n========================================================');
  console.log(`🏁 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Test execution exception:', err);
  process.exit(1);
});
