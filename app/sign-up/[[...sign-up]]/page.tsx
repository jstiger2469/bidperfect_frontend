'use client'

import React from 'react'
import { SignUp } from '@clerk/nextjs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle2, 
  Shield, 
  Zap, 
  Users, 
  Lock,
  ArrowRight,
  Sparkles,
  Clock,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'

const VALUE_PROPS = [
  {
    icon: <Zap className="h-5 w-5" />,
    title: "AI-Powered RFP Parsing",
    desc: "Extract requirements in seconds, not hours"
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Automated Compliance",
    desc: "Never miss a requirement or deadline"
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "Real-Time Collaboration",
    desc: "Your entire team, one platform"
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Smart Proposal Builder",
    desc: "Generate compliant proposals faster"
  }
]

const TRUST_BADGES = [
  { label: "SAM Registered", icon: <CheckCircle2 className="h-4 w-4" /> },
  { label: "SOC 2 Compliant", icon: <Shield className="h-4 w-4" /> },
  { label: "256-bit Encryption", icon: <Lock className="h-4 w-4" /> },
]

const CUSTOMER_LOGOS = [
  "Acme Construction",
  "BuildRight Inc",
  "Federal Solutions",
]

export default function SignUpPage() {
  const [businessName, setBusinessName] = React.useState('')
  const [isValidating, setIsValidating] = React.useState(false)

  React.useEffect(() => {
    try { 
      sessionStorage.setItem('signupBusinessName', businessName) 
    } catch {}
  }, [businessName])

  const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusinessName(e.target.value)
    if (e.target.value.length > 2) {
      setIsValidating(true)
      setTimeout(() => setIsValidating(false), 500)
    }
  }

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
            <span className="text-slate-600">Already have an account?</span>
            <Link href="/sign-in">
              <button className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
                Sign in
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* LEFT PANEL - Value Proposition */}
          <div className="space-y-8 lg:sticky lg:top-8">
            {/* Headline */}
            <div className="space-y-4">
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                14-Day Free Trial
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                Start winning more bids in minutes
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                Join 500+ contractors using BidPerfect to streamline their government contracting process.
              </p>
            </div>

            {/* Value Props */}
            <div className="space-y-4">
              {VALUE_PROPS.map((prop, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    {prop.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900">{prop.title}</h3>
                    <p className="text-sm text-slate-600 mt-0.5">{prop.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trial Benefits */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                What's included in your free trial
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span>Full access to all features</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span>Unlimited RFP uploads & parsing</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span>Invite unlimited team members</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <CreditCard className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span className="font-medium">No credit card required</span>
                </li>
              </ul>
            </div>

            {/* Testimonial */}
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-700 italic mb-4">
                "BidPerfect cut our proposal time by 60%. We've won 3 contracts in the first month alone."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                  JD
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">John Davis</div>
                  <div className="text-xs text-slate-600">Director of Capture, Acme Construction</div>
                </div>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {TRUST_BADGES.map((badge, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-sm text-slate-700">
                    {badge.icon}
                    <span className="font-medium">{badge.label}</span>
                  </div>
                ))}
              </div>
              <div className="text-xs text-slate-500">
                Trusted by contractors across all 50 states
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Sign Up Form - CENTERED */}
          <div className="flex items-center justify-center min-h-[600px]">
            <div className="w-full max-w-md">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xl p-8 space-y-6">
                {/* Progress Indicator */}
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-900">Step 1 of 2</span>
                  <span className="text-slate-600">Create your account</span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full transition-all duration-500" style={{ width: '50%' }} />
                </div>

                {/* Business Name Input */}
                <div className="space-y-3 pb-6 border-b border-slate-200">
                  <div>
                    <Label htmlFor="businessName" className="text-base font-semibold text-slate-900">
                      What's your company name?
                    </Label>
                    <p className="text-sm text-slate-600 mt-1">
                      We'll create your organization with this name after signup
                    </p>
                  </div>
                  <div className="relative">
                    <Input
                      id="businessName"
                      placeholder="e.g., Acme Construction LLC"
                      value={businessName}
                      onChange={handleBusinessNameChange}
                      className="h-12 text-base"
                    />
                    {businessName.length > 2 && !isValidating && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                  </div>
                  {businessName.length > 0 && businessName.length < 3 && (
                    <p className="text-sm text-amber-600 flex items-center gap-1.5">
                      <span className="text-xs">⚠️</span>
                      Company name must be at least 3 characters
                    </p>
                  )}
                </div>

                {/* Clerk Sign Up Component */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 mb-1">
                      Create your account
                    </h3>
                    <p className="text-sm text-slate-600">
                      Enter your details below to get started
                    </p>
                  </div>
                  
                  <SignUp
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
                </div>

                {/* Security Note */}
                <div className="pt-6 border-t border-slate-200">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50">
                    <Lock className="h-5 w-5 text-slate-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-600">
                      <span className="font-medium text-slate-900">Your data is secure.</span> We use 256-bit encryption and never share your information with third parties.
                    </div>
                  </div>
                </div>

                {/* Legal */}
                <div className="text-xs text-center text-slate-500">
                  By signing up, you agree to our{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 underline">Privacy Policy</a>
                </div>
              </div>

              {/* What's Next */}
              <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <ArrowRight className="h-5 w-5 text-blue-600" />
                  What happens next?
                </h3>
                <ol className="space-y-3">
                  <li className="flex items-start gap-3 text-sm">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                      1
                    </div>
                    <div>
                      <span className="font-medium text-slate-900">Verify your email</span>
                      <p className="text-slate-600 mt-0.5">Quick email confirmation (takes 30 seconds)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                      2
                    </div>
                    <div>
                      <span className="font-medium text-slate-900">Complete your profile</span>
                      <p className="text-slate-600 mt-0.5">Add company details and compliance documents</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                      3
                    </div>
                    <div>
                      <span className="font-medium text-slate-900">Start winning bids</span>
                      <p className="text-slate-600 mt-0.5">Upload your first RFP and see the magic happen</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
