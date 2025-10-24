'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  ShieldCheck, 
  Building, 
  Briefcase, 
  FileCheck, 
  Plug, 
  Users, 
  FileText, 
  CheckCircle,
  Check,
  Lock,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { OnboardingStep, OnboardingStepConfig } from '@/lib/onboarding-types'
import { ONBOARDING_STEPS } from '@/lib/onboarding-types'

const STEP_ICONS: Record<string, React.ElementType> = {
  'shield-check': ShieldCheck,
  'building': Building,
  'briefcase': Briefcase,
  'file-check': FileCheck,
  'plug': Plug,
  'users': Users,
  'file-text': FileText,
  'check-circle': CheckCircle,
}

interface OnboardingLayoutProps {
  currentStep: OnboardingStep
  completedSteps: OnboardingStep[]
  progress: number
  canNavigateToStep: (step: OnboardingStep) => boolean
  onNavigateToStep: (step: OnboardingStep) => void
  children: React.ReactNode
  isLoading?: boolean
}

export function OnboardingLayout({
  currentStep,
  completedSteps,
  progress,
  canNavigateToStep,
  onNavigateToStep,
  children,
  isLoading,
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Welcome to BidPerfect</h1>
              <p className="text-sm text-gray-600">Let's get your account set up</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-xs text-gray-500">Onboarding Progress</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{Math.round(progress)}%</span>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Finish later
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Left Rail - Step Navigation */}
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="rounded-xl border bg-white/60 backdrop-blur-sm p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4">Setup Steps</h2>
              <nav className="space-y-2" aria-label="Onboarding steps">
                {ONBOARDING_STEPS.map((step) => {
                  const Icon = STEP_ICONS[step.icon]
                  const isComplete = completedSteps.includes(step.id)
                  const isCurrent = currentStep === step.id
                  const isLocked = !canNavigateToStep(step.id)

                  return (
                    <button
                      key={step.id}
                      onClick={() => !isLocked && onNavigateToStep(step.id)}
                      disabled={isLocked}
                      className={cn(
                        'w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                        isCurrent && 'bg-blue-50 border-2 border-blue-200',
                        !isCurrent && !isLocked && 'hover:bg-gray-50',
                        isLocked && 'opacity-50 cursor-not-allowed'
                      )}
                      aria-label={step.label}
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      <div
                        className={cn(
                          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                          isComplete && 'bg-green-500 text-white',
                          isCurrent && !isComplete && 'bg-blue-500 text-white',
                          !isCurrent && !isComplete && !isLocked && 'bg-gray-100 text-gray-400',
                          isLocked && 'bg-gray-100 text-gray-300'
                        )}
                      >
                        {isComplete ? (
                          <Check className="w-4 h-4" />
                        ) : isLocked ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'text-sm font-medium',
                              isCurrent && 'text-gray-900',
                              !isCurrent && 'text-gray-700'
                            )}
                          >
                            {step.label}
                          </span>
                          {step.blocking && (
                            <Badge variant="secondary" className="text-xs">Required</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {step.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Help Section */}
            <div className="mt-4 rounded-xl border bg-blue-50/50 backdrop-blur-sm p-4 text-sm">
              <h3 className="font-medium text-blue-900 mb-2">Need help?</h3>
              <p className="text-blue-700 text-xs mb-3">
                Our team is here to assist you with setup.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Contact Support
              </Button>
            </div>
          </aside>

          {/* Right Panel - Step Content */}
          <main className="min-h-[600px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

