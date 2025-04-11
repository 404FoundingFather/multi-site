# Environment Documentation

**Last Updated:** April 11, 2025

This document provides detailed information about the development, staging, and production environments for the multi-tenant website engine.

## Local Development Environment

### Prerequisites
- Node.js - v18.x or later
- npm - v9.x or later
- Firebase CLI - Latest version
- Git - Latest version
- VS Code (recommended) or preferred IDE

### Setup Instructions
1. Clone the repository
2. Run `npm install` to install dependencies
3. Create a `.env.local` file with required environment variables
4. Set up Firebase project and download service account credentials
5. Run `npm run dev` to start development server

### Configuration
```
# Example .env.local file
FIREBASE_PROJECT_ID=multi-tenant-website-engine
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
CACHE_TTL=300 # Time in seconds for domain cache TTL
```

### Running Locally
```bash
# Start development server
npm run dev

# Run with domain mocking for testing specific tenants
npm run dev:mock-domain -- --domain=mycats.com
```

### Development Tools
- **Code Editor:** VS Code with ESLint, Prettier, and Firebase extensions
- **Debugging Tools:** Chrome DevTools, Next.js debugging configuration
- **Local Testing:** Jest for unit tests, Cypress for integration tests

## Staging Environment

### Access Details
- **URL:** https://staging.multi-tenant-engine.dev
- **Access Credentials:** Contact project administrator for access

### Deployment Process
1. Merge code to `staging` branch
2. Automated CI/CD pipeline deploys to staging environment
3. Verify tenant resolution and theme application

### Configuration Differences
- Staging uses a separate Firestore database
- Cache TTL settings optimized for testing (shorter duration)
- Error reporting more verbose than production

### Testing in Staging
- Test with all registered test domains
- Verify tenant isolation between sites
- Test performance with simulated load

## Production Environment

### Infrastructure
- **Hosting:** Vercel or Google Cloud Run (final decision pending)
- **Server Configuration:** Serverless/Edge functions for optimal scaling
- **Database:** Firebase Firestore in production mode
- **Other Services:** Firebase Auth, Cloud Storage, CDN

### Access Controls
- Production deployment limited to authorized team members
- Firestore production access restricted to admin team

### Deployment Process
1. Create release branch from `main`
2. Complete release checklist and testing
3. Deploy via CI/CD pipeline to production
4. Verify functionality with monitoring tools

### Monitoring
- **Tools:** Firebase Performance Monitoring, Sentry for error tracking
- **Alerts:** Set up for error rates, performance degradation, and cache misses
- **Logs:** Structured logging to Cloud Logging

### Backup and Recovery
- **Backup Schedule:** Daily Firestore backups
- **Backup Location:** Google Cloud Storage with appropriate retention
- **Recovery Process:** Documented disaster recovery procedure

## Environment Variables

| Variable Name | Development | Staging | Production | Description |
|---------------|-------------|---------|------------|-------------|
| NODE_ENV | development | production | production | Environment type |
| FIREBASE_PROJECT_ID | dev-project-id | staging-project-id | prod-project-id | Firebase project identifier |
| CACHE_TTL | 60 | 300 | 3600 | Domain mapping cache TTL (seconds) |
| DEBUG_MODE | true | false | false | Enable verbose logging |
| DOMAIN_OVERRIDE | optional | false | false | Override domain for testing |

## CI/CD Pipeline

### Tools
- GitHub Actions
- Vercel/Google Cloud Build integration

### Pipeline Stages
1. Lint & Format Check - Ensure code quality standards
2. Unit & Integration Tests - Validate functionality
3. Build - Create optimized production build
4. Deploy - Push to appropriate environment
5. Smoke Test - Verify critical paths post-deployment

### Configuration Files
- `.github/workflows/ci.yml` - CI pipeline configuration
- `.github/workflows/deploy.yml` - Deployment pipeline
- `vercel.json` - Vercel-specific configuration

## Security Considerations

### Environment-Specific Security
- Development: Local service account with limited permissions
- Staging: Restricted service account, temporary tokens
- Production: Locked-down permissions, security audit required for changes

### Secret Management
- GitHub Secrets for CI/CD pipeline
- Environment-specific Firebase service accounts
- Firestore Security Rules version controlled but deployed separately