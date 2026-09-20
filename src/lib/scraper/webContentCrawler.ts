import * as cheerio from 'cheerio';
import { launchStealthBrowser } from './browser';

export interface WebCrawlerResult {
  url: string;
  title: string;
  description: string;
  author?: string;
  publishDate?: string;
  canonicalUrl?: string;
  ogImage?: string;
  wordCount: number;
  readTimeMinutes: number;
  headings: Array<{ level: number; text: string; id: string }>;
  markdown: string;
  plainText: string;
  links: {
    internal: string[];
    external: string[];
  };
  scrapedAt: string;
  crawlMode: 'stealth_browser' | 'fast_fetch';
}

export interface WebCrawlerOptions {
  url: string;
  renderJs?: boolean;
  timeoutMs?: number;
  includeLinks?: boolean;
  includeImages?: boolean;
}

/**
 * Converts a Cheerio DOM subtree into clean GitHub-flavored Markdown.
 */
function htmlToMarkdown($: cheerio.CheerioAPI, root: cheerio.Cheerio<any>): string {
  const lines: string[] = [];

  // Remove clutter elements
  root.find('script, style, noscript, svg, nav, footer, header, aside, form, iframe, [role="alert"], [class*="cookie"], [id*="cookie"], [class*="ad-"], [class*="banner"]').remove();

  function traverse(el: any) {
    if (!el) return;

    if (el.type === 'text') {
      const text = el.data?.trim();
      if (text) lines.push(text);
      return;
    }

    if (el.type === 'tag') {
      const tagName = el.tagName?.toLowerCase();

      switch (tagName) {
        case 'h1': {
          const text = $(el).text().trim().replace(/\s+/g, ' ');
          if (text) lines.push(`\n# ${text}\n`);
          break;
        }
        case 'h2': {
          const text = $(el).text().trim().replace(/\s+/g, ' ');
          if (text) lines.push(`\n## ${text}\n`);
          break;
        }
        case 'h3': {
          const text = $(el).text().trim().replace(/\s+/g, ' ');
          if (text) lines.push(`\n### ${text}\n`);
          break;
        }
        case 'h4': {
          const text = $(el).text().trim().replace(/\s+/g, ' ');
          if (text) lines.push(`\n#### ${text}\n`);
          break;
        }
        case 'h5':
        case 'h6': {
          const text = $(el).text().trim().replace(/\s+/g, ' ');
          if (text) lines.push(`\n##### ${text}\n`);
          break;
        }
        case 'p': {
          const text = $(el).text().trim().replace(/\s+/g, ' ');
          if (text) lines.push(`\n${text}\n`);
          break;
        }
        case 'blockquote': {
          const text = $(el).text().trim().replace(/\s+/g, ' ');
          if (text) lines.push(`\n> ${text}\n`);
          break;
        }
        case 'pre':
        case 'code': {
          const codeText = $(el).text();
          if (codeText.trim()) lines.push(`\n\`\`\`\n${codeText.trim()}\n\`\`\`\n`);
          break;
        }
        case 'ul': {
          lines.push('\n');
          $(el).children('li').each((_, li) => {
            const liText = $(li).text().trim().replace(/\s+/g, ' ');
            if (liText) lines.push(`- ${liText}`);
          });
          lines.push('\n');
          break;
        }
        case 'ol': {
          lines.push('\n');
          $(el).children('li').each((idx, li) => {
            const liText = $(li).text().trim().replace(/\s+/g, ' ');
            if (liText) lines.push(`${idx + 1}. ${liText}`);
          });
          lines.push('\n');
          break;
        }
        case 'table': {
          const rows: string[][] = [];
          $(el).find('tr').each((_, tr) => {
            const row: string[] = [];
            $(tr).find('th, td').each((_, cell) => {
              row.push($(cell).text().trim().replace(/\|/g, '\\|').replace(/\s+/g, ' '));
            });
            if (row.length > 0) rows.push(row);
          });
          if (rows.length > 0) {
            lines.push('\n');
            // Header
            lines.push(`| ${rows[0].join(' | ')} |`);
            lines.push(`| ${rows[0].map(() => '---').join(' | ')} |`);
            // Body
            for (let i = 1; i < rows.length; i++) {
              lines.push(`| ${rows[i].join(' | ')} |`);
            }
            lines.push('\n');
          }
          break;
        }
        case 'hr': {
          lines.push('\n---\n');
          break;
        }
        default: {
          // Traverse children for generic wrappers like div, main, article, section
          $(el).contents().each((_, child) => traverse(child));
          break;
        }
      }
    }
  }

  root.contents().each((_, child) => traverse(child));

  return lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Main Web Content Crawler: Crawls target URL and returns LLM/RAG-ready Markdown & metadata.
 */
export async function crawlWebsiteContent(options: WebCrawlerOptions): Promise<WebCrawlerResult> {
  const { url, renderJs = true, timeoutMs = 25000 } = options;

  let targetUrl = url.trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = `https://${targetUrl}`;
  }

  const parsedUrl = new URL(targetUrl);
  const hostname = parsedUrl.hostname;

  let html = '';
  let crawlMode: 'stealth_browser' | 'fast_fetch' = 'fast_fetch';

  // Strategy 1: If renderJs is requested, use stealth Playwright browser
  if (renderJs) {
    try {
      const { page } = await launchStealthBrowser();
      try {
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
        // Brief settle time for client hydrations
        await page.waitForTimeout(1000);
        html = await page.content();
        crawlMode = 'stealth_browser';
      } finally {
        await page.close().catch(() => {});
      }
    } catch (browserErr: any) {
      console.warn(`[webContentCrawler] Stealth browser fetch failed for ${targetUrl}: ${browserErr.message}. Falling back to fast fetch.`);
    }
  }

  // Strategy 2: Fallback to fast HTTP fetch if browser wasn't used or timed out
  if (!html) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const resp = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      html = await resp.text();
      crawlMode = 'fast_fetch';
    } finally {
      clearTimeout(timeout);
    }
  }

  if (!html) {
    throw new Error(`Failed to retrieve page content from ${targetUrl}`);
  }

  // Parse with Cheerio
  const $ = cheerio.load(html);

  // 1. Metadata extraction
  const title =
    $('meta[property="og:title"]').attr('content')?.trim() ||
    $('title').text().trim() ||
    $('h1').first().text().trim() ||
    hostname;

  const description =
    $('meta[property="og:description"]').attr('content')?.trim() ||
    $('meta[name="description"]').attr('content')?.trim() ||
    $('meta[name="twitter:description"]').attr('content')?.trim() ||
    '';

  const author =
    $('meta[name="author"]').attr('content')?.trim() ||
    $('meta[property="article:author"]').attr('content')?.trim() ||
    $('[rel="author"]').first().text().trim() ||
    undefined;

  const publishDate =
    $('meta[property="article:published_time"]').attr('content')?.trim() ||
    $('time[datetime]').first().attr('datetime')?.trim() ||
    $('meta[name="publish_date"]').attr('content')?.trim() ||
    undefined;

  const canonicalUrl =
    $('link[rel="canonical"]').attr('href')?.trim() ||
    $('meta[property="og:url"]').attr('content')?.trim() ||
    targetUrl;

  const ogImage =
    $('meta[property="og:image"]').attr('content')?.trim() ||
    $('meta[name="twitter:image"]').attr('content')?.trim() ||
    undefined;

  // 2. Structured Headings extraction
  const headings: Array<{ level: number; text: string; id: string }> = [];
  $('h1, h2, h3, h4').each((_, el) => {
    const tagName = el.tagName.toLowerCase();
    const level = parseInt(tagName.replace('h', ''), 10);
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    const id = $(el).attr('id') || text.toLowerCase().replace(/[^\w]+/g, '-').slice(0, 40);
    if (text && text.length > 1) {
      headings.push({ level, text, id });
    }
  });

  // 3. Links extraction
  const internalLinks = new Set<string>();
  const externalLinks = new Set<string>();

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')?.trim();
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }
    try {
      const resolved = new URL(href, targetUrl).href;
      if (resolved.includes(hostname)) {
        internalLinks.add(resolved);
      } else {
        externalLinks.add(resolved);
      }
    } catch {
      // ignore invalid URL
    }
  });

  // 4. Markdown extraction from main content container or body
  const mainSelector = $('main, article, [role="main"], #content, .content, .post-content').first();
  const contentRoot = mainSelector.length > 0 ? mainSelector : $('body');

  const markdown = htmlToMarkdown($, contentRoot);

  // 5. Plain text & Word count
  const plainText = markdown
    .replace(/[#*`_~\[\]\(\)>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = plainText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 220));

  return {
    url: targetUrl,
    title,
    description,
    author,
    publishDate,
    canonicalUrl,
    ogImage,
    wordCount,
    readTimeMinutes,
    headings,
    markdown,
    plainText: plainText.slice(0, 5000), // snippet for preview
    links: {
      internal: Array.from(internalLinks).slice(0, 50),
      external: Array.from(externalLinks).slice(0, 50),
    },
    scrapedAt: new Date().toISOString(),
    crawlMode,
  };
}
