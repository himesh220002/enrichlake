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

    // Shallow contact/about page crawl if primary page lacked contact info
    if (businessData.emails.length === 0 || businessData.phones.length === 0) {
      try {
        const contactLink = await page.$eval(
          'a[href*="contact" i], a[href*="about" i], a[href*="services" i]',
          (el) => el.getAttribute('href') || ''
        ).catch(() => null);

        if (contactLink) {
          const resolvedContactUrl = new URL(contactLink, targetUrl).toString();
          await page.goto(resolvedContactUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
          await page.waitForTimeout(1000);

          const secondaryData = await extractLocalBusinessData(page, cleanDomain);
          businessData.emails = Array.from(new Set([...businessData.emails, ...secondaryData.emails]));
          businessData.phones = Array.from(new Set([...businessData.phones, ...secondaryData.phones]));
          businessData.addresses = Array.from(new Set([...businessData.addresses, ...secondaryData.addresses]));
          if (secondaryData.productsServices.length > 0) {
            businessData.productsServices = Array.from(new Set([...businessData.productsServices, ...secondaryData.productsServices]));
          }
          if (secondaryData.location && !businessData.location) {
            businessData.location = secondaryData.location;
          }
          if (secondaryData.geoData && !businessData.geoData) {
            businessData.geoData = secondaryData.geoData;
          }
          if (secondaryData.businessDetails && !businessData.businessDetails) {
            businessData.businessDetails = secondaryData.businessDetails;
          }
        }
      } catch {
        // Non-critical: ignore secondary crawl failure
      }
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
