import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSiteByDomain } from './lib/site/siteService';
import { getCachedSite } from './lib/cache/siteCache';

// This middleware handles tenant resolution based on domain name
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