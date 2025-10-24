'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useOrganizationList, useOrganization } from '@clerk/nextjs'
import { useQueryClient } from '@tanstack/react-query'
import { Building, Plus, X, Check, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { OrgChoiceSchema } from '@/lib/onboarding-types'
import { useStepSaver } from '@/lib/useOnboarding'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { z } from 'zod'

type FormData = z.infer<typeof OrgChoiceSchema>

interface OrgChoiceStepProps {
  invite?: {
    orgName: string
    role: string
    email: string
  }
  onContinue: () => void
  savedData?: FormData
}

export function OrgChoiceStep({ invite, onContinue, savedData }: OrgChoiceStepProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const isInviteFlow = Boolean(invite)
  
  // Get signup business name from sessionStorage
  const [signupBusinessName] = React.useState(() => {
    if (typeof window === 'undefined') return ''
    return sessionStorage.getItem('signupBusinessName') || ''
  })
  
  // Clerk org management
  const { createOrganization, setActive } = useOrganizationList()
  const { organization } = useOrganization()
  const [isCreatingOrg, setIsCreatingOrg] = React.useState(false)
  const [orgCreationError, setOrgCreationError] = React.useState<string | null>(null)
  
  const { register, handleSubmit, watch, setValue, control, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(OrgChoiceSchema),
    defaultValues: savedData || {
      mode: isInviteFlow ? 'join' : 'create',
      orgName: isInviteFlow ? invite?.orgName : signupBusinessName || '',
      verifiedDomains: [],
    },
    mode: 'onChange',
  })
  
  // Update orgName when organization loads (client-side only)
  React.useEffect(() => {
    if (organization?.name && !signupBusinessName && !isInviteFlow) {
      setValue('orgName', organization.name, { shouldValidate: true, shouldTouch: false, shouldDirty: false })
    }
  }, [organization?.name, signupBusinessName, isInviteFlow, setValue])
  
  // If org already exists, mark form as valid regardless of fields
  const canSubmit = organization ? true : isValid

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'verifiedDomains',
  })

  const hasNavigatedRef = React.useRef(false)
  
  const { saveDebounced, saveImmediate, isSaving } = useStepSaver({
    step: 'ORG_CHOICE',
    onSuccess: (response) => {
      console.log('[OrgChoiceStep] Step saved successfully:', response)
      
      if (hasNavigatedRef.current) {
        console.log('[OrgChoiceStep] Already navigated, skipping')
        return
      }
      
      clearPendingChanges()
      
      if (response.nextStep) {
        console.log('[OrgChoiceStep] Moving to next step:', response.nextStep)
        hasNavigatedRef.current = true
        
        // Update query cache immediately to prevent race conditions
        queryClient.setQueryData(['onboarding', 'state'], (old: any) => {
          if (!old) return old
          console.log('[OrgChoiceStep] Updating query cache with new state:', response.state)
          return {
            ...old,
            state: response.state
          }
        })
        
        // Navigate to next step
        const nextUrl = `/onboarding?step=${response.nextStep}`
        console.log('[OrgChoiceStep] Navigating to:', nextUrl)
        router.push(nextUrl)
      }
    },
  })

  // Watch form data (deep equality check happens in useStepSaver)
  const currentData = watch()
  const mode = currentData.mode

  // Simple no-op function for backward compatibility
  const clearPendingChanges = () => {}

  // REMOVED: Auto-save on keystroke (bad UX - saves and navigates without user action)
  // Now only saves when user explicitly clicks "Continue" button

  const onSubmit = async (data: FormData) => {
    console.log('[OrgChoiceStep] Form submitted:', data)
    console.log('[OrgChoiceStep] Current organization:', organization?.id)
    setOrgCreationError(null)

    try {
      // If user already has an org (edge case: org was created in previous attempt or exists from invite)
      if (organization) {
        console.log('[OrgChoiceStep] User already has org:', organization.id)
        console.log('[OrgChoiceStep] Skipping org creation, saving step')
        toast.success('Organization already set up', { duration: 2000 })
        saveImmediate(data)
        return
      }

      if (data.mode === 'create') {
        console.log('[OrgChoiceStep] Creating organization:', data.orgName)
        
        if (!createOrganization) {
          throw new Error('Organization creation not available')
        }
        
        // Show loading state
        setIsCreatingOrg(true)

        // Create the organization
        const newOrg = await createOrganization({ name: data.orgName })
        console.log('[OrgChoiceStep] ✅ Organization created:', newOrg.id)

        // Set it as active
        if (setActive) {
          await setActive({ organization: newOrg.id })
          console.log('[OrgChoiceStep] ✅ Set org as active:', newOrg.id)
        }

        // Clear the sessionStorage now that we've used it
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('signupBusinessName')
        }

        // Done creating - re-enable button
        setIsCreatingOrg(false)
        
        toast.success('Organization created!', { duration: 2000 })

        // Small delay to let Clerk update, then save
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Now save the onboarding step
        console.log('[OrgChoiceStep] Saving onboarding step')
        saveImmediate(data)
        
        return
      } else if (data.mode === 'join') {
        // TODO: Handle joining organization with invite code
        console.log('[OrgChoiceStep] Join mode - inviteToken:', data.inviteToken)
        toast.info('Join organization feature coming soon')
        saveImmediate(data)
      }
    } catch (error: any) {
      console.error('[OrgChoiceStep] ❌ Error:', error)
      const errorMessage = error?.errors?.[0]?.message || error?.message || 'Failed to create organization'
      setOrgCreationError(errorMessage)
      setIsCreatingOrg(false)
      toast.error('Failed to create organization', {
        description: errorMessage,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Building className="w-5 h-5 text-blue-600" />
          </div>
          {isInviteFlow ? 'Join Organization' : 'Create Your Organization'}
        </h2>
        <p className="text-gray-600 mt-2">
          {isInviteFlow 
            ? `You've been invited to join ${invite?.orgName}`
            : 'Set up your organization workspace for your team'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Error Alert */}
        {orgCreationError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900">Failed to create organization</h3>
                  <p className="text-sm text-red-700 mt-1">{orgCreationError}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setOrgCreationError(null)}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing Org Info */}
        {organization && !isInviteFlow && (
          <Card className="border-2 border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                Organization Already Set Up
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-gray-600">Current Organization</Label>
                <p className="font-medium">{organization.name}</p>
              </div>
              <p className="text-sm text-gray-600">
                You can continue with this organization or create a new one.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Invite Info (if applicable) */}
        {isInviteFlow && invite && (
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600" />
                Invitation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-gray-600">Organization</Label>
                <p className="font-medium">{invite.orgName}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Your Role</Label>
                <Badge variant="secondary">{invite.role}</Badge>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Invited Email</Label>
                <p className="text-sm text-gray-700">{invite.email}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mode Selection (if not invite flow) */}
        {!isInviteFlow && (
          <div className="grid md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setValue('mode', 'create')}
              className={cn(
                'p-6 rounded-xl border-2 text-left transition-all',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                mode === 'create' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  mode === 'create' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'
                )}>
                  <Plus className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Create New Organization</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Start fresh with a new organization workspace
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setValue('mode', 'join')}
              className={cn(
                'p-6 rounded-xl border-2 text-left transition-all',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                mode === 'join' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  mode === 'join' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'
                )}>
                  <Building className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Join Existing Organization</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Use an invitation code or request to join
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Organization Name (Create mode) */}
        {mode === 'create' && !isInviteFlow && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Organization Name</CardTitle>
              <CardDescription>
                This will be the name of your workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="orgName">Name *</Label>
                <Input
                  id="orgName"
                  {...register('orgName')}
                  placeholder="Acme Construction Inc."
                  className="mt-1"
                />
                {errors.orgName && (
                  <p className="text-sm text-red-600 mt-1">{errors.orgName.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verified Domains (Create mode) */}
        {mode === 'create' && !isInviteFlow && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Verified Domains (Optional)</CardTitle>
              <CardDescription>
                Add email domains your organization owns. Team members with these domains can auto-join.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Input
                    {...register(`verifiedDomains.${index}` as const)}
                    placeholder="example.com"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append('')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Domain
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Join Code Input (Join mode, no invite) */}
        {mode === 'join' && !isInviteFlow && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invitation Code</CardTitle>
              <CardDescription>
                Enter the invitation code you received
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="inviteToken">Code *</Label>
                <Input
                  id="inviteToken"
                  {...register('inviteToken')}
                  placeholder="ABC-123-XYZ"
                  className="mt-1 font-mono"
                />
                {errors.inviteToken && (
                  <p className="text-sm text-red-600 mt-1">{errors.inviteToken.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            {isCreatingOrg && '⏳ Creating organization...'}
            {isSaving && !isCreatingOrg && '⏳ Saving...'}
            {!canSubmit && !isCreatingOrg && !isSaving && (
              <span className="text-amber-600">Please fill in required fields</span>
            )}
            {organization && !isSaving && !isCreatingOrg && (
              <span className="text-green-600">✓ Organization ready</span>
            )}
          </div>
          <Button
            type="submit"
            disabled={!canSubmit || isSaving || isCreatingOrg}
            className="min-w-[120px]"
            onClick={() => {
              console.log('[OrgChoiceStep] Button clicked - organization:', !!organization, 'canSubmit:', canSubmit, 'isSaving:', isSaving, 'isCreatingOrg:', isCreatingOrg)
            }}
          >
            {isCreatingOrg ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </>
            ) : isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : organization ? (
              'Continue'
            ) : mode === 'create' ? (
              'Create & Continue'
            ) : (
              'Join & Continue'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

