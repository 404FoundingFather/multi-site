import { SiteConfig } from '../../contexts/SiteContext';

// Define cache interface
interface SiteCache {
  [domainName: string]: {
    site: SiteConfig;
    timestamp: number;
  };
}

// In-memory cache for sites
const siteCache: SiteCache = {};

// Cache expiration time (in milliseconds)
const CACHE_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Gets a site from the cache by domain name
 * @param domainName The domain name to look up
 * @returns The cached site or null if not found or expired
 */
export function getCachedSite(domainName: string): SiteConfig | null {
  const cachedItem = siteCache[domainName];
  
  if (!cachedItem) {
    return null;
  }
  
  // Check if cache has expired
  const now = Date.now();
  if (now - cachedItem.timestamp > CACHE_EXPIRATION_MS) {
    // Remove expired cache entry
    delete siteCache[domainName];
    return null;
  }
  
  return cachedItem.site;
}

/**
 * Adds or updates a site in the cache
 * @param domainName The domain name to use as the cache key
 * @param site The site configuration to cache
 */
export function cacheSite(domainName: string, site: SiteConfig): void {
  siteCache[domainName] = {
    site,
    timestamp: Date.now(),
  };
}

/**
 * Clears the cache for a specific domain
 * @param domainName The domain name to clear from cache
 */
export function clearSiteCache(domainName: string): void {
  delete siteCache[domainName];
}

/**
 * Clears the entire site cache
 */
export function clearAllSiteCache(): void {
  Object.keys(siteCache).forEach(key => delete siteCache[key]);
}