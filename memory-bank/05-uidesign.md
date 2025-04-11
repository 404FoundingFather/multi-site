# UI Design

**Last Updated:** April 11, 2025

This document outlines the user interface design principles, components, and layouts for the project.

## Design System

### Brand Identity
- **Primary Colors:** Dynamic based on tenant configuration
- **Secondary Colors:** Dynamic based on tenant configuration
- **Typography:** Configurable per tenant theme
- **Logo Usage:** Each tenant specifies their own logo

### Design Principles
- Consistency within each tenant site
- Flexibility across different tenant themes
- Performance-focused rendering
- Mobile-first responsive design
- Accessible to all users

## Implementation Status

The following components and layouts have been implemented in the initial project setup:

### Core Layout Implementation
- **MainLayout Component** - Base layout wrapper (`components/layouts/MainLayout.tsx`)
- **Global Styles** - CSS variables and base styling (`styles/globals.css`)
- **Page Templates** - Basic page structures for:
  - Homepage (`pages/index.tsx`)
  - About page (`pages/about.tsx`)
  - Contact page (`pages/contact.tsx`)
  - Error pages (`pages/site-inactive.tsx`, `pages/site-not-found.tsx`)

### Theme System Implementation
- **Context Providers** - Context for theme and site configuration:
  - `contexts/ThemeContext.tsx` - Provides theme variables to components
  - `contexts/SiteContext.tsx` - Provides site-specific configuration
- **Theme Variables** - CSS variables approach for dynamic theming
- **_app.tsx** - Application wrapper with provider initialization

### Sample Implementation: MainLayout

```tsx
// components/layouts/MainLayout.tsx
import React, { ReactNode } from 'react';
import { useSiteContext } from '../../contexts/SiteContext';
import Head from 'next/head';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

const MainLayout = ({ children, title = 'Default Title' }: MainLayoutProps) => {
  const { site, isLoading } = useSiteContext();
  
  const siteName = site?.siteName || 'Multi-Tenant Site';
  const pageTitle = `${title} | ${siteName}`;
  
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={`${siteName} - ${title}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <header className="site-header">
        <div className="container">
          <div className="logo-container">
            {site?.config?.logoUrl && (
              <img src={site.config.logoUrl} alt={`${siteName} logo`} />
            )}
            <h1>{siteName}</h1>
          </div>
          <nav className="main-navigation">
            {/* Navigation will be dynamically generated */}
          </nav>
        </div>
      </header>
      
      <main className="site-main">
        {children}
      </main>
      
      <footer className="site-footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} {siteName}</p>
          {site?.config?.contactInfo && (
            <div className="contact-info">
              {site.config.contactInfo.email && (
                <p>Email: {site.config.contactInfo.email}</p>
              )}
            </div>
          )}
        </div>
      </footer>
    </>
  );
};

export default MainLayout;
```

## Component Library

### Navigation Components
- **Header**: Adaptable header with tenant logo, site name, and navigation
- **Footer**: Configurable footer with tenant information
- **Navigation Bar**: Responsive navigation with support for hierarchical menus
- **Breadcrumbs**: Context-aware breadcrumbs with tenant styling

### Input Components
- **Button**: Themeable button component with multiple variants
- **Form Controls**: Text inputs, selects, checkboxes with tenant styling
- **Search Bar**: Integrated search functionality with tenant-specific scope
- **Contact Form**: Configurable contact form with tenant-specific endpoints

### Display Components
- **Hero Section**: Prominent feature area with background, heading, and call-to-action
- **Card**: Content container with flexible layout options
- **Banner**: Notification or promotional component with tenant styling
- **Media Gallery**: Image and video display with tenant-specific controls

### Layout Components
- **Grid System**: Responsive grid for consistent layouts
- **Container**: Content wrapper with configurable width
- **Section**: Vertical page section with consistent spacing
- **Sidebar**: Optional side content area with responsive behavior

## Page Layouts

### Homepage Layout
```
┌────────────────────────────┐
│ Header                     │
├────────────────────────────┤
│                            │
│ Hero Section               │
│                            │
├────────────────────────────┤
│ ┌──────────┐ ┌──────────┐  │
│ │          │ │          │  │
│ │ Card 1   │ │ Card 2   │  │
│ │          │ │          │  │
│ └──────────┘ └──────────┘  │
│ ┌──────────┐ ┌──────────┐  │
│ │          │ │          │  │
│ │ Card 3   │ │ Card 4   │  │
│ │          │ │          │  │
│ └──────────┘ └──────────┘  │
├────────────────────────────┤
│                            │
│ Featured Section           │
│                            │
├────────────────────────────┤
│ Footer                     │
└────────────────────────────┘
```
**Key Features:**
- Tenant-specific hero banner
- Configurable content cards
- Optional featured section

### Content Page Layout
```
┌────────────────────────────┐
│ Header                     │
├────────────────────────────┤
│ Breadcrumbs                │
├───────────────┬────────────┤
│               │            │
│               │            │
│               │            │
│ Main Content  │  Sidebar   │
│               │            │
│               │            │
│               │            │
├───────────────┴────────────┤
│ Related Content            │
├────────────────────────────┤
│ Footer                     │
└────────────────────────────┘
```
**Key Features:**
- Tenant-styled typography
- Optional sidebar
- Configurable related content section

## Theming Implementation

### CSS Variables Approach

The application uses CSS variables to enable dynamic theming based on tenant configuration. These variables are set at the `:root` level and can be overridden based on tenant theme settings.

```css
/* Base variables in styles/globals.css */
:root {
  /* Color system */
  --color-primary: #3b82f6;
  --color-secondary: #6b7280;
  --color-accent: #ec4899;
  --color-background: #ffffff;
  --color-text: #1f2937;
  
  /* Typography */
  --font-family-base: 'Inter', system-ui, -apple-system, sans-serif;
  --font-family-heading: var(--font-family-base);
  --font-size-base: 1rem;
  --line-height-base: 1.5;
  
  /* Spacing */
  --spacing-unit: 0.25rem;
  --spacing-1: calc(var(--spacing-unit) * 1);
  --spacing-2: calc(var(--spacing-unit) * 2);
  --spacing-4: calc(var(--spacing-unit) * 4);
  --spacing-8: calc(var(--spacing-unit) * 8);
  
  /* Layout */
  --container-max-width: 1200px;
  --container-padding: var(--spacing-4);
  
  /* Border radius */
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.5rem;
  --border-radius-lg: 1rem;
}

/* These variables are dynamically updated by the ThemeProvider */
```

### Theme Context Implementation

The ThemeContext provides tenant-specific theme variables to all components:

```tsx
// contexts/ThemeContext.tsx
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useSiteContext } from './SiteContext';
import { getThemeById } from '../lib/site/siteService';

interface ThemeContextType {
  theme: any;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: null,
  isLoading: true
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { site } = useSiteContext();
  
  useEffect(() => {
    if (site?.themeId) {
      const loadTheme = async () => {
        try {
          const themeData = await getThemeById(site.themeId);
          setTheme(themeData);
        } catch (error) {
          console.error('Error loading theme:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadTheme();
    }
  }, [site?.themeId]);
  
  // Apply theme variables to CSS
  useEffect(() => {
    if (theme?.styles) {
      Object.entries(theme.styles).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value as string);
      });
    }
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
```

## Error Page Implementation

Special attention has been given to the error page experience when a site is not found or inactive:

### Site Not Found Page
- Clean, branded error message
- Clear explanation that the domain is not configured
- Contact information for support
- Minimalist design that doesn't depend on tenant theming

### Site Inactive Page
- Indication that the site exists but is temporarily unavailable
- Expected return time if available
- Contact information for the site owner
- On-brand styling using default theme variables

## User Flows

### First-Time Visitor Flow
1. User navigates to tenant domain
2. Homepage loads with tenant-specific styling and content
3. User explores main navigation options
4. User views content pages or takes action (contact, sign up, etc.)

### Content Consumption Flow
1. User arrives at specific content page
2. Content displays with tenant styling
3. Related content suggestions appear
4. Navigation options guide next steps

## Responsive Design

### Breakpoints
- **Mobile:** 0 - 767px
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px and above

### Mobile Adaptations
- Navigation converts to hamburger menu
- Grid layouts stack vertically
- Touch-friendly tap targets
- Simplified layouts for smaller screens
- Reduced image sizes for performance

## Accessibility Considerations

### Standards Compliance
- WCAG 2.1 AA compliance target
- ADA compliant design elements

### Specific Implementations
- Sufficient color contrast for all text elements
- Keyboard navigation support throughout
- Semantic HTML structure
- ARIA attributes where appropriate
- Screen reader compatible components
- Focus indicators for interactive elements

## Next UI Implementation Steps

1. **Complete tenant-aware navigation component**
   - Dynamic menu generation from site configuration
   - Mobile-responsive behavior
   
2. **Implement flexible card components**
   - Content display templates
   - Image handling with responsive sizing
   
3. **Develop form components**
   - Input validation
   - Tenant-specific form submissions
   
4. **Create theming control panel**
   - Theme preview capability
   - Real-time CSS variable updates

## UI Assets

### Icons
- Shared icon library with tenant-specific coloring
- SVG format for resolution independence
- Consistent sizing and padding

### Images/Illustrations
- Tenant-provided imagery stored in appropriate CDN
- Responsive image loading with srcset
- Lazy loading for performance optimization
- Consistent aspect ratios for layout stability

## Design Tools & Resources

- **Design Files:** Component library in Figma
- **Style Guide:** Dynamic style guide generated from tenant configurations
- **Prototypes:** Interactive prototypes for key user flows