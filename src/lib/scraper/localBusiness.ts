import { Page } from 'playwright';

export interface ExtractedContactInfo {
  domain: string;
  companyName: string;
  category: string;
  productsServices: string[];
  description: string;
  emails: string[];
  phones: string[];
  addresses: string[];
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
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  schemaOrgData: any[];
  // Raw scraped signals for AI synthesis
  rawScraped?: {
    title: string;
    metaDescription: string;
    metaKeywords: string;
    headings: string[];
    visibleText: string;
  };
}

// Strict email regex with boundary and standard TLD length (2-6 chars)
const STRICT_EMAIL_REGEX = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(?:com|org|net|io|co|ai|app|tech|dev|biz|info|us|uk|de|ca|eu|in|gov|edu|me|so|agency|design|global|online)\b/gi;

const COMMON_TLDS = new Set([
  'com', 'org', 'net', 'io', 'co', 'ai', 'app', 'tech', 'dev', 'biz', 'info',
  'us', 'uk', 'de', 'ca', 'eu', 'in', 'gov', 'edu', 'me', 'so', 'agency', 'design', 'global', 'online'
]);

const IGNORED_EMAIL_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.pdf',
  '.css', '.js', '.woff', '.woff2', '.ttf'
];

function isValidPhoneNumber(candidate: string): boolean {
  if (!candidate) return false;
  const cleaned = candidate.trim();

  if (/\d+\.\d{2,}/.test(cleaned) || cleaned.includes('.0') || cleaned.includes('0.')) {
    return false;
  }

  const digits = cleaned.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) {
    return false;
  }

  if (/^(.)\1+$/.test(digits)) {
    return false;
  }

  if ('0123456789012345'.includes(digits) || '987654321098765'.includes(digits)) {
    return false;
  }

  return true;
}

function formatPhoneNumber(raw: string): string {
  let cleaned = raw.replace(/[^\d+]/g, '').trim();
  if (cleaned.length === 10 && !cleaned.startsWith('+')) {
    return `+91-${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+91-${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  if (cleaned.startsWith('+91') && cleaned.length === 13) {
    return `+91-${cleaned.slice(3, 8)} ${cleaned.slice(8)}`;
  }
  return raw.trim();
}

function cleanEmail(rawEmail: string): string {
  let email = rawEmail.toLowerCase().trim();
  if (email.startsWith('email') && email.length > 8) {
    email = email.slice(5);
  } else if (email.startsWith('contact') && email.length > 10) {
    email = email.slice(7);
  }
  return email;
}

export async function extractLocalBusinessData(page: Page, targetDomain: string): Promise<ExtractedContactInfo> {
  // 1. Company Name, Meta Description & Meta Keywords
  const title = await page.title().catch(() => '');
  const metaDescription = await page
    .$eval('meta[name="description"]', (el) => el.getAttribute('content') || '')
    .catch(() => '');

  const metaKeywords = await page
    .$eval('meta[name="keywords"]', (el) => el.getAttribute('content') || '')
    .catch(() => '');

  const ogSiteName = await page
    .$eval('meta[property="og:site_name"]', (el) => el.getAttribute('content') || '')
    .catch(() => '');

  const companyName = ogSiteName || title.split(/[-|–:·•]/)[0]?.trim() || targetDomain;

  // 2. Visible text and headings
  const { visibleText, headings } = await page.evaluate(() => {
    const hEls = Array.from(document.querySelectorAll('h1, h2, h3'));
    const hTexts = hEls
      .map((el) => (el.textContent || '').trim())
      .filter((t) => t.length > 2 && t.length < 80);

    return {
      visibleText: document.body ? (document.body.innerText || document.body.textContent || '') : '',
      headings: hTexts,
    };
  }).catch(() => ({ visibleText: '', headings: [] }));

  // 3. Emails extraction
  const mailtoHrefs = await page.$$eval('a[href^="mailto:"]', (els) =>
    els.map((el) => el.getAttribute('href')?.replace(/^mailto:/i, '').split('?')[0].toLowerCase().trim() || '')
  ).catch(() => [] as string[]);

  const emailRegex = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(?:com|org|net|io|co|ai|app|tech|dev|biz|info|us|uk|de|ca|eu|in|gov|edu|me|so|agency|design|global|online)\b/gi;
  const textEmails = Array.from(visibleText.matchAll(emailRegex)).map((m) => m[0].toLowerCase());

  const allEmails = Array.from(new Set([...mailtoHrefs, ...textEmails]))
    .map(cleanEmail)
    .filter((email) => {
      const parts = email.split('@');
      if (parts.length !== 2) return false;
      const domainPart = parts[1];
      const tld = domainPart.split('.').pop() || '';

      return (
        email.length > 5 &&
        COMMON_TLDS.has(tld) &&
        !IGNORED_EMAIL_EXTENSIONS.some((ext) => email.endsWith(ext)) &&
        !email.includes('example.com') &&
        !email.includes('sentry.io') &&
        !email.includes('wixpress.com') &&
        !email.includes('webpack') &&
        !email.includes('domain.com') &&
        !email.includes('user@') &&
        !email.includes('email@')
      );
    });

  // 4. Schema.org data
  const schemaOrgData = await page.$$eval('script[type="application/ld+json"]', (els) => {
    const results: any[] = [];
    for (const el of els) {
      try {
        const json = JSON.parse(el.textContent || '{}');
        results.push(json);
      } catch {}
    }
    return results;
  }).catch(() => [] as any[]);

  const schemaPhones: string[] = [];
  const addresses: string[] = [];
  let schemaLat: number | null = null;
  let schemaLng: number | null = null;
  const schemaProducts: string[] = [];

  for (const schema of schemaOrgData) {
    const items = Array.isArray(schema) ? schema : (schema['@graph'] ? schema['@graph'] : [schema]);
    for (const item of items) {
      if (!item) continue;

      if (item.telephone && typeof item.telephone === 'string') {
        schemaPhones.push(item.telephone);
      }
      if (item.contactPoint) {
        const points = Array.isArray(item.contactPoint) ? item.contactPoint : [item.contactPoint];
        for (const pt of points) {
          if (pt?.telephone && typeof pt.telephone === 'string') {
            schemaPhones.push(pt.telephone);
          }
        }
      }

      if (item.address) {
        if (typeof item.address === 'string') {
          addresses.push(item.address);
        } else if (typeof item.address === 'object') {
          const street = item.address.streetAddress || '';
          const locality = item.address.addressLocality || '';
          const region = item.address.addressRegion || '';
          const postal = item.address.postalCode || '';
          const country = item.address.addressCountry || '';
          const formatted = [street, locality, region, postal, country].filter(Boolean).join(', ');
          if (formatted) addresses.push(formatted);
        }
      }

      if (item.geo) {
        const gLat = parseFloat(item.geo.latitude);
        const gLng = parseFloat(item.geo.longitude);
        if (!isNaN(gLat) && !isNaN(gLng)) {
          schemaLat = gLat;
          schemaLng = gLng;
        }
      }

      if (item['@type'] === 'Product' && item.name) schemaProducts.push(item.name);
      if (item['@type'] === 'Service' && item.name) schemaProducts.push(item.name);
    }
  }

  // 5. Meta tags for telephone & geo
  const metaPhones = await page.evaluate(() => {
    const metas = document.querySelectorAll(
      'meta[property="business:contact_data:phone_number"], meta[name="telephone"], meta[property="og:phone_number"]'
    );
    return Array.from(metas).map((m) => m.getAttribute('content') || '');
  }).catch(() => [] as string[]);

  const metaGeo = await page.evaluate(() => {
    const geoPos = document.querySelector('meta[name="geo.position"]')?.getAttribute('content');
    const icbm = document.querySelector('meta[name="ICBM"]')?.getAttribute('content');
    return geoPos || icbm || null;
  }).catch(() => null);

  if (schemaLat === null && metaGeo) {
    const parts = metaGeo.split(/[;,]/);
    if (parts.length >= 2) {
      const pLat = parseFloat(parts[0].trim());
      const pLng = parseFloat(parts[1].trim());
      if (!isNaN(pLat) && !isNaN(pLng)) {
        schemaLat = pLat;
        schemaLng = pLng;
      }
    }
  }

  // 6. Explicit `tel:` links
  const telHrefs = await page.$$eval('a[href^="tel:"]', (els) =>
    els.map((el) => el.getAttribute('href')?.replace(/^tel:/i, '').split('?')[0].trim() || '')
  ).catch(() => [] as string[]);

  // 7. Footer / Contact Text & Full Page Phone Regex
  const targetedPhoneText = visibleText;

  const STRICT_PHONE_PATTERNS = [
    /(?:\+91[-.\s]?)?[6-9]\d{9}\b/g,
    /\+\d{1,3}[-.\s]\d{3,12}\b/g,
    /\+?[1-9]\d{0,2}[ -.]\(?\d{2,4}\)?[ -.]\d{3,4}[ -.]\d{3,4}/g,
    /(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s][2-9]\d{2}[-.\s]\d{4}/g,
    /(?:tel|phone|call|toll[- ]free|mobile|direct|hotline|comms)[:\s]+([\+\d\(\)\s\.\-]{8,20})/gi,
  ];

  const matchedRawPhones: string[] = [];
  for (const regex of STRICT_PHONE_PATTERNS) {
    const matches = Array.from(targetedPhoneText.matchAll(regex));
    for (const m of matches) {
      const candidate = m[1] || m[0];
      if (isValidPhoneNumber(candidate)) {
        matchedRawPhones.push(candidate);
      }
    }
  }

  const combinedPhones = [...telHrefs, ...schemaPhones, ...metaPhones, ...matchedRawPhones];
  const validPhones = Array.from(new Set(
    combinedPhones
      .filter(isValidPhoneNumber)
      .map(formatPhoneNumber)
  ));

  // 8. Social links
  const links = await page.$$eval('a[href]', (els) => els.map((el) => el.getAttribute('href') || '')).catch(() => [] as string[]);
  const socialLinks: ExtractedContactInfo['socialLinks'] = {};

  for (const link of links) {
    if (link.includes('linkedin.com/company/') || link.includes('linkedin.com/in/')) {
      if (!socialLinks.linkedin) socialLinks.linkedin = link;
    } else if ((link.includes('twitter.com/') || link.includes('x.com/')) && !link.includes('share?url=')) {
      if (!socialLinks.twitter) socialLinks.twitter = link;
    } else if (link.includes('github.com/') && !link.includes('/features') && !link.includes('/pricing')) {
      if (!socialLinks.github) socialLinks.github = link;
    } else if (link.includes('facebook.com/') && !link.includes('sharer.php')) {
      if (!socialLinks.facebook) socialLinks.facebook = link;
    } else if (link.includes('instagram.com/')) {
      if (!socialLinks.instagram) socialLinks.instagram = link;
    } else if (link.includes('youtube.com/') && !link.includes('/watch?')) {
      if (!socialLinks.youtube) socialLinks.youtube = link;
    }
  }

  // 9. Products / Services from DOM & Meta
  const keywordItems = metaKeywords
    .split(',')
    .map((k) => k.trim())
    .filter((k) => k.length > 2 && k.length < 35 && k.toLowerCase() !== targetDomain.toLowerCase());

  const domOfferings = await page.evaluate(() => {
    const results: string[] = [];
    const els = document.querySelectorAll('nav a, header a, [class*="service" i] h3, [class*="product" i] h3');
    const stopWords = new Set(['home', 'about', 'contact', 'login', 'signup', 'terms', 'privacy', 'blog', 'careers']);
    els.forEach((el) => {
      const txt = (el.textContent || '').trim();
      if (txt.length > 3 && txt.length < 35 && !stopWords.has(txt.toLowerCase())) {
        results.push(txt);
      }
    });
    return results;
  }).catch(() => [] as string[]);

  const productsServices = Array.from(new Set([...keywordItems, ...schemaProducts, ...domOfferings])).slice(0, 6);

  // 10. Accurate Category Classification
  const fullText = (title + ' ' + metaDescription + ' ' + metaKeywords + ' ' + visibleText.slice(0, 5000)).toLowerCase();
  let category = 'Commercial Enterprise';

  if (/\b(agency|digital agency|software|web development|engineering|ui\/ux|design studio|cloud services|saas|developer tools|it solutions)\b/i.test(fullText)) {
    category = 'Digital Agency & Software Engineering';
  } else if (/\b(laptops?|desktops?|computers?|electronics? store|hardware store|gadgets)\b/i.test(fullText)) {
    category = 'Electronics Retail';
  } else if (/\b(agriculture|fertilizers?|farming|pesticides?|agrochemicals?|grain merchant|rice mill|wheat wholesale)\b/i.test(fullText)) {
    category = 'Agriculture Supply';
  } else if (/\b(textiles?|fabrics?|cotton rolls?|polyester|yarns?|weaving|garment wholesale)\b/i.test(fullText)) {
    category = 'Textile Wholesale';
  } else if (/\b(construction|cement supply|tmt steel|building materials|iron & steel)\b/i.test(fullText)) {
    category = 'Construction & Building Supply';
  } else if (/\b(pharmaceuticals?|medicines?|healthcare|medical store|diagnostics)\b/i.test(fullText)) {
    category = 'Healthcare & Pharmaceuticals';
  } else if (/\b(logistics|freight forwarding|cargo shipping|warehousing services)\b/i.test(fullText)) {
    category = 'Logistics & Supply Chain';
  } else if (/\b(payment gateway|fintech|banking api|financial infrastructure)\b/i.test(fullText)) {
    category = 'Financial Technology & Payments';
  }

  // 11. Location & Address — STRICT: NO FAKE MALDA OR FAKE ADDRESS
  let formattedAddress: string | null = addresses[0] || null;
  let city: string | null = null;
  let state: string | null = null;
  let country: string | null = null;

  if (!formattedAddress) {
    // Check if footer explicitly says "Remote Worldwide" or similar
    if (/\b(remote worldwide|fully remote|remote-first)\b/i.test(fullText)) {
      formattedAddress = 'Remote Worldwide';
    }
  }

  const location = formattedAddress
    ? { formattedAddress, city, state, country }
    : null;

  // 12. Geo Data — STRICT: NO FAKE COORDINATES
  const geoData = schemaLat !== null && schemaLng !== null
    ? { latitude: schemaLat, longitude: schemaLng }
    : null;

  // 13. Business Details — STRICT: NO FAKE "Registered Commercial Enterprise" OR FAKE GSTIN
  const GSTIN_REGEX = /\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b/g;
  const PAN_REGEX = /\b[A-Z]{5}\d{4}[A-Z]{1}\b/g;
  const CIN_REGEX = /\b[UL]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}\b/g;

  const gstinMatches = Array.from(visibleText.matchAll(GSTIN_REGEX)).map((m) => m[0]);
  const panMatches = Array.from(visibleText.matchAll(PAN_REGEX)).map((m) => m[0]);
  const cinMatches = Array.from(visibleText.matchAll(CIN_REGEX)).map((m) => m[0]);
  const hasIso = /ISO\s*(?:9001|14001|27001|22000|45001)|ISO\s*Certified/i.test(visibleText);

  const gstin = gstinMatches[0] || null;
  const pan = panMatches[0] || null;
  const cin = cinMatches[0] || null;

  const detailsParts: string[] = [];
  if (gstin) detailsParts.push(`GSTIN: ${gstin}`);
  if (pan && !gstin) detailsParts.push(`PAN: ${pan}`);
  if (hasIso) detailsParts.push('ISO Certified');
  if (cin) detailsParts.push(`CIN: ${cin}`);

  const businessDetails = detailsParts.length > 0
    ? { gstin, pan, cin, isoCertified: hasIso, rawDetails: detailsParts.join(', ') }
    : null;

  // 14. Verification — STRICT: NO FAKE "Verified Partner"
  const verification: string[] = [];
  if (gstin) verification.push('GSTIN Verified');
  if (pan) verification.push('PAN Verified');
  if (hasIso) verification.push('ISO Certified');
  if (/\bchamber of commerce\b/i.test(visibleText)) verification.push('Chamber Registered');

  // 15. Status Tags
  const statusTags: string[] = ['Active'];
  if (/\b(we're hiring|careers|expanding|open positions)\b/i.test(visibleText)) {
    statusTags.push('Expanding');
  }

  return {
    domain: targetDomain,
    companyName,
    category,
    productsServices,
    description: metaDescription || `${companyName} is an active digital enterprise in ${category}.`,
    emails: allEmails.slice(0, 10),
    phones: validPhones.slice(0, 5),
    addresses: Array.from(new Set(addresses)),
    location,
    geoData,
    businessDetails,
    verification,
    statusTags,
    socialLinks,
    schemaOrgData,
    rawScraped: {
      title,
      metaDescription,
      metaKeywords,
      headings,
      visibleText,
    },
  };
}
