import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import type { CompleteStepRequest, CompleteStepResponse } from '@/lib/onboarding-types'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    const authResult = await auth()
    const { userId, orgId, getToken } = authResult
    
    console.log('[API /onboarding/complete] Auth context:', { userId, orgId })
    
    if (!userId) {
      console.error('[API /onboarding/complete] No userId found, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CompleteStepRequest = await request.json()
    const { step, payload } = body

    // Get Clerk session token for backend authentication
    // Use "backend" JWT template which includes org_id, org_name, org_role claims
    let token: string | null = null
    try {
      token = await getToken({ template: 'backend' })
    } catch (error) {
      console.warn('[API /onboarding/complete] Failed to get backend JWT template, trying default template:', error)
      try {
        token = await getToken() // Fall back to default template
      } catch (fallbackError) {
        console.error('[API /onboarding/complete] Failed to get any JWT token:', fallbackError)
        return NextResponse.json({ error: 'Failed to get session token' }, { status: 401 })
      }
    }
    
    if (!token) {
      return NextResponse.json({ error: 'No session token' }, { status: 401 })
    }

    console.log('[API /onboarding/complete] Calling backend - step:', step, 'orgId:', orgId || 'none')

    // Call real backend
    // IMPORTANT: Send org_id as custom header since JWT template doesn't include it
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
    
    // Always send org_id as custom header if available (backend will use this as fallback)
    if (orgId) {
      headers['x-organization-id'] = orgId
      console.log('[API /onboarding/complete] Adding x-organization-id header:', orgId)
    }
    
    const backendResponse = await fetch(`${BACKEND_URL}/onboarding/complete`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ step, payload }),
      // Short timeout to fail fast
      signal: AbortSignal.timeout(10000), // 10s for mutations (longer than GET)
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))
      console.error('[API /onboarding/complete] Backend error:', backendResponse.status, errorData)
      
      // Special handling for backend not recognizing step names
      // Backend may return 500 with "unknown_step: X" during early onboarding
      const isUnknownStepError = 
        backendResponse.status === 500 && 
        errorData.error && 
        typeof errorData.error === 'string' && 
        errorData.error.startsWith('unknown_step')
      
      // Special handling for 404 (no onboarding record), 409 org_required, or 403 forbidden (no org) error
      // If completing ORG_CHOICE step, this is expected (they're creating the org now)
      // For other steps, they need an org first
      const isOrgMissingError = 
        backendResponse.status === 404 ||
        (backendResponse.status === 409 && errorData.code === 'ORG_MISSING') ||
        (backendResponse.status === 403 && errorData.error === 'forbidden')
      
      if (isOrgMissingError || isUnknownStepError) {
        // ACCOUNT_VERIFIED step happens BEFORE org creation - allow it
        if (step === 'ACCOUNT_VERIFIED') {
          if (isUnknownStepError) {
            console.log('[API /onboarding/complete] ⚠️ Backend doesn\'t recognize ACCOUNT_VERIFIED - using frontend fallback')
          } else {
            console.log('[API /onboarding/complete] ACCOUNT_VERIFIED step - no org yet, this is expected')
          }
          return NextResponse.json({
            ok: true,
            nextStep: 'ORG_CHOICE',
            state: {
              currentStep: 'ORG_CHOICE',
              completedSteps: ['ACCOUNT_VERIFIED'],
              requiredSteps: ['ACCOUNT_VERIFIED', 'ORG_CHOICE', 'COMPANY_PROFILE', 'COMPLIANCE_INTAKE'],
              progress: 12.5,
            },
          })
        } else if (step === 'ORG_CHOICE') {
          console.log('[API /onboarding/complete] ORG_CHOICE step - user is creating org, this is expected')
          // Let the Clerk org creation handle it, return a mock success
          // The real backend sync will happen via webhooks
          return NextResponse.json({
            ok: true,
            nextStep: 'COMPANY_PROFILE',
            state: {
              currentStep: 'COMPANY_PROFILE',
              completedSteps: ['ACCOUNT_VERIFIED', 'ORG_CHOICE'],
              requiredSteps: ['ACCOUNT_VERIFIED', 'ORG_CHOICE', 'COMPANY_PROFILE', 'COMPLIANCE_INTAKE'],
              progress: 25,
            },
          })
        } else if (step === 'COMPANY_PROFILE') {
          console.log('[API /onboarding/complete] COMPANY_PROFILE step - org missing, allowing temporarily')
          // Org should exist by now, but if webhooks haven't synced yet, allow it
          return NextResponse.json({
            ok: true,
            nextStep: 'COMPLIANCE_INTAKE',
            state: {
              currentStep: 'COMPLIANCE_INTAKE',
              completedSteps: ['ACCOUNT_VERIFIED', 'ORG_CHOICE', 'COMPANY_PROFILE'],
              requiredSteps: ['ACCOUNT_VERIFIED', 'ORG_CHOICE', 'COMPANY_PROFILE', 'COMPLIANCE_INTAKE'],
              progress: 37.5,
            },
          })
        }
      }
      
      return NextResponse.json(
        { 
          error: errorData.message || 'Failed to complete step',
          ok: false,
          validationErrors: errorData.validationErrors, // Pass through Zod validation errors
        },
        { status: backendResponse.status }
      )
    }

    const data: CompleteStepResponse = await backendResponse.json()
    
    // Defensive check: backend might return unexpected format
    if (!data.state) {
      console.warn('[API /onboarding/complete] ⚠️ Backend returned success but no state object:', data)
      
      // Calculate correct next step based on frontend's required step order
      const requiredSteps: OnboardingStep[] = ['ACCOUNT_VERIFIED', 'ORG_CHOICE', 'COMPANY_PROFILE', 'COMPLIANCE_INTAKE']
      const currentStepIndex = requiredSteps.indexOf(step)
      const nextStep = currentStepIndex >= 0 && currentStepIndex < requiredSteps.length - 1
        ? requiredSteps[currentStepIndex + 1]
        : 'DONE'
      
      // Calculate completed steps (all steps up to and including current)
      const completedSteps = requiredSteps.slice(0, currentStepIndex + 1)
      const progress = Math.round((completedSteps.length / requiredSteps.length) * 100)
      
      console.log('[API /onboarding/complete] Constructed response:', {
        step,
        nextStep,
        completedSteps,
        progress,
      })
      
      // Construct a valid response
      return NextResponse.json({
        ok: true,
        nextStep,
        state: {
          currentStep: nextStep,
          completedSteps,
          requiredSteps,
          progress,
        },
      })
    }
    
    console.log('[API /onboarding/complete] Success:', {
      step,
      nextStep: data.nextStep,
      currentStep: data.state.currentStep,
      completedSteps: data.state.completedSteps,
    })

    // Set cookie for middleware if onboarding is complete
    const res = NextResponse.json(data)
    if (data.state.currentStep === 'DONE' || !data.nextStep) {
      res.cookies.set('onboarding_complete', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
      })
      
      console.log('[API /onboarding/complete] ✅ Onboarding marked complete')
    }

    return res
  } catch (error) {
    console.error('[API /onboarding/complete] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to complete step',
        ok: false,
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
