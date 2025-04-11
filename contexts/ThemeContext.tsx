import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSite } from './SiteContext';
import { mockThemes } from '../lib/site/mockData';

// Define the theme configuration interface
export interface ThemeConfig {
  name: string;
  styles: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    [key: string]: any;
  };
}

// Define the theme context interface
interface ThemeContextType {
  theme: ThemeConfig | null;
  isLoading: boolean;
  error: Error | null;
}

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType>({
  theme: null,
  isLoading: true,
  error: null,
});

// Custom hook for using the theme context
export const useTheme = () => useContext(ThemeContext);

// Flag to use mock data in development
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

interface ThemeProviderProps {
  children: ReactNode;
  initialThemeData?: ThemeConfig | null;
}

// Theme Provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initialThemeData = null }) => {
  const { site } = useSite();
  const [theme, setTheme] = useState<ThemeConfig | null>(initialThemeData);
  const [isLoading, setIsLoading] = useState<boolean>(!initialThemeData);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If we already have initial data or we don't have a site yet, we don't need to fetch theme data
    if (initialThemeData || !site) {
      return;
    }

    const fetchThemeData = async () => {
      try {
        setIsLoading(true);
        
        // Use mock data in development mode
        if (USE_MOCK_DATA) {
          console.log('[ThemeContext] Using mock theme data');
          const mockTheme = mockThemes[site.themeId] || mockThemes['default-theme'];
          
          if (mockTheme) {
            setTheme(mockTheme);
            setIsLoading(false);
            return;
          }
        }
        
        // In a real implementation, we would fetch theme data from Firestore based on site.themeId
        console.log('[ThemeContext] Using fallback theme data');
        const fallbackTheme: ThemeConfig = {
          name: 'Default Theme',
          styles: {
            primaryColor: '#3f51b5',
            secondaryColor: '#f50057',
            backgroundColor: '#ffffff',
            textColor: '#333333',
            fontFamily: "'Roboto', sans-serif",
          },
        };

        setTheme(fallbackTheme);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load theme data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchThemeData();
  }, [site, initialThemeData]);

  // Apply the theme styles to the document
  useEffect(() => {
    if (!theme) return;

    // Apply CSS variables to :root
    const root = document.documentElement;
    Object.entries(theme.styles).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    return () => {
      // Clean up CSS variables when component unmounts
      Object.keys(theme.styles).forEach((key) => {
        root.style.removeProperty(`--${key}`);
      });
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, isLoading, error }}>
      {children}
    </ThemeContext.Provider>
  );
};