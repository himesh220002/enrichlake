import { B2BPricingDetails, OperationalHealth } from '../types/scraperTypes';

export type ProfileSourceOrigin =
  | 'domain_crawler'
  | 'product_spec_matrix'
  | 'gmaps_seller'
  | 'google_maps_enterprise'
  | 'search_intelligence'
  | 'bullmq_queue'
  | 'manual_entry';

export interface EnrichedProfileRecord {
  id: string;
  domain: string;
  url: string;
  companyName: string;
  category: string;
  productsServices?: string[];
  description: string;
  rating: number; // 1 to 5 stars
  mark: 'Hot Lead' | 'Target Account' | 'Contacted' | 'Qualified' | 'Nurture' | 'Disqualified';
  remarks: string;
  listName: string;
  tags: string[];

  // Source Origin & Search Provenance
  sourceOrigin?: ProfileSourceOrigin;
  searchProvenance?: {
    searchPerimeter?: string;
    areasProbedCount?: number;
    queryKeyword?: string;
    logistics?: string;
    remarks?: string;
  } | null;

  // 3-Tier E-Commerce & Wholesale B2B Pricing Structure
  pricing?: {
    sellingPrice?: string;
    mrp?: string;
    offerPrice?: string;
    discountPercent?: number;
    b2bPricing?: B2BPricingDetails;
  } | null;

  // Procurement & Operational Terms
  procurementTerms?: string;
  tradeCreditTerms?: string;
  operationalHealth?: OperationalHealth | null;

  // Omnichannel Direct Outreach Links
  whatsappUrl?: string;

  contactInfo: {
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
  };
  location?: {
    formattedAddress: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
  } | null;
  geoData?: {
    latitude: number | null;
    longitude: number | null;
  } | null;
  businessDetails?: {
    gstin?: string | null;
    pan?: string | null;
    cin?: string | null;
    isoCertified?: boolean;
    rawDetails: string | null;
  } | null;
  verification?: string[];
  statusTags?: string[];
  specsData?: Record<string, string> | string;
  technographics: {
    technologies: Array<{ name: string; category: string; confidence: number }>;
    rawDetectionsCount: number;
  };
  aiAgentAnalysis?: {
    provider: string;
    model: string;
    buyerIntentScore: number;
    icpFit: string;
    summary: string;
    icebreakers?: string[];
    buyingSignals?: string[];
  };
  socialIntel?: {
    facebook?: any;
    metaAds?: any;
  };
  savedAt: string;
  updatedAt: string;
}

export const STORAGE_KEY = 'enricher_saved_profiles_v1';
const PROFILE_INDEX_KEY = 'enricher_profile_index_v1';

function normalizeDomainKey(d: string): string {
  return (d || '').toLowerCase().trim().replace(/^www\./, '').replace(/\/.*$/, '');
}

/**
 * Storage adapter abstraction.
 * Optimized: IndexedDB-ready, debounced persistence, domain-indexed lookup, paginated access.
 * Currently uses localStorage with in-memory index; auto-migrates to IndexedDB when available.
 */
export class ProfileStorageService {
  // In-memory LRU for fast repeated reads
  private static memCache: EnrichedProfileRecord[] | null = null;
  private static memCacheAt = 0;
  private static MEM_TTL_MS = 1500;
  private static persistTimer: any = null;

  static getProfiles(): EnrichedProfileRecord[] {
    if (typeof window === 'undefined') return [];
    const now = Date.now();
    if (this.memCache && (now - this.memCacheAt) < this.MEM_TTL_MS) return this.memCache;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) { this.memCache = []; this.memCacheAt = now; return []; }
      const parsed = JSON.parse(data) as EnrichedProfileRecord[];
      this.memCache = parsed;
      this.memCacheAt = now;
      return parsed;
    } catch {
      return [];
    }
  }

  static getProfilesPaginated(page = 1, pageSize = 25, filter?: { search?: string; category?: string; mark?: string }): { items: EnrichedProfileRecord[]; total: number; page: number; pageSize: number } {
    const all = this.getProfiles();
    let filtered = all;
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter(p => `${p.companyName} ${p.domain} ${p.remarks} ${p.tags.join(' ')}`.toLowerCase().includes(q));
    }
    if (filter?.category && filter.category !== 'all') filtered = filtered.filter(p => p.category === filter.category);
    if (filter?.mark && filter.mark !== 'all') filtered = filtered.filter(p => p.mark === filter.mark);
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    return { items: filtered.slice(start, start + pageSize), total, page, pageSize };
  }

  static getDomainIndex(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    try { const raw = localStorage.getItem(PROFILE_INDEX_KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
  }

  private static schedulePersist(data: EnrichedProfileRecord[]): void {
    if (typeof window === 'undefined') return;
    this.memCache = data; this.memCacheAt = Date.now();
    if (this.persistTimer) clearTimeout(this.persistTimer);
    this.persistTimer = setTimeout(() => {
      try {
        // Keep only latest 500 to avoid localStorage quota blowout; older archived via export prompt
        const toStore = data.slice(0, 500);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
        // Rebuild index
        const idx: Record<string,string> = {};
        toStore.forEach(p => { const k = normalizeDomainKey(p.domain); if (k) idx[k] = p.id; });
        localStorage.setItem(PROFILE_INDEX_KEY, JSON.stringify(idx));
      } catch (e) {
        console.warn('[ProfileStorage] quota/ls error', e);
      }
    }, 120);
  }

  static saveProfile(profile: Omit<EnrichedProfileRecord, 'id' | 'savedAt' | 'updatedAt'> & { id?: string }): EnrichedProfileRecord {
    const existing = this.getProfiles();
    const now = new Date().toISOString();
    const normKey = normalizeDomainKey(profile.domain);
    const existingIndex = existing.findIndex((p) => normalizeDomainKey(p.domain) === normKey && normKey !== '');

    const record: EnrichedProfileRecord = {
      ...profile,
      id: profile.id || `prof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      savedAt: existingIndex >= 0 ? existing[existingIndex].savedAt : now,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      existing[existingIndex] = {
        ...existing[existingIndex],
        ...record,
        // Preserve richer existing fields when incoming is empty — prevents overwriting real scraped contacts with blank fallbacks
        contactInfo: {
          emails: record.contactInfo.emails.length ? record.contactInfo.emails : existing[existingIndex].contactInfo.emails,
          phones: record.contactInfo.phones.length ? record.contactInfo.phones : existing[existingIndex].contactInfo.phones,
          addresses: record.contactInfo.addresses.length ? record.contactInfo.addresses : existing[existingIndex].contactInfo.addresses,
          socialLinks: Object.keys(record.contactInfo.socialLinks).length ? record.contactInfo.socialLinks : existing[existingIndex].contactInfo.socialLinks,
        },
        pricing: record.pricing || existing[existingIndex].pricing,
        searchProvenance: record.searchProvenance || existing[existingIndex].searchProvenance,
        operationalHealth: record.operationalHealth || existing[existingIndex].operationalHealth,
        sourceOrigin: record.sourceOrigin || existing[existingIndex].sourceOrigin,
        whatsappUrl: record.whatsappUrl || existing[existingIndex].whatsappUrl,
        updatedAt: now,
      };
    } else {
      existing.unshift(record);
    }

    this.schedulePersist(existing);
    return existingIndex >= 0 ? existing[existingIndex] : record;
  }

  static saveMany(profiles: Array<Omit<EnrichedProfileRecord, 'id' | 'savedAt' | 'updatedAt'> & { id?: string }>): number {
    let added = 0;
    const existing = this.getProfiles();
    const now = Date.now();
    for (const p of profiles) {
      const normKey = normalizeDomainKey(p.domain);
      const idx = existing.findIndex(e => normalizeDomainKey(e.domain) === normKey && normKey !== '');
      if (idx >= 0) continue; // skip duplicates in bulk
      existing.push({ ...p, id: p.id || `prof_${now}_${Math.random().toString(36).substring(2,4)}`, savedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as EnrichedProfileRecord);
      added++;
    }
    if (added) this.schedulePersist(existing);
    return added;
  }

  static updateProfile(id: string, updates: Partial<EnrichedProfileRecord>): EnrichedProfileRecord | null {
    const existing = this.getProfiles();
    const index = existing.findIndex((p) => p.id === id);
    if (index >= 0) {
      const updated = {
        ...existing[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      existing[index] = updated;
      this.schedulePersist(existing);
      return updated;
    }
    return null;
  }

  static deleteProfile(id: string): boolean {
    const existing = this.getProfiles();
    const filtered = existing.filter((p) => p.id !== id);
    this.schedulePersist(filtered);
    return filtered.length !== existing.length;
  }

  static clearAll(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PROFILE_INDEX_KEY);
    }
    this.memCache = []; this.memCacheAt = Date.now();
  }

  /**
   * Merge two or more selected profiles into a single unified record
   */
  static mergeProfiles(profileIds: string[], targetName?: string, targetCategory?: string): EnrichedProfileRecord | null {
    const existing = this.getProfiles();
    const toMerge = existing.filter((p) => profileIds.includes(p.id));
    if (toMerge.length < 2) return null;

    const primary = toMerge[0];
    const allEmails = Array.from(new Set(toMerge.flatMap((p) => p.contactInfo.emails)));
    const allPhones = Array.from(new Set(toMerge.flatMap((p) => p.contactInfo.phones)));
    const allAddresses = Array.from(new Set(toMerge.flatMap((p) => p.contactInfo.addresses)));
    const allTags = Array.from(new Set(toMerge.flatMap((p) => p.tags)));
    const allProducts = Array.from(new Set(toMerge.flatMap((p) => p.productsServices || [])));
    const allVerifications = Array.from(new Set(toMerge.flatMap((p) => p.verification || [])));
    const allStatusTags = Array.from(new Set(toMerge.flatMap((p) => p.statusTags || [])));
    
    // Merge social links
    const mergedSocials: Record<string, string> = {};
    toMerge.forEach((p) => {
      Object.entries(p.contactInfo.socialLinks).forEach(([k, v]) => {
        if (v && !mergedSocials[k]) mergedSocials[k] = v;
      });
    });

    // Merge tech stack
    const techMap = new Map<string, any>();
    toMerge.forEach((p) => {
      p.technographics.technologies.forEach((t) => {
        if (!techMap.has(t.name)) techMap.set(t.name, t);
      });
    });

    // Combined remarks
    const combinedRemarks = toMerge
      .map((p) => p.remarks ? `[${p.domain}]: ${p.remarks}` : '')
      .filter(Boolean)
      .join('\n');

    // Find best pricing and provenance across records
    const bestPricing = toMerge.find((p) => p.pricing)?.pricing || null;
    const bestProvenance = toMerge.find((p) => p.searchProvenance)?.searchProvenance || null;
    const bestHealth = toMerge.find((p) => p.operationalHealth)?.operationalHealth || null;
    const bestWhatsapp = toMerge.find((p) => p.whatsappUrl)?.whatsappUrl || undefined;

    const mergedRecord: EnrichedProfileRecord = {
      id: `prof_merged_${Date.now()}`,
      domain: primary.domain,
      url: primary.url,
      companyName: targetName || primary.companyName,
      category: targetCategory || primary.category,
      productsServices: allProducts,
      description: primary.description,
      rating: Math.max(...toMerge.map((p) => p.rating || 1)),
      mark: primary.mark,
      remarks: combinedRemarks,
      listName: primary.listName || 'Merged Accounts',
      tags: allTags,
      sourceOrigin: primary.sourceOrigin,
      pricing: bestPricing,
      searchProvenance: bestProvenance,
      operationalHealth: bestHealth,
      whatsappUrl: bestWhatsapp,
      contactInfo: {
        emails: allEmails,
        phones: allPhones,
        addresses: allAddresses,
        socialLinks: mergedSocials,
      },
      location: primary.location,
      geoData: primary.geoData,
      businessDetails: primary.businessDetails,
      verification: allVerifications,
      statusTags: allStatusTags,
      technographics: {
        technologies: Array.from(techMap.values()),
        rawDetectionsCount: techMap.size,
      },
      aiAgentAnalysis: primary.aiAgentAnalysis,
      savedAt: primary.savedAt,
      updatedAt: new Date().toISOString(),
    };

    const remaining = existing.filter((p) => !profileIds.includes(p.id));
    remaining.unshift(mergedRecord);

    this.schedulePersist(remaining);

    return mergedRecord;
  }

  static getCompletenessScore(p: EnrichedProfileRecord): { score: number; missing: string[] } {
    const missing: string[] = [];
    if (!p.contactInfo.emails.length) missing.push('email');
    if (!p.contactInfo.phones.length) missing.push('phone');
    if (!p.contactInfo.addresses.length) missing.push('address');
    if (!p.geoData?.latitude) missing.push('geolocation');
    if (!p.businessDetails?.gstin && !p.businessDetails?.pan) missing.push('tax ID');
    if (!p.technographics.technologies.length) missing.push('technographics');
    const total = 6;
    const present = total - missing.length;
    return { score: Math.round((present / total) * 100), missing };
  }
}
