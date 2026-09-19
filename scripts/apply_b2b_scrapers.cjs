const fs = require('fs');
const path = require('path');

const enricherDir = path.resolve('../Enricher/enricher-app');
const specScraperPath = path.join(enricherDir, 'src/lib/scraper/productSpecScraper.ts');
const productFinderPath = path.join(enricherDir, 'src/lib/scraper/productFinder.ts');
const pagePath = path.join(enricherDir, 'src/app/page.tsx');

console.log('Targeting:', { specScraperPath, productFinderPath, pagePath });

// 1. UPDATE productSpecScraper.ts
let specScraperCode = fs.readFileSync(specScraperPath, 'utf8');

// Ensure B2BPricingDetails interface is added
if (!specScraperCode.includes('export interface B2BPricingDetails')) {
  const interfaceDefinition = `export interface B2BPricingDetails {
  wholesalePrice: string;
  bulkDiscountTier: string;
  moq: string;
  b2bStrategy: string;
  sellingStrategyType: 'post_meeting_rfp' | 'volume_slabs' | 'corporate_dealer' | 'trade_credit';
  paymentTerms: string;
  meetingRequired: boolean;
}

export function synthesizeB2BPricing(
  product: string,
  specs: string,
  retailPrice: string,
  query: string = ''
): B2BPricingDetails {
  const combined = \`\${product} \${specs} \${query}\`.toLowerCase();
  const priceDigits = retailPrice.replace(/[^\\d]/g, '');
  const priceNum = priceDigits ? parseInt(priceDigits, 10) : 0;

  if (combined.includes('laptop') || combined.includes('rtx') || combined.includes('i5') || combined.includes('ram') || combined.includes('nitro') || combined.includes('victus') || combined.includes('tuf')) {
    const wholesaleVal = priceNum > 0 ? Math.round(priceNum * 0.82) : 74500;
    return {
      wholesalePrice: \`₹\${wholesaleVal.toLocaleString('en-IN')}\`,
      bulkDiscountTier: '18%–24% off (10+ units)',
      moq: 'MOQ: 5 units',
      b2bStrategy: 'Exposed post-meeting RFP via Corporate Dealer Desk; unlocks GST Input Tax Credit (18% ITC) & commercial volume margin',
      sellingStrategyType: 'post_meeting_rfp',
      paymentTerms: 'Net 30 on vendor approval / Corporate PO',
      meetingRequired: true,
    };
  } else if (combined.includes('rice') || combined.includes('wheat') || combined.includes('grain') || combined.includes('agro')) {
    const wholesaleVal = priceNum > 0 ? Math.round(priceNum * 0.80) : 1950;
    return {
      wholesalePrice: \`₹\${wholesaleVal.toLocaleString('en-IN')} / 50kg\`,
      bulkDiscountTier: '15%–22% off on 50+ bags (Tiered Truckload)',
      moq: 'MOQ: 25 bags (1.25 MT)',
      b2bStrategy: 'Direct Mandi Wholesaler Margin Contract; post-sample inspection spot pricing with Mandi Cess exemption',
      sellingStrategyType: 'volume_slabs',
      paymentTerms: '50% advance / 50% on weighbridge slip',
      meetingRequired: false,
    };
  } else if (combined.includes('steel') || combined.includes('rod') || combined.includes('tmt') || combined.includes('metal')) {
    const wholesaleVal = priceNum > 0 ? Math.round(priceNum * 0.85) : 49500;
    return {
      wholesalePrice: \`₹\${wholesaleVal.toLocaleString('en-IN')} / MT\`,
      bulkDiscountTier: '12%–18% off on 10+ MT (Mill Direct)',
      moq: 'MOQ: 2 Metric Tons',
      b2bStrategy: 'Rolling margin rebate negotiated during distributor contract meeting; includes Mill Test Certificate',
      sellingStrategyType: 'post_meeting_rfp',
      paymentTerms: 'LC (Letter of Credit) / Bank Escrow / Net 15',
      meetingRequired: true,
    };
  } else if (combined.includes('cotton') || combined.includes('textile') || combined.includes('fabric')) {
    const wholesaleVal = priceNum > 0 ? Math.round(priceNum * 0.78) : 160;
    return {
      wholesalePrice: \`₹\${wholesaleVal.toLocaleString('en-IN')} / meter\`,
      bulkDiscountTier: '20%–26% off on 500m+ roll orders',
      moq: 'MOQ: 100 meters',
      b2bStrategy: 'Volume Slab matrix hidden from retail consumers; exposed via B2B trade account application',
      sellingStrategyType: 'volume_slabs',
      paymentTerms: 'Net 30 after trade credit validation',
      meetingRequired: false,
    };
  }

  const wholesaleVal = priceNum > 0 ? Math.round(priceNum * 0.82) : 0;
  return {
    wholesalePrice: wholesaleVal > 0 ? \`₹\${wholesaleVal.toLocaleString('en-IN')}\` : 'Custom Wholesale Quote',
    bulkDiscountTier: '15%–25% off for volume procurement',
    moq: 'MOQ: 5–10 units',
    b2bStrategy: 'Hidden to retail users; exposed post-meeting RFP or corporate trade account inquiry',
    sellingStrategyType: 'post_meeting_rfp',
    paymentTerms: 'Net 30 / Corporate Invoicing',
    meetingRequired: true,
  };
}
`;

  specScraperCode = specScraperCode.replace(
    'export interface ProductSpecRecord {',
    interfaceDefinition + '\nexport interface ProductSpecRecord {\n  b2bPricing?: B2BPricingDetails;'
  );

  // Update records.push in searchProductsAndSpecs
  specScraperCode = specScraperCode.replace(
    /records\.push\({\s*id: `spec_\${Date\.now\(\)}_\${i}`,/g,
    `records.push({
        id: \`spec_\${Date.now()}_\${i}\`,
        b2bPricing: benchmark?.b2bPricing || synthesizeB2BPricing(productName, specsString, price, effectiveQuery),`
  );

  fs.writeFileSync(specScraperPath, specScraperCode, 'utf8');
  console.log('Updated productSpecScraper.ts successfully');
}

// 2. UPDATE productFinder.ts
let productFinderCode = fs.readFileSync(productFinderPath, 'utf8');
if (!productFinderCode.includes('b2bPricing?: B2BPricingDetails')) {
  const b2bFinderAddon = `import { B2BPricingDetails, synthesizeB2BPricing } from './productSpecScraper';
`;
  if (!productFinderCode.includes("from './productSpecScraper'")) {
    productFinderCode = b2bFinderAddon + productFinderCode;
  }

  productFinderCode = productFinderCode.replace(
    'export interface ProductSellerRecord {',
    'export interface ProductSellerRecord {\n  b2bPricing?: B2BPricingDetails;'
  );

  productFinderCode = productFinderCode.replace(
    /records\.push\({\s*id: `prod_\${Date\.now\(\)}_\${i}`,/g,
    `records.push({
        id: \`prod_\${Date.now()}_\${i}\`,
        b2bPricing: synthesizeB2BPricing(sellerName, productsLine, '₹89,990', effectiveQuery),`
  );

  fs.writeFileSync(productFinderPath, productFinderCode, 'utf8');
  console.log('Updated productFinder.ts successfully');
}

console.log('Scrapers updated with B2B Pricing!');
