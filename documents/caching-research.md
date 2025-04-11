# Caching Strategy Research

**Last Updated:** April 11, 2025  
**Author:** Michael  
**Status:** In Progress

## Executive Summary

This document outlines research findings and recommendations for implementing an optimal caching strategy for domain resolution in our multi-tenant website engine. The current implementation uses a simple in-memory caching solution with time-based expiration, but this approach has limitations in a production environment. This research explores more robust caching solutions for improved performance, scalability, and reliability.

## Current Implementation Analysis

### Overview of Existing Solution

The current caching implementation in `lib/cache/siteCache.ts` is a basic in-memory solution:

```typescript
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
```

### Strengths of Current Implementation

- **Simplicity**: Easy to understand and implement
- **Low Overhead**: No external dependencies or services required
- **Fast Access**: Direct in-memory access provides minimal latency
- **Automatic Cleanup**: Expired entries are removed on access

### Limitations and Challenges

- **No Multi-Instance Support**: Cache is local to each server instance, causing inconsistency in a scaled deployment
- **Memory Leaks**: No size limits or LRU eviction policy
- **Simple Invalidation**: Only time-based expiration, no event-driven invalidation
- **No Persistence**: Cache is lost on server restarts
- **No Monitoring**: Lack of metrics for cache hit rates and performance
- **Limited Configurability**: TTL is hardcoded, not configurable per tenant or environment

## Caching Technology Comparison

### Local Memory Cache Solutions

#### Node.js In-Memory (Current)

- **Pros**: Zero dependencies, simplicity, extremely fast access
- **Cons**: No persistence, no multi-instance support, limited features
- **Best For**: Development environments, single-instance deployments, or very small-scale applications

#### Node-Cache Library

- **Pros**: More features (automatic cleaning, stats, events), still simple
- **Cons**: Still no persistence or multi-instance support
- **Best For**: Single-instance applications needing more sophisticated cache features
- **Implementation Complexity**: Low (1-2 hours)

#### LRU Cache

- **Pros**: Memory-bounded, evicts least recently used items when capacity is reached
- **Cons**: No persistence or multi-instance support
- **Best For**: Memory-constrained environments with high cache turnover
- **Implementation Complexity**: Low (2-3 hours)

### Distributed Cache Solutions

#### Redis

- **Pros**: 
  - Highly scalable and performant
  - Support for complex data types
  - Multi-instance support
  - Persistence options
  - Rich feature set (TTL, atomic operations)
  - Pub/sub mechanism for invalidation events
  - Extensive monitoring capabilities
  
- **Cons**: 
  - External dependency
  - Additional operational overhead
  - Network latency
  - Configuration complexity
  
- **Best For**: Production environments with multiple instances, high-traffic applications
- **Implementation Complexity**: Medium (1-2 days)
- **Cost Implications**: Managed Redis services range from $15-100/month depending on scale

#### Memcached

- **Pros**: 
  - Simpler than Redis
  - Fast for simple key-value storage
  - Multi-instance support
  
- **Cons**: 
  - Less feature-rich than Redis
  - No built-in persistence
  - Simpler data structures only
  
- **Best For**: Applications needing simple distributed caching
- **Implementation Complexity**: Medium (1-2 days)
- **Cost Implications**: Generally lower cost than Redis, $10-80/month for managed services

### Edge Caching Solutions

#### Vercel Edge Cache

- **Pros**: 
  - Integrated with our hosting platform
  - Global distribution
  - Zero additional setup for static assets
  - Stale-while-revalidate support
  
- **Cons**: 
  - Less control over cache behavior
  - Limited to HTTP responses (not for domain resolution data)
  
- **Best For**: Caching page responses, not internal data
- **Implementation Complexity**: Low for static content, Medium for dynamic content
- **Cost Implications**: Included with Vercel hosting

#### Cloudflare KV

- **Pros**: 
  - Global distribution
  - Low latency reads
  - Simple API
  
- **Cons**: 
  - Eventually consistent
  - Write latency higher than read
  - Limited data size
  
- **Best For**: Globally distributed small key-value data
- **Implementation Complexity**: Medium (1-2 days)
- **Cost Implications**: Starts free, then $0.50 per million reads

### Framework-Specific Solutions

#### Next.js SWR and React Query

- **Pros**: 
  - Integrated with React
  - Handles stale-while-revalidate pattern
  - Automatic revalidation
  
- **Cons**: 
  - Client-side only
  - Not suitable for server-side caching of domain resolution
  
- **Best For**: UI data caching, not middleware domain resolution
- **Implementation Complexity**: Low (4-8 hours)

## Cache Invalidation Strategies

### Time-Based Expiration (Current)

- **How It Works**: Cache entries automatically expire after a set time (TTL)
- **Pros**: Simple to implement, no additional systems needed
- **Cons**: Data may be stale up to the TTL duration, or unnecessarily refreshed if still valid
- **Implementation Complexity**: Low

### Event-Driven Invalidation

- **How It Works**: Cache is invalidated when related data changes
- **Options**:
  - Firebase Functions watching for document changes
  - Pub/Sub messaging system for change events
  - Webhooks triggered by admin actions
  
- **Example Implementation with Firebase**:
  ```typescript
  export const onSiteUpdate = functions.firestore
    .document('sites/{siteId}')
    .onWrite(async (change, context) => {
      const after = change.after.data();
      if (after) {
        // Call cache invalidation API or publish event
        await invalidateDomainCache(after.domainName);
      }
    });
  ```

- **Pros**: Immediate cache updates when data changes, optimal freshness
- **Cons**: More complex implementation, potential for thundering herd problem
- **Implementation Complexity**: Medium (1-2 days)

### Hybrid Approach

- **How It Works**: Combine time-based expiration with event-driven invalidation
- **Pros**: Balances simplicity with data freshness, provides fallback mechanism
- **Cons**: More complex than either approach alone
- **Implementation Complexity**: Medium

## Multi-Instance Caching Architecture

### Challenge
In a scaled deployment with multiple server instances, each instance would have its own memory cache, leading to inconsistencies and reduced cache hit rates.

### Proposed Solutions

#### Centralized Cache (Redis)

```
┌─────────────────┐       ┌─────────────────┐
│                 │       │                 │
│  Server         │◄─────►│  Redis Cache    │
│  Instance 1     │       │  Service        │
│                 │       │                 │
└─────────────────┘       └─────────────────┘
        ▲                         ▲
        │                         │
        │                         │
┌───────▼─────────┐       ┌───────▼─────────┐
│                 │       │                 │
│  Server         │◄─────►│  Firebase       │
│  Instance 2     │       │  Firestore      │
│                 │       │                 │
└─────────────────┘       └─────────────────┘
```

- **How It Works**: All server instances connect to a shared Redis cache
- **Pros**: Consistent cache across all instances, efficient use of cache memory
- **Cons**: Single point of failure unless clustered, network latency
- **Implementation Complexity**: Medium

#### Two-Level Caching

```
┌─────────────────┐       ┌─────────────────┐
│  Local Memory   │       │                 │
│  Cache          │◄─────►│  Redis Cache    │
│  (Instance 1)   │       │  Service        │
└─────────────────┘       │                 │
        ▲                 └─────────────────┘
        │                         ▲
        │                         │
┌───────▼─────────┐       ┌───────▼─────────┐
│  Local Memory   │       │                 │
│  Cache          │◄─────►│  Firebase       │
│  (Instance 2)   │       │  Firestore      │
└─────────────────┘       └─────────────────┘
```

- **How It Works**: Each instance has a local memory cache but also checks a shared distributed cache
- **Pros**: Fastest access for frequently used items, while maintaining consistency
- **Cons**: More complex implementation, potential for brief inconsistencies
- **Implementation Complexity**: High (3-4 days)

## Monitoring and Metrics

### Key Metrics to Track

- **Cache Hit Rate**: Percentage of cache lookups that find valid data
- **Cache Miss Rate**: Percentage of lookups that require database queries
- **Average Cache Latency**: Time taken to retrieve data from cache
- **Cache Size**: Current memory usage of the cache
- **Cache Entry Count**: Number of items in the cache
- **Invalidation Rate**: How often cache entries are invalidated or expired
- **Database Query Rate**: Number of database queries performed due to cache misses

### Implementation Options

#### Simple In-Code Metrics

```typescript
// Simple metrics tracking
const metrics = {
  hits: 0,
  misses: 0,
  totalLatency: 0,
};

export function getCachedSite(domainName: string): SiteConfig | null {
  const startTime = performance.now();
  
  // Existing cache lookup logic
  // ...
  
  const endTime = performance.now();
  
  if (result) {
    metrics.hits++;
  } else {
    metrics.misses++;
  }
  
  metrics.totalLatency += (endTime - startTime);
  
  return result;
}

// Expose metrics endpoint
export function getCacheMetrics() {
  return {
    ...metrics,
    hitRate: metrics.hits / (metrics.hits + metrics.misses) * 100,
    averageLatency: metrics.totalLatency / (metrics.hits + metrics.misses),
  };
}
```

- **Pros**: Simple, no external dependencies
- **Cons**: Lost on server restart, limited historical data
- **Implementation Complexity**: Low (2-4 hours)

#### Advanced Monitoring Integration

- **Options**:
  - Integrate with Application Performance Monitoring (APM) tools like New Relic or Datadog
  - Use OpenTelemetry for standardized metrics collection
  - Create admin dashboard for real-time monitoring

- **Pros**: Comprehensive monitoring, historical data, alerts
- **Cons**: Additional cost, setup complexity
- **Implementation Complexity**: High (3-5 days)

## Cache Size and Growth Management

### Challenges
- Unbounded cache growth can lead to memory issues
- Cold items waste memory but might be needed later
- Different tenants may have different cache needs

### Management Strategies

#### Maximum Entry Limit

```typescript
const MAX_CACHE_SIZE = 1000;

export function cacheSite(domainName: string, site: SiteConfig): void {
  // If at capacity, remove a random entry to make room
  if (Object.keys(siteCache).length >= MAX_CACHE_SIZE) {
    const keys = Object.keys(siteCache);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    delete siteCache[randomKey];
  }
  
  // Add new entry
  siteCache[domainName] = {
    site,
    timestamp: Date.now(),
  };
}
```

- **Pros**: Prevents unbounded growth
- **Cons**: Random eviction may remove important items
- **Implementation Complexity**: Low (1-2 hours)

#### LRU (Least Recently Used) Eviction

```typescript
// Using a library like lru-cache
import LRU from 'lru-cache';

const siteCache = new LRU({
  max: 1000, // Maximum items
  ttl: 5 * 60 * 1000, // 5 minutes
  updateAgeOnGet: true, // Update "recently used" on get operations
});

export function getCachedSite(domainName: string): SiteConfig | null {
  return siteCache.get(domainName);
}

export function cacheSite(domainName: string, site: SiteConfig): void {
  siteCache.set(domainName, site);
}
```

- **Pros**: Keeps most useful items in cache, automatic size management
- **Cons**: Requires library dependency
- **Implementation Complexity**: Low (2-3 hours)

#### Tenant-Based Prioritization

```typescript
// Tenant priorities (higher number = higher priority)
const TENANT_PRIORITIES = {
  'premium-tenant-1': 10,
  'premium-tenant-2': 10,
  'standard-tenant': 5,
  'default': 1
};

function getTenantPriority(site: SiteConfig): number {
  return TENANT_PRIORITIES[site.tenantId] || TENANT_PRIORITIES.default;
}

export function evictLowPriorityItems(): void {
  // Get all cache entries with priorities
  const entries = Object.entries(siteCache).map(([domain, cacheItem]) => ({
    domain,
    priority: getTenantPriority(cacheItem.site),
    timestamp: cacheItem.timestamp,
  }));
  
  // Sort by priority (ascending) and then by timestamp (ascending)
  entries.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.timestamp - b.timestamp;
  });
  
  // Remove 10% of the lowest priority/oldest entries
  const removeCount = Math.ceil(entries.length * 0.1);
  for (let i = 0; i < removeCount && i < entries.length; i++) {
    delete siteCache[entries[i].domain];
  }
}
```

- **Pros**: Prioritizes important tenants during cache pressure
- **Cons**: More complex implementation
- **Implementation Complexity**: Medium (4-6 hours)

## Production Implementation Recommendations

### Recommended Solution: Redis with Two-Level Caching

Based on the research, the recommended approach for a production-ready caching solution is:

1. **Redis as the Primary Cache Store**
   - Provides multi-instance consistency
   - Offers persistence options
   - Includes built-in monitoring
   - Supports advanced data structures and operations

2. **Local Memory Cache as Level 1**
   - Minimizes latency for frequent lookups
   - Reduces load on Redis
   - Improves response times

3. **Hybrid Invalidation Strategy**
   - Base TTL expiration (e.g., 30 minutes)
   - Event-driven invalidation through Firebase Functions or Redis pub/sub
   - Immediate propagation of important changes

### Implementation Plan

1. **Set up Redis Infrastructure**
   - Deploy Redis instance (managed service recommended)
   - Configure persistence and replication for reliability
   - Set up monitoring and alerts

2. **Create Redis Cache Service**
   ```typescript
   // lib/cache/redisCache.ts
   import { createClient } from 'redis';
   import { SiteConfig } from '../../contexts/SiteContext';
   
   const CACHE_TTL = 30 * 60; // 30 minutes in seconds
   
   class RedisCache {
     private client;
     private connected = false;
     
     constructor() {
       this.client = createClient({
         url: process.env.REDIS_URL
       });
       
       this.client.on('error', (err) => console.error('Redis error:', err));
       this.client.on('ready', () => {
         this.connected = true;
         console.log('Redis client connected');
       });
       
       this.connect();
     }
     
     private async connect() {
       try {
         await this.client.connect();
       } catch (error) {
         console.error('Redis connection failed:', error);
       }
     }
     
     async getCachedSite(domainName: string): Promise<SiteConfig | null> {
       if (!this.connected) return null;
       
       try {
         const data = await this.client.get(`site:${domainName}`);
         if (!data) return null;
         
         return JSON.parse(data);
       } catch (error) {
         console.error('Error getting cached site:', error);
         return null;
       }
     }
     
     async cacheSite(domainName: string, site: SiteConfig): Promise<void> {
       if (!this.connected) return;
       
       try {
         await this.client.set(
           `site:${domainName}`,
           JSON.stringify(site),
           { EX: CACHE_TTL }
         );
       } catch (error) {
         console.error('Error caching site:', error);
       }
     }
     
     async invalidateCache(domainName: string): Promise<void> {
       if (!this.connected) return;
       
       try {
         await this.client.del(`site:${domainName}`);
       } catch (error) {
         console.error('Error invalidating cache:', error);
       }
     }
     
     async publishInvalidation(domainName: string): Promise<void> {
       if (!this.connected) return;
       
       try {
         await this.client.publish('cache-invalidation', domainName);
       } catch (error) {
         console.error('Error publishing invalidation:', error);
       }
     }
     
     subscribeToInvalidations(callback: (domainName: string) => void): void {
       const subscriber = this.client.duplicate();
       
       subscriber.connect().then(() => {
         subscriber.subscribe('cache-invalidation', (message) => {
           callback(message);
         });
       });
     }
     
     async getCacheStats(): Promise<any> {
       if (!this.connected) return {};
       
       try {
         // This is simplified - real implementation would track more metrics
         const keys = await this.client.keys('site:*');
         return {
           count: keys.length,
           // More stats would be available in a real implementation
         };
       } catch (error) {
         console.error('Error getting cache stats:', error);
         return {};
       }
     }
   }
   
   // Export singleton instance
   export const redisCache = new RedisCache();
   ```

3. **Implement Two-Level Cache**
   ```typescript
   // lib/cache/siteCache.ts
   import { SiteConfig } from '../../contexts/SiteContext';
   import { redisCache } from './redisCache';
   
   // In-memory cache (Level 1)
   interface SiteCache {
     [domainName: string]: {
       site: SiteConfig;
       timestamp: number;
     };
   }
   
   const localCache: SiteCache = {};
   const LOCAL_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
   const MAX_LOCAL_CACHE_SIZE = 1000;
   
   // Metrics tracking
   const metrics = {
     localHits: 0,
     redisHits: 0,
     misses: 0,
     totalLatency: 0,
   };
   
   // Subscribe to invalidation events
   redisCache.subscribeToInvalidations((domainName: string) => {
     console.log(`Received invalidation for domain: ${domainName}`);
     delete localCache[domainName];
   });
   
   export async function getCachedSite(domainName: string): Promise<SiteConfig | null> {
     const startTime = performance.now();
     let result: SiteConfig | null = null;
     
     // Check local cache first
     const localCacheItem = localCache[domainName];
     if (localCacheItem) {
       const now = Date.now();
       if (now - localCacheItem.timestamp <= LOCAL_CACHE_TTL_MS) {
         result = localCacheItem.site;
         metrics.localHits++;
       } else {
         // Local cache expired, remove it
         delete localCache[domainName];
       }
     }
     
     // If not in local cache, check Redis
     if (!result) {
       result = await redisCache.getCachedSite(domainName);
       
       if (result) {
         // Found in Redis, update local cache
         cacheSiteLocally(domainName, result);
         metrics.redisHits++;
       } else {
         // Not in Redis either
         metrics.misses++;
       }
     }
     
     // Update metrics
     const endTime = performance.now();
     metrics.totalLatency += (endTime - startTime);
     
     return result;
   }
   
   export async function cacheSite(domainName: string, site: SiteConfig): Promise<void> {
     // Update both caches
     cacheSiteLocally(domainName, site);
     await redisCache.cacheSite(domainName, site);
   }
   
   function cacheSiteLocally(domainName: string, site: SiteConfig): void {
     // Ensure we don't exceed max size
     if (Object.keys(localCache).length >= MAX_LOCAL_CACHE_SIZE) {
       // Simple LRU: remove oldest entry
       let oldestTimestamp = Infinity;
       let oldestDomain = '';
       
       for (const [domain, cacheItem] of Object.entries(localCache)) {
         if (cacheItem.timestamp < oldestTimestamp) {
           oldestTimestamp = cacheItem.timestamp;
           oldestDomain = domain;
         }
       }
       
       if (oldestDomain) {
         delete localCache[oldestDomain];
       }
     }
     
     // Add to local cache
     localCache[domainName] = {
       site,
       timestamp: Date.now(),
     };
   }
   
   export async function invalidateCache(domainName: string): Promise<void> {
     // Remove from local cache
     delete localCache[domainName];
     
     // Remove from Redis and notify other instances
     await redisCache.invalidateCache(domainName);
     await redisCache.publishInvalidation(domainName);
   }
   
   export function clearLocalCache(): void {
     for (const key in localCache) {
       delete localCache[key];
     }
   }
   
   export async function getCacheMetrics(): Promise<any> {
     const totalRequests = metrics.localHits + metrics.redisHits + metrics.misses;
     const redisStats = await redisCache.getCacheStats();
     
     return {
       local: {
         size: Object.keys(localCache).length,
         hitRate: totalRequests > 0 ? (metrics.localHits / totalRequests) * 100 : 0,
       },
       redis: {
         ...redisStats,
         hitRate: totalRequests > 0 ? (metrics.redisHits / totalRequests) * 100 : 0,
       },
       overall: {
         requests: totalRequests,
         hitRate: totalRequests > 0 ? ((metrics.localHits + metrics.redisHits) / totalRequests) * 100 : 0,
         averageLatency: totalRequests > 0 ? metrics.totalLatency / totalRequests : 0,
         missRate: totalRequests > 0 ? (metrics.misses / totalRequests) * 100 : 0,
       }
     };
   }
   ```

4. **Implement Event-Driven Invalidation**
   ```typescript
   // functions/src/index.ts (Firebase Functions)
   import * as functions from 'firebase-functions';
   import fetch from 'node-fetch';
   
   const API_KEY = process.env.CACHE_INVALIDATION_API_KEY;
   const API_ENDPOINT = process.env.CACHE_INVALIDATION_ENDPOINT;
   
   export const invalidateCache = functions.firestore
     .document('sites/{siteId}')
     .onWrite(async (change, context) => {
       // Only proceed if document exists after the write
       if (!change.after.exists) return null;
       
       const afterData = change.after.data();
       
       // Check if domain name exists
       if (!afterData || !afterData.domainName) return null;
       
       const domainName = afterData.domainName;
       
       try {
         // Call invalidation API endpoint
         const response = await fetch(`${API_ENDPOINT}/invalidate`, {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${API_KEY}`,
           },
           body: JSON.stringify({ domainName }),
         });
         
         if (!response.ok) {
           console.error('Failed to invalidate cache:', await response.text());
           return null;
         }
         
         console.log(`Successfully invalidated cache for domain: ${domainName}`);
         return { success: true };
       } catch (error) {
         console.error('Error invalidating cache:', error);
         return null;
       }
     });
   ```

5. **Create Cache Admin API**
   ```typescript
   // pages/api/admin/cache/[action].ts
   import type { NextApiRequest, NextApiResponse } from 'next';
   import { getCacheMetrics, invalidateCache, clearLocalCache } from '../../../../lib/cache/siteCache';

   // Simple API key validation
   const validateApiKey = (req: NextApiRequest): boolean => {
     const apiKey = req.headers.authorization?.replace('Bearer ', '');
     return apiKey === process.env.CACHE_ADMIN_API_KEY;
   };

   export default async function handler(
     req: NextApiRequest,
     res: NextApiResponse
   ) {
     // Validate API key
     if (!validateApiKey(req)) {
       return res.status(401).json({ error: 'Unauthorized' });
     }

     const { action } = req.query;

     switch (action) {
       case 'stats':
         // Get cache metrics
         const metrics = await getCacheMetrics();
         return res.status(200).json(metrics);

       case 'invalidate':
         // Invalidate specific domain
         if (!req.body.domainName) {
           return res.status(400).json({ error: 'domainName is required' });
         }

         await invalidateCache(req.body.domainName);
         return res.status(200).json({ success: true });

       case 'clear-local':
         // Clear only local cache
         clearLocalCache();
         return res.status(200).json({ success: true });

       default:
         return res.status(400).json({ error: 'Invalid action' });
     }
   }
   ```

### Cost Analysis

**Development Costs:**
- Redis Cache Implementation: 2-3 developer days
- Event-Driven Invalidation: 1-2 developer days
- Monitoring Setup: 1-2 developer days
- Testing: 2-3 developer days
- Total: 6-10 developer days

**Infrastructure Costs:**
- Redis managed service: $15-50/month (based on size and provider)
- Firebase Functions (for invalidation): $0-$10/month (depends on update frequency)
- Monitoring tools: $0-$20/month (optional)
- Total Monthly Cost: ~$15-80/month

**Performance Benefits:**
- 30-50% reduction in database queries
- 40-60% improvement in average response times
- Better scalability for multi-instance deployments
- More consistent performance under load

## Conclusion and Next Steps

Based on this research, the recommended approach for optimal domain resolution caching is a two-level caching strategy with Redis as the distributed cache and a local in-memory cache for frequently accessed items. This approach balances performance, scalability, and operational complexity.

### Next Steps

1. **Finalize Technology Selection**
   - Choose Redis provider (AWS ElastiCache, Redis Labs, etc.)
   - Determine cache sizing based on tenant volume projections

2. **Implementation Phases**
   - Phase 1: Implement Redis cache with basic operations
   - Phase 2: Add local memory caching layer
   - Phase 3: Implement monitoring and metrics
   - Phase 4: Add event-driven invalidation

3. **Testing Strategy**
   - Performance testing with varying cache hit rates
   - Multi-instance consistency testing
   - Failure recovery scenarios

4. **Documentation and Training**
   - Document cache behavior for development team
   - Create operational procedures for cache management
   - Define cache-related alerts and incident response

## References

- [Redis Documentation](https://redis.io/documentation)
- [Next.js Caching Strategies](https://nextjs.org/docs/architecture/caching)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Web Caching Best Practices](https://web.dev/fast/#optimize-your-server)
- [System Design: Distributed Cache](https://medium.com/@narengowda/system-design-distributed-cache-b7facee9f77f)