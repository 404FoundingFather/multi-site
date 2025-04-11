# Code Snippets

**Last Updated:** April 11, 2025

This document collects reusable code patterns, examples, and solutions to common problems encountered in the project. All code snippets adhere to Clean Code principles.

## Clean Code Standards for Snippets

All code snippets in this document must exemplify Clean Code principles:

1. **Clear Intent**: Each snippet should clearly communicate its purpose
2. **Simplicity**: Snippets should use the simplest approach that solves the problem
3. **Proper Naming**: All variables, functions, and classes should have descriptive names
4. **Minimal Comments**: Code should be self-explanatory, with comments explaining only the "why"
5. **Error Handling**: Include appropriate error handling in snippets
6. **Testability**: Where applicable, show how the code can be tested
7. **SOLID Principles**: Demonstrate good design principles
8. **DRY (Don't Repeat Yourself)**: Avoid duplication in code patterns

When adding new snippets, ensure they adhere to these principles and can serve as exemplars for the project's coding standards.

## Common Patterns

### Domain-Based Tenant Resolution

**Use Case:** Identifying the target tenant site based on the incoming request's domain name

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { resolveTenantFromDomain } from '@/lib/tenantResolver';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  
  try {
    const tenant = await resolveTenantFromDomain(hostname);
    
    // If tenant not found or inactive, return appropriate response
    if (!tenant) {
      return NextResponse.rewrite(new URL('/domain-not-found', url));
    }
    
    if (tenant.status !== 'active') {
      return NextResponse.rewrite(new URL('/site-inactive', url));
    }
    
    // Clone the request headers and add tenant information
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-id', tenant.tenantId);
    requestHeaders.set('x-theme-id', tenant.themeId);
    
    // Pass tenant information to the application
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Error in tenant resolution middleware:', error);
    return NextResponse.rewrite(new URL('/server-error', url));
  }
}

export const config = {
  matcher: [
    // Match all paths except for static files, api routes, etc.
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};
```

**Explanation:**
- Uses Next.js middleware to intercept incoming requests
- Extracts the hostname and resolves it to a specific tenant
- Attaches tenant information to the request headers for use in the application
- Handles error cases like domain not found or inactive sites

### Tenant Resolver with Caching

**Use Case:** Efficiently resolving domains to tenant configurations with local caching

```typescript
// lib/tenantResolver.ts
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import NodeCache from 'node-cache';

// Initialize cache with TTL (time-to-live) in seconds
const domainCache = new NodeCache({
  stdTTL: parseInt(process.env.DOMAIN_CACHE_TTL || '300', 10),
  checkperiod: 60,
});

export interface TenantConfig {
  tenantId: string;
  domainName: string;
  siteName: string;
  themeId: string;
  status: 'active' | 'inactive';
  config: Record<string, any>;
}

export async function resolveTenantFromDomain(domain: string): Promise<TenantConfig | null> {
  // Check cache first
  const cachedTenant = domainCache.get<TenantConfig>(domain);
  if (cachedTenant) {
    return cachedTenant;
  }

  // If not in cache, query Firestore
  const db = getFirestore();
  const sitesRef = collection(db, 'sites');
  const q = query(sitesRef, where('domainName', '==', domain));

  try {
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const tenantDoc = snapshot.docs[0];
    const tenantData = tenantDoc.data() as TenantConfig;
    
    // Store in cache for future requests
    domainCache.set(domain, tenantData);
    
    return tenantData;
  } catch (error) {
    console.error('Error resolving tenant from domain:', error);
    throw error;
  }
}

// For manual cache invalidation when needed
export function invalidateTenantCache(domain?: string): void {
  if (domain) {
    domainCache.del(domain);
  } else {
    domainCache.flushAll();
  }
}
```

**Explanation:**
- Uses node-cache for local, in-memory caching of tenant configurations
- Checks cache before querying Firestore to reduce database reads
- Configurable TTL based on environment variables
- Includes cache invalidation function for manual updates

**Usage Example:**
```typescript
// Example usage in an API route
import { resolveTenantFromDomain } from '@/lib/tenantResolver';

export default async function handler(req, res) {
  const hostname = req.headers.host;
  const tenant = await resolveTenantFromDomain(hostname);
  
  if (!tenant || tenant.status !== 'active') {
    return res.status(404).json({ error: 'Site not found' });
  }
  
  // Continue processing with tenant context
  // ...
}
```

## Helper Functions

### Get Tenant Context

**Purpose:** Access the current tenant context throughout the application

```typescript
// lib/useTenantContext.ts
import { useContext, createContext } from 'react';
import type { TenantConfig } from '@/lib/tenantResolver';

interface TenantContextType {
  tenant: TenantConfig | null;
  isLoading: boolean;
}

export const TenantContext = createContext<TenantContextType>({
  tenant: null,
  isLoading: true,
});

export function useTenantContext() {
  return useContext(TenantContext);
}
```

**Returns:** The current tenant context object with tenant configuration and loading state

**Example Usage:**
```typescript
// components/SiteHeader.tsx
import { useTenantContext } from '@/lib/useTenantContext';

export function SiteHeader() {
  const { tenant, isLoading } = useTenantContext();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <header>
      <h1>{tenant?.siteName || 'Default Site'}</h1>
      <img src={tenant?.config?.logoUrl} alt="Site Logo" />
    </header>
  );
}
```

### Fetch Tenant-Specific Data

**Purpose:** Retrieve data for the current tenant with proper filtering

```typescript
// lib/tenantData.ts
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import type { TenantConfig } from '@/lib/tenantResolver';

export async function getTenantData<T>(
  tenantId: string, 
  collectionName: string, 
  additionalQuery?: any
): Promise<T[]> {
  const db = getFirestore();
  const dataRef = collection(db, collectionName);
  
  let baseQuery = query(dataRef, where('tenantId', '==', tenantId));
  
  if (additionalQuery) {
    baseQuery = additionalQuery(baseQuery);
  }
  
  try {
    const snapshot = await getDocs(baseQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
  } catch (error) {
    console.error(`Error fetching tenant data from ${collectionName}:`, error);
    throw error;
  }
}
```

**Parameters:**
- `tenantId`: ID of the current tenant
- `collectionName`: Firestore collection to query
- `additionalQuery`: Optional function to add more query constraints

**Returns:** Array of documents belonging to the specified tenant

**Example Usage:**
```typescript
// pages/products.tsx
import { GetServerSideProps } from 'next';
import { getTenantData } from '@/lib/tenantData';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  
  try {
    const products = await getTenantData(tenantId, 'products');
    
    return {
      props: {
        products,
      },
    };
  } catch (error) {
    return {
      props: {
        products: [],
        error: 'Failed to load products',
      },
    };
  }
};
```

## Theme Management

### Dynamic CSS Variables

**Use Case:** Apply tenant-specific theming using CSS variables

```typescript
// components/ThemeProvider.tsx
import React, { ReactNode } from 'react';
import { useTenantContext } from '@/lib/useTenantContext';
import { useTheme } from '@/lib/useTheme';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { tenant } = useTenantContext();
  const { theme, isLoading } = useTheme(tenant?.themeId);
  
  // Create CSS variable style object
  const themeStyles = React.useMemo(() => {
    if (isLoading || !theme) {
      return {};
    }
    
    const cssVars = {} as Record<string, string>;
    
    // Convert theme object to CSS variables
    Object.entries(theme.styles || {}).forEach(([key, value]) => {
      cssVars[`--${key}`] = value as string;
    });
    
    return cssVars;
  }, [theme, isLoading]);
  
  return (
    <div style={themeStyles}>
      {children}
    </div>
  );
}
```

**Explanation:**
- Creates a theme provider component that wraps the application
- Loads theme data based on the current tenant's themeId
- Converts theme configuration to CSS variables
- Applies CSS variables to a wrapper div that contains the application

**Usage Example:**
```typescript
// pages/_app.tsx
import { ThemeProvider } from '@/components/ThemeProvider';
import { TenantContextProvider } from '@/components/TenantContextProvider';

function MyApp({ Component, pageProps }) {
  return (
    <TenantContextProvider>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </TenantContextProvider>
  );
}

export default MyApp;
```

## Error Handling

### Tenant Not Found Handler

**Problem:** Managing requests for unknown or misconfigured domains

**Solution:**
```typescript
// pages/domain-not-found.tsx
import { NextPage } from 'next';
import Head from 'next/head';

const DomainNotFoundPage: NextPage = () => {
  return (
    <div className="error-container">
      <Head>
        <title>Domain Not Found</title>
      </Head>
      <div className="error-content">
        <h1>Website Not Found</h1>
        <p>The website you are looking for is not configured in our system.</p>
        <p>If you believe this is an error, please contact the system administrator.</p>
      </div>
    </div>
  );
};

export default DomainNotFoundPage;
```

**Explanation:**
- Simple, user-friendly error page for unknown domains
- Provides clear information about the error
- Can be styled with a default theme since tenant theming won't be available

## Performance Optimizations

### Efficient Firestore Queries

**Target Scenario:** When fetching tenant-specific data from Firestore

**Before:**
```typescript
// Inefficient - No indexing, fetches all documents then filters
async function getPageContent(tenantId, slug) {
  const db = getFirestore();
  const pagesRef = collection(db, 'pages');
  const snapshot = await getDocs(pagesRef);
  
  const pageDoc = snapshot.docs.find(
    doc => doc.data().tenantId === tenantId && doc.data().slug === slug
  );
  
  return pageDoc ? pageDoc.data() : null;
}
```

**After:**
```typescript
// Optimized - Uses compound query with proper indexes
async function getPageContent(tenantId, slug) {
  const db = getFirestore();
  const pagesRef = collection(db, 'pages');
  const pageQuery = query(
    pagesRef, 
    where('tenantId', '==', tenantId),
    where('slug', '==', slug)
  );
  
  const snapshot = await getDocs(pageQuery);
  
  if (snapshot.empty) {
    return null;
  }
  
  return snapshot.docs[0].data();
}
```

**Improvement:** 
- Significantly reduces Firestore read operations
- Faster response times by leveraging database indexes
- Optimizes for performance with larger datasets
- Note: Requires a compound index on (tenantId, slug) in Firestore

## Testing Examples

### Testing Tenant Resolution

**What to Test:** The domain to tenant resolution functionality

```typescript
// __tests__/tenantResolver.test.ts
import { resolveTenantFromDomain } from '@/lib/tenantResolver';
import { mockFirestore } from '@/tests/mocks/firestore';

// Mock the Firestore module
jest.mock('firebase/firestore', () => mockFirestore);

describe('Tenant Resolution', () => {
  beforeEach(() => {
    // Clear cache between tests
    jest.clearAllMocks();
    mockFirestore.reset();
  });

  test('resolves valid domain to correct tenant', async () => {
    // Setup mock data
    mockFirestore.addDocument('sites', {
      tenantId: 'tenant1',
      domainName: 'example.com',
      siteName: 'Example Site',
      themeId: 'theme1',
      status: 'active',
      config: { logoUrl: 'logo.png' }
    });

    const tenant = await resolveTenantFromDomain('example.com');
    
    expect(tenant).not.toBeNull();
    expect(tenant?.tenantId).toBe('tenant1');
    expect(tenant?.siteName).toBe('Example Site');
  });

  test('returns null for unknown domain', async () => {
    const tenant = await resolveTenantFromDomain('unknown-domain.com');
    expect(tenant).toBeNull();
  });

  test('caches tenant data after first lookup', async () => {
    mockFirestore.addDocument('sites', {
      tenantId: 'tenant2',
      domainName: 'cached.com',
      siteName: 'Cached Site',
      themeId: 'theme2',
      status: 'active',
      config: {}
    });

    // First call - should hit Firestore
    await resolveTenantFromDomain('cached.com');
    expect(mockFirestore.getDocs).toHaveBeenCalledTimes(1);
    
    // Second call - should use cache
    await resolveTenantFromDomain('cached.com');
    expect(mockFirestore.getDocs).toHaveBeenCalledTimes(1); // Still only called once
  });
});
```

**Key Points:**
- Tests the core domain resolution functionality
- Verifies caching behavior
- Handles the unknown domain scenario properly
- Uses mock Firestore for isolation and speed

## Integration Examples

### Tenant-Aware API Route

**Components:** Next.js API route with tenant context

```typescript
// pages/api/content/[slug].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getTenantData } from '@/lib/tenantData';
import { resolveTenantFromDomain } from '@/lib/tenantResolver';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Extract domain and content slug
  const { slug } = req.query;
  const domain = req.headers.host as string;

  try {
    // Resolve tenant from domain
    const tenant = await resolveTenantFromDomain(domain);
    
    if (!tenant || tenant.status !== 'active') {
      return res.status(404).json({ error: 'Site not found' });
    }
    
    // Get content for this tenant and slug
    const contentItems = await getTenantData(
      tenant.tenantId,
      'pages',
      (baseQuery) => query(baseQuery, where('slug', '==', slug))
    );
    
    if (!contentItems.length) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    // Return the content
    return res.status(200).json({ 
      content: contentItems[0],
      siteName: tenant.siteName
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
```

**Explanation:**
- Integrates tenant resolution with content fetching
- Properly scopes data access to the current tenant
- Handles error cases with appropriate HTTP responses

## Troubleshooting

### Cache Not Updating After Configuration Changes

**Symptoms:**
- Changes to tenant configuration in Firestore not reflected in the application
- Need to restart the server to see updates

**Diagnosis:**
```typescript
// Debug cache state
import { domainCache } from '@/lib/tenantResolver';

export function debugCacheState() {
  const stats = domainCache.getStats();
  const keys = domainCache.keys();
  
  console.log('Cache statistics:', stats);
  console.log('Cached domains:', keys);
  
  keys.forEach(key => {
    console.log(`Domain: ${key}`, domainCache.get(key));
  });
}
```

**Resolution:**
```typescript
// Add an API endpoint to invalidate cache when needed
// pages/api/admin/invalidate-cache.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { invalidateTenantCache } from '@/lib/tenantResolver';

// NOTE: This should be properly secured in production!
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Check for admin API key (implement proper auth in production!)
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { domain } = req.body;
  
  try {
    invalidateTenantCache(domain); // If domain is undefined, flushes entire cache
    
    return res.status(200).json({ 
      success: true, 
      message: domain 
        ? `Cache invalidated for domain: ${domain}` 
        : 'Entire cache invalidated' 
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to invalidate cache' });
  }
}
```

**Key Points:**
- Provides tools to inspect cache state for debugging
- Implements a secure API endpoint to manually invalidate cache when needed
- Can be extended to automatically invalidate cache when Firestore data changes using Firestore triggers