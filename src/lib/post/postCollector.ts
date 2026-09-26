import { crawlWebsiteContent } from '@/lib/scraper/webContentCrawler';
import { refineWebContentHeuristic } from '@/lib/scraper/contentRefiner';
import { scraperCache } from '@/lib/cache/scraperCache';
import type { CollectedGithub, CollectedSource } from './postTypes';

const BLOCKED_HOST_RE = /^(localhost|.*\.localhost|.*\.local|.*\.internal|metadata\.google\.internal)$/i;
const BLOCKED_IP_RE = /^(127\.|10\.|192\.168\.|169\.254\.|0\.0\.0\.0|::1|fc00:|fe80:)/i;
const PRIVATE_172_RE = /^172\.(1[6-9]|2\d|3[01])\./;

/** Rejects non-http(s) URLs and local/private targets (basic SSRF guard). */
export function assertSafeHttpUrl(raw: string, label: string): string {
  let parsed: URL;
  try {
    const withProto = /^https?:\/\//i.test(raw.trim()) ? raw.trim() : `https://${raw.trim()}`;
    parsed = new URL(withProto);
  } catch {
    throw new Error(`${label} is not a valid URL.`);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`${label} must start with http(s).`);
  }
  const host = parsed.hostname.toLowerCase();
  if (
    BLOCKED_HOST_RE.test(host) ||
    BLOCKED_IP_RE.test(host) ||
    PRIVATE_172_RE.test(host) ||
    host === '[::1]'
  ) {
    throw new Error(`${label} points to a private/local address and cannot be fetched.`);
  }
  return parsed.href;
}

export function parseGithubRepo(raw: string): { owner: string; repo: string } | null {
  try {
    const withProto = /^https?:\/\//i.test(raw.trim()) ? raw.trim() : `https://${raw.trim()}`;
    const parsed = new URL(withProto);
    if (parsed.hostname.toLowerCase() !== 'github.com') return null;
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1].replace(/\.git$/, '') };
  } catch {
    return null;
  }
}

async function fetchJson(url: string, timeoutMs = 12000, headers: Record<string, string> = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'Enricher-Post-Studio', ...headers },
    });
    if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
    return (await res.json()) as Record<string, unknown>;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchText(url: string, timeoutMs = 12000, headers: Record<string, string> = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Enricher-Post-Studio', ...headers },
    });
    if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

function cleanExcerpt(text: string, maxChars = 900): string {
  return text
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/[#>*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxChars);
}

async function collectGithub(repoUrl: string): Promise<CollectedGithub | null> {
  const parsed = parseGithubRepo(repoUrl);
  if (!parsed) throw new Error('GitHub URL must look like https://github.com/owner/repo.');
  const { owner, repo } = parsed;

  const [meta, readmeRaw, languages] = await Promise.all([
    fetchJson(`https://api.github.com/repos/${owner}/${repo}`),
    fetchText(`https://api.github.com/repos/${owner}/${repo}/readme`, 12000, {
      Accept: 'application/vnd.github.raw',
    }).catch(() => ''),
    fetchJson(`https://api.github.com/repos/${owner}/${repo}/languages`).catch(() => ({})),
  ]);

  const topics = Array.isArray(meta.topics) ? (meta.topics as string[]).slice(0, 10) : [];
  const langNames = Object.keys(languages as Record<string, number>).slice(0, 6);

  return {
    repoUrl: `https://github.com/${owner}/${repo}`,
    owner,
    repo,
    name: String(meta.full_name || `${owner}/${repo}`),
    description: String(meta.description || ''),
    stars: Number(meta.stargazers_count || 0),
    forks: Number(meta.forks_count || 0),
    language: String(meta.language || langNames[0] || ''),
    languages: langNames,
    topics,
    license: (meta.license as { spdx_id?: string } | null)?.spdx_id || undefined,
    readmeExcerpt: cleanExcerpt(readmeRaw || String(meta.description || '')),
  };
}

export async function collectPostSource(params: {
  websiteUrl: string;
  githubUrl?: string;
}): Promise<CollectedSource> {
  const safeUrl = assertSafeHttpUrl(params.websiteUrl, 'Website URL');
  const githubInput = params.githubUrl?.trim() || '';

  const cacheKey = scraperCache.generateKey('post-collect', { url: safeUrl, gh: githubInput });
  return scraperCache.dedupe(cacheKey, async () => {
    const crawled = await crawlWebsiteContent({ url: safeUrl, renderJs: true, timeoutMs: 30000 });
    const refined = refineWebContentHeuristic({
      markdown: crawled.markdown,
      title: crawled.title,
      url: crawled.url,
      headings: crawled.headings,
      wordCount: crawled.wordCount,
    });

    let github: CollectedGithub | null = null;
    if (githubInput) {
      try {
        github = await collectGithub(githubInput);
      } catch (err) {
        throw new Error(
          `GitHub lookup failed: ${err instanceof Error ? err.message : 'unknown error'}`
        );
      }
    }

    const u = encodeURIComponent(crawled.url);
    return {
      site: {
        url: crawled.url,
        title: refined.title || crawled.title,
        description: crawled.description || refined.executiveSummary.slice(0, 220),
        valueProposition: refined.valueProposition,
        executiveSummary: refined.executiveSummary,
        coreOfferings: refined.coreOfferings.slice(0, 8),
        targetAudience: refined.targetAudience,
        industrySector: refined.industrySector,
        technologySignals: refined.technologySignals.slice(0, 10),
        keyTakeaways: refined.keyTakeaways.slice(0, 6),
        headings: crawled.headings.slice(0, 12).map((h) => h.text),
        stats: {
          wordCount: crawled.wordCount,
          headings: crawled.headings.length,
          links: crawled.links.internal.length + crawled.links.external.length,
        },
        links: {
          internal: crawled.links.internal.slice(0, 10),
          external: crawled.links.external.slice(0, 10),
        },
        ogImage: crawled.ogImage,
        screenshotDesktopUrl: `/api/post-studio/screenshot?url=${u}&viewport=desktop`,
        screenshotMobileUrl: `/api/post-studio/screenshot?url=${u}&viewport=mobile`,
      },
      github,
      collectedAt: new Date().toISOString(),
    };
  }, 10 * 60 * 1000);
}
