'use client'

import React from 'react'
import { SignIn } from '@clerk/nextjs'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle2, 
  Shield, 
  Zap,
  Lock,
  ArrowRight,
  Clock
} from 'lucide-react'
import Link from 'next/link'

const QUICK_STATS = [
  { value: "500+", label: "Active Contractors" },
  { value: "10K+", label: "RFPs Processed" },
  { value: "60%", label: "Time Saved" },
]

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white grid place-content-center font-bold text-sm shadow-md">
              BP
            </div>
            <span className="font-bold text-lg text-slate-900">BidPerfect</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600">Don't have an account?</span>
            <Link href="/sign-up">
              <button className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
                Start free trial
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* LEFT PANEL - Welcome Back */}
          <div className="space-y-8 lg:order-1">
            <div className="space-y-4">
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                <Shield className="h-3.5 w-3.5 mr-1.5" />
                Secure Login
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                Welcome back to BidPerfect
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                Sign in to continue managing your government contracting pipeline.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              {QUICK_STATS.map((stat, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
                  <div className="text-xs text-slate-600 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">What you can do today:</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Upload and parse new RFPs in seconds</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Collaborate with your team in real-time</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Track compliance and never miss a deadline</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Generate proposals with AI assistance</span>
                </div>
              </div>
            </div>

            {/* Trust Signal */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Enterprise-grade security</h3>
                  <p className="text-sm text-slate-600">
                    Your data is protected with 256-bit encryption, SOC 2 compliance, and regular security audits.
                  </p>
                </div>
              </div>
            </div>

            {/* Need Help */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-sm text-slate-700">
                <span className="font-medium text-slate-900">Need help signing in?</span>
                {' '}Contact our support team at{' '}
                <a href="mailto:support@bidperfect.ai" className="text-blue-600 hover:text-blue-700 font-medium">
                  support@bidperfect.ai
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Sign In Form - CENTERED */}
          <div className="flex items-center justify-center min-h-[600px] lg:order-2">
            <div className="w-full max-w-md">
              <SignIn
                fallbackRedirectUrl="/onboarding"
                forceRedirectUrl="/onboarding"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none border-0 p-0",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton: "h-11 border-slate-300 hover:bg-slate-50 text-slate-700 font-medium",
                    socialButtonsBlockButtonText: "font-medium text-slate-700",
                    formButtonPrimary: "h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-base font-semibold shadow-md hover:shadow-lg transition-all",
                    formFieldInput: "h-11 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all",
                    formFieldLabel: "text-slate-700 font-medium text-sm",
                    footerActionLink: "text-blue-600 hover:text-blue-700 font-medium hover:underline",
                    identityPreviewText: "text-slate-700",
                    identityPreviewEditButton: "text-blue-600 hover:text-blue-700",
                    formHeaderTitle: "text-slate-900 font-bold",
                    formHeaderSubtitle: "text-slate-600",
                    dividerLine: "bg-slate-200",
                    dividerText: "text-slate-500 text-sm",
                    formFieldInputShowPasswordButton: "text-slate-500 hover:text-slate-700",
                    otpCodeFieldInput: "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                    formResendCodeLink: "text-blue-600 hover:text-blue-700 font-medium",
                    alternativeMethodsBlockButton: "border-slate-300 hover:bg-slate-50 text-slate-700",
                    footer: "hidden",
                  },
                  variables: {
                    colorPrimary: "#2563eb",
                    colorSuccess: "#10b981",
                    colorDanger: "#ef4444",
                    colorWarning: "#f59e0b",
                    colorTextOnPrimaryBackground: "#ffffff",
                    colorBackground: "#ffffff",
                    colorInputBackground: "#ffffff",
                    colorInputText: "#0f172a",
                    borderRadius: "0.5rem",
                    fontFamily: "inherit",
                  }
                }}
              />

              {/* CTA for New Users */}
              <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">New to BidPerfect?</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Start your free 14-day trial today. No credit card required.
                    </p>
                    <Link href="/sign-up">
                      <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all">
                        Start Free Trial
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
