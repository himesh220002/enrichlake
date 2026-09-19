/**
 * In-Memory TTL & LRU Cache for Scraper Operations
 * Caches heavy headless browser results to enable instant (<5ms) responses for repeated queries.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  lastAccessed: number;
}

class ScraperMemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxCapacity: number = 100;
  private defaultTtlMs: number = 10 * 60 * 1000; // 10 minutes

  /**
   * Generates a deterministic cache key from arbitrary query parameters
   */
  public generateKey(prefix: string, params: Record<string, any>): string {
    const sortedEntries = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => {
        if (typeof v === 'object') {
          return `${k}:${JSON.stringify(v)}`;
        }
        return `${k}:${String(v).trim().toLowerCase()}`;
      })
      .sort((a, b) => a.localeCompare(b));

    return `${prefix}:${sortedEntries.join('|')}`;
  }

  /**
   * Retrieves an item from cache if it exists and has not expired
   */
  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    entry.lastAccessed = now;
    return entry.data as T;
  }

  /**
   * Stores an item with a TTL (defaults to 10 minutes)
   */
  public set<T>(key: string, data: T, ttlMs?: number): void {
    const now = Date.now();
    const effectiveTtl = ttlMs || this.defaultTtlMs;

    // Evict oldest accessed item if capacity reached
    if (this.cache.size >= this.maxCapacity && !this.cache.has(key)) {
      let oldestKey: string | null = null;
      let oldestTime = Infinity;

      for (const [k, v] of this.cache.entries()) {
        if (v.lastAccessed < oldestTime) {
          oldestTime = v.lastAccessed;
          oldestKey = k;
        }
      }

      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      expiresAt: now + effectiveTtl,
      lastAccessed: now,
    });
  }

  /**
   * Deduplicate concurrent in-flight requests for same key to avoid duplicate browser launches
   */
  private inflight: Map<string, Promise<any>> = new Map();
  public async dedupe<T>(key: string, factory: () => Promise<T>, ttlMs?: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached) return cached;
    if (this.inflight.has(key)) return this.inflight.get(key) as Promise<T>;
    const p = factory().then((res) => {
      if (res != null) this.set(key, res, ttlMs);
      this.inflight.delete(key);
      return res;
    }).catch((e) => { this.inflight.delete(key); throw e; });
    this.inflight.set(key, p);
    return p;
  }

  /**
   * Invalidate specific key or clear all cache
   */
  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }

  public stats(): { size: number; keys: string[] } {
    return { size: this.cache.size, keys: Array.from(this.cache.keys()).slice(0, 20) };
  }
}

// Export singleton instance
export const scraperCache = new ScraperMemoryCache();
