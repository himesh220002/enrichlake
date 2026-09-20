import { crawlWebsiteContent } from './webContentCrawler';
import { refineWebContentHeuristic, RefinedContentData } from './contentRefiner';
import { scrapeFacebookPage, FacebookPageResult, cleanFacebookSlug } from './facebookScraper';
import { scrapeMetaAdLibrary, MetaAdLibraryResult, cleanAdLibraryQuery } from './metaAdScraper';
import { scrapeInstagramProfile, InstagramProfileResult, cleanInstagramUsername } from './instagramScraper';
import { scrapeLinkedInCompany, LinkedInCompanyResult } from './linkedinScraper';

export interface OmnichannelDossier360 {
  target: string;
  brandName: string;
  domain: string;
  digitalPresenceScore: number; // 0 - 100
  channelsDetected: string[];
  totalAudienceReach: string;
  totalAudienceReachNum: number;
  activePaidAdsCount: number;
  adPlatforms: string[];
  unifiedContacts: {
    emails: string[];
    phones: string[];
    locations: string[];
    socialProfiles: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
      website?: string;
    };
  };
  executiveSummary: string;
  valueProposition: string;
  coreOfferings: string[];
  targetAudience: string;
  industrySector: string;
  webIntel?: {
    title: string;
    wordCount: number;
    readTimeMin: number;
    crawlMode: string;
    technologySignals: string[];
    pricingSignals: string[];
  };
  facebookIntel?: {
    pageName: string;
    isVerified: boolean;
    likesCount: number;
    followersCount: number;
    postsCount: number;
    samplePost?: {
      content: string;
      viewsCount?: number;
      likesCount: number;
    };
  };
  metaAdsIntel?: {
    totalActiveAds: number;
    topCreativeHeadline?: string;
    topCreativeCta?: string;
    platforms: string[];
  };
  instagramIntel?: {
    username: string;
    followersFormatted: string;
    isVerified: boolean;
    postsCount: number;
  };
  linkedinIntel?: {
    companyName: string;
    companySize?: string;
    headquarters?: string;
    industry?: string;
  };
  strategicTakeaways: string[];
  sweptAt: string;
}

/**
 * Normalizes input brand or domain.
 */
export function extractBrandAndDomain(input: string): { brandName: string; domain: string } {
  let raw = input.trim();
  let domain = '';
  let brandName = '';

  if (/^https?:\/\//i.test(raw)) {
    try {
      const u = new URL(raw);
      domain = u.hostname.toLowerCase().replace(/^www\./, '');
    } catch {
      domain = raw.replace(/^https?:\/\//i, '').split('/')[0];
    }
  } else if (raw.includes('.') && !raw.includes(' ')) {
    domain = raw.toLowerCase();
  }

  if (domain) {
    const parts = domain.split('.');
    brandName = parts[0];
  } else {
    brandName = raw.replace(/\s+/g, '');
    domain = `${brandName.toLowerCase()}.com`;
  }

  // Capitalize brandName for presentation
  const displayName = brandName.charAt(0).toUpperCase() + brandName.slice(1);
  return { brandName: displayName, domain };
}

/**
 * Runs parallel multi-platform sweep fusing web content, social metrics,
 * and Meta ad creatives into a 360° lead dossier.
 */
export async function sweepOmnichannel360(targetInput: string): Promise<OmnichannelDossier360> {
  const { brandName, domain } = extractBrandAndDomain(targetInput);
  const slug = cleanFacebookSlug(targetInput) || brandName.toLowerCase();
  const query = cleanAdLibraryQuery(targetInput) || brandName.toLowerCase();
  const igUser = cleanInstagramUsername(targetInput) || brandName.toLowerCase();

  // Execute parallel platform sweeps with individual error containment
  const [webResult, fbResult, metaAdsResult, igResult, liResult] = await Promise.all([
    // 1. Web Content Crawler
    crawlWebsiteContent({
      url: `https://${domain}`,
      renderJs: true,
      timeoutMs: 12000,
    }).catch((err) => {
      console.warn(`[360 Sweep] Web crawl notice for ${domain}:`, err.message);
      return null;
    }),

    // 2. Facebook Page Intel
    scrapeFacebookPage(slug).catch((err) => {
      console.warn(`[360 Sweep] Facebook scrape notice for ${slug}:`, err.message);
      return null;
    }),

    // 3. Meta Ad Library
    scrapeMetaAdLibrary(query).catch((err) => {
      console.warn(`[360 Sweep] Meta ads scrape notice for ${query}:`, err.message);
      return null;
    }),

    // 4. Instagram Profile
    scrapeInstagramProfile(igUser).catch((err) => {
      console.warn(`[360 Sweep] Instagram scrape notice for ${igUser}:`, err.message);
      return null;
    }),

    // 5. LinkedIn Company
    scrapeLinkedInCompany(slug).catch((err) => {
      console.warn(`[360 Sweep] LinkedIn scrape notice for ${slug}:`, err.message);
      return null;
    }),
  ]);

  // Refine web content if available
  const refinedWeb: RefinedContentData = refineWebContentHeuristic({
    markdown: webResult?.markdown || '',
    title: webResult?.title || brandName,
    url: `https://${domain}`,
    headings: webResult?.headings || [],
    wordCount: webResult?.wordCount || 0,
  });

  // Calculate Digital Presence Score (0 - 100)
  let score = 30; // Baseline for domain existence
  const channels: string[] = ['web'];

  if (webResult && webResult.wordCount > 300) score += 15;
  if (fbResult) {
    channels.push('facebook');
    if (fbResult.isVerified) score += 15;
    else score += 8;
  }
  if (metaAdsResult && metaAdsResult.totalActiveAds > 0) {
    channels.push('meta_ads');
    score += 15; // High buying power / active ad spend signal
  }
  if (igResult) {
    channels.push('instagram');
    if (igResult.isVerified || igResult.followersCount > 50000) score += 15;
    else score += 8;
  }
  if (liResult) {
    channels.push('linkedin');
    score += 10;
  }

  const finalScore = Math.min(100, score);

  // Compute Total Audience Reach
  let reachNum = 0;
  if (fbResult?.followersCount) reachNum += fbResult.followersCount;
  if (igResult?.followersCount) reachNum += igResult.followersCount;
  let formattedReach = `${(reachNum / 1_000_000).toFixed(1)}M+`;
  if (reachNum < 1_000_000 && reachNum > 1000) formattedReach = `${(reachNum / 1_000).toFixed(0)}K+`;
  else if (reachNum === 0) formattedReach = 'Digital Direct';

  // Merge Unified Deduplicated Contacts
  const allEmails = Array.from(
    new Set([
      ...(refinedWeb.contacts.emails || []),
      ...(fbResult?.email ? [fbResult.email] : []),
    ])
  );

  const allPhones = Array.from(
    new Set([
      ...(refinedWeb.contacts.phones || []),
      ...(fbResult?.phone ? [fbResult.phone] : []),
    ])
  );

  const allLocations = Array.from(
    new Set([
      ...(refinedWeb.contacts.locations || []),
      ...(fbResult?.address ? [fbResult.address] : []),
      ...(liResult?.headquarters ? [liResult.headquarters] : []),
    ])
  );

  return {
    target: targetInput,
    brandName,
    domain,
    digitalPresenceScore: finalScore,
    channelsDetected: channels,
    totalAudienceReach: formattedReach,
    totalAudienceReachNum: reachNum,
    activePaidAdsCount: metaAdsResult?.totalActiveAds || 0,
    adPlatforms: metaAdsResult?.platformsDetected || ['facebook', 'instagram'],
    unifiedContacts: {
      emails: allEmails.slice(0, 5),
      phones: allPhones.slice(0, 4),
      locations: allLocations.slice(0, 4),
      socialProfiles: {
        facebook: fbResult?.pageUrl,
        instagram: igResult?.username ? `https://instagram.com/${igResult.username}` : undefined,
        linkedin: liResult?.linkedinUrl,
        website: `https://${domain}`,
      },
    },
    executiveSummary:
      refinedWeb.executiveSummary ||
      fbResult?.about ||
      `${brandName} is a recognized brand with an omni-channel presence across digital, social, and paid advertising channels.`,
    valueProposition:
      refinedWeb.valueProposition ||
      liResult?.tagline ||
      `Delivering customer solutions and high-performing digital services.`,
    coreOfferings: refinedWeb.coreOfferings,
    targetAudience: refinedWeb.targetAudience,
    industrySector: liResult?.industry || refinedWeb.industrySector || fbResult?.category || 'Commercial Brand',
    webIntel: webResult
      ? {
          title: webResult.title,
          wordCount: webResult.wordCount,
          readTimeMin: webResult.readTimeMinutes,
          crawlMode: webResult.crawlMode,
          technologySignals: refinedWeb.technologySignals,
          pricingSignals: refinedWeb.pricingSignals,
        }
      : undefined,
    facebookIntel: fbResult
      ? {
          pageName: fbResult.pageName,
          isVerified: fbResult.isVerified,
          likesCount: fbResult.likesCount,
          followersCount: fbResult.followersCount,
          postsCount: fbResult.posts.length,
          samplePost: fbResult.posts[0]
            ? {
                content: fbResult.posts[0].content,
                viewsCount: fbResult.posts[0].viewsCount,
                likesCount: fbResult.posts[0].likesCount,
              }
            : undefined,
        }
      : undefined,
    metaAdsIntel: metaAdsResult
      ? {
          totalActiveAds: metaAdsResult.totalActiveAds,
          topCreativeHeadline: metaAdsResult.ads[0]?.adCreative?.headline,
          topCreativeCta: metaAdsResult.ads[0]?.adCreative?.ctaText,
          platforms: metaAdsResult.platformsDetected,
        }
      : undefined,
    instagramIntel: igResult
      ? {
          username: igResult.username,
          followersFormatted: igResult.followersFormatted,
          isVerified: igResult.isVerified,
          postsCount: igResult.postsCount,
        }
      : undefined,
    linkedinIntel: liResult
      ? {
          companyName: liResult.companyName,
          companySize: liResult.companySize,
          headquarters: liResult.headquarters,
          industry: liResult.industry,
        }
      : undefined,
    strategicTakeaways: [
      `Overall Digital Presence Score of ${finalScore}/100 with ${channels.length} active digital and social touchpoints.`,
      metaAdsResult?.totalActiveAds
        ? `Actively running ~${metaAdsResult.totalActiveAds} ad campaigns across Meta Ad Library (${metaAdsResult.platformsDetected?.join(', ')}). High active commercial intent.`
        : `Organic presence established across web and social channels.`,
      fbResult?.isVerified || igResult?.isVerified
        ? `Official verified brand credibility across Meta platforms.`
        : `Established audience footprint totaling ${formattedReach}.`,
      allEmails.length > 0 || allPhones.length > 0
        ? `Verified direct outreach channels available: ${[...allEmails, ...allPhones].slice(0, 2).join(', ')}.`
        : `Recommend omnichannel outreach via LinkedIn and official web channels.`,
    ],
    sweptAt: new Date().toISOString(),
  };
}
