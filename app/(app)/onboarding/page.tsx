'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useActiveCompanyId } from '@/lib/tenant'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { AccountVerifiedStep } from '@/components/onboarding/steps/AccountVerifiedStep'
import { OrgChoiceStep } from '@/components/onboarding/steps/OrgChoiceStep'
import { CompanyProfileStep } from '@/components/onboarding/steps/CompanyProfileStep'
import { ComplianceIntakeStep } from '@/components/onboarding/steps/ComplianceIntakeStep'
import { IntegrationsStep } from '@/components/onboarding/steps/IntegrationsStep'
import { TeamStep } from '@/components/onboarding/steps/TeamStep'
import { FirstRfpStep } from '@/components/onboarding/steps/FirstRfpStep'
import { DoneStep } from '@/components/onboarding/steps/DoneStep'
import { useOnboardingState, useOnboardingNavigation } from '@/lib/useOnboarding'
import type { OnboardingStep } from '@/lib/onboarding-types'
import { Loader2 } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { companyId } = useActiveCompanyId()
  
  // If already onboarded, redirect to company
  React.useEffect(() => {
    if (companyId) router.replace(`/company/${companyId}`)
  }, [companyId, router])

  // Fetch onboarding state
  const { data: stateData, isLoading, error } = useOnboardingState()
  const { currentStep, completedSteps, canNavigateToStep, progress } = useOnboardingNavigation()

  // Get invite token from URL if present
  const inviteToken = searchParams.get('invite')

  // Determine active step from URL query or state
  const urlStep = searchParams.get('step') as OnboardingStep | null
  const activeStep = urlStep && canNavigateToStep(urlStep) ? urlStep : currentStep
  
  // Debug logging
  React.useEffect(() => {
    console.log('[OnboardingPage] 🔄 State updated:', {
      urlStep,
      currentStep,
      activeStep,
      canNavigateToUrlStep: urlStep ? canNavigateToStep(urlStep) : null,
      completedSteps,
      stateData: stateData?.state,
    })
  }, [urlStep, currentStep, activeStep, completedSteps, canNavigateToStep, stateData])
  
  // Debug which step is being rendered
  React.useEffect(() => {
    console.log('[OnboardingPage] 📍 Rendering step:', activeStep)
  }, [activeStep])

  // Navigate to a specific step
  const navigateToStep = React.useCallback((step: OnboardingStep) => {
    if (canNavigateToStep(step)) {
      router.push(`/onboarding?step=${step}`)
    }
  }, [canNavigateToStep, router])

  // Continue to next step
  const handleContinue = React.useCallback(() => {
    console.log('[OnboardingPage] handleContinue called, refreshing and waiting for state update')
    // Refresh to get updated state, which will update currentStep and trigger navigation
    router.refresh()
  }, [router])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load onboarding state</p>
          <button
            onClick={() => router.refresh()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!stateData || !activeStep) {
    return null
  }

  // Render the current step
  const renderStep = () => {
    const stepProps = { onContinue: handleContinue }
    const user = stateData.user
    const invite = inviteToken ? stateData.state.invite : undefined
    const stepData = (stateData.state as any).stepData || {}

    switch (activeStep) {
      case 'ACCOUNT_VERIFIED':
        return (
          <AccountVerifiedStep
            emailVerified={user.emailVerified}
            mfaEnabled={user.mfaEnabled}
            {...stepProps}
          />
        )
      case 'ORG_CHOICE':
        return <OrgChoiceStep invite={invite} savedData={stepData['ORG_CHOICE']} {...stepProps} />
      case 'COMPANY_PROFILE':
        return <CompanyProfileStep savedData={stepData['COMPANY_PROFILE']} {...stepProps} />
      case 'COMPLIANCE_INTAKE':
        return <ComplianceIntakeStep savedData={stepData['COMPLIANCE_INTAKE']} {...stepProps} />
      case 'INTEGRATIONS':
        return <IntegrationsStep {...stepProps} />
      case 'TEAM':
        return <TeamStep {...stepProps} />
      case 'FIRST_RFP':
        return <FirstRfpStep {...stepProps} />
      case 'DONE':
        return <DoneStep />
      default:
        return <div>Unknown step</div>
    }
  }

  return (
    <OnboardingLayout
      currentStep={activeStep}
      completedSteps={completedSteps}
      progress={progress}
      canNavigateToStep={canNavigateToStep}
      onNavigateToStep={navigateToStep}
      isLoading={isLoading}
    >
      {renderStep()}
    </OnboardingLayout>
  )
}
