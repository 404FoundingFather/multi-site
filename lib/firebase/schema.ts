/**
 * This file contains TypeScript interfaces that define the schema for Firestore collections.
 * It serves as a reference for how data should be structured in the database.
 */

/**
 * Site collection schema
 * Collection path: 'sites'
 */
export interface SiteDocument {
  // Required fields
  domainName: string;          // The primary domain name for this site
  siteName: string;            // Display name of the site
  themeId: string;             // Reference to the theme document
  status: 'active' | 'inactive' | 'maintenance'; // Current status of the site
  
  // Optional fields
  alternativeDomains?: string[]; // Additional domains that should resolve to this site
  createdAt?: FirebaseTimestamp;
  updatedAt?: FirebaseTimestamp;
  
  // Configuration object for site-specific settings
  config?: {
    logo?: string;             // URL to site logo
    contactEmail?: string;     // Primary contact email
    socialLinks?: {            // Social media links
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
    };
    analytics?: {              // Analytics configuration
      googleAnalyticsId?: string;
      facebookPixelId?: string;
    };
    seo?: {                    // SEO configuration
      defaultTitle?: string;
      defaultDescription?: string;
      ogImage?: string;
    };
    features?: {               // Feature flags
      enableBlog?: boolean;
      enableEcommerce?: boolean;
      enableContactForm?: boolean;
    };
    [key: string]: any;        // Allow for additional custom configuration
  };
}

/**
 * Theme collection schema
 * Collection path: 'themes'
 */
export interface ThemeDocument {
  // Required fields
  name: string;               // Display name of the theme
  
  // Style configuration
  styles: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    // Additional style properties
    [key: string]: string;
  };
  
  // Component overrides
  components?: {
    header?: string;          // Component name or path
    footer?: string;
    navigation?: string;
    [key: string]: string | undefined;
  };
  
  // Metadata
  createdAt?: FirebaseTimestamp;
  updatedAt?: FirebaseTimestamp;
  createdBy?: string;         // User ID of creator
}

/**
 * Pages collection schema (for content management)
 * Collection path: 'sites/{siteId}/pages'
 */
export interface PageDocument {
  // Required fields
  slug: string;               // URL slug (e.g., "about-us")
  title: string;              // Page title
  status: 'published' | 'draft' | 'archived';
  
  // Content
  content: {
    body: string;             // HTML or Markdown content
    sections?: any[];         // Structured content sections
  };
  
  // SEO fields
  seo?: {
    title?: string;
    description?: string;
    ogImage?: string;
  };
  
  // Metadata
  createdAt?: FirebaseTimestamp;
  updatedAt?: FirebaseTimestamp;
  publishedAt?: FirebaseTimestamp;
  author?: string;            // User ID of author
}

/**
 * Navigation collection schema
 * Collection path: 'navigations'
 */
export interface NavigationDocument {
  // Required fields
  tenantId: string;           // The tenant this navigation belongs to
  type: string;               // Type of navigation (e.g., 'main', 'footer', 'sidebar')
  items: NavigationItem[];    // Array of navigation items
  
  // Optional fields
  name?: string;              // Display name for this navigation (for admin purposes)
  config?: {                  // Configuration options
    orientation?: 'horizontal' | 'vertical';
    expandable?: boolean;     // Whether nested items can be expanded/collapsed
    showIcons?: boolean;      // Whether to display icons
    ariaLabel?: string;       // Accessibility label
    [key: string]: any;       // Additional configuration options
  };
  
  // Metadata
  createdAt?: FirebaseTimestamp;
  updatedAt?: FirebaseTimestamp;
}

/**
 * Navigation item schema (embedded in NavigationDocument)
 */
export interface NavigationItem {
  label: string;              // Display text
  path: string;               // URL path or action identifier
  isExternal?: boolean;       // Whether link points to external site
  icon?: string;              // Optional icon identifier
  order: number;              // Display order
  isVisible?: boolean;        // Whether item should be displayed (default: true)
  children?: NavigationItem[]; // Nested navigation items for dropdown/submenu
  permissions?: string[];     // Optional permissions required to see this item
  metadata?: {                // Additional metadata
    [key: string]: any;
  };
}

// Type for Firestore timestamp
interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
}