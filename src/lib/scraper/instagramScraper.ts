import * as cheerio from 'cheerio';
import { launchStealthBrowser } from './browser';

export interface InstagramPostItem {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption: string;
  hashtags: string[];
  mentions: string[];
  type: 'post' | 'reel' | 'video';
  timestamp?: string;
  likesEstimate?: number;
  commentsEstimate?: number;
}

export interface InstagramProfileResult {
  username: string;
  fullName: string;
  biography: string;
  externalUrl?: string;
  profilePicUrl?: string;
  isVerified: boolean;
  isPrivate: boolean;
  followersCount: number;
  followersFormatted: string;
  followingCount: number;
  followingFormatted: string;
  postsCount: number;
  category?: string;
  posts: InstagramPostItem[];
  hashtags: string[];
  scrapedAt: string;
  sourceOrigin: 'stealth_instagram_public';
}

/**
 * Parses shorthand numbers like "12.4M", "850K", "1,240" into numeric values.
 */
function parseFollowerNumber(str: string): number {
  if (!str) return 0;
  const clean = str.replace(/,/g, '').trim();
  const lower = clean.toLowerCase();

  if (lower.endsWith('m')) {
    const num = parseFloat(lower.slice(0, -1));
    return Math.round(num * 1_000_000);
  }
  if (lower.endsWith('k')) {
    const num = parseFloat(lower.slice(0, -1));
    return Math.round(num * 1_000);
  }
  if (lower.endsWith('b')) {
    const num = parseFloat(lower.slice(0, -1));
    return Math.round(num * 1_000_000_000);
  }

  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Normalizes username from a URL or handle string.
 */
export function cleanInstagramUsername(input: string): string {
  let u = input.trim();
  // Remove protocol / domains
  u = u.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '');
  // Remove trailing slashes and query parameters
  u = u.split('?')[0].split('/')[0];
  // Remove leading @
  u = u.replace(/^@+/, '').trim();
  return u;
}

/**
 * Scrapes public Instagram profile data and recent public posts using stealth Playwright.
 */
export async function scrapeInstagramProfile(input: string): Promise<InstagramProfileResult> {
  const username = cleanInstagramUsername(input);
  if (!username) {
    throw new Error('Please provide a valid Instagram username or profile URL.');
  }

  const profileUrl = `https://www.instagram.com/${username}/`;
  let html = '';

  const { page } = await launchStealthBrowser();
  try {
    // Navigate with stealth browser
    await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
    // Allow brief time for client hydration or meta tag injections
    await page.waitForTimeout(2000);

    html = await page.content();
  } catch (err: any) {
    console.warn(`[instagramScraper] Browser navigation warning for ${username}: ${err.message}`);
    // If Playwright timed out, attempt fast fetch for server-rendered meta tags
    if (!html) {
      const resp = await fetch(profileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 289.0.0.25.49',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      html = await resp.text();
    }
  } finally {
    await page.close().catch(() => {});
  }

  if (!html) {
    throw new Error(`Could not access Instagram profile for @${username}.`);
  }

  const $ = cheerio.load(html);

  // 1. Extract OpenGraph Meta Tags (Instagram renders these consistently even when authwalls trigger)
  const ogTitle = $('meta[property="og:title"]').attr('content')?.trim() || '';
  const ogDesc = $('meta[property="og:description"]').attr('content')?.trim() || '';
  const ogImage = $('meta[property="og:image"]').attr('content')?.trim() || '';

  // Extract Full Name from title (format: "Full Name (@username) • Instagram photos and videos")
  let fullName = username;
  const nameMatch = ogTitle.match(/^(.*?)\s*\(@[a-zA-Z0-9._-]+\)/);
  if (nameMatch && nameMatch[1]) {
    fullName = nameMatch[1].trim();
  }

  // 2. Extract metrics from description:
  // Format: "12M Followers, 540 Following, 1,200 Posts - See Instagram photos and videos from ..."
  let followersCount = 0;
  let followersFormatted = '0';
  let followingCount = 0;
  let followingFormatted = '0';
  let postsCount = 0;

  const descMetricsMatch = ogDesc.match(/([0-9.,KMkm]+)\s*Followers,\s*([0-9.,KMkm]+)\s*Following,\s*([0-9.,KMkm]+)\s*Posts/i);
  if (descMetricsMatch) {
    followersFormatted = descMetricsMatch[1];
    followersCount = parseFollowerNumber(descMetricsMatch[1]);
    followingFormatted = descMetricsMatch[2];
    followingCount = parseFollowerNumber(descMetricsMatch[2]);
    postsCount = parseFollowerNumber(descMetricsMatch[3]);
  }

  // 3. Extract Biography
  let biography = '';
  // Bio is often after the hyphen in og:description or in schema
  const bioMatch = ogDesc.match(/Posts\s*-\s*(?:See Instagram photos and videos from [^:]+:\s*“?|“)([\s\S]*?)”?$/i);
  if (bioMatch && bioMatch[1]) {
    biography = bioMatch[1].replace(/”$/, '').trim();
  }

  // 4. Schema.org JSON-LD extraction fallback / enrichment
  let isVerified = false;
  let isPrivate = false;
  let externalUrl: string | undefined;

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '{}');
      if (data['@type'] === 'ProfilePage' || data['@type'] === 'Person') {
        if (data.mainEntity) {
          if (data.mainEntity.name && !fullName) fullName = data.mainEntity.name;
          if (data.mainEntity.description && !biography) biography = data.mainEntity.description;
          if (data.mainEntity.url) externalUrl = data.mainEntity.url;
        }
      }
    } catch {
      // ignore JSON parse errors
    }
  });

  // Check verified badge in DOM
  if ($('[aria-label="Verified"], [title="Verified"], svg[aria-label*="Verified"]').length > 0) {
    isVerified = true;
  }

  // 5. Extract Recent Public Posts
  const posts: InstagramPostItem[] = [];
  const allHashtags = new Set<string>();

  // Look for post links: /p/<id>/ or /reel/<id>/
  $('a[href*="/p/"], a[href*="/reel/"]').each((idx, el) => {
    if (posts.length >= 12) return; // Cap at 12 recent posts

    const href = $(el).attr('href') || '';
    const isReel = href.includes('/reel/');
    const postIdMatch = href.match(/\/(p|reel)\/([a-zA-Z0-9_-]+)/);
    const postId = postIdMatch ? postIdMatch[2] : `post-${idx}`;
    const fullPostUrl = `https://www.instagram.com/${isReel ? 'reel' : 'p'}/${postId}/`;

    const img = $(el).find('img').first();
    const thumbnailUrl = img.attr('src') || '';
    const caption = img.attr('alt')?.trim() || '';

    // Extract hashtags from caption
    const postTags: string[] = [];
    const hashMatches = caption.match(/#[a-zA-Z0-9_\u0900-\u097F]+/g);
    if (hashMatches) {
      hashMatches.forEach((tag) => {
        postTags.push(tag);
        allHashtags.add(tag);
      });
    }

    // Extract mentions from caption
    const postMentions: string[] = [];
    const mentionMatches = caption.match(/@[a-zA-Z0-9._-]+/g);
    if (mentionMatches) {
      mentionMatches.forEach((m) => postMentions.push(m));
    }

    if (postId && !posts.some((p) => p.id === postId)) {
      posts.push({
        id: postId,
        url: fullPostUrl,
        thumbnailUrl,
        caption: caption.slice(0, 300),
        hashtags: postTags,
        mentions: postMentions,
        type: isReel ? 'reel' : 'post',
      });
    }
  });

  // Extract hashtags from biography as well
  const bioHashMatches = biography.match(/#[a-zA-Z0-9_\u0900-\u097F]+/g);
  if (bioHashMatches) {
    bioHashMatches.forEach((tag) => allHashtags.add(tag));
  }

  return {
    username,
    fullName: fullName || username,
    biography: biography || `Instagram creator/business profile for @${username}`,
    externalUrl,
    profilePicUrl: ogImage || undefined,
    isVerified,
    isPrivate,
    followersCount,
    followersFormatted: followersFormatted !== '0' ? followersFormatted : followersCount.toLocaleString(),
    followingCount,
    followingFormatted: followingFormatted !== '0' ? followingFormatted : followingCount.toLocaleString(),
    postsCount,
    category: $('meta[property="og:type"]').attr('content') || 'Public Profile',
    posts,
    hashtags: Array.from(allHashtags).slice(0, 25),
    scrapedAt: new Date().toISOString(),
    sourceOrigin: 'stealth_instagram_public',
  };
}
