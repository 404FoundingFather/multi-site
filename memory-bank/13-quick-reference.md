# Quick Reference Guide

**Last Updated:** April 11, 2025

This document provides quick access to frequently needed information, commands, terms, and file locations for the project.

## Project Glossary

| Term | Definition |
|------|------------|
| Tenant | A distinct website hosted within the multi-tenant engine |
| Site Configuration | Firestore document containing tenant-specific settings |
| Tenant Resolution | Process of identifying which tenant to serve based on domain |
| Theme | Set of styling rules and visual elements for a tenant |
| Site Context | React context containing tenant configuration |
| Domain Mapping | Association between a domain name and a tenant |
| Local Cache | In-memory storage for domain-to-tenant mappings |
| Middleware | Next.js function that intercepts HTTP requests |

## Common Commands

### Development

```bash
# Start the development server
npm run dev

# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

### Firestore

```bash
# Start Firestore emulator for local development
firebase emulators:start --only firestore

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

### Deployment

```bash
# Build for production
npm run build

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

### Docker (if applicable)

```bash
# Build container
docker build -t multi-tenant-engine .

# Run container
docker run -p 3000:3000 multi-tenant-engine

# Stop container
docker stop <container_id>
```

## Key File Locations

### Documentation Files
- **Product Requirements**: `documents/prd.md`
- **Long-term Optimizations**: `documents/longer-term-optimizations.md`

### Configuration Files
- **Next.js Config**: `next.config.js`
- **Firebase Config**: `lib/firebase/config.js`
- **Environment Variables**: `.env.local` (development)

### Important Source Files
- **Tenant Resolution**: `middleware.ts`
- **Site Context**: `contexts/SiteContext.js`
- **Theme Provider**: `contexts/ThemeContext.js`
- **Firestore Client**: `lib/firebase/firestore.js`

### Test Files
- **Unit Tests**: `__tests__/unit/`
- **Integration Tests**: `__tests__/integration/`
- **Test Utilities**: `__tests__/utils/`

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| FIREBASE_API_KEY | Firebase client API key | `abcdefghijklmnopqrst` |
| FIREBASE_AUTH_DOMAIN | Firebase auth domain | `project-id.firebaseapp.com` |
| FIREBASE_PROJECT_ID | Firebase project ID | `multi-tenant-engine` |
| FIREBASE_STORAGE_BUCKET | Firebase storage bucket | `project-id.appspot.com` |
| FIREBASE_MESSAGING_SENDER_ID | Messaging sender ID | `123456789012` |
| FIREBASE_APP_ID | Firebase application ID | `1:123456789012:web:abcdef` |
| DOMAIN_CACHE_TTL | Cache TTL in seconds | `300` |
| NODE_ENV | Environment mode | `development` |

## API Endpoints

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|--------------|
| `/api/site` | GET | Get current site configuration | No |
| `/api/pages` | GET | Get pages for current tenant | No |
| `/api/pages/[slug]` | GET | Get specific page by slug | No |
| `/api/theme` | GET | Get current site theme | No |
| `/api/admin/sites` | GET | List all sites | Yes |
| `/api/admin/sites` | POST | Create new site | Yes |
| `/api/admin/sites/[id]` | PUT | Update site configuration | Yes |

## Database Information

### Connection Details
- **Development**: Firebase Emulator (localhost:8080)
- **Staging**: Firebase Project - Staging Environment
- **Production**: Firebase Project - Production Environment

### Key Collections
- **sites**: Tenant website configurations
- **themes**: Theme definitions
- **pages**: Content pages for each tenant
- **posts**: Blog posts for each tenant (if applicable)
- **products**: Product listings for each tenant (if applicable)

## Common Issues & Solutions

### Site Not Found for Domain
**Problem**: Application returns "Site not found" for a valid domain
**Solution**: Check that domain is correctly added to the sites collection in Firestore with exact spelling

### Theme Not Applied Correctly
**Problem**: Site loads but styling is incorrect or default
**Solution**: Verify themeId in site configuration matches an existing theme document in Firestore

### Cache Not Updating
**Problem**: Changes to site configuration not reflected immediately
**Solution**: Manually clear the cache using the admin API or restart the server

## External Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://reactjs.org/docs)

### Tools
- [Firebase Console](https://console.firebase.google.com/)
- [Vercel Dashboard](https://vercel.com/dashboard) (if hosting on Vercel)
- [Google Cloud Console](https://console.cloud.google.com/) (if using GCP)