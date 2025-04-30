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
        if (mainNav) {
          setMainNavigation(navigationRepository.processNavigationItems(mainNav.items));
        }

        // Load footer navigation
        const footerNav = await navigationRepository.getNavigationByType('footer');
        if (footerNav) {
          setFooterNavigation(navigationRepository.processNavigationItems(footerNav.items));
        }

        // Load sidebar navigation
        const sidebarNav = await navigationRepository.getNavigationByType('sidebar');
        if (sidebarNav) {
          setSidebarNavigation(navigationRepository.processNavigationItems(sidebarNav.items));
        }

        setError(null);
      } catch (err) {
        console.error('Error loading navigation data:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
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