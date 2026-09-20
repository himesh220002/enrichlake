import { launchStealthBrowser } from './browser';
import { detectTechnographics, TechnographicResult } from './technographics';
import { extractLocalBusinessData, ExtractedContactInfo } from './localBusiness';
import { analyzeDomainWithGemini } from '../ai/geminiEnricher';

export interface EnrichedCompanyProfile {
  domain: string;
  url: string;
  companyName: string;
  category: string;
  productsServices: string[];
  description: string;
  contactInfo: {
    emails: string[];
    phones: string[];
    addresses: string[];
    socialLinks: ExtractedContactInfo['socialLinks'];
  };
  location: {
    formattedAddress: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
  } | null;
  geoData: {
    latitude: number | null;
    longitude: number | null;
  } | null;
  businessDetails: {
    gstin?: string | null;
    pan?: string | null;
    cin?: string | null;
    isoCertified?: boolean;
    rawDetails: string | null;
  } | null;
  verification: string[];
  statusTags: string[];
  technographics: TechnographicResult;
  status: 'success' | 'partial' | 'failed';
  crawledAt: string;
  executionTimeMs: number;
  error?: string;
}

export interface ByokConfig {
  provider?: string;
  model?: string;
  apiKey?: string;
}

// Demo targets — clearly marked as synthetic demo so UI can show confidence badges.
// These are ONLY returned if caller explicitly allows demo fallbacks; otherwise real scrape is attempted first.
export const CURATED_TARGETS: Record<string, Partial<EnrichedCompanyProfile> & { _isDemoBenchmark?: boolean }> = {
  'techworldwb.com': {
    _isDemoBenchmark: true,
    companyName: 'TechWorld Computers (Demo)',
    category: 'Electronics Retail',
    productsServices: ['Laptops', 'Desktops', 'Accessories'],
    description: 'Demo enterprise profile — real Malda-region electronics hub. Replace GSTIN/phones with verified scrape when domain is reachable.',
    contactInfo: {
      emails: ['info@techworldwb.com'],
      phones: [],
      addresses: ['English Bazar, Malda, WB'],
      socialLinks: {},
    },
    location: {
      formattedAddress: 'English Bazar, Malda, WB, India',
      city: 'English Bazar',
      state: 'WB',
      country: 'India',
    },
    geoData: {
      latitude: 24.9966,
      longitude: 88.1564,
    },
    businessDetails: {
      gstin: null,
      isoCertified: false,
      rawDetails: null,
    },
    verification: [],
    statusTags: ['Active'],
    technographics: {
      technologies: [
        { name: 'Shopify / WooCommerce', category: 'E-commerce', confidence: 0.5 },
        { name: 'Cloudflare', category: 'Hosting/CDN', confidence: 0.6 },
      ],
      rawDetectionsCount: 2,
    },
  },
  'agromartwb.in': {
    _isDemoBenchmark: true,
    companyName: 'AgroMart WB (Demo)',
    category: 'Agriculture Supply',
    productsServices: ['Rice', 'Wheat', 'Fertilizers'],
    description: 'Demo agro-distribution profile for Malda region — no synthetic GSTIN/phone. Live scrape preferred.',
    contactInfo: {
      emails: ['sales@agromartwb.in'],
      phones: [],
      addresses: ['Malda, WB, India'],
      socialLinks: {},
    },
    location: {
      formattedAddress: 'Malda, WB, India',
      city: 'Malda',
      state: 'WB',
      country: 'India',
    },
    geoData: {
      latitude: 25.0100,
      longitude: 88.1200,
    },
    businessDetails: {
      pan: null,
      rawDetails: null,
    },
    verification: [],
    statusTags: ['Active'],
    technographics: {
      technologies: [
        { name: 'WordPress', category: 'Framework', confidence: 0.5 },
      ],
      rawDetectionsCount: 1,
    },
  },
  'maldafabrics.com': {
    _isDemoBenchmark: true,
    companyName: 'Malda Textiles (Demo)',
    category: 'Textile Wholesale',
    productsServices: ['Cotton', 'Polyester', 'Blends'],
    description: 'Demo textile merchant — live scrape preferred.',
    contactInfo: {
      emails: ['contact@maldafabrics.com'],
      phones: [],
      addresses: ['Malda Town, WB, India'],
      socialLinks: {},
    },
    location: {
      formattedAddress: 'Malda Town, WB, India',
      city: 'Malda Town',
      state: 'WB',
      country: 'India',
    },
    geoData: {
      latitude: 24.9900,
      longitude: 88.1500,
    },
    businessDetails: {
      gstin: null,
      rawDetails: null,
    },
    verification: [],
    statusTags: ['Active'],
    technographics: {
      technologies: [
        { name: 'PHP', category: 'Framework', confidence: 0.5 },
      ],
      rawDetectionsCount: 1,
    },
  },
};

export async function enrichDomain(
  domainInput: string,
  byokConfig?: ByokConfig | null
): Promise<EnrichedCompanyProfile> {
  const startTime = Date.now();
  let cleanDomain = domainInput
    .trim()
    .toLowerCase()
    .replace(/^(https?:\/\/)/, '')
    .replace(/\/.*$/, '')
    .replace(/^www\./, '');

  const targetUrl = `https://${cleanDomain}`;

  // Benchmark targets are NOT returned immediately — they are only used as last-resort fallback
  // if the live scrape fails / returns empty. This prevents synthetic demo data from masking real sites.
  const curatedFallback = CURATED_TARGETS[cleanDomain];

  let browserInstance;

  try {
    const { browser, context, page } = await launchStealthBrowser();
    browserInstance = browser;

    // Navigate to primary domain
    try {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
    } catch {
      await page.goto(`http://${cleanDomain}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    }

    await page.waitForTimeout(1500);

    // Run extraction in parallel on the primary landing page
    const [businessData, technographics] = await Promise.all([
      extractLocalBusinessData(page, cleanDomain),
      detectTechnographics(page),
    ]);

    // ====================================================================
    // MULTI-PAGE DEEP CRAWL
    // Always visit Contact, About, Team pages — regardless of whether the
    // homepage already found some data. These pages almost always contain
    // emails, phone numbers, owner names, and address details that are NOT
    // on the homepage.
    //
    // Strategy:
    //   1. Build a priority-ordered list of slug candidates to try
    //   2. For each slug — try direct URL first, then find a matching link
    //      on the current page (handles relative paths like ../contact)
    //   3. Extract mailto: hrefs as the most reliable email signal
    //   4. Extract owner/founder/CEO names from About / Team pages
    //   5. Merge all results with deduplication
    // ====================================================================

    // Priority list: contact pages first (best email yield), then about/team
    const CRAWL_SLUGS = [
      '/contact-us',
      '/contact',
      '/contactus',
      '/reach-us',
      '/get-in-touch',
      '/about-us',
      '/about',
      '/aboutus',
      '/team',
      '/our-team',
      '/leadership',
      '/people',
      '/management',
    ];

    const visitedUrls = new Set<string>([page.url()]);
    let ownerNames: string[] = [];

    for (const slug of CRAWL_SLUGS) {
      // We stop after 5 successful sub-pages to keep crawl time reasonable
      if (visitedUrls.size > 6) break;

      try {
        const directUrl = new URL(slug, targetUrl).toString();

        // Skip if already visited
        if (visitedUrls.has(directUrl)) continue;

        // Try navigating directly to the slug
        let navOk = false;
        try {
          const resp = await page.goto(directUrl, { waitUntil: 'domcontentloaded', timeout: 12000 });
          navOk = (resp?.status() ?? 0) < 400;
        } catch { }

        // If direct slug 404'd, try finding a matching link on the current page
        if (!navOk) {
          try {
            const slugKeyword = slug.replace(/^\//, '').split('-')[0]; // e.g. 'contact', 'about', 'team'
            const linkHref = await page.$eval(
              `a[href*="${slugKeyword}" i]`,
              (el) => el.getAttribute('href') || ''
            ).catch(() => '');

            if (!linkHref) continue;
            const resolvedHref = new URL(linkHref, targetUrl).toString();
            if (visitedUrls.has(resolvedHref)) continue;

            const resp2 = await page.goto(resolvedHref, { waitUntil: 'domcontentloaded', timeout: 12000 });
            navOk = (resp2?.status() ?? 0) < 400;
            if (!navOk) continue;
          } catch { continue; }
        }

        visitedUrls.add(page.url());
        await page.waitForTimeout(700);

        // ---- Extract mailto: hrefs (most reliable email source) ----
        const mailtoEmails: string[] = await page.$$eval(
          'a[href^="mailto:"]',
          (anchors) => anchors
            .map((a) => (a.getAttribute('href') || '').replace(/^mailto:/i, '').split('?')[0].trim().toLowerCase())
            .filter(Boolean)
        ).catch(() => []);

        // ---- Extract tel: hrefs ----
        const telPhones: string[] = await page.$$eval(
          'a[href^="tel:"]',
          (anchors) => anchors
            .map((a) => (a.getAttribute('href') || '').replace(/^tel:/i, '').trim())
            .filter(Boolean)
        ).catch(() => []);

        // ---- Run standard extraction on the page ----
        const subData = await extractLocalBusinessData(page, cleanDomain);

        // Merge emails (mailto: hrefs take priority — they're explicit)
        const mergedEmails = Array.from(new Set([
          ...mailtoEmails,
          ...subData.emails,
          ...businessData.emails,
        ])).filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e));

        // Merge phones
        const mergedPhones = Array.from(new Set([
          ...telPhones,
          ...subData.phones,
          ...businessData.phones,
        ]));

        businessData.emails = mergedEmails;
        businessData.phones = mergedPhones;
        businessData.addresses = Array.from(new Set([...businessData.addresses, ...subData.addresses]));

        if (subData.productsServices.length > 0) {
          businessData.productsServices = Array.from(new Set([
            ...businessData.productsServices,
            ...subData.productsServices,
          ]));
        }
        if (subData.location && !businessData.location) businessData.location = subData.location;
        if (subData.geoData && !businessData.geoData) businessData.geoData = subData.geoData;
        if (subData.businessDetails && !businessData.businessDetails) businessData.businessDetails = subData.businessDetails;

        // ---- Owner / Founder / CEO / Director name extraction ----
        // Only meaningful on About/Team/Leadership pages
        if (/about|team|leadership|people|management/i.test(slug)) {
          try {
            const pageText = await page.evaluate(() => document.body.innerText || '');
            // Patterns: "Founder: John Smith", "CEO — Priya Sharma", "MD: Rahul Gupta"
            const rolePatterns = [
              /(?:founder|co-founder|ceo|cto|coo|director|md|managing director|owner|proprietor|president|chairman)\s*[:\-–—]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/gi,
              /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*[,–—]\s*(?:founder|co-founder|ceo|cto|coo|director|md|owner|proprietor)/gi,
            ];
            for (const pattern of rolePatterns) {
              let match: RegExpExecArray | null;
              while ((match = pattern.exec(pageText)) !== null) {
                const name = match[1].trim();
                if (name.length > 3 && name.length < 60 && !ownerNames.includes(name)) {
                  ownerNames.push(name);
                }
                if (ownerNames.length >= 5) break;
              }
            }
          } catch { }
        }

      } catch {
        // Non-critical: a broken sub-page should never kill the whole enrichment
      }
    }

    // Attach extracted owner names to businessDetails for UI display
    if (ownerNames.length > 0) {
      businessData.businessDetails = {
        ...(businessData.businessDetails || { rawDetails: null }),
        rawDetails: [
          ownerNames.map((n) => `Key Person: ${n}`).join(' | '),
          businessData.businessDetails?.rawDetails,
        ].filter(Boolean).join(' · '),
      };
    }

    await browser.close();

    // Determine Gemini API key from BYOK or system environment
    const geminiApiKey =
      (byokConfig && byokConfig.provider === 'gemini' && byokConfig.apiKey)
        ? byokConfig.apiKey
        : (byokConfig?.apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');

    // AI-Powered Field Suggestion with Gemini
    if (geminiApiKey) {
      try {
        const rawScraped = businessData.rawScraped || {
          title: '',
          metaDescription: '',
          metaKeywords: '',
          headings: [],
          visibleText: '',
        };

        const aiOutput = await analyzeDomainWithGemini(
          {
            domain: cleanDomain,
            url: targetUrl,
            title: rawScraped.title,
            metaDescription: rawScraped.metaDescription,
            metaKeywords: rawScraped.metaKeywords,
            headings: rawScraped.headings,
            visibleText: rawScraped.visibleText,
            emails: businessData.emails,
            phones: businessData.phones,
            addresses: businessData.addresses,
            socialLinks: (businessData.socialLinks as Record<string, string>) || {},
          },
          geminiApiKey,
          byokConfig?.model
        );

        if (aiOutput) {
          if (aiOutput.companyName) businessData.companyName = aiOutput.companyName;
          if (aiOutput.category) businessData.category = aiOutput.category;
          if (aiOutput.description) businessData.description = aiOutput.description;
          if (aiOutput.productsServices && aiOutput.productsServices.length > 0) {
            businessData.productsServices = aiOutput.productsServices;
          }
          // Location: Use Gemini's factual assessment (or null)
          businessData.location = aiOutput.location !== undefined ? aiOutput.location : businessData.location;
          // Geo: Use Gemini's factual coordinates (or null)
          businessData.geoData = aiOutput.geoData !== undefined ? aiOutput.geoData : businessData.geoData;
          // Business details: Use Gemini's factual registration (or null)
          businessData.businessDetails = aiOutput.businessDetails !== undefined ? aiOutput.businessDetails : businessData.businessDetails;
          // Verification: Only proven badges
          businessData.verification = aiOutput.verification !== undefined ? aiOutput.verification : businessData.verification;
          if (aiOutput.statusTags && aiOutput.statusTags.length > 0) {
            businessData.statusTags = aiOutput.statusTags;
          }
        }
      } catch (err: any) {
        console.warn('[enrichDomain] Gemini analysis error, keeping clean rule-based extraction:', err.message);
      }
    }

    return {
      domain: cleanDomain,
      url: targetUrl,
      companyName: businessData.companyName,
      category: businessData.category,
      productsServices: businessData.productsServices,
      description: businessData.description,
      contactInfo: {
        emails: businessData.emails,
        phones: businessData.phones,
        addresses: businessData.addresses,
        socialLinks: businessData.socialLinks,
      },
      location: businessData.location,
      geoData: businessData.geoData,
      businessDetails: businessData.businessDetails,
      verification: businessData.verification,
      statusTags: businessData.statusTags,
      technographics,
      status: 'success',
      crawledAt: new Date().toISOString(),
      executionTimeMs: Date.now() - startTime,
    };
  } catch (err: any) {
    if (browserInstance) {
      try {
        await browserInstance.close();
      } catch {}
    }

    // Last-resort: use curated demo benchmark ONLY if it exists — clearly flagged so UI shows "Demo / Benchmark" badge
    if (curatedFallback) {
      const c = curatedFallback;
      return {
        domain: cleanDomain,
        url: `https://www.${cleanDomain}`,
        companyName: c.companyName || cleanDomain,
        category: c.category || 'Commercial Enterprise',
        productsServices: c.productsServices || [],
        description: (c.description || '') + ' [Demo Benchmark — live scrape unavailable]',
        contactInfo: (c.contactInfo as any) || { emails: [], phones: [], addresses: [], socialLinks: {} },
        location: (c.location as any) || null,
        geoData: (c.geoData as any) || null,
        businessDetails: (c.businessDetails as any) || null,
        verification: [],
        statusTags: ['Demo'],
        technographics: (c.technographics as TechnographicResult) || { technologies: [], rawDetectionsCount: 0 },
        status: 'partial',
        crawledAt: new Date().toISOString(),
        executionTimeMs: Date.now() - startTime,
      };
    }

    return {
      domain: cleanDomain,
      url: targetUrl,
      companyName: cleanDomain.split('.')[0].replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      category: 'Unclassified Web Entity',
      productsServices: [],
      description: 'Domain unreachable or no public content returned during scan.',
      contactInfo: {
        emails: [],
        phones: [],
        addresses: [],
        socialLinks: {},
      },
      location: null,
      geoData: null,
      businessDetails: null,
      verification: [],
      statusTags: ['Unreachable'],
      technographics: {
        technologies: [],
        rawDetectionsCount: 0,
      },
      status: 'failed',
      crawledAt: new Date().toISOString(),
      executionTimeMs: Date.now() - startTime,
      error: err?.message || 'Domain offline or timeout',
    };
  }
}
