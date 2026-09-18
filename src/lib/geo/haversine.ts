/**
 * Haversine Formula & Geodesic Distance Utilities
 */

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

// Built-in coordinate lookup for common trade hubs and regions
const HUB_COORDINATES_MAP: Record<string, GeoCoordinates> = {
  // West Bengal & Eastern India
  'malda': { latitude: 25.0100, longitude: 88.1400 },
  'malda, wb': { latitude: 25.0100, longitude: 88.1400 },
  'malda, wb, india': { latitude: 25.0100, longitude: 88.1400 },
  'malda town': { latitude: 24.9900, longitude: 88.1500 },
  'english bazar': { latitude: 24.9966, longitude: 88.1564 },
  'old malda': { latitude: 25.0200, longitude: 88.1400 },
  'kolkata': { latitude: 22.5726, longitude: 88.3639 },
  'siliguri': { latitude: 26.7271, longitude: 88.3953 },
  'durgapur': { latitude: 23.5204, longitude: 87.3119 },
  'patna': { latitude: 25.5941, longitude: 85.1376 },
  'guwahati': { latitude: 26.1445, longitude: 91.7362 },

  // Pan-India Tech & Trade Hubs
  'bangalore': { latitude: 12.9716, longitude: 77.5946 },
  'mumbai': { latitude: 19.0760, longitude: 72.8777 },
  'delhi': { latitude: 28.6139, longitude: 77.2090 },
  'hyderabad': { latitude: 17.3850, longitude: 78.4867 },
  'chennai': { latitude: 13.0827, longitude: 80.2707 },
  'ahmedabad': { latitude: 23.0225, longitude: 72.5714 },
  'pune': { latitude: 18.5204, longitude: 73.8567 },
  'surat': { latitude: 21.1702, longitude: 72.8311 },

  // Global Hubs
  'new york': { latitude: 40.7128, longitude: -74.0060 },
  'san francisco': { latitude: 37.7749, longitude: -122.4194 },
  'austin': { latitude: 30.2672, longitude: -97.7431 },
  'london': { latitude: 51.5074, longitude: -0.1278 },
  'singapore': { latitude: 1.3521, longitude: 103.8198 },
  'dubai': { latitude: 25.2048, longitude: 55.2708 },
};

/**
 * Resolve lat/long for a user-entered location hub
 */
export function resolveLocationHub(locationInput: string): GeoCoordinates {
  const norm = locationInput.toLowerCase().trim();
  for (const [key, coords] of Object.entries(HUB_COORDINATES_MAP)) {
    if (norm.includes(key) || key.includes(norm)) {
      return coords;
    }
  }

  // Fallback heuristic coordinates (Malda WB default if West Bengal mentioned, else New Delhi)
  if (norm.includes('wb') || norm.includes('bengal') || norm.includes('malda')) {
    return { latitude: 25.0100, longitude: 88.1400 };
  }
  return { latitude: 28.6139, longitude: 77.2090 };
}

/**
 * Calculate geodesic distance between two points in Kilometers using the Haversine formula
 */
export function calculateHaversineDistanceKm(
  point1: GeoCoordinates,
  point2: GeoCoordinates
): number {
  const R = 6371; // Earth radius in KM
  const dLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const dLon = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const lat1 = (point1.latitude * Math.PI) / 180;
  const lat2 = (point2.latitude * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
