import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { getDb } from '../firebase/firebase';
import { SiteConfig } from '../../contexts/SiteContext';
import { getCachedSite, cacheSite } from '../cache/siteCache';
import { mockSites } from './mockData';

// Collection name for sites in Firestore
const SITES_COLLECTION = 'sites';

// Flag to use mock data in development
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

/**
 * Fetches site configuration by domain name
 * @param domainName The domain name to look up
 * @returns The site configuration or null if not found
 */
export async function getSiteByDomain(domainName: string): Promise<SiteConfig | null> {
  try {
    // First check the cache
    const cachedSite = getCachedSite(domainName);
    if (cachedSite) {
      console.log(`[SiteService] Cache hit for domain: ${domainName}`);
      return cachedSite;
    }

    console.log(`[SiteService] Cache miss for domain: ${domainName}, fetching data`);
    
    // Use mock data in development mode
    if (USE_MOCK_DATA) {
      console.log('[SiteService] Using mock data');
      const site = mockSites[domainName] || mockSites['localhost:3000'];
      
      if (site) {
        // Store in cache
        cacheSite(domainName, site);
        return site;
      }
      
      return null;
    }
    
    // If not in cache, fetch from Firestore
    const db = getDb();
    const sitesRef = collection(db, SITES_COLLECTION);
    const q = query(sitesRef, where('domainName', '==', domainName));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`[SiteService] No site found for domain: ${domainName}`);
      return null;
    }
    
    // Get the first matching site
    const siteDoc = querySnapshot.docs[0];
    const siteData = siteDoc.data() as SiteConfig;
    const site: SiteConfig = {
      ...siteData,
      tenantId: siteDoc.id,
    };
    
    // Store in cache
    cacheSite(domainName, site);
    
    return site;
  } catch (error) {
    console.error('[SiteService] Error fetching site by domain:', error);
    return null;
  }
}

/**
 * Fetches site configuration by tenant ID
 * @param tenantId The tenant ID to look up
 * @returns The site configuration or null if not found
 */
export async function getSiteByTenantId(tenantId: string): Promise<SiteConfig | null> {
  try {
    // Use mock data in development mode
    if (USE_MOCK_DATA) {
      console.log('[SiteService] Using mock data for tenant lookup');
      // Find site with matching tenantId
      const site = Object.values(mockSites).find(site => site.tenantId === tenantId);
      return site || null;
    }
    
    const db = getDb();
    const siteDocRef = doc(db, SITES_COLLECTION, tenantId);
    const siteDocSnap = await getDoc(siteDocRef);
    
    if (!siteDocSnap.exists()) {
      console.log(`[SiteService] No site found for tenantId: ${tenantId}`);
      return null;
    }
    
    const siteData = siteDocSnap.data() as SiteConfig;
    const site: SiteConfig = {
      ...siteData,
      tenantId: siteDocSnap.id,
    };
    
    // Store in cache by domain name
    if (site.domainName) {
      cacheSite(site.domainName, site);
    }
    
    return site;
  } catch (error) {
    console.error('[SiteService] Error fetching site by tenantId:', error);
    return null;
  }
}