import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSiteByTenantId } from '../lib/site/siteService';

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
        // Get the tenant ID from the headers set by our middleware
        const tenantId = 
          // Server-side: Get from request headers
          typeof window === 'undefined' 
            ? 'default-tenant' // Default for SSR when header not available
            // Client-side: Check a cookie or use a default for development
            : document.cookie.split('; ').find(row => row.startsWith('x-tenant-id='))
              ?.split('=')[1] || 'default-tenant';
        
        if (tenantId && tenantId !== 'unknown' && tenantId !== 'error') {
          // Fetch site data from Firestore based on tenantId
          const siteData = await getSiteByTenantId(tenantId);
          
          if (siteData) {
            setSite(siteData);
          } else {
            // For development purposes, fall back to mock data if no site found
            console.warn(`No site found for tenantId: ${tenantId}, using mock data`);
            const mockSite: SiteConfig = {
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
            setSite(mockSite);
          }
        } else {
          // Use mock data for development
          console.warn('No valid tenant ID found, using mock data');
          const mockSite: SiteConfig = {
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
          setSite(mockSite);
        }
      } catch (err) {
        console.error('Error fetching site data:', err);
        setError(err instanceof Error ? err : new Error('Failed to load site data'));
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