'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUser } from '@clerk/nextjs'
import { useQueryClient } from '@tanstack/react-query'
import { ShieldCheck, Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { AccountVerifiedSchema } from '@/lib/onboarding-types'
import { useStepSaver } from '@/lib/useOnboarding'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { z } from 'zod'

type FormData = z.infer<typeof AccountVerifiedSchema>

interface AccountVerifiedStepProps {
  emailVerified: boolean
  mfaEnabled?: boolean
  onContinue: () => void
}

// =====================
// Email Verification Hook
// =====================

function useEmailVerification(onVerificationSuccess?: () => void) {
  const { user } = useUser()
  const [isResending, setIsResending] = React.useState(false)
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [cooldownSeconds, setCooldownSeconds] = React.useState(0)
  const [verificationCode, setVerificationCode] = React.useState('')
  const [showCodeInput, setShowCodeInput] = React.useState(false)
  const cooldownTimerRef = React.useRef<NodeJS.Timeout | undefined>(undefined)

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current)
      }
    }
  }, [])

  const sendVerificationEmail = async () => {
    if (cooldownSeconds > 0 || isResending) return

    try {
      setIsResending(true)

      // Get primary email address from Clerk
      const primaryEmail = user?.emailAddresses.find(
        (email) => email.id === user.primaryEmailAddressId
      )

      if (!primaryEmail) {
        throw new Error('No email address found')
      }

      // Use Clerk's prepareVerification method
      await primaryEmail.prepareVerification({ strategy: 'email_code' })

      toast.success('Verification code sent!', {
        description: 'Check your inbox for a 6-digit code.',
        duration: 5000,
      })

      // Show code input field
      setShowCodeInput(true)

      // Set 60-second cooldown
      setCooldownSeconds(60)
      cooldownTimerRef.current = setInterval(() => {
        setCooldownSeconds((prev) => {
          if (prev <= 1) {
            if (cooldownTimerRef.current) {
              clearInterval(cooldownTimerRef.current)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)

    } catch (error: any) {
      console.error('Error sending verification email:', error)
      
      // Handle specific Clerk errors
      if (error?.errors?.[0]?.code === 'form_identifier_exists') {
        toast.error('Email already verified', {
          description: 'This email address has already been verified.',
        })
      } else if (error?.errors?.[0]?.code === 'form_param_max_length_exceeded') {
        toast.error('Rate limit exceeded', {
          description: 'Please wait a few minutes before trying again.',
        })
      } else {
        toast.error('Failed to send email', {
          description: error?.errors?.[0]?.message || error?.message || 'Please try again later.',
        })
      }
    } finally {
      setIsResending(false)
    }
  }

  const verifyEmailCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Invalid code', {
        description: 'Please enter the 6-digit code from your email.',
      })
      return
    }

    try {
      setIsVerifying(true)

      // Get primary email address from Clerk
      const primaryEmail = user?.emailAddresses.find(
        (email) => email.id === user.primaryEmailAddressId
      )

      if (!primaryEmail) {
        throw new Error('No email address found')
      }

      // Verify the code
      await primaryEmail.attemptVerification({ code: verificationCode })

      toast.success('Email verified successfully!', {
        description: 'Your email has been verified.',
        duration: 3000,
      })

      // Reload user to get updated verification status
      await user?.reload()

      // Reset state
      setShowCodeInput(false)
      setVerificationCode('')

      // Trigger callback to refresh data and continue
      if (onVerificationSuccess) {
        onVerificationSuccess()
      }

    } catch (error: any) {
      console.error('Error verifying code:', error)
      
      // Handle specific Clerk errors
      if (error?.errors?.[0]?.code === 'form_code_incorrect') {
        toast.error('Incorrect code', {
          description: 'The code you entered is incorrect. Please try again.',
        })
      } else if (error?.errors?.[0]?.code === 'verification_expired') {
        toast.error('Code expired', {
          description: 'This code has expired. Please request a new one.',
        })
        setShowCodeInput(false)
        setVerificationCode('')
      } else {
        toast.error('Verification failed', {
          description: error?.errors?.[0]?.message || error?.message || 'Please try again.',
        })
      }
    } finally {
      setIsVerifying(false)
    }
  }

  return {
    sendVerificationEmail,
    verifyEmailCode,
    isResending,
    isVerifying,
    cooldownSeconds,
    canResend: cooldownSeconds === 0 && !isResending,
    verificationCode,
    setVerificationCode,
    showCodeInput,
  }
}

// =====================
// Component
// =====================

export function AccountVerifiedStep({ 
  emailVerified, 
  mfaEnabled = false,
  onContinue 
}: AccountVerifiedStepProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(AccountVerifiedSchema),
    defaultValues: {
      emailVerified,
      mfaEnabled,
    },
    mode: 'onChange',
  })

  // Track if we've already navigated to prevent re-triggering and stop auto-saves
  const hasNavigatedRef = React.useRef(false)
  const isNavigatingRef = React.useRef(false)

  const { saveDebounced, saveImmediate, isSaving } = useStepSaver({
    step: 'ACCOUNT_VERIFIED',
    onSuccess: (response) => {
      console.log('[AccountVerifiedStep] Step completed successfully:', response)
      
      // Prevent duplicate navigation
      if (hasNavigatedRef.current) {
        console.log('[AccountVerifiedStep] Already navigated, skipping')
        return
      }
      
      clearPendingChanges()
      
      if (response.nextStep) {
        console.log('[AccountVerifiedStep] Moving to next step:', response.nextStep)
        hasNavigatedRef.current = true
        isNavigatingRef.current = true
        
        // Update the query cache immediately with the new state
        queryClient.setQueryData(['onboarding', 'state'], (old: any) => {
          if (!old) return old
          console.log('[AccountVerifiedStep] Updating query cache with new state:', response.state)
          return {
            ...old,
            state: response.state
          }
        })
        
        const nextUrl = `/onboarding?step=${response.nextStep}`
        console.log('[AccountVerifiedStep] Calling router.push with:', nextUrl)
        
        // Navigate to next step via router
        router.push(nextUrl)
        
        console.log('[AccountVerifiedStep] router.push called, navigation should happen now')
      } else {
        console.log('[AccountVerifiedStep] Onboarding complete, calling onContinue')
        onContinue()
      }
    },
  })

  // Callback to refresh onboarding state after email verification
  const handleVerificationSuccess = React.useCallback(async () => {
    // Invalidate onboarding state query to refetch with updated email verification status
    await queryClient.invalidateQueries({ queryKey: ['onboarding', 'state'] })
  }, [queryClient])

  const { 
    sendVerificationEmail, 
    verifyEmailCode,
    isResending, 
    isVerifying,
    cooldownSeconds, 
    canResend,
    verificationCode,
    setVerificationCode,
    showCodeInput,
  } = useEmailVerification(handleVerificationSuccess)

  // Watch form data (deep equality check happens in useStepSaver)
  const currentData = watch()

  // Simple no-op function for backward compatibility
  const clearPendingChanges = () => {}

  // Update form when emailVerified prop changes (after refetch)
  React.useEffect(() => {
    // Don't update if we've already navigated away
    if (hasNavigatedRef.current || isNavigatingRef.current) {
      return
    }
    setValue('emailVerified', emailVerified, { shouldValidate: true, shouldTouch: false, shouldDirty: false })
  }, [emailVerified, setValue])

  // Auto-save on data change (with deduplication in useStepSaver)
  React.useEffect(() => {
    // Don't auto-save if we're navigating away
    if (isNavigatingRef.current) {
      console.log('[AccountVerifiedStep] Skipping auto-save - navigating away')
      return
    }
    
    // Don't auto-save if already completed
    if (hasNavigatedRef.current) {
      console.log('[AccountVerifiedStep] Skipping auto-save - step already completed')
      return
    }
    
    if (isValid) {
      console.log('[AccountVerifiedStep] Auto-save triggered')
      saveDebounced(currentData)
    }
  }, [currentData, isValid, saveDebounced])

  const onSubmit = (data: FormData) => {
    console.log('[AccountVerifiedStep] Form submitted with data:', data)
    console.log('[AccountVerifiedStep] emailVerified:', emailVerified)
    console.log('[AccountVerifiedStep] isValid:', isValid)
    console.log('[AccountVerifiedStep] isSaving:', isSaving)
    saveImmediate(data)
  }

  // Debug logging
  React.useEffect(() => {
    console.log('[AccountVerifiedStep] Props - emailVerified:', emailVerified, 'mfaEnabled:', mfaEnabled)
  }, [emailVerified, mfaEnabled])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          Verify Your Account
        </h2>
        <p className="text-gray-600 mt-2">
          Secure your account with email verification and optional multi-factor authentication
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Verification Card */}
        <Card className={cn(
          'border-2 transition-colors',
          emailVerified ? 'border-green-200 bg-green-50/50' : 'border-orange-200 bg-orange-50/50'
        )}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Verification
              {emailVerified && <Badge className="bg-green-500">Verified</Badge>}
              {!emailVerified && <Badge variant="secondary">Action Required</Badge>}
            </CardTitle>
            <CardDescription>
              {emailVerified 
                ? 'Your email address has been verified' 
                : 'Please verify your email address to continue'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailVerified ? (
              <div className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle className="w-4 h-4" />
                Email verified successfully
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-2 text-sm text-orange-700 bg-orange-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Email verification required</p>
                    <p className="text-orange-600 mt-1">
                      {showCodeInput 
                        ? 'Check your inbox for a 6-digit verification code. Enter it below to verify your email.'
                        : 'Click the button below to receive a 6-digit verification code via email.'}
                    </p>
                  </div>
                </div>

                {/* Code Input Field */}
                {showCodeInput && (
                  <div className="space-y-2">
                    <Label htmlFor="verification-code" className="text-sm font-medium">
                      Enter 6-digit code
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="verification-code"
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '')
                          setVerificationCode(value)
                        }}
                        className="max-w-[140px] text-center text-lg tracking-widest font-mono"
                        disabled={isVerifying}
                        autoComplete="off"
                      />
                      <Button
                        type="button"
                        onClick={verifyEmailCode}
                        disabled={isVerifying || verificationCode.length !== 6}
                        size="sm"
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Verify
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Send/Resend Button */}
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={sendVerificationEmail}
                  disabled={!canResend}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : cooldownSeconds > 0 ? (
                    `Resend in ${cooldownSeconds}s`
                  ) : showCodeInput ? (
                    'Resend Code'
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Verification Code
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* MFA Toggle Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Multi-Factor Authentication (Optional)
            </CardTitle>
            <CardDescription>
              Add an extra layer of security to your account with MFA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="mfa-toggle" className="text-sm font-medium">
                  Enable MFA
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Require a verification code in addition to your password when signing in
                </p>
              </div>
              <Switch
                id="mfa-toggle"
                checked={currentData.mfaEnabled}
                onCheckedChange={(checked) => setValue('mfaEnabled', checked)}
              />
            </div>
            {currentData.mfaEnabled && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                <p className="font-medium">MFA will be configured in the next step</p>
                <p className="text-blue-600 mt-1">
                  You'll be able to set up authenticator app or SMS verification
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm">Security Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-slate-400" />
                Use a strong, unique password for your BidPerfect account
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-slate-400" />
                Enable MFA for enhanced protection against unauthorized access
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-slate-400" />
                Keep your contact information up to date for account recovery
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            {isSaving && 'Saving...'}
            {!emailVerified && (
              <span className="text-orange-600">Please verify your email to continue</span>
            )}
          </div>
          <Button
            type="submit"
            disabled={!emailVerified || isSaving}
            className="min-w-[120px]"
            onClick={() => console.log('[AccountVerifiedStep] Continue button clicked - emailVerified:', emailVerified, 'isSaving:', isSaving)}
          >
            {isSaving ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  )
}

