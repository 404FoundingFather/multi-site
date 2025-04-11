# Technical Context

**Last Updated:** April 11, 2025

This document outlines the technical stack, dependencies, and development environment for the project.

## Technology Stack

### Frontend
* Next.js - Latest stable version
* React - Latest compatible with Next.js
* CSS Variables - For dynamic theming

### Backend
* Next.js API Routes - For server-side functionality
* Next.js Middleware - For tenant resolution

### Database
* Firebase Firestore - For configuration and content storage

### Infrastructure
* Hosting Solution: TBD (Vercel or Google Cloud Run)
* CI/CD Tools: TBD
* Containerization: TBD

## Development Environment

### Requirements
* Node.js - Latest LTS version
* npm or yarn - Latest stable version
* Firebase CLI - For local Firestore emulation

### Setup Instructions
1. Clone the repository
2. Install dependencies using `npm install` or `yarn`
3. Set up Firebase project and configure credentials
4. Configure local environment variables
5. Start the development server using `npm run dev` or `yarn dev`

### Running Locally
```
npm run dev
# or
yarn dev
```

### Testing
```
npm test
# or
yarn test
```

## External Dependencies

### APIs
* Firebase Admin SDK - For Firestore access
* Firebase Client SDK - For client-side Firestore access (if needed)

### Third-Party Services
* Firebase Authentication (potential future use)
* Firebase Hosting (potential future use)

## Configuration

### Environment Variables
* `FIREBASE_API_KEY` - Firebase client API key
* `FIREBASE_AUTH_DOMAIN` - Firebase auth domain
* `FIREBASE_PROJECT_ID` - Firebase project ID
* `FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
* `FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
* `FIREBASE_APP_ID` - Firebase app ID
* `FIREBASE_ADMIN_CREDENTIALS` - Firebase admin credentials (as JSON or path to file)
* `DOMAIN_CACHE_TTL` - Time to live for domain cache in seconds
* `NODE_ENV` - Environment mode (development, production)

### Config Files
* `next.config.js` - Next.js configuration
* `firebase.json` - Firebase configuration
* `firestore.rules` - Firestore security rules

## Resource Links

### Documentation
* [Next.js Documentation](https://nextjs.org/docs)
* [Firebase Documentation](https://firebase.google.com/docs)
* [React Documentation](https://reactjs.org/docs)

### Code Repositories
* Main Repository - [Link to be added]

## Architecture Diagram
```
                               ┌─────────────────┐
                               │                 │
                               │    Firestore    │
                               │                 │
                               └────────▲────────┘
                                        │
                                        │ Query/Cache
                                        │
┌─────────────┐  HTTP Request  ┌────────▼────────┐
│             │                 │                 │
│   Browser   ├────────────────►│    Next.js     │
│             │                 │                 │
└─────────────┘  HTTP Response  └─────────────────┘
   (Domain A)                    (Single Instance)

```

## Technical Decisions
* Chosen Next.js for its versatile rendering options (SSR, SSG, ISR)
* Selected Firestore for its real-time capabilities and scalability
* Using local caching for domain resolution to minimize Firestore reads
* Implementing middleware for tenant identification and context injection