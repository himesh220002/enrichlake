/**
 * ENRICHER Core Enterprise Google Maps Scraper Type Definitions
 * In-House High-Scale Spatial Grid & Contact Extraction Engine
 */

export interface GoogleMapsEmailVerification {
  email: string;
  result: 'ok' | 'invalid' | 'catch_all' | 'unknown';
  subResult?: string;
  quality: 'good' | 'moderate' | 'low';
  isDeliverable: boolean;
  hasMx: boolean;
  freeProvider: boolean;
  roleAccount: boolean;
  source: 'website_direct' | 'website_contact_page' | 'schema_org' | 'domain_mx_verified' | 'maps_profile';
}

export interface GoogleMapsReviewItem {
  reviewId?: string;
  name: string;
  text?: string;
  publishAt?: string;
  publishedAtDate?: string;
  likesCount?: number;
  stars: number;
  isLocalGuide?: boolean;
  reviewerNumberOfReviews?: number;
  reviewerUrl?: string;
  reviewerPhotoUrl?: string;
  responseFromOwnerDate?: string;
  responseFromOwnerText?: string;
}

export interface GoogleMapsOpeningHour {
  day: string;
  hours: string;
}

export interface GoogleMapsAdditionalInfo {
  serviceOptions?: string[];
  accessibility?: string[];
  offerings?: string[];
  diningOptions?: string[];
  amenities?: string[];
  atmosphere?: string[];
  planning?: string[];
  payments?: string[];
  children?: string[];
  [category: string]: any;
}

export interface GoogleMapsEnrichedContacts {
  emails: string[];
  phones: string[];
  socialProfiles: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
    pinterest?: string;
  };
  contactPageUrl?: string;
  domain?: string;
}

export interface GoogleMapsBusinessLead {
  fullName: string;
  jobTitle: string;
  department?: string;
  email?: string;
  phone?: string;
  linkedinProfile?: string;
  seniority?: string;
  verificationStatus?: 'verified' | 'unverified' | 'catch_all';
}

export interface GoogleMapsPlaceRecord {
  placeId: string;
  cid?: string;
  fid?: string;
  title: string;
  subTitle?: string;
  categoryName?: string;
  categories: string[];
  description?: string;
  priceBracket?: string; // '$', '$$', '$$$', '$10-20'
  address: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  postalCode?: string;
  state?: string;
  countryCode?: string;
  plusCode?: string;
  location: {
    lat: number;
    lng: number;
  };
  phone?: string;
  phoneUnformatted?: string;
  website?: string;
  menu?: string;
  reserveTableUrl?: string;
  totalScore?: number; // e.g. 4.7
  reviewsCount?: number;
  reviewsDistribution?: {
    oneStar: number;
    twoStar: number;
    threeStar: number;
    fourStar: number;
    fiveStar: number;
  };
  reviewsTags?: Array<{ title: string; count: number }>;
  reviews?: GoogleMapsReviewItem[];
  imagesCount?: number;
  imageUrl?: string;
  imageUrls?: string[];
  openingHours?: GoogleMapsOpeningHour[];
  wasOpenAtScrapeTime?: boolean;
  popularTimesSummary?: string;
  additionalInfo?: GoogleMapsAdditionalInfo;
  claimThisBusiness?: boolean;
  permanentlyClosed?: boolean;
  temporarilyClosed?: boolean;
  url: string;
  scrapedAt: string;
  // Web Presence & Prospecting Opportunity
  hasWebsite?: boolean;
  webDevOpportunity?: boolean;
  // Downstream Enrichments
  email?: string;
  emails?: string[];
  emailVerification?: GoogleMapsEmailVerification;
  companyContacts?: GoogleMapsEnrichedContacts;
  businessLeads?: GoogleMapsBusinessLead[];
}

export interface GoogleMapsScrapeQueryOptions {
  searchQuery: string;
  location?: string;
  radiusKm?: number;
  maxResults?: number;
  scrapePlaceDetailPage?: boolean;
  enrichWebsites?: boolean;
  categoriesFilter?: string[];
}

export interface GoogleMapsScrapeResultReport {
  success: boolean;
  query: {
    searchQuery: string;
    location: string;
    radiusKm: number;
    tilesSearched: number;
  };
  stats: {
    totalScraped: number;
    uniquePlaces: number;
    withWebsite: number;
    withPhone: number;
    withEmail: number;
    withHours: number;
    executionTimeMs: number;
  };
  places: GoogleMapsPlaceRecord[];
}
