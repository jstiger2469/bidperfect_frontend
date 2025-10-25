import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { OnboardingStateResponse, OnboardingStep } from '@/lib/onboarding-types'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function GET() {
  try {
    const authResult = await auth()
    const { userId, orgId, getToken } = authResult
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[API /onboarding/state] Auth context:', { userId, orgId })

    // Get Clerk session token for backend authentication
    // Use "backend" JWT template which includes org_id, org_name, org_role claims
    let token: string | null = null
    try {
      token = await getToken({ template: 'backend' })
    } catch (error) {
      console.warn('[API /onboarding/state] Failed to get backend JWT template, trying default template:', error)
      try {
        token = await getToken() // Fall back to default template
      } catch (fallbackError) {
        console.error('[API /onboarding/state] Failed to get any JWT token:', fallbackError)
        return NextResponse.json({ error: 'Failed to get session token' }, { status: 401 })
      }
    }
    
    if (!token) {
      return NextResponse.json({ error: 'No session token' }, { status: 401 })
    }

    // Decode JWT to see what claims are actually in it
    const tokenPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    console.log('[API /onboarding/state] JWT claims:', {
      org_id: tokenPayload.org_id,
      org_role: tokenPayload.org_role,
      org_slug: tokenPayload.org_slug,
      hasOrgClaim: !!tokenPayload.org_id,
    })

    console.log('[API /onboarding/state] Fetching from backend for user:', userId, 'orgId:', orgId || 'none')

    // Call real backend
    // IMPORTANT: Send org_id as custom header since JWT template doesn't include it
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
    
    // If JWT doesn't have org_id but auth context does, send as custom header
    if (orgId && !tokenPayload.org_id) {
      headers['x-organization-id'] = orgId
      console.log('[API /onboarding/state] Adding x-organization-id header:', orgId)
    }
    
    const backendResponse = await fetch(`${BACKEND_URL}/onboarding/state`, {
      method: 'GET',
      headers,
      // Short timeout to fail fast
      signal: AbortSignal.timeout(5000),
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))
      console.error('[API /onboarding/state] Backend error:', backendResponse.status, errorData)
      
      // Special handling for 404 (not found) or 409 (org_required) errors during onboarding
      // These both mean the user hasn't completed onboarding yet, so return a default state
      const shouldReturnDefault = 
        backendResponse.status === 404 || 
        (backendResponse.status === 409 && errorData.code === 'ORG_MISSING')
      
      if (shouldReturnDefault) {
        const reason = backendResponse.status === 404 
          ? 'No onboarding record found' 
          : 'User has no org yet'
        console.log(`[API /onboarding/state] ${reason} - returning default onboarding state`)
        
        // Get user from Clerk to populate user data
        const { clerkClient } = await import('@clerk/nextjs/server')
        const client = await clerkClient()
        const clerkUser = await client.users.getUser(userId)
        
        const primaryEmail = clerkUser.emailAddresses.find(
          (email) => email.id === clerkUser.primaryEmailAddressId
        )
        const emailVerified = primaryEmail?.verification?.status === 'verified'
        
        // Return default state starting from ACCOUNT_VERIFIED or ORG_CHOICE
        const defaultState: OnboardingStateResponse = {
          state: {
            currentStep: emailVerified ? 'ORG_CHOICE' : 'ACCOUNT_VERIFIED',
            completedSteps: emailVerified ? ['ACCOUNT_VERIFIED'] : [],
            requiredSteps: ['ACCOUNT_VERIFIED', 'ORG_CHOICE', 'COMPANY_PROFILE', 'COMPLIANCE_INTAKE'],
            progress: emailVerified ? 25 : 0,
            stepData: {},
          } as any,
          user: {
            id: userId,
            email: primaryEmail?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress || '',
            emailVerified,
            mfaEnabled: clerkUser.twoFactorEnabled || false,
          },
        }
        
        return NextResponse.json(defaultState)
      }
      
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch onboarding state' },
        { status: backendResponse.status }
      )
    }

    const backendData = await backendResponse.json()
    
    console.log('[API /onboarding/state] Backend response:', JSON.stringify(backendData, null, 2))
    
    // Transform backend response to match frontend expected format
    // Backend uses: { currentState, nextStep, completedSteps, requiredSteps, ... }
    // Frontend expects: { state: { currentStep, completedSteps, requiredSteps, progress }, user: { ... } }
    
    const completedSteps = (backendData.completedSteps || []) as OnboardingStep[]
    // All onboarding steps (blocking + optional)
    // Users can skip optional steps (INTEGRATIONS, TEAM, FIRST_RFP) but must complete blocking steps
    const requiredSteps: OnboardingStep[] = [
      'ACCOUNT_VERIFIED',
      'ORG_CHOICE',
      'COMPANY_PROFILE',
      'COMPLIANCE_INTAKE',
      'INTEGRATIONS',  // Optional - can skip
      'TEAM',          // Optional - can skip
      'FIRST_RFP',     // Optional - can skip
    ]
    
    // Calculate the CORRECT next step based on what's actually been completed
    // Don't trust the backend's nextStep - it uses different step names
    let currentStep: OnboardingStep = 'ACCOUNT_VERIFIED'
    
    for (const step of requiredSteps) {
      if (!completedSteps.includes(step)) {
        currentStep = step
        break
      }
    }
    
    // If all required steps are complete, mark as DONE
    if (completedSteps.length >= requiredSteps.length) {
      currentStep = 'DONE' as OnboardingStep
    }
    
    console.log('[API /onboarding/state] Calculated currentStep:', {
      completedSteps,
      requiredSteps,
      calculatedStep: currentStep,
      backendNextStep: backendData.nextStep,
    })
    
    // Calculate progress (percentage of completed steps)
    const progress = requiredSteps.length > 0
      ? Math.round((completedSteps.length / requiredSteps.length) * 100)
      : 0
    
    // Get user info from Clerk
    const clerkUser = await currentUser()
    
    // Build frontend-compatible response
    const data: OnboardingStateResponse = {
      state: {
        currentStep,
        completedSteps,
        requiredSteps,
        progress,
        stepData: backendData.metadata || {},
      },
      user: {
        id: userId,
        email: clerkUser?.emailAddresses[0]?.emailAddress || '',
        emailVerified: clerkUser?.emailAddresses[0]?.verification?.status === 'verified',
        mfaEnabled: clerkUser?.twoFactorEnabled || false,
      },
    }
    
    console.log('[API /onboarding/state] Success (transformed):', {
      currentStep: data.state.currentStep,
      completedSteps: data.state.completedSteps,
      progress: data.state.progress,
    })

    // Set cookie for middleware if onboarding is complete
    const res = NextResponse.json(data)
    if (data.state.currentStep === 'DONE') {
      res.cookies.set('onboarding_complete', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
      })
    }

    return res
  } catch (error) {
    console.error('[API /onboarding/state] Error:', error)
    
    // Return error response
    return NextResponse.json(
      { error: 'Failed to fetch onboarding state', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

