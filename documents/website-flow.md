# Multi-Tenant Website Request Flow

**Last Updated:** April 11, 2025

This document provides a detailed walkthrough of how the multi-tenant website engine processes HTTP requests from end to end, with special focus on the tenant resolution middleware and theming system.

## Overview

The multi-tenant website engine allows a single Next.js application to serve multiple distinct websites based on the incoming request's domain name. This is accomplished through a series of steps that identify the tenant, load appropriate configurations, and render content with tenant-specific styling.

## Request Flow Diagram

```
┌─────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│  HTTP Request   │────▶│ Next.js Middleware│────▶│ Tenant Resolution │
│  from Browser   │     │  (middleware.ts)  │     │    & Caching      │
└─────────────────┘     └───────────────────┘     └────────┬──────────┘
                                                           │
                                                           ▼
┌─────────────────┐     ┌──────────────────┐      ┌───────────────────┐
│ Response sent   │◀────│ HTML Rendering   │◀─────│  Page Component   │
│  to Browser     │     │ with Theme Vars  │      │  with Data Fetch  │
└─────────────────┘     └──────────────────┘      └────────┬──────────┘
                                ▲                          │
                                │                          ▼
                        ┌───────┴──────────┐      ┌───────────────────┐
                        │  Theme Provider  │◀─────│ Context Providers │
                        │ CSS Var Injection│      │ (Site & Theme)    │
                        └──────────────────┘      └───────────────────┘
```

## 1. Initial HTTP Request

When a user visits a website hosted by the multi-tenant engine (e.g., `client1.com` or `client2.com`), the browser sends an HTTP request to the server. At this point:

- The request includes a `Host` header with the domain name
- The request is directed to our Next.js application server
- No tenant-specific information is known yet

## 2. Middleware Interception

The request is first intercepted by our custom middleware defined in `middleware.ts`:

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // Get the hostname (domain) from the request
  const hostname = request.headers.get('host') || '';
  
  // For local development, we can use environment variables or special headers to mock different domains
  const envMockDomain = process.env.NEXT_PUBLIC_MOCK_DOMAIN;
  const headerMockDomain = request.headers.get('x-mock-domain');
  
  // Use mockDomain if provided, otherwise use the actual hostname
  const domain = headerMockDomain || envMockDomain || hostname;
  
  console.log(`[Middleware] Resolving tenant for domain: ${domain}`);
  
  // Create a response that we'll modify with tenant information
  const response = NextResponse.next();
  
  try {
    // First try to get the site from cache for immediate response
    let site = getCachedSite(domain);
    
    if (!site) {
      // If not in cache, fetch from the database or mock data
      site = await getSiteByDomain(domain);
    }
    
    if (site) {
      // Set tenant ID in headers for downstream use
      response.headers.set('x-tenant-id', site.tenantId);
      
      // Also set site status to handle inactive sites
      response.headers.set('x-site-status', site.status);
      
      // Set a cookie for client-side access to tenant ID
      response.cookies.set('x-tenant-id', site.tenantId, { 
        path: '/',
        sameSite: 'strict',
        httpOnly: false // Allow JS access for client-side tenant awareness
      });
      
      // Optionally redirect to maintenance page for sites in maintenance mode
      if (site.status === 'maintenance' && !request.nextUrl.pathname.startsWith('/maintenance')) {
        return NextResponse.redirect(new URL('/maintenance', request.url));
      }
      
      // Or block access to inactive sites
      if (site.status === 'inactive') {
        return NextResponse.redirect(new URL('/site-inactive', request.url));
      }
    } else {
      // No site found for this domain
      console.warn(`No site found for domain: ${domain}`);
      response.headers.set('x-tenant-id', 'unknown');
      
      // Optionally redirect to a "site not found" page
      // In development, we'll allow it to continue to make testing easier
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.redirect(new URL('/site-not-found', request.url));
      }
    }
  } catch (error) {
    console.error('Error in tenant resolution middleware:', error);
    // In case of error, fall back to a default behavior
    response.headers.set('x-tenant-id', 'error');
  }
  
  return response;
}

// Configure the middleware to run on all paths except for API routes, static assets, and error pages
export const config = {
  matcher: [
    // Skip all internal paths (_next), API routes, static files, and error pages
    '/((?!_next/|api/|favicon.ico|maintenance|site-inactive|site-not-found).*)',
  ],
};
```

## 3. Tenant Resolution & Caching

The middleware uses the site resolution process, which performs the following steps:

```typescript
// lib/site/siteService.ts (simplified)
export async function getSiteByDomain(domain: string): Promise<SiteConfig | null> {
  // Check cache first for performance
  const cachedSite = getCachedSite(domain);
  if (cachedSite) {
    console.log(`[SiteService] Cache hit for domain: ${domain}`);
    return cachedSite;
  }

  console.log(`[SiteService] Cache miss for domain: ${domain}, fetching data`);
  
  // If not in cache, query Firestore (or use mock data in development)
  // ...database query logic...
  
  // Store in cache for future requests
  cacheSite(domain, site);
  
  return site;
}
```

Key aspects of this process:

1. **Performance Optimization**: We check a local in-memory cache first to avoid database queries for every request
2. **Database Query**: If not in cache, we query Firestore for the tenant configuration
3. **Cache Storage**: Store the result in cache for subsequent requests
4. **Error Handling**: Return appropriate responses for missing or inactive tenants
5. **Development Mode**: Uses mock data when configured for development environments

The cache implementation in `lib/cache/siteCache.ts` uses a custom in-memory solution with timestamp-based expiration:

```typescript
// lib/cache/siteCache.ts (simplified)
// In-memory cache for sites
const siteCache: SiteCache = {};

// Cache expiration time (in milliseconds)
const CACHE_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes

export function getCachedSite(domainName: string): SiteConfig | null {
  const cachedItem = siteCache[domainName];
  
  if (!cachedItem) {
    return null;
  }
  
  // Check if cache has expired
  const now = Date.now();
  if (now - cachedItem.timestamp > CACHE_EXPIRATION_MS) {
    // Remove expired cache entry
    delete siteCache[domainName];
    return null;
  }
  
  return cachedItem.site;
}

export function cacheSite(domainName: string, site: SiteConfig): void {
  siteCache[domainName] = {
    site,
    timestamp: Date.now(),
  };
}
```

## 4. Next.js Routing

After middleware processing, Next.js continues with its standard routing:

1. The URL path is matched to a page component in the `pages` directory
2. The page's data fetching methods are executed (getServerSideProps or getStaticProps)
3. The page component renders with the fetched data

For data fetching methods, tenant information is available from the request headers:

```typescript
// Example in pages/index.tsx (simplified)
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  
  // Fetch tenant-specific data
  const pageData = await fetchPageDataForTenant(tenantId, 'home');
  
  return {
    props: {
      pageData,
      tenantId,
    },
  };
};
```

## 5. Context Providers Initialization

When a page renders, it's wrapped by the application shell in `_app.tsx`:

```typescript
// pages/_app.tsx (simplified)
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SiteProvider>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </SiteProvider>
  );
}
```

The `SiteProvider` initializes with the tenant information:

```typescript
// contexts/SiteContext.tsx (simplified)
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
          const siteData = await getSiteByTenantId(tenantId);
          setSite(siteData);
        } else {
          // For development purposes, fall back to mock data
          console.warn('No valid tenant ID found, using mock data');
          // Set fallback site data
        }
      } catch (err) {
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
```

## 6. Theme Loading and Application

The `ThemeProvider` loads the theme based on the site configuration and applies it:

```typescript
// contexts/ThemeContext.tsx (simplified)
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
            return;
          }
        }
        
        // In a real implementation, we would fetch theme data from Firestore based on site.themeId
        // For now, we use a fallback theme
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
```

The key aspects of the theming system are:

1. **Dynamic CSS Variables**: Theme properties are applied as CSS variables at the document root level
2. **Default Values**: Base CSS variables are defined in `styles/globals.css` as fallbacks
3. **Runtime Updates**: Variables are updated when the theme loads, affecting all styled components
4. **Resource Loading**: Font resources are loaded dynamically based on theme configuration

## 7. Component Rendering with Theme Variables

Components throughout the application access theme values through CSS variables:

```css
/* Example styling that uses theme variables */
.button {
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
  font-family: var(--font-family-base);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-2) var(--spacing-4);
}

.header {
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
}
```

This approach provides several benefits:

1. **Consistent Styling**: All components automatically inherit the tenant's theme
2. **Runtime Updates**: Changing variables updates all components instantly
3. **Performance**: No need to pass style props through multiple component levels
4. **Developer Experience**: Styles remain in CSS files rather than JavaScript

## 8. Layout Application and Page Rendering

The `MainLayout` component serves as the primary layout template for pages that use it. Pages are responsible for importing and using the MainLayout component as needed:

```typescript
// components/layouts/MainLayout.tsx (simplified)
const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  const { site, isLoading: siteLoading } = useSite();
  const { theme, isLoading: themeLoading } = useTheme();
  
  const siteName = site?.siteName || 'Website';
  const pageTitle = title ? `${title} | ${siteName}` : siteName;
  
  if (siteLoading || themeLoading) {
    return <div>Loading site configuration...</div>;
  }
  
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={`${siteName} - Multi-tenant website`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="site-wrapper">
        <header>
          <div className="header-content">
            <div className="logo">
              {site?.config?.logo ? (
                <img src={site.config.logo} alt={siteName} />
              ) : (
                <h1>{siteName}</h1>
              )}
            </div>
            <nav>
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </nav>
          </div>
        </header>
        
        <main>{children}</main>
        
        <footer>
          <div className="footer-content">
            <p>&copy; {new Date().getFullYear()} {siteName}</p>
            {site?.config?.contactEmail && (
              <p>Contact: <a href={`mailto:${site.config.contactEmail}`}>{site.config.contactEmail}</a></p>
            )}
          </div>
        </footer>
      </div>
    </>
  );
};
```

## 9. Response Sent to Browser

Finally, the fully rendered HTML with tenant-specific:
- Content
- Styling (via CSS variables)
- Metadata
- Configuration

is sent back to the user's browser.

## Error Handling Paths

During the request flow, several error paths are handled:

1. **Domain Not Found**: 
   - If the domain doesn't match any tenant, the x-tenant-id header is set to "unknown"
   - In production, the user is redirected to `/site-not-found`
   - In development, the request continues to make testing easier

2. **Inactive Site**: If the tenant exists but is marked inactive, the user is redirected to `/site-inactive`

3. **Maintenance Mode**: If the site is in maintenance mode and the user isn't already on the maintenance page, they are redirected to `/maintenance`

4. **Server Errors**: If errors occur during tenant resolution, the x-tenant-id header is set to "error" and the request continues

5. **Loading States**: While site configuration and theme data are being fetched, the MainLayout displays a loading indicator

## Performance Considerations

1. **Caching Strategy**:
   - Domain-to-tenant resolution is cached with a configurable TTL
   - Theme data is cached after initial load
   - Static pages and assets use Next.js built-in caching

2. **Middleware Efficiency**:
   - Middleware is configured to skip static assets and API routes
   - Tenant resolution result is attached to the request to avoid duplicate lookups

3. **CSS Variables**:
   - More efficient than inline styles or emotion/styled-components for dynamic theming
   - Browser optimized for CSS variable updates

## Security Considerations

1. **Tenant Isolation**:
   - Each tenant's data is filtered by tenantId in all queries
   - Firestore security rules enforce tenant separation

2. **Theme Safety**:
   - Theme variables are sanitized before application to prevent injection attacks
   - CSS variable names are validated against an allowed list

## How to Debug the Request Flow

1. **Middleware Issues**:
   - Check server logs for middleware errors
   - Verify domain resolution in the `resolveTenantFromDomain` function

2. **Tenant Resolution**:
   - Inspect the cache hit rate using `getCacheStats()`
   - Confirm Firestore queries are correctly filtering by domainName

3. **Theming Problems**:
   - Use browser dev tools to check applied CSS variables
   - Verify theme is being loaded from the correct themeId

## Conclusion

The multi-tenant website engine processes requests through a carefully designed flow that:

1. Identifies the tenant based on the domain
2. Loads tenant-specific configuration and theme
3. Applies theme styling through CSS variables
4. Renders content filtered for the specific tenant

This architecture allows a single Next.js application to serve multiple distinct websites with unique styling, content, and configuration while maintaining performance through strategic caching and optimized rendering patterns.