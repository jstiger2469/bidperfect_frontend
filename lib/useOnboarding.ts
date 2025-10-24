/**
 * Onboarding hooks - Integrates Zustand store + React Query + Backend API
 * 
 * Architecture:
 * 1. Zustand: UI state cache (5-min TTL)
 * 2. React Query: Async state management + auto-refetch
 * 3. Backend: Source of truth (PostgreSQL via rfp-api)
 * 4. Cookies: Middleware check (onboarding_complete flag)
 * 
 * Flow:
 * - Component mounts → useOnboardingState() → check Zustand cache
 * - If cache valid → return cached data
 * - If cache stale → fetch from backend → update Zustand + React Query
 * - User completes step → optimistic update Zustand → call backend → sync on success
 */

import React, { useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { 
  OnboardingStateResponse, 
  CompleteStepRequest, 
  CompleteStepResponse,
  OnboardingStep,
} from './onboarding-types'
import { useOnboardingStore } from './stores/onboardingStore'
import isEqual from 'lodash.isequal'

/**
 * Fetch onboarding state from backend (via frontend API route)
 * 
 * RESILIENCE STRATEGY:
 * 1. On mount: Use localStorage cache if valid (< 5 min old)
 * 2. Fetch from backend in background
 * 3. If backend succeeds: merge with localStorage (backend wins for completed steps)
 * 4. If backend fails: continue using localStorage (graceful degradation)
 */
export function useOnboardingState() {
  const store = useOnboardingStore()
  
  return useQuery({
    queryKey: ['onboarding', 'state'],
    queryFn: async (): Promise<OnboardingStateResponse> => {
      console.log('[useOnboardingState] Fetching from backend...')
      store.setState({ isLoading: true, error: null })
      
      // Get localStorage cache as fallback
      const cachedState = {
        currentStep: store.currentStep,
        completedSteps: store.completedSteps,
        requiredSteps: store.requiredSteps,
        progress: store.progress,
        stepData: store.stepData,
        user: store.user,
      }
      
      try {
        const res = await fetch('/api/onboarding/state', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        
        if (!res.ok) {
          const error = await res.json().catch(() => ({ error: 'Unknown error' }))
          console.warn('[useOnboardingState] Backend error, using localStorage fallback:', error)
          
          // If we have cached data, use it (graceful degradation)
          if (cachedState.currentStep) {
            store.setState({ isLoading: false, error: null }) // Clear error since we have fallback
            return {
              state: {
                ...cachedState,
                currentStep: cachedState.currentStep, // TypeScript: already checked non-null
              },
              user: cachedState.user || { id: '', email: '', emailVerified: false },
            }
          }
          
          // No cache available, this is a real error
          store.setState({ isLoading: false, error: error.error || 'Failed to fetch state' })
          throw new Error(error.error || 'Failed to fetch onboarding state')
        }
        
        const data: OnboardingStateResponse = await res.json()
        
        // CRITICAL: Smart merge that protects localStorage from broken backend
        // If backend returns EMPTY arrays but localStorage has data, backend is stale/broken
        const backendIsStale = (
          data.state.completedSteps.length === 0 && 
          cachedState.completedSteps.length > 0 &&
          cachedState.currentStep !== 'ACCOUNT_VERIFIED' // Unless we genuinely just started
        )
        
        console.log('[useOnboardingState] Merge analysis:', {
          backendCompleted: data.state.completedSteps.length,
          cacheCompleted: cachedState.completedSteps.length,
          backendIsStale,
        })
        
        const mergedData = {
          // If backend is stale, trust localStorage completely
          currentStep: (backendIsStale 
            ? cachedState.currentStep 
            : (data.state.currentStep || cachedState.currentStep)) || 'ACCOUNT_VERIFIED' as OnboardingStep,
          completedSteps: backendIsStale
            ? cachedState.completedSteps
            : (data.state.completedSteps.length > 0 
                ? data.state.completedSteps 
                : cachedState.completedSteps),
          requiredSteps: data.state.requiredSteps || ['ACCOUNT_VERIFIED', 'ORG_CHOICE', 'COMPANY_PROFILE', 'COMPLIANCE_INTAKE'] as OnboardingStep[],
          progress: backendIsStale
            ? cachedState.progress
            : data.state.progress,
          // Merge stepData: localStorage has latest unsaved changes, backend has confirmed saves
          stepData: backendIsStale
            ? cachedState.stepData
            : {
                ...(data.state as any).stepData || {},  // Backend data (confirmed)
                ...cachedState.stepData, // Local data (may be newer)
              },
          user: data.user,
        }
        
        if (backendIsStale) {
          console.warn('[useOnboardingState] ⚠️ Backend is stale (returning empty data), using localStorage as source of truth')
        } else {
          console.log('[useOnboardingState] ✅ Backend sync successful, merged with localStorage')
        }
        
        // Update Zustand cache with merged data
        store.setState({
          ...mergedData,
          isLoading: false,
          error: null,
        })
        
        return {
          state: mergedData,
          user: mergedData.user,
        }
      } catch (err) {
        console.error('[useOnboardingState] Fetch failed:', err)
        
        // If we have cached data, use it (graceful degradation)
        if (cachedState.currentStep) {
          console.log('[useOnboardingState] Using localStorage fallback after network error')
          store.setState({ isLoading: false, error: null })
          return {
            state: {
              ...cachedState,
              currentStep: cachedState.currentStep, // TypeScript: already checked non-null
            },
            user: cachedState.user || { id: '', email: '', emailVerified: false },
          }
        }
        
        // No cache, no network - this is a real error
        store.setState({ isLoading: false, error: 'Network error' })
        throw err
      }
    },
    // Start with cache if valid (instant UI), fetch in background
    initialData: () => {
      const isCacheValid = store.isCacheValid()
      if (isCacheValid && store.currentStep) {
        console.log('[useOnboardingState] Using valid localStorage cache for instant load')
        return {
          state: {
            currentStep: store.currentStep,
            completedSteps: store.completedSteps,
            requiredSteps: store.requiredSteps,
            progress: store.progress,
            stepData: store.stepData,
          },
          user: store.user || { id: '', email: '', emailVerified: false },
        }
      }
      return undefined
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (matches Zustand cache TTL)
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: 1000,
  })
}

/**
 * Complete an onboarding step
 */
interface UseStepSaverOptions {
  step: OnboardingStep
  onSuccess?: (response: CompleteStepResponse) => void
  onError?: (error: Error) => void
}

export function useStepSaver({ step, onSuccess, onError }: UseStepSaverOptions) {
  const queryClient = useQueryClient()
  const store = useOnboardingStore()
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const lastSavedPayloadRef = useRef<any | null>(null)

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      console.log(`[useStepSaver] Calling API to complete step: ${step}`, payload)
      
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, payload } as CompleteStepRequest),
      })
      
      console.log(`[useStepSaver] API response status: ${res.status}`)
      
      if (!res.ok) {
        const error = await res.json()
        console.error(`[useStepSaver] API error:`, error)
        
        // Handle validation errors (422)
        if (res.status === 422 && error.validationErrors) {
          const validationMessages = error.validationErrors
            .map((err: any) => err.message)
            .join(', ')
          throw new Error(`Validation failed: ${validationMessages}`)
        }
        
        throw new Error(error.error || 'Failed to save step')
      }
      
      const responseData = await res.json() as CompleteStepResponse
      console.log(`[useStepSaver] API success response:`, responseData)
      return responseData
    },
    onSuccess: (data) => {
      console.log(`[useStepSaver] onSuccess called with data:`, data)
      
      // Update Zustand store
      store.setState({
        currentStep: data.state.currentStep,
        completedSteps: data.state.completedSteps,
        progress: data.state.progress,
        stepData: {
          ...store.stepData,
          [step]: lastSavedPayloadRef.current,
        },
      })
      
      // Show success toast (subtle)
      toast.success('Progress saved', {
        duration: 2000,
        position: 'bottom-right',
      })
      
      console.log(`[useStepSaver] Calling user's onSuccess callback`)
      onSuccess?.(data)
    },
    onError: (error: Error) => {
      console.error(`[useStepSaver] onError called:`, error)
      
      store.setState({
        error: error.message,
      })
      
      toast.error('Failed to save progress', {
        description: error.message,
        duration: 5000,
      })
      
      onError?.(error)
    },
    retry: 1,
    retryDelay: 1000,
  })

  // Debounced save (300ms delay)
  const saveDebounced = useCallback((payload: any) => {
    // Check if payload has actually changed (deep equality)
    if (isEqual(payload, lastSavedPayloadRef.current)) {
      console.log(`[useStepSaver] Skipping save - payload unchanged`)
      return
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      // Double-check before mutation
      if (!isEqual(payload, lastSavedPayloadRef.current)) {
        console.log(`[useStepSaver] Debounced save triggered for step: ${step}`)
        lastSavedPayloadRef.current = payload
        mutation.mutate(payload)
      }
    }, 300)
  }, [mutation, step])

  // Immediate save (no debounce)
  const saveImmediate = useCallback((payload: any) => {
    // Clear any pending debounced save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = undefined
    }

    // Check if payload has actually changed
    if (isEqual(payload, lastSavedPayloadRef.current)) {
      console.log(`[useStepSaver] Skipping immediate save - payload unchanged`)
      return
    }

    console.log(`[useStepSaver] saveImmediate called for step: ${step}`, payload)
    lastSavedPayloadRef.current = payload
    
    // Optimistic update in Zustand
    store.completeStep(step, payload)
    
    // Trigger mutation
    console.log(`[useStepSaver] Triggering mutation.mutate`)
    mutation.mutate(payload)
  }, [mutation, step, store])

  return {
    saveDebounced,
    saveImmediate,
    isSaving: mutation.isPending,
    error: mutation.error,
  }
}

/**
 * Navigation helpers
 */
export function useOnboardingNavigation() {
  const { data } = useOnboardingState()
  const store = useOnboardingStore()

  // IMPORTANT: localStorage (Zustand) is the immediate source of truth
  // Priority: Zustand (localStorage) → Backend data → Default fallback
  // This ensures user sees their latest changes immediately, even if backend hasn't synced yet
  const currentStep = store.currentStep || data?.state.currentStep || 'ACCOUNT_VERIFIED'
  const completedSteps = store.completedSteps.length > 0
    ? store.completedSteps
    : (data?.state.completedSteps || [])
  const progress = store.progress ?? data?.state.progress ?? 0

  const canNavigateToStep = useCallback((targetStep: OnboardingStep): boolean => {
    // Always allow navigating to completed steps
    if (completedSteps.includes(targetStep)) {
      return true
    }
    
    // Allow navigating to current step
    if (targetStep === currentStep) {
      return true
    }
    
    // Don't allow skipping ahead
    return false
  }, [completedSteps, currentStep])

  return {
    currentStep,
    completedSteps,
    progress,
    canNavigateToStep,
  }
}

// Legacy hooks removed - components now use watch() directly
// Deep equality checking happens in useStepSaver's lastSavedPayloadRef
