import { Page } from 'playwright';

export interface ExtractedContactInfo {
  domain: string;
  companyName: string;
  description: string;
  emails: string[];
  phones: string[];
  addresses: string[];
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  schemaOrgData: any[];
}

// Strict email regex with boundary and standard TLD length (2-6 chars)
const STRICT_EMAIL_REGEX = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(?:com|org|net|io|co|ai|app|tech|dev|biz|info|us|uk|de|ca|eu|in|gov|edu|me|so|agency|design|global)\b/gi;

const COMMON_TLDS = new Set([
  'com', 'org', 'net', 'io', 'co', 'ai', 'app', 'tech', 'dev', 'biz', 'info',
  'us', 'uk', 'de', 'ca', 'eu', 'in', 'gov', 'edu', 'me', 'so', 'agency', 'design', 'global'
]);

const IGNORED_EMAIL_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.pdf',
  '.css', '.js', '.woff', '.woff2', '.ttf'
];

/**
 * Validates whether a candidate string is a plausible international or domestic phone number.
 * Strictly eliminates CSS values, ratio numbers, float coordinates, and internal bundle IDs.
 */
function isValidPhoneNumber(candidate: string): boolean {
  if (!candidate) return false;
  const cleaned = candidate.trim();

  // Reject decimals or aspect ratios like "30.476190476190" or "0.15238"
  if (/\d+\.\d{2,}/.test(cleaned) || cleaned.includes('.0') || cleaned.includes('0.')) {
    return false;
  }

  // Count total digits
  const digits = cleaned.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) {
    return false;
  }

  // Reject repeated single digits like "999999999" or "00000000"
  if (/^(.)\1+$/.test(digits)) {
    return false;
  }

  // Reject sequential runs like "12345678"
  if ('0123456789012345'.includes(digits) || '987654321098765'.includes(digits)) {
    return false;
  }

  // Must have standard phone structure (leading +, parentheses, or standard delimiters)
  // or come from an explicit tel: href
  const hasInternationalPrefix = cleaned.startsWith('+') && /^\+?[1-9]/.test(cleaned);
  const hasParens = /\(\d{2,4}\)/.test(cleaned);
  const hasDelimiters = /[-.\s]/.test(cleaned);

  return hasInternationalPrefix || hasParens || (hasDelimiters && digits.length >= 10);
}

/**
 * Standardize phone number formatting
 */
function formatPhoneNumber(raw: string): string {
  const cleaned = raw.replace(/[^\d+]/g, '').trim();
  if (cleaned.startsWith('+1') && cleaned.length === 12) {
    return `+1 (${cleaned.slice(2, 5)}) ${cleaned.slice(5, 8)}-${cleaned.slice(8)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return raw.trim();
}

/**
 * Clean up email prefix if accidentally prefixed with "email" or "contact"
 */
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
  // 1. Company Name & Meta Description
  const title = await page.title().catch(() => '');
  const metaDescription = await page
    .$eval('meta[name="description"]', (el) => el.getAttribute('content') || '')
    .catch(() => '');

  const ogSiteName = await page
    .$eval('meta[property="og:site_name"]', (el) => el.getAttribute('content') || '')
    .catch(() => '');

  const companyName = ogSiteName || title.split(/[-|–:·•]/)[0]?.trim() || targetDomain;

  // 2. Extract Explicit `mailto:` links
  const mailtoHrefs = await page.$$eval('a[href^="mailto:"]', (els) =>
    els.map((el) => el.getAttribute('href')?.replace(/^mailto:/i, '').split('?')[0].toLowerCase().trim() || '')
  ).catch(() => [] as string[]);

  // Extract visible body text (excluding script, style, svg, noscript, canvas)
  const visibleText = await page.evaluate(() => {
    const clone = document.body.cloneNode(true) as HTMLElement;
    if (!clone) return '';
    const nonContentSelectors = ['script', 'style', 'svg', 'noscript', 'iframe', 'canvas'];
    nonContentSelectors.forEach((sel) => {
      clone.querySelectorAll(sel).forEach((el) => el.remove());
    });
    return clone.innerText || clone.textContent || '';
  }).catch(() => '');

  const textEmails = Array.from(visibleText.matchAll(STRICT_EMAIL_REGEX)).map((m) => m[0].toLowerCase());

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

  // 3. Schema.org / JSON-LD structured data
  const schemaOrgData = await page.$$eval('script[type="application/ld+json"]', (els) => {
    const results: any[] = [];
    for (const el of els) {
      try {
        const json = JSON.parse(el.textContent || '{}');
        results.push(json);
      } catch {
        // ignore invalid json
      }
    }
    return results;
  }).catch(() => [] as any[]);

  const schemaPhones: string[] = [];
  const addresses: string[] = [];

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
    }
  }

  // 4. Meta tags for telephone
  const metaPhones = await page.evaluate(() => {
    const metas = document.querySelectorAll(
      'meta[property="business:contact_data:phone_number"], meta[name="telephone"], meta[property="og:phone_number"]'
    );
    return Array.from(metas).map((m) => m.getAttribute('content') || '');
  }).catch(() => [] as string[]);

  // 5. Explicit `tel:` links
  const telHrefs = await page.$$eval('a[href^="tel:"]', (els) =>
    els.map((el) => el.getAttribute('href')?.replace(/^tel:/i, '').split('?')[0].trim() || '')
  ).catch(() => [] as string[]);

  // 6. Targeted Contact & Footer Elements
  const targetedPhoneText = await page.evaluate(() => {
    const selectors = [
      'footer',
      '[class*="footer" i]',
      '[id*="footer" i]',
      'address',
      '[class*="contact" i]',
      '[id*="contact" i]',
      '[itemprop="telephone"]',
      '.header-contact',
      '.top-bar',
    ];
    const elements = document.querySelectorAll(selectors.join(','));
    let text = '';
    elements.forEach((el) => {
      text += ' ' + ((el as HTMLElement).innerText || el.textContent || '');
    });
    return text;
  }).catch(() => '');

  // Strict Phone Regex
  const STRICT_PHONE_PATTERNS = [
    // Standard international format e.g. +1 (800) 555-0199 or +44 20 7946 0958 or +91 98765 43210
    /\+?[1-9]\d{0,2}[ -.]\(?\d{2,4}\)?[ -.]\d{3,4}[ -.]\d{3,4}/g,
    // North American standard e.g. (800) 555-0199 or 800-555-0199 or 800.555.0199
    /(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s][2-9]\d{2}[-.\s]\d{4}/g,
    // Labeled numbers e.g. "Phone: 123-456-7890", "Tel: +1-800-123-4567", "Call: 800-123-4567"
    /(?:tel|phone|call|toll[- ]free|mobile|direct|hotline)[:\s]+([\+\d\(\)\s\.\-]{8,20})/gi,
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

  // Combine and validate
  const combinedPhones = [...telHrefs, ...schemaPhones, ...metaPhones, ...matchedRawPhones];
  const validPhones = Array.from(new Set(
    combinedPhones
      .filter(isValidPhoneNumber)
      .map(formatPhoneNumber)
  ));

  // 7. Extract Social Links
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

  return {
    domain: targetDomain,
    companyName,
    description: metaDescription,
    emails: allEmails.slice(0, 10),
    phones: validPhones.slice(0, 5),
    addresses: Array.from(new Set(addresses)),
    socialLinks,
    schemaOrgData,
  };
}
