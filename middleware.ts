/**
 * Next.js Middleware - Onboarding Guard
 * 
 * Intercepts all authenticated requests and redirects users with 
 * incomplete onboarding to /onboarding
 * 
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 * @see https://clerk.com/docs/references/nextjs/clerk-middleware
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// ============================================================================
// ROUTE MATCHERS
// ============================================================================

// Routes that don't require authentication at all
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/auth(.*)',
  '/sso-callback(.*)',
  '/select-organization(.*)', // Allow org selection without redirect loop
  '/create-organization(.*)', // Allow org creation
]);

// Onboarding flow - requires auth but not onboarding completion
const isOnboardingRoute = createRouteMatcher([
  '/onboarding(.*)',
]);

// API routes - require auth but skip org/onboarding checks
const isApiRoute = createRouteMatcher([
  '/api(.*)',
]);

const isStaticAsset = createRouteMatcher([
  '/_next(.*)',
  '/favicon.ico',
  '/images(.*)',
  '/fonts(.*)',
]);

// ============================================================================
// CONFIGURATION
// ============================================================================

const ENABLE_ONBOARDING_GUARD = process.env.NEXT_PUBLIC_ENABLE_ONBOARDING_GUARD !== 'false'; // Default: enabled

// ============================================================================
// MIDDLEWARE
// ============================================================================

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Allow public routes (landing page, sign-in, sign-up) - no auth required
  // ──────────────────────────────────────────────────────────────────────────
  if (isPublicRoute(req) || isStaticAsset(req)) {
    return NextResponse.next();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Protect all other routes (including API routes) - require authentication
  // ──────────────────────────────────────────────────────────────────────────
  // This ensures auth() works properly in API routes
  await auth.protect();

  const { userId, orgId } = await auth();

  // ──────────────────────────────────────────────────────────────────────────
  // 3. API routes - authenticated but skip org/onboarding checks
  // ──────────────────────────────────────────────────────────────────────────
  if (isApiRoute(req)) {
    console.log(`[middleware] API route ${pathname} - userId: ${userId} - allowing through`)
    return NextResponse.next();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Page routes - verify userId (should be set by auth.protect())
  // ──────────────────────────────────────────────────────────────────────────
  if (!userId) {
    console.error(`[middleware] No userId after auth.protect() for ${pathname}`)
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Allow onboarding routes (users create/select org during onboarding)
  // ──────────────────────────────────────────────────────────────────────────
  // IMPORTANT: This must come BEFORE org check because the onboarding flow
  // is where users create or select their organization!
  if (isOnboardingRoute(req)) {
    console.log(`[middleware] Onboarding route ${pathname} - allowing through`)
    return NextResponse.next();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Require organization for non-onboarding page routes
  // ──────────────────────────────────────────────────────────────────────────
  if (!orgId) {
    // User needs to select or create an organization
    console.log(`[middleware] No orgId for ${pathname}, redirecting to /select-organization`)
    const selectOrgUrl = new URL('/select-organization', req.url);
    selectOrgUrl.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(selectOrgUrl);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Check onboarding completion status for page routes
  // ──────────────────────────────────────────────────────────────────────────
  // NOTE: Middleware should NOT make HTTP requests to avoid infinite loops
  // Instead, we check for a client-side cookie/flag set by the onboarding flow
  
  if (!ENABLE_ONBOARDING_GUARD) {
    console.log('[middleware] Onboarding guard disabled');
    return NextResponse.next();
  }

  // Check for onboarding completion cookie
  const onboardingComplete = req.cookies.get('onboarding_complete')?.value === 'true';
  
  if (!onboardingComplete) {
    console.log(`[middleware] User ${userId} onboarding not complete, redirecting to /onboarding`);
    const onboardingUrl = new URL('/onboarding', req.url);
    return NextResponse.redirect(onboardingUrl);
  }

  // All good - allow through
  console.log(`[middleware] User ${userId} onboarding complete, allowing through to ${pathname}`);
  return NextResponse.next();
});

// ============================================================================
// MIDDLEWARE CONFIG
// ============================================================================

export const config = {
  // Match all routes except static files
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

