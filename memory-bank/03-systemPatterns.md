# System Patterns

**Last Updated:** April 11, 2025

This document describes the architecture, design patterns, and code organization principles used in the project.

## Architecture Overview

The multi-tenant website engine uses a single Next.js application to serve multiple distinct websites. The application identifies the requested tenant site based on the domain name, loads the appropriate configuration from Firestore (with caching for performance), and renders pages with tenant-specific styling and content.

### Core Components
* **Tenant Resolution Middleware** - Identifies tenant from domain and loads configuration
* **Site Context Provider** - Makes site configuration available throughout the application
* **Theme Provider** - Applies tenant-specific styling
* **Data Access Layer** - Ensures tenant data isolation in Firestore
* **Caching Layer** - Optimizes performance for domain resolution and configurations

### Component Interactions
The tenant resolution middleware intercepts HTTP requests and extracts the domain name. It then checks a local cache for the corresponding tenant configuration. If not found in cache, it queries Firestore. The resolved tenant context is then injected into the application through a context provider, making it available throughout the component tree and data fetching functions. When rendering pages or fetching data, the application uses the tenant context to apply appropriate styling and filter data queries.

## Design Patterns

### Context Provider Pattern
* **Purpose**: Share tenant configuration throughout the application
* **Implementation**: React Context API with a provider at the application root
* **Key Components**: `SiteContextProvider`, `useSiteContext` hook

### Repository Pattern
* **Purpose**: Abstract data access logic and enforce tenant data isolation
* **Implementation**: Service classes that handle Firestore queries with tenant filtering
* **Key Components**: `DataRepository` class with tenant-aware query methods

### Strategy Pattern
* **Purpose**: Apply different rendering strategies based on tenant configuration
* **Implementation**: Conditional component rendering based on tenant settings
* **Key Components**: Layout components that adapt to tenant configuration

### Singleton Pattern
* **Purpose**: Manage shared resources like the domain cache
* **Implementation**: Module with a single instance of the cache
* **Key Components**: `DomainCache` module

### Middleware Pattern
* **Purpose**: Intercept and process HTTP requests for tenant resolution
* **Implementation**: Next.js middleware function
* **Key Components**: `middleware.ts` file implementing domain resolution
* **Current Implementation**: Uses Next.js middleware API to extract hostnames from requests, resolve to tenant configurations via `getCachedSite` and `getSiteByDomain` functions, and sets both headers and cookies to make tenant information available to both server and client components. Handles special cases for maintenance mode and inactive sites, with development-specific behavior for site-not-found scenarios.

## Code Organization

### Directory Structure
```
[Project Root]
├── pages - Next.js pages
│   ├── _app.tsx - Application entry with context providers
│   ├── index.tsx - Homepage
│   ├── site-inactive.tsx - Error page for inactive sites
│   └── site-not-found.tsx - Error page for unknown domains
├── middleware.ts - Tenant resolution middleware
├── components - Reusable React components
│   ├── common - Shared components across all tenants
│   ├── layouts - Layout components that adapt to tenant config
│   │   └── MainLayout.tsx - Primary layout template
│   └── themes - Theme-specific components
├── lib - Core functionality
│   ├── cache - Caching implementations
│   │   └── siteCache.ts - Domain-to-tenant cache implementation
│   ├── firebase - Firebase/Firestore integration
│   │   ├── firebase.ts - Firebase initialization
│   │   └── schema.ts - Firestore data schema definitions
│   ├── site - Site context and configuration
│   │   ├── mockData.ts - Development data mocks
│   │   └── siteService.ts - Site data access methods
│   └── theme - Theming utilities
├── contexts - React context definitions
│   ├── SiteContext.tsx - Tenant site context
│   └── ThemeContext.tsx - Theming context
├── documents - Project documentation
│   ├── longer-term-optimizations.md - Technical roadmap
│   └── prd.md - Product Requirements Document
├── memory-bank - Project knowledge base
├── styles - Global styles and CSS variables
│   └── globals.css - Application-wide styles
└── next.config.js - Next.js configuration
```

### Module Responsibilities
* **pages**: Page components and API routes, with minimal logic
* **middleware.ts**: HTTP request interception and tenant resolution
* **components**: UI components that adapt to tenant configuration
* **lib**: Core business and data access logic
* **contexts**: React context definitions and providers
* **utils**: Helper functions and utilities
* **styles**: Global styles and CSS variables

## Data Flow

### Tenant Resolution Process
1. HTTP request arrives with a domain name
2. Middleware extracts domain from request
3. Check local cache for domain-to-tenant mapping
4. If not in cache, query Firestore for site configuration
5. Store result in cache for future requests
6. Attach tenant context to request for downstream use

### Page Rendering Process
1. Request for page URL arrives with tenant context attached
2. Next.js routing handles the URL path
3. Page component's data fetching methods use tenant context to filter data
4. React components render with tenant-specific configuration and styling
5. Tenant-specific theme is applied to the rendered HTML
6. Response is sent to the client

## Current Implementation Status

As of April 11, 2025, the following components of the architecture have been implemented:

1. **Project Structure** - Established the foundation with appropriate directories and configuration
2. **Middleware Pattern** - Created the initial implementation of middleware.ts for domain-based tenant resolution
3. **Context Definitions** - Set up SiteContext.tsx and ThemeContext.tsx for site configuration and theming
4. **Core Utilities** - Implemented initial versions of site services and caching utilities
5. **Error Handling** - Created error pages for site-not-found and site-inactive scenarios

Next planned implementation steps include:
1. Implementing the local caching for domain lookups
2. Completing the SiteContext provider
3. Creating the theme provider with CSS variables support

See the Kanban board in `memory-bank/07-kanban.md` for the detailed task status and priorities.

## Error Handling Strategy
* Graceful fallbacks for missing configurations
* Custom error pages for domain not found or inactive sites
* Structured error responses for API failures
* Comprehensive logging with tenant context
* Circuit breakers for external service dependencies

## Security Considerations
* Firestore security rules enforce tenant data isolation
* Input validation on all user-supplied data
* Sanitization of rendered content
* Strict CSP headers to prevent XSS
* Regular dependency updates to address vulnerabilities

## Scalability Considerations
* Optimized caching to reduce Firestore reads
* Efficient use of Next.js rendering strategies
* Horizontal scaling through multiple application instances
* Monitoring of Firestore usage to stay within limits
* Potential CDN integration for static assets and pages
* See `documents/longer-term-optimizations.md` for detailed future enhancements

## Future Architecture Evolution

The project has a comprehensive technical roadmap documented in `documents/longer-term-optimizations.md` that outlines advanced optimizations in several key areas:

1. **Edge Computing Integration** - Moving tenant resolution to edge functions for improved global performance
2. **Advanced Caching Strategies** - Event-driven cache invalidation beyond simple TTL-based approaches
3. **Serverless Optimization** - Techniques to mitigate cold starts and handle execution timeouts
4. **Firestore Scaling** - Data distribution strategies and cost management frameworks
5. **Component-Level Theming** - Enhanced customization beyond global CSS variables
6. **CDN & Image Pipeline** - Comprehensive content delivery strategies
7. **Security Enhancements** - Advanced Firestore rules and layered validation
8. **Testing Infrastructure** - Multi-tenant test fixtures and domain simulation tools
9. **Tenant-Specific Monitoring** - Observability with tenant context awareness

These optimization paths are designed to be implemented incrementally as the platform matures and tenant count increases.

## Cross-Cutting Concerns
* Logging with tenant context for debugging
* Performance monitoring per tenant
* Feature flags configurable per tenant
* Internationalization support
* Accessibility standards enforcement

## Testing Strategy
* Unit tests for core logic
* Integration tests for tenant resolution flow
* Component tests with mocked tenant contexts
* End-to-end tests simulating different domain requests
* Load testing for cache effectiveness and performance