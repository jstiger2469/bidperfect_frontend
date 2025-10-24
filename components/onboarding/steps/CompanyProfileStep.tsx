'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useOrganization } from '@clerk/nextjs'
import { useQueryClient } from '@tanstack/react-query'
import { Briefcase, HelpCircle, Building2, MapPin, Hash, Globe } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CompanyProfileSchema } from '@/lib/onboarding-types'
import { useStepSaver } from '@/lib/useOnboarding'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'
import type { z } from 'zod'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type FormData = z.infer<typeof CompanyProfileSchema>

interface CompanyProfileStepProps {
  onContinue: () => void
  savedData?: FormData
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

export function CompanyProfileStep({ onContinue, savedData }: CompanyProfileStepProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { organization } = useOrganization()
  const store = useOnboardingStore()
  
  // Check Zustand cache first (for navigation back), then savedData (from backend)
  const cachedData = store.stepData?.['COMPANY_PROFILE']
  console.log('[CompanyProfileStep] Loading data sources:', {
    cachedData,
    savedData,
    usingCache: !!cachedData,
  })
  
  const initialData = cachedData || savedData || {
    legalName: '',
    doingBusinessAs: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
    },
    naicsCodes: [],
    uei: '',
    cage: '',
    ein: '',
    website: '',
  }
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(CompanyProfileSchema),
    defaultValues: initialData,
    mode: 'onChange',
  })
  
  // Update legalName when organization loads (client-side only) - only if no saved data
  React.useEffect(() => {
    if (organization?.name && !savedData?.legalName) {
      setValue('legalName', organization.name, { shouldValidate: true, shouldTouch: false, shouldDirty: false })
    }
  }, [organization?.name, savedData?.legalName, setValue])

  // Track if we've already navigated to prevent re-triggering
  const hasNavigatedRef = React.useRef(false)

  const [saveError, setSaveError] = React.useState<string | null>(null)
  
  const { saveImmediate, isSaving } = useStepSaver({
    step: 'COMPANY_PROFILE',
    onSuccess: (response) => {
      console.log('[CompanyProfileStep] Step saved successfully:', response)
      setSaveError(null) // Clear any previous errors
      
      // Prevent duplicate navigation
      if (hasNavigatedRef.current) {
        console.log('[CompanyProfileStep] Already navigated, skipping')
        return
      }
      
      clearPendingChanges() // Clear pending flag after successful save
      
      if (response.nextStep) {
        console.log('[CompanyProfileStep] Moving to next step:', response.nextStep)
        hasNavigatedRef.current = true
        
        // Update query cache immediately to prevent race conditions
        queryClient.setQueryData(['onboarding', 'state'], (old: any) => {
          if (!old) return old
          console.log('[CompanyProfileStep] Updating query cache with new state:', response.state)
          return {
            ...old,
            state: response.state
          }
        })
        
        // Navigate to next step via router
        const nextUrl = `/onboarding?step=${response.nextStep}`
        console.log('[CompanyProfileStep] Navigating to:', nextUrl)
        router.push(nextUrl)
      } else {
        console.log('[CompanyProfileStep] Onboarding complete, calling onContinue')
        onContinue()
      }
    },
    onError: (error: Error) => {
      console.error('[CompanyProfileStep] Save error:', error)
      setSaveError(error.message)
    },
  })

  // Watch form data
  const currentData = watch()

  // Simple no-op function for backward compatibility
  const clearPendingChanges = () => {}

  // ✅ NO AUTO-SAVE: Form only saves when user clicks "Continue" button
  // This prevents accidental navigation and data loss
  
  // Save to Zustand for persistence when navigating back (debounced to avoid excessive updates)
  const saveToZustandTimeoutRef = React.useRef<NodeJS.Timeout>()
  const hasInitializedRef = React.useRef(false)
  const lastSavedDataRef = React.useRef<any>(null)
  
  React.useEffect(() => {
    // Skip on initial mount to prevent loop
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true
      lastSavedDataRef.current = currentData
      return
    }
    
    // Skip if data hasn't actually changed (deep equality check)
    if (JSON.stringify(currentData) === JSON.stringify(lastSavedDataRef.current)) {
      console.log('[CompanyProfileStep] Data unchanged, skipping Zustand save')
      return
    }
    
    // Clear existing timeout
    if (saveToZustandTimeoutRef.current) {
      clearTimeout(saveToZustandTimeoutRef.current)
    }
    
    // Debounce Zustand update (500ms)
    saveToZustandTimeoutRef.current = setTimeout(() => {
      // Only save if form has data
      if (currentData.legalName || currentData.address.line1) {
        console.log('[CompanyProfileStep] Saving to Zustand cache:', currentData)
        store.setState({
          stepData: {
            ...store.stepData,
            'COMPANY_PROFILE': currentData,
          },
        })
        lastSavedDataRef.current = currentData
        console.log('[CompanyProfileStep] Zustand cache updated successfully')
      }
    }, 500)
    
    return () => {
      if (saveToZustandTimeoutRef.current) {
        clearTimeout(saveToZustandTimeoutRef.current)
      }
    }
  }, [currentData, store])

  const onSubmit = (data: FormData) => {
    console.log('[CompanyProfileStep] Form submitted:', data)
    console.log('[CompanyProfileStep] isValid:', isValid)
    console.log('[CompanyProfileStep] errors:', errors)
    
    // Clean up data: Remove empty strings for optional fields
    // Backend validation requires these to be omitted if not provided
    const cleanedData: any = {
      legalName: data.legalName,
      address: {
        line1: data.address.line1,
        city: data.address.city,
        state: data.address.state,
        postalCode: data.address.postalCode,
      },
      naicsCodes: data.naicsCodes || [],
    }
    
    // Only add optional fields if they have actual values (not empty strings)
    if (data.doingBusinessAs && data.doingBusinessAs.trim() !== '') {
      cleanedData.doingBusinessAs = data.doingBusinessAs
    }
    if (data.address.line2 && data.address.line2.trim() !== '') {
      cleanedData.address.line2 = data.address.line2
    }
    if (data.uei && data.uei.trim() !== '') {
      cleanedData.uei = data.uei
    }
    if (data.cage && data.cage.trim() !== '') {
      cleanedData.cage = data.cage
    }
    if (data.ein && data.ein.trim() !== '') {
      cleanedData.ein = data.ein
    }
    if (data.website && data.website.trim() !== '') {
      cleanedData.website = data.website
    }
    
    console.log('[CompanyProfileStep] Cleaned data:', cleanedData)
    console.log('[CompanyProfileStep] Removed empty optional fields:', {
      uei: !cleanedData.uei,
      cage: !cleanedData.cage,
      ein: !cleanedData.ein,
      website: !cleanedData.website,
      doingBusinessAs: !cleanedData.doingBusinessAs,
    })
    saveImmediate(cleanedData)
  }
  
  // Debug form state
  React.useEffect(() => {
    console.log('[CompanyProfileStep] Form state:', {
      isValid,
      errors,
      currentData,
    })
  }, [isValid, errors, currentData])

  const [naicsInput, setNaicsInput] = React.useState('')

  const addNaicsCode = () => {
    const currentCodes = currentData.naicsCodes || []
    if (naicsInput.trim() && !currentCodes.includes(naicsInput.trim())) {
      setValue('naicsCodes', [...currentCodes, naicsInput.trim()])
      setNaicsInput('')
    }
  }

  const removeNaicsCode = (code: string) => {
    const currentCodes = currentData.naicsCodes || []
    setValue('naicsCodes', currentCodes.filter(c => c !== code))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-blue-600" />
          </div>
          Company Profile
        </h2>
        <p className="text-gray-600 mt-2">
          Basic information about your company for federal contracting
        </p>
      </div>

      {/* Error Alert */}
      {saveError && (
        <Alert variant="destructive">
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Company Names */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="legalName" className="flex items-center gap-2">
                Legal Name *
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Your official registered business name as it appears on legal documents</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="legalName"
                {...register('legalName')}
                placeholder="Acme Construction LLC"
                className="mt-1"
              />
              {organization?.name && (
                <p className="text-sm text-gray-500 mt-1">✓ Pre-filled from your organization</p>
              )}
              {errors.legalName && (
                <p className="text-sm text-red-600 mt-1">{errors.legalName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="doingBusinessAs">Doing Business As (DBA)</Label>
              <Input
                id="doingBusinessAs"
                {...register('doingBusinessAs')}
                placeholder="Optional"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                {...register('website')}
                placeholder="https://example.com"
                className="mt-1"
              />
              {errors.website && (
                <p className="text-sm text-red-600 mt-1">{errors.website.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Business Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="line1">Street Address *</Label>
              <Input
                id="line1"
                {...register('address.line1')}
                placeholder="123 Main Street"
                className="mt-1"
              />
              {errors.address?.line1 && (
                <p className="text-sm text-red-600 mt-1">{errors.address.line1.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="line2">Suite / Unit (Optional)</Label>
              <Input
                id="line2"
                {...register('address.line2')}
                placeholder="Suite 200"
                className="mt-1"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  {...register('address.city')}
                  placeholder="New Orleans"
                  className="mt-1"
                />
                {errors.address?.city && (
                  <p className="text-sm text-red-600 mt-1">{errors.address.city.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="state">State *</Label>
                <select
                  id="state"
                  {...register('address.state')}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select...</option>
                  {US_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.address?.state && (
                  <p className="text-sm text-red-600 mt-1">{errors.address.state.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="postalCode">ZIP Code *</Label>
                <Input
                  id="postalCode"
                  {...register('address.postalCode')}
                  placeholder="70112"
                  maxLength={10}
                  className="mt-1"
                />
                {errors.address?.postalCode && (
                  <p className="text-sm text-red-600 mt-1">{errors.address.postalCode.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NAICS Codes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Hash className="w-4 h-4" />
              NAICS Codes (Optional)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">North American Industry Classification System codes that describe your business activities</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription>
              Add NAICS codes that represent your business (can be added later)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={naicsInput}
                onChange={(e) => setNaicsInput(e.target.value)}
                placeholder="e.g., 236220 (Commercial Building Construction)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addNaicsCode()
                  }
                }}
              />
              <Button type="button" onClick={addNaicsCode} variant="outline">
                Add
              </Button>
            </div>

            {currentData.naicsCodes && currentData.naicsCodes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {currentData.naicsCodes.map((code) => (
                  <div
                    key={code}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md text-sm"
                  >
                    <span>{code}</span>
                    <button
                      type="button"
                      onClick={() => removeNaicsCode(code)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.naicsCodes && (
              <p className="text-sm text-red-600">{errors.naicsCodes.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Federal Identifiers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Federal Identifiers (Optional)
            </CardTitle>
            <CardDescription>
              Add these now or later from your SAM.gov registration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="uei" className="flex items-center gap-2">
                Unique Entity ID (UEI)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">12-character alphanumeric identifier from SAM.gov registration</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="uei"
                {...register('uei')}
                placeholder="ABC123DEF456"
                maxLength={12}
                className="mt-1 font-mono"
              />
            </div>

            <div>
              <Label htmlFor="cage" className="flex items-center gap-2">
                CAGE Code
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">5-character Commercial and Government Entity code</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="cage"
                {...register('cage')}
                placeholder="1ABC9"
                maxLength={5}
                className="mt-1 font-mono"
              />
            </div>

            <div>
              <Label htmlFor="ein" className="flex items-center gap-2">
                EIN (Employer Identification Number)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">9-digit tax ID from the IRS</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="ein"
                {...register('ein')}
                placeholder="12-3456789"
                maxLength={10}
                className="mt-1 font-mono"
              />
            </div>
          </CardContent>
        </Card>

        {/* Debug Panel */}
        {!isValid && Object.keys(errors).length > 0 && (
          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-sm text-red-700">⚠️ Validation Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-red-600 space-y-1">
                {errors.legalName && <li>• Legal Name: {errors.legalName.message}</li>}
                {errors.address?.line1 && <li>• Street Address: {errors.address.line1.message}</li>}
                {errors.address?.city && <li>• City: {errors.address.city.message}</li>}
                {errors.address?.state && <li>• State: {errors.address.state.message}</li>}
                {errors.address?.postalCode && <li>• ZIP Code: {errors.address.postalCode.message}</li>}
                {errors.website && <li>• Website: {errors.website.message}</li>}
                {errors.naicsCodes && <li>• NAICS Codes: {errors.naicsCodes.message}</li>}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm">
            {isSaving && <span className="text-gray-500">⏳ Saving...</span>}
            {!isSaving && !isValid && (
              <span className="text-amber-600">
                ⚠️ Please fill in: Legal Name, Full Address (all fields required)
              </span>
            )}
            {!isSaving && isValid && (
              <span className="text-green-600">✓ Ready to continue</span>
            )}
          </div>
          <Button
            type="submit"
            disabled={!isValid || isSaving}
            className="min-w-[120px]"
            onClick={() => {
              if (!isValid) {
                console.log('[CompanyProfileStep] Button clicked but form invalid')
                console.log('[CompanyProfileStep] Validation errors:', errors)
                console.log('[CompanyProfileStep] Current data:', currentData)
              }
            }}
          >
            {isSaving ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  )
}

