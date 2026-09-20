/**
 * ENRICHER Core: Google SERP & Search Intelligence Engine Type Definitions
 * 
 * Enterprise-grade Google Search Engine Results Page (SERP) schema capturing:
 * - Organic results with sitelinks & ranking position
 * - Paid sponsored search ads (PPC competitive intelligence)
 * - Google AI Mode & AI Overviews (Generative Engine Optimization / GEO)
 * - People Also Ask (PAA) Q&A accordions
 * - Related queries & search suggestions
 * - Product shopping ads & pricing
 * - Chained business leads & DNS MX verified corporate emails
 * - SEO tools full-page markdown content
 */

export interface GoogleSearchQueryOptions {
  queries: string[];
  countryCode?: string; // 'us', 'uk', 'ca', 'in', 'de', 'fr', 'au', etc.
  languageCode?: string; // 'en', 'es', 'fr', 'de', etc.
  locationUule?: string; // Google UULE canonical location string
  maxPagesPerQuery?: number; // 1 to 10 pages
  resultsPerPage?: number; // 10 to 100
  mobileResults?: boolean;
  includePaidAds?: boolean;
  includeAiOverview?: boolean;
  includePeopleAlsoAsk?: boolean;
  includeRelatedQueries?: boolean;
  enrichLeads?: boolean; // downstream corporate email discovery
  scrapeWebsiteMarkdown?: boolean; // convert ranking pages to clean markdown
}

export interface GoogleSitelinkItem {
  title: string;
  url: string;
  description?: string;
}

export interface GoogleOrganicResult {
  position: number;
  title: string;
  url: string;
  displayedUrl: string;
  description: string;
  emphasizedKeywords?: string[];
  sitelinks?: GoogleSitelinkItem[];
  productPriceSnippet?: string;
  ratingScore?: number;
  reviewsCount?: number;
  datePublished?: string;
  markdownContent?: string;
  // Chained Lead Enrichment
  leadEmail?: string;
  leadPhone?: string;
  leadMxVerified?: boolean;
  type: 'organic';
}

export interface GooglePaidResult {
  position: number;
  headline: string;
  url: string;
  displayedUrl: string;
  description: string;
  sitelinks?: GoogleSitelinkItem[];
  type: 'paid';
}

export interface GoogleAiCitationSource {
  title: string;
  url: string;
  description?: string;
  imageUrl?: string;
  domain?: string;
}

export interface GoogleAiModeResult {
  engine: string; // 'Google AI Mode' | 'Google AI Overview'
  provider: 'Google';
  text: string;
  sources: GoogleAiCitationSource[];
  queryFanOut?: string[];
}

export interface GooglePeopleAlsoAskItem {
  question: string;
  answer?: string;
  sourceTitle?: string;
  sourceUrl?: string;
}

export interface GoogleRelatedQuery {
  title: string;
  url: string;
}

export interface GoogleProductShoppingAd {
  position: number;
  title: string;
  price: string;
  merchant: string;
  productUrl: string;
  imageUrl?: string;
  rating?: number;
}

export interface GoogleSearchResultPage {
  searchQuery: {
    term: string;
    url: string;
    device: 'DESKTOP' | 'MOBILE';
    page: number;
    type: 'SEARCH';
    domain: string;
    countryCode: string;
    languageCode: string;
    locationUule?: string | null;
  };
  organicResults: GoogleOrganicResult[];
  paidResults: GooglePaidResult[];
  paidProducts: GoogleProductShoppingAd[];
  aiModeResult?: GoogleAiModeResult | null;
  peopleAlsoAsk: GooglePeopleAlsoAskItem[];
  relatedQueries: GoogleRelatedQuery[];
  totalResultsCountEstimate?: string;
  scrapedAt: string;
}

export interface GoogleSearchExecutionReport {
  success: boolean;
  summary: {
    queriesCount: number;
    totalPagesScraped: number;
    totalOrganicFound: number;
    totalPaidAdsFound: number;
    totalAiOverviewsFound: number;
    totalPaaQuestionsFound: number;
    totalLeadsEnriched: number;
    executionTimeMs: number;
  };
  results: GoogleSearchResultPage[];
  flattenedOrganic: GoogleOrganicResult[];
  flattenedPaid: GooglePaidResult[];
  error?: string;
}
