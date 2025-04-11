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
  const hostname = request.headers.get('host') || '';
  
  // Begin tenant resolution process
  try {
    const tenant = await resolveTenantFromDomain(hostname);
    
    // Handle tenant resolution results
    if (!tenant) {
      return NextResponse.rewrite(new URL('/site-not-found', request.url));
    }
    
    if (tenant.status !== 'active') {
      return NextResponse.rewrite(new URL('/site-inactive', request.url));
    }
    
    // Attach tenant information to request
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-id', tenant.tenantId);
    requestHeaders.set('x-theme-id', tenant.themeId);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.rewrite(new URL('/server-error', request.url));
  }
}
```

This middleware is configured to intercept all routes except for specific paths:

```typescript
export const config = {
  matcher: [
    // Match all paths except static assets, API routes, etc.
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};
```

## 3. Tenant Resolution & Caching

The middleware calls the `resolveTenantFromDomain` function, which performs the following steps:

```typescript
// lib/site/siteService.ts (simplified)
export async function resolveTenantFromDomain(domain: string): Promise<TenantConfig | null> {
  // Check cache first for performance
  const cachedTenant = getCachedTenant(domain);
  if (cachedTenant) {
    return cachedTenant;
  }

  // If not in cache, query Firestore
  const db = getFirestore();
  const sitesRef = collection(db, 'sites');
  const q = query(sitesRef, where('domainName', '==', domain));
  
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return null;
  }
  
  const tenantData = snapshot.docs[0].data() as TenantConfig;
  
  // Cache for future requests (TTL defined in cache implementation)
  cacheTenant(domain, tenantData);
  
  return tenantData;
}
```

Key aspects of this process:

1. **Performance Optimization**: We check a local in-memory cache first to avoid database queries for every request
2. **Database Query**: If not in cache, we query Firestore for the tenant configuration
3. **Cache Storage**: Store the result in cache for subsequent requests
4. **Error Handling**: Return appropriate responses for missing or inactive tenants

The cache implementation in `lib/cache/siteCache.ts` uses NodeCache with configurable TTL:

```typescript
// lib/cache/siteCache.ts (simplified)
import NodeCache from 'node-cache';

const domainCache = new NodeCache({
  stdTTL: parseInt(process.env.DOMAIN_CACHE_TTL || '300', 10), // 5 minutes default
  checkperiod: 60,
});

export function getCachedTenant(domain: string): TenantConfig | undefined {
  return domainCache.get<TenantConfig>(domain);
}

export function cacheTenant(domain: string, tenant: TenantConfig): boolean {
  return domainCache.set(domain, tenant);
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
function MyApp({ Component, pageProps }) {
  return (
    <SiteContextProvider pageProps={pageProps}>
      <ThemeProvider>
        <MainLayout>
          <Component {...pageProps} />
        </MainLayout>
      </ThemeProvider>
    </SiteContextProvider>
  );
}
```

The `SiteContextProvider` initializes with the tenant information:

```typescript
// contexts/SiteContext.tsx (simplified)
export const SiteContextProvider = ({ children, pageProps }) => {
  const [site, setSite] = useState<TenantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (pageProps.tenantId) {
      // Load site configuration (possibly from cache)
      const loadSite = async () => {
        try {
          const siteData = await getSiteById(pageProps.tenantId);
          setSite(siteData);
        } catch (error) {
          console.error('Error loading site:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadSite();
    }
  }, [pageProps.tenantId]);
  
  return (
    <SiteContext.Provider value={{ site, isLoading }}>
      {children}
    </SiteContext.Provider>
  );
};
```

## 6. Theme Loading and Application

The `ThemeProvider` loads the theme based on the site configuration and applies it:

```typescript
// contexts/ThemeContext.tsx (simplified)
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(null);
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
  
  // Apply CSS variables from theme
  useEffect(() => {
    if (theme?.styles) {
      Object.entries(theme.styles).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value as string);
      });
    }
    
    // Apply any theme-specific fonts
    if (theme?.fonts?.length) {
      // Load fonts dynamically
      // ...
    }
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, isLoading }}>
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

The `MainLayout` component applies the site structure and incorporates tenant information:

```typescript
// components/layouts/MainLayout.tsx (simplified)
const MainLayout = ({ children }) => {
  const { site, isLoading } = useSiteContext();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <>
      <Header 
        siteName={site?.siteName} 
        logoUrl={site?.config?.logoUrl} 
      />
      
      <main className="site-content">
        {children}
      </main>
      
      <Footer 
        siteName={site?.siteName} 
        contactInfo={site?.config?.contactInfo} 
      />
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

1. **Domain Not Found**: If the domain doesn't match any tenant, the user is redirected to `/site-not-found`

2. **Inactive Site**: If the tenant exists but is marked inactive, the user is redirected to `/site-inactive`

3. **Server Errors**: If database queries fail or other errors occur, the user is redirected to a server error page

4. **Loading States**: While tenant configuration and theme are loading, appropriate loading indicators are shown

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