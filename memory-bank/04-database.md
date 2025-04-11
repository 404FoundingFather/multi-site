# Database Documentation

**Last Updated:** April 11, 2025

This document outlines the database structure, relationships, and data management approach for the project.

## Database Technology

**Primary Database:** Firebase Firestore (Latest Version)
**Additional Datastores:** Local in-memory cache for domain resolution

## Data Models

### Site

**Description:** Represents a tenant website in the multi-tenant system

**Fields:**
| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| tenantId | string | Required, Unique | Unique identifier for the tenant |
| domainName | string | Required, Indexed | Primary domain name for the site |
| siteName | string | Required | Display name of the site |
| themeId | string | Required | Reference to theme configuration |
| status | string | Required, Enum: 'active', 'inactive' | Current site status |
| config | map | Optional | Additional site-specific configuration |
| logo | string | Optional | URL to site logo |
| contactInfo | map | Optional | Contact information for the site |
| createdAt | timestamp | Required | When the site was created |
| updatedAt | timestamp | Required | When the site was last updated |

**Relationships:**
- References Theme by themeId

### Theme

**Description:** Contains styling information for a tenant website

**Fields:**
| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| themeId | string | Required, Unique | Unique identifier for the theme |
| name | string | Required | Display name of the theme |
| styles | map | Required | CSS variables and styling information |
| fonts | array | Optional | Font references and loading information |
| components | map | Optional | Component-specific style overrides |
| createdAt | timestamp | Required | When the theme was created |
| updatedAt | timestamp | Required | When the theme was last updated |

**Relationships:**
- Referenced by Site.themeId

### Page

**Description:** Content page for a specific tenant

**Fields:**
| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| tenantId | string | Required, Indexed | ID of the tenant this page belongs to |
| slug | string | Required | URL path for this page |
| title | string | Required | Page title |
| content | string/map | Required | Page content (could be HTML or structured data) |
| meta | map | Optional | SEO metadata |
| status | string | Optional, Default: 'published' | Publication status |
| createdAt | timestamp | Required | When the page was created |
| updatedAt | timestamp | Required | When the page was last updated |

**Relationships:**
- Filtered by Site.tenantId for tenant isolation

## Entity Relationship Diagram

```
┌────────────┐         ┌────────────┐
│            │         │            │
│    Site    ├─────────► Theme      │
│            │ themeId │            │
└─────┬──────┘         └────────────┘
      │
      │ tenantId
      │
      │
┌─────▼──────┐
│            │
│    Page    │
│            │
└────────────┘
```

## Database Migrations

**Migration System:** Manual migrations via scripts (future: automated migration tool)

**Migration Commands:**
```
# Create Firestore indexes
firebase deploy --only firestore:indexes

# Apply security rules
firebase deploy --only firestore:rules

# Run data migration script
node scripts/migrate-data.js
```

## Query Patterns

### Common Queries

**Resolve domain to site configuration:**
```javascript
const siteRef = db.collection('sites').where('domainName', '==', domain).limit(1);
const siteSnapshot = await siteRef.get();
```

**Get all pages for a tenant:**
```javascript
const pagesRef = db.collection('pages').where('tenantId', '==', tenantId);
const pagesSnapshot = await pagesRef.get();
```

**Get a specific page by slug for a tenant:**
```javascript
const pageRef = db.collection('pages')
  .where('tenantId', '==', tenantId)
  .where('slug', '==', pageSlug)
  .limit(1);
const pageSnapshot = await pageRef.get();
```

**Resolve domain to site configuration with caching:**
```typescript
// Current implementation in tenant resolver
async function resolveTenantFromDomain(domain: string): Promise<TenantConfig | null> {
  // Check cache first
  const cachedTenant = getCachedTenant(domain);
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
    cacheTenant(domain, tenantData);
    
    return tenantData;
  } catch (error) {
    console.error('Error resolving tenant from domain:', error);
    throw error;
  }
}
```

### Performance Considerations

- Create composite indexes for all multi-field queries
- Use the local cache for frequently accessed site configurations
- Implement pagination for large collections using cursor-based pagination
- Structure queries to minimize Firestore read operations
- Consider denormalizing some data to reduce joins
- Monitor cache hit rates to optimize TTL settings
- Consider preloading common configurations during application startup

## Data Access Layer

**ORM/Data Access Framework:** Custom repositories with Firestore Admin SDK

**Key Files/Modules:**
- `lib/firebase/firebase.ts` - Firestore client initialization
- `lib/firebase/schema.ts` - Type definitions for database entities
- `lib/site/siteService.ts` - Site data access methods
- `lib/cache/siteCache.ts` - Domain resolution caching implementation

## Caching Strategy

### Domain Resolution Cache

**Purpose:** Reduce Firestore reads for tenant resolution during HTTP requests

**Implementation:** 
```typescript
// lib/cache/siteCache.ts
import NodeCache from 'node-cache';
import { TenantConfig } from '../firebase/schema';

// Initialize cache with TTL (time-to-live) in seconds
const domainCache = new NodeCache({
  stdTTL: parseInt(process.env.DOMAIN_CACHE_TTL || '300', 10),
  checkperiod: 60,
});

// Cache getter
export function getCachedTenant(domain: string): TenantConfig | undefined {
  return domainCache.get<TenantConfig>(domain);
}

// Cache setter
export function cacheTenant(domain: string, tenant: TenantConfig): boolean {
  return domainCache.set(domain, tenant);
}

// Cache invalidator
export function invalidateTenantCache(domain?: string): void {
  if (domain) {
    domainCache.del(domain);
  } else {
    domainCache.flushAll();
  }
}

// Cache statistics
export function getCacheStats() {
  return domainCache.getStats();
}
```

**Cache Invalidation:**
- Time-based (TTL) expiration for automatic refreshing
- Manual invalidation endpoints for immediate updates
- Cache flush capability for system-wide refreshes

## Firestore Security Rules

The following security rules enforce proper tenant isolation and access control:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Site collection security rules
    match /sites/{siteId} {
      // Admin can read/write all sites
      allow read, write: if request.auth != null && request.auth.token.admin == true;
      
      // Site owners can read their own site
      allow read: if request.auth != null && 
                  request.auth.token.tenantId == resource.data.tenantId;
    }
    
    // Pages collection security rules
    match /pages/{pageId} {
      // Admin can read/write all pages
      allow read, write: if request.auth != null && request.auth.token.admin == true;
      
      // Tenant users can only access their own pages
      allow read: if request.auth != null && 
                  request.auth.token.tenantId == resource.data.tenantId;
      
      // Tenant owners can write to their own pages
      allow write: if request.auth != null && 
                   request.auth.token.tenantId == resource.data.tenantId &&
                   request.auth.token.owner == true;
    }
    
    // Theme collection security rules
    match /themes/{themeId} {
      // Admin can read/write all themes
      allow read, write: if request.auth != null && request.auth.token.admin == true;
      
      // Public themes can be read by any authenticated user
      allow read: if request.auth != null && 
                  resource.data.visibility == 'public';
      
      // Private themes can only be read by their owners
      allow read: if request.auth != null && 
                  resource.data.visibility == 'private' &&
                  request.auth.token.tenantId == resource.data.ownerId;
    }
  }
}
```

These rules ensure:
- Strict tenant isolation for content
- Administrative access for platform managers
- Proper access controls for themes based on visibility
- Owner-only write permissions for tenant content

## Data Validation

- Server-side validation using validation libraries or custom validation
- Firestore security rules to enforce data integrity at the database level
- Input sanitization for all user-generated content
- Schema validation before writing to Firestore

## Backup and Recovery

- Regular exports of Firestore data using Firebase Admin SDK
- Automated backup schedule for all collections
- Documented recovery procedures using Firestore imports
- Tenant-specific recovery capabilities

## Security Measures

- Firestore security rules enforcing tenant isolation:
  ```
  match /pages/{document} {
    allow read: if request.auth != null && 
                 resource.data.tenantId == request.auth.token.tenantId;
  }
  ```
- Server-side enforcement of tenantId filtering for all queries
- Restricted access to site configuration data
- Encryption for sensitive configuration values
- Principle of least privilege for all database operations
