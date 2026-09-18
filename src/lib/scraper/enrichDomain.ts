import { launchStealthBrowser } from './browser';
import { detectTechnographics, TechnographicResult } from './technographics';
import { extractLocalBusinessData, ExtractedContactInfo } from './localBusiness';

export interface EnrichedCompanyProfile {
  domain: string;
  url: string;
  companyName: string;
  description: string;
  contactInfo: {
    emails: string[];
    phones: string[];
    addresses: string[];
    socialLinks: ExtractedContactInfo['socialLinks'];
  };
  technographics: TechnographicResult;
  status: 'success' | 'partial' | 'failed';
  crawledAt: string;
  executionTimeMs: number;
  error?: string;
}

export async function enrichDomain(domainInput: string): Promise<EnrichedCompanyProfile> {
  const startTime = Date.now();
  let cleanDomain = domainInput.trim().toLowerCase().replace(/^(https?:\/\/)/, '').replace(/\/.*$/, '');
  const targetUrl = `https://${cleanDomain}`;

  let browserInstance;

  try {
    const { browser, context, page } = await launchStealthBrowser();
    browserInstance = browser;

    // Navigate to primary domain
    try {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
    } catch {
      // Retry with http if https fails
      await page.goto(`http://${cleanDomain}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    }

    // Wait a brief moment for dynamic hydration
    await page.waitForTimeout(1500);

    // Run extraction in parallel on the primary landing page
    const [contactInfo, technographics] = await Promise.all([
      extractLocalBusinessData(page, cleanDomain),
      detectTechnographics(page),
    ]);

    // Optional: If primary page lacked emails or phones, attempt shallow contact page crawl
    if (contactInfo.emails.length === 0 || contactInfo.phones.length === 0) {
      try {
        const contactLink = await page.$eval(
          'a[href*="contact" i], a[href*="about" i]',
          (el) => el.getAttribute('href') || ''
        ).catch(() => null);

        if (contactLink) {
          const resolvedContactUrl = new URL(contactLink, targetUrl).toString();
          await page.goto(resolvedContactUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
          await page.waitForTimeout(1000);

          const secondaryContacts = await extractLocalBusinessData(page, cleanDomain);
          contactInfo.emails = Array.from(new Set([...contactInfo.emails, ...secondaryContacts.emails]));
          contactInfo.phones = Array.from(new Set([...contactInfo.phones, ...secondaryContacts.phones]));
          contactInfo.addresses = Array.from(new Set([...contactInfo.addresses, ...secondaryContacts.addresses]));
        }
      } catch {
        // Non-critical: ignore secondary crawl failure
      }
    }

    await browser.close();

    return {
      domain: cleanDomain,
      url: targetUrl,
      companyName: contactInfo.companyName,
      description: contactInfo.description,
      contactInfo: {
        emails: contactInfo.emails,
        phones: contactInfo.phones,
        addresses: contactInfo.addresses,
        socialLinks: contactInfo.socialLinks,
      },
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

    return {
      domain: cleanDomain,
      url: targetUrl,
      companyName: cleanDomain,
      description: '',
      contactInfo: {
        emails: [],
        phones: [],
        addresses: [],
        socialLinks: {},
      },
      technographics: {
        technologies: [],
        rawDetectionsCount: 0,
      },
      status: 'failed',
      crawledAt: new Date().toISOString(),
      executionTimeMs: Date.now() - startTime,
      error: err?.message || 'Failed to enrich domain',
    };
  }
}
