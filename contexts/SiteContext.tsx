import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSiteRepository } from '../lib/repository';
import { TenantContext } from '../lib/repository/TenantContext';

// Define the site configuration interface
export interface SiteConfig {
  tenantId: string;
  domainName: string;
  siteName: string;
  themeId: string;
  status: 'active' | 'inactive' | 'maintenance';
  config: {
    logo?: string;
    contactEmail?: string;
    [key: string]: any;
  };
}

// Default development site configuration
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

// Define the site context interface
interface SiteContextType {
  site: SiteConfig | null;
  isLoading: boolean;
  error: Error | null;
}

// Create the context with a default value
const SiteContext = createContext<SiteContextType>({
  site: null,
  isLoading: true,
  error: null,
});

// Custom hook for using the site context
export const useSite = () => useContext(SiteContext);

interface SiteProviderProps {
  children: ReactNode;
  initialSiteData?: SiteConfig | null;
}

// Site Provider component
export const SiteProvider: React.FC<SiteProviderProps> = ({ children, initialSiteData = null }) => {
  const [site, setSite] = useState<SiteConfig | null>(initialSiteData);
  const [isLoading, setIsLoading] = useState<boolean>(!initialSiteData);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If we already have initial data, we don't need to fetch it
    if (initialSiteData) {
      return;
    }

    const fetchSiteData = async () => {
      try {
        setIsLoading(true);
        const siteRepository = getSiteRepository();
        const tenantContext = TenantContext.getInstance();
        
        // Try to get tenant ID from the context or cookie
        let tenantId: string;
        try {
          tenantId = tenantContext.getTenantId();
        } catch (e) {
          // Fallback if tenant ID not in context yet
          console.warn('Tenant ID not in context, trying cookie');
          tenantId = typeof window === 'undefined' 
            ? 'default-tenant' // Default for SSR when header not available
            // Client-side: Check a cookie or use a default for development
            : document.cookie.split('; ').find(row => row.startsWith('x-tenant-id='))
              ?.split('=')[1] || 'default-tenant';
              
          // Set it in the context for future use
          if (tenantId && tenantId !== 'unknown' && tenantId !== 'error') {
            tenantContext.setTenantId(tenantId);
          }
        }
        
        if (tenantId && tenantId !== 'unknown' && tenantId !== 'error') {
          // Fetch site data from repository based on tenantId
          const siteData = await siteRepository.getSiteByTenantId(tenantId);
          
          if (siteData) {
            setSite(siteData);
          } else {
            // For development purposes, fall back to the default development site
            console.warn(`No site found for tenantId: ${tenantId}, using default development site`);
            setSite(DEV_SITE);
          }
        } else {
          // Use default development site
          console.warn('No valid tenant ID found, using default development site');
          setSite(DEV_SITE);
        }
      } catch (err) {
        console.error('Error fetching site data:', err);
        setError(err instanceof Error ? err : new Error('Failed to load site data'));
        
        // Even on error, provide the default development site in development mode
        if (process.env.NODE_ENV === 'development') {
          console.warn('Error occurred, falling back to default development site');
          setSite(DEV_SITE);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiteData();
  }, [initialSiteData]);

  return (
    <SiteContext.Provider value={{ site, isLoading, error }}>
      {children}
    </SiteContext.Provider>
  );
};