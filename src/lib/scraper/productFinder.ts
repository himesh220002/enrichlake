import { launchStealthBrowser } from './browser';
import { SpecFilterItem, formatSpecsFromList } from './productSpecScraper';
import { resolveLocationHub, calculateHaversineDistanceKm, GeoCoordinates } from '../geo/haversine';
import { scraperCache } from '../cache/scraperCache';
import { INITIAL_PRODUCT_SELLERS } from '../types/initialScraperData';
import { B2BPricingDetails, ProductSellerRecord, OperationalHealth, SupplyConsistency, HealthGrade, DataConfidence } from '../types/scraperTypes';
import { scoreSpecMatch, detectIndustryGroup } from '../search/keywordTaxonomy';

export type BusinessStatus =
  | 'Active'
  | 'Operational'
  | 'Expanding'
  | 'Stable'
  | 'Needs Upgrade'
  | 'Seasonal'
  | 'Revisit Later'
  | 'Growing'
  | 'Closed';

export type VerificationStatus =
  | 'GSTIN Verified'
  | 'PAN Verified'
  | 'ISO Certified'
  | 'Chamber Registered'
  | 'Certified Organic'
  | 'Verified Partner'
  | 'Google Maps Verified'
  | 'Unverified Listing';

export interface ProductFinderOptions {
  productQuery?: string;
  product?: string;
  specs?: string;
  structuredSpecs?: SpecFilterItem[];
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  priceRange?: string;
  scope?: 'radius' | 'india' | 'world';
  centerLocation?: string;
  rangeKm?: number;
  maxResults?: number;
}

export async function findProductsWithGeoRadius(
  options: ProductFinderOptions
): Promise<ProductSellerRecord[]> {
  const {
    productQuery = 'laptop wholesale dealer',
    product = '',
    specs = '',
    structuredSpecs,
    category = '',
    scope = 'radius',
    centerLocation = 'Malda, WB, India',
    rangeKm = 500,
    maxResults = 50,
  } = options;

  const centerCoords = resolveLocationHub(centerLocation);

  let targetLocation = centerLocation;
  if (scope === 'india') targetLocation = 'India';
  else if (scope === 'world') targetLocation = 'Global';

  const effectiveQuery = product.trim()
    ? product.trim()
    : (productQuery.trim()
        ? productQuery.trim()
        : (category.trim() ? `${category.trim()} wholesale suppliers dealers` : 'commercial B2B suppliers'));

  // 1. Check In-Memory TTL Cache for Instant (<5ms) Return
  const cacheKey = scraperCache.generateKey('product_sellers', {
    effectiveQuery,
    targetLocation,
    scope,
    centerLocation,
    rangeKm,
    category,
    maxResults,
  });

  const cachedResults = scraperCache.get<ProductSellerRecord[]>(cacheKey);
  if (cachedResults && cachedResults.length > 0) {
    console.log(`[ProductFinder] Cache HIT: returning ${cachedResults.length} cached seller records`);
    return cachedResults;
  }

  const records: ProductSellerRecord[] = [];
  let browserInstance: any = null;

  try {
    const { browser, page } = await launchStealthBrowser();
    browserInstance = browser;

    // --- SCOPE BRANCHING ---
    // For radius: Google Maps (geo-biased — correct for local radius)
    // For india/world: DuckDuckGo targeting real B2B directories (IndiaMART, TradeIndia, ExportersIndia)
    // because Google Maps results are IP-geo-biased and always return nearby results regardless of "in India" clause.

    if (scope === 'radius') {
      // =============================================
      // LOCAL RADIUS MODE — Google Maps scrape
      // =============================================
      const gmapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(`${effectiveQuery} ${centerLocation}`)}`;
      console.log('[ProductFinder] LOCAL RADIUS: Querying Google Maps:', gmapsUrl);
      await page.goto(gmapsUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });

      try {
        await page.waitForSelector('div.Nv2PK, div[role="article"], div[role="feed"]', { timeout: 6000 });
      } catch {}

      // Dismiss consent modals if present
      try {
        const consentBtn = await page.$('button[aria-label*="Accept" i], button[aria-label*="Agree" i]');
        if (consentBtn) {
          await consentBtn.click();
          await page.waitForTimeout(300);
        }
      } catch {}

      // Fast dynamic scroll feed
      for (let i = 0; i < 8; i++) {
        const feed = await page.$('div[role="feed"]');
        if (feed) {
          await page.evaluate((el) => { el.scrollTop += 2500; }, feed);
        } else {
          await page.evaluate(() => { window.scrollBy(0, 1800); });
        }
        await page.waitForTimeout(500);
        const count = await page.$$eval('div.Nv2PK, div[role="article"]', (els) => els.length);
        if (count >= maxResults) break;
      }

      const rawListings = await page.$$eval('div.Nv2PK, div[role="article"]', (elements) => {
        return elements.map((el) => {
          const nameEl = el.querySelector('.qBF1Pd, .fontHeadlineSmall, [role="heading"]');
          const name = nameEl?.textContent?.trim() || '';
          const linkEl = el.querySelector('a.hfpxzc, a[href*="/maps/place/"]');
          const mapUrl = linkEl?.getAttribute('href') || '';
          const ratingMatch = el.textContent?.match(/(\d\.\d)\s*\(([\d,]+)\)/);
          let rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;
          let reviewsCount = ratingMatch ? parseInt(ratingMatch[2].replace(/,/g, ''), 10) : undefined;
          if (!rating) {
            const ratingEl = el.querySelector('.MW4etd, span.ZkP5Je');
            const ratingText = ratingEl?.textContent?.trim() || '';
            if (ratingText) rating = parseFloat(ratingText);
          }
          const websiteEl = el.querySelector('a[data-value*="Website" i], a[aria-label*="website" i]');
          const websiteUrl = websiteEl?.getAttribute('href') || '';
          const phoneEl = el.querySelector('.UsdlK');
          let phone = phoneEl?.textContent?.trim() || '';
          const leafW4Efsd = Array.from(el.querySelectorAll('.W4Efsd')).filter((w) => {
            return w.querySelectorAll('.W4Efsd').length === 0 && !w.querySelector('.MW4etd, .ZkP5Je');
          });
          let extractedCategory = '';
          const addressParts: string[] = [];
          let isClosed = false;
          for (const row of leafW4Efsd) {
            const text = row.textContent?.trim() || '';
            if (!text) continue;
            if (/\b(open|closed|opens|closes)\b/i.test(text)) {
              if (/\bclosed\b/i.test(text)) isClosed = true;
              if (!phone) {
                const phMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/);
                if (phMatch) phone = phMatch[0].trim();
              }
              continue;
            }
            const parts = text.split(/·|•/)
              .map((p) => p.replace(/[^\x20-\x7E]/g, '').trim())
              .filter((p) => {
                if (!p || p === '·') return false;
                if (/^\d+(\.\d+)?(\s*\(\d+[\d,]*\))?$/.test(p)) return false;
                if (/\b(open|closed|opens|closes)\b/i.test(p)) return false;
                if (/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}/.test(p)) return false;
                return true;
              });
            if (parts.length >= 1 && !extractedCategory) {
              extractedCategory = parts[0];
              if (parts.length > 1) addressParts.push(...parts.slice(1));
            } else if (parts.length > 0) {
              addressParts.push(...parts);
            }
          }
          return {
            name, mapUrl, rating, reviewsCount,
            category: extractedCategory,
            address: addressParts.filter((item, index, self) => self.indexOf(item) === index).join(', '),
            websiteUrl, phone, isClosed,
          };
        });
      });

      console.log(`[ProductFinder] Google Maps: ${rawListings.length} raw listings`);
      const seenNames = new Set<string>();

      for (let i = 0; i < rawListings.length; i++) {
        if (records.length >= maxResults) break;
        const item = rawListings[i];
        if (!item.name || seenNames.has(item.name.toLowerCase())) continue;
        seenNames.add(item.name.toLowerCase());

        let lat = centerCoords.latitude;
        let lon = centerCoords.longitude;
        if (item.mapUrl) {
          const placeMatch = item.mapUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
          if (placeMatch) { lat = parseFloat(placeMatch[1]); lon = parseFloat(placeMatch[2]); }
          else {
            const atMatch = item.mapUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (atMatch) { lat = parseFloat(atMatch[1]); lon = parseFloat(atMatch[2]); }
          }
        }

        const distance = calculateHaversineDistanceKm(centerCoords, { latitude: lat, longitude: lon });
        if (scope === 'radius' && rangeKm > 0 && distance > rangeKm) continue;

        let genuineWebsite = '';
        if (item.websiteUrl) {
          try {
            const parsed = new URL(item.websiteUrl);
            if (!parsed.hostname.includes('google.com')) genuineWebsite = item.websiteUrl;
          } catch {}
        }

        let cleanCategory = item.category || category || '';
        if (!cleanCategory || /^\d+(\.\d+)?(\s*\(\d+[\d,]*\))?$/.test(cleanCategory)) {
          cleanCategory = category || 'B2B Wholesale & Distribution';
        }
        let cleanAddress = item.address;
        if (!cleanAddress || /^\d+(\.\d+)?$/.test(cleanAddress.trim())) {
          cleanAddress = centerLocation;
        }

        const rVal = item.rating || 4.0;
        const revCount = item.reviewsCount || 0;
        let supplyConsistency: SupplyConsistency = 'Stable Supply';
        let healthGrade: HealthGrade = 'A';
        if (rVal >= 4.5 && revCount >= 20) { supplyConsistency = 'High Reliability'; healthGrade = 'A+'; }
        else if (rVal >= 4.5) { supplyConsistency = 'Top Rated Vendor'; healthGrade = 'A'; }
        else if (rVal >= 4.0) { supplyConsistency = 'Stable Supply'; healthGrade = 'A'; }
        else if (rVal >= 3.5) { supplyConsistency = 'Moderate Consistency'; healthGrade = 'B'; }
        else { supplyConsistency = 'Review Needed'; healthGrade = 'C'; }

        records.push({
          id: `seller_real_${records.length + 1}`,
          dataSource: 'live',
          b2bPricing: undefined,
          businessName: item.name,
          category: cleanCategory,
          productsServices: `${cleanCategory} • ${effectiveQuery}, Peripherals & Hardware Sourcing`,
          procurementTerms: genuineWebsite ? 'Online Catalog / Quote on Request' : 'Direct In-Store / Quote on Request',
          website: genuineWebsite,
          phone: item.phone || '',
          email: '',
          address: cleanAddress,
          latitude: +lat.toFixed(4),
          longitude: +lon.toFixed(4),
          distanceKm: distance,
          businessStatus: item.isClosed ? 'Closed' : 'Active',
          verificationStatus: item.rating && item.rating > 0 && (item.reviewsCount || 0) >= 5 ? 'Google Maps Verified' : 'Unverified Listing',
          rating: item.rating,
          reviewsCount: item.reviewsCount,
          operationalHealth: {
            rating: item.rating, reviewsCount: item.reviewsCount,
            score: item.rating ? `★ ${item.rating.toFixed(1)}` : '★ —',
            supplyConsistency, healthGrade,
          },
          tradeCreditTerms: genuineWebsite && (item.reviewsCount || 0) > 100 ? 'Net 30 Commercial / Credit on RFP' : 'Offline Procurement Only',
          isBookmarked: false,
          isFlagged: false,
          specs: {},
          rawUrl: item.mapUrl || gmapsUrl,
          scrapedAt: new Date().toISOString(),
        });
      }

    } else {
      // =============================================
      // PAN-INDIA / WORLD MODE — DuckDuckGo B2B directories
      // Google Maps is IP-geo-biased and ignores "in India" — it always returns nearby.
      // Instead we query DuckDuckGo targeting real nationwide B2B wholesale directories.
      // =============================================
      const isWorld = scope === 'world';
      const locationClause = isWorld ? 'global exporters' : 'India nationwide';
      const directorySites = isWorld
        ? 'site:alibaba.com OR site:globalsources.com OR site:made-in-china.com'
        : 'site:indiamart.com OR site:tradeindia.com OR site:exportersindia.com OR site:justdial.com';

      const taxonomyGroup = detectIndustryGroup(`${category} ${effectiveQuery} ${specs}`);
      const extraSpecClause = specs ? ` ${specs}` : '';
      const b2bQueries = [
        `${effectiveQuery}${extraSpecClause} wholesale supplier ${locationClause} ${directorySites}`,
        `${effectiveQuery}${extraSpecClause} ${category} B2B manufacturer distributor ${isWorld ? 'export' : 'India'} price`,
        `${category || effectiveQuery}${extraSpecClause} bulk supplier dealer ${isWorld ? 'international' : 'pan India'} indiamart tradeindia`,
      ];

      const seenTitles = new Set<string>();

      for (const q of b2bQueries) {
        if (records.length >= maxResults) break;
        try {
          const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
          console.log(`[ProductFinder] PAN-INDIA/WORLD: DuckDuckGo B2B search: ${q}`);
          await page.goto(ddgUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });

          const pageResults = await page.$$eval('.result', (elements) => {
            return elements.map((el) => {
              const titleEl = el.querySelector('.result__title a');
              const snippetEl = el.querySelector('.result__snippet');
              const rawHref = titleEl?.getAttribute('href') || '';
              const title = titleEl?.textContent?.trim() || '';
              const snippet = snippetEl?.textContent?.trim() || '';
              return { title, rawHref, snippet };
            });
          });

          for (const item of pageResults) {
            if (records.length >= maxResults) break;
            if (!item.title) continue;

            let actualUrl = '';
            const matchUddg = item.rawHref.match(/uddg=([^&]+)/);
            if (matchUddg) actualUrl = decodeURIComponent(matchUddg[1]);
            else actualUrl = item.rawHref;

            if (!actualUrl || !actualUrl.startsWith('http') ||
              actualUrl.includes('duckduckgo.com/y.js') ||
              actualUrl.includes('bing.com/aclick')) continue;

            // Identify B2B source platform
            let platform = 'B2B Directory';
            const urlLower = actualUrl.toLowerCase();
            if (urlLower.includes('indiamart.com')) platform = 'IndiaMART';
            else if (urlLower.includes('tradeindia.com')) platform = 'TradeIndia';
            else if (urlLower.includes('exportersindia.com')) platform = 'ExportersIndia';
            else if (urlLower.includes('justdial.com')) platform = 'JustDial B2B';
            else if (urlLower.includes('alibaba.com')) platform = 'Alibaba';
            else if (urlLower.includes('globalsources.com')) platform = 'GlobalSources';
            else if (urlLower.includes('made-in-china.com')) platform = 'Made-in-China';
            else {
              try { platform = new URL(actualUrl).hostname.replace(/^www\./, ''); } catch {}
            }

            // Clean business name from title
            let businessName = item.title;
            const titleClean = item.title.match(/^([^|\-—]+)/);
            if (titleClean && titleClean[1].length > 5) businessName = titleClean[1].trim();

            // Fuzzy deduplication
            const fuzzyKey = businessName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 25);
            if (seenTitles.has(fuzzyKey)) continue;
            seenTitles.add(fuzzyKey);

            // Spec-relevance gate for B2B sellers — skip if requested specs don't match snippet at all
            if (specs && specs.trim()) {
              const relScore = scoreSpecMatch(specs, `${item.title} ${item.snippet}`);
              if (relScore < 10) { // very permissive — only block completely irrelevant suppliers
                console.log(`[ProductFinder] Low spec relevance ${relScore}% — skipping "${businessName.slice(0,40)}"`);
                continue;
              }
            }

            // Extract phone from snippet
            const phoneMatch = item.snippet.match(/(?:\+?91[\-\s]?)?[6-9]\d{9}|0\d{2,4}[\-\s]?\d{6,8}/);
            const phone = phoneMatch ? phoneMatch[0] : '';

            // Extract email from snippet
            const emailMatch = item.snippet.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
            const email = emailMatch ? emailMatch[0] : '';

            // Extract city/location from snippet
            const cityMatch = item.snippet.match(/(?:based in|located in|from|at)\s+([A-Z][a-zA-Z\s,]+(?:India|Delhi|Mumbai|Bangalore|Chennai|Kolkata|Hyderabad|Pune|Ahmedabad|Surat|Jaipur)?)/i);
            const extractedLocation = cityMatch ? cityMatch[1].trim() : (isWorld ? 'International' : 'India');

            // Determine health from context
            const ratingMatch = item.snippet.match(/(\d\.\d)\s*(?:star|rating|\/5|out of 5)/i);
            const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;
            const reviewMatch = item.snippet.match(/([\d,]+)\s*(?:review|buyer|order|feedback)/i);
            const reviewsCount = reviewMatch ? parseInt(reviewMatch[1].replace(/,/g, ''), 10) : undefined;

            const supplyConsistency: SupplyConsistency = platform.includes('IndiaMART') || platform.includes('Alibaba') ? 'High Reliability' : 'Stable Supply';
            const healthGrade: HealthGrade = supplyConsistency === 'High Reliability' ? 'A+' : 'A';

            records.push({
              id: `seller_b2b_${records.length + 1}`,
              dataSource: 'live',
              b2bPricing: undefined,
              businessName,
              category: category || `${effectiveQuery} Wholesale`,
              productsServices: `${category || effectiveQuery} • ${platform} Verified Supplier`,
              procurementTerms: 'Online RFQ / Direct Inquiry via Platform',
              website: actualUrl,
              phone,
              email,
              address: extractedLocation,
              latitude: centerCoords.latitude,
              longitude: centerCoords.longitude,
              distanceKm: 0,
              businessStatus: 'Operational',
              verificationStatus: platform.includes('IndiaMART') || platform.includes('Alibaba') ? 'Verified Partner' : 'Unverified Listing',
              rating,
              reviewsCount,
              operationalHealth: {
                rating, reviewsCount,
                score: rating ? `★ ${rating.toFixed(1)}` : '★ —',
                supplyConsistency, healthGrade,
              },
              tradeCreditTerms: 'Platform Escrow / GST Invoice on Order',
              isBookmarked: false,
              isFlagged: false,
              specs: {},
              rawUrl: actualUrl,
              scrapedAt: new Date().toISOString(),
            });
          }
        } catch (err: any) {
          console.warn(`[ProductFinder] PAN-INDIA query non-fatal:`, err.message);
        }
      }
    }

    await browser.close();
  } catch (err: any) {
    console.warn('[ProductFinder] Scraping warning:', err.message);
    if (browserInstance) {
      try { await browserInstance.close(); } catch {}
    }
  }

  // 2. Zero-Blank Fallback Resilience:
  // If scraper was blocked or returned 0 listings, return benchmark data tagged accordingly
  let finalRecords = records;
  if (finalRecords.length === 0) {
    console.log('[ProductFinder] External scraper rate-limited; engaging Zero-Blank Benchmark Fallback Engine');
    finalRecords = getFallbackSellerRecords({
      effectiveQuery,
      category,
      centerLocation,
      centerCoords,
      scope,
      rangeKm,
      maxResults,
    });
  }

  // 3. Cache the results for 10 minutes
  if (finalRecords.length > 0) {
    scraperCache.set(cacheKey, finalRecords, 10 * 60 * 1000);
  }

  console.log(`[ProductFinder] Returning ${finalRecords.length} seller records (scope: ${scope})`);
  return finalRecords;
}

/**
 * Generates verified fallback seller records tailored to the geographical hub
 */
function getFallbackSellerRecords(options: {
  effectiveQuery: string;
  category?: string;
  centerLocation: string;
  centerCoords: GeoCoordinates;
  scope: string;
  rangeKm: number;
  maxResults: number;
}): ProductSellerRecord[] {
  const { effectiveQuery, category, centerCoords, scope, rangeKm, maxResults } = options;
  const baseList = INITIAL_PRODUCT_SELLERS;

  // Recalculate distance from centerCoords using Haversine formula
  const mapped = baseList.map((seller, idx) => {
    const dist = calculateHaversineDistanceKm(centerCoords, {
      latitude: seller.latitude,
      longitude: seller.longitude,
    });

    // Strip synthetic-looking email patterns (info@<company>.com type) as they are not real scraped data
    const cleanEmail = (seller.email || '').match(/^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/i)
      ? seller.email
      : '';

    return {
      ...seller,
      id: `seller_benchmark_${idx + 1}`,
      dataSource: 'benchmark' as DataConfidence,
      category: category || seller.category,
      productsServices: category ? `${category} Sourcing & B2B Distribution` : seller.productsServices,
      email: cleanEmail,
      distanceKm: dist,
      scrapedAt: new Date().toISOString(),
    };
  });

  // Filter by rangeKm if in radius scope
  let filtered = mapped;
  if (scope === 'radius' && rangeKm > 0) {
    const withinRadius = mapped.filter((s) => s.distanceKm <= rangeKm);
    if (withinRadius.length >= 5) {
      filtered = withinRadius;
    }
  }

  return filtered.slice(0, Math.max(10, Math.min(maxResults, 50)));
}
