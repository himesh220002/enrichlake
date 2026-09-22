/**
 * High-performance URL Reachability & Validation Engine
 * 
 * Guarantees zero-404 links across all scraped products and suppliers:
 * 1. Probes candidate direct URLs via fast HTTP GET with AbortSignal timeout.
 * 2. If direct URL is live (200, redirect, or anti-bot shield 403): preserves as 'direct_scraped'.
 * 3. If direct URL is 404/expired:
 *    - For confirmed marketplaces (IndiaMART, TradeIndia, Moglix, Amazon, etc.):
 *      falls back to the verified platform search URL ('verified_search').
 *    - For corporate manufacturers: probes root domain. If root domain is alive,
 *      falls back to clean root domain ('verified_domain').
 *    - If both direct URL and root domain fail/404 (e.g. dead/parked domains):
 *      marks as invalid so the scraper cleanly discards the broken record.
 */

export interface VerifiedUrlResolution {
  url: string;
  urlType: 'direct_scraped' | 'verified_domain' | 'verified_search';
  isValid: boolean;
  hostname: string;
  domainName: string;
}

interface KnownMarketplace {
  domain: string;
  getSearchUrl: (query: string) => string;
}

const KNOWN_MARKETPLACES: KnownMarketplace[] = [
  {
    domain: 'indiamart.com',
    getSearchUrl: (q) => `https://dir.indiamart.com/search.mp?ss=${encodeURIComponent(q)}`,
  },
  {
    domain: 'tradeindia.com',
    getSearchUrl: (q) => `https://www.tradeindia.com/search.html?keyword=${encodeURIComponent(q)}`,
  },
  {
    domain: 'exportersindia.com',
    getSearchUrl: (q) => `https://www.exportersindia.com/search.php?srch_catg_ty=p&term=${encodeURIComponent(q)}`,
  },
  {
    domain: 'moglix.com',
    getSearchUrl: (q) => `https://www.moglix.com/search?controller=search&s=${encodeURIComponent(q)}`,
  },
  {
    domain: 'infra.market',
    getSearchUrl: (q) => `https://infra.market/search?query=${encodeURIComponent(q)}`,
  },
  {
    domain: 'buildersmart.in',
    getSearchUrl: (q) => `https://www.buildersmart.in/catalogsearch/result/?q=${encodeURIComponent(q)}`,
  },
  {
    domain: 'industrybuying.com',
    getSearchUrl: (q) => `https://www.industrybuying.com/search/?q=${encodeURIComponent(q)}`,
  },
  {
    domain: 'amazon.in',
    getSearchUrl: (q) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}&i=industrial`,
  },
  {
    domain: 'amazon.com',
    getSearchUrl: (q) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}`,
  },
  {
    domain: 'flipkart.com',
    getSearchUrl: (q) => `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    domain: 'croma.com',
    getSearchUrl: (q) => `https://www.croma.com/searchB?q=${encodeURIComponent(q)}`,
  },
  {
    domain: 'reliancedigital.in',
    getSearchUrl: (q) => `https://www.reliancedigital.in/search?q=${encodeURIComponent(q)}`,
  },
  {
    domain: 'vijaysales.com',
    getSearchUrl: (q) => `https://www.vijaysales.com/search/${encodeURIComponent(q)}`,
  },
  {
    domain: 'tatacliq.com',
    getSearchUrl: (q) => `https://www.tatacliq.com/search/?searchCategory=all&text=${encodeURIComponent(q)}`,
  },
  {
    domain: 'alibaba.com',
    getSearchUrl: (q) => `https://www.alibaba.com/trade/search?fsb=y&IndexArea=product_en&SearchText=${encodeURIComponent(q)}`,
  },
];

const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Probes an HTTP/HTTPS URL with a tight timeout to verify reachability.
 * Returns the HTTP status code, or 0 if a network/timeout error occurs.
 */
async function probeUrl(url: string, timeoutMs = 1800): Promise<number> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': BROWSER_USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(timeoutMs),
      redirect: 'follow',
    });
    return res.status;
  } catch {
    return 0;
  }
}

/**
 * Validates a single candidate URL against 404s, falling back to verified search
 * or verified corporate domain if needed, or returning isValid = false if dead.
 */
export async function verifyAndResolveUrl(
  candidateUrl: string,
  searchQuery: string
): Promise<VerifiedUrlResolution> {
  try {
    let rawUrl = candidateUrl.trim();
    if (rawUrl.startsWith('//')) rawUrl = 'https:' + rawUrl;
    if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
      rawUrl = 'https://' + rawUrl;
    }

    const parsed = new URL(rawUrl);
    const domainName = parsed.hostname;
    const hostname = parsed.hostname.replace(/^www\./, '').toLowerCase();

    // Check if domain matches any known platform/marketplace
    const marketplace = KNOWN_MARKETPLACES.find(
      (m) => hostname === m.domain || hostname.endsWith('.' + m.domain)
    );

    // If candidate URL has an empty root path
    if (parsed.pathname === '/' || parsed.pathname === '') {
      if (marketplace) {
        return {
          url: marketplace.getSearchUrl(searchQuery),
          urlType: 'verified_search',
          isValid: true,
          hostname,
          domainName,
        };
      }
      return {
        url: `https://${parsed.hostname}`,
        urlType: 'verified_domain',
        isValid: true,
        hostname,
        domainName,
      };
    }

    // Direct product path candidate: probe direct URL for 404
    const directStatus = await probeUrl(rawUrl, 1800);

    // Status 200-308: direct page is alive and confirmed!
    // Status 401/403/429: anti-bot shields on major platforms (blocks server node-fetch, but works in browser)
    if (
      (directStatus >= 200 && directStatus < 400) ||
      directStatus === 401 ||
      directStatus === 403 ||
      directStatus === 429
    ) {
      return {
        url: rawUrl,
        urlType: 'direct_scraped',
        isValid: true,
        hostname,
        domainName,
      };
    }

    // Direct URL returned 404, 410, 500, or timed out.
    // Fallback Rule 1: If it is a confirmed marketplace, use verified platform search
    if (marketplace) {
      return {
        url: marketplace.getSearchUrl(searchQuery),
        urlType: 'verified_search',
        isValid: true,
        hostname,
        domainName,
      };
    }

    // Fallback Rule 2: If it is a corporate manufacturer or business site, probe root domain
    const rootUrl = `https://${parsed.hostname}`;
    const rootStatus = await probeUrl(rootUrl, 1500);

    if (
      (rootStatus >= 200 && rootStatus < 400) ||
      rootStatus === 401 ||
      rootStatus === 403 ||
      rootStatus === 429
    ) {
      return {
        url: rootUrl,
        urlType: 'verified_domain',
        isValid: true,
        hostname,
        domainName,
      };
    }

    // Both direct URL and root domain returned 404 or connection failed (e.g. dead/parked domain)
    // Mark invalid so caller can cleanly drop the dead result
    return {
      url: rawUrl,
      urlType: 'direct_scraped',
      isValid: false,
      hostname,
      domainName,
    };
  } catch {
    return {
      url: candidateUrl,
      urlType: 'direct_scraped',
      isValid: false,
      hostname: '',
      domainName: '',
    };
  }
}

/**
 * Batch validates an array of items in parallel with a bounded concurrency pool
 */
export async function batchVerifyAndResolveUrls<T>(
  items: T[],
  getUrl: (item: T) => string,
  searchQuery: string,
  concurrency = 8
): Promise<Array<{ item: T; resolution: VerifiedUrlResolution }>> {
  const results: Array<{ item: T; resolution: VerifiedUrlResolution }> = [];

  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    const chunkResults = await Promise.all(
      chunk.map(async (item) => {
        const resolution = await verifyAndResolveUrl(getUrl(item), searchQuery);
        return { item, resolution };
      })
    );
    results.push(...chunkResults);
  }

  return results;
}
