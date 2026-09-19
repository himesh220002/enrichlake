import {
  B2B_INDUSTRY_CATEGORIES,
  CATEGORY_QUICK_TEMPLATES,
  synthesizeB2BPricing,
  formatSpecsFromList,
  computeThreeTierPricing
} from '../src/lib/types/scraperTypes';
import { searchProductsAndSpecs } from '../src/lib/scraper/productSpecScraper';

async function testCategoryAndTemplates() {
  console.log('========================================================');
  console.log('🧪 Testing Category, Empty Product Name & Quick Templates');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(cond: boolean, desc: string) {
    if (cond) {
      console.log(`  ✓ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${desc}`);
      failed++;
    }
  }

  // Test 1: B2B Industry Categories standard set
  console.log('--- 1. B2B Industry Categories Verification ---');
  assert(B2B_INDUSTRY_CATEGORIES.length >= 12, `At least 12 standard industries defined (found ${B2B_INDUSTRY_CATEGORIES.length})`);
  assert(B2B_INDUSTRY_CATEGORIES.includes('Electronics & Computers (IT)'), 'Includes IT & Electronics');
  assert(B2B_INDUSTRY_CATEGORIES.includes('Industrial Metals & Steel'), 'Includes Metals & Steel');
  assert(B2B_INDUSTRY_CATEGORIES.includes('Agriculture & Food Commodities'), 'Includes Agriculture');
  assert(B2B_INDUSTRY_CATEGORIES.includes('Solar & Renewable Energy'), 'Includes Solar');

  // Test 2: Category Quick Templates
  console.log('\n--- 2. Expanded 14 Business Search Quick Templates ---');
  assert(CATEGORY_QUICK_TEMPLATES.length === 14, `All 14 business templates registered (found ${CATEGORY_QUICK_TEMPLATES.length})`);
  
  const pureSpecTemplates = CATEGORY_QUICK_TEMPLATES.filter(t => !t.productName);
  assert(pureSpecTemplates.length >= 2, `Contains pure spec templates with empty product name (found ${pureSpecTemplates.length})`);
  assert(pureSpecTemplates.some(t => t.id === 'heavy_valves'), 'Hydraulic Valves template has empty product name for pure spec searching');
  assert(pureSpecTemplates.some(t => t.id === 'heavy_ppe'), 'PPE Gloves template has empty product name');

  // Verify each template has valid specs and pricing
  CATEGORY_QUICK_TEMPLATES.forEach(tpl => {
    assert(tpl.specs.length >= 3, `Template "${tpl.title}" has >= 3 specs defined`);
    assert(Boolean(tpl.category), `Template "${tpl.title}" has assigned category: ${tpl.category}`);
  });

  // Test 3: Wholesale Pricing Synthesis for Multiple Industries
  console.log('\n--- 3. Multi-Industry Wholesale Pricing Synthesis ---');
  const solarPricing = synthesizeB2BPricing('Bifacial Solar Module', '550W TOPCon', '₹20');
  assert(solarPricing.wholesalePrice.includes('₹'), 'Generates wholesale pricing for solar');
  assert(solarPricing.moq.includes('Pallet'), 'Generates realistic pallet MOQ for solar');

  const chemicalPricing = synthesizeB2BPricing('IPA', '99.9% Purity', '₹110');
  assert(chemicalPricing.moq.includes('Drums'), 'Generates bulk drum MOQ for industrial chemicals');

  // Test 4: Search With Empty Product Name (Category + Specs Pure Search)
  console.log('\n--- 4. Search With Empty Product Name ---');
  const pureResults = await searchProductsAndSpecs({
    category: 'Industrial Metals & Steel',
    product: '', // EMPTY PRODUCT NAME
    specs: 'Grade: Fe 500D TMT, Diameter: 12mm-32mm',
    scope: 'radius',
    centerLocation: 'Malda, WB, India',
    rangeKm: 500,
    maxResults: 10,
  });

  assert(pureResults.length > 0, `Returns results when product name is empty (got ${pureResults.length} records)`);
  assert(pureResults.every(r => r.category === 'Industrial Metals & Steel'), 'Assigns category to all resulting records');
  assert(pureResults.every(r => r.b2bPricing && r.b2bPricing.wholesalePrice), 'Calculates B2B wholesale pricing without product model');

  console.log('\n========================================================');
  console.log(`🏁 Results: ${passed} Passed, ${failed} Failed`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

testCategoryAndTemplates().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
