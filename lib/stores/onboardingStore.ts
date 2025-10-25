/**
 * Zustand store for onboarding state management
 * 
 * Purpose:
 * - Active UI state while user navigates onboarding
 * - Caches backend responses (5-min TTL)
 * - Provides optimistic updates for better UX
 * - Syncs with backend on mount and step completion
 * 
 * Data Flow:
 * 1. Component mounts → check Zustand cache
 * 2. If stale/empty → fetch from backend
 * 3. User completes step → optimistic update + backend call
 * 4. Backend success → sync Zustand + cookies
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { OnboardingStep } from '@/lib/onboarding-types'

interface OnboardingState {
  currentStep: OnboardingStep | null
  completedSteps: OnboardingStep[]
  requiredSteps: OnboardingStep[]
  progress: number
  stepData: Record<string, any>
  user: {
    id: string
    email: string
    emailVerified: boolean
    mfaEnabled?: boolean
  } | null
  
  // Cache metadata
  lastFetched: number | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setState: (state: Partial<Omit<OnboardingState, 'setState' | 'reset' | 'completeStep' | 'isCacheValid'>>) => void
  reset: () => void
  completeStep: (step: OnboardingStep, data: any) => void
  isCacheValid: () => boolean
}

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

const initialState = {
  currentStep: null,
  completedSteps: [],
  // All onboarding steps (blocking + optional)
  requiredSteps: [
    'ACCOUNT_VERIFIED',
    'ORG_CHOICE',
    'COMPANY_PROFILE',
    'COMPLIANCE_INTAKE',
    'INTEGRATIONS',  // Optional - can skip
    'TEAM',          // Optional - can skip
    'FIRST_RFP',     // Optional - can skip
  ] as OnboardingStep[],
  progress: 0,
  stepData: {},
  user: null,
  lastFetched: null,
  isLoading: false,
  error: null,
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setState: (updates) => {
        set({
          ...updates,
          lastFetched: Date.now(),
        })
      },
      
      reset: () => {
        set(initialState)
      },
      
      completeStep: (step, data) => {
        const current = get()
        
        // Optimistic update
        set({
          completedSteps: [...new Set([...current.completedSteps, step])],
          stepData: {
            ...current.stepData,
            [step]: data,
          },
          lastFetched: Date.now(),
        })
      },
      
      isCacheValid: () => {
        const { lastFetched } = get()
        if (!lastFetched) return false
        return Date.now() - lastFetched < CACHE_TTL_MS
      },
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => localStorage), // Use localStorage for persistence across sessions
      partialize: (state) => ({
        // Only persist UI state, not loading/error states
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        requiredSteps: state.requiredSteps,
        progress: state.progress,
        stepData: state.stepData,
        user: state.user,
        lastFetched: state.lastFetched,
      }),
      version: 1, // Increment this if you change the store structure
    }
  )
)

