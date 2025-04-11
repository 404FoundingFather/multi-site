# Multi-Tenant Website Engine

A powerful and scalable solution for hosting multiple distinct websites from a single Next.js application, using Firebase Firestore for configuration and content management.

![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-Next.js-black)
![Database](https://img.shields.io/badge/database-Firestore-orange)

## Overview

The Multi-Tenant Website Engine enables you to host and serve multiple independent websites ("tenants") from a single Next.js application instance. The system dynamically determines which website to serve based on the domain name of the incoming request, applying tenant-specific configurations, styling, and content.

### Key Features

- **Domain-Based Routing**: Automatically identify and serve the correct tenant website based on domain name
- **Tenant Isolation**: Complete data isolation between different tenant websites
- **Custom Styling**: Apply unique themes and styling to each tenant
- **Efficient Caching**: Local cache system for domain resolution to minimize database queries
- **Scalable Architecture**: Designed to handle a growing number of tenant sites with minimal overhead
- **Single Codebase**: Maintain one codebase to power multiple websites, simplifying deployment and updates

## Architecture

This engine uses a middleware-driven approach to intercept incoming requests, identify the appropriate tenant, and serve the correct content:

```
Request Flow:
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌───────────────┐
│  Incoming   │     │   Domain     │     │    Site      │     │   Rendered    │
│  Request    ├────►│ Resolution   ├────►│ Context &    ├────►│     Page      │
│             │     │ Middleware   │     │   Theming    │     │               │
└─────────────┘     └──────────────┘     └──────────────┘     └───────────────┘
                           │                     ▲
                           ▼                     │
                    ┌──────────────┐     ┌──────────────┐
                    │    Cache     │     │  Firestore   │
                    │              │◄───►│  Database    │
                    └──────────────┘     └──────────────┘
```

### Core Components

- **Tenant Resolution Middleware**: Identifies tenant from domain and loads configuration
- **Site Context Provider**: Makes site configuration available throughout the application
- **Theme Provider**: Applies tenant-specific styling
- **Data Access Layer**: Ensures tenant data isolation in Firestore
- **Caching Layer**: Optimizes performance for domain resolution and configurations

## Getting Started

### Prerequisites

- Node.js (v18.x or later)
- npm (v9.x or later)
- Firebase project with Firestore enabled
- Git

### Installation

1. Clone this repository:
   ```bash
   git clone https://your-repo-url/multi-tenant-website-engine.git
   cd multi-tenant-website-engine
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your Firebase configuration:
   ```
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_CLIENT_EMAIL=your-client-email
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   CACHE_TTL=300
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Setting Up Tenants

1. Create a new site document in your Firestore `sites` collection:

   ```javascript
   {
     "tenantId": "site1",
     "domainName": "example.com",
     "siteName": "Example Site",
     "themeId": "default",
     "status": "active",
     "config": {
       "logo": "https://example.com/logo.png",
       "contactEmail": "contact@example.com"
     }
   }
   ```

2. Create a theme document in the `themes` collection:

   ```javascript
   {
     "name": "Default Theme",
     "styles": {
       "primaryColor": "#3f51b5",
       "secondaryColor": "#f50057",
       "backgroundColor": "#ffffff",
       "textColor": "#333333",
       "fontFamily": "'Roboto', sans-serif"
     }
   }
   ```

3. For local development, you can use the domain mocking feature:
   ```bash
   npm run dev:mock-domain -- --domain=example.com
   ```

## Project Documentation

Detailed documentation is available in the `documents/` directory:

- `prd.md` - Product Requirements Document with detailed specifications
- `longer-term-optimizations.md` - Technical roadmap for future enhancements

## Development

### Directory Structure

```
├── components/ - Reusable React components
│   ├── common/ - Shared components across all tenants
│   ├── layouts/ - Layout components that adapt to tenant config
│   └── themes/ - Theme-specific components
├── contexts/ - React context definitions
├── documents/ - Project documentation
├── lib/ - Core functionality
│   ├── cache/ - Caching implementations
│   ├── firebase/ - Firebase/Firestore integration
│   ├── site/ - Site context and configuration
│   └── theme/ - Theming utilities
├── memory-bank/ - Project knowledge base
├── middleware.ts - Tenant resolution middleware
├── pages/ - Next.js pages
├── public/ - Static assets
└── styles/ - Global styles and CSS variables
```

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality
- `npm test` - Run tests
- `npm run dev:mock-domain -- --domain=example.com` - Run with domain mocking

## Deployment

The Multi-Tenant Website Engine can be deployed to Vercel, Google Cloud Run, or any other hosting service that supports Next.js applications. Additional configuration is required for handling custom domains:

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to your hosting service following their specific instructions.

3. Configure DNS settings for each tenant domain to point to your deployed application.

## Roadmap

See `documents/longer-term-optimizations.md` for the detailed technical roadmap, which includes:

1. Edge Middleware Implementation
2. Advanced Cache Invalidation Strategies
3. Serverless Function Optimization
4. Firestore Scalability Enhancements
5. Theming System Improvements
6. Content Delivery Architecture Optimization
7. Security Enhancements
8. Testing Infrastructure Improvements
9. Monitoring and Observability Enhancements

## Contributing

Contributions to the Multi-Tenant Website Engine are welcome! Please refer to the contribution guidelines for details.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- The Next.js team for the powerful framework
- Firebase for the flexible database and authentication services
- All contributors to this project