import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSite } from './SiteContext';
import { getNavigationRepository } from '../lib/repository';
import { NavigationDocument, NavigationItem } from '../lib/firebase/schema';

interface NavigationContextType {
  mainNavigation: NavigationItem[] | null;
  footerNavigation: NavigationItem[] | null;
  sidebarNavigation: NavigationItem[] | null;
  isLoading: boolean;
  error: Error | null;
  activeItemPath: string | null;
}

// Default fallback navigation items for development
const defaultMainNavItems: NavigationItem[] = [
  {
    label: 'Home',
    path: '/',
    order: 10,
    isVisible: true
  },
  {
    label: 'About',
    path: '/about',
    order: 20,
    isVisible: true
  },
  {
    label: 'Contact',
    path: '/contact',
    order: 30,
    isVisible: true
  }
];

const defaultFooterNavItems: NavigationItem[] = [
  {
    label: 'Privacy Policy',
    path: '/privacy',
    order: 10,
    isVisible: true
  },
  {
    label: 'Terms of Service',
    path: '/terms',
    order: 20,
    isVisible: true
  }
];

const defaultContext: NavigationContextType = {
  mainNavigation: null,
  footerNavigation: null,
  sidebarNavigation: null,
  isLoading: true,
  error: null,
  activeItemPath: null,
};

const NavigationContext = createContext<NavigationContextType>(defaultContext);

export const useNavigation = () => useContext(NavigationContext);

interface NavigationProviderProps {
  children: React.ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const { site, isLoading: isSiteLoading } = useSite();
  const [mainNavigation, setMainNavigation] = useState<NavigationItem[] | null>(null);
  const [footerNavigation, setFooterNavigation] = useState<NavigationItem[] | null>(null);
  const [sidebarNavigation, setSidebarNavigation] = useState<NavigationItem[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const [activeItemPath, setActiveItemPath] = useState<string | null>(null);

  // Find the active navigation item based on the current path
  useEffect(() => {
    if (router && router.asPath) {
      setActiveItemPath(router.asPath);
    }
  }, [router]);

  // Load navigation data when site context is ready
  useEffect(() => {
    const loadNavigationData = async () => {
      // Skip if site context is not ready yet
      if (isSiteLoading || !site) {
        return;
      }

      try {
        setIsLoading(true);
        const navigationRepository = getNavigationRepository();

        // Load main navigation
        const mainNav = await navigationRepository.getNavigationByType('main');
        if (mainNav && mainNav.items && mainNav.items.length > 0) {
          setMainNavigation(navigationRepository.processNavigationItems(mainNav.items));
        } else {
          // Use default navigation in development environment
          if (process.env.NODE_ENV === 'development') {
            console.info('Using default main navigation for development');
            setMainNavigation(defaultMainNavItems);
          }
        }

        // Load footer navigation
        const footerNav = await navigationRepository.getNavigationByType('footer');
        if (footerNav && footerNav.items && footerNav.items.length > 0) {
          setFooterNavigation(navigationRepository.processNavigationItems(footerNav.items));
        } else {
          // Use default navigation in development environment
          if (process.env.NODE_ENV === 'development') {
            console.info('Using default footer navigation for development');
            setFooterNavigation(defaultFooterNavItems);
          }
        }

        // Load sidebar navigation
        const sidebarNav = await navigationRepository.getNavigationByType('sidebar');
        if (sidebarNav && sidebarNav.items && sidebarNav.items.length > 0) {
          setSidebarNavigation(navigationRepository.processNavigationItems(sidebarNav.items));
        }

        setError(null);
      } catch (err) {
        console.error('Error loading navigation data:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        
        // Use default navigation in development environment when there's an error
        if (process.env.NODE_ENV === 'development') {
          console.info('Error occurred. Using default navigation for development');
          setMainNavigation(defaultMainNavItems);
          setFooterNavigation(defaultFooterNavItems);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadNavigationData();
  }, [site, isSiteLoading]);

  const contextValue: NavigationContextType = {
    mainNavigation,
    footerNavigation,
    sidebarNavigation,
    isLoading,
    error,
    activeItemPath,
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};

export default NavigationContext; 