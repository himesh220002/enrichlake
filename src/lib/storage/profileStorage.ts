export interface EnrichedProfileRecord {
  id: string;
  domain: string;
  url: string;
  companyName: string;
  category: string;
  description: string;
  rating: number; // 1 to 5 stars
  mark: 'Hot Lead' | 'Target Account' | 'Contacted' | 'Qualified' | 'Nurture' | 'Disqualified';
  remarks: string;
  listName: string;
  tags: string[];
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
  savedAt: string;
  updatedAt: string;
}

export const STORAGE_KEY = 'enricher_saved_profiles_v1';

/**
 * Storage adapter abstraction.
 * Currently uses localStorage; prepared for MongoDB connection string when provided in .env.
 */
export class ProfileStorageService {
  static getProfiles(): EnrichedProfileRecord[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveProfile(profile: Omit<EnrichedProfileRecord, 'id' | 'savedAt' | 'updatedAt'> & { id?: string }): EnrichedProfileRecord {
    const existing = this.getProfiles();
    const now = new Date().toISOString();
    
    // Check if profile already exists for this domain
    const existingIndex = existing.findIndex((p) => p.domain.toLowerCase() === profile.domain.toLowerCase());

    const record: EnrichedProfileRecord = {
      ...profile,
      id: profile.id || `prof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      savedAt: existingIndex >= 0 ? existing[existingIndex].savedAt : now,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      existing[existingIndex] = record;
    } else {
      existing.unshift(record);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    }
    return record;
  }

  static updateProfile(id: string, updates: Partial<EnrichedProfileRecord>): EnrichedProfileRecord | null {
    const existing = this.getProfiles();
    const index = existing.findIndex((p) => p.id === id);
    if (index === 0 || index > 0) {
      const updated = {
        ...existing[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      existing[index] = updated;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      }
      return updated;
    }
    return null;
  }

  static deleteProfile(id: string): boolean {
    const existing = this.getProfiles();
    const filtered = existing.filter((p) => p.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
    return filtered.length !== existing.length;
  }

  /**
   * Merge two or more selected profiles into a single unified record
   * (Entity resolution & deduplication)
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

    const mergedRecord: EnrichedProfileRecord = {
      id: `prof_merged_${Date.now()}`,
      domain: primary.domain,
      url: primary.url,
      companyName: targetName || primary.companyName,
      category: targetCategory || primary.category,
      description: primary.description,
      rating: Math.max(...toMerge.map((p) => p.rating || 1)),
      mark: primary.mark,
      remarks: combinedRemarks,
      listName: primary.listName || 'Merged Accounts',
      tags: allTags,
      contactInfo: {
        emails: allEmails,
        phones: allPhones,
        addresses: allAddresses,
        socialLinks: mergedSocials,
      },
      technographics: {
        technologies: Array.from(techMap.values()),
        rawDetectionsCount: techMap.size,
      },
      aiAgentAnalysis: primary.aiAgentAnalysis,
      savedAt: primary.savedAt,
      updatedAt: new Date().toISOString(),
    };

    // Remove merged originals and append consolidated master record
    const remaining = existing.filter((p) => !profileIds.includes(p.id));
    remaining.unshift(mergedRecord);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
    }

    return mergedRecord;
  }
}
