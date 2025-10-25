'use client'

import React from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Users, Plus, X, Mail, UserPlus, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { TeamSchema } from '@/lib/onboarding-types'
import { useStepSaver } from '@/lib/useOnboarding'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'
import { toast } from 'sonner'
import type { z } from 'zod'

type FormData = z.infer<typeof TeamSchema>

interface TeamStepProps {
  onContinue: () => void
  savedData?: FormData
}

export function TeamStep({ onContinue, savedData }: TeamStepProps) {
  // Get Zustand cache for persistence across navigation
  const cachedData = useOnboardingStore((state) => state.stepData?.TEAM as FormData | undefined)
  const setStepData = useOnboardingStore((state) => state.setState)
  
  // Priority: Zustand cache > backend savedData > empty defaults
  const initialData: FormData = React.useMemo(() => {
    if (cachedData?.invites && cachedData.invites.length > 0) {
      console.log('[TeamStep] 📦 Loading from Zustand cache:', cachedData)
      // DIAGNOSTIC: Check role format in cached data
      cachedData.invites.forEach((invite, idx) => {
        console.log(`  [${idx}] Cached role: "${invite.role}"`)
        if (invite.role !== 'org:admin' && invite.role !== 'org:member') {
          console.warn(`  [${idx}] ⚠️ Cached data has OLD role format: "${invite.role}"`)
        }
      })
      return cachedData
    }
    if (savedData?.invites && savedData.invites.length > 0) {
      console.log('[TeamStep] 🔙 Loading from backend savedData:', savedData)
      return savedData
    }
    console.log('[TeamStep] 🆕 Using empty defaults')
    return { invites: [] }
  }, [cachedData, savedData])

  const { register, control, handleSubmit, watch, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(TeamSchema),
    defaultValues: initialData,
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'invites' })

  const { saveImmediate, isSaving } = useStepSaver({
    step: 'TEAM',
    onSuccess: (response) => {
      clearPendingChanges()
      
      // Show success message for invites
      const inviteCount = currentData.invites?.length || 0
      if (inviteCount > 0) {
        toast.success('Invitations sent!', {
          description: `${inviteCount} team ${inviteCount === 1 ? 'member' : 'members'} invited. They'll receive an email with instructions.`,
          duration: 4000,
          icon: <CheckCircle2 className="w-5 h-5" />,
        })
      }
      
      if (response.nextStep) onContinue()
    },
    onError: (error) => {
      // Show error message if invite sending fails
      toast.error('Failed to send invitations', {
        description: error.message || 'Please try again or skip this step for now.',
        duration: 5000,
      })
    },
  })

  const currentData = watch()

  // Simple no-op function for backward compatibility
  const clearPendingChanges = () => {}

  // DIAGNOSTIC: Log actual payload before sending to backend
  const onSubmit = (data: FormData) => {
    console.log('[TeamStep] 🚀 Submitting team invites:', data)
    console.log('[TeamStep] 📋 Role validation check:')
    data.invites.forEach((invite, idx) => {
      console.log(`  [${idx}] email: ${invite.email}, role: "${invite.role}" (type: ${typeof invite.role})`)
      
      // Verify role format
      if (invite.role !== 'org:admin' && invite.role !== 'org:member') {
        console.error(`[TeamStep] ❌ INVALID ROLE FORMAT: "${invite.role}" - Expected "org:admin" or "org:member"`)
      } else {
        console.log(`  [${idx}] ✅ Role format valid: "${invite.role}"`)
      }
    })
    
    saveImmediate(data)
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
      console.log('[TeamStep] Data unchanged, skipping Zustand save')
      return
    }

    // Debounce: wait 2s after last change before saving to Zustand
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      console.log('[TeamStep] 💾 Saving to Zustand:', currentData)
      setStepData({
        stepData: {
          ...useOnboardingStore.getState().stepData,
          TEAM: currentData,
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
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          Invite Your Team
        </h2>
        <p className="text-gray-600 mt-2">Add team members who will work on proposals</p>
        <Badge variant="secondary" className="mt-2">Optional</Badge>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Team Invitations
            </CardTitle>
            <CardDescription>Send invitation emails to your team members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <Input {...register(`invites.${index}.email`)} placeholder="Email" />
                  <select {...register(`invites.${index}.role`)} className="w-full px-3 py-2 border rounded-md">
                    <option value="org:member">Member</option>
                    <option value="org:admin">Admin</option>
                  </select>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => append({ email: '', role: 'org:member' })}>
              <Plus className="w-4 h-4 mr-2" /> Add Team Member
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-between pt-4 border-t">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => saveImmediate(currentData)}
            disabled={isSaving}
          >
            Skip for now
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Sending...' : fields.length > 0 ? `Send ${fields.length} Invite(s)` : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  )
}

