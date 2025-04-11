import { SiteConfig } from '../../contexts/SiteContext';
import { ThemeConfig } from '../../contexts/ThemeContext';

// Mock site data for development
export const mockSites: Record<string, SiteConfig> = {
  'localhost:3000': {
    tenantId: 'default-tenant',
    domainName: 'localhost:3000',
    siteName: 'Default Development Site',
    themeId: 'default-theme',
    status: 'active',
    config: {
      logo: '/logo.png',
      contactEmail: 'contact@example.com',
      socialLinks: {
        facebook: 'https://facebook.com',
        twitter: 'https://twitter.com',
      }
    }
  },
  'tenant1.example.com': {
    tenantId: 'tenant1',
    domainName: 'tenant1.example.com',
    siteName: 'Tenant One',
    themeId: 'blue-theme',
    status: 'active',
    config: {
      logo: '/tenant1-logo.png',
      contactEmail: 'contact@tenant1.com',
      socialLinks: {
        facebook: 'https://facebook.com/tenant1',
        twitter: 'https://twitter.com/tenant1',
      }
    }
  },
  'tenant2.example.com': {
    tenantId: 'tenant2',
    domainName: 'tenant2.example.com',
    siteName: 'Tenant Two',
    themeId: 'green-theme',
    status: 'active',
    config: {
      logo: '/tenant2-logo.png',
      contactEmail: 'hello@tenant2.com',
      socialLinks: {
        instagram: 'https://instagram.com/tenant2',
        linkedin: 'https://linkedin.com/company/tenant2',
      }
    }
  },
  'inactive.example.com': {
    tenantId: 'inactive-tenant',
    domainName: 'inactive.example.com',
    siteName: 'Inactive Site',
    themeId: 'default-theme',
    status: 'inactive',
    config: {
      contactEmail: 'admin@example.com',
    }
  }
};

// Mock theme data for development
export const mockThemes: Record<string, ThemeConfig> = {
  'default-theme': {
    name: 'Default Theme',
    styles: {
      primaryColor: '#3f51b5',
      secondaryColor: '#f50057',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      fontFamily: "'Roboto', sans-serif",
    }
  },
  'blue-theme': {
    name: 'Blue Theme',
    styles: {
      primaryColor: '#2196f3',
      secondaryColor: '#ff9800',
      backgroundColor: '#f5f5f5',
      textColor: '#212121',
      fontFamily: "'Open Sans', sans-serif",
    }
  },
  'green-theme': {
    name: 'Green Theme',
    styles: {
      primaryColor: '#4caf50',
      secondaryColor: '#ff4081',
      backgroundColor: '#e8f5e9',
      textColor: '#1b5e20',
      fontFamily: "'Montserrat', sans-serif",
    }
  }
};