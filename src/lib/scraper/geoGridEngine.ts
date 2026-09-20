/**
 * Spatial Grid & Coordinate Tiling Engine
 * 
 * Generates coordinate sub-tiles across geographic perimeters to bypass
 * Google Maps' 120-place viewport limitation, allowing large-scale harvesting.
 */

export interface GeoCoordinateTile {
  tileId: string;
  name: string;
  latitude: number;
  longitude: number;
  zoom: number; // e.g. 14z or 15z
  url: string;
}

// Well-known metro reference coordinates for zero-latency lookups
const METRO_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'new york': { lat: 40.7128, lng: -74.006 },
  'nyc': { lat: 40.7128, lng: -74.006 },
  'manhattan': { lat: 40.7831, lng: -73.9712 },
  'brooklyn': { lat: 40.6782, lng: -73.9442 },
  'austin': { lat: 30.2672, lng: -97.7431 },
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'chicago': { lat: 41.8781, lng: -87.6298 },
  'miami': { lat: 25.7617, lng: -80.1918 },
  'seattle': { lat: 47.6062, lng: -122.3321 },
  'london': { lat: 51.5074, lng: -0.1278 },
  'paris': { lat: 48.8566, lng: 2.3522 },
  'berlin': { lat: 52.52, lng: 13.405 },
  'tokyo': { lat: 35.6762, lng: 139.6503 },
  'toronto': { lat: 43.6532, lng: -79.3832 },
  'sydney': { lat: -33.8688, lng: 151.2093 },
  'mumbai': { lat: 19.076, lng: 72.8777 },
  'delhi': { lat: 28.6139, lng: 77.209 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'singapore': { lat: 1.3521, lng: 103.8198 },
  'dubai': { lat: 25.2048, lng: 55.2708 },
};

/**
 * Resolves location string to central coordinates
 */
export async function resolveLocationCoordinates(locationStr: string): Promise<{ lat: number; lng: number }> {
  const normalized = locationStr.toLowerCase().trim();

  // 1. Direct metro dictionary lookup
  for (const [metro, coords] of Object.entries(METRO_COORDINATES)) {
    if (normalized.includes(metro)) {
      return coords;
    }
  }

  // 2. OpenStreetMap Nominatim zero-cost public geocoder with fast 2.5s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationStr)}&limit=1`;
    const res = await fetch(geoUrl, {
      headers: { 'User-Agent': 'EnricherAI-GeoTiler/2.0' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        if (!isNaN(lat) && !isNaN(lon)) {
          return { lat, lng: lon };
        }
      }
    }
  } catch {
    // Non-fatal, fallback to default center
  }

  // 3. Fallback default coordinates (New York City)
  return { lat: 40.7128, lng: -74.006 };
}

/**
 * Generates an intelligent spatial grid constellation of sub-tiles around a center coordinate.
 * Uses a radial offset calculation where 1 degree of latitude ~ 111km, and longitude ~ 111km * cos(lat).
 */
export function generateGeoGridTiles(
  query: string,
  center: { lat: number; lng: number },
  radiusKm: number = 10,
  maxTiles: number = 4
): GeoCoordinateTile[] {
  const tiles: GeoCoordinateTile[] = [];
  const zoom = radiusKm <= 5 ? 15 : radiusKm <= 15 ? 14 : 13;

  // Tile 1: Center Core
  const centerUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${center.lat.toFixed(6)},${center.lng.toFixed(6)},${zoom}z`;
  tiles.push({
    tileId: 'center',
    name: 'Center Core',
    latitude: center.lat,
    longitude: center.lng,
    zoom,
    url: centerUrl,
  });

  if (maxTiles <= 1) return tiles;

  // Degrees offset for radial tiles
  const latOffset = (radiusKm * 0.6) / 111.0;
  const lngOffset = (radiusKm * 0.6) / (111.0 * Math.cos((center.lat * Math.PI) / 180));

  // Compass directions: North, East, South, West
  const compassTiles = [
    { id: 'north', name: 'North Sector', lat: center.lat + latOffset, lng: center.lng },
    { id: 'south', name: 'South Sector', lat: center.lat - latOffset, lng: center.lng },
    { id: 'east', name: 'East Sector', lat: center.lat, lng: center.lng + lngOffset },
    { id: 'west', name: 'West Sector', lat: center.lat, lng: center.lng - lngOffset },
  ];

  for (const dir of compassTiles.slice(0, maxTiles - 1)) {
    const tileUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${dir.lat.toFixed(6)},${dir.lng.toFixed(6)},${zoom}z`;
    tiles.push({
      tileId: dir.id,
      name: dir.name,
      latitude: dir.lat,
      longitude: dir.lng,
      zoom,
      url: tileUrl,
    });
  }

  return tiles;
}

/**
 * Deduplicates an array of place records across multiple grid tiles by placeId, CID, or name + street.
 */
export function deduplicatePlaces<T extends { placeId: string; title: string; address: string }>(places: T[]): T[] {
  const seenPlaceIds = new Set<string>();
  const seenFuzzy = new Set<string>();
  const unique: T[] = [];

  for (const place of places) {
    if (place.placeId && seenPlaceIds.has(place.placeId)) {
      continue;
    }

    const fuzzyKey = `${place.title.toLowerCase().replace(/[^a-z0-9]/g, '')}_${place.address.toLowerCase().slice(0, 20)}`;
    if (seenFuzzy.has(fuzzyKey)) {
      continue;
    }

    if (place.placeId) seenPlaceIds.add(place.placeId);
    seenFuzzy.add(fuzzyKey);
    unique.push(place);
  }

  return unique;
}
