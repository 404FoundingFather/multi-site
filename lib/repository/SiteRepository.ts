import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { getDb } from '../firebase/firebase';
import { BaseRepository } from './BaseRepository';
import { TenantContext } from './TenantContext';
import { SiteDocument } from '../firebase/schema';
import { getCachedSite, cacheSite } from '../cache/siteCache';
import { SiteConfig } from '../../contexts/SiteContext';

// Development site configuration
const DEV_SITE: SiteConfig = {
  tenantId: 'default-tenant',
  domainName: 'localhost:3000',
  siteName: 'Development Site',
  themeId: 'default',
  status: 'active',
  config: {
    logo: '/logo.png',
    contactEmail: 'contact@example.com',
  },
};

/**
 * SiteRepository - Handles operations for site documents
 * Note: Sites are special because they define tenants themselves,
 * so some of the methods don't follow the standard tenant isolation pattern
 */
export class SiteRepository extends BaseRepository<SiteDocument> {
  private tenantContext: TenantContext;
  
  constructor() {
    super('sites');
    this.tenantContext = TenantContext.getInstance();
  }
  
  /**
   * Gets the current tenant ID from the tenant context
   * @override from BaseRepository
   */
  protected getTenantId(): string {
    return this.tenantContext.getTenantId();
  }
  
  /**
   * Gets a site by its domain name
   * @param domainName The domain to look up
   * @returns The site configuration or null if not found
   */
  async getSiteByDomain(domainName: string): Promise<SiteConfig | null> {
    try {
      // Special case for localhost development
      if (domainName === 'localhost:3000' && process.env.NODE_ENV === 'development') {
        console.log('[SiteRepository] Using development site for localhost:3000');
        return DEV_SITE;
      }
      
      // First check the cache
      const cachedSite = getCachedSite(domainName);
      if (cachedSite) {
        console.log(`[SiteRepository] Cache hit for domain: ${domainName}`);
        return cachedSite;
      }
      
      console.log(`[SiteRepository] Cache miss for domain: ${domainName}, fetching data`);
      
      // If not in cache, fetch from Firestore
      const db = getDb();
      const sitesRef = collection(db, this.collectionName);
      const q = query(sitesRef, where('domainName', '==', domainName));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log(`[SiteRepository] No site found for domain: ${domainName}`);
        
        // Fallback to development site in development mode
        if (process.env.NODE_ENV === 'development') {
          console.log('[SiteRepository] Falling back to development site configuration');
          return DEV_SITE;
        }
        
        return null;
      }
      
      // Get the first matching site
      const siteDoc = querySnapshot.docs[0];
      const siteData = siteDoc.data() as SiteDocument;
      const site: SiteConfig = {
        ...siteData,
        tenantId: siteDoc.id,
      } as SiteConfig;
      
      // Store in cache
      cacheSite(domainName, site);
      
      return site;
    } catch (error) {
      console.error('[SiteRepository] Error fetching site by domain:', error);
      
      // Fallback to development site in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('[SiteRepository] Error occurred, falling back to development site configuration');
        return DEV_SITE;
      }
      
      return null;
    }
  }
  
  /**
   * Gets a site by its tenant ID
   * @param tenantId The tenant ID to look up
   * @returns The site configuration or null if not found
   */
  async getSiteByTenantId(tenantId: string): Promise<SiteConfig | null> {
    try {
      // Special case for default development tenant
      if (tenantId === 'default-tenant' && process.env.NODE_ENV === 'development') {
        console.log('[SiteRepository] Using development site for default-tenant');
        return DEV_SITE;
      }
      
      const db = getDb();
      const siteDocRef = doc(db, this.collectionName, tenantId);
      const siteDocSnap = await getDoc(siteDocRef);
      
      if (!siteDocSnap.exists()) {
        console.log(`[SiteRepository] No site found for tenantId: ${tenantId}`);
        
        // Fallback to development site in development mode
        if (process.env.NODE_ENV === 'development') {
          console.log('[SiteRepository] Falling back to development site configuration');
          return DEV_SITE;
        }
        
        return null;
      }
      
      const siteData = siteDocSnap.data() as SiteDocument;
      const site: SiteConfig = {
        ...siteData,
        tenantId: siteDocSnap.id,
      } as SiteConfig;
      
      // Store in cache by domain name
      if (site.domainName) {
        cacheSite(site.domainName, site);
      }
      
      return site;
    } catch (error) {
      console.error('[SiteRepository] Error fetching site by tenantId:', error);
      
      // Fallback to development site in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('[SiteRepository] Error occurred, falling back to development site configuration');
        return DEV_SITE;
      }
      
      return null;
    }
  }
  
  /**
   * Gets all active sites
   * This method is special and doesn't apply tenant filtering
   * since it's typically used for administrative purposes
   */
  async getAllActiveSites(): Promise<Array<SiteConfig>> {
    try {
      const db = getDb();
      const sitesRef = collection(db, this.collectionName);
      const q = query(sitesRef, where('status', '==', 'active'));
      const querySnapshot = await getDocs(q);
      
      const sites = querySnapshot.docs.map(doc => ({
        ...(doc.data() as SiteDocument),
        tenantId: doc.id,
      } as SiteConfig));
      
      // In development mode, always include the development site if not already present
      if (process.env.NODE_ENV === 'development') {
        if (!sites.some(site => site.domainName === 'localhost:3000')) {
          sites.push(DEV_SITE);
        }
      }
      
      return sites;
    } catch (error) {
      console.error('[SiteRepository] Error fetching active sites:', error);
      
      // In development mode, return at least the development site on error
      if (process.env.NODE_ENV === 'development') {
        return [DEV_SITE];
      }
      
      throw error;
    }
  }
} 