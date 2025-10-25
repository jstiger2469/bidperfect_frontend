'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plug, Check, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { IntegrationsSchema } from '@/lib/onboarding-types'
import { useStepSaver } from '@/lib/useOnboarding'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'
import type { z } from 'zod'

type FormData = z.infer<typeof IntegrationsSchema>

const INTEGRATIONS = [
  {
    id: 'drive',
    name: 'Cloud Storage',
    description: 'Sync documents from Google Drive or OneDrive',
    providers: [
      { value: 'google', label: 'Google Drive' },
      { value: 'microsoft', label: 'Microsoft OneDrive' },
    ],
  },
  {
    id: 'email',
    name: 'Email Integration',
    description: 'Capture RFP notices and correspondence',
    providers: [
      { value: 'gmail', label: 'Gmail' },
      { value: 'microsoft365', label: 'Microsoft 365' },
    ],
  },
  {
    id: 'eSign',
    name: 'Electronic Signature',
    description: 'Sign documents digitally',
    providers: [
      { value: 'docusign', label: 'DocuSign' },
      { value: 'adobe', label: 'Adobe Sign' },
    ],
  },
  {
    id: 'accounting',
    name: 'Accounting',
    description: 'Sync invoices and financial data',
    providers: [
      { value: 'quickbooks', label: 'QuickBooks' },
    ],
  },
]

interface IntegrationsStepProps {
  onContinue: () => void
  savedData?: FormData
}

export function IntegrationsStep({ onContinue, savedData }: IntegrationsStepProps) {
  // Get Zustand cache for persistence across navigation
  const cachedData = useOnboardingStore((state) => state.stepData?.INTEGRATIONS as FormData | undefined)
  const setStepData = useOnboardingStore((state) => state.setState)
  
  // Priority: Zustand cache > backend savedData > empty defaults
  const initialData: FormData = React.useMemo(() => {
    const defaultValues = {
      drive: { enabled: false },
      email: { enabled: false },
      eSign: { enabled: false },
      accounting: { enabled: false },
    }
    
    if (cachedData) {
      console.log('[IntegrationsStep] Loading from Zustand cache:', cachedData)
      return cachedData
    }
    if (savedData) {
      console.log('[IntegrationsStep] Loading from backend savedData:', savedData)
      return savedData
    }
    console.log('[IntegrationsStep] Using empty defaults')
    return defaultValues
  }, [cachedData, savedData])

  const { watch, setValue, handleSubmit, formState: { isValid } } = useForm<FormData>({
    resolver: zodResolver(IntegrationsSchema),
    defaultValues: initialData,
    mode: 'onChange',
  })

  const { saveImmediate, isSaving } = useStepSaver({
    step: 'INTEGRATIONS',
    onSuccess: (response) => {
      clearPendingChanges()
      if (response.nextStep) onContinue()
    },
  })

  const currentData = watch()

  // Simple no-op function for backward compatibility
  const clearPendingChanges = () => {}

  const onSubmit = (data: FormData) => saveImmediate(data)

  const toggleIntegration = (id: string) => {
    const current = currentData[id as keyof FormData]
    setValue(id as any, { ...current, enabled: !current?.enabled })
  }

  // =====================
  // ZUSTAND PERSISTENCE
  // =====================
  // Auto-save to Zustand for navigation back persistence
  const hasInitializedRef = React.useRef(false)
  const lastSavedDataRef = React.useRef<string>('')
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined)

  React.useEffect(() => {
    // Skip on initial mount (prevents saving empty data on page load)
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true
      return
    }

    // Deep equality check - only save if data truly changed
    const currentDataJson = JSON.stringify(currentData)
    if (currentDataJson === lastSavedDataRef.current) {
      console.log('[IntegrationsStep] Data unchanged, skipping Zustand save')
      return
    }

    // Debounce: wait 2s after last change before saving to Zustand
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      console.log('[IntegrationsStep] 💾 Saving to Zustand:', currentData)
      setStepData({
        stepData: {
          ...useOnboardingStore.getState().stepData,
          INTEGRATIONS: currentData,
        },
      })
      lastSavedDataRef.current = currentDataJson
    }, 2000) // 2-second debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [currentData, setStepData])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Plug className="w-5 h-5 text-blue-600" />
          </div>
          Connect Your Tools
        </h2>
        <p className="text-gray-600 mt-2">
          Optional: Connect your favorite tools to streamline your workflow
        </p>
        <Badge variant="secondary" className="mt-2">You can skip this step</Badge>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {INTEGRATIONS.map((integration) => {
          const isEnabled = currentData[integration.id as keyof FormData]?.enabled
          return (
            <Card key={integration.id} className={isEnabled ? 'border-blue-200 bg-blue-50/30' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{integration.name}</CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </div>
                  {isEnabled ? (
                    <Badge className="bg-green-500"><Check className="w-3 h-3 mr-1" /> Connected</Badge>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleIntegration(integration.id)}
                    >
                      Connect
                    </Button>
                  )}
                </div>
              </CardHeader>
              {isEnabled && (
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {integration.providers.map(provider => (
                      <Button
                        key={provider.value}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue(`${integration.id}.provider` as any, provider.value as any)
                        }}
                        className={currentData[integration.id as keyof FormData]?.provider === provider.value ? 'border-blue-500 bg-blue-50' : ''}
                      >
                        {provider.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}

        <div className="flex items-center justify-between pt-4 border-t">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => saveImmediate(currentData)}
            disabled={isSaving}
          >
            Skip for now
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Continue'} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </form>
    </div>
  )
}

