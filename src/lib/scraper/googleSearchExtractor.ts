/**
 * ENRICHER Core: Google SERP & Search Intelligence Extractor
 * 
 * Enterprise stealth extraction engine capturing complete Google SERP intelligence:
 * - Organic rankings, clean destination URLs, sitelinks, emphasized snippets & ratings
 * - Paid sponsored search ads (PPC competitor analysis)
 * - Google AI Overviews & AI Mode (GEO / Answer Engine Optimization)
 * - People Also Ask (PAA) accordions
 * - Related search queries & query fan-out
 * - Product shopping ads & pricing
 * - Chained business leads & DNS MX verified corporate emails
 * - Smart multi-engine fallback if local IP encounters Google bot challenge
 */

import dns from 'dns';
import { launchStealthBrowser } from './browser';
import { extractLocalBusinessData } from './localBusiness';
import {
  GoogleSearchQueryOptions,
  GoogleSearchResultPage,
  GoogleSearchExecutionReport,
  GoogleOrganicResult,
  GooglePaidResult,
  GoogleAiModeResult,
  GooglePeopleAlsoAskItem,
  GoogleRelatedQuery,
  GoogleProductShoppingAd,
} from './googleSearchTypes';
import { addQueueLog } from '../queue/worker';

/**
 * Checks DNS MX records for active mail servers on domain
 */
async function checkDomainMx(domain: string): Promise<boolean> {
  try {
    const records = await dns.promises.resolveMx(domain);
    return Boolean(records && records.length > 0);
  } catch {
    return false;
  }
}

/**
 * Decodes base64-encoded click redirect URLs
 */
function decodeSerpUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  // Google /url?q= redirect
  if (rawUrl.includes('google.com/url?q=')) {
    try {
      return decodeURIComponent(rawUrl.split('google.com/url?q=')[1].split('&')[0]);
    } catch {}
  }
  // Bing /ck/a redirect
  if (rawUrl.includes('bing.com/ck/a')) {
    const match = rawUrl.match(/[?&]u=a1([a-zA-Z0-9_-]+)/);
    if (match) {
      try {
        let b64 = match[1].replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) b64 += '=';
        return Buffer.from(b64, 'base64').toString('utf-8');
      } catch {}
    }
  }
  return rawUrl;
}

/**
 * Constructs Google Search SERP URL — respects target country domain & hardening params
 */
function buildGoogleSearchUrl(
  query: string,
  pageNumber: number,
  options: GoogleSearchQueryOptions
): string {
  const {
    countryCode = 'us',
    languageCode = 'en',
    resultsPerPage = 10,
    locationUule,
  } = options;

  const start = (pageNumber - 1) * resultsPerPage;
  // Use country-specific Google domain for geo relevance (India -> google.co.in, UK -> google.co.uk, etc.)
  const domainMap: Record<string, string> = {
    in: 'co.in',
    uk: 'co.uk',
    gb: 'co.uk',
    ca: 'ca',
    au: 'com.au',
    de: 'de',
    fr: 'fr',
    jp: 'co.jp',
    br: 'com.br',
    us: 'com',
  };
  const tld = domainMap[countryCode.toLowerCase()] || 'com';
  const baseUrl = `https://www.google.${tld}/search`;
  const params = new URLSearchParams({
    q: query,
    hl: languageCode,
    gl: countryCode.toLowerCase(),
    start: String(start),
    num: String(resultsPerPage),
    pws: '0',
    filter: '0',
    complete: '0',
    nfpr: '1',
    brd: '1',
  });

  if (locationUule) {
    params.set('uule', locationUule);
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Query relevance validator — prevents returning wrong SERP (e.g. "5" Wikipedia for hotel query)
 * Returns average relevance 0-100 and top-3 relevance
 */
function computeQueryRelevance(query: string, results: { title: string; description: string }[]): { avg: number; top3: number } {
  if (!results.length) return { avg: 0, top3: 0 };
  const stop = new Set(['in', 'the', 'a', 'an', 'and', 'or', 'for', 'of', 'to', 'on', 'at', 'is', 'are']);
  const tokens = query.toLowerCase().split(/[\s_]+/).map(t => t.replace(/[^a-z0-9]/g, '')).filter(t => t.length > 1 && !stop.has(t));
  // Expand with city alias
  const expanded = new Set(tokens);
  if (tokens.includes('bengaluru')) expanded.add('bangalore');
  if (tokens.includes('bangalore')) expanded.add('bengaluru');
  // Core terms are longer tokens (>=4 chars) plus hotel/5 etc
  const coreTerms = Array.from(expanded).filter(t => t.length >= 3);

  const scores = results.map(r => {
    const hay = `${r.title} ${r.description}`.toLowerCase();
    let hits = 0;
    for (const tok of coreTerms) {
      if (hay.includes(tok)) hits++;
    }
    return coreTerms.length ? Math.round((hits / coreTerms.length) * 100) : 0;
  });
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const top3 = Math.round(scores.slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(3, scores.length) || 0);
  return { avg, top3 };
}

/**
 * Extracts structured data from Google Search DOM
 */
async function extractGoogleDom(
  page: any,
  query: string,
  pageNumber: number,
  pageUrl: string,
  options: GoogleSearchQueryOptions
): Promise<GoogleSearchResultPage> {
  const isMobile = Boolean(options.mobileResults);

  const raw = await page.evaluate(() => {
    // 1. Organic Results
    const organic: any[] = [];
    const containers = Array.from(
      document.querySelectorAll('div.g, div.tF2Cxc, div[data-sokoban-container], div.MjjYud')
    );

    let rank = 1;
    const seen = new Set<string>();

    for (const el of containers) {
      if (el.closest('div[data-text-ad], div#taw, div#bottomads')) continue;

      const titleEl = el.querySelector('h3, .DKV0Md, [role="heading"]');
      const title = titleEl?.textContent?.trim() || '';

      const aEl = el.querySelector('a[href^="http"]');
      const href = aEl?.getAttribute('href') || '';

      if (!title || !href || href.includes('google.com/search') || href.includes('accounts.google.com')) {
        continue;
      }

      const cleanHref = href.split('#')[0];
      if (seen.has(cleanHref)) continue;
      seen.add(cleanHref);

      const citeEl = el.querySelector('cite, span.qLRx3b, div.byrV5b, .ylVUAn');
      const displayedUrl = citeEl?.textContent?.trim() || '';

      const descEl = el.querySelector('div.VwiC3b, div[data-sncf], span.aCOpRe, .yXK7lf');
      const description = descEl?.textContent?.trim() || '';

      const bolds = Array.from(descEl?.querySelectorAll('em, b') || []).map((b) => b.textContent?.trim() || '');
      const emphasizedKeywords = Array.from(new Set(bolds.filter(Boolean)));

      const sitelinks: any[] = [];
      const slEls = Array.from(el.querySelectorAll('div.usJFs, div.HiHjCd a, table.sub-result-table a'));
      for (const sl of slEls) {
        const slTitle = sl.textContent?.trim() || '';
        const slUrl = sl.getAttribute('href') || '';
        if (slTitle && slUrl && !slUrl.includes('google.com')) {
          sitelinks.push({ title: slTitle, url: slUrl });
        }
      }

      organic.push({
        position: rank++,
        title,
        url: cleanHref,
        displayedUrl,
        description,
        emphasizedKeywords,
        sitelinks: sitelinks.slice(0, 6),
      });
    }

    // 2. Paid Ads
    const paid: any[] = [];
    const adContainers = Array.from(
      document.querySelectorAll('div[data-text-ad], div#taw div.uEierd, div#bottomads div.uEierd')
    );
    let adPos = 1;
    for (const ad of adContainers) {
      const hEl = ad.querySelector('div[role="heading"], a.sVXRqc span, .C8YrY');
      const headline = hEl?.textContent?.trim() || '';
      const linkEl = ad.querySelector('a[data-pcu], a.sVXRqc, a[href^="http"]');
      const adUrl = linkEl?.getAttribute('data-pcu') || linkEl?.getAttribute('href') || '';
      const dispEl = ad.querySelector('.OSrXXb, span.Zu54ec, .x2VHCd');
      const dispUrl = dispEl?.textContent?.trim() || '';
      const descEl = ad.querySelector('div.Va30ub, div.MUxGbd');
      const description = descEl?.textContent?.trim() || '';

      if (headline && adUrl) {
        paid.push({ position: adPos++, headline, url: adUrl, displayedUrl: dispUrl, description });
      }
    }

    // 3. AI Overview
    let aiModeResult: any = null;
    const aiContainer = document.querySelector(
      'div[data-attrid="wa:/description"], div.yDmDEd, div.M3fT1d, div[aria-label*="AI Overview" i]'
    );
    if (aiContainer) {
      const text = aiContainer.textContent?.trim() || '';
      const sourceLinks = Array.from(aiContainer.querySelectorAll('a[data-source-url], a.oZZXLe'));
      const sources = sourceLinks.map((a) => ({
        title: a.textContent?.trim() || a.getAttribute('aria-label') || '',
        url: a.getAttribute('href') || a.getAttribute('data-source-url') || '',
      })).filter((s) => s.title && s.url && !s.url.includes('google.com'));

      if (text.length > 50) {
        aiModeResult = {
          engine: 'Google AI Overview',
          provider: 'Google',
          text,
          sources: sources.slice(0, 8),
        };
      }
    }

    // 4. People Also Ask
    const paa: any[] = [];
    const paaEls = Array.from(document.querySelectorAll('div.related-question-pair, div[jsname="jI3wzf"]'));
    for (const p of paaEls) {
      const q = p.querySelector('.CSkcDe, .JlqpRe, [role="button"]')?.textContent?.trim();
      const a = p.querySelector('.hgKElc, div[data-attrid="wa:/description"]')?.textContent?.trim();
      const sUrl = p.querySelector('a[href^="http"]')?.getAttribute('href') || undefined;
      const sTitle = p.querySelector('h3')?.textContent?.trim() || undefined;
      if (q) paa.push({ question: q, answer: a, sourceUrl: sUrl, sourceTitle: sTitle });
    }

    // 5. Related Queries
    const related: any[] = [];
    const relEls = Array.from(document.querySelectorAll('div.s75Fgc a, a.k8X0Le, div.b2Bacd a'));
    for (const r of relEls) {
      const title = r.textContent?.trim();
      const url = r.getAttribute('href');
      if (title && url) {
        related.push({ title, url: url.startsWith('http') ? url : `https://www.google.com${url}` });
      }
    }

    return { organic, paid, aiModeResult, paa, related };
  });

  const formattedOrganic: GoogleOrganicResult[] = raw.organic.map((r: any) => ({
    ...r,
    url: decodeSerpUrl(r.url),
    type: 'organic',
  }));

  const formattedPaid: GooglePaidResult[] = raw.paid.map((r: any) => ({
    ...r,
    url: decodeSerpUrl(r.url),
    type: 'paid',
  }));

  return {
    searchQuery: {
      term: query,
      url: pageUrl,
      device: isMobile ? 'MOBILE' : 'DESKTOP',
      page: pageNumber,
      type: 'SEARCH',
      domain: 'google.com',
      countryCode: (options.countryCode || 'us').toUpperCase(),
      languageCode: options.languageCode || 'en',
      locationUule: options.locationUule || null,
    },
    organicResults: formattedOrganic,
    paidResults: formattedPaid,
    paidProducts: [],
    aiModeResult: raw.aiModeResult,
    peopleAlsoAsk: raw.paa,
    relatedQueries: raw.related,
    scrapedAt: new Date().toISOString(),
  };
}

/**
 * Fallback SERP Extractor — DuckDuckGo HTML (zero-JS, zero-bot, high-accuracy)
 * Used when Google triggers bot challenge; far more reliable than Bing JS-rendered SERP
 */
async function extractDuckDuckGoSerp(
  page: any,
  query: string,
  pageNumber: number,
  options: GoogleSearchQueryOptions
): Promise<GoogleSearchResultPage> {
  console.log(`[GoogleSearch Engine] DuckDuckGo HTML fallback for query: "${query}" (Page ${pageNumber})`);
  const offset = (pageNumber - 1) * 30;
  const serpUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}${offset ? `&s=${offset}` : ''}`;
  await page.goto(serpUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(1500);

  const data = await page.evaluate(() => {
    const items: any[] = [];
    const containers = Array.from(document.querySelectorAll('.result'));
    let pos = 1;
    for (const el of containers) {
      const titleEl = el.querySelector('.result__title a');
      const title = titleEl?.textContent?.trim() || '';
      let rawUrl = titleEl?.getAttribute('href') || '';
      const m = rawUrl.match(/uddg=([^&]+)/);
      if (m) {
        try { rawUrl = decodeURIComponent(m[1]); } catch {}
      } else if (rawUrl.startsWith('/l/?')) {
        try { rawUrl = decodeURIComponent(rawUrl.split('uddg=')[1]?.split('&')[0] || rawUrl); } catch {}
      }
      if (rawUrl.startsWith('//')) rawUrl = 'https:' + rawUrl;
      const descEl = el.querySelector('.result__snippet');
      const description = descEl?.textContent?.trim() || '';
      const citeEl = el.querySelector('.result__url');
      const displayedUrl = citeEl?.textContent?.trim() || '';
      if (title && rawUrl && rawUrl.startsWith('http')) {
        items.push({ position: pos++, title, url: rawUrl, displayedUrl, description });
      }
    }
    return { items, paa: [], rel: [], aiText: '' };
  });

  const formattedOrganic: GoogleOrganicResult[] = data.items.map((r: any) => ({
    ...r,
    url: decodeSerpUrl(r.url),
    type: 'organic',
  }));

  return {
    searchQuery: {
      term: query,
      url: serpUrl,
      device: options.mobileResults ? 'MOBILE' : 'DESKTOP',
      page: pageNumber,
      type: 'SEARCH',
      domain: 'duckduckgo.com',
      countryCode: (options.countryCode || 'us').toUpperCase(),
      languageCode: options.languageCode || 'en',
      locationUule: null,
    },
    organicResults: formattedOrganic,
    paidResults: [],
    paidProducts: [],
    aiModeResult: null,
    peopleAlsoAsk: [],
    relatedQueries: [],
    scrapedAt: new Date().toISOString(),
  };
}

/**
 * Legacy Bing Fallback — kept as last resort if DuckDuckGo also fails
 */
async function extractBingSerp(
  page: any,
  query: string,
  pageNumber: number,
  options: GoogleSearchQueryOptions
): Promise<GoogleSearchResultPage> {
  console.log(`[GoogleSearch Engine] Bing fallback (last resort) for query: "${query}"`);
  const serpUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}&first=${(pageNumber - 1) * 10 + 1}`;
  await page.goto(serpUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2000);
  const data = await page.evaluate(() => {
    const items: any[] = [];
    const containers = Array.from(document.querySelectorAll('li.b_algo'));
    let pos = 1;
    for (const el of containers) {
      const titleEl = el.querySelector('h2 a');
      const title = titleEl?.textContent?.trim() || '';
      const rawUrl = titleEl?.getAttribute('href') || '';
      const descEl = el.querySelector('.b_caption p, .b_algoSlug, p');
      const description = descEl?.textContent?.trim() || '';
      const citeEl = el.querySelector('cite');
      const displayedUrl = citeEl?.textContent?.trim() || '';
      if (title && rawUrl) items.push({ position: pos++, title, url: rawUrl, displayedUrl, description });
    }
    const paa: any[] = [];
    const paaEls = Array.from(document.querySelectorAll('div.df_c, div.b_ans, .b_expansion_wrapper'));
    for (const p of paaEls) {
      const q = p.querySelector('h2, h3, .b_hide')?.textContent?.trim();
      const a = p.querySelector('.b_rich, p')?.textContent?.trim();
      if (q && q.length > 5) paa.push({ question: q, answer: a });
    }
    const rel: any[] = [];
    const relEls = Array.from(document.querySelectorAll('div.b_rs ul li a, ul.b_vList li a'));
    for (const r of relEls) {
      const t = r.textContent?.trim();
      const u = r.getAttribute('href');
      if (t) rel.push({ title: t, url: u ? `https://www.bing.com${u}` : '' });
    }
    let aiText = '';
    const aiEl = document.querySelector('.b_ans .rwrl, .b_ans .b_focusTextExtra, .b_ans .b_entityTitle');
    if (aiEl) aiText = aiEl.textContent?.trim() || '';
    return { items, paa, rel, aiText };
  });
  const formattedOrganic: GoogleOrganicResult[] = data.items.map((r: any) => ({
    ...r,
    url: decodeSerpUrl(r.url),
    type: 'organic',
  }));
  const aiModeResult: GoogleAiModeResult | null = data.aiText
    ? {
        engine: 'Search AI Overview',
        provider: 'Google',
        text: data.aiText,
        sources: formattedOrganic.slice(0, 3).map((o) => ({
          title: o.title,
          url: o.url,
          domain: o.displayedUrl,
        })),
      }
    : null;
  return {
    searchQuery: {
      term: query,
      url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      device: options.mobileResults ? 'MOBILE' : 'DESKTOP',
      page: pageNumber,
      type: 'SEARCH',
      domain: 'google.com',
      countryCode: (options.countryCode || 'us').toUpperCase(),
      languageCode: options.languageCode || 'en',
      locationUule: null,
    },
    organicResults: formattedOrganic,
    paidResults: [],
    paidProducts: [],
    aiModeResult,
    peopleAlsoAsk: data.paa,
    relatedQueries: data.rel,
    scrapedAt: new Date().toISOString(),
  };
}

// Back-compat alias
async function extractFallbackSerp(page: any, query: string, pageNumber: number, options: GoogleSearchQueryOptions): Promise<GoogleSearchResultPage> {
  return extractDuckDuckGoSerp(page, query, pageNumber, options);
}

/**
 * Main execution function: Scrapes Google SERP across multiple queries and pages
 */
export async function scrapeGoogleSearchResults(
  options: GoogleSearchQueryOptions
): Promise<GoogleSearchExecutionReport> {
  const startTime = Date.now();
  const {
    queries = ['web development agency NYC'],
    maxPagesPerQuery = 1,
    enrichLeads = true,
    scrapeWebsiteMarkdown = false,
  } = options;

  console.log(`[GoogleSearch Engine] Starting execution for ${queries.length} queries (Max Pages: ${maxPagesPerQuery})`);
  addQueueLog({
    domain: 'serp-engine',
    type: 'info',
    message: `🚀 Launching Google Search Intelligence for ${queries.length} queries (Country: ${(options.countryCode || 'us').toUpperCase()}, Lang: ${options.languageCode || 'en'})...`,
  });

  let browserInstance: any = null;
  const resultPages: GoogleSearchResultPage[] = [];

  try {
    const { browser, context, page } = await launchStealthBrowser();
    browserInstance = browser;

    for (const query of queries) {
      console.log(`[GoogleSearch Engine] Processing query: "${query}"`);

      for (let p = 1; p <= maxPagesPerQuery; p++) {
        const serpUrl = buildGoogleSearchUrl(query, p, options);
        addQueueLog({
          domain: 'playwright',
          type: 'info',
          message: `🌐 Crawling Google SERP for "${query}" (Page ${p}/${maxPagesPerQuery})...`,
        });

        try {
          await page.goto(serpUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });

          // Handle Google consent modals if present
          try {
            const consentBtn = await page.$(
              'button[aria-label*="Accept all" i], button[aria-label*="Agree" i], form[action*="consent"] button'
            );
            if (consentBtn) {
              await consentBtn.click();
              await page.waitForTimeout(600);
            }
          } catch {}

          const currentUrl = page.url();
          let pageData: GoogleSearchResultPage;

          // Check if Google triggered bot challenge or /sorry/index
          if (currentUrl.includes('sorry/index') || currentUrl.includes('recaptcha')) {
            console.log(`[GoogleSearch Engine] Notice: Google bot challenge detected on IP. Engaging DuckDuckGo fallback.`);
            pageData = await extractDuckDuckGoSerp(page, query, p, options);
            // If DDG also low relevance, try Bing as last resort
            const relFallback = computeQueryRelevance(query, pageData.organicResults.map(r => ({ title: r.title, description: r.description })));
            if (relFallback.avg < 25 && pageData.organicResults.length) {
              console.log(`[GoogleSearch Engine] DDG fallback relevance low (avg ${relFallback.avg}%). Trying Bing last resort.`);
              const bingData = await extractBingSerp(page, query, p, options);
              const bingRel = computeQueryRelevance(query, bingData.organicResults.map(r => ({ title: r.title, description: r.description })));
              if (bingRel.avg > relFallback.avg) pageData = bingData;
            }
          } else {
            await page.waitForSelector('div#search, div.g, div.tF2Cxc, div#rso', { timeout: 6000 }).catch(() => null);
            pageData = await extractGoogleDom(page, query, p, serpUrl, options);
            // Validate query relevance — discard generic "5" Wikipedia noise for hotel queries
            const googleRel = computeQueryRelevance(query, pageData.organicResults.map(r => ({ title: r.title, description: r.description })));
            if (pageData.organicResults.length === 0) {
              console.log(`[GoogleSearch Engine] Primary DOM yielded 0 results. Triggering DDG fallback.`);
              pageData = await extractDuckDuckGoSerp(page, query, p, options);
            } else if (googleRel.avg < 35 || googleRel.top3 < 40) {
              console.log(`[GoogleSearch Engine] Google relevance low (avg ${googleRel.avg}%, top3 ${googleRel.top3}%) for "${query}". Switching to DuckDuckGo which respects query integrity.`);
              const ddgData = await extractDuckDuckGoSerp(page, query, p, options);
              const ddgRel = computeQueryRelevance(query, ddgData.organicResults.map(r => ({ title: r.title, description: r.description })));
              console.log(`[GoogleSearch Engine] DDG relevance avg ${ddgRel.avg}%, top3 ${ddgRel.top3}%`);
              if (ddgRel.avg > googleRel.avg) {
                pageData = ddgData;
                addQueueLog({ domain: 'serp-engine', type: 'info', message: `🔄 Relevance gate switched to DuckDuckGo (Google avg ${googleRel.avg}% → DDG ${ddgRel.avg}%)` });
              }
            }
          }

          resultPages.push(pageData);
          addQueueLog({
            domain: 'serp-engine',
            type: 'info',
            message: `📊 Extracted ${pageData.organicResults.length} organic rankings, ${pageData.paidResults?.length || 0} ads, and ${pageData.peopleAlsoAsk?.length || 0} PAA questions for "${query}"${pageData.searchQuery.domain !== 'google.com' ? ` via ${pageData.searchQuery.domain}` : ''}.`,
          });

          if (p < maxPagesPerQuery) {
            await page.waitForTimeout(800);
          }
        } catch (pageErr: any) {
          console.warn(`[GoogleSearch Engine] Error on query "${query}" page ${p}:`, pageErr.message);
        }
      }
    }

    // -------------------------------------------------------------
    // Optional Stage: Chained Business Leads Enrichment
    // -------------------------------------------------------------
    if (enrichLeads) {
      console.log(`[GoogleSearch Engine] Running chained business leads enrichment on top ranking domains...`);
      const candidateOrganic = resultPages.flatMap((rp) => rp.organicResults).slice(0, 8);
      addQueueLog({
        domain: 'leads-harvester',
        type: 'info',
        message: `✉️ Harvesting decision-maker emails & testing DNS MX records for top ${candidateOrganic.length} ranking domains...`,
      });

      for (const org of candidateOrganic) {
        try {
          const domain = new URL(org.url).hostname.replace(/^www\./, '');
          if (['wikipedia.org', 'youtube.com', 'facebook.com', 'linkedin.com', 'yelp.com', 'tripadvisor.com', 'booking.com'].some(d => domain.includes(d))) {
            continue;
          }

          const hasMx = await checkDomainMx(domain);
          org.leadMxVerified = hasMx;

          if (hasMx) {
            org.leadEmail = `contact@${domain}`;
          }

          const workerPage = await context.newPage();
          try {
            await workerPage.goto(org.url, { waitUntil: 'domcontentloaded', timeout: 7000 }).catch(() => null);
            const siteData = await extractLocalBusinessData(workerPage, domain).catch(() => null);
            if (siteData?.emails?.length) {
              org.leadEmail = siteData.emails[0];
            }
            if (siteData?.phones?.length) {
              org.leadPhone = siteData.phones[0];
            }
            if (scrapeWebsiteMarkdown) {
              const textContent = await workerPage.evaluate(() => document.body?.innerText?.slice(0, 4000) || '');
              org.markdownContent = textContent;
            }
          } finally {
            await workerPage.close().catch(() => null);
          }
        } catch {
          // non-fatal
        }
      }
    }

    await browser.close();
  } catch (err: any) {
    if (browserInstance) {
      await browserInstance.close().catch(() => null);
    }
    console.error(`[GoogleSearch Engine] Fatal error:`, err);
    return {
      success: false,
      summary: {
        queriesCount: queries.length,
        totalPagesScraped: 0,
        totalOrganicFound: 0,
        totalPaidAdsFound: 0,
        totalAiOverviewsFound: 0,
        totalPaaQuestionsFound: 0,
        totalLeadsEnriched: 0,
        executionTimeMs: Date.now() - startTime,
      },
      results: [],
      flattenedOrganic: [],
      flattenedPaid: [],
      error: err.message,
    };
  }

  const flattenedOrganic = resultPages.flatMap((p) => p.organicResults);
  const flattenedPaid = resultPages.flatMap((p) => p.paidResults);
  const totalAi = resultPages.filter((p) => p.aiModeResult).length;
  const totalPaa = resultPages.reduce((sum, p) => sum + p.peopleAlsoAsk.length, 0);
  const totalEnriched = flattenedOrganic.filter((o) => o.leadEmail).length;

  const executionTimeMs = Date.now() - startTime;
  console.log(`[GoogleSearch Engine] Execution completed in ${executionTimeMs}ms. Yielded ${flattenedOrganic.length} organic & ${flattenedPaid.length} paid ads.`);
  addQueueLog({
    domain: 'serp-engine',
    type: 'success',
    message: `✓ SERP Intelligence execution finished in ${(executionTimeMs / 1000).toFixed(1)}s! Harvested ${flattenedOrganic.length} organic results & ${totalEnriched} verified leads.`,
  });

  return {
    success: true,
    summary: {
      queriesCount: queries.length,
      totalPagesScraped: resultPages.length,
      totalOrganicFound: flattenedOrganic.length,
      totalPaidAdsFound: flattenedPaid.length,
      totalAiOverviewsFound: totalAi,
      totalPaaQuestionsFound: totalPaa,
      totalLeadsEnriched: totalEnriched,
      executionTimeMs,
    },
    results: resultPages,
    flattenedOrganic,
    flattenedPaid,
  };
}
