import { KeywordScrapedItem } from './googleMapsScraper';

export interface RefinedDataReport {
  originalCount: number;
  refinedCount: number;
  duplicatesRemoved: number;
  cleanedContactsCount: number;
  items: KeywordScrapedItem[];
}

/**
 * Clean and refine scraped items:
 * - Deduplicate by name and domain
 * - Standardize phone numbers
 * - Validate lat/long
 * - Rank by keyword match score
 */
export function refineKeywordScrapedData(
  items: KeywordScrapedItem[],
  options: { minMatchScore?: number; requirePhoneOrEmail?: boolean } = {}
): RefinedDataReport {
  const { minMatchScore = 50, requirePhoneOrEmail = false } = options;
  const originalCount = items.length;

  const seenKeys = new Set<string>();
  const refined: KeywordScrapedItem[] = [];
  let duplicatesRemoved = 0;
  let cleanedContacts = 0;

  for (const item of items) {
    // Unique key based on normalized name and site/phone
    const normName = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normPhone = item.phone.replace(/\D/g, '');
    const normSite = item.siteName.toLowerCase().replace(/[^a-z0-9.]/g, '');
    const dedupeKey = `${normName}_${normPhone || normSite}`;

    if (seenKeys.has(dedupeKey)) {
      duplicatesRemoved++;
      continue;
    }
    seenKeys.add(dedupeKey);

    // Check minimum match score
    if (item.matchScore < minMatchScore) {
      continue;
    }

    // Check contact requirement
    if (requirePhoneOrEmail && !item.phone && !item.email) {
      continue;
    }

    // Clean phone number formatting
    let cleanPhone = item.phone.trim();
    if (cleanPhone) {
      const digits = cleanPhone.replace(/\D/g, '');
      if (digits.length === 10) {
        cleanPhone = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        cleanedContacts++;
      } else if (digits.length === 12 && cleanPhone.startsWith('+1')) {
        cleanPhone = `+1 (${digits.slice(2, 5)}) ${digits.slice(5, 8)}-${digits.slice(8)}`;
        cleanedContacts++;
      }
    }

    // Ensure lat/long bounds
    let cleanLat = item.latitude;
    let cleanLng = item.longitude;
    if (cleanLat !== null && (cleanLat < -90 || cleanLat > 90)) cleanLat = null;
    if (cleanLng !== null && (cleanLng < -180 || cleanLng > 180)) cleanLng = null;

    refined.push({
      ...item,
      phone: cleanPhone,
      latitude: cleanLat,
      longitude: cleanLng,
    });
  }

  // Sort descending by match score and rating
  refined.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return (b.rating || 0) - (a.rating || 0);
  });

  return {
    originalCount,
    refinedCount: refined.length,
    duplicatesRemoved,
    cleanedContactsCount: cleanedContacts,
    items: refined,
  };
}
